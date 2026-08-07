import {
  createClient,
} from 'npm:@supabase/supabase-js@^2'

import {
  corsHeaders,
} from 'npm:@supabase/supabase-js@^2/cors'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(
      'ok',
      {
        headers: corsHeaders,
      },
    )
  }

  try {
    const authHeader =
      req.headers.get(
        'Authorization',
      )

    if (!authHeader) {
      return jsonResponse(
        {
          error:
            'Missing authorization header.',
        },
        401,
      )
    }

    const supabaseUrl =
      Deno.env.get(
        'SUPABASE_URL',
      )

    const publishableKey =
      Deno.env.get(
        'SUPABASE_ANON_KEY',
      )

    const serviceRoleKey =
      Deno.env.get(
        'SUPABASE_SERVICE_ROLE_KEY',
      )

    if (
      !supabaseUrl ||
      !publishableKey ||
      !serviceRoleKey
    ) {
      throw new Error(
        'Missing Supabase environment variables.',
      )
    }

    const userClient =
      createClient(
        supabaseUrl,
        publishableKey,
        {
          global: {
            headers: {
              Authorization:
                authHeader,
            },
          },

          auth: {
            persistSession:
              false,
            autoRefreshToken:
              false,
          },
        },
      )

    const adminClient =
      createClient(
        supabaseUrl,
        serviceRoleKey,
        {
          auth: {
            persistSession:
              false,
            autoRefreshToken:
              false,
          },
        },
      )

    const token =
      authHeader.replace(
        /^Bearer\s+/i,
        '',
      )

    const {
      data: userData,
      error: userError,
    } =
      await userClient.auth.getUser(
        token,
      )

    if (
      userError ||
      !userData.user
    ) {
      return jsonResponse(
        {
          error:
            'Invalid or expired user session.',
        },
        401,
      )
    }

    const caller =
      userData.user

    const body =
      await req.json()

    const workspaceId =
      String(
        body.workspaceId || '',
      ).trim()

    const email =
      String(
        body.email || '',
      )
        .trim()
        .toLowerCase()

    const name =
      String(
        body.name || '',
      ).trim()

    const role =
      normalizeRole(
        body.role,
      )

    const department =
      String(
        body.department || '',
      ).trim()

    const redirectTo =
      String(
        body.redirectTo || '',
      ).trim() || undefined

    if (!workspaceId) {
      return jsonResponse(
        {
          error:
            'Workspace ID is required.',
        },
        400,
      )
    }

    if (!email) {
      return jsonResponse(
        {
          error:
            'Email address is required.',
        },
        400,
      )
    }

    /*
     * Check that the caller belongs
     * to this workspace and can invite.
     */
    const {
      data: membership,
      error: membershipError,
    } = await userClient
      .from(
        'workspace_members',
      )
      .select(
        `
          id,
          role,
          status
        `,
      )
      .eq(
        'workspace_id',
        workspaceId,
      )
      .eq(
        'user_id',
        caller.id,
      )
      .eq(
        'status',
        'active',
      )
      .maybeSingle()

    if (membershipError) {
      throw membershipError
    }

    if (!membership) {
      return jsonResponse(
        {
          error:
            'You do not have access to this workspace.',
        },
        403,
      )
    }

    if (
      ![
        'owner',
        'administrator',
      ].includes(
        membership.role,
      )
    ) {
      return jsonResponse(
        {
          error:
            'Only workspace owners and administrators can invite members.',
        },
        403,
      )
    }

    /*
     * Prevent a duplicate pending
     * invitation for the same email.
     */
    const {
      data: existingInvite,
      error: existingInviteError,
    } = await adminClient
      .from(
        'workspace_members',
      )
      .select(
        `
          id,
          user_id,
          invited_email,
          status
        `,
      )
      .eq(
        'workspace_id',
        workspaceId,
      )
      .eq(
        'invited_email',
        email,
      )
      .maybeSingle()

    if (
      existingInviteError
    ) {
      throw existingInviteError
    }

    if (
      existingInvite &&
      [
        'active',
        'invited',
      ].includes(
        existingInvite.status,
      )
    ) {
      return jsonResponse(
        {
          error:
            'This email is already a member or has a pending invitation.',
        },
        409,
      )
    }

    /*
     * Send the real Supabase Auth
     * invitation email.
     */
    const {
      data: inviteData,
      error: inviteError,
    } =
      await adminClient.auth.admin
        .inviteUserByEmail(
          email,
          {
            data: {
              full_name:
                name || null,

              invited_workspace_id:
                workspaceId,

              invited_role:
                role,

              invited_department:
                department || null,
            },

            redirectTo,
          },
        )

    if (inviteError) {
      throw inviteError
    }

    /*
     * Create the pending workspace
     * membership record.
     */
    const {
      data: member,
      error: memberError,
    } = await adminClient
      .from(
        'workspace_members',
      )
      .insert({
        workspace_id:
          workspaceId,

        user_id: null,

        invited_email:
          email,

        invited_name:
          name || null,

        role,

        status: 'invited',

        department:
          department || null,

        joined_at: null,
      })
      .select(
        `
          id,
          workspace_id,
          user_id,
          invited_email,
          invited_name,
          role,
          status,
          department,
          joined_at,
          created_at,
          updated_at
        `,
      )
      .single()

    if (memberError) {
      throw memberError
    }

    /*
     * Write activity history.
     */
    const {
      error: activityError,
    } = await adminClient
      .from(
        'activity_logs',
      )
      .insert({
        workspace_id:
          workspaceId,

        actor_id:
          caller.id,

        action:
          'invited',

        target_type:
          'Team Member',

        target_id:
          member.id,

        target_name:
          name || email,

        metadata: {
          invited_email:
            email,

          invited_role:
            role,

          auth_user_id:
            inviteData.user?.id ||
            null,
        },
      })

    if (activityError) {
      console.error(
        'Unable to write invitation activity:',
        activityError,
      )
    }

    return jsonResponse({
      success: true,

      member,

      invitedUserId:
        inviteData.user?.id ||
        null,
    })
  } catch (error) {
    console.error(
      'Invite workspace member error:',
      error,
    )

    return jsonResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to invite workspace member.',
      },
      500,
    )
  }
})

function normalizeRole(
  value: unknown,
) {
  const normalized =
    String(
      value || 'viewer',
    )
      .trim()
      .toLowerCase()

  const map: Record<
    string,
    string
  > = {
    admin:
      'administrator',

    administrator:
      'administrator',

    owner:
      'owner',

    developer:
      'developer',

    analyst:
      'analyst',

    viewer:
      'viewer',
  }

  return (
    map[normalized] ||
    'viewer'
  )
}

function jsonResponse(
  data: unknown,
  status = 200,
) {
  return new Response(
    JSON.stringify(data),
    {
      status,

      headers: {
        ...corsHeaders,

        'Content-Type':
          'application/json',
      },
    },
  )
}
import { supabase } from '../lib/supabase'
import {
  FunctionsHttpError,
} from '@supabase/supabase-js'

const memberSelect = `
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
  updated_at,
  profiles (
    id,
    full_name,
    avatar_url
  )
`

export async function getTeamMembers(
  workspaceId,
) {
  if (!workspaceId) {
    return []
  }

  const { data, error } = await supabase
    .from('workspace_members')
    .select(memberSelect)
    .eq('workspace_id', workspaceId)
    .order('created_at', {
      ascending: true,
    })

  if (error) {
    throw error
  }

  return data || []
}

export async function inviteTeamMember({
  workspaceId,
  userId,
  member,
}) {
  const email = String(
    member.email || '',
  )
    .trim()
    .toLowerCase()

  if (!email) {
    throw new Error(
      'Email address is required.',
    )
  }

  const {
    data,
    error,
  } = await supabase.functions.invoke(
    'invite-workspace-member',
    {
      body: {
        workspaceId,
        email,

        name: String(
          member.name || '',
        ).trim(),

        role: normalizeRole(
          member.role,
        ),

        department:
          member.department ||
          null,

        redirectTo:
          `${window.location.origin}/?invite=1`,
      },
    },
  )

  if (error) {
    console.error(
      'Invite function error:',
      error,
    )

    if (
      error instanceof
      FunctionsHttpError
    ) {
      try {
        const body =
          await error.context.json()

        console.error(
          'Invite function response:',
          body,
        )

        throw new Error(
          body?.error ||
            body?.message ||
            'Unable to send invitation.',
        )
      } catch (
        responseError
      ) {
        if (
          responseError instanceof Error &&
          responseError.message !==
            'Unable to send invitation.'
        ) {
          throw responseError
        }
      }
    }

    throw new Error(
      error.message ||
        'Unable to send invitation.',
    )
  }

  if (data?.error) {
    throw new Error(
      data.error,
    )
  }

  if (!data?.member) {
    throw new Error(
      'Invitation was sent, but no workspace member was returned.',
    )
  }

  return data.member
}

export async function updateTeamMember({
  workspaceId,
  userId,
  memberId,
  member,
}) {
  const payload = {
    role: normalizeRole(
      member.role,
    ),
    department:
      member.department || null,
  }

  if (
    !member.user_id &&
    member.email
  ) {
    payload.invited_email =
      member.email
        .trim()
        .toLowerCase()
  }

  if (!member.user_id) {
    payload.invited_name =
      member.name?.trim() || null
  }

  const { data, error } = await supabase
    .from('workspace_members')
    .update(payload)
    .eq('id', memberId)
    .eq(
      'workspace_id',
      workspaceId,
    )
    .select(memberSelect)
    .single()

  if (error) {
    throw error
  }

  // Existing authenticated member:
  // update their profile name as well.
  if (
    member.user_id &&
    member.name?.trim()
  ) {
    const {
      error: profileError,
    } = await supabase
      .from('profiles')
      .update({
        full_name:
          member.name.trim(),
      })
      .eq(
        'id',
        member.user_id,
      )

    if (profileError) {
      throw profileError
    }

    // Keep the returned record in sync
    // with the new profile value.
    data.profiles = {
      ...(data.profiles || {}),
      id: member.user_id,
      full_name:
        member.name.trim(),
    }
  }

  await createActivityLog({
    workspaceId,
    userId,
    action: 'updated',
    member: data,
  })

  return data
}

export async function setTeamMemberStatus({
  workspaceId,
  userId,
  member,
  status,
}) {
  if (member.role === 'owner') {
    throw new Error(
      'The workspace owner cannot be suspended.',
    )
  }

  const normalizedStatus =
    normalizeStatus(status)

  const { data, error } = await supabase
    .from('workspace_members')
    .update({
      status: normalizedStatus,

      joined_at:
        normalizedStatus === 'active' &&
          !member.joined_at
          ? new Date().toISOString()
          : member.joined_at,
    })
    .eq('id', member.id)
    .eq(
      'workspace_id',
      workspaceId,
    )
    .select(memberSelect)
    .single()

  if (error) {
    throw error
  }

  await createActivityLog({
    workspaceId,
    userId,
    action: normalizedStatus,
    member: data,
  })

  return data
}

export async function deleteTeamMember({
  workspaceId,
  userId,
  member,
}) {
  if (member.role === 'owner') {
    throw new Error(
      'The workspace owner cannot be removed.',
    )
  }

  const { error } = await supabase
    .from('workspace_members')
    .delete()
    .eq('id', member.id)
    .eq(
      'workspace_id',
      workspaceId,
    )

  if (error) {
    throw error
  }

  await createActivityLog({
    workspaceId,
    userId,
    action: 'removed',
    member,
  })
}

async function createActivityLog({
  workspaceId,
  userId,
  action,
  member,
}) {
  const targetName =
    member.profiles?.full_name ||
    member.invited_email ||
    'Team member'

  const { error } = await supabase
    .from('activity_logs')
    .insert({
      workspace_id: workspaceId,
      actor_id: userId,
      action,
      target_type: 'Team Member',
      target_id: member.id,
      target_name: targetName,
    })

  if (error) {
    console.error(
      'Unable to create team activity log:',
      error,
    )
  }
}

function normalizeRole(value) {
  const normalized = String(
    value || 'viewer',
  )
    .trim()
    .toLowerCase()

  const map = {
    admin: 'administrator',
    administrator: 'administrator',
    owner: 'owner',
    developer: 'developer',
    analyst: 'analyst',
    viewer: 'viewer',
  }

  return map[normalized] || 'viewer'
}

function normalizeStatus(value) {
  const normalized = String(
    value || 'active',
  )
    .trim()
    .toLowerCase()

  if (
    [
      'active',
      'invited',
      'suspended',
    ].includes(normalized)
  ) {
    return normalized
  }

  return 'active'
}
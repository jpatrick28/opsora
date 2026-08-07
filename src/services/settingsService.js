import { supabase } from '../lib/supabase'

const workspaceSelect = `
  id,
  name,
  slug,
  timezone,
  date_format,
  week_starts_on,
  created_by,
  created_at,
  updated_at
`

const settingsSelect = `
  workspace_id,
  default_owner_id,
  default_automation_status,
  default_retry_limit,
  default_execution_timeout,
  email_notifications,
  slack_notifications,
  browser_notifications,
  weekly_summary,
  critical_alerts_only,
  alert_email,
  slack_channel,
  webhook_url,
  compact_tables,
  reduce_motion,
  updated_at
`

export async function getWorkspaceSettings(
  workspaceId,
) {
  if (!workspaceId) {
    return null
  }

  const [
    workspaceResult,
    settingsResult,
  ] = await Promise.all([
    supabase
      .from('workspaces')
      .select(workspaceSelect)
      .eq('id', workspaceId)
      .single(),

    supabase
      .from('workspace_settings')
      .select(settingsSelect)
      .eq(
        'workspace_id',
        workspaceId,
      )
      .maybeSingle(),
  ])

  if (workspaceResult.error) {
    throw workspaceResult.error
  }

  if (settingsResult.error) {
    throw settingsResult.error
  }

  return {
    workspace:
      workspaceResult.data,

    settings:
      settingsResult.data,
  }
}

export async function saveWorkspaceSettings({
  workspaceId,
  userId,
  values,
}) {
  const normalizedSlug =
    normalizeSlug(
      values.workspaceSlug,
    )

  if (!values.workspaceName?.trim()) {
    throw new Error(
      'Workspace name is required.',
    )
  }

  if (!normalizedSlug) {
    throw new Error(
      'Workspace slug is required.',
    )
  }

  const {
    data: workspace,
    error: workspaceError,
  } = await supabase
    .from('workspaces')
    .update({
      name:
        values.workspaceName.trim(),

      slug: normalizedSlug,

      timezone:
        values.timezone,

      date_format:
        values.dateFormat,

      week_starts_on:
        values.weekStartsOn,
    })
    .eq('id', workspaceId)
    .select(workspaceSelect)
    .single()

  if (workspaceError) {
    throw workspaceError
  }

  const {
    data: settings,
    error: settingsError,
  } = await supabase
    .from('workspace_settings')
    .upsert(
      {
        workspace_id:
          workspaceId,

        default_automation_status:
          String(
            values.defaultAutomationStatus ||
              'draft',
          ).toLowerCase(),

        default_retry_limit:
          Number(
            values.defaultRetryLimit ||
              0,
          ),

        default_execution_timeout:
          Number(
            values.defaultExecutionTimeout ||
              30,
          ),

        email_notifications:
          Boolean(
            values.emailNotifications,
          ),

        slack_notifications:
          Boolean(
            values.slackNotifications,
          ),

        browser_notifications:
          Boolean(
            values.browserNotifications,
          ),

        weekly_summary:
          Boolean(
            values.weeklySummary,
          ),

        critical_alerts_only:
          Boolean(
            values.criticalAlertsOnly,
          ),

        alert_email:
          values.alertEmail
            ?.trim()
            .toLowerCase() ||
          null,

        slack_channel:
          values.slackChannel
            ?.trim() ||
          null,

        webhook_url:
          values.webhookUrl
            ?.trim() ||
          null,

        compact_tables:
          Boolean(
            values.compactTables,
          ),

        reduce_motion:
          Boolean(
            values.reduceMotion,
          ),
      },
      {
        onConflict:
          'workspace_id',
      },
    )
    .select(settingsSelect)
    .single()

  if (settingsError) {
    throw settingsError
  }

  await supabase
    .from('activity_logs')
    .insert({
      workspace_id:
        workspaceId,

      actor_id:
        userId,

      action:
        'updated',

      target_type:
        'Workspace Settings',

      target_id:
        workspaceId,

      target_name:
        workspace.name,
    })

  return {
    workspace,
    settings,
  }
}

export async function resetWorkspaceSettings({
  workspaceId,
  userId,
}) {
  const defaults = {
    default_automation_status:
      'draft',

    default_retry_limit: 3,

    default_execution_timeout:
      30,

    email_notifications:
      true,

    slack_notifications:
      true,

    browser_notifications:
      false,

    weekly_summary:
      true,

    critical_alerts_only:
      false,

    alert_email: null,

    slack_channel: null,

    webhook_url: null,

    compact_tables:
      false,

    reduce_motion:
      false,
  }

  const {
    data,
    error,
  } = await supabase
    .from('workspace_settings')
    .upsert(
      {
        workspace_id:
          workspaceId,

        ...defaults,
      },
      {
        onConflict:
          'workspace_id',
      },
    )
    .select(settingsSelect)
    .single()

  if (error) {
    throw error
  }

  await supabase
    .from('activity_logs')
    .insert({
      workspace_id:
        workspaceId,

      actor_id:
        userId,

      action:
        'reset',

      target_type:
        'Workspace Settings',

      target_id:
        workspaceId,

      target_name:
        'Workspace settings',
    })

  return data
}

function normalizeSlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(
      /[^a-z0-9-]/g,
      '-',
    )
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}
import { supabase } from '../lib/supabase'

const ruleSelect = `
  id,
  workspace_id,
  name,
  description,
  trigger_condition,
  severity,
  channel,
  recipient,
  status,
  trigger_count,
  last_triggered_at,
  created_by,
  created_at,
  updated_at
`

const alertSelect = `
  id,
  workspace_id,
  rule_id,
  title,
  message,
  severity,
  channel,
  source_type,
  source_id,
  status,
  acknowledged_by,
  acknowledged_at,
  resolved_at,
  created_at
`

export async function getAlertsData(
  workspaceId,
) {
  if (!workspaceId) {
    return {
      rules: [],
      history: [],
    }
  }

  const [
    rulesResult,
    historyResult,
  ] = await Promise.all([
    supabase
      .from('alert_rules')
      .select(ruleSelect)
      .eq(
        'workspace_id',
        workspaceId,
      )
      .order('created_at', {
        ascending: false,
      }),

    supabase
      .from('alert_history')
      .select(alertSelect)
      .eq(
        'workspace_id',
        workspaceId,
      )
      .order('created_at', {
        ascending: false,
      }),
  ])

  if (rulesResult.error) {
    throw rulesResult.error
  }

  if (historyResult.error) {
    throw historyResult.error
  }

  return {
    rules: rulesResult.data || [],
    history:
      historyResult.data || [],
  }
}

export async function createAlertRule({
  workspaceId,
  userId,
  rule,
}) {
  const payload = {
    workspace_id: workspaceId,
    name: rule.name,
    description:
      rule.description || null,
    trigger_condition:
      rule.trigger,
    severity:
      normalizeSeverity(
        rule.severity,
      ),
    channel: rule.channel,
    recipient: rule.recipient,
    status:
      normalizeRuleStatus(
        rule.status,
      ),
    trigger_count: 0,
    last_triggered_at: null,
    created_by: userId,
  }

  const {
    data,
    error,
  } = await supabase
    .from('alert_rules')
    .insert(payload)
    .select(ruleSelect)
    .single()

  if (error) {
    throw error
  }

  await createActivityLog({
    workspaceId,
    userId,
    action: 'created',
    targetType: 'Alert Rule',
    targetId: data.id,
    targetName: data.name,
  })

  return data
}

export async function updateAlertRule({
  workspaceId,
  userId,
  ruleId,
  rule,
}) {
  const {
    data,
    error,
  } = await supabase
    .from('alert_rules')
    .update({
      name: rule.name,
      description:
        rule.description || null,
      trigger_condition:
        rule.trigger,
      severity:
        normalizeSeverity(
          rule.severity,
        ),
      channel: rule.channel,
      recipient: rule.recipient,
      status:
        normalizeRuleStatus(
          rule.status,
        ),
    })
    .eq('id', ruleId)
    .eq(
      'workspace_id',
      workspaceId,
    )
    .select(ruleSelect)
    .single()

  if (error) {
    throw error
  }

  await createActivityLog({
    workspaceId,
    userId,
    action: 'updated',
    targetType: 'Alert Rule',
    targetId: data.id,
    targetName: data.name,
  })

  return data
}

export async function toggleAlertRule({
  workspaceId,
  userId,
  rule,
}) {
  const nextStatus =
    rule.status === 'enabled'
      ? 'disabled'
      : 'enabled'

  const {
    data,
    error,
  } = await supabase
    .from('alert_rules')
    .update({
      status: nextStatus,
    })
    .eq('id', rule.id)
    .eq(
      'workspace_id',
      workspaceId,
    )
    .select(ruleSelect)
    .single()

  if (error) {
    throw error
  }

  await createActivityLog({
    workspaceId,
    userId,
    action:
      nextStatus === 'enabled'
        ? 'enabled'
        : 'disabled',
    targetType: 'Alert Rule',
    targetId: data.id,
    targetName: data.name,
  })

  return data
}

export async function deleteAlertRule({
  workspaceId,
  userId,
  rule,
}) {
  const { error } = await supabase
    .from('alert_rules')
    .delete()
    .eq('id', rule.id)
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
    action: 'deleted',
    targetType: 'Alert Rule',
    targetId: rule.id,
    targetName: rule.name,
  })
}

export async function updateAlertStatus({
  workspaceId,
  userId,
  alert,
  status,
}) {
  const normalizedStatus =
    normalizeAlertStatus(status)

  const now =
    new Date().toISOString()

  const payload = {
    status: normalizedStatus,
  }

  if (
    normalizedStatus ===
    'acknowledged'
  ) {
    payload.acknowledged_by =
      userId
    payload.acknowledged_at =
      now
    payload.resolved_at = null
  }

  if (
    normalizedStatus ===
    'resolved'
  ) {
    payload.acknowledged_by =
      userId
    payload.acknowledged_at =
      alert.acknowledged_at ||
      now
    payload.resolved_at = now
  }

  if (
    normalizedStatus === 'open'
  ) {
    payload.acknowledged_by =
      null
    payload.acknowledged_at =
      null
    payload.resolved_at = null
  }

  const {
    data,
    error,
  } = await supabase
    .from('alert_history')
    .update(payload)
    .eq('id', alert.id)
    .eq(
      'workspace_id',
      workspaceId,
    )
    .select(alertSelect)
    .single()

  if (error) {
    throw error
  }

  await createActivityLog({
    workspaceId,
    userId,
    action: normalizedStatus,
    targetType: 'Alert',
    targetId: data.id,
    targetName: data.title,
  })

  return data
}

export async function deleteAlertHistory({
  workspaceId,
  userId,
  alert,
}) {
  const { error } = await supabase
    .from('alert_history')
    .delete()
    .eq('id', alert.id)
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
    action: 'deleted',
    targetType: 'Alert',
    targetId: alert.id,
    targetName: alert.title,
  })
}

async function createActivityLog({
  workspaceId,
  userId,
  action,
  targetType,
  targetId,
  targetName,
}) {
  const { error } = await supabase
    .from('activity_logs')
    .insert({
      workspace_id: workspaceId,
      actor_id: userId,
      action,
      target_type: targetType,
      target_id: targetId,
      target_name: targetName,
    })

  if (error) {
    console.error(
      'Unable to create alert activity log:',
      error,
    )
  }
}

function normalizeSeverity(
  value,
) {
  return String(
    value || 'medium',
  ).toLowerCase()
}

function normalizeRuleStatus(
  value,
) {
  return String(
    value || 'enabled',
  ).toLowerCase()
}

function normalizeAlertStatus(
  value,
) {
  return String(
    value || 'open',
  ).toLowerCase()
}
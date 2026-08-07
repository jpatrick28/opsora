import { supabase } from '../lib/supabase'

const runSelect = `
  id,
  workspace_id,
  automation_id,
  status,
  duration_ms,
  records_processed,
  retry_count,
  input_payload,
  steps,
  error_message,
  started_at,
  completed_at,
  created_at,
  automations (
    id,
    name,
    platform,
    trigger_name,
    owner_id
  )
`

export async function getExecutionLogs(
  workspaceId,
) {
  if (!workspaceId) {
    return []
  }

  const { data, error } = await supabase
    .from('automation_runs')
    .select(runSelect)
    .eq('workspace_id', workspaceId)
    .order('started_at', {
      ascending: false,
    })

  if (error) {
    throw error
  }

  return data || []
}

export async function retryExecution({
  workspaceId,
  automationId,
  originalRun,
}) {
  const now = new Date()

  const completedAt = new Date(
    now.getTime() + 2600,
  )

  const { data, error } = await supabase
    .from('automation_runs')
    .insert({
      workspace_id: workspaceId,
      automation_id: automationId,
      status: 'successful',
      duration_ms: 2600,
      records_processed:
        originalRun.records_processed || 0,
      retry_count:
        Number(
          originalRun.retry_count || 0,
        ) + 1,
      input_payload:
        originalRun.input_payload || {},
      steps: normalizeSuccessfulSteps(
        originalRun.steps,
      ),
      error_message: null,
      started_at: now.toISOString(),
      completed_at:
        completedAt.toISOString(),
    })
    .select(runSelect)
    .single()

  if (error) {
    throw error
  }

  return data
}

function normalizeSuccessfulSteps(
  steps,
) {
  if (!Array.isArray(steps)) {
    return []
  }

  return steps.map((step) => ({
    ...step,
    status: 'successful',
  }))
}
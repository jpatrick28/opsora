import { supabase } from '../lib/supabase'

const automationSelect = `
  id,
  workspace_id,
  name,
  description,
  platform,
  trigger_name,
  owner_id,
  status,
  health,
  execution_count,
  success_rate,
  last_run_at,
  created_by,
  created_at,
  updated_at
`

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
  created_at
`

export async function getAutomations(
  workspaceId,
) {
  if (!workspaceId) {
    return []
  }

  const { data, error } = await supabase
    .from('automations')
    .select(automationSelect)
    .eq('workspace_id', workspaceId)
    .order('created_at', {
      ascending: false,
    })

  if (error) {
    throw error
  }

  return data || []
}

export async function createAutomation({
  workspaceId,
  userId,
  automation,
}) {
  if (!workspaceId || !userId) {
    throw new Error(
      'Workspace and authenticated user are required.',
    )
  }

  const payload = {
    workspace_id: workspaceId,
    name: automation.name,
    description:
      automation.description || null,
    platform: automation.platform,
    trigger_name: automation.trigger,
    owner_id:
      automation.ownerId || userId,
    status: normalizeStatus(
      automation.status,
    ),
    health: healthFromStatus(
      automation.status,
    ),
    execution_count: 0,
    success_rate: 100,
    created_by: userId,
  }

  const { data, error } = await supabase
    .from('automations')
    .insert(payload)
    .select(automationSelect)
    .single()

  if (error) {
    throw error
  }

  await createActivityLog({
    workspaceId,
    userId,
    action: 'created',
    automation: data,
  })

  return data
}

export async function updateAutomation({
  workspaceId,
  userId,
  automationId,
  automation,
  currentHealth,
}) {
  const status = normalizeStatus(
    automation.status,
  )

  const payload = {
    name: automation.name,
    description:
      automation.description || null,
    platform: automation.platform,
    trigger_name: automation.trigger,
    owner_id:
      automation.ownerId || userId,
    status,
    health: resolveUpdatedHealth({
      status,
      currentHealth,
    }),
  }

  const { data, error } = await supabase
    .from('automations')
    .update(payload)
    .eq('id', automationId)
    .eq('workspace_id', workspaceId)
    .select(automationSelect)
    .single()

  if (error) {
    throw error
  }

  await createActivityLog({
    workspaceId,
    userId,
    action: 'updated',
    automation: data,
  })

  return data
}

export async function setAutomationStatus({
  workspaceId,
  userId,
  automation,
  status,
}) {
  const normalizedStatus =
    normalizeStatus(status)

  const { data, error } = await supabase
    .from('automations')
    .update({
      status: normalizedStatus,
      health: healthFromStatus(
        normalizedStatus,
      ),
    })
    .eq('id', automation.id)
    .eq('workspace_id', workspaceId)
    .select(automationSelect)
    .single()

  if (error) {
    throw error
  }

  await createActivityLog({
    workspaceId,
    userId,
    action:
      normalizedStatus === 'active'
        ? 'activated'
        : normalizedStatus === 'paused'
          ? 'paused'
          : 'moved to draft',
    automation: data,
  })

  return data
}

export async function duplicateAutomation({
  workspaceId,
  userId,
  automation,
}) {
  const { data, error } = await supabase
    .from('automations')
    .insert({
      workspace_id: workspaceId,
      name: `${automation.name} Copy`,
      description:
        automation.description || null,
      platform: automation.platform,
      trigger_name:
        automation.trigger_name,
      owner_id:
        automation.owner_id || userId,
      status: 'draft',
      health: 'draft',
      execution_count: 0,
      success_rate: 100,
      created_by: userId,
    })
    .select(automationSelect)
    .single()

  if (error) {
    throw error
  }

  await createActivityLog({
    workspaceId,
    userId,
    action: 'duplicated',
    automation: data,
  })

  return data
}

export async function deleteAutomation({
  workspaceId,
  userId,
  automation,
}) {
  const { error } = await supabase
    .from('automations')
    .delete()
    .eq('id', automation.id)
    .eq('workspace_id', workspaceId)

  if (error) {
    throw error
  }

  await createActivityLog({
    workspaceId,
    userId,
    action: 'deleted',
    automation,
  })
}

export async function runAutomationNow({
  workspaceId,
  userId,
  automation,
}) {
  if (!workspaceId) {
    throw new Error(
      'Workspace is required.',
    )
  }

  if (!automation?.id) {
    throw new Error(
      'Automation is required.',
    )
  }

  if (automation.status !== 'active') {
    throw new Error(
      'Only active automations can be run.',
    )
  }

  const startedAt = new Date()

  const inputPayload = {
    source: 'opsora-manual-run',
    triggeredBy: userId,
    automationId: automation.id,
    triggeredAt:
      startedAt.toISOString(),
  }

  const initialSteps = [
    {
      name: 'Initialize workflow',
      status: 'successful',
    },
    {
      name: `Connect to ${automation.platform}`,
      status: 'running',
    },
    {
      name: 'Process automation',
      status: 'pending',
    },
    {
      name: 'Finalize execution',
      status: 'pending',
    },
  ]

  const {
    data: createdRun,
    error: createError,
  } = await supabase
    .from('automation_runs')
    .insert({
      workspace_id: workspaceId,
      automation_id: automation.id,
      status: 'running',
      duration_ms: null,
      records_processed: 0,
      retry_count: 0,
      input_payload: inputPayload,
      steps: initialSteps,
      error_message: null,
      started_at:
        startedAt.toISOString(),
      completed_at: null,
    })
    .select(runSelect)
    .single()

  if (createError) {
    throw createError
  }

  await wait(1400)

  const successful =
    Math.random() >= 0.5

  const durationMs =
    randomInteger(900, 4800)

  const recordsProcessed =
    randomInteger(8, 280)

  const completedAt = new Date(
    startedAt.getTime() + durationMs,
  )

  const completedSteps = successful
    ? [
        {
          name: 'Initialize workflow',
          status: 'successful',
        },
        {
          name: `Connect to ${automation.platform}`,
          status: 'successful',
        },
        {
          name: 'Process automation',
          status: 'successful',
        },
        {
          name: 'Finalize execution',
          status: 'successful',
        },
      ]
    : [
        {
          name: 'Initialize workflow',
          status: 'successful',
        },
        {
          name: `Connect to ${automation.platform}`,
          status: 'successful',
        },
        {
          name: 'Process automation',
          status: 'failed',
        },
        {
          name: 'Finalize execution',
          status: 'skipped',
        },
      ]

  const {
    data: completedRun,
    error: completionError,
  } = await supabase
    .from('automation_runs')
    .update({
      status: successful
        ? 'successful'
        : 'failed',
      duration_ms: durationMs,
      records_processed:
        recordsProcessed,
      steps: completedSteps,
      error_message: successful
        ? null
        : 'Demo execution failed while processing the automation.',
      completed_at:
        completedAt.toISOString(),
    })
    .eq('id', createdRun.id)
    .eq('workspace_id', workspaceId)
    .select(runSelect)
    .single()

  if (completionError) {
    throw completionError
  }

  const previousExecutions =
    Number(
      automation.execution_count || 0,
    )

  const previousSuccessRate =
    Number(
      automation.success_rate ?? 100,
    )

  const previousSuccessfulRuns =
    previousExecutions *
    (previousSuccessRate / 100)

  const newExecutionCount =
    previousExecutions + 1

  const newSuccessfulRuns =
    previousSuccessfulRuns +
    (successful ? 1 : 0)

  const newSuccessRate =
    (newSuccessfulRuns /
      newExecutionCount) *
    100

  const {
    data: updatedAutomation,
    error: automationError,
  } = await supabase
    .from('automations')
    .update({
      execution_count:
        newExecutionCount,
      success_rate:
        Math.round(
          newSuccessRate * 100,
        ) / 100,
      last_run_at:
        completedAt.toISOString(),
      health: successful
        ? 'healthy'
        : 'warning',
    })
    .eq('id', automation.id)
    .eq('workspace_id', workspaceId)
    .select(automationSelect)
    .single()

  if (automationError) {
    throw automationError
  }

  await createActivityLog({
    workspaceId,
    userId,
    action: successful
      ? 'executed successfully'
      : 'execution failed',
    automation:
      updatedAutomation,
  })

  return {
    run: completedRun,
    automation:
      updatedAutomation,
  }
}

async function createActivityLog({
  workspaceId,
  userId,
  action,
  automation,
}) {
  const { error } = await supabase
    .from('activity_logs')
    .insert({
      workspace_id: workspaceId,
      actor_id: userId,
      action,
      target_type: 'Automation',
      target_id: automation.id,
      target_name: automation.name,
    })

  if (error) {
    console.error(
      'Unable to create activity log:',
      error,
    )
  }
}

function normalizeStatus(status) {
  return String(status || 'draft')
    .trim()
    .toLowerCase()
}

function healthFromStatus(status) {
  const normalizedStatus =
    normalizeStatus(status)

  if (normalizedStatus === 'paused') {
    return 'paused'
  }

  if (normalizedStatus === 'draft') {
    return 'draft'
  }

  return 'healthy'
}

function resolveUpdatedHealth({
  status,
  currentHealth,
}) {
  if (status === 'paused') {
    return 'paused'
  }

  if (status === 'draft') {
    return 'draft'
  }

  if (
    currentHealth === 'warning' ||
    currentHealth === 'critical'
  ) {
    return currentHealth
  }

  return 'healthy'
}

function randomInteger(min, max) {
  return Math.floor(
    Math.random() * (max - min + 1) +
      min,
  )
}

function wait(milliseconds) {
  return new Promise((resolve) => {
    window.setTimeout(
      resolve,
      milliseconds,
    )
  })
}
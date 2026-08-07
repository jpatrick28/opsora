import { supabase } from '../lib/supabase'

const connectionSelect = `
  id,
  workspace_id,
  name,
  platform,
  category,
  account_name,
  owner_id,
  auth_type,
  description,
  status,
  health,
  automation_count,
  last_checked_at,
  last_connected_at,
  created_by,
  created_at,
  updated_at
`

export async function getConnections(
  workspaceId,
) {
  if (!workspaceId) {
    return []
  }

  const { data, error } = await supabase
    .from('connections')
    .select(connectionSelect)
    .eq('workspace_id', workspaceId)
    .order('created_at', {
      ascending: false,
    })

  if (error) {
    throw error
  }

  return data || []
}

export async function createConnection({
  workspaceId,
  userId,
  connection,
}) {
  const payload = {
    workspace_id: workspaceId,
    name: connection.name,
    platform: connection.platform,
    category: connection.category,
    account_name: connection.account,
    owner_id:
      connection.ownerId || userId,
    auth_type: connection.authType,
    description:
      connection.description || null,
    status: 'connected',
    health: 'healthy',
    automation_count: 0,
    last_checked_at:
      new Date().toISOString(),
    last_connected_at:
      new Date().toISOString(),
    created_by: userId,
  }

  const { data, error } = await supabase
    .from('connections')
    .insert(payload)
    .select(connectionSelect)
    .single()

  if (error) {
    throw error
  }

  await createActivityLog({
    workspaceId,
    userId,
    action: 'created',
    connection: data,
  })

  return data
}

export async function updateConnection({
  workspaceId,
  userId,
  connectionId,
  connection,
}) {
  const payload = {
    name: connection.name,
    platform: connection.platform,
    category: connection.category,
    account_name: connection.account,
    owner_id:
      connection.ownerId || userId,
    auth_type: connection.authType,
    description:
      connection.description || null,
    last_checked_at:
      new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('connections')
    .update(payload)
    .eq('id', connectionId)
    .eq('workspace_id', workspaceId)
    .select(connectionSelect)
    .single()

  if (error) {
    throw error
  }

  await createActivityLog({
    workspaceId,
    userId,
    action: 'updated',
    connection: data,
  })

  return data
}

export async function setConnectionStatus({
  workspaceId,
  userId,
  connection,
  status,
}) {
  const normalizedStatus =
    status === 'connected'
      ? 'connected'
      : 'disconnected'

  const { data, error } = await supabase
    .from('connections')
    .update({
      status: normalizedStatus,
      health:
        normalizedStatus === 'connected'
          ? 'healthy'
          : 'warning',
      last_checked_at:
        new Date().toISOString(),
      last_connected_at:
        normalizedStatus === 'connected'
          ? new Date().toISOString()
          : connection.last_connected_at,
    })
    .eq('id', connection.id)
    .eq('workspace_id', workspaceId)
    .select(connectionSelect)
    .single()

  if (error) {
    throw error
  }

  await createActivityLog({
    workspaceId,
    userId,
    action:
      normalizedStatus === 'connected'
        ? 'reconnected'
        : 'disconnected',
    connection: data,
  })

  return data
}

export async function deleteConnection({
  workspaceId,
  userId,
  connection,
}) {
  const { error } = await supabase
    .from('connections')
    .delete()
    .eq('id', connection.id)
    .eq('workspace_id', workspaceId)

  if (error) {
    throw error
  }

  await createActivityLog({
    workspaceId,
    userId,
    action: 'deleted',
    connection,
  })
}

async function createActivityLog({
  workspaceId,
  userId,
  action,
  connection,
}) {
  const { error } = await supabase
    .from('activity_logs')
    .insert({
      workspace_id: workspaceId,
      actor_id: userId,
      action,
      target_type: 'Connection',
      target_id: connection.id,
      target_name: connection.name,
    })

  if (error) {
    console.error(
      'Unable to create connection activity log:',
      error,
    )
  }
}
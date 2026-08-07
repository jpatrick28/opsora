import {
  useEffect,
  useRef,
} from 'react'

import { supabase } from '../lib/supabase'

const DEFAULT_TABLES = [
  'automations',
  'automation_runs',
  'connections',
  'alert_rules',
  'alert_history',
  'workspace_members',
  'workspace_settings',
  'activity_logs',
]

export function useWorkspaceRealtime({
  workspaceId,
  onChange,
  tables = DEFAULT_TABLES,
  enabled = true,
  channelKey = 'default',
}) {
  const onChangeRef =
    useRef(onChange)

  useEffect(() => {
    onChangeRef.current =
      onChange
  }, [onChange])

  useEffect(() => {
    if (
      !enabled ||
      !workspaceId ||
      !tables?.length
    ) {
      return undefined
    }

    const channelName =
      `workspace-realtime-${workspaceId}-${channelKey}`

    const channel =
      supabase.channel(
        channelName,
      )

    tables.forEach((table) => {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter:
            `workspace_id=eq.${workspaceId}`,
        },
        (payload) => {
          onChangeRef.current?.({
            table,
            payload,
          })
        },
      )
    })

    channel.subscribe(
      (status) => {
        if (
          status ===
          'SUBSCRIBED'
        ) {
          console.log(
            `Realtime subscribed: ${channelName}`,
          )
        }

        if (
          status ===
          'CHANNEL_ERROR'
        ) {
          console.error(
            `Realtime channel error: ${channelName}`,
          )
        }

        if (
          status ===
          'TIMED_OUT'
        ) {
          console.error(
            `Realtime channel timed out: ${channelName}`,
          )
        }
      },
    )

    return () => {
      supabase.removeChannel(
        channel,
      )
    }
  }, [
    workspaceId,
    enabled,
    channelKey,
    tables,
  ])
}
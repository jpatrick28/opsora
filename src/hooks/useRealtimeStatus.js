import {
  useEffect,
  useState,
} from 'react'

import { supabase } from '../lib/supabase'

export function useRealtimeStatus() {
  const [status, setStatus] =
    useState('connecting')

  useEffect(() => {
    const channel =
      supabase.channel(
        'opsora-realtime-status',
      )

    channel.subscribe(
      (nextStatus) => {
        if (
          nextStatus ===
          'SUBSCRIBED'
        ) {
          setStatus('connected')
          return
        }

        if (
          nextStatus ===
          'CHANNEL_ERROR'
        ) {
          setStatus('error')
          return
        }

        if (
          nextStatus ===
          'TIMED_OUT'
        ) {
          setStatus('error')
          return
        }

        if (
          nextStatus ===
          'CLOSED'
        ) {
          setStatus('disconnected')
          return
        }

        setStatus('connecting')
      },
    )

    return () => {
      supabase.removeChannel(
        channel,
      )
    }
  }, [])

  return status
} 
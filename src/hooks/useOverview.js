import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import { useAuth } from '../context/AuthContext'
import { useWorkspaceRealtime } from './useWorkspaceRealtime'
import { getOverviewData } from '../services/overviewService'

const initialData = {
  metrics: [],
  executionVolume: [],
  automationHealth: [],
  recentRuns: [],
  failingAutomations: [],
  platformActivity: [],
  activity: [],
}

export function useOverview() {
  const {
    workspaceRecord,
  } = useAuth()

  const workspaceId =
    workspaceRecord?.id || null

  const [data, setData] =
    useState(initialData)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const loadOverview = useCallback(
    async ({
      silent = false,
    } = {}) => {
      if (!workspaceId) {
        setData(initialData)
        setLoading(false)
        return
      }

      if (!silent) {
        setLoading(true)
      }

      setError('')

      try {
        const overview =
          await getOverviewData(
            workspaceId,
          )

        setData(overview)
      } catch (loadError) {
        console.error(
          'Unable to load overview:',
          loadError,
        )

        setError(
          loadError.message ||
            'Unable to load dashboard data.',
        )
      } finally {
        if (!silent) {
          setLoading(false)
        }
      }
    },
    [workspaceId],
  )

  useEffect(() => {
    loadOverview()
  }, [loadOverview])

  const handleRealtimeChange =
    useCallback(
      ({ table }) => {
        console.log(
          `Overview realtime update: ${table}`,
        )

        loadOverview({
          silent: true,
        })
      },
      [loadOverview],
    )

  useWorkspaceRealtime({
    workspaceId,
    channelKey: 'overview',
    tables: [
      'automations',
      'automation_runs',
      'activity_logs',
    ],
    onChange:
      handleRealtimeChange,
  })

  return {
    ...data,
    loading,
    error,
    reload: loadOverview,
  }
}
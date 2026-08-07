import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import { useAuth } from '../context/AuthContext'
import { useWorkspaceRealtime } from './useWorkspaceRealtime'

import {
  getAnalyticsData,
} from '../services/analyticsService'

const initialData = {
  summary: [],
  executionTrends: [],
  platformPerformance: [],
  failureCategories: [],
  ownerPerformance: [],
  automationRanking: [],
}

export function useAnalytics(
  days = 30,
) {
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

  const loadAnalytics =
    useCallback(
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
          const analytics =
            await getAnalyticsData({
              workspaceId,
              days,
            })

          setData(analytics)
        } catch (loadError) {
          console.error(
            'Unable to load analytics:',
            loadError,
          )

          setError(
            loadError.message ||
              'Unable to load analytics.',
          )
        } finally {
          if (!silent) {
            setLoading(false)
          }
        }
      },
      [
        workspaceId,
        days,
      ],
    )

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  const handleRealtimeChange =
    useCallback(
      ({ table }) => {
        console.log(
          `Analytics realtime update: ${table}`,
        )

        loadAnalytics({
          silent: true,
        })
      },
      [loadAnalytics],
    )

  useWorkspaceRealtime({
    workspaceId,
    channelKey: 'analytics',
    tables: [
      'automation_runs',
      'automations',
    ],
    onChange:
      handleRealtimeChange,
  })

  return {
    ...data,
    loading,
    error,
    reload: loadAnalytics,
  }
}
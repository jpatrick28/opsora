import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import { useAuth } from '../context/AuthContext'
import { useWorkspaceRealtime } from './useWorkspaceRealtime'

import {
  getExecutionLogs,
  retryExecution,
} from '../services/executionLogService'

export function useExecutionLogs() {
  const {
    workspaceRecord,
  } = useAuth()

  const workspaceId =
    workspaceRecord?.id || null

  const [runs, setRuns] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [error, setError] =
    useState('')

  const loadRuns = useCallback(
    async ({
      silent = false,
    } = {}) => {
      if (!workspaceId) {
        setRuns([])
        setLoading(false)
        return
      }

      if (!silent) {
        setLoading(true)
      }

      setError('')

      try {
        const records =
          await getExecutionLogs(
            workspaceId,
          )

        setRuns(records)
      } catch (loadError) {
        console.error(
          'Unable to load execution logs:',
          loadError,
        )

        setError(
          loadError.message ||
            'Unable to load execution logs.',
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
    loadRuns()
  }, [loadRuns])

  const handleRealtimeChange =
    useCallback(
      ({ table }) => {
        console.log(
          `Execution logs realtime update: ${table}`,
        )

        loadRuns({
          silent: true,
        })
      },
      [loadRuns],
    )

  useWorkspaceRealtime({
    workspaceId,
    channelKey: 'execution-logs',
    tables: [
      'automation_runs',
      'automations',
    ],
    onChange:
      handleRealtimeChange,
  })

  async function retry(run) {
    setSaving(true)
    setError('')

    try {
      const created =
        await retryExecution({
          workspaceId,

          automationId:
            run.automation_id,

          originalRun:
            run,
        })

      setRuns((current) => [
        created,
        ...current,
      ])

      return created
    } catch (retryError) {
      console.error(
        'Unable to retry execution:',
        retryError,
      )

      setError(
        retryError.message ||
          'Unable to retry execution.',
      )

      throw retryError
    } finally {
      setSaving(false)
    }
  }

  return {
    runs,
    loading,
    saving,
    error,
    reload: loadRuns,
    retry,
  }
}
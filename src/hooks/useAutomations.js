import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import { useAuth } from '../context/AuthContext'
import { useWorkspaceRealtime } from './useWorkspaceRealtime'

import {
  createAutomation,
  deleteAutomation,
  duplicateAutomation,
  getAutomations,
  runAutomationNow,
  setAutomationStatus,
  updateAutomation,
} from '../services/automationService'

export function useAutomations() {
  const {
    user,
    workspaceRecord,
  } = useAuth()

  const [automations, setAutomations] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [
    runningAutomationId,
    setRunningAutomationId,
  ] = useState(null)

  const [error, setError] =
    useState('')

  const workspaceId =
    workspaceRecord?.id || null

  const loadAutomations = useCallback(
    async ({
      silent = false,
    } = {}) => {
      if (!workspaceId) {
        setAutomations([])
        setLoading(false)
        return
      }

      if (!silent) {
        setLoading(true)
      }

      setError('')

      try {
        const records =
          await getAutomations(
            workspaceId,
          )

        setAutomations(records)
      } catch (loadError) {
        console.error(
          'Unable to load automations:',
          loadError,
        )

        setError(
          loadError.message ||
            'Unable to load automations.',
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
    loadAutomations()
  }, [loadAutomations])

  const handleRealtimeChange =
    useCallback(
      ({ table }) => {
        console.log(
          `Automations realtime update: ${table}`,
        )

        loadAutomations({
          silent: true,
        })
      },
      [loadAutomations],
    )

  useWorkspaceRealtime({
    workspaceId,
    channelKey: 'automations',
    tables: [
      'automations',
      'automation_runs',
    ],
    onChange:
      handleRealtimeChange,
  })

  async function addAutomation(
    formData,
  ) {
    setSaving(true)
    setError('')

    try {
      const created =
        await createAutomation({
          workspaceId,
          userId: user.id,
          automation: formData,
        })

      setAutomations((current) => [
        created,
        ...current,
      ])

      return created
    } catch (createError) {
      setError(
        createError.message ||
          'Unable to create automation.',
      )

      throw createError
    } finally {
      setSaving(false)
    }
  }

  async function editAutomation({
    automation,
    formData,
  }) {
    setSaving(true)
    setError('')

    try {
      const updated =
        await updateAutomation({
          workspaceId,
          userId: user.id,
          automationId:
            automation.id,
          automation: formData,
          currentHealth:
            automation.health,
        })

      replaceAutomation(updated)

      return updated
    } catch (updateError) {
      setError(
        updateError.message ||
          'Unable to update automation.',
      )

      throw updateError
    } finally {
      setSaving(false)
    }
  }

  async function changeStatus(
    automation,
  ) {
    const nextStatus =
      automation.status === 'active'
        ? 'paused'
        : 'active'

    setSaving(true)
    setError('')

    try {
      const updated =
        await setAutomationStatus({
          workspaceId,
          userId: user.id,
          automation,
          status: nextStatus,
        })

      replaceAutomation(updated)

      return updated
    } catch (statusError) {
      setError(
        statusError.message ||
          'Unable to change automation status.',
      )

      throw statusError
    } finally {
      setSaving(false)
    }
  }

  async function duplicate(
    automation,
  ) {
    setSaving(true)
    setError('')

    try {
      const created =
        await duplicateAutomation({
          workspaceId,
          userId: user.id,
          automation,
        })

      setAutomations((current) => [
        created,
        ...current,
      ])

      return created
    } catch (duplicateError) {
      setError(
        duplicateError.message ||
          'Unable to duplicate automation.',
      )

      throw duplicateError
    } finally {
      setSaving(false)
    }
  }

  async function remove(automation) {
    setSaving(true)
    setError('')

    try {
      await deleteAutomation({
        workspaceId,
        userId: user.id,
        automation,
      })

      setAutomations((current) =>
        current.filter(
          (record) =>
            record.id !==
            automation.id,
        ),
      )
    } catch (deleteError) {
      setError(
        deleteError.message ||
          'Unable to delete automation.',
      )

      throw deleteError
    } finally {
      setSaving(false)
    }
  }

  async function runNow(automation) {
    setError('')

    setRunningAutomationId(
      automation.id,
    )

    try {
      const result =
        await runAutomationNow({
          workspaceId,
          userId: user.id,
          automation,
        })

      replaceAutomation(
        result.automation,
      )

      return result
    } catch (runError) {
      console.error(
        'Unable to run automation:',
        runError,
      )

      setError(
        runError.message ||
          'Unable to run automation.',
      )

      throw runError
    } finally {
      setRunningAutomationId(
        null,
      )
    }
  }

  function replaceAutomation(
    updated,
  ) {
    setAutomations((current) =>
      current.map((record) =>
        record.id === updated.id
          ? updated
          : record,
      ),
    )
  }

  return {
    automations,
    loading,
    saving,
    runningAutomationId,
    error,
    clearError: () =>
      setError(''),
    reload: loadAutomations,
    addAutomation,
    editAutomation,
    changeStatus,
    duplicate,
    remove,
    runNow,
  }
}
import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import { useAuth } from '../context/AuthContext'
import { useWorkspaceRealtime } from './useWorkspaceRealtime'

import {
  createAlertRule,
  deleteAlertHistory,
  deleteAlertRule,
  getAlertsData,
  toggleAlertRule,
  updateAlertRule,
  updateAlertStatus,
} from '../services/alertService'

export function useAlerts() {
  const {
    user,
    workspaceRecord,
  } = useAuth()

  const workspaceId =
    workspaceRecord?.id || null

  const [rules, setRules] =
    useState([])

  const [history, setHistory] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [error, setError] =
    useState('')

  const loadAlerts = useCallback(
    async ({
      silent = false,
    } = {}) => {
      if (!workspaceId) {
        setRules([])
        setHistory([])
        setLoading(false)
        return
      }

      if (!silent) {
        setLoading(true)
      }

      setError('')

      try {
        const data =
          await getAlertsData(
            workspaceId,
          )

        setRules(data.rules)
        setHistory(data.history)
      } catch (loadError) {
        console.error(
          'Unable to load alerts:',
          loadError,
        )

        setError(
          loadError.message ||
            'Unable to load alerts.',
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
    loadAlerts()
  }, [loadAlerts])

  const handleRealtimeChange =
    useCallback(
      ({ table }) => {
        console.log(
          `Alerts realtime update: ${table}`,
        )

        loadAlerts({
          silent: true,
        })
      },
      [loadAlerts],
    )

  useWorkspaceRealtime({
    workspaceId,
    channelKey: 'alerts',
    tables: [
      'alert_rules',
      'alert_history',
    ],
    onChange:
      handleRealtimeChange,
  })

  async function addRule(
    formData,
  ) {
    setSaving(true)
    setError('')

    try {
      const created =
        await createAlertRule({
          workspaceId,
          userId: user.id,
          rule: formData,
        })

      setRules((current) => [
        created,
        ...current,
      ])

      return created
    } catch (createError) {
      setError(
        createError.message ||
          'Unable to create alert rule.',
      )

      throw createError
    } finally {
      setSaving(false)
    }
  }

  async function editRule({
    rule,
    formData,
  }) {
    setSaving(true)
    setError('')

    try {
      const updated =
        await updateAlertRule({
          workspaceId,
          userId: user.id,
          ruleId: rule.id,
          rule: formData,
        })

      setRules((current) =>
        current.map(
          (record) =>
            record.id ===
            updated.id
              ? updated
              : record,
        ),
      )

      return updated
    } catch (updateError) {
      setError(
        updateError.message ||
          'Unable to update alert rule.',
      )

      throw updateError
    } finally {
      setSaving(false)
    }
  }

  async function toggleRule(
    rule,
  ) {
    setSaving(true)
    setError('')

    try {
      const updated =
        await toggleAlertRule({
          workspaceId,
          userId: user.id,
          rule,
        })

      setRules((current) =>
        current.map(
          (record) =>
            record.id ===
            updated.id
              ? updated
              : record,
        ),
      )

      return updated
    } catch (toggleError) {
      setError(
        toggleError.message ||
          'Unable to update alert rule.',
      )

      throw toggleError
    } finally {
      setSaving(false)
    }
  }

  async function removeRule(
    rule,
  ) {
    setSaving(true)
    setError('')

    try {
      await deleteAlertRule({
        workspaceId,
        userId: user.id,
        rule,
      })

      setRules((current) =>
        current.filter(
          (record) =>
            record.id !==
            rule.id,
        ),
      )
    } catch (deleteError) {
      setError(
        deleteError.message ||
          'Unable to delete alert rule.',
      )

      throw deleteError
    } finally {
      setSaving(false)
    }
  }

  async function changeAlertStatus(
    alert,
    status,
  ) {
    setSaving(true)
    setError('')

    try {
      const updated =
        await updateAlertStatus({
          workspaceId,
          userId: user.id,
          alert,
          status,
        })

      setHistory((current) =>
        current.map(
          (record) =>
            record.id ===
            updated.id
              ? updated
              : record,
        ),
      )

      return updated
    } catch (statusError) {
      setError(
        statusError.message ||
          'Unable to update alert.',
      )

      throw statusError
    } finally {
      setSaving(false)
    }
  }

  async function removeAlert(
    alert,
  ) {
    setSaving(true)
    setError('')

    try {
      await deleteAlertHistory({
        workspaceId,
        userId: user.id,
        alert,
      })

      setHistory((current) =>
        current.filter(
          (record) =>
            record.id !==
            alert.id,
        ),
      )
    } catch (deleteError) {
      setError(
        deleteError.message ||
          'Unable to delete alert.',
      )

      throw deleteError
    } finally {
      setSaving(false)
    }
  }

  return {
    rules,
    history,
    loading,
    saving,
    error,
    reload: loadAlerts,
    addRule,
    editRule,
    toggleRule,
    removeRule,
    changeAlertStatus,
    removeAlert,
  }
}
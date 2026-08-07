import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { useWorkspaceRealtime } from './useWorkspaceRealtime'

import {
  getWorkspaceSettings,
  resetWorkspaceSettings,
  saveWorkspaceSettings,
} from '../services/settingsService'

const defaultSettings = {
  workspaceName: '',
  workspaceSlug: '',
  timezone: 'Asia/Manila',
  dateFormat: 'MMM D, YYYY',
  weekStartsOn: 'Monday',

  defaultAutomationStatus:
    'Draft',

  defaultRetryLimit: '3',

  defaultExecutionTimeout:
    '30',

  emailNotifications: true,
  slackNotifications: true,
  browserNotifications: false,
  weeklySummary: true,
  criticalAlertsOnly: false,

  alertEmail: '',
  slackChannel: '',
  webhookUrl: '',

  compactTables: false,
  reduceMotion: false,
}

export function useSettings() {
  const {
    user,
    workspaceRecord,
    refreshAccount,
  } = useAuth()

  const workspaceId =
    workspaceRecord?.id || null

  const [
    settings,
    setSettings,
  ] = useState(
    defaultSettings,
  )

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [error, setError] =
    useState('')

  const loadSettings =
    useCallback(
      async ({
        silent = false,
      } = {}) => {
        if (!workspaceId) {
          setLoading(false)
          return
        }

        if (!silent) {
          setLoading(true)
        }

        setError('')

        try {
          const result =
            await getWorkspaceSettings(
              workspaceId,
            )

          setSettings(
            normalizeSettings(
              result,
            ),
          )
        } catch (loadError) {
          console.error(
            'Unable to load settings:',
            loadError,
          )

          setError(
            loadError.message ||
              'Unable to load settings.',
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
    loadSettings()
  }, [loadSettings])

  const handleSettingsRealtime =
    useCallback(
      ({ table }) => {
        console.log(
          `Settings realtime update: ${table}`,
        )

        loadSettings({
          silent: true,
        })
      },
      [loadSettings],
    )

  useWorkspaceRealtime({
    workspaceId,
    channelKey:
      'workspace-settings',
    tables: [
      'workspace_settings',
    ],
    onChange:
      handleSettingsRealtime,
  })

  useEffect(() => {
    if (!workspaceId) {
      return undefined
    }

    const channelName =
      `workspace-record-${workspaceId}`

    const channel =
      supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'workspaces',
            filter:
              `id=eq.${workspaceId}`,
          },
          () => {
            console.log(
              'Settings realtime update: workspaces',
            )

            loadSettings({
              silent: true,
            })

            refreshAccount()
          },
        )
        .subscribe(
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
    loadSettings,
    refreshAccount,
  ])

  function updateSetting(
    name,
    value,
  ) {
    setSettings(
      (current) => ({
        ...current,
        [name]: value,
      }),
    )
  }

  async function save() {
    setSaving(true)
    setError('')

    try {
      const result =
        await saveWorkspaceSettings({
          workspaceId,

          userId:
            user?.id,

          values:
            settings,
        })

      setSettings(
        normalizeSettings(
          result,
        ),
      )

      await refreshAccount()

      return result
    } catch (saveError) {
      setError(
        saveError.message ||
          'Unable to save settings.',
      )

      throw saveError
    } finally {
      setSaving(false)
    }
  }

  async function reset() {
    setSaving(true)
    setError('')

    try {
      await resetWorkspaceSettings({
        workspaceId,

        userId:
          user?.id,
      })

      await loadSettings()

      return true
    } catch (resetError) {
      setError(
        resetError.message ||
          'Unable to reset settings.',
      )

      throw resetError
    } finally {
      setSaving(false)
    }
  }

  return {
    settings,
    loading,
    saving,
    error,
    reload: loadSettings,
    updateSetting,
    save,
    reset,
  }
}

function normalizeSettings(
  result,
) {
  const workspace =
    result?.workspace || {}

  const settings =
    result?.settings || {}

  return {
    workspaceName:
      workspace.name || '',

    workspaceSlug:
      workspace.slug || '',

    timezone:
      workspace.timezone ||
      'Asia/Manila',

    dateFormat:
      workspace.date_format ||
      'MMM D, YYYY',

    weekStartsOn:
      workspace.week_starts_on ||
      'Monday',

    defaultAutomationStatus:
      capitalize(
        settings.default_automation_status ||
          'draft',
      ),

    defaultRetryLimit:
      String(
        settings.default_retry_limit ??
          3,
      ),

    defaultExecutionTimeout:
      String(
        settings.default_execution_timeout ??
          30,
      ),

    emailNotifications:
      settings.email_notifications ??
      true,

    slackNotifications:
      settings.slack_notifications ??
      true,

    browserNotifications:
      settings.browser_notifications ??
      false,

    weeklySummary:
      settings.weekly_summary ??
      true,

    criticalAlertsOnly:
      settings.critical_alerts_only ??
      false,

    alertEmail:
      settings.alert_email ||
      '',

    slackChannel:
      settings.slack_channel ||
      '',

    webhookUrl:
      settings.webhook_url ||
      '',

    compactTables:
      settings.compact_tables ??
      false,

    reduceMotion:
      settings.reduce_motion ??
      false,
  }
}

function capitalize(value) {
  if (!value) {
    return ''
  }

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  )
}
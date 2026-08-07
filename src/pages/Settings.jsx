import {
  useState,
} from 'react'

import {
  Bell,
  Building2,
  Check,
  Clock3,
  Database,
  LoaderCircle,
  Mail,
  Moon,
  RefreshCw,
  RotateCcw,
  Save,
  ShieldCheck,
  Sun,
  Webhook,
} from 'lucide-react'

import { useWorkspace } from '../context/WorkspaceContext'
import { useSettings } from '../hooks/useSettings'

import SupabaseConnectionTest from '../components/SupabaseConnectionTest'

function Settings() {
  const {
    theme,
    setTheme,
    isSidebarCollapsed,
  } = useWorkspace()

  const {
    settings,
    loading,
    saving,
    error,
    reload,
    updateSetting,
    save,
    reset,
  } = useSettings()

  const darkMode =
    theme === 'dark'

  const [
    activeSection,
    setActiveSection,
  ] = useState('workspace')

  const [
    message,
    setMessage,
  ] = useState('')

  function showMessage(
    nextMessage,
  ) {
    setMessage(nextMessage)

    window.setTimeout(() => {
      setMessage('')
    }, 3000)
  }

  async function saveSettings(
    event,
  ) {
    event.preventDefault()

    try {
      await save()

      showMessage(
        'Workspace settings saved.',
      )
    } catch (saveError) {
      showMessage(
        saveError.message ||
          'Unable to save settings.',
      )
    }
  }

  async function resetSettings() {
    const confirmed =
      window.confirm(
        'Reset workspace preferences to their defaults?',
      )

    if (!confirmed) {
      return
    }

    try {
      await reset()

      setTheme('light')

      showMessage(
        'Workspace settings reset.',
      )
    } catch (resetError) {
      showMessage(
        resetError.message ||
          'Unable to reset settings.',
      )
    }
  }

  return (
    <main
      className={`min-h-screen pt-[72px] transition-[padding] duration-300 ${
        isSidebarCollapsed
          ? 'lg:pl-[82px]'
          : 'lg:pl-[260px]'
      } ${
        darkMode
          ? 'bg-[#111827] text-white'
          : 'bg-[#f4f6f8] text-slate-900'
      }`}
    >
      <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-500">
              Workspace preferences
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em]">
              Settings
            </h2>

            <p
              className={`mt-3 max-w-2xl text-sm leading-7 ${
                darkMode
                  ? 'text-slate-400'
                  : 'text-slate-500'
              }`}
            >
              Configure workspace
              identity, automation
              defaults, notifications
              and appearance.
            </p>

            <div className="mt-5">
              <SupabaseConnectionTest
                darkMode={
                  darkMode
                }
              />
            </div>
          </div>

          <button
            type="button"
            onClick={reload}
            disabled={
              loading || saving
            }
            className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
              darkMode
                ? 'border-slate-700 bg-slate-800 hover:bg-slate-700'
                : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}
          >
            <RefreshCw
              size={16}
              className={
                loading
                  ? 'animate-spin'
                  : ''
              }
            />

            Refresh
          </button>
        </div>

        {message && (
          <div
            role="status"
            className={`mt-5 rounded-xl border px-4 py-3 text-sm ${
              darkMode
                ? 'border-indigo-500/20 bg-indigo-500/10 text-indigo-300'
                : 'border-indigo-200 bg-indigo-50 text-indigo-700'
            }`}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-500"
          >
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[520px] items-center justify-center">
            <div className="text-center">
              <LoaderCircle
                size={30}
                className="mx-auto animate-spin text-indigo-500"
              />

              <p
                className={`mt-3 text-sm ${
                  darkMode
                    ? 'text-slate-400'
                    : 'text-slate-500'
                }`}
              >
                Loading settings...
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-7 grid gap-5 lg:grid-cols-[240px_1fr]">
            <SettingsNavigation
              activeSection={
                activeSection
              }
              onSelect={
                setActiveSection
              }
              darkMode={darkMode}
            />

            <form
              onSubmit={
                saveSettings
              }
              className="space-y-5"
            >
              {activeSection ===
                'workspace' && (
                <WorkspaceSettings
                  settings={
                    settings
                  }
                  updateSetting={
                    updateSetting
                  }
                  darkMode={
                    darkMode
                  }
                />
              )}

              {activeSection ===
                'automation' && (
                <AutomationDefaults
                  settings={
                    settings
                  }
                  updateSetting={
                    updateSetting
                  }
                  darkMode={
                    darkMode
                  }
                />
              )}

              {activeSection ===
                'notifications' && (
                <NotificationSettings
                  settings={
                    settings
                  }
                  updateSetting={
                    updateSetting
                  }
                  darkMode={
                    darkMode
                  }
                />
              )}

              {activeSection ===
                'appearance' && (
                <AppearanceSettings
                  theme={theme}
                  setTheme={setTheme}
                  settings={
                    settings
                  }
                  updateSetting={
                    updateSetting
                  }
                  darkMode={
                    darkMode
                  }
                />
              )}

              {activeSection ===
                'data' && (
                <DataSettings
                  onResetSettings={
                    resetSettings
                  }
                  saving={
                    saving
                  }
                  darkMode={
                    darkMode
                  }
                />
              )}

              {activeSection !==
                'data' && (
                <div
                  className={`flex flex-col-reverse gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
                    darkMode
                      ? 'border-slate-700 bg-slate-800'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <p
                    className={`text-xs ${
                      darkMode
                        ? 'text-slate-500'
                        : 'text-slate-400'
                    }`}
                  >
                    Workspace changes are
                    saved to Supabase.
                  </p>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? (
                      <LoaderCircle
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <Save
                        size={16}
                      />
                    )}

                    {saving
                      ? 'Saving...'
                      : 'Save settings'}
                  </button>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </main>
  )
}

function SettingsNavigation({
  activeSection,
  onSelect,
  darkMode,
}) {
  const items = [
    {
      id: 'workspace',
      label: 'Workspace',
      icon: Building2,
    },
    {
      id: 'automation',
      label:
        'Automation defaults',
      icon: Clock3,
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
    },
    {
      id: 'appearance',
      label: 'Appearance',
      icon: Sun,
    },
    {
      id: 'data',
      label: 'Data management',
      icon: Database,
    },
  ]

  return (
    <aside
      className={`h-fit rounded-2xl border p-3 ${
        darkMode
          ? 'border-slate-700 bg-slate-800'
          : 'border-slate-200 bg-white'
      }`}
    >
      <nav className="space-y-1.5">
        {items.map((item) => {
          const Icon = item.icon

          const active =
            activeSection ===
            item.id

          return (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                onSelect(
                  item.id,
                )
              }
              className={`flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3 text-left text-xs font-semibold transition ${
                active
                  ? 'bg-indigo-600 text-white'
                  : darkMode
                    ? 'text-slate-400 hover:bg-slate-900 hover:text-white'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon size={16} />
              {item.label}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

function WorkspaceSettings({
  settings,
  updateSetting,
  darkMode,
}) {
  return (
    <SettingsCard
      icon={
        <Building2 size={18} />
      }
      title="Workspace identity"
      description="Configure the main name and regional preferences for this workspace."
      darkMode={darkMode}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Workspace name"
          value={
            settings.workspaceName
          }
          onChange={(value) =>
            updateSetting(
              'workspaceName',
              value,
            )
          }
          placeholder="Workspace name"
          darkMode={darkMode}
        />

        <TextField
          label="Workspace slug"
          value={
            settings.workspaceSlug
          }
          onChange={(value) =>
            updateSetting(
              'workspaceSlug',
              value,
            )
          }
          placeholder="workspace-slug"
          darkMode={darkMode}
        />

        <SelectField
          label="Timezone"
          value={settings.timezone}
          onChange={(value) =>
            updateSetting(
              'timezone',
              value,
            )
          }
          options={[
            'Asia/Manila',
            'Asia/Singapore',
            'Australia/Sydney',
            'Europe/London',
            'America/New_York',
            'America/Los_Angeles',
          ]}
          darkMode={darkMode}
        />

        <SelectField
          label="Date format"
          value={
            settings.dateFormat
          }
          onChange={(value) =>
            updateSetting(
              'dateFormat',
              value,
            )
          }
          options={[
            'MMM D, YYYY',
            'MM/DD/YYYY',
            'DD/MM/YYYY',
            'YYYY-MM-DD',
          ]}
          darkMode={darkMode}
        />

        <SelectField
          label="Week starts on"
          value={
            settings.weekStartsOn
          }
          onChange={(value) =>
            updateSetting(
              'weekStartsOn',
              value,
            )
          }
          options={[
            'Monday',
            'Sunday',
          ]}
          darkMode={darkMode}
        />
      </div>
    </SettingsCard>
  )
}

function AutomationDefaults({
  settings,
  updateSetting,
  darkMode,
}) {
  return (
    <SettingsCard
      icon={
        <Clock3 size={18} />
      }
      title="Automation defaults"
      description="Choose the initial values used when creating new workflows."
      darkMode={darkMode}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          label="Default status"
          value={
            settings.defaultAutomationStatus
          }
          onChange={(value) =>
            updateSetting(
              'defaultAutomationStatus',
              value,
            )
          }
          options={[
            'Draft',
            'Active',
            'Paused',
          ]}
          darkMode={darkMode}
        />

        <SelectField
          label="Retry limit"
          value={
            settings.defaultRetryLimit
          }
          onChange={(value) =>
            updateSetting(
              'defaultRetryLimit',
              value,
            )
          }
          options={[
            '0',
            '1',
            '2',
            '3',
            '5',
            '10',
          ]}
          darkMode={darkMode}
        />

        <SelectField
          label="Execution timeout"
          value={
            settings.defaultExecutionTimeout
          }
          onChange={(value) =>
            updateSetting(
              'defaultExecutionTimeout',
              value,
            )
          }
          options={[
            '10',
            '30',
            '60',
            '120',
            '300',
          ]}
          suffix="seconds"
          darkMode={darkMode}
        />
      </div>

      <div
        className={`mt-5 rounded-xl border p-4 ${
          darkMode
            ? 'border-slate-700 bg-slate-900/50'
            : 'border-slate-200 bg-slate-50'
        }`}
      >
        <div className="flex items-start gap-3">
          <ShieldCheck
            size={18}
            className="mt-0.5 shrink-0 text-indigo-500"
          />

          <div>
            <p className="text-sm font-semibold">
              Safe workflow defaults
            </p>

            <p
              className={`mt-1 text-xs leading-6 ${
                darkMode
                  ? 'text-slate-500'
                  : 'text-slate-400'
              }`}
            >
              Draft status is
              recommended so newly
              created automations cannot
              run before configuration
              and testing are complete.
            </p>
          </div>
        </div>
      </div>
    </SettingsCard>
  )
}

function NotificationSettings({
  settings,
  updateSetting,
  darkMode,
}) {
  return (
    <div className="space-y-5">
      <SettingsCard
        icon={<Bell size={18} />}
        title="Notification preferences"
        description="Choose which operational events generate notifications."
        darkMode={darkMode}
      >
        <div className="space-y-3">
          <ToggleField
            icon={<Mail size={16} />}
            label="Email notifications"
            description="Receive workflow failures and status changes by email."
            checked={
              settings.emailNotifications
            }
            onChange={(value) =>
              updateSetting(
                'emailNotifications',
                value,
              )
            }
            darkMode={darkMode}
          />

          <ToggleField
            icon={<Bell size={16} />}
            label="Slack notifications"
            description="Enable operational Slack alerts."
            checked={
              settings.slackNotifications
            }
            onChange={(value) =>
              updateSetting(
                'slackNotifications',
                value,
              )
            }
            darkMode={darkMode}
          />

          <ToggleField
            icon={<Sun size={16} />}
            label="Browser notifications"
            description="Display desktop alerts while Opsora is open."
            checked={
              settings.browserNotifications
            }
            onChange={(value) =>
              updateSetting(
                'browserNotifications',
                value,
              )
            }
            darkMode={darkMode}
          />

          <ToggleField
            icon={<Clock3 size={16} />}
            label="Weekly summary"
            description="Receive a weekly automation-health summary."
            checked={
              settings.weeklySummary
            }
            onChange={(value) =>
              updateSetting(
                'weeklySummary',
                value,
              )
            }
            darkMode={darkMode}
          />

          <ToggleField
            icon={
              <ShieldCheck
                size={16}
              />
            }
            label="Critical alerts only"
            description="Suppress lower-priority operational notifications."
            checked={
              settings.criticalAlertsOnly
            }
            onChange={(value) =>
              updateSetting(
                'criticalAlertsOnly',
                value,
              )
            }
            darkMode={darkMode}
          />
        </div>
      </SettingsCard>

      <SettingsCard
        icon={
          <Webhook size={18} />
        }
        title="Notification destinations"
        description="Configure where Opsora sends monitoring updates."
        darkMode={darkMode}
      >
        <div className="grid gap-5">
          <TextField
            label="Alert email"
            type="email"
            value={
              settings.alertEmail
            }
            onChange={(value) =>
              updateSetting(
                'alertEmail',
                value,
              )
            }
            placeholder="ops@example.com"
            darkMode={darkMode}
            required={false}
          />

          <TextField
            label="Slack channel"
            value={
              settings.slackChannel
            }
            onChange={(value) =>
              updateSetting(
                'slackChannel',
                value,
              )
            }
            placeholder="#ops-alerts"
            darkMode={darkMode}
            required={false}
          />

          <TextField
            label="Webhook URL"
            type="url"
            value={
              settings.webhookUrl
            }
            onChange={(value) =>
              updateSetting(
                'webhookUrl',
                value,
              )
            }
            placeholder="https://example.com/webhook"
            darkMode={darkMode}
            required={false}
          />
        </div>
      </SettingsCard>
    </div>
  )
}

function AppearanceSettings({
  theme,
  setTheme,
  settings,
  updateSetting,
  darkMode,
}) {
  return (
    <SettingsCard
      icon={<Sun size={18} />}
      title="Appearance"
      description="Configure theme and interface behavior."
      darkMode={darkMode}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <ThemeOption
          label="Light mode"
          description="Use a bright interface for daytime environments."
          icon={<Sun size={20} />}
          active={
            theme === 'light'
          }
          onClick={() =>
            setTheme('light')
          }
          darkMode={darkMode}
        />

        <ThemeOption
          label="Dark mode"
          description="Use a darker interface for reduced-light environments."
          icon={<Moon size={20} />}
          active={
            theme === 'dark'
          }
          onClick={() =>
            setTheme('dark')
          }
          darkMode={darkMode}
        />
      </div>

      <div className="mt-6 space-y-3">
        <ToggleField
          icon={
            <Database size={16} />
          }
          label="Compact tables"
          description="Reduce table row spacing to display more records."
          checked={
            settings.compactTables
          }
          onChange={(value) =>
            updateSetting(
              'compactTables',
              value,
            )
          }
          darkMode={darkMode}
        />

        <ToggleField
          icon={<Clock3 size={16} />}
          label="Reduce motion"
          description="Limit interface animations and smooth scrolling."
          checked={
            settings.reduceMotion
          }
          onChange={(value) =>
            updateSetting(
              'reduceMotion',
              value,
            )
          }
          darkMode={darkMode}
        />
      </div>
    </SettingsCard>
  )
}

function DataSettings({
  onResetSettings,
  saving,
  darkMode,
}) {
  return (
    <SettingsCard
      icon={
        <Database size={18} />
      }
      title="Data management"
      description="Restore workspace preferences to their defaults."
      darkMode={darkMode}
    >
      <DangerAction
        icon={
          <RotateCcw size={18} />
        }
        title="Reset workspace settings"
        description="Restore automation defaults, notifications and interface preferences."
        actionLabel={
          saving
            ? 'Resetting...'
            : 'Reset settings'
        }
        onClick={
          onResetSettings
        }
        darkMode={darkMode}
        disabled={saving}
      />
    </SettingsCard>
  )
}

function SettingsCard({
  icon,
  title,
  description,
  darkMode,
  children,
}) {
  return (
    <section
      className={`rounded-2xl border ${
        darkMode
          ? 'border-slate-700 bg-slate-800'
          : 'border-slate-200 bg-white'
      }`}
    >
      <header className="flex items-start gap-4 border-b border-inherit px-5 py-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
          {icon}
        </span>

        <div>
          <h3 className="text-sm font-semibold">
            {title}
          </h3>

          <p
            className={`mt-1 text-xs leading-6 ${
              darkMode
                ? 'text-slate-500'
                : 'text-slate-400'
            }`}
          >
            {description}
          </p>
        </div>
      </header>

      <div className="p-5">
        {children}
      </div>
    </section>
  )
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  darkMode,
  type = 'text',
  required = true,
}) {
  return (
    <div>
      <label className="text-xs font-semibold">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        placeholder={placeholder}
        required={required}
        className={`mt-2 min-h-[44px] w-full rounded-xl border px-4 text-sm outline-none ${
          darkMode
            ? 'border-slate-700 bg-slate-900 placeholder:text-slate-600 focus:border-indigo-500'
            : 'border-slate-200 bg-white placeholder:text-slate-400 focus:border-indigo-500'
        }`}
      />
    </div>
  )
}

function SelectField({
  label,
  value,
  onChange,
  options,
  darkMode,
  suffix,
}) {
  return (
    <div>
      <label className="text-xs font-semibold">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className={`mt-2 min-h-[44px] w-full rounded-xl border px-4 text-sm outline-none ${
          darkMode
            ? 'border-slate-700 bg-slate-900 focus:border-indigo-500'
            : 'border-slate-200 bg-white focus:border-indigo-500'
        }`}
      >
        {options.map(
          (option) => (
            <option
              key={option}
              value={option}
            >
              {suffix
                ? `${option} ${suffix}`
                : option}
            </option>
          ),
        )}
      </select>
    </div>
  )
}

function ToggleField({
  icon,
  label,
  description,
  checked,
  onChange,
  darkMode,
}) {
  return (
    <div
      className={`flex items-center justify-between gap-5 rounded-xl border p-4 ${
        darkMode
          ? 'border-slate-700 bg-slate-900/40'
          : 'border-slate-200 bg-slate-50'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-indigo-500">
          {icon}
        </span>

        <div>
          <p className="text-sm font-semibold">
            {label}
          </p>

          <p
            className={`mt-1 text-xs leading-6 ${
              darkMode
                ? 'text-slate-500'
                : 'text-slate-400'
            }`}
          >
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() =>
          onChange(!checked)
        }
        aria-pressed={checked}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          checked
            ? 'bg-indigo-600'
            : darkMode
              ? 'bg-slate-700'
              : 'bg-slate-300'
        }`}
      >
        <span
          className={`absolute top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow transition ${
            checked
              ? 'left-6'
              : 'left-1'
          }`}
        >
          {checked && (
            <Check
              size={12}
              className="text-indigo-600"
            />
          )}
        </span>
      </button>
    </div>
  )
}

function ThemeOption({
  label,
  description,
  icon,
  active,
  onClick,
  darkMode,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-5 text-left transition ${
        active
          ? 'border-indigo-500 bg-indigo-500/10'
          : darkMode
            ? 'border-slate-700 bg-slate-900/40 hover:border-slate-600'
            : 'border-slate-200 bg-slate-50 hover:border-slate-300'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${
            active
              ? 'bg-indigo-600 text-white'
              : darkMode
                ? 'bg-slate-700 text-slate-300'
                : 'bg-white text-slate-600'
          }`}
        >
          {icon}
        </span>

        {active && (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white">
            <Check size={14} />
          </span>
        )}
      </div>

      <p className="mt-4 text-sm font-semibold">
        {label}
      </p>

      <p
        className={`mt-2 text-xs leading-6 ${
          darkMode
            ? 'text-slate-500'
            : 'text-slate-400'
        }`}
      >
        {description}
      </p>
    </button>
  )
}

function DangerAction({
  icon,
  title,
  description,
  actionLabel,
  onClick,
  darkMode,
  disabled = false,
}) {
  return (
    <div
      className={`flex flex-col justify-between gap-5 rounded-xl border p-5 sm:flex-row sm:items-center ${
        darkMode
          ? 'border-slate-700 bg-slate-900/40'
          : 'border-slate-200 bg-slate-50'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
          {icon}
        </span>

        <div>
          <p className="text-sm font-semibold">
            {title}
          </p>

          <p
            className={`mt-1 text-xs leading-6 ${
              darkMode
                ? 'text-slate-500'
                : 'text-slate-400'
            }`}
          >
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={`min-h-[42px] shrink-0 rounded-xl border px-4 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${
          darkMode
            ? 'border-slate-700 hover:bg-slate-900'
            : 'border-slate-200 hover:bg-white'
        }`}
      >
        {actionLabel}
      </button>
    </div>
  )
}

export default Settings
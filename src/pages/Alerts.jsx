import {
  useMemo,
  useState,
} from 'react'

import {
  AlertTriangle,
  BellRing,
  Check,
  Edit3,
  LoaderCircle,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Webhook,
} from 'lucide-react'

import { useWorkspace } from '../context/WorkspaceContext'
import { useAuth } from '../context/AuthContext'
import { useAlerts } from '../hooks/useAlerts'

import AlertRuleModal from '../components/AlertRuleModal'

const severityOptions = [
  {
    label: 'All severities',
    value: 'all',
  },
  {
    label: 'Critical',
    value: 'critical',
  },
  {
    label: 'High',
    value: 'high',
  },
  {
    label: 'Medium',
    value: 'medium',
  },
  {
    label: 'Low',
    value: 'low',
  },
]

const historyStatusOptions = [
  {
    label: 'All statuses',
    value: 'all',
  },
  {
    label: 'Open',
    value: 'open',
  },
  {
    label: 'Acknowledged',
    value: 'acknowledged',
  },
  {
    label: 'Resolved',
    value: 'resolved',
  },
]

function Alerts() {
  const {
    theme,
    isSidebarCollapsed,
  } = useWorkspace()

  const darkMode = theme === 'dark'

  const {
    profile,
  } = useAuth()

  const {
    rules: ruleRecords,
    history: historyRecords,
    loading,
    saving,
    error,
    addRule,
    editRule,
    toggleRule,
    removeRule,
    changeAlertStatus,
    removeAlert,
  } = useAlerts()

  const [activeTab, setActiveTab] =
    useState('history')

  const [query, setQuery] =
    useState('')

  const [
    severityFilter,
    setSeverityFilter,
  ] = useState('all')

  const [
    historyStatusFilter,
    setHistoryStatusFilter,
  ] = useState('all')

  const [
    selectedRule,
    setSelectedRule,
  ] = useState(null)

  const [
    isRuleModalOpen,
    setIsRuleModalOpen,
  ] = useState(false)

  const [openMenuId, setOpenMenuId] =
    useState(null)

  const [message, setMessage] =
    useState('')

  const filteredHistory = useMemo(() => {
    const normalizedQuery =
      query.trim().toLowerCase()

    return historyRecords.filter(
      (alert) => {
        const matchesQuery =
          !normalizedQuery ||
          [
            alert.id,
            alert.title,
            alert.message,
            alert.source_type,
            alert.source_id,
            alert.channel,
            alert.severity,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(normalizedQuery)

        const matchesSeverity =
          severityFilter === 'all' ||
          alert.severity ===
            severityFilter

        const matchesStatus =
          historyStatusFilter ===
            'all' ||
          alert.status ===
            historyStatusFilter

        return (
          matchesQuery &&
          matchesSeverity &&
          matchesStatus
        )
      },
    )
  }, [
    historyRecords,
    query,
    severityFilter,
    historyStatusFilter,
  ])

  const filteredRules = useMemo(() => {
    const normalizedQuery =
      query.trim().toLowerCase()

    return ruleRecords.filter(
      (rule) => {
        const matchesQuery =
          !normalizedQuery ||
          [
            rule.id,
            rule.name,
            rule.description,
            rule.trigger_condition,
            rule.channel,
            rule.recipient,
            rule.severity,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(normalizedQuery)

        const matchesSeverity =
          severityFilter === 'all' ||
          rule.severity ===
            severityFilter

        return (
          matchesQuery &&
          matchesSeverity
        )
      },
    )
  }, [
    ruleRecords,
    query,
    severityFilter,
  ])

  const openCount =
    historyRecords.filter(
      (alert) =>
        alert.status === 'open',
    ).length

  const criticalCount =
    historyRecords.filter(
      (alert) =>
        alert.severity ===
          'critical' &&
        alert.status !== 'resolved',
    ).length

  const enabledRuleCount =
    ruleRecords.filter(
      (rule) =>
        rule.status === 'enabled',
    ).length

  function showMessage(nextMessage) {
    setMessage(nextMessage)

    window.setTimeout(() => {
      setMessage('')
    }, 3000)
  }

  function openCreateRule() {
    setSelectedRule(null)
    setIsRuleModalOpen(true)
    setOpenMenuId(null)
  }

  function openEditRule(rule) {
    setSelectedRule(rule)
    setIsRuleModalOpen(true)
    setOpenMenuId(null)
  }

  function closeRuleModal() {
    if (saving) {
      return
    }

    setSelectedRule(null)
    setIsRuleModalOpen(false)
  }

  async function saveRule(formData) {
    try {
      if (selectedRule) {
        await editRule({
          rule: selectedRule,
          formData,
        })

        showMessage(
          'Alert rule updated successfully.',
        )
      } else {
        await addRule(formData)

        showMessage(
          'Alert rule created successfully.',
        )
      }

      setSelectedRule(null)
      setIsRuleModalOpen(false)
    } catch (saveError) {
      console.error(
        'Unable to save alert rule:',
        saveError,
      )

      showMessage(
        'Unable to save alert rule.',
      )
    }
  }

  async function handleToggleRule(
    rule,
  ) {
    try {
      const updated =
        await toggleRule(rule)

      setOpenMenuId(null)

      showMessage(
        updated.status === 'enabled'
          ? 'Alert rule enabled.'
          : 'Alert rule disabled.',
      )
    } catch {
      showMessage(
        'Unable to update alert rule.',
      )
    }
  }

  async function deleteRule(rule) {
    const confirmed = window.confirm(
      `Delete "${rule.name}"?`,
    )

    if (!confirmed) {
      return
    }

    try {
      await removeRule(rule)

      setOpenMenuId(null)

      showMessage(
        'Alert rule deleted.',
      )
    } catch {
      showMessage(
        'Unable to delete alert rule.',
      )
    }
  }

  async function updateAlertStatus(
    alert,
    nextStatus,
  ) {
    try {
      const updated =
        await changeAlertStatus(
          alert,
          nextStatus,
        )

      showMessage(
        updated.status ===
          'acknowledged'
          ? 'Alert acknowledged.'
          : updated.status ===
              'resolved'
            ? 'Alert resolved.'
            : 'Alert reopened.',
      )
    } catch {
      showMessage(
        'Unable to update alert.',
      )
    }
  }

  async function deleteAlert(alert) {
    const confirmed = window.confirm(
      `Delete alert "${alert.title}"?`,
    )

    if (!confirmed) {
      return
    }

    try {
      await removeAlert(alert)

      showMessage(
        'Alert deleted.',
      )
    } catch {
      showMessage(
        'Unable to delete alert.',
      )
    }
  }

  function clearFilters() {
    setQuery('')
    setSeverityFilter('all')
    setHistoryStatusFilter('all')
  }

  return (
    <>
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
        <div className="mx-auto max-w-[1700px] p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-500">
                Failure monitoring
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em]">
                Alerts
              </h2>

              <p
                className={`mt-3 max-w-2xl text-sm leading-7 ${
                  darkMode
                    ? 'text-slate-400'
                    : 'text-slate-500'
                }`}
              >
                Monitor automation failures,
                acknowledge incidents and
                configure notification rules.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateRule}
              disabled={saving}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={17} />
              New alert rule
            </button>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Total alerts"
              value={historyRecords.length}
              darkMode={darkMode}
            />

            <SummaryCard
              label="Open alerts"
              value={openCount}
              darkMode={darkMode}
              tone="warning"
            />

            <SummaryCard
              label="Critical"
              value={criticalCount}
              darkMode={darkMode}
              tone="danger"
            />

            <SummaryCard
              label="Enabled rules"
              value={enabledRuleCount}
              darkMode={darkMode}
              tone="success"
            />
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

          <section
            className={`mt-5 overflow-hidden rounded-2xl border ${
              darkMode
                ? 'border-slate-700 bg-slate-800'
                : 'border-slate-200 bg-white'
            }`}
          >
            <div className="flex flex-col gap-4 border-b border-inherit p-4">
              <div className="flex gap-2">
                <TabButton
                  label="Alert history"
                  active={
                    activeTab === 'history'
                  }
                  onClick={() =>
                    setActiveTab('history')
                  }
                  darkMode={darkMode}
                />

                <TabButton
                  label="Alert rules"
                  active={
                    activeTab === 'rules'
                  }
                  onClick={() =>
                    setActiveTab('rules')
                  }
                  darkMode={darkMode}
                />
              </div>

              <div className="flex flex-col gap-3 xl:flex-row">
                <label
                  className={`flex min-h-[44px] flex-1 items-center gap-3 rounded-xl border px-4 ${
                    darkMode
                      ? 'border-slate-700 bg-slate-900'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <Search
                    size={16}
                    className={
                      darkMode
                        ? 'text-slate-500'
                        : 'text-slate-400'
                    }
                  />

                  <input
                    type="search"
                    value={query}
                    onChange={(event) =>
                      setQuery(
                        event.target.value,
                      )
                    }
                    placeholder={
                      activeTab ===
                      'history'
                        ? 'Search alerts, sources or channels'
                        : 'Search rules, triggers or recipients'
                    }
                    className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                  />
                </label>

                <div className="grid gap-3 sm:grid-cols-2 xl:flex">
                  <FilterSelect
                    value={severityFilter}
                    onChange={
                      setSeverityFilter
                    }
                    options={
                      severityOptions
                    }
                    darkMode={darkMode}
                  />

                  {activeTab ===
                    'history' && (
                    <FilterSelect
                      value={
                        historyStatusFilter
                      }
                      onChange={
                        setHistoryStatusFilter
                      }
                      options={
                        historyStatusOptions
                      }
                      darkMode={darkMode}
                    />
                  )}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-[360px] items-center justify-center">
                <div className="text-center">
                  <LoaderCircle
                    size={28}
                    className="mx-auto animate-spin text-indigo-500"
                  />

                  <p
                    className={`mt-3 text-sm ${
                      darkMode
                        ? 'text-slate-400'
                        : 'text-slate-500'
                    }`}
                  >
                    Loading alerts...
                  </p>
                </div>
              </div>
            ) : activeTab ===
              'history' ? (
              <AlertHistoryList
                alerts={filteredHistory}
                profile={profile}
                darkMode={darkMode}
                saving={saving}
                onUpdateStatus={
                  updateAlertStatus
                }
                onDelete={deleteAlert}
                onClearFilters={
                  clearFilters
                }
              />
            ) : (
              <AlertRulesList
                rules={filteredRules}
                profile={profile}
                darkMode={darkMode}
                saving={saving}
                openMenuId={openMenuId}
                onToggleMenu={
                  setOpenMenuId
                }
                onEdit={openEditRule}
                onToggle={
                  handleToggleRule
                }
                onDelete={deleteRule}
                onClearFilters={
                  clearFilters
                }
              />
            )}
          </section>
        </div>
      </main>

      <AlertRuleModal
        isOpen={isRuleModalOpen}
        rule={
          selectedRule
            ? normalizeRuleForModal(
                selectedRule,
              )
            : null
        }
        darkMode={darkMode}
        saving={saving}
        onClose={closeRuleModal}
        onSave={saveRule}
      />
    </>
  )
}

function AlertHistoryList({
  alerts,
  profile,
  darkMode,
  saving,
  onUpdateStatus,
  onDelete,
  onClearFilters,
}) {
  if (alerts.length === 0) {
    return (
      <EmptyState
        darkMode={darkMode}
        title="No alerts found"
        description="No alert history matches the current filters."
        onClearFilters={
          onClearFilters
        }
      />
    )
  }

  return (
    <div className="divide-y divide-inherit">
      {alerts.map((alert) => (
        <article
          key={alert.id}
          className="p-5"
        >
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
            <div className="flex min-w-0 items-start gap-4">
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${getSeverityIconStyle(
                  alert.severity,
                )}`}
              >
                <AlertTriangle
                  size={19}
                />
              </span>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <SeverityBadge
                    severity={
                      alert.severity
                    }
                  />

                  <AlertStatusBadge
                    status={
                      alert.status
                    }
                  />

                  <ChannelBadge
                    channel={
                      alert.channel
                    }
                  />
                </div>

                <h3 className="mt-3 text-sm font-semibold">
                  {alert.title}
                </h3>

                <p
                  className={`mt-2 max-w-3xl text-sm leading-7 ${
                    darkMode
                      ? 'text-slate-400'
                      : 'text-slate-500'
                  }`}
                >
                  {alert.message}
                </p>

                <p
                  className={`mt-3 text-xs ${
                    darkMode
                      ? 'text-slate-500'
                      : 'text-slate-400'
                  }`}
                >
                  {shortId(alert.id)}
                  {' · '}
                  {formatSource(alert)}
                  {' · '}
                  {formatDate(
                    alert.created_at,
                  )}
                </p>

                {alert.acknowledged_by && (
                  <p
                    className={`mt-2 text-xs ${
                      darkMode
                        ? 'text-slate-500'
                        : 'text-slate-400'
                    }`}
                  >
                    Updated by{' '}
                    {alert.acknowledged_by ===
                    profile?.id
                      ? profile?.full_name ||
                        'You'
                      : 'Workspace member'}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 lg:justify-end">
              {alert.status ===
                'open' && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    onUpdateStatus(
                      alert,
                      'acknowledged',
                    )
                  }
                  className={`inline-flex min-h-[38px] items-center gap-2 rounded-xl border px-3 text-xs font-semibold disabled:opacity-50 ${
                    darkMode
                      ? 'border-slate-700 hover:bg-slate-900'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Check size={14} />
                  Acknowledge
                </button>
              )}

              {alert.status !==
                'resolved' && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    onUpdateStatus(
                      alert,
                      'resolved',
                    )
                  }
                  className="min-h-[38px] rounded-xl bg-indigo-600 px-3 text-xs font-semibold text-white disabled:opacity-50"
                >
                  Resolve
                </button>
              )}

              {alert.status ===
                'resolved' && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    onUpdateStatus(
                      alert,
                      'open',
                    )
                  }
                  className={`min-h-[38px] rounded-xl border px-3 text-xs font-semibold disabled:opacity-50 ${
                    darkMode
                      ? 'border-slate-700 hover:bg-slate-900'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Reopen
                </button>
              )}

              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  onDelete(alert)
                }
                className="flex h-[38px] w-[38px] items-center justify-center rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 disabled:opacity-50"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

function AlertRulesList({
  rules,
  profile,
  darkMode,
  saving,
  openMenuId,
  onToggleMenu,
  onEdit,
  onToggle,
  onDelete,
  onClearFilters,
}) {
  if (rules.length === 0) {
    return (
      <EmptyState
        darkMode={darkMode}
        title="No alert rules found"
        description="Create an alert rule or adjust your current filters."
        onClearFilters={
          onClearFilters
        }
      />
    )
  }

  return (
    <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-2">
      {rules.map((rule) => (
        <article
          key={rule.id}
          className={`relative rounded-2xl border p-5 ${
            darkMode
              ? 'border-slate-700 bg-slate-900/40'
              : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                <BellRing size={18} />
              </span>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {rule.name}
                </p>

                <p
                  className={`mt-1 text-xs ${
                    darkMode
                      ? 'text-slate-500'
                      : 'text-slate-400'
                  }`}
                >
                  {shortId(rule.id)}
                  {' · '}
                  {rule.created_by ===
                  profile?.id
                    ? profile?.full_name ||
                      'You'
                    : 'Workspace member'}
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={saving}
              onClick={() =>
                onToggleMenu(
                  openMenuId === rule.id
                    ? null
                    : rule.id,
                )
              }
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border disabled:opacity-50 ${
                darkMode
                  ? 'border-slate-700 hover:bg-slate-900'
                  : 'border-slate-200 hover:bg-white'
              }`}
            >
              <MoreHorizontal
                size={17}
              />
            </button>

            {openMenuId ===
              rule.id && (
              <RuleActions
                rule={rule}
                darkMode={darkMode}
                saving={saving}
                onEdit={() =>
                  onEdit(rule)
                }
                onToggle={() =>
                  onToggle(rule)
                }
                onDelete={() =>
                  onDelete(rule)
                }
              />
            )}
          </div>

          <p
            className={`mt-5 text-sm leading-7 ${
              darkMode
                ? 'text-slate-400'
                : 'text-slate-500'
            }`}
          >
            {rule.description ||
              'No description provided.'}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <SeverityBadge
              severity={rule.severity}
            />

            <RuleStatusBadge
              status={rule.status}
            />

            <ChannelBadge
              channel={rule.channel}
            />
          </div>

          <div className="mt-5 space-y-3">
            <DetailRow
              label="Trigger"
              value={
                rule.trigger_condition
              }
              darkMode={darkMode}
            />

            <DetailRow
              label="Recipient"
              value={rule.recipient}
              darkMode={darkMode}
            />

            <DetailRow
              label="Last triggered"
              value={
                rule.last_triggered_at
                  ? formatDate(
                      rule.last_triggered_at,
                    )
                  : 'Never'
              }
              darkMode={darkMode}
            />

            <DetailRow
              label="Trigger count"
              value={
                rule.trigger_count || 0
              }
              darkMode={darkMode}
            />
          </div>
        </article>
      ))}
    </div>
  )
}

function RuleActions({
  rule,
  darkMode,
  saving,
  onEdit,
  onToggle,
  onDelete,
}) {
  return (
    <div
      className={`absolute right-5 top-16 z-30 w-52 overflow-hidden rounded-xl border p-1.5 shadow-xl ${
        darkMode
          ? 'border-slate-700 bg-slate-900'
          : 'border-slate-200 bg-white'
      }`}
    >
      <ActionButton
        icon={<Edit3 size={15} />}
        label="Edit rule"
        onClick={onEdit}
        darkMode={darkMode}
        disabled={saving}
      />

      <ActionButton
        icon={<BellRing size={15} />}
        label={
          rule.status === 'enabled'
            ? 'Disable rule'
            : 'Enable rule'
        }
        onClick={onToggle}
        darkMode={darkMode}
        disabled={saving}
      />

      <ActionButton
        icon={<Trash2 size={15} />}
        label="Delete rule"
        onClick={onDelete}
        darkMode={darkMode}
        destructive
        disabled={saving}
      />
    </div>
  )
}

function ChannelBadge({ channel }) {
  const icons = {
    Email: <Mail size={12} />,
    Slack: (
      <MessageSquare size={12} />
    ),
    Webhook: <Webhook size={12} />,
    'In-app': (
      <BellRing size={12} />
    ),
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
      {icons[channel] || (
        <BellRing size={12} />
      )}
      {channel}
    </span>
  )
}

function SeverityBadge({
  severity,
}) {
  const normalized =
    String(
      severity || 'medium',
    ).toLowerCase()

  const styles = {
    critical:
      'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
    high:
      'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300',
    medium:
      'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
    low:
      'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${
        styles[normalized] ||
        styles.medium
      }`}
    >
      {capitalize(normalized)}
    </span>
  )
}

function AlertStatusBadge({
  status,
}) {
  const normalized =
    String(
      status || 'open',
    ).toLowerCase()

  const styles = {
    open:
      'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
    acknowledged:
      'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
    resolved:
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${
        styles[normalized] ||
        styles.open
      }`}
    >
      {capitalize(normalized)}
    </span>
  )
}

function RuleStatusBadge({
  status,
}) {
  const enabled =
    status === 'enabled'

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${
        enabled
          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
          : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
      }`}
    >
      {enabled
        ? 'Enabled'
        : 'Disabled'}
    </span>
  )
}

function getSeverityIconStyle(
  severity,
) {
  const normalized =
    String(
      severity || 'medium',
    ).toLowerCase()

  const styles = {
    critical:
      'bg-rose-500/10 text-rose-500',
    high:
      'bg-orange-500/10 text-orange-500',
    medium:
      'bg-amber-500/10 text-amber-500',
    low:
      'bg-blue-500/10 text-blue-500',
  }

  return (
    styles[normalized] ||
    styles.medium
  )
}

function DetailRow({
  label,
  value,
  darkMode,
}) {
  return (
    <div className="flex items-start justify-between gap-5">
      <span
        className={`text-xs ${
          darkMode
            ? 'text-slate-500'
            : 'text-slate-400'
        }`}
      >
        {label}
      </span>

      <span className="max-w-[65%] text-right text-xs font-semibold">
        {value}
      </span>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  darkMode,
  tone,
}) {
  const toneClass = {
    success: 'text-emerald-500',
    warning: 'text-amber-500',
    danger: 'text-rose-500',
  }[tone]

  return (
    <article
      className={`rounded-2xl border p-5 ${
        darkMode
          ? 'border-slate-700 bg-slate-800'
          : 'border-slate-200 bg-white'
      }`}
    >
      <p
        className={`text-xs ${
          darkMode
            ? 'text-slate-400'
            : 'text-slate-500'
        }`}
      >
        {label}
      </p>

      <p
        className={`mt-3 text-3xl font-bold tracking-[-0.04em] ${
          toneClass || ''
        }`}
      >
        {value}
      </p>
    </article>
  )
}

function TabButton({
  label,
  active,
  onClick,
  darkMode,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[40px] rounded-xl px-4 text-xs font-semibold ${
        active
          ? 'bg-indigo-600 text-white'
          : darkMode
            ? 'text-slate-400 hover:bg-slate-900'
            : 'text-slate-500 hover:bg-slate-100'
      }`}
    >
      {label}
    </button>
  )
}

function FilterSelect({
  value,
  onChange,
  options,
  darkMode,
}) {
  return (
    <select
      value={value}
      onChange={(event) =>
        onChange(event.target.value)
      }
      className={`min-h-[44px] rounded-xl border px-4 text-xs font-semibold outline-none ${
        darkMode
          ? 'border-slate-700 bg-slate-900'
          : 'border-slate-200 bg-white'
      }`}
    >
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
        >
          {option.label}
        </option>
      ))}
    </select>
  )
}

function ActionButton({
  icon,
  label,
  onClick,
  darkMode,
  destructive = false,
  disabled = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex min-h-[40px] w-full items-center gap-3 rounded-lg px-3 text-left text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50 ${
        destructive
          ? 'text-rose-500 hover:bg-rose-500/10'
          : darkMode
            ? 'text-slate-300 hover:bg-slate-800'
            : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

function EmptyState({
  darkMode,
  title,
  description,
  onClearFilters,
}) {
  return (
    <div className="flex min-h-[320px] items-center justify-center px-6">
      <div className="text-center">
        <Search
          size={28}
          className="mx-auto text-slate-400"
        />

        <h3 className="mt-4 text-lg font-semibold">
          {title}
        </h3>

        <p
          className={`mt-2 text-sm ${
            darkMode
              ? 'text-slate-500'
              : 'text-slate-400'
          }`}
        >
          {description}
        </p>

        <button
          type="button"
          onClick={onClearFilters}
          className="mt-5 rounded-xl border border-indigo-500/30 px-4 py-2.5 text-sm font-semibold text-indigo-500"
        >
          Clear filters
        </button>
      </div>
    </div>
  )
}

function normalizeRuleForModal(
  rule,
) {
  return {
    ...rule,
    trigger:
      rule.trigger_condition || '',
    severity: capitalize(
      rule.severity,
    ),
    status:
      rule.status === 'enabled'
        ? 'Enabled'
        : 'Disabled',
  }
}

function formatSource(alert) {
  if (
    alert.source_type &&
    alert.source_id
  ) {
    return `${alert.source_type}: ${alert.source_id}`
  }

  return (
    alert.source_type ||
    alert.source_id ||
    'Opsora'
  )
}

function formatDate(value) {
  if (!value) {
    return 'Unknown'
  }

  const date = new Date(value)

  if (
    Number.isNaN(date.getTime())
  ) {
    return 'Unknown'
  }

  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    },
  ).format(date)
}

function shortId(value) {
  if (!value) {
    return '—'
  }

  return value
    .replaceAll('-', '')
    .slice(0, 10)
    .toUpperCase()
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

export default Alerts
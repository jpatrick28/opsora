import {
  useMemo,
  useState,
} from 'react'

import {
  CheckCircle2,
  Edit3,
  LoaderCircle,
  MoreHorizontal,
  Plug,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Unplug,
} from 'lucide-react'

import { useWorkspace } from '../context/WorkspaceContext'
import { useAuth } from '../context/AuthContext'
import { useConnections } from '../hooks/useConnections'

import ConnectionModal from '../components/ConnectionModal'
import StatusBadge from '../components/StatusBadge'

const categoryOptions = [
  {
    label: 'All categories',
    value: 'all',
  },
  {
    label: 'CRM',
    value: 'CRM',
  },
  {
    label: 'Automation',
    value: 'Automation',
  },
  {
    label: 'Payments',
    value: 'Payments',
  },
  {
    label: 'Data',
    value: 'Data',
  },
  {
    label: 'Communication',
    value: 'Communication',
  },
  {
    label: 'Scheduling',
    value: 'Scheduling',
  },
  {
    label: 'Marketing',
    value: 'Marketing',
  },
  {
    label: 'Other',
    value: 'Other',
  },
]

const statusOptions = [
  {
    label: 'All statuses',
    value: 'all',
  },
  {
    label: 'Connected',
    value: 'connected',
  },
  {
    label: 'Disconnected',
    value: 'disconnected',
  },
]

function Connections() {
  const {
    theme,
    isSidebarCollapsed,
  } = useWorkspace()

  const darkMode = theme === 'dark'

  const {
    profile,
  } = useAuth()

  const {
    connections: connectionRecords,
    loading,
    saving,
    error,
    addConnection,
    editConnection,
    toggleConnection,
    removeConnection,
  } = useConnections()

  const [query, setQuery] = useState('')

  const [
    categoryFilter,
    setCategoryFilter,
  ] = useState('all')

  const [
    statusFilter,
    setStatusFilter,
  ] = useState('all')

  const [
    selectedConnection,
    setSelectedConnection,
  ] = useState(null)

  const [
    isConnectionModalOpen,
    setIsConnectionModalOpen,
  ] = useState(false)

  const [openMenuId, setOpenMenuId] =
    useState(null)

  const [message, setMessage] =
    useState('')

  const filteredConnections = useMemo(() => {
    const normalizedQuery =
      query.trim().toLowerCase()

    return connectionRecords.filter(
      (connection) => {
        const matchesQuery =
          !normalizedQuery ||
          [
            connection.id,
            connection.name,
            connection.platform,
            connection.category,
            connection.account_name,
            connection.description,
            connection.auth_type,
            connection.status,
            connection.health,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(normalizedQuery)

        const matchesCategory =
          categoryFilter === 'all' ||
          connection.category ===
            categoryFilter

        const matchesStatus =
          statusFilter === 'all' ||
          connection.status ===
            statusFilter

        return (
          matchesQuery &&
          matchesCategory &&
          matchesStatus
        )
      },
    )
  }, [
    connectionRecords,
    query,
    categoryFilter,
    statusFilter,
  ])

  const connectedCount =
    connectionRecords.filter(
      (connection) =>
        connection.status ===
        'connected',
    ).length

  const warningCount =
    connectionRecords.filter(
      (connection) =>
        connection.health === 'warning',
    ).length

  const criticalCount =
    connectionRecords.filter(
      (connection) =>
        connection.health ===
        'critical',
    ).length

  function showMessage(nextMessage) {
    setMessage(nextMessage)

    window.setTimeout(() => {
      setMessage('')
    }, 3000)
  }

  function openCreateModal() {
    setSelectedConnection(null)
    setIsConnectionModalOpen(true)
    setOpenMenuId(null)
  }

  function openEditModal(connection) {
    setSelectedConnection(connection)
    setIsConnectionModalOpen(true)
    setOpenMenuId(null)
  }

  function closeConnectionModal() {
    if (saving) {
      return
    }

    setIsConnectionModalOpen(false)
    setSelectedConnection(null)
  }

  async function saveConnection(
    formData,
  ) {
    try {
      const normalizedForm = {
        ...formData,
        ownerId: profile?.id,
      }

      if (selectedConnection) {
        await editConnection({
          connection:
            selectedConnection,
          formData: normalizedForm,
        })

        showMessage(
          'Connection updated successfully.',
        )
      } else {
        await addConnection(
          normalizedForm,
        )

        showMessage(
          'Connection added successfully.',
        )
      }

      setIsConnectionModalOpen(false)
      setSelectedConnection(null)
    } catch (saveError) {
      console.error(
        'Unable to save connection:',
        saveError,
      )

      showMessage(
        'Unable to save the connection.',
      )
    }
  }

  async function handleToggleConnection(
    connection,
  ) {
    try {
      const updated =
        await toggleConnection(
          connection,
        )

      setOpenMenuId(null)

      showMessage(
        updated.status === 'connected'
          ? 'Connection restored.'
          : 'Connection disconnected.',
      )
    } catch (toggleError) {
      console.error(
        'Unable to update connection:',
        toggleError,
      )

      showMessage(
        'Unable to update connection status.',
      )
    }
  }

  async function deleteConnection(
    connection,
  ) {
    const confirmed = window.confirm(
      `Delete "${connection.name}"? Connected automations may stop working.`,
    )

    if (!confirmed) {
      return
    }

    try {
      await removeConnection(
        connection,
      )

      setOpenMenuId(null)

      showMessage(
        'Connection deleted.',
      )
    } catch (deleteError) {
      console.error(
        'Unable to delete connection:',
        deleteError,
      )

      showMessage(
        'Unable to delete connection.',
      )
    }
  }

  function clearFilters() {
    setQuery('')
    setCategoryFilter('all')
    setStatusFilter('all')
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
                Integrated services
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em]">
                Connections
              </h2>

              <p
                className={`mt-3 max-w-2xl text-sm leading-7 ${
                  darkMode
                    ? 'text-slate-400'
                    : 'text-slate-500'
                }`}
              >
                Manage platform connections,
                authentication metadata,
                ownership and service health.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              disabled={saving}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={17} />
              Add connection
            </button>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Total connections"
              value={connectionRecords.length}
              darkMode={darkMode}
            />

            <SummaryCard
              label="Connected"
              value={connectedCount}
              darkMode={darkMode}
              tone="success"
            />

            <SummaryCard
              label="Warnings"
              value={warningCount}
              darkMode={darkMode}
              tone="warning"
            />

            <SummaryCard
              label="Critical"
              value={criticalCount}
              darkMode={darkMode}
              tone="danger"
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
            className={`mt-5 rounded-2xl border ${
              darkMode
                ? 'border-slate-700 bg-slate-800'
                : 'border-slate-200 bg-white'
            }`}
          >
            <div className="flex flex-col gap-3 border-b border-inherit p-4 xl:flex-row xl:items-center">
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
                  placeholder="Search platforms, accounts or authentication types"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2 xl:flex">
                <FilterSelect
                  value={categoryFilter}
                  onChange={
                    setCategoryFilter
                  }
                  options={categoryOptions}
                  darkMode={darkMode}
                />

                <FilterSelect
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={statusOptions}
                  darkMode={darkMode}
                />
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-[380px] items-center justify-center">
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
                    Loading connections...
                  </p>
                </div>
              </div>
            ) : (
              <>
                {filteredConnections.length >
                0 ? (
                  <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-2 2xl:grid-cols-3">
                    {filteredConnections.map(
                      (connection) => (
                        <ConnectionCard
                          key={
                            connection.id
                          }
                          connection={
                            connection
                          }
                          profile={
                            profile
                          }
                          darkMode={
                            darkMode
                          }
                          saving={
                            saving
                          }
                          isMenuOpen={
                            openMenuId ===
                            connection.id
                          }
                          onToggleMenu={() =>
                            setOpenMenuId(
                              (current) =>
                                current ===
                                connection.id
                                  ? null
                                  : connection.id,
                            )
                          }
                          onEdit={() =>
                            openEditModal(
                              connection,
                            )
                          }
                          onToggle={() =>
                            handleToggleConnection(
                              connection,
                            )
                          }
                          onDelete={() =>
                            deleteConnection(
                              connection,
                            )
                          }
                        />
                      ),
                    )}
                  </div>
                ) : (
                  <div className="flex min-h-[320px] items-center justify-center px-6">
                    <div className="text-center">
                      <Search
                        size={28}
                        className="mx-auto text-slate-400"
                      />

                      <h3 className="mt-4 text-lg font-semibold">
                        No connections found
                      </h3>

                      <p
                        className={`mt-2 max-w-sm text-sm ${
                          darkMode
                            ? 'text-slate-500'
                            : 'text-slate-400'
                        }`}
                      >
                        {connectionRecords.length ===
                        0
                          ? 'Add your first service connection to start tracking integration health.'
                          : 'Adjust the search or filter selections.'}
                      </p>

                      {connectionRecords.length ===
                      0 ? (
                        <button
                          type="button"
                          onClick={
                            openCreateModal
                          }
                          className="mt-5 inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white"
                        >
                          <Plus
                            size={15}
                          />
                          Add connection
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={
                            clearFilters
                          }
                          className="mt-5 rounded-xl border border-indigo-500/30 px-4 py-2.5 text-sm font-semibold text-indigo-500"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <footer className="flex flex-col justify-between gap-3 border-t border-inherit px-5 py-4 sm:flex-row sm:items-center">
                  <p
                    className={`text-xs ${
                      darkMode
                        ? 'text-slate-500'
                        : 'text-slate-400'
                    }`}
                  >
                    Showing{' '}
                    {
                      filteredConnections.length
                    }{' '}
                    of{' '}
                    {
                      connectionRecords.length
                    }{' '}
                    connections
                  </p>

                  <p
                    className={`text-xs ${
                      darkMode
                        ? 'text-slate-500'
                        : 'text-slate-400'
                    }`}
                  >
                    Connection metadata is saved
                    to Supabase.
                  </p>
                </footer>
              </>
            )}
          </section>
        </div>
      </main>

      <ConnectionModal
        isOpen={isConnectionModalOpen}
        connection={
          selectedConnection
            ? normalizeConnectionForModal(
                selectedConnection,
              )
            : null
        }
        darkMode={darkMode}
        saving={saving}
        onClose={closeConnectionModal}
        onSave={saveConnection}
      />
    </>
  )
}

function ConnectionCard({
  connection,
  profile,
  darkMode,
  saving,
  isMenuOpen,
  onToggleMenu,
  onEdit,
  onToggle,
  onDelete,
}) {
  const connected =
    connection.status === 'connected'

  return (
    <article
      className={`relative rounded-2xl border p-5 ${
        darkMode
          ? 'border-slate-700 bg-slate-900/40'
          : 'border-slate-200 bg-slate-50'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              connected
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
                : 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
            }`}
          >
            {connected ? (
              <Plug size={19} />
            ) : (
              <Unplug size={19} />
            )}
          </span>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {connection.name}
            </p>

            <p
              className={`mt-1 text-xs ${
                darkMode
                  ? 'text-slate-500'
                  : 'text-slate-400'
              }`}
            >
              {connection.platform}
              {' · '}
              {connection.category}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleMenu}
          disabled={saving}
          aria-label={`Open actions for ${connection.name}`}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border disabled:cursor-not-allowed disabled:opacity-50 ${
            darkMode
              ? 'border-slate-700 hover:bg-slate-900'
              : 'border-slate-200 hover:bg-white'
          }`}
        >
          <MoreHorizontal size={17} />
        </button>

        {isMenuOpen && (
          <ConnectionActions
            connection={connection}
            darkMode={darkMode}
            saving={saving}
            onEdit={onEdit}
            onToggle={onToggle}
            onDelete={onDelete}
          />
        )}
      </div>

      <p
        className={`mt-5 min-h-[56px] text-sm leading-7 ${
          darkMode
            ? 'text-slate-400'
            : 'text-slate-500'
        }`}
      >
        {connection.description ||
          'No description provided.'}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <ConnectionStatusBadge
          status={connection.status}
        />

        <StatusBadge
          status={connection.health}
        />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <DetailBox
          label="Account"
          value={
            connection.account_name ||
            'Not specified'
          }
          darkMode={darkMode}
        />

        <DetailBox
          label="Owner"
          value={getOwnerLabel(
            connection,
            profile,
          )}
          darkMode={darkMode}
        />

        <DetailBox
          label="Authentication"
          value={
            connection.auth_type ||
            'Unknown'
          }
          darkMode={darkMode}
        />

        <DetailBox
          label="Automations"
          value={Number(
            connection.automation_count ||
              0,
          ).toLocaleString()}
          darkMode={darkMode}
        />
      </div>

      <div className="mt-5 flex items-center justify-between gap-4 border-t border-inherit pt-4">
        <div>
          <p
            className={`text-[9px] font-semibold uppercase tracking-[0.14em] ${
              darkMode
                ? 'text-slate-600'
                : 'text-slate-400'
            }`}
          >
            Last checked
          </p>

          <p className="mt-1 text-xs font-medium">
            {formatDate(
              connection.last_checked_at,
            )}
          </p>
        </div>

        {connected ? (
          <CheckCircle2
            size={18}
            className="text-emerald-500"
          />
        ) : (
          <button
            type="button"
            onClick={onToggle}
            disabled={saving}
            className="inline-flex min-h-[38px] items-center gap-2 rounded-xl bg-indigo-600 px-3 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={14} />
            Reconnect
          </button>
        )}
      </div>
    </article>
  )
}

function ConnectionActions({
  connection,
  darkMode,
  saving,
  onEdit,
  onToggle,
  onDelete,
}) {
  const connected =
    connection.status === 'connected'

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
        label="Edit connection"
        onClick={onEdit}
        darkMode={darkMode}
        disabled={saving}
      />

      <ActionButton
        icon={
          connected ? (
            <Unplug size={15} />
          ) : (
            <RefreshCw size={15} />
          )
        }
        label={
          connected
            ? 'Disconnect'
            : 'Reconnect'
        }
        onClick={onToggle}
        darkMode={darkMode}
        disabled={saving}
      />

      <ActionButton
        icon={<Trash2 size={15} />}
        label="Delete connection"
        onClick={onDelete}
        darkMode={darkMode}
        destructive
        disabled={saving}
      />
    </div>
  )
}

function DetailBox({
  label,
  value,
  darkMode,
}) {
  return (
    <div
      className={`min-w-0 rounded-xl border p-3 ${
        darkMode
          ? 'border-slate-700 bg-slate-900/60'
          : 'border-slate-200 bg-white'
      }`}
    >
      <p
        className={`text-[9px] font-semibold uppercase tracking-[0.12em] ${
          darkMode
            ? 'text-slate-600'
            : 'text-slate-400'
        }`}
      >
        {label}
      </p>

      <p className="mt-2 truncate text-xs font-semibold">
        {value}
      </p>
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

function ConnectionStatusBadge({
  status,
}) {
  const connected =
    status === 'connected'

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${
        connected
          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300'
          : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
      }`}
    >
      {connected
        ? 'Connected'
        : 'Disconnected'}
    </span>
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
      className={`flex min-h-[40px] w-full items-center gap-3 rounded-lg px-3 text-left text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
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

function normalizeConnectionForModal(
  connection,
) {
  return {
    ...connection,
    account:
      connection.account_name || '',
    owner:
      connection.owner_id || '',
    ownerId:
      connection.owner_id || '',
    authType:
      connection.auth_type || '',
    automations:
      connection.automation_count || 0,
    lastChecked:
      connection.last_checked_at,
    lastConnected:
      connection.last_connected_at,
    status: capitalize(
      connection.status,
    ),
    health: capitalize(
      connection.health,
    ),
  }
}

function getOwnerLabel(
  connection,
  profile,
) {
  if (
    connection.owner_id &&
    connection.owner_id === profile?.id
  ) {
    return (
      profile?.full_name ||
      'You'
    )
  }

  if (connection.owner_id) {
    return 'Workspace member'
  }

  return 'Unassigned'
}

function formatDate(value) {
  if (!value) {
    return 'Never'
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
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    },
  ).format(date)
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

export default Connections
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { createPortal } from 'react-dom'
import {
  Copy,
  Edit3,
  LoaderCircle,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Search,
  Trash2,
  Workflow,
  Zap,
} from 'lucide-react'

import { useWorkspace } from '../context/WorkspaceContext'
import { useAuth } from '../context/AuthContext'
import { useAutomations } from '../hooks/useAutomations'

import AutomationModal from '../components/AutomationModal'
import StatusBadge from '../components/StatusBadge'

const statusOptions = [
  {
    label: 'All statuses',
    value: 'all',
  },
  {
    label: 'Active',
    value: 'active',
  },
  {
    label: 'Paused',
    value: 'paused',
  },
  {
    label: 'Draft',
    value: 'draft',
  },
]

const healthOptions = [
  {
    label: 'All health states',
    value: 'all',
  },
  {
    label: 'Healthy',
    value: 'healthy',
  },
  {
    label: 'Warning',
    value: 'warning',
  },
  {
    label: 'Critical',
    value: 'critical',
  },
  {
    label: 'Paused',
    value: 'paused',
  },
  {
    label: 'Draft',
    value: 'draft',
  },
]

function Automations() {
  const {
    theme,
    isSidebarCollapsed,
  } = useWorkspace()

  const darkMode = theme === 'dark'

  const {
    profile,
  } = useAuth()

  const {
    automations: automationRecords,
    loading,
    saving,
    runningAutomationId,
    error,
    addAutomation,
    editAutomation,
    changeStatus,
    duplicate,
    remove,
    runNow,
  } = useAutomations()

  const [query, setQuery] = useState('')

  const [
    statusFilter,
    setStatusFilter,
  ] = useState('all')

  const [
    healthFilter,
    setHealthFilter,
  ] = useState('all')

  const [
    selectedAutomation,
    setSelectedAutomation,
  ] = useState(null)

  const [
    isAutomationModalOpen,
    setIsAutomationModalOpen,
  ] = useState(false)

  const [openMenuId, setOpenMenuId] =
    useState(null)

  const [
    menuPosition,
    setMenuPosition,
  ] = useState(null)

  const [message, setMessage] =
    useState('')

  const filteredAutomations = useMemo(() => {
    const normalizedQuery =
      query.trim().toLowerCase()

    return automationRecords.filter(
      (automation) => {
        const matchesQuery =
          !normalizedQuery ||
          [
            automation.id,
            automation.name,
            automation.description,
            automation.platform,
            automation.trigger_name,
            automation.owner_name,
            automation.status,
            automation.health,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(normalizedQuery)

        const matchesStatus =
          statusFilter === 'all' ||
          automation.status ===
          statusFilter

        const matchesHealth =
          healthFilter === 'all' ||
          automation.health ===
          healthFilter

        return (
          matchesQuery &&
          matchesStatus &&
          matchesHealth
        )
      },
    )
  }, [
    automationRecords,
    query,
    statusFilter,
    healthFilter,
  ])

  const activeCount =
    automationRecords.filter(
      (automation) =>
        automation.status === 'active',
    ).length

  const warningCount =
    automationRecords.filter(
      (automation) =>
        ['warning', 'critical'].includes(
          automation.health,
        ),
    ).length

  function showMessage(nextMessage) {
    setMessage(nextMessage)

    window.setTimeout(() => {
      setMessage('')
    }, 3000)
  }

  function openCreateModal() {
    setSelectedAutomation(null)
    setIsAutomationModalOpen(true)
    setOpenMenuId(null)
  }

  function openEditModal(automation) {
    setSelectedAutomation(automation)
    setIsAutomationModalOpen(true)
    setOpenMenuId(null)
  }

  function closeAutomationModal() {
    if (saving) {
      return
    }

    setIsAutomationModalOpen(false)
    setSelectedAutomation(null)
  }

  async function saveAutomation(
    formData,
  ) {
    try {
      const normalizedForm = {
        ...formData,
        ownerId: profile?.id,
      }

      if (selectedAutomation) {
        await editAutomation({
          automation:
            selectedAutomation,
          formData: normalizedForm,
        })

        showMessage(
          'Automation updated successfully.',
        )
      } else {
        await addAutomation(
          normalizedForm,
        )

        showMessage(
          'Automation created successfully.',
        )
      }

      setIsAutomationModalOpen(false)
      setSelectedAutomation(null)
    } catch (saveError) {
      console.error(
        'Unable to save automation:',
        saveError,
      )

      showMessage(
        'Unable to save the automation.',
      )
    }
  }

  async function toggleAutomationStatus(
    automation,
  ) {
    try {
      const updated =
        await changeStatus(automation)

      setOpenMenuId(null)

      showMessage(
        updated.status === 'active'
          ? 'Automation activated.'
          : 'Automation paused.',
      )
    } catch (statusError) {
      console.error(
        'Unable to update automation status:',
        statusError,
      )

      showMessage(
        'Unable to update automation status.',
      )
    }
  }

  async function duplicateAutomation(
    automation,
  ) {
    try {
      await duplicate(automation)

      setOpenMenuId(null)

      showMessage(
        'Automation duplicated.',
      )
    } catch (duplicateError) {
      console.error(
        'Unable to duplicate automation:',
        duplicateError,
      )

      showMessage(
        'Unable to duplicate automation.',
      )
    }
  }

  async function deleteAutomation(
    automation,
  ) {
    const confirmed = window.confirm(
      `Delete "${automation.name}"? This action cannot be undone.`,
    )

    if (!confirmed) {
      return
    }

    try {
      await remove(automation)

      setOpenMenuId(null)

      showMessage(
        'Automation deleted.',
      )
    } catch (deleteError) {
      console.error(
        'Unable to delete automation:',
        deleteError,
      )

      showMessage(
        'Unable to delete automation.',
      )
    }
  }

  async function handleRunNow(
    automation,
  ) {
    setOpenMenuId(null)

    try {
      showMessage(
        `Running "${automation.name}"...`,
      )

      const result =
        await runNow(automation)

      showMessage(
        result.run.status ===
          'successful'
          ? 'Automation completed successfully.'
          : 'Automation run failed. Check Execution Logs.',
      )
    } catch (runError) {
      showMessage(
        runError.message ||
        'Unable to run automation.',
      )
    }
  }

  function clearFilters() {
    setQuery('')
    setStatusFilter('all')
    setHealthFilter('all')
  }

  return (
    <>
      <main
        className={`min-h-screen pt-[72px] transition-[padding] duration-300 ${isSidebarCollapsed
          ? 'lg:pl-[82px]'
          : 'lg:pl-[260px]'
          } ${darkMode
            ? 'bg-[#111827] text-white'
            : 'bg-[#f4f6f8] text-slate-900'
          }`}
      >
        <div className="mx-auto max-w-[1700px] p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-500">
                Workflow management
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em]">
                Automations
              </h2>

              <p
                className={`mt-3 max-w-2xl text-sm leading-7 ${darkMode
                  ? 'text-slate-400'
                  : 'text-slate-500'
                  }`}
              >
                Create, monitor and manage the
                workflows running across your
                connected business platforms.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              disabled={saving}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus size={17} />
              New automation
            </button>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            <SummaryCard
              label="Total automations"
              value={automationRecords.length}
              darkMode={darkMode}
            />

            <SummaryCard
              label="Active"
              value={activeCount}
              darkMode={darkMode}
            />

            <SummaryCard
              label="Needs attention"
              value={warningCount}
              darkMode={darkMode}
              warning
            />
          </div>

          {message && (
            <div
              role="status"
              className={`mt-5 rounded-xl border px-4 py-3 text-sm ${darkMode
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
            className={`mt-5 rounded-2xl border ${darkMode
              ? 'border-slate-700 bg-slate-800'
              : 'border-slate-200 bg-white'
              }`}
          >
            <div className="flex flex-col gap-3 border-b border-inherit p-4 xl:flex-row xl:items-center">
              <label
                className={`flex min-h-[44px] flex-1 items-center gap-3 rounded-xl border px-4 ${darkMode
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
                  placeholder="Search automations, owners or platforms"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2 xl:flex">
                <FilterSelect
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={statusOptions}
                  darkMode={darkMode}
                />

                <FilterSelect
                  value={healthFilter}
                  onChange={setHealthFilter}
                  options={healthOptions}
                  darkMode={darkMode}
                />
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-[360px] items-center justify-center">
                <div className="text-center">
                  <LoaderCircle
                    size={26}
                    className="mx-auto animate-spin text-indigo-500"
                  />

                  <p
                    className={`mt-3 text-sm ${darkMode
                      ? 'text-slate-400'
                      : 'text-slate-500'
                      }`}
                  >
                    Loading automations...
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="opsora-scrollbar overflow-x-auto">
                  <table className="w-full min-w-[1120px] border-collapse">
                    <thead>
                      <tr
                        className={
                          darkMode
                            ? 'bg-slate-900/45 text-slate-500'
                            : 'bg-slate-50 text-slate-400'
                        }
                      >
                        <TableHeading>
                          Automation
                        </TableHeading>

                        <TableHeading>
                          Platform
                        </TableHeading>

                        <TableHeading>
                          Status
                        </TableHeading>

                        <TableHeading>
                          Health
                        </TableHeading>

                        <TableHeading>
                          Executions
                        </TableHeading>

                        <TableHeading>
                          Success rate
                        </TableHeading>

                        <TableHeading>
                          Owner
                        </TableHeading>

                        <TableHeading>
                          Last run
                        </TableHeading>

                        <TableHeading>
                          Actions
                        </TableHeading>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredAutomations.map(
                        (automation) => (
                          <tr
                            key={automation.id}
                            className="border-t border-inherit"
                          >
                            <td className="max-w-[330px] px-5 py-4">
                              <div className="flex items-start gap-3">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                                  <Workflow
                                    size={17}
                                  />
                                </span>

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold">
                                    {
                                      automation.name
                                    }
                                  </p>

                                  <p
                                    className={`mt-1 line-clamp-1 text-xs ${darkMode
                                      ? 'text-slate-500'
                                      : 'text-slate-400'
                                      }`}
                                  >
                                    {automation.description ||
                                      'No description provided.'}
                                  </p>

                                  <p
                                    className={`mt-1 text-[10px] ${darkMode
                                      ? 'text-slate-600'
                                      : 'text-slate-400'
                                      }`}
                                  >
                                    {
                                      automation.id
                                    }{' '}
                                    ·{' '}
                                    {
                                      automation.trigger_name
                                    }
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4 text-xs">
                              {
                                automation.platform
                              }
                            </td>

                            <td className="px-5 py-4">
                              <AutomationStatusBadge
                                status={
                                  automation.status
                                }
                              />
                            </td>

                            <td className="px-5 py-4">
                              <StatusBadge
                                status={
                                  automation.health
                                }
                              />
                            </td>

                            <td className="px-5 py-4 text-sm font-semibold">
                              {Number(
                                automation.execution_count ||
                                0,
                              ).toLocaleString()}
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`text-sm font-semibold ${Number(
                                  automation.success_rate,
                                ) < 90
                                  ? 'text-rose-500'
                                  : Number(
                                    automation.success_rate,
                                  ) < 95
                                    ? 'text-amber-500'
                                    : 'text-emerald-500'
                                  }`}
                              >
                                {Number(
                                  automation.success_rate ||
                                  0,
                                ).toFixed(1)}
                                %
                              </span>
                            </td>

                            <td className="px-5 py-4 text-xs">
                              {getOwnerLabel(
                                automation,
                                profile,
                              )}
                            </td>

                            <td
                              className={`px-5 py-4 text-xs ${darkMode
                                ? 'text-slate-500'
                                : 'text-slate-400'
                                }`}
                            >
                              {formatLastRun(
                                automation.last_run_at,
                              )}
                            </td>

                            <td className="px-5 py-4">
                              <button
                                type="button"
                                onClick={(event) => {
                                  const rect =
                                    event.currentTarget.getBoundingClientRect()

                                  if (
                                    openMenuId === automation.id
                                  ) {
                                    setOpenMenuId(null)
                                    setMenuPosition(null)
                                    return
                                  }

                                  setOpenMenuId(automation.id)

                                  setMenuPosition({
                                    top: rect.bottom + 8,
                                    right:
                                      window.innerWidth -
                                      rect.right,
                                  })
                                }}
                                disabled={saving}
                                aria-label={`Open actions for ${automation.name}`}
                                className={`flex h-9 w-9 items-center justify-center rounded-xl border disabled:cursor-not-allowed disabled:opacity-50 ${darkMode
                                    ? 'border-slate-700 hover:bg-slate-900'
                                    : 'border-slate-200 hover:bg-slate-50'
                                  }`}
                              >
                                <MoreHorizontal size={17} />
                              </button>

                              {openMenuId === automation.id &&
                                menuPosition && (
                                  <AutomationActions
                                    automation={automation}
                                    darkMode={darkMode}
                                    saving={saving}
                                    running={
                                      runningAutomationId ===
                                      automation.id
                                    }
                                    position={menuPosition}
                                    onClose={() => {
                                      setOpenMenuId(null)
                                      setMenuPosition(null)
                                    }}
                                    onRun={() =>
                                      handleRunNow(automation)
                                    }
                                    onEdit={() =>
                                      openEditModal(automation)
                                    }
                                    onToggle={() =>
                                      toggleAutomationStatus(
                                        automation,
                                      )
                                    }
                                    onDuplicate={() =>
                                      duplicateAutomation(
                                        automation,
                                      )
                                    }
                                    onDelete={() =>
                                      deleteAutomation(
                                        automation,
                                      )
                                    }
                                  />
                                )}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>

                {filteredAutomations.length ===
                  0 && (
                    <div className="flex min-h-[320px] items-center justify-center border-t border-inherit px-6">
                      <div className="text-center">
                        <Search
                          size={28}
                          className="mx-auto text-slate-400"
                        />

                        <h3 className="mt-4 text-lg font-semibold">
                          No automations found
                        </h3>

                        <p
                          className={`mt-2 text-sm ${darkMode
                            ? 'text-slate-500'
                            : 'text-slate-400'
                            }`}
                        >
                          {automationRecords.length ===
                            0
                            ? 'Create your first automation to start monitoring workflows.'
                            : 'Adjust the search or filter selections.'}
                        </p>

                        {automationRecords.length ===
                          0 ? (
                          <button
                            type="button"
                            onClick={
                              openCreateModal
                            }
                            className="mt-5 inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white"
                          >
                            <Plus
                              size={15}
                            />
                            Create automation
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
                    className={`text-xs ${darkMode
                      ? 'text-slate-500'
                      : 'text-slate-400'
                      }`}
                  >
                    Showing{' '}
                    {
                      filteredAutomations.length
                    }{' '}
                    of{' '}
                    {
                      automationRecords.length
                    }{' '}
                    automations
                  </p>

                  <p
                    className={`text-xs ${darkMode
                      ? 'text-slate-500'
                      : 'text-slate-400'
                      }`}
                  >
                    Changes are saved to
                    Supabase.
                  </p>
                </footer>
              </>
            )}
          </section>
        </div>
      </main>

      <AutomationModal
        isOpen={isAutomationModalOpen}
        automation={selectedAutomation}
        darkMode={darkMode}
        saving={saving}
        onClose={closeAutomationModal}
        onSave={saveAutomation}
      />
    </>
  )
}

function SummaryCard({
  label,
  value,
  darkMode,
  warning = false,
}) {
  return (
    <article
      className={`rounded-2xl border p-5 ${darkMode
        ? 'border-slate-700 bg-slate-800'
        : 'border-slate-200 bg-white'
        }`}
    >
      <p
        className={`text-xs ${darkMode
          ? 'text-slate-400'
          : 'text-slate-500'
          }`}
      >
        {label}
      </p>

      <p
        className={`mt-3 text-3xl font-bold tracking-[-0.04em] ${warning
          ? 'text-amber-500'
          : ''
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
      className={`min-h-[44px] rounded-xl border px-4 text-xs font-semibold outline-none ${darkMode
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

function AutomationActions({
  automation,
  darkMode,
  saving,
  running,
  position,
  onClose,
  onRun,
  onEdit,
  onToggle,
  onDuplicate,
  onDelete,
}) {
  const menuRef = useRef(null)

  const canRun =
    automation.status === 'active'

  useEffect(() => {
    function handlePointerDown(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target,
        )
      ) {
        onClose()
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener(
      'mousedown',
      handlePointerDown,
    )

    document.addEventListener(
      'keydown',
      handleEscape,
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        handlePointerDown,
      )

      document.removeEventListener(
        'keydown',
        handleEscape,
      )
    }
  }, [onClose])

  const menuHeight = 220

  const shouldOpenUp =
    position.top + menuHeight >
    window.innerHeight - 20

  const menuStyle = {
    right: `${position.right}px`,
    ...(shouldOpenUp
      ? {
          bottom: `${
            window.innerHeight -
            position.top +
            46
          }px`,
        }
      : {
          top: `${position.top}px`,
        }),
  }

  return createPortal(
    <div
      ref={menuRef}
      style={menuStyle}
      className={`fixed z-[9999] w-52 overflow-hidden rounded-xl border p-1.5 shadow-2xl ${
        darkMode
          ? 'border-slate-700 bg-slate-900'
          : 'border-slate-200 bg-white'
      }`}
    >
      <ActionButton
        icon={
          running ? (
            <LoaderCircle
              size={15}
              className="animate-spin"
            />
          ) : (
            <Zap size={15} />
          )
        }
        label={
          running
            ? 'Running...'
            : 'Run now'
        }
        onClick={() => {
          onClose()
          onRun()
        }}
        darkMode={darkMode}
        disabled={
          saving ||
          running ||
          !canRun
        }
      />

      <ActionButton
        icon={<Edit3 size={15} />}
        label="Edit automation"
        onClick={() => {
          onClose()
          onEdit()
        }}
        darkMode={darkMode}
        disabled={saving || running}
      />

      <ActionButton
        icon={
          automation.status ===
          'active' ? (
            <Pause size={15} />
          ) : (
            <Play size={15} />
          )
        }
        label={
          automation.status ===
          'active'
            ? 'Pause automation'
            : 'Activate automation'
        }
        onClick={() => {
          onClose()
          onToggle()
        }}
        darkMode={darkMode}
        disabled={saving || running}
      />

      <ActionButton
        icon={<Copy size={15} />}
        label="Duplicate"
        onClick={() => {
          onClose()
          onDuplicate()
        }}
        darkMode={darkMode}
        disabled={saving || running}
      />

      <ActionButton
        icon={<Trash2 size={15} />}
        label="Delete automation"
        onClick={() => {
          onClose()
          onDelete()
        }}
        darkMode={darkMode}
        destructive
        disabled={saving || running}
      />
    </div>,
    document.body,
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
      className={`flex min-h-[40px] w-full items-center gap-3 rounded-lg px-3 text-left text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${destructive
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

function AutomationStatusBadge({
  status,
}) {
  const normalized =
    String(status || 'draft').toLowerCase()

  const styles = {
    active:
      'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300',
    paused:
      'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    draft:
      'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300',
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${styles[normalized] ||
        styles.draft
        }`}
    >
      {capitalize(normalized)}
    </span>
  )
}

function TableHeading({ children }) {
  return (
    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em]">
      {children}
    </th>
  )
}

function capitalize(value) {
  return value
    ? value.charAt(0).toUpperCase() +
    value.slice(1)
    : ''
}

function formatLastRun(value) {
  if (!value) {
    return 'Never'
  }

  const parsedDate = new Date(value)

  if (
    Number.isNaN(parsedDate.getTime())
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
  ).format(parsedDate)
}

function getOwnerLabel(
  automation,
  profile,
) {
  if (automation.owner_name) {
    return automation.owner_name
  }

  if (
    automation.owner_id &&
    automation.owner_id === profile?.id
  ) {
    return (
      profile?.full_name ||
      'You'
    )
  }

  if (automation.owner_id) {
    return 'Assigned member'
  }

  return 'Unassigned'
}

export default Automations
import {
  useMemo,
  useState,
} from 'react'
import {
  Download,
  LoaderCircle,
  RefreshCw,
  Search,
} from 'lucide-react'

import { useWorkspace } from '../context/WorkspaceContext'
import { useExecutionLogs } from '../hooks/useExecutionLogs'
import StatusBadge from '../components/StatusBadge'
import RunDetailDrawer from '../components/RunDetailDrawer'
import { exportCsv } from '../utils/exportCsv'

const statusOptions = [
  {
    label: 'All statuses',
    value: 'all',
  },
  {
    label: 'Successful',
    value: 'successful',
  },
  {
    label: 'Failed',
    value: 'failed',
  },
  {
    label: 'Retrying',
    value: 'retrying',
  },
  {
    label: 'Running',
    value: 'running',
  },
]

function ExecutionLogs() {
  const {
    theme,
    isSidebarCollapsed,
  } = useWorkspace()

  const darkMode = theme === 'dark'

  const {
    runs: executionRecords,
    loading,
    saving,
    error,
    retry,
  } = useExecutionLogs()

  const [query, setQuery] = useState('')

  const [
    statusFilter,
    setStatusFilter,
  ] = useState('all')

  const [
    platformFilter,
    setPlatformFilter,
  ] = useState('all')

  const [selectedRun, setSelectedRun] =
    useState(null)

  const [message, setMessage] =
    useState('')

  const platformOptions = useMemo(() => {
    const platforms = [
      ...new Set(
        executionRecords
          .map(
            (run) =>
              run.automations?.platform,
          )
          .filter(Boolean),
      ),
    ]

    return [
      {
        label: 'All platforms',
        value: 'all',
      },
      ...platforms.map((platform) => ({
        label: platform,
        value: platform,
      })),
    ]
  }, [executionRecords])

  const filteredRuns = useMemo(() => {
    const normalizedQuery =
      query.trim().toLowerCase()

    return executionRecords.filter(
      (run) => {
        const automation =
          run.automations

        const matchesQuery =
          !normalizedQuery ||
          [
            run.id,
            automation?.id,
            automation?.name,
            automation?.platform,
            automation?.trigger_name,
            run.status,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(normalizedQuery)

        const matchesStatus =
          statusFilter === 'all' ||
          run.status === statusFilter

        const matchesPlatform =
          platformFilter === 'all' ||
          automation?.platform ===
            platformFilter

        return (
          matchesQuery &&
          matchesStatus &&
          matchesPlatform
        )
      },
    )
  }, [
    executionRecords,
    query,
    statusFilter,
    platformFilter,
  ])

  const successfulCount =
    executionRecords.filter(
      (run) =>
        run.status === 'successful',
    ).length

  const failedCount =
    executionRecords.filter(
      (run) => run.status === 'failed',
    ).length

  const retryingCount =
    executionRecords.filter(
      (run) =>
        run.status === 'retrying',
    ).length

  function showMessage(nextMessage) {
    setMessage(nextMessage)

    window.setTimeout(() => {
      setMessage('')
    }, 3000)
  }

  async function retryRun(run) {
    try {
      const created = await retry(run)

      setSelectedRun(created)

      showMessage(
        'Execution retried successfully.',
      )
    } catch {
      showMessage(
        'Unable to retry execution.',
      )
    }
  }

  async function copyRunId(run) {
    try {
      await navigator.clipboard.writeText(
        run.id,
      )

      showMessage('Run ID copied.')
    } catch {
      showMessage(
        'Unable to copy the run ID.',
      )
    }
  }

  function exportLogs() {
    exportCsv({
      filename:
        'opsora-execution-logs.csv',
      rows: filteredRuns,
      columns: [
        {
          label: 'Run ID',
          value: 'id',
        },
        {
          label: 'Automation ID',
          value: (run) =>
            run.automations?.id || '',
        },
        {
          label: 'Automation',
          value: (run) =>
            run.automations?.name || '',
        },
        {
          label: 'Platform',
          value: (run) =>
            run.automations?.platform ||
            '',
        },
        {
          label: 'Status',
          value: 'status',
        },
        {
          label: 'Trigger',
          value: (run) =>
            run.automations
              ?.trigger_name || '',
        },
        {
          label: 'Started',
          value: (run) =>
            formatDate(run.started_at),
        },
        {
          label: 'Duration',
          value: (run) =>
            formatDuration(
              run.duration_ms,
            ),
        },
        {
          label: 'Records Processed',
          value: 'records_processed',
        },
        {
          label: 'Retry Count',
          value: 'retry_count',
        },
        {
          label: 'Error',
          value: (run) =>
            run.error_message || '',
        },
      ],
    })

    showMessage(
      'Execution log CSV downloaded.',
    )
  }

  function clearFilters() {
    setQuery('')
    setStatusFilter('all')
    setPlatformFilter('all')
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
                Run history
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em]">
                Execution Logs
              </h2>

              <p
                className={`mt-3 max-w-2xl text-sm leading-7 ${
                  darkMode
                    ? 'text-slate-400'
                    : 'text-slate-500'
                }`}
              >
                Inspect successful, failed and
                retried workflow runs stored
                in Supabase.
              </p>
            </div>

            <button
              type="button"
              onClick={exportLogs}
              disabled={
                loading ||
                filteredRuns.length === 0
              }
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Total runs"
              value={
                executionRecords.length
              }
              darkMode={darkMode}
            />

            <SummaryCard
              label="Successful"
              value={successfulCount}
              darkMode={darkMode}
              tone="success"
            />

            <SummaryCard
              label="Failed"
              value={failedCount}
              darkMode={darkMode}
              tone="danger"
            />

            <SummaryCard
              label="Retrying"
              value={retryingCount}
              darkMode={darkMode}
              tone="warning"
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
                  placeholder="Search runs, automations or platforms"
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
                  value={platformFilter}
                  onChange={
                    setPlatformFilter
                  }
                  options={platformOptions}
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
                    className={`mt-3 text-sm ${
                      darkMode
                        ? 'text-slate-400'
                        : 'text-slate-500'
                    }`}
                  >
                    Loading execution logs...
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="opsora-scrollbar overflow-x-auto">
                  <table className="w-full min-w-[1000px] border-collapse">
                    <thead>
                      <tr
                        className={
                          darkMode
                            ? 'bg-slate-900/45 text-slate-500'
                            : 'bg-slate-50 text-slate-400'
                        }
                      >
                        <TableHeading>
                          Run
                        </TableHeading>
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
                          Records
                        </TableHeading>
                        <TableHeading>
                          Duration
                        </TableHeading>
                        <TableHeading>
                          Started
                        </TableHeading>
                        <TableHeading>
                          Actions
                        </TableHeading>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredRuns.map(
                        (run) => {
                          const automation =
                            run.automations

                          return (
                            <tr
                              key={run.id}
                              className="border-t border-inherit"
                            >
                              <td className="px-5 py-4">
                                <p className="text-sm font-semibold">
                                  {shortId(
                                    run.id,
                                  )}
                                </p>

                                <p
                                  className={`mt-1 text-[10px] ${
                                    darkMode
                                      ? 'text-slate-500'
                                      : 'text-slate-400'
                                  }`}
                                >
                                  {automation
                                    ? shortId(
                                        automation.id,
                                      )
                                    : 'Unknown automation'}
                                </p>
                              </td>

                              <td className="max-w-[300px] px-5 py-4">
                                <p className="truncate text-sm font-semibold">
                                  {automation?.name ||
                                    'Deleted automation'}
                                </p>

                                <p
                                  className={`mt-1 truncate text-xs ${
                                    darkMode
                                      ? 'text-slate-500'
                                      : 'text-slate-400'
                                  }`}
                                >
                                  {automation?.trigger_name ||
                                    'No trigger information'}
                                </p>
                              </td>

                              <td className="px-5 py-4 text-xs">
                                {automation?.platform ||
                                  'Unknown'}
                              </td>

                              <td className="px-5 py-4">
                                <StatusBadge
                                  status={
                                    run.status
                                  }
                                />
                              </td>

                              <td className="px-5 py-4 text-sm font-semibold">
                                {run.records_processed ||
                                  0}
                              </td>

                              <td className="px-5 py-4 text-xs">
                                {formatDuration(
                                  run.duration_ms,
                                )}
                              </td>

                              <td
                                className={`px-5 py-4 text-xs ${
                                  darkMode
                                    ? 'text-slate-500'
                                    : 'text-slate-400'
                                }`}
                              >
                                {formatDate(
                                  run.started_at,
                                )}
                              </td>

                              <td className="px-5 py-4">
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setSelectedRun(
                                        run,
                                      )
                                    }
                                    className={`min-h-[38px] rounded-xl border px-3 text-xs font-semibold ${
                                      darkMode
                                        ? 'border-slate-700 hover:bg-slate-900'
                                        : 'border-slate-200 hover:bg-slate-50'
                                    }`}
                                  >
                                    View details
                                  </button>

                                  {run.status !==
                                    'successful' && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        retryRun(
                                          run,
                                        )
                                      }
                                      disabled={
                                        saving
                                      }
                                      aria-label={`Retry ${run.id}`}
                                      className="flex h-[38px] w-[38px] items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      <RefreshCw
                                        size={
                                          15
                                        }
                                        className={
                                          saving
                                            ? 'animate-spin'
                                            : ''
                                        }
                                      />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        },
                      )}
                    </tbody>
                  </table>
                </div>

                {filteredRuns.length ===
                  0 && (
                  <div className="flex min-h-[320px] items-center justify-center border-t border-inherit px-6">
                    <div className="text-center">
                      <Search
                        size={28}
                        className="mx-auto text-slate-400"
                      />

                      <h3 className="mt-4 text-lg font-semibold">
                        No execution logs found
                      </h3>

                      <p
                        className={`mt-2 text-sm ${
                          darkMode
                            ? 'text-slate-500'
                            : 'text-slate-400'
                        }`}
                      >
                        {executionRecords.length ===
                        0
                          ? 'Execution records will appear here after automations start running.'
                          : 'Adjust the search or filter selections.'}
                      </p>

                      {executionRecords.length >
                        0 && (
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
                    {filteredRuns.length} of{' '}
                    {
                      executionRecords.length
                    }{' '}
                    runs
                  </p>

                  <p
                    className={`text-xs ${
                      darkMode
                        ? 'text-slate-500'
                        : 'text-slate-400'
                    }`}
                  >
                    Execution history is stored
                    in Supabase.
                  </p>
                </footer>
              </>
            )}
          </section>
        </div>
      </main>

      <RunDetailDrawer
        run={
          selectedRun
            ? normalizeRunForDrawer(
                selectedRun,
              )
            : null
        }
        darkMode={darkMode}
        onClose={() =>
          setSelectedRun(null)
        }
        onRetry={() =>
          selectedRun &&
          retryRun(selectedRun)
        }
        onCopyId={() =>
          selectedRun &&
          copyRunId(selectedRun)
        }
      />
    </>
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
    danger: 'text-rose-500',
    warning: 'text-amber-500',
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

function TableHeading({ children }) {
  return (
    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em]">
      {children}
    </th>
  )
}

function formatDuration(milliseconds) {
  if (
    milliseconds === null ||
    milliseconds === undefined
  ) {
    return '—'
  }

  if (milliseconds < 1000) {
    return `${milliseconds}ms`
  }

  return `${(
    milliseconds / 1000
  ).toFixed(1)}s`
}

function formatDate(value) {
  if (!value) {
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
  ).format(new Date(value))
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

function normalizeRunForDrawer(run) {
  const automation = run.automations

  return {
    ...run,

    automationId:
      automation?.id || '',
    automation:
      automation?.name ||
      'Deleted automation',
    platform:
      automation?.platform || 'Unknown',
    trigger:
      automation?.trigger_name ||
      'Unknown',
    owner: 'Workspace member',

    status: run.status,
    startedAt: formatDate(
      run.started_at,
    ),
    relativeTime: formatDate(
      run.started_at,
    ),
    duration: formatDuration(
      run.duration_ms,
    ),
    recordsProcessed:
      run.records_processed || 0,
    retryCount:
      run.retry_count || 0,
    input: run.input_payload || {},
    steps: Array.isArray(run.steps)
      ? run.steps.map((step) => ({
          ...step,
          status:
            step.status ||
            'successful',
        }))
      : [],
    errorMessage:
      run.error_message || null,
  }
}

export default ExecutionLogs
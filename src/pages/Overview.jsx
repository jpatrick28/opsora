import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  LoaderCircle,
  PlayCircle,
  RefreshCw,
  Workflow,
  XCircle,
} from 'lucide-react'

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { useWorkspace } from '../context/WorkspaceContext'
import { useOverview } from '../hooks/useOverview'

import MetricCard from '../components/MetricCard'
import StatusBadge from '../components/StatusBadge'

const healthColorMap = {
  healthy: '#10b981',
  warning: '#f59e0b',
  critical: '#ef4444',
  paused: '#64748b',
  draft: '#8b5cf6',
}

function Overview() {
  const {
    theme,
    isSidebarCollapsed,
    workspace,
    navigateTo,
  } = useWorkspace()

  const darkMode = theme === 'dark'

  const {
    metrics: overviewMetrics,
    executionVolume,
    automationHealth,
    recentRuns,
    failingAutomations,
    platformActivity,
    activity,
    loading,
    error,
    reload,
  } = useOverview()

  const metricIcons = [
    <Workflow size={19} />,
    <PlayCircle size={19} />,
    <CheckCircle2 size={19} />,
    <XCircle size={19} />,
  ]

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
      <div className="mx-auto max-w-[1700px] p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p
              className={`text-xs font-semibold uppercase tracking-[0.16em] ${
                darkMode
                  ? 'text-slate-500'
                  : 'text-slate-400'
              }`}
            >
              {workspace}
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em]">
              Automation overview
            </h2>

            <p
              className={`mt-3 max-w-2xl text-sm leading-7 ${
                darkMode
                  ? 'text-slate-400'
                  : 'text-slate-500'
              }`}
            >
              Monitor workflow health,
              execution volume, failures and
              platform activity across your
              automation workspace.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={reload}
              disabled={loading}
              className={`inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl border px-4 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                darkMode
                  ? 'border-slate-700 bg-slate-800 hover:bg-slate-700'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <RefreshCw
                size={15}
                className={
                  loading
                    ? 'animate-spin'
                    : ''
                }
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={() =>
                navigateTo('automations')
              }
              className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-xs font-semibold text-white transition hover:bg-indigo-500"
            >
              <Workflow size={15} />
              View automations
            </button>
          </div>
        </div>

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
                Loading live workspace data...
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {overviewMetrics.map(
                (metric, index) => (
                  <MetricCard
                    key={
                      metric.id ||
                      metric.label
                    }
                    metric={metric}
                    icon={
                      metricIcons[index]
                    }
                    darkMode={darkMode}
                  />
                ),
              )}
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1.55fr_0.75fr]">
              <section
                className={`rounded-2xl border p-5 ${
                  darkMode
                    ? 'border-slate-700 bg-slate-800'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold">
                      Execution volume
                    </h3>

                    <p
                      className={`mt-1 text-xs ${
                        darkMode
                          ? 'text-slate-500'
                          : 'text-slate-400'
                      }`}
                    >
                      Successful and failed runs
                      during the last 7 days
                    </p>
                  </div>

                  <span
                    className={`rounded-lg px-3 py-2 text-[10px] font-semibold ${
                      darkMode
                        ? 'bg-slate-900 text-slate-400'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    Last 7 days
                  </span>
                </div>

                <div className="mt-6 h-[320px]">
                  {executionVolume.length >
                  0 ? (
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >
                      <AreaChart
                        data={
                          executionVolume
                        }
                      >
                        <defs>
                          <linearGradient
                            id="successfulRuns"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#6366f1"
                              stopOpacity={
                                0.35
                              }
                            />

                            <stop
                              offset="95%"
                              stopColor="#6366f1"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>

                        <CartesianGrid
                          strokeDasharray="4 4"
                          vertical={false}
                          stroke={
                            darkMode
                              ? '#334155'
                              : '#e2e8f0'
                          }
                        />

                        <XAxis
                          dataKey="label"
                          tickLine={false}
                          axisLine={false}
                          tick={{
                            fill: '#94a3b8',
                            fontSize: 11,
                          }}
                        />

                        <YAxis
                          allowDecimals={false}
                          tickLine={false}
                          axisLine={false}
                          tick={{
                            fill: '#94a3b8',
                            fontSize: 11,
                          }}
                        />

                        <Tooltip
                          contentStyle={{
                            backgroundColor:
                              darkMode
                                ? '#0f172a'
                                : '#ffffff',
                            borderColor:
                              darkMode
                                ? '#334155'
                                : '#e2e8f0',
                            borderRadius: 12,
                          }}
                        />

                        <Area
                          type="monotone"
                          dataKey="successful"
                          name="Successful runs"
                          stroke="#6366f1"
                          strokeWidth={2.5}
                          fill="url(#successfulRuns)"
                        />

                        <Area
                          type="monotone"
                          dataKey="failed"
                          name="Failed runs"
                          stroke="#ef4444"
                          strokeWidth={2}
                          fill="transparent"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyChartState
                      darkMode={darkMode}
                      message="Run an automation to populate execution history."
                    />
                  )}
                </div>
              </section>

              <section
                className={`rounded-2xl border p-5 ${
                  darkMode
                    ? 'border-slate-700 bg-slate-800'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div>
                  <h3 className="text-sm font-semibold">
                    Automation health
                  </h3>

                  <p
                    className={`mt-1 text-xs ${
                      darkMode
                        ? 'text-slate-500'
                        : 'text-slate-400'
                    }`}
                  >
                    Current workflow status
                  </p>
                </div>

                {automationHealth.length >
                0 ? (
                  <>
                    <div className="mt-4 h-[220px]">
                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >
                        <PieChart>
                          <Pie
                            data={
                              automationHealth
                            }
                            dataKey="value"
                            nameKey="name"
                            innerRadius={58}
                            outerRadius={88}
                            paddingAngle={4}
                          >
                            {automationHealth.map(
                              (item) => (
                                <Cell
                                  key={
                                    item.key ||
                                    item.name
                                  }
                                  fill={
                                    healthColorMap[
                                      item.key
                                    ] ||
                                    '#94a3b8'
                                  }
                                />
                              ),
                            )}
                          </Pie>

                          <Tooltip
                            contentStyle={{
                              backgroundColor:
                                darkMode
                                  ? '#0f172a'
                                  : '#ffffff',
                              borderColor:
                                darkMode
                                  ? '#334155'
                                  : '#e2e8f0',
                              borderRadius: 12,
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-3">
                      {automationHealth.map(
                        (item) => (
                          <div
                            key={
                              item.key ||
                              item.name
                            }
                            className="flex items-center gap-3"
                          >
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{
                                backgroundColor:
                                  healthColorMap[
                                    item.key
                                  ] ||
                                  '#94a3b8',
                              }}
                            />

                            <span
                              className={`text-xs ${
                                darkMode
                                  ? 'text-slate-400'
                                  : 'text-slate-500'
                              }`}
                            >
                              {item.name}
                            </span>

                            <span className="ml-auto text-sm font-semibold">
                              {item.value}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex min-h-[285px] items-center justify-center">
                    <p
                      className={`text-center text-sm ${
                        darkMode
                          ? 'text-slate-500'
                          : 'text-slate-400'
                      }`}
                    >
                      No automations have been
                      created yet.
                    </p>
                  </div>
                )}
              </section>
            </div>

            <div className="mt-5 grid gap-5 2xl:grid-cols-[1.35fr_0.65fr]">
              <RecentRuns
                runs={recentRuns}
                darkMode={darkMode}
                onViewLogs={() =>
                  navigateTo(
                    'execution-logs',
                  )
                }
              />

              <FailingAutomations
                automations={
                  failingAutomations
                }
                darkMode={darkMode}
                onViewAutomations={() =>
                  navigateTo(
                    'automations',
                  )
                }
              />
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
              <PlatformActivity
                platforms={
                  platformActivity
                }
                darkMode={darkMode}
              />

              <RecentActivity
                activity={activity}
                darkMode={darkMode}
              />
            </div>
          </>
        )}
      </div>
    </main>
  )
}

function RecentRuns({
  runs,
  darkMode,
  onViewLogs,
}) {
  return (
    <section
      className={`overflow-hidden rounded-2xl border ${
        darkMode
          ? 'border-slate-700 bg-slate-800'
          : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex items-center justify-between gap-4 border-b border-inherit px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold">
            Recent execution runs
          </h3>

          <p
            className={`mt-1 text-xs ${
              darkMode
                ? 'text-slate-500'
                : 'text-slate-400'
            }`}
          >
            Latest workflow activity
          </p>
        </div>

        <button
          type="button"
          onClick={onViewLogs}
          className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-500"
        >
          View logs
          <ExternalLink size={14} />
        </button>
      </div>

      {runs.length > 0 ? (
        <div className="opsora-scrollbar overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse">
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
                  Duration
                </TableHeading>

                <TableHeading>
                  Records
                </TableHeading>

                <TableHeading>
                  Started
                </TableHeading>
              </tr>
            </thead>

            <tbody>
              {runs.map((run) => (
                <tr
                  key={run.id}
                  className="border-t border-inherit"
                >
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold">
                      {run.automations?.name ||
                        'Deleted automation'}
                    </p>

                    <p
                      className={`mt-1 text-[10px] ${
                        darkMode
                          ? 'text-slate-500'
                          : 'text-slate-400'
                      }`}
                    >
                      {shortId(run.id)}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-xs">
                    {run.automations
                      ?.platform ||
                      'Unknown'}
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge
                      status={run.status}
                    />
                  </td>

                  <td className="px-5 py-4 text-xs">
                    {formatDuration(
                      run.duration_ms,
                    )}
                  </td>

                  <td className="px-5 py-4 text-xs">
                    {Number(
                      run.records_processed ||
                        0,
                    ).toLocaleString()}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptySection
          darkMode={darkMode}
          title="No execution runs yet"
          message="Use Run now on an active automation and its execution will appear here."
        />
      )}
    </section>
  )
}

function FailingAutomations({
  automations,
  darkMode,
  onViewAutomations,
}) {
  return (
    <section
      className={`rounded-2xl border ${
        darkMode
          ? 'border-slate-700 bg-slate-800'
          : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex items-center justify-between gap-4 border-b border-inherit px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold">
            Needs attention
          </h3>

          <p
            className={`mt-1 text-xs ${
              darkMode
                ? 'text-slate-500'
                : 'text-slate-400'
            }`}
          >
            Workflows with recent failures
          </p>
        </div>

        <AlertTriangle
          size={18}
          className="text-amber-500"
        />
      </div>

      {automations.length > 0 ? (
        <div className="divide-y divide-inherit">
          {automations.map(
            (automation) => (
              <article
                key={automation.id}
                className="p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {automation.name}
                    </p>

                    <p
                      className={`mt-1 text-xs ${
                        darkMode
                          ? 'text-slate-500'
                          : 'text-slate-400'
                      }`}
                    >
                      {automation.platform}
                      {' · '}
                      {shortId(
                        automation.id,
                      )}
                    </p>
                  </div>

                  <StatusBadge
                    status={
                      automation.health
                    }
                  />
                </div>

                <div className="mt-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-2xl font-bold tracking-[-0.03em]">
                      {
                        automation.failures
                      }
                    </p>

                    <p
                      className={`mt-1 text-[10px] uppercase tracking-[0.12em] ${
                        darkMode
                          ? 'text-slate-500'
                          : 'text-slate-400'
                      }`}
                    >
                      Failed runs
                    </p>
                  </div>

                  <p
                    className={`text-right text-xs ${
                      darkMode
                        ? 'text-slate-500'
                        : 'text-slate-400'
                    }`}
                  >
                    Last failure
                    <span className="mt-1 block font-medium">
                      {automation.lastFailure
                        ? formatDate(
                            automation.lastFailure,
                          )
                        : 'No timestamp'}
                    </span>
                  </p>
                </div>
              </article>
            ),
          )}
        </div>
      ) : (
        <EmptySection
          darkMode={darkMode}
          title="Everything looks healthy"
          message="Automations with warning or critical health will appear here."
          compact
        />
      )}

      <div className="border-t border-inherit p-4">
        <button
          type="button"
          onClick={onViewAutomations}
          className={`flex min-h-[42px] w-full items-center justify-center rounded-xl border text-xs font-semibold ${
            darkMode
              ? 'border-slate-700 hover:bg-slate-900'
              : 'border-slate-200 hover:bg-slate-50'
          }`}
        >
          Review automations
        </button>
      </div>
    </section>
  )
}

function PlatformActivity({
  platforms,
  darkMode,
}) {
  const totalRuns =
    platforms.reduce(
      (sum, platform) =>
        sum +
        Number(
          platform.executions || 0,
        ),
      0,
    )

  return (
    <section
      className={`rounded-2xl border p-5 ${
        darkMode
          ? 'border-slate-700 bg-slate-800'
          : 'border-slate-200 bg-white'
      }`}
    >
      <div>
        <h3 className="text-sm font-semibold">
          Platform activity
        </h3>

        <p
          className={`mt-1 text-xs ${
            darkMode
              ? 'text-slate-500'
              : 'text-slate-400'
          }`}
        >
          Execution distribution by
          connected platform
        </p>
      </div>

      {platforms.length > 0 ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {platforms.map(
            (platform) => {
              const executions =
                Number(
                  platform.executions ||
                    0,
                )

              const percentage =
                totalRuns > 0
                  ? Math.round(
                      (executions /
                        totalRuns) *
                        100,
                    )
                  : 0

              return (
                <div
                  key={
                    platform.platform
                  }
                  className={`rounded-xl border p-4 ${
                    darkMode
                      ? 'border-slate-700 bg-slate-900/50'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold">
                      {
                        platform.platform
                      }
                    </p>

                    <span
                      className={`text-xs ${
                        darkMode
                          ? 'text-slate-500'
                          : 'text-slate-400'
                      }`}
                    >
                      {percentage}%
                    </span>
                  </div>

                  <p className="mt-2 text-2xl font-bold tracking-[-0.03em]">
                    {executions.toLocaleString()}
                  </p>

                  <p
                    className={`mt-1 text-[10px] ${
                      darkMode
                        ? 'text-slate-500'
                        : 'text-slate-400'
                    }`}
                  >
                    {
                      platform.automations
                    }{' '}
                    automation
                    {platform.automations ===
                    1
                      ? ''
                      : 's'}
                    {' · '}
                    {
                      platform.failures
                    }{' '}
                    failed
                  </p>

                  <div
                    className={`mt-4 h-2 overflow-hidden rounded-full ${
                      darkMode
                        ? 'bg-slate-700'
                        : 'bg-slate-200'
                    }`}
                  >
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>
                </div>
              )
            },
          )}
        </div>
      ) : (
        <EmptySection
          darkMode={darkMode}
          title="No platform activity yet"
          message="Platform statistics will appear after automations and runs are created."
        />
      )}
    </section>
  )
}

function RecentActivity({
  activity,
  darkMode,
}) {
  return (
    <section
      className={`rounded-2xl border ${
        darkMode
          ? 'border-slate-700 bg-slate-800'
          : 'border-slate-200 bg-white'
      }`}
    >
      <div className="border-b border-inherit px-5 py-4">
        <h3 className="text-sm font-semibold">
          Workspace activity
        </h3>

        <p
          className={`mt-1 text-xs ${
            darkMode
              ? 'text-slate-500'
              : 'text-slate-400'
          }`}
        >
          Recent actions stored in Supabase
        </p>
      </div>

      {activity.length > 0 ? (
        <div className="divide-y divide-inherit">
          {activity.map((item) => (
            <div
              key={item.id}
              className="px-5 py-4"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
                  <Workflow size={14} />
                </span>

                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {formatActivity(
                      item,
                    )}
                  </p>

                  <p
                    className={`mt-1 text-xs ${
                      darkMode
                        ? 'text-slate-500'
                        : 'text-slate-400'
                    }`}
                  >
                    {formatDate(
                      item.created_at,
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptySection
          darkMode={darkMode}
          title="No activity yet"
          message="Workspace actions will appear here as you use Opsora."
          compact
        />
      )}
    </section>
  )
}

function EmptyChartState({
  darkMode,
  message,
}) {
  return (
    <div className="flex h-full items-center justify-center">
      <p
        className={`max-w-sm text-center text-sm ${
          darkMode
            ? 'text-slate-500'
            : 'text-slate-400'
        }`}
      >
        {message}
      </p>
    </div>
  )
}

function EmptySection({
  darkMode,
  title,
  message,
  compact = false,
}) {
  return (
    <div
      className={`flex items-center justify-center px-6 text-center ${
        compact
          ? 'min-h-[180px]'
          : 'min-h-[260px]'
      }`}
    >
      <div>
        <CheckCircle2
          size={26}
          className="mx-auto text-slate-400"
        />

        <h4 className="mt-3 text-sm font-semibold">
          {title}
        </h4>

        <p
          className={`mt-2 max-w-sm text-xs leading-6 ${
            darkMode
              ? 'text-slate-500'
              : 'text-slate-400'
          }`}
        >
          {message}
        </p>
      </div>
    </div>
  )
}

function TableHeading({ children }) {
  return (
    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em]">
      {children}
    </th>
  )
}

function formatDuration(
  milliseconds,
) {
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

function formatActivity(item) {
  const target =
    item.target_name ||
    item.target_type ||
    'item'

  const action =
    item.action || 'updated'

  return `${capitalize(
    action,
  )} ${target}`
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

export default Overview
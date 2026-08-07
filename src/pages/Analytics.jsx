import {
  useMemo,
  useState,
} from 'react'

import {
  Activity,
  Clock3,
  Download,
  LoaderCircle,
  PlayCircle,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from 'lucide-react'

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { useWorkspace } from '../context/WorkspaceContext'
import { useAnalytics } from '../hooks/useAnalytics'
import { exportCsv } from '../utils/exportCsv'

const dateRanges = [
  {
    value: '7-days',
    label: 'Last 7 days',
    days: 7,
  },
  {
    value: '30-days',
    label: 'Last 30 days',
    days: 30,
  },
  {
    value: '90-days',
    label: 'Last 90 days',
    days: 90,
  },
]

const failureColors = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#8b5cf6',
  '#64748b',
]

function Analytics() {
  const {
    theme,
    isSidebarCollapsed,
  } = useWorkspace()

  const darkMode = theme === 'dark'

  const [dateRange, setDateRange] =
    useState('7-days')

  const [message, setMessage] =
    useState('')

  const selectedRange =
    dateRanges.find(
      (range) =>
        range.value === dateRange,
    ) || dateRanges[0]

  const {
    summary,
    executionTrends,
    platformPerformance,
    failureCategories,
    ownerPerformance,
    automationRanking,
    loading,
    error,
    reload,
  } = useAnalytics(
    selectedRange.days,
  )

  const bestAutomation = useMemo(() => {
    if (
      automationRanking.length === 0
    ) {
      return null
    }

    return [...automationRanking].sort(
      (a, b) =>
        b.successRate -
        a.successRate,
    )[0]
  }, [automationRanking])

  const attentionAutomation =
    useMemo(() => {
      if (
        automationRanking.length === 0
      ) {
        return null
      }

      return [...automationRanking].sort(
        (a, b) =>
          a.successRate -
          b.successRate,
      )[0]
    }, [automationRanking])

  function showMessage(nextMessage) {
    setMessage(nextMessage)

    window.setTimeout(() => {
      setMessage('')
    }, 3000)
  }

  function exportAnalytics() {
    if (
      automationRanking.length === 0
    ) {
      showMessage(
        'No analytics data to export.',
      )

      return
    }

    exportCsv({
      filename: `opsora-analytics-${dateRange}.csv`,
      rows: automationRanking,
      columns: [
        {
          label: 'Automation ID',
          value: 'id',
        },
        {
          label: 'Automation',
          value: 'name',
        },
        {
          label: 'Platform',
          value: 'platform',
        },
        {
          label: 'Executions',
          value: 'executions',
        },
        {
          label: 'Successful Runs',
          value: 'successful',
        },
        {
          label: 'Failed Runs',
          value: 'failed',
        },
        {
          label: 'Success Rate',
          value: (row) =>
            `${row.successRate}%`,
        },
        {
          label: 'Average Duration',
          value: (row) =>
            formatDuration(
              row.averageDuration,
            ),
        },
      ],
    })

    showMessage(
      'Analytics CSV downloaded.',
    )
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
      <div className="mx-auto max-w-[1700px] p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-500">
              Operational reporting
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em]">
              Analytics
            </h2>

            <p
              className={`mt-3 max-w-2xl text-sm leading-7 ${
                darkMode
                  ? 'text-slate-400'
                  : 'text-slate-500'
              }`}
            >
              Review execution trends,
              platform reliability, failure
              patterns and automation
              performance.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={dateRange}
              onChange={(event) =>
                setDateRange(
                  event.target.value,
                )
              }
              className={`min-h-[44px] rounded-xl border px-4 text-sm font-semibold outline-none ${
                darkMode
                  ? 'border-slate-700 bg-slate-800'
                  : 'border-slate-200 bg-white'
              }`}
            >
              {dateRanges.map(
                (range) => (
                  <option
                    key={range.value}
                    value={range.value}
                  >
                    {range.label}
                  </option>
                ),
              )}
            </select>

            <button
              type="button"
              onClick={reload}
              disabled={loading}
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

            <button
              type="button"
              onClick={exportAnalytics}
              disabled={
                loading ||
                automationRanking.length ===
                  0
              }
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download size={16} />
              Export report
            </button>
          </div>
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
                Loading analytics...
              </p>
            </div>
          </div>
        ) : (
          <>
            <SummaryMetrics
              summary={summary}
              darkMode={darkMode}
            />

            <div className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_0.7fr]">
              <ChartCard
                title="Execution trends"
                description="Successful and failed workflow runs"
                darkMode={darkMode}
              >
                {executionTrends.length >
                0 ? (
                  <div className="h-[340px]">
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >
                      <AreaChart
                        data={
                          executionTrends
                        }
                      >
                        <defs>
                          <linearGradient
                            id="analytics-success"
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
                              stopOpacity={
                                0
                              }
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
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fill: '#94a3b8',
                            fontSize: 11,
                          }}
                        />

                        <YAxis
                          allowDecimals={
                            false
                          }
                          axisLine={false}
                          tickLine={false}
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
                            borderRadius:
                              12,
                          }}
                        />

                        <Legend />

                        <Area
                          type="monotone"
                          dataKey="successful"
                          name="Successful"
                          stroke="#6366f1"
                          strokeWidth={
                            2.5
                          }
                          fill="url(#analytics-success)"
                        />

                        <Area
                          type="monotone"
                          dataKey="failed"
                          name="Failed"
                          stroke="#ef4444"
                          strokeWidth={2}
                          fill="transparent"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyChartState
                    darkMode={darkMode}
                    message="Run automations to populate execution trends."
                  />
                )}
              </ChartCard>

              <ChartCard
                title="Failure categories"
                description="Reasons behind failed executions"
                darkMode={darkMode}
              >
                {failureCategories.length >
                0 ? (
                  <>
                    <div className="h-[230px]">
                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >
                        <PieChart>
                          <Pie
                            data={
                              failureCategories
                            }
                            dataKey="value"
                            nameKey="name"
                            innerRadius={
                              58
                            }
                            outerRadius={
                              88
                            }
                            paddingAngle={
                              4
                            }
                          >
                            {failureCategories.map(
                              (
                                item,
                                index,
                              ) => (
                                <Cell
                                  key={
                                    item.name
                                  }
                                  fill={
                                    failureColors[
                                      index %
                                        failureColors.length
                                    ]
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
                              borderRadius:
                                12,
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-3">
                      {failureCategories.map(
                        (
                          category,
                          index,
                        ) => (
                          <div
                            key={
                              category.name
                            }
                            className="flex items-center gap-3"
                          >
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{
                                backgroundColor:
                                  failureColors[
                                    index %
                                      failureColors.length
                                  ],
                              }}
                            />

                            <span
                              className={`text-xs ${
                                darkMode
                                  ? 'text-slate-400'
                                  : 'text-slate-500'
                              }`}
                            >
                              {
                                category.name
                              }
                            </span>

                            <span className="ml-auto text-xs font-semibold">
                              {
                                category.value
                              }
                              {' · '}
                              {
                                category.percentage
                              }
                              %
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </>
                ) : (
                  <EmptyChartState
                    darkMode={darkMode}
                    message="No failed executions in this period."
                    compact
                  />
                )}
              </ChartCard>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-2">
              <ChartCard
                title="Platform comparison"
                description="Execution volume and success rate"
                darkMode={darkMode}
              >
                {platformPerformance.length >
                0 ? (
                  <>
                    <div className="h-[340px]">
                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >
                        <BarChart
                          data={
                            platformPerformance
                          }
                        >
                          <CartesianGrid
                            strokeDasharray="4 4"
                            vertical={
                              false
                            }
                            stroke={
                              darkMode
                                ? '#334155'
                                : '#e2e8f0'
                            }
                          />

                          <XAxis
                            dataKey="platform"
                            axisLine={false}
                            tickLine={false}
                            tick={{
                              fill: '#94a3b8',
                              fontSize:
                                10,
                            }}
                          />

                          <YAxis
                            allowDecimals={
                              false
                            }
                            axisLine={false}
                            tickLine={false}
                            tick={{
                              fill: '#94a3b8',
                              fontSize:
                                11,
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
                              borderRadius:
                                12,
                            }}
                          />

                          <Bar
                            dataKey="executions"
                            name="Executions"
                            fill="#6366f1"
                            radius={[
                              7,
                              7,
                              0,
                              0,
                            ]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="mt-5 space-y-3">
                      {platformPerformance.map(
                        (platform) => (
                          <div
                            key={
                              platform.platform
                            }
                            className={`flex items-center justify-between gap-4 rounded-xl border p-3 ${
                              darkMode
                                ? 'border-slate-700 bg-slate-900/40'
                                : 'border-slate-200 bg-slate-50'
                            }`}
                          >
                            <div>
                              <p className="text-xs font-semibold">
                                {
                                  platform.platform
                                }
                              </p>

                              <p
                                className={`mt-1 text-[10px] ${
                                  darkMode
                                    ? 'text-slate-500'
                                    : 'text-slate-400'
                                }`}
                              >
                                {
                                  platform.executions
                                }{' '}
                                runs ·{' '}
                                {
                                  platform.failed
                                }{' '}
                                failed
                              </p>
                            </div>

                            <span
                              className={`text-sm font-bold ${getSuccessRateClass(
                                platform.successRate,
                              )}`}
                            >
                              {
                                platform.successRate
                              }
                              %
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </>
                ) : (
                  <EmptyChartState
                    darkMode={darkMode}
                    message="No platform activity in this period."
                  />
                )}
              </ChartCard>

              <ChartCard
                title="Owner performance"
                description="Execution ownership and reliability"
                darkMode={darkMode}
              >
                {ownerPerformance.length >
                0 ? (
                  <div className="space-y-4">
                    {ownerPerformance.map(
                      (owner) => (
                        <OwnerPerformanceCard
                          key={
                            owner.ownerId
                          }
                          owner={owner}
                          darkMode={
                            darkMode
                          }
                        />
                      ),
                    )}
                  </div>
                ) : (
                  <EmptyChartState
                    darkMode={darkMode}
                    message="No owner performance data yet."
                  />
                )}
              </ChartCard>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
              <AutomationRanking
                automations={
                  automationRanking
                }
                darkMode={darkMode}
              />

              <section className="space-y-5">
                {bestAutomation ? (
                  <InsightCard
                    icon={
                      <ShieldCheck
                        size={19}
                      />
                    }
                    label="Best performing"
                    title={
                      bestAutomation.name
                    }
                    description={`${bestAutomation.successRate}% success rate across ${bestAutomation.executions.toLocaleString()} executions.`}
                    darkMode={darkMode}
                    tone="success"
                  />
                ) : (
                  <InsightCard
                    icon={
                      <ShieldCheck
                        size={19}
                      />
                    }
                    label="Best performing"
                    title="No data yet"
                    description="Run automations to generate performance insights."
                    darkMode={darkMode}
                    tone="success"
                  />
                )}

                {attentionAutomation ? (
                  <InsightCard
                    icon={
                      <Activity
                        size={19}
                      />
                    }
                    label="Needs attention"
                    title={
                      attentionAutomation.name
                    }
                    description={`${attentionAutomation.successRate}% success rate with ${attentionAutomation.failed.toLocaleString()} failed runs.`}
                    darkMode={darkMode}
                    tone="danger"
                  />
                ) : (
                  <InsightCard
                    icon={
                      <Activity
                        size={19}
                      />
                    }
                    label="Needs attention"
                    title="No data yet"
                    description="Failure insights will appear once executions are available."
                    darkMode={darkMode}
                    tone="danger"
                  />
                )}
              </section>
            </div>
          </>
        )}
      </div>
    </main>
  )
}

function SummaryMetrics({
  summary,
  darkMode,
}) {
  const iconMap = {
    executions: (
      <PlayCircle size={19} />
    ),
    'success-rate': (
      <ShieldCheck size={19} />
    ),
    duration: <Clock3 size={19} />,
    records: <Activity size={19} />,
  }

  if (summary.length === 0) {
    return (
      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          'Total executions',
          'Success rate',
          'Avg. duration',
          'Records processed',
        ].map((label) => (
          <AnalyticsMetric
            key={label}
            label={label}
            value="0"
            helper="No data yet"
            icon={
              <Activity size={19} />
            }
            darkMode={darkMode}
            tone="indigo"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {summary.map((metric) => (
        <AnalyticsMetric
          key={metric.id}
          label={metric.label}
          value={metric.value}
          helper={metric.helper}
          icon={
            iconMap[metric.id] || (
              <Activity size={19} />
            )
          }
          darkMode={darkMode}
          tone={metric.tone}
        />
      ))}
    </div>
  )
}

function AnalyticsMetric({
  label,
  value,
  helper,
  icon,
  darkMode,
  tone,
}) {
  const toneStyles = {
    indigo:
      'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300',
    emerald:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    rose:
      'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
    blue:
      'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
    violet:
      'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
  }

  return (
    <article
      className={`rounded-2xl border p-5 ${
        darkMode
          ? 'border-slate-700 bg-slate-800'
          : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className={`text-xs ${
              darkMode
                ? 'text-slate-400'
                : 'text-slate-500'
            }`}
          >
            {label}
          </p>

          <p className="mt-3 text-3xl font-bold tracking-[-0.04em]">
            {value}
          </p>
        </div>

        <span
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${
            toneStyles[tone] ||
            toneStyles.indigo
          }`}
        >
          {icon}
        </span>
      </div>

      <p
        className={`mt-5 text-xs ${
          darkMode
            ? 'text-slate-500'
            : 'text-slate-400'
        }`}
      >
        {helper || 'Live workspace data'}
      </p>
    </article>
  )
}

function ChartCard({
  title,
  description,
  darkMode,
  children,
}) {
  return (
    <section
      className={`rounded-2xl border p-5 ${
        darkMode
          ? 'border-slate-700 bg-slate-800'
          : 'border-slate-200 bg-white'
      }`}
    >
      <h3 className="text-sm font-semibold">
        {title}
      </h3>

      <p
        className={`mt-1 text-xs ${
          darkMode
            ? 'text-slate-500'
            : 'text-slate-400'
        }`}
      >
        {description}
      </p>

      <div className="mt-5">
        {children}
      </div>
    </section>
  )
}

function OwnerPerformanceCard({
  owner,
  darkMode,
}) {
  return (
    <article
      className={`rounded-xl border p-4 ${
        darkMode
          ? 'border-slate-700 bg-slate-900/50'
          : 'border-slate-200 bg-slate-50'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">
            {owner.owner}
          </p>

          <p
            className={`mt-1 text-xs ${
              darkMode
                ? 'text-slate-500'
                : 'text-slate-400'
            }`}
          >
            {owner.automations}{' '}
            automation
            {owner.automations === 1
              ? ''
              : 's'}
          </p>
        </div>

        <span
          className={`text-sm font-bold ${getSuccessRateClass(
            owner.successRate,
          )}`}
        >
          {owner.successRate}%
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <SmallMetric
          label="Executions"
          value={owner.executions.toLocaleString()}
          darkMode={darkMode}
        />

        <SmallMetric
          label="Success rate"
          value={`${owner.successRate}%`}
          darkMode={darkMode}
        />
      </div>
    </article>
  )
}

function SmallMetric({
  label,
  value,
  darkMode,
}) {
  return (
    <div>
      <p
        className={`text-[9px] font-semibold uppercase tracking-[0.12em] ${
          darkMode
            ? 'text-slate-600'
            : 'text-slate-400'
        }`}
      >
        {label}
      </p>

      <p className="mt-1 text-xs font-semibold">
        {value}
      </p>
    </div>
  )
}

function AutomationRanking({
  automations,
  darkMode,
}) {
  const rankedAutomations =
    useMemo(
      () =>
        [...automations].sort(
          (a, b) => {
            if (
              b.successRate !==
              a.successRate
            ) {
              return (
                b.successRate -
                a.successRate
              )
            }

            return (
              b.executions -
              a.executions
            )
          },
        ),
      [automations],
    )

  return (
    <section
      className={`overflow-hidden rounded-2xl border ${
        darkMode
          ? 'border-slate-700 bg-slate-800'
          : 'border-slate-200 bg-white'
      }`}
    >
      <header className="border-b border-inherit px-5 py-4">
        <h3 className="text-sm font-semibold">
          Automation performance ranking
        </h3>

        <p
          className={`mt-1 text-xs ${
            darkMode
              ? 'text-slate-500'
              : 'text-slate-400'
          }`}
        >
          Ranked by workflow success rate
        </p>
      </header>

      {rankedAutomations.length >
      0 ? (
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
                  Executions
                </TableHeading>

                <TableHeading>
                  Success rate
                </TableHeading>

                <TableHeading>
                  Failed
                </TableHeading>

                <TableHeading>
                  Avg. duration
                </TableHeading>
              </tr>
            </thead>

            <tbody>
              {rankedAutomations.map(
                (
                  automation,
                  index,
                ) => (
                  <tr
                    key={
                      automation.id
                    }
                    className="border-t border-inherit"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                            index < 3
                              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
                              : darkMode
                                ? 'bg-slate-700 text-slate-300'
                                : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {index + 1}
                        </span>

                        <div>
                          <p className="text-sm font-semibold">
                            {
                              automation.name
                            }
                          </p>

                          <p
                            className={`mt-1 text-[10px] ${
                              darkMode
                                ? 'text-slate-500'
                                : 'text-slate-400'
                            }`}
                          >
                            {shortId(
                              automation.id,
                            )}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-xs">
                      {
                        automation.platform
                      }
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold">
                      {automation.executions.toLocaleString()}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`text-sm font-semibold ${getSuccessRateClass(
                          automation.successRate,
                        )}`}
                      >
                        {
                          automation.successRate
                        }
                        %
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold">
                      {automation.failed.toLocaleString()}
                    </td>

                    <td className="px-5 py-4 text-xs">
                      {formatDuration(
                        automation.averageDuration,
                      )}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyChartState
          darkMode={darkMode}
          message="No automation performance data yet."
        />
      )}
    </section>
  )
}

function InsightCard({
  icon,
  label,
  title,
  description,
  darkMode,
  tone,
}) {
  const toneClass =
    tone === 'success'
      ? 'bg-emerald-500/10 text-emerald-500'
      : 'bg-rose-500/10 text-rose-500'

  return (
    <article
      className={`rounded-2xl border p-5 ${
        darkMode
          ? 'border-slate-700 bg-slate-800'
          : 'border-slate-200 bg-white'
      }`}
    >
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${toneClass}`}
      >
        {icon}
      </div>

      <p
        className={`mt-5 text-[10px] font-semibold uppercase tracking-[0.14em] ${
          darkMode
            ? 'text-slate-500'
            : 'text-slate-400'
        }`}
      >
        {label}
      </p>

      <h3 className="mt-2 text-lg font-semibold">
        {title}
      </h3>

      <p
        className={`mt-3 text-sm leading-7 ${
          darkMode
            ? 'text-slate-400'
            : 'text-slate-500'
        }`}
      >
        {description}
      </p>
    </article>
  )
}

function EmptyChartState({
  darkMode,
  message,
  compact = false,
}) {
  return (
    <div
      className={`flex items-center justify-center ${
        compact
          ? 'min-h-[250px]'
          : 'min-h-[340px]'
      }`}
    >
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

function TableHeading({
  children,
}) {
  return (
    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em]">
      {children}
    </th>
  )
}

function getSuccessRateClass(
  successRate,
) {
  if (successRate >= 98) {
    return 'text-emerald-500'
  }

  if (successRate >= 95) {
    return 'text-amber-500'
  }

  return 'text-rose-500'
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
    return `${Math.round(
      milliseconds,
    )}ms`
  }

  return `${(
    milliseconds / 1000
  ).toFixed(1)}s`
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

export default Analytics
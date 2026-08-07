import {
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react'

const toneStyles = {
  indigo: {
    wrapper:
      'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300',
  },
  blue: {
    wrapper:
      'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
  },
  emerald: {
    wrapper:
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  },
  rose: {
    wrapper:
      'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
  },
  amber: {
    wrapper:
      'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  },
  violet: {
    wrapper:
      'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300',
  },
}

function MetricCard({
  metric,
  icon,
  darkMode,
}) {
  const tone =
    toneStyles[metric?.tone] ||
    toneStyles.indigo

  const hasTrend =
    metric?.trend === 'up' ||
    metric?.trend === 'down'

  const isPositive =
    metric?.trend === 'up'

  return (
    <article
      className={`rounded-2xl border p-5 ${
        darkMode
          ? 'border-slate-700 bg-slate-800'
          : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p
            className={`text-xs font-medium ${
              darkMode
                ? 'text-slate-400'
                : 'text-slate-500'
            }`}
          >
            {metric?.label || 'Metric'}
          </p>

          <p className="mt-3 text-3xl font-bold tracking-[-0.04em]">
            {metric?.value ?? '—'}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone.wrapper}`}
        >
          {icon}
        </div>
      </div>

      <div className="mt-5 min-h-[20px]">
        {hasTrend && metric?.change ? (
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 text-xs font-semibold ${
                isPositive
                  ? 'text-emerald-500'
                  : 'text-rose-500'
              }`}
            >
              {isPositive ? (
                <ArrowUpRight size={14} />
              ) : (
                <ArrowDownRight size={14} />
              )}

              {metric.change}
            </span>

            <span
              className={`text-xs ${
                darkMode
                  ? 'text-slate-500'
                  : 'text-slate-400'
              }`}
            >
              vs previous period
            </span>
          </div>
        ) : (
          <p
            className={`text-xs ${
              darkMode
                ? 'text-slate-500'
                : 'text-slate-400'
            }`}
          >
            {metric?.helper ||
              'Live workspace data'}
          </p>
        )}
      </div>
    </article>
  )
}

export default MetricCard
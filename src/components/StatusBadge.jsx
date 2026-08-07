function StatusBadge({ status }) {
  const normalized = String(
    status || '',
  ).toLowerCase()

  const styles = {
    successful:
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    failed:
      'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
    retrying:
      'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
    running:
      'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
    warning:
      'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
    critical:
      'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
    healthy:
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    paused:
      'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    draft:
      'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300',
  }

  const label = normalized
    ? normalized.charAt(0).toUpperCase() +
      normalized.slice(1)
    : 'Unknown'

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${
        styles[normalized] ||
        'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
      }`}
    >
      {label}
    </span>
  )
}

export default StatusBadge
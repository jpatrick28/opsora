import { useEffect } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Copy,
  Database,
  RefreshCw,
  X,
} from 'lucide-react'
import StatusBadge from './StatusBadge'

function RunDetailDrawer({
  run,
  darkMode,
  onClose,
  onRetry,
  onCopyId,
}) {
  useEffect(() => {
    if (!run) {
      return undefined
    }

    const previousOverflow =
      document.body.style.overflow

    function handleEscape(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.body.style.overflow = 'hidden'

    window.addEventListener(
      'keydown',
      handleEscape,
    )

    return () => {
      document.body.style.overflow =
        previousOverflow

      window.removeEventListener(
        'keydown',
        handleEscape,
      )
    }
  }, [run, onClose])

  if (!run) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[70]">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close run details"
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="run-detail-title"
        className={`opsora-scrollbar absolute inset-y-0 right-0 flex w-full max-w-[580px] flex-col overflow-y-auto border-l shadow-2xl ${
          darkMode
            ? 'border-slate-700 bg-slate-800 text-white'
            : 'border-slate-200 bg-white text-slate-900'
        }`}
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-5 border-b border-inherit bg-inherit px-5 py-5 sm:px-7">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-500">
              Execution record
            </p>

            <h2
              id="run-detail-title"
              className="mt-2 text-xl font-bold"
            >
              {run.automation}
            </h2>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge
                status={run.status}
              />

              <span
                className={`text-xs ${
                  darkMode
                    ? 'text-slate-500'
                    : 'text-slate-400'
                }`}
              >
                {run.id}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
              darkMode
                ? 'border-slate-700 hover:bg-slate-900'
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <X size={18} />
          </button>
        </header>

        <div className="space-y-6 p-5 sm:p-7">
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailField
              label="Platform"
              value={run.platform}
              darkMode={darkMode}
            />

            <DetailField
              label="Owner"
              value={run.owner}
              darkMode={darkMode}
            />

            <DetailField
              label="Trigger"
              value={run.trigger}
              darkMode={darkMode}
            />

            <DetailField
              label="Started"
              value={run.startedAt}
              darkMode={darkMode}
            />

            <DetailField
              label="Duration"
              value={run.duration}
              darkMode={darkMode}
            />

            <DetailField
              label="Records processed"
              value={run.recordsProcessed}
              darkMode={darkMode}
            />
          </div>

          {run.errorMessage && (
            <section className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-5">
              <div className="flex items-start gap-3">
                <AlertCircle
                  size={19}
                  className="mt-0.5 shrink-0 text-rose-500"
                />

                <div>
                  <h3 className="text-sm font-semibold text-rose-500">
                    Execution error
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-rose-400">
                    {run.errorMessage}
                  </p>
                </div>
              </div>
            </section>
          )}

          <section>
            <div className="flex items-center gap-3">
              <Clock3
                size={17}
                className="text-indigo-500"
              />

              <h3 className="text-sm font-semibold">
                Execution steps
              </h3>
            </div>

            <div className="mt-4 space-y-3">
              {run.steps.map(
                (step, index) => (
                  <article
                    key={`${run.id}-${step.name}`}
                    className={`rounded-2xl border p-4 ${
                      darkMode
                        ? 'border-slate-700 bg-slate-900/50'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          step.status ===
                          'Successful'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : step.status ===
                                'Retrying'
                              ? 'bg-amber-500/10 text-amber-500'
                              : 'bg-rose-500/10 text-rose-500'
                        }`}
                      >
                        {step.status ===
                        'Successful' ? (
                          <CheckCircle2
                            size={16}
                          />
                        ) : step.status ===
                          'Retrying' ? (
                          <RefreshCw
                            size={16}
                          />
                        ) : (
                          <AlertCircle
                            size={16}
                          />
                        )}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-indigo-500">
                              Step {index + 1}
                            </p>

                            <h4 className="mt-1 text-sm font-semibold">
                              {step.name}
                            </h4>
                          </div>

                          <span
                            className={`shrink-0 text-xs ${
                              darkMode
                                ? 'text-slate-500'
                                : 'text-slate-400'
                            }`}
                          >
                            {step.duration}
                          </span>
                        </div>

                        <div className="mt-3">
                          <StatusBadge
                            status={
                              step.status
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </article>
                ),
              )}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3">
              <Database
                size={17}
                className="text-indigo-500"
              />

              <h3 className="text-sm font-semibold">
                Input payload
              </h3>
            </div>

            <pre
              className={`opsora-scrollbar mt-4 overflow-x-auto rounded-2xl border p-4 text-xs leading-6 ${
                darkMode
                  ? 'border-slate-700 bg-slate-950 text-slate-300'
                  : 'border-slate-200 bg-slate-950 text-slate-200'
              }`}
            >
              {JSON.stringify(
                run.input,
                null,
                2,
              )}
            </pre>
          </section>
        </div>

        <footer
          className={`sticky bottom-0 mt-auto flex flex-col gap-3 border-t p-5 sm:flex-row sm:justify-end ${
            darkMode
              ? 'border-slate-700 bg-slate-800'
              : 'border-slate-200 bg-white'
          }`}
        >
          <button
            type="button"
            onClick={() => onCopyId(run)}
            className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold ${
              darkMode
                ? 'border-slate-700 hover:bg-slate-900'
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Copy size={15} />
            Copy run ID
          </button>

          {run.status !== 'Successful' && (
            <button
              type="button"
              onClick={() => onRetry(run)}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              <RefreshCw size={15} />
              Retry execution
            </button>
          )}
        </footer>
      </aside>
    </div>
  )
}

function DetailField({
  label,
  value,
  darkMode,
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        darkMode
          ? 'border-slate-700 bg-slate-900/50'
          : 'border-slate-200 bg-slate-50'
      }`}
    >
      <p
        className={`text-[9px] font-semibold uppercase tracking-[0.14em] ${
          darkMode
            ? 'text-slate-500'
            : 'text-slate-400'
        }`}
      >
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold">
        {value}
      </p>
    </div>
  )
}

export default RunDetailDrawer
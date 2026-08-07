import { useWorkspace } from '../context/WorkspaceContext'

function PagePlaceholder({
  eyebrow,
  title,
  description,
}) {
  const {
    theme,
    isSidebarCollapsed,
  } = useWorkspace()

  const darkMode = theme === 'dark'

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
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-500">
          {eyebrow}
        </p>

        <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em]">
          {title}
        </h2>

        <p
          className={`mt-3 max-w-2xl text-sm leading-7 ${
            darkMode
              ? 'text-slate-400'
              : 'text-slate-500'
          }`}
        >
          {description}
        </p>

        <div
          className={`mt-8 rounded-3xl border border-dashed p-10 text-center ${
            darkMode
              ? 'border-slate-700 bg-slate-800/50'
              : 'border-slate-300 bg-white'
          }`}
        >
          <p className="text-sm font-semibold">
            Module ready for implementation
          </p>

          <p
            className={`mt-2 text-xs ${
              darkMode
                ? 'text-slate-500'
                : 'text-slate-400'
            }`}
          >
            This module will be connected to
            Supabase in a later build stage.
          </p>
        </div>
      </div>
    </main>
  )
}

export default PagePlaceholder
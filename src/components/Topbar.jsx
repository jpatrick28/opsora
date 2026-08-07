import {
  Bell,
  ChevronDown,
  Menu,
  Moon,
  Search,
  Sun,
} from 'lucide-react'

import { useWorkspace } from '../context/WorkspaceContext'
import RealtimeStatus from './RealtimeStatus'

const workspaces = [
  'Synervant Operations',
  'Client Automations',
  'Internal Systems',
]

const viewTitles = {
  overview: 'Overview',
  automations: 'Automations',
  'execution-logs': 'Execution Logs',
  connections: 'Connections',
  alerts: 'Alerts',
  analytics: 'Analytics',
  team: 'Team',
  settings: 'Settings',
}

function Topbar() {
  const {
    activeView,
    isSidebarCollapsed,
    setIsMobileSidebarOpen,
    theme,
    toggleTheme,
    workspace,
    setWorkspace,
  } = useWorkspace()

  const darkMode =
    theme === 'dark'

  return (
    <header
      className={`fixed inset-x-0 top-0 z-30 h-[72px] border-b backdrop-blur-xl transition-[padding] duration-300 ${
        isSidebarCollapsed
          ? 'lg:pl-[82px]'
          : 'lg:pl-[260px]'
      } ${
        darkMode
          ? 'border-slate-800 bg-[#0f172a]/90'
          : 'border-slate-200 bg-white/90'
      }`}
    >
      <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() =>
              setIsMobileSidebarOpen(true)
            }
            aria-label="Open mobile sidebar"
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border lg:hidden ${
              darkMode
                ? 'border-slate-700 text-slate-300'
                : 'border-slate-200 text-slate-600'
            }`}
          >
            <Menu size={18} />
          </button>

          <div className="min-w-0">
            <p
              className={`truncate text-[10px] font-semibold uppercase tracking-[0.16em] ${
                darkMode
                  ? 'text-slate-500'
                  : 'text-slate-400'
              }`}
            >
              Automation workspace
            </p>

            <h1
              className={`mt-1 truncate text-base font-semibold ${
                darkMode
                  ? 'text-white'
                  : 'text-slate-900'
              }`}
            >
              {viewTitles[activeView] ||
                'Opsora'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden lg:block">
            <RealtimeStatus
              darkMode={darkMode}
            />
          </div>

          <label
            className={`hidden min-h-[40px] w-[260px] items-center gap-3 rounded-xl border px-4 xl:flex ${
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
              placeholder="Search automations or runs"
              className={`w-full bg-transparent text-xs outline-none ${
                darkMode
                  ? 'text-white placeholder:text-slate-600'
                  : 'text-slate-800 placeholder:text-slate-400'
              }`}
            />
          </label>

          <label className="relative hidden md:block">
            <select
              value={workspace}
              onChange={(event) =>
                setWorkspace(
                  event.target.value,
                )
              }
              className={`min-h-[40px] max-w-[210px] appearance-none rounded-xl border px-3 pr-9 text-xs font-semibold outline-none ${
                darkMode
                  ? 'border-slate-700 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              {workspaces.map(
                (workspaceName) => (
                  <option
                    key={
                      workspaceName
                    }
                    value={
                      workspaceName
                    }
                  >
                    {
                      workspaceName
                    }
                  </option>
                ),
              )}
            </select>

            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-40"
            />
          </label>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={
              darkMode
                ? 'Use light theme'
                : 'Use dark theme'
            }
            className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${
              darkMode
                ? 'border-slate-700 bg-slate-900 text-amber-300'
                : 'border-slate-200 bg-white text-slate-500'
            }`}
          >
            {darkMode ? (
              <Sun size={18} />
            ) : (
              <Moon size={18} />
            )}
          </button>

          <button
            type="button"
            aria-label="Open notifications"
            className={`relative flex h-10 w-10 items-center justify-center rounded-xl border ${
              darkMode
                ? 'border-slate-700 bg-slate-900 text-slate-300'
                : 'border-slate-200 bg-white text-slate-500'
            }`}
          >
            <Bell size={18} />

            <span
              className={`absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-2 bg-red-500 ${
                darkMode
                  ? 'border-slate-900'
                  : 'border-white'
              }`}
            />
          </button>

          <button
            type="button"
            aria-label="Open profile menu"
            className="ml-1 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-xs font-bold text-indigo-700"
          >
            JP
          </button>
        </div>
      </div>
    </header>
  )
}

export default Topbar
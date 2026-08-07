import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bot,
  ChevronLeft,
  ChevronRight,
  Network,
  Plug,
  Settings,
  Users,
  Workflow,
} from 'lucide-react'
import { useWorkspace } from '../context/WorkspaceContext'

const navigationItems = [
  {
    id: 'overview',
    label: 'Overview',
    icon: Activity,
  },
  {
    id: 'automations',
    label: 'Automations',
    icon: Workflow,
  },
  {
    id: 'execution-logs',
    label: 'Execution Logs',
    icon: Network,
  },
  {
    id: 'connections',
    label: 'Connections',
    icon: Plug,
  },
  {
    id: 'alerts',
    label: 'Alerts',
    icon: AlertTriangle,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
  },
  {
    id: 'team',
    label: 'Team',
    icon: Users,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
  },
]

function AppSidebar() {
  const {
    activeView,
    navigateTo,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    theme,
  } = useWorkspace()

  const darkMode = theme === 'dark'

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 hidden border-r transition-[width] duration-300 lg:flex lg:flex-col ${
        isSidebarCollapsed
          ? 'w-[82px]'
          : 'w-[260px]'
      } ${
        darkMode
          ? 'border-slate-800 bg-[#0f172a]'
          : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex h-[72px] items-center border-b border-inherit px-4">
        <button
          type="button"
          onClick={() =>
            navigateTo('overview')
          }
          className={`flex items-center ${
            isSidebarCollapsed
              ? 'justify-center'
              : 'gap-3'
          }`}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
            <Bot size={20} />
          </span>

          {!isSidebarCollapsed && (
            <span className="min-w-0 text-left">
              <span
                className={`block truncate text-base font-bold ${
                  darkMode
                    ? 'text-white'
                    : 'text-slate-900'
                }`}
              >
                Opsora
              </span>

              <span
                className={`mt-0.5 block truncate text-[9px] font-semibold uppercase tracking-[0.16em] ${
                  darkMode
                    ? 'text-slate-500'
                    : 'text-slate-400'
                }`}
              >
                Automation operations
              </span>
            </span>
          )}
        </button>
      </div>

      <nav className="opsora-scrollbar flex-1 overflow-y-auto px-3 py-5">
        <p
          className={`mb-3 px-3 text-[9px] font-semibold uppercase tracking-[0.18em] ${
            isSidebarCollapsed
              ? 'sr-only'
              : darkMode
                ? 'text-slate-600'
                : 'text-slate-400'
          }`}
        >
          Workspace
        </p>

        <div className="space-y-1.5">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive =
              activeView === item.id

            return (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  navigateTo(item.id)
                }
                title={
                  isSidebarCollapsed
                    ? item.label
                    : undefined
                }
                className={`group flex min-h-[44px] w-full items-center rounded-xl transition ${
                  isSidebarCollapsed
                    ? 'justify-center px-2'
                    : 'gap-3 px-3'
                } ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15'
                    : darkMode
                      ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon
                  size={18}
                  className="shrink-0"
                />

                {!isSidebarCollapsed && (
                  <span className="text-sm font-medium">
                    {item.label}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </nav>

      <div className="border-t border-inherit p-3">
        <button
          type="button"
          onClick={() =>
            setIsSidebarCollapsed(
              (current) => !current,
            )
          }
          aria-label={
            isSidebarCollapsed
              ? 'Expand sidebar'
              : 'Collapse sidebar'
          }
          className={`flex min-h-[42px] w-full items-center rounded-xl border border-inherit transition ${
            isSidebarCollapsed
              ? 'justify-center'
              : 'justify-between px-3'
          } ${
            darkMode
              ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          {!isSidebarCollapsed && (
            <span className="text-xs font-medium">
              Collapse sidebar
            </span>
          )}

          {isSidebarCollapsed ? (
            <ChevronRight size={17} />
          ) : (
            <ChevronLeft size={17} />
          )}
        </button>
      </div>
    </aside>
  )
}

export default AppSidebar
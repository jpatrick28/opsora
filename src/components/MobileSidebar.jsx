import { useEffect } from 'react'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bot,
  Network,
  Plug,
  Settings,
  Users,
  Workflow,
  X,
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

function MobileSidebar() {
  const {
    activeView,
    navigateTo,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    theme,
    workspace,
  } = useWorkspace()

  const darkMode = theme === 'dark'

  useEffect(() => {
    if (!isMobileSidebarOpen) {
      return undefined
    }

    const previousOverflow =
      document.body.style.overflow

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsMobileSidebarOpen(false)
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
  }, [
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
  ])

  if (!isMobileSidebarOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        onClick={() =>
          setIsMobileSidebarOpen(false)
        }
        aria-label="Close mobile sidebar"
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
      />

      <aside
        className={`relative flex h-full w-[88%] max-w-[320px] flex-col border-r shadow-2xl ${
          darkMode
            ? 'border-slate-800 bg-[#0f172a]'
            : 'border-slate-200 bg-white'
        }`}
      >
        <div className="flex h-[72px] items-center justify-between border-b border-inherit px-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Bot size={20} />
            </span>

            <div>
              <p
                className={`font-bold ${
                  darkMode
                    ? 'text-white'
                    : 'text-slate-900'
                }`}
              >
                Opsora
              </p>

              <p
                className={`mt-0.5 text-[9px] uppercase tracking-[0.15em] ${
                  darkMode
                    ? 'text-slate-500'
                    : 'text-slate-400'
                }`}
              >
                {workspace}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setIsMobileSidebarOpen(false)
            }
            aria-label="Close sidebar"
            className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
              darkMode
                ? 'border-slate-700 text-slate-300'
                : 'border-slate-200 text-slate-500'
            }`}
          >
            <X size={19} />
          </button>
        </div>

        <nav className="opsora-scrollbar flex-1 overflow-y-auto px-4 py-5">
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
                  className={`flex min-h-[46px] w-full items-center gap-3 rounded-xl px-4 text-sm font-medium transition ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : darkMode
                        ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              )
            })}
          </div>
        </nav>

        <div className="border-t border-inherit p-4">
          <div
            className={`rounded-2xl border p-4 ${
              darkMode
                ? 'border-slate-700 bg-slate-900'
                : 'border-slate-200 bg-slate-50'
            }`}
          >
            <p
              className={`text-xs font-semibold ${
                darkMode
                  ? 'text-white'
                  : 'text-slate-900'
              }`}
            >
              Automation health
            </p>

            <p
              className={`mt-1 text-[10px] ${
                darkMode
                  ? 'text-slate-500'
                  : 'text-slate-400'
              }`}
            >
              All monitored services operational
            </p>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full w-[96%] rounded-full bg-emerald-500" />
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default MobileSidebar
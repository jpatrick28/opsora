import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

const WorkspaceContext = createContext(null)

const validViews = [
  'overview',
  'automations',
  'execution-logs',
  'connections',
  'alerts',
  'analytics',
  'team',
  'settings',
]

export function WorkspaceProvider({
  children,
}) {
  const [activeView, setActiveView] =
    useState(() => {
      const savedView = localStorage.getItem(
        'opsora-active-view',
      )

      return validViews.includes(savedView)
        ? savedView
        : 'overview'
    })

  const [
    isSidebarCollapsed,
    setIsSidebarCollapsed,
  ] = useState(() => {
    return (
      localStorage.getItem(
        'opsora-sidebar-collapsed',
      ) === 'true'
    )
  })

  const [
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
  ] = useState(false)

  const [theme, setTheme] = useState(() => {
    return (
      localStorage.getItem(
        'opsora-theme',
      ) || 'light'
    )
  })

  const [workspace, setWorkspace] =
    useState(() => {
      return (
        localStorage.getItem(
          'opsora-workspace',
        ) || 'Synervant Operations'
      )
    })

  useEffect(() => {
    localStorage.setItem(
      'opsora-active-view',
      activeView,
    )
  }, [activeView])

  useEffect(() => {
    localStorage.setItem(
      'opsora-sidebar-collapsed',
      String(isSidebarCollapsed),
    )
  }, [isSidebarCollapsed])

  useEffect(() => {
    localStorage.setItem(
      'opsora-theme',
      theme,
    )

    document.documentElement.classList.toggle(
      'dark',
      theme === 'dark',
    )
  }, [theme])

  useEffect(() => {
    localStorage.setItem(
      'opsora-workspace',
      workspace,
    )
  }, [workspace])

  function navigateTo(view) {
    if (!validViews.includes(view)) {
      return
    }

    setActiveView(view)
    setIsMobileSidebarOpen(false)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  function toggleTheme() {
    setTheme((current) =>
      current === 'dark'
        ? 'light'
        : 'dark',
    )
  }

  const value = useMemo(
    () => ({
      activeView,
      navigateTo,

      isSidebarCollapsed,
      setIsSidebarCollapsed,

      isMobileSidebarOpen,
      setIsMobileSidebarOpen,

      theme,
      setTheme,
      toggleTheme,

      workspace,
      setWorkspace,
    }),
    [
      activeView,
      isSidebarCollapsed,
      isMobileSidebarOpen,
      theme,
      workspace,
    ],
  )

  return (
    <WorkspaceContext.Provider
      value={value}
    >
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const context = useContext(
    WorkspaceContext,
  )

  if (!context) {
    throw new Error(
      'useWorkspace must be used inside WorkspaceProvider',
    )
  }

  return context
}
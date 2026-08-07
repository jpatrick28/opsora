import AppSidebar from './components/AppSidebar'
import AppLoader from './components/AppLoader'
import MobileSidebar from './components/MobileSidebar'
import Topbar from './components/Topbar'

import {
  WorkspaceProvider,
  useWorkspace,
} from './context/WorkspaceContext'

import {
  AuthProvider,
  useAuth,
} from './context/AuthContext'

import AuthPage from './pages/AuthPage'
import WorkspaceSetup from './pages/WorkspaceSetup'
import Overview from './pages/Overview'
import Automations from './pages/Automations'
import ExecutionLogs from './pages/ExecutionLogs'
import Connections from './pages/Connections'
import Alerts from './pages/Alerts'
import Analytics from './pages/Analytics'
import Team from './pages/Team'
import Settings from './pages/Settings'
import InviteSetup from './pages/InviteSetup'

function Dashboard() {
  const { activeView } = useWorkspace()

  const pages = {
    overview: <Overview />,
    automations: <Automations />,
    'execution-logs': <ExecutionLogs />,
    connections: <Connections />,
    alerts: <Alerts />,
    analytics: <Analytics />,
    team: <Team />,
    settings: <Settings />,
  }

  return (
    <div className="min-h-screen">
      <AppSidebar />
      <Topbar />
      <MobileSidebar />

      {pages[activeView] || <Overview />}
    </div>
  )
}

function AppGate() {
  const {
    user,
    workspaceRecord,
    loading,
    isInviteFlow,
  } = useAuth()

  if (loading) {
    return <AppLoader />
  }

  if (!user) {
    return <AuthPage />
  }

  if (
    user &&
    isInviteFlow &&
    !workspaceRecord
  ) {
    return <InviteSetup />
  }

  if (!workspaceRecord) {
    return <WorkspaceSetup />
  }

  return (
    <WorkspaceProvider>
      <Dashboard />
    </WorkspaceProvider>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppGate />
    </AuthProvider>
  )
}

export default App
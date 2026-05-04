import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { notify } from './lib/notify';
import { useLottie } from 'lottie-react';
import welcomeAnimation from './lottie/Welcome.json';
import profileUserCardAnimation from './lottie/Profile user card.json';
import { Toaster } from './components/ui/sonner';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import LoginPage from './pages/LoginPage';
import TasksPage from './pages/TasksPage';
import TeamPage from './pages/TeamPage';
import FinancialPage from './pages/FinancialPage';
import RolesPage from './pages/RolesPage';
import SettingsPage from './pages/SettingsPage';
import PerformancePage from './pages/PerformancePage';
import ReportsPage from './pages/ReportsPage';
import NotesPage from './pages/NotesPage';
import HelpPage from './pages/HelpPage';
import TrashPage from './pages/TrashPage';
import SheetPage from './pages/SheetPage';
import WorkspaceSetup from './components/WorkspaceSetup';
import { MultiStepLoader } from './components/ui/multi-step-loader';
import ManagementApp from './management/ManagementApp';
import MemberApp from './member/MemberApp';
import {
  SkeletonStyles,
  DashboardSkeleton, TasksSkeleton, TeamSkeleton,
  FinancialSkeleton, RolesSkeleton, ReportsSkeleton,
  PerformanceSkeleton, NotesSkeleton, HelpSkeleton, SettingsSkeleton,
  AppShellSkeleton,
} from './components/Skeleton';

const pageConfig = {
  dashboard:   { title: 'Dashboard',     subtitle: 'Welcome back, Admin!' },
  tasks:       { title: 'Tasks',          subtitle: 'Manage and track all tasks' },
  team:        { title: 'Team',           subtitle: 'View and manage team members' },
  financial:   { title: 'Financial',      subtitle: 'Track budgets and payments' },
  roles:       { title: 'Management',     subtitle: 'Tags, categories, roles & permissions' },
  performance: { title: 'Performance',    subtitle: 'Team performance metrics and goals' },
  reports:     { title: 'Reports',        subtitle: 'Analytics and insights' },
  notes:       { title: 'Scribe',         subtitle: 'Notes, sheets & shared docs' },
  sheet:       { title: 'Sheet',          subtitle: 'Spreadsheet editor' },
  help:        { title: 'Help & Support', subtitle: 'Team help requests and support' },
  settings:    { title: 'Settings',       subtitle: 'Customize your workspace' },
  trash:       { title: 'Archive',        subtitle: 'Deleted tasks and notes' },
};

const SKELETON_MAP = {
  dashboard:   DashboardSkeleton,
  tasks:       TasksSkeleton,
  team:        TeamSkeleton,
  financial:   FinancialSkeleton,
  roles:       RolesSkeleton,
  performance: PerformanceSkeleton,
  reports:     ReportsSkeleton,
  notes:       NotesSkeleton,
  help:        HelpSkeleton,
  settings:    SettingsSkeleton,
  trash:       NotesSkeleton, // Reuse notes skeleton for trash
};

function renderPage(activeItem, extraProps = {}) {
  switch (activeItem) {
    case 'tasks':       return <TasksPage currentUser={{ name: 'Admin', role: 'Administrator', avatar: 'A', color: '#3B5BFC' }} onNavigateToNotes={() => handleNav('notes')} {...extraProps} />;
    case 'team':        return <TeamPage />;
    case 'financial':   return <FinancialPage />;
    case 'roles':       return <RolesPage />;
    case 'performance': return <PerformancePage />;
    case 'reports':     return <ReportsPage />;
    case 'notes':       return <NotesPage onNavigateToTask={() => handleNav('tasks')} />;
    case 'sheet':       return <SheetPage />;
    case 'help':        return <HelpPage />;
    case 'trash':       return <TrashPage />;
    case 'settings':    return <SettingsPage />;
    default:            return <Dashboard {...extraProps} />;
  }
}

function ProfileWelcomeOverlay({ onDone }) {
  const [fading, setFading] = useState(false);

  const dismiss = () => {
    setFading(true);
    setTimeout(onDone, 500);
  };

  const { View } = useLottie({
    animationData: profileUserCardAnimation,
    loop: false,
    autoplay: true,
    onComplete: dismiss,
    style: { width: '100vw', height: '100vh' },
  });

  useEffect(() => {
    const t = setTimeout(dismiss, 4000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(255,255,255,0.95)',
        pointerEvents: 'none',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.5s ease',
      }}
    >
      {View}
    </div>
  );
}

function WelcomeOverlay({ onDone }) {
  const [fading, setFading] = useState(false);

  const dismiss = () => {
    setFading(true);
    setTimeout(onDone, 400);
  };

  const { View } = useLottie({
    animationData: welcomeAnimation,
    loop: false,
    autoplay: true,
    onComplete: dismiss,
    style: { width: '100vw', height: '100vh' },
  });

  useEffect(() => {
    const t = setTimeout(dismiss, 4000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
        background: 'rgba(15,20,40,0.35)',
        pointerEvents: 'none',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.4s ease',
      }}
    >
      {View}
    </div>
  );
}

function PlanInactiveOverlay() {
  const { triggerPlanBlink } = useApp();

  return (
    <div
      onClick={() => triggerPlanBlink()}
      style={{ position: 'absolute', inset: 0, zIndex: 500, cursor: 'default', background: 'transparent' }}
    />
  );
}

function AppShell() {
  const [auth, setAuth]             = useState(null);
  const [activeItem, setActiveItem] = useState('dashboard');
  const [dashVisible, setDashVisible] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [pageKey, setPageKey] = useState(0);
  const [visitedPages, setVisitedPages] = useState(new Set());
  const [openCreateOnMount, setOpenCreateOnMount] = useState(false);
  const [showWorkspaceSetup, setShowWorkspaceSetup] = useState(false);
  const [workspace, setWorkspace] = useState(null);
  const [showLoader, setShowLoader] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  const loadingStates = [
    { text: 'Setting up your workspace…' },
    { text: 'Loading your projects…' },
    { text: 'Syncing team members…' },
    { text: 'Preparing your dashboard…' },
    { text: 'Almost there…' },
  ];
  const { dataLoaded, refreshData, isPlanActive, setShowDonutWelcome } = useApp();

  // Once data loads after initial login, clear the initial loading flag
  // and mark dashboard as visited
  useEffect(() => {
    if (initialLoading && dataLoaded) {
      setInitialLoading(false);
      setVisitedPages(new Set(['dashboard']));
    }
  }, [dataLoaded, initialLoading]);

  const handleLogin = (role, memberId, email) => {
    if (email) {
      localStorage.setItem('userEmail', email);
    }
    setInitialLoading(true);
    setVisitedPages(new Set());
    setAuth({ role, memberId });
    setTimeout(() => {
      setDashVisible(true);
      setShowWorkspaceSetup(true);
    }, 50);
  };

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    setAuth(null);
    setDashVisible(false);
    setInitialLoading(false);
    setVisitedPages(new Set());
    setActiveItem('dashboard');
    setShowWorkspaceSetup(false);
    setWorkspace(null);
  };

  const handleNav = (item) => {
    if (item === activeItem) {
      refreshData();
      return;
    }

    if (!visitedPages.has(item)) {
      // First visit — show skeleton
      setPageLoading(true);
      setTimeout(() => {
        setActiveItem(item);
        setTimeout(() => {
          setPageLoading(false);
          setVisitedPages(prev => new Set([...prev, item]));
        }, 500);
      }, 50);
    } else {
      // Already visited — smooth slide-up + fade via CSS animation
      setPageKey(k => k + 1);
      setActiveItem(item);
    }
  };

  if (!auth) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (auth.role === 'member') {
    return <MemberApp memberId={auth.memberId} onLogout={handleLogout} visible={dashVisible} />;
  }

  if (auth.role === 'management') {
    return <ManagementApp memberId={auth.memberId} onLogout={handleLogout} visible={dashVisible} />;
  }

  const page = pageConfig[activeItem] || pageConfig['dashboard'];
  const SkeletonComp = SKELETON_MAP[activeItem] || DashboardSkeleton;

  // Callback from Dashboard empty state — navigate to Tasks and open create modal
  const handleCreateTaskFromDashboard = () => {
    setOpenCreateOnMount(true);
    handleNav('tasks');
  };

  // Extra props passed to the active page
  const extraProps = activeItem === 'tasks'
    ? { openCreateOnMount, onCreateMounted: () => setOpenCreateOnMount(false) }
    : activeItem === 'dashboard'
    ? { onCreateTask: handleCreateTaskFromDashboard }
    : {};

  // Show full shell skeleton only on the first load after login
  if (initialLoading) {
    return (
      <>
        <SkeletonStyles />
        <AppShellSkeleton page={activeItem} />
      </>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Dashboard — blurred when workspace setup is showing */}
      <div style={{
        display: 'flex', width: '100%', height: '100%',
        background: 'var(--bg-main)',
        opacity: dashVisible ? 1 : 0,
        transform: dashVisible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease, background 0.25s ease',
        filter: showWorkspaceSetup || showLoader ? 'blur(4px) brightness(0.85)' : 'none',
        pointerEvents: showWorkspaceSetup || showLoader ? 'none' : 'auto',
      }}>
        <SkeletonStyles />
        <Sidebar activeItem={activeItem} setActiveItem={handleNav} onLogout={handleLogout} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100%', background: 'var(--bg-main)', overflow: 'hidden', transition: 'background 0.25s ease', position: 'relative' }}>
          <Header title={page.title} subtitle={page.subtitle} />
          <div
            key={pageKey}
            className="page-enter"
            style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', position: 'relative' }}
          >
            {pageLoading ? <SkeletonComp /> : renderPage(activeItem, extraProps)}
            {!isPlanActive && activeItem !== 'settings' && <PlanInactiveOverlay />}
          </div>
        </div>
      </div>

      {/* Workspace setup overlay */}
      {showWorkspaceSetup && (
        <WorkspaceSetup
          onComplete={(ws) => {
            setWorkspace(ws);
            setShowWorkspaceSetup(false);
            setShowLoader(true);
          }}
        />
      )}

      {/* Multi-step loader */}
      <MultiStepLoader
        loadingStates={loadingStates}
        loading={showLoader}
        duration={1200}
        loop={false}
        onComplete={() => { setShowLoader(false); setShowWelcome(true); }}
      />

      {/* Welcome lottie overlay */}
      {showWelcome && (
        <WelcomeOverlay onDone={() => { 
          setShowWelcome(false); 
          // Only show donut welcome if user hasn't seen it before
          const hasSeenWelcome = localStorage.getItem('hasSeenDonutWelcome');
          if (hasSeenWelcome !== 'true') {
            setShowDonutWelcome(true);
          }
        }} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
      <Toaster />
    </AppProvider>
  );
}

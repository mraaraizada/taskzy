import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Toaster } from './components/ui/sonner';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AdminProjectDashboardPage from './pages/AdminProjectDashboardPage';
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
import {
  SkeletonStyles,
  DashboardSkeleton, TasksSkeleton, TeamSkeleton,
  FinancialSkeleton, RolesSkeleton, ReportsSkeleton,
  PerformanceSkeleton, NotesSkeleton, SettingsSkeleton,
} from './components/Skeleton';

const HelpSkeleton = () => (
  <div style={{ flex: 1, padding: '24px 28px', display: 'flex', gap: 20 }}>
    <div className="skeleton" style={{ flex: 1, height: 500, borderRadius: 18 }} />
    <div className="skeleton" style={{ width: 400, height: 500, borderRadius: 18 }} />
  </div>
);

const pageConfig = {
  dashboard:   { title: 'Project Dashboard', subtitle: 'Monitor organizations and subscriptions' },
  tasks:       { title: 'Tasks',          subtitle: 'Manage and track all tasks' },
  team:        { title: 'Team',           subtitle: 'View and manage team members' },
  financial:   { title: 'Financial',      subtitle: 'Track budgets and payments' },
  roles:       { title: 'Management',     subtitle: 'Tags, categories, roles & permissions' },
  performance: { title: 'Performance',    subtitle: 'Team performance metrics and goals' },
  reports:     { title: 'Reports',        subtitle: 'Analytics and insights' },
  notes:       { title: 'Notes',          subtitle: 'Your personal notes and ideas' },
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
  trash:       NotesSkeleton,
};

function renderPage(activeItem) {
  switch (activeItem) {
    case 'tasks':       return <TasksPage currentUser={{ name: 'Admin', role: 'Administrator', avatar: 'A', color: '#3B5BFC' }} />;
    case 'team':        return <TeamPage />;
    case 'financial':   return <FinancialPage />;
    case 'roles':       return <RolesPage />;
    case 'performance': return <PerformancePage />;
    case 'reports':     return <ReportsPage />;
    case 'notes':       return <NotesPage />;
    case 'help':        return <HelpPage />;
    case 'trash':       return <TrashPage />;
    case 'settings':    return <SettingsPage />;
    default:            return <AdminProjectDashboardPage />;
  }
}

function AppShell() {
  const [auth, setAuth]             = useState(null);
  const [activeItem, setActiveItem] = useState('dashboard');
  const [dashVisible, setDashVisible] = useState(false);
  const [visitedPages, setVisitedPages] = useState({});
  const [loadingPage, setLoadingPage] = useState(null);
  const { dataLoaded, refreshData } = useApp();

  const handleLogin = (role, memberId, email) => {
    if (email) localStorage.setItem('userEmail', email);
    setAuth({ role, memberId });
    // Clear visited pages on fresh login so skeletons show
    setVisitedPages({});
    setLoadingPage('dashboard');
    setTimeout(() => setDashVisible(true), 50);
    // Mark dashboard as visited after skeleton duration
    setTimeout(() => {
      setLoadingPage(null);
      setVisitedPages({ dashboard: true });
    }, 900);
  };

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    setAuth(null);
    setDashVisible(false);
    setActiveItem('dashboard');
    setVisitedPages({});
    setLoadingPage(null);
  };

  const handleNav = (item) => {
    if (item === activeItem) {
      refreshData();
      return;
    }
    setActiveItem(item);
    // Show skeleton only if this page hasn't been visited yet this session
    if (!visitedPages[item]) {
      setLoadingPage(item);
      setTimeout(() => {
        setLoadingPage(null);
        setVisitedPages(prev => ({ ...prev, [item]: true }));
      }, 800);
    }
  };

  if (!auth) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const page = pageConfig[activeItem] || pageConfig['dashboard'];
  const SkeletonComp = SKELETON_MAP[activeItem] || DashboardSkeleton;
  const showSkeleton = loadingPage === activeItem;

  return (
    <div style={{
      display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden',
      background: 'var(--bg-main)',
      opacity: dashVisible ? 1 : 0,
      transform: dashVisible ? 'translateY(0)' : 'translateY(10px)',
      transition: 'opacity 0.4s ease, transform 0.4s ease, background 0.25s ease',
    }}>
      <SkeletonStyles />
      <Sidebar activeItem={activeItem} setActiveItem={handleNav} onLogout={handleLogout} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100%', background: 'var(--bg-main)', overflow: 'hidden', transition: 'background 0.25s ease' }}>
        <Header title={page.title} subtitle={page.subtitle} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
          {showSkeleton ? <SkeletonComp /> : renderPage(activeItem)}
        </div>
      </div>
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

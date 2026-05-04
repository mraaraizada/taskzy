import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useLottie } from 'lottie-react';
import profileUserCardAnim from '../lottie/Profile user card.json';
import MemberSidebar from './MemberSidebar';
import MemberHeader from './MemberHeader';
import PlanInactiveOverlay from '../components/PlanInactiveOverlay';
import MemberHome from './pages/MemberHome';
import MemberTasks from './pages/MemberTasks';
import MemberPayments from './pages/MemberPayments';
import MemberWorkDesc from './pages/MemberWorkDesc';
import MemberHelp from './pages/MemberHelp';
import MemberProfile from './pages/MemberProfile';
import NotesPage from '../pages/NotesPage';
import {
  SkeletonStyles,
  MemberHomeSkeleton, MemberTasksSkeleton, MemberPaymentsSkeleton,
  MemberWorkDescSkeleton, NotesSkeleton, MemberProfileSkeleton, MemberHelpSkeleton,
  Bone,
} from '../components/Skeleton';

const PAGE_CONFIG = {
  home:     { title: 'My Dashboard',    subtitle: 'Your personal workspace' },
  tasks:    { title: 'My Tasks',         subtitle: 'Track and update your assigned work' },
  payments: { title: 'Payments',         subtitle: 'Your earnings and payment history' },
  workdesc: { title: 'Work Description', subtitle: 'Your role and responsibilities' },
  notes:    { title: 'Scribe',            subtitle: 'Notes, sheets & shared docs' },
  help:     { title: 'Help & Support',   subtitle: 'Get assistance from your admin team' },
  profile:  { title: 'Profile',          subtitle: 'Your personal information' },
};

const MEMBER_SKELETON_MAP = {
  home:     MemberHomeSkeleton,
  tasks:    MemberTasksSkeleton,
  payments: MemberPaymentsSkeleton,
  workdesc: MemberWorkDescSkeleton,
  notes:    NotesSkeleton,
  help:     MemberHelpSkeleton,
  profile:  MemberProfileSkeleton,
};

function ProfileUserCardOverlay({ onDone }) {
  const [fading, setFading] = useState(false);

  const dismiss = () => {
    setFading(true);
    setTimeout(onDone, 500);
  };

  const { View } = useLottie({
    animationData: profileUserCardAnim,
    loop: false,
    autoplay: true,
    onComplete: dismiss,
    style: { width: '100vw', height: '100vh', objectFit: 'cover' },
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
        transition: 'opacity 0.5s ease',
      }}
    >
      {View}
    </div>
  );
}

export default function MemberApp({ memberId, onLogout, visible }) {
  const [activePage, setActivePage] = useState('home');
  const [pageLoading, setPageLoading] = useState(false);
  const [pageKey, setPageKey] = useState(0);
  const [visitedPages, setVisitedPages] = useState(new Set(['home']));
  const [initialLoading, setInitialLoading] = useState(true);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const { team, dataLoaded, refreshData, setShowDonutWelcome } = useApp();
  const member = team.find(m => m.id === memberId);

  // Clear initial loading once visible and show profile card
  useEffect(() => {
    if (visible && initialLoading) {
      setInitialLoading(false);
      setShowProfileCard(true);
    }
  }, [visible, initialLoading]);

  if (!member) return null;

  const page = PAGE_CONFIG[activePage] || PAGE_CONFIG.home;

  const handleNav = (p) => {
    if (p === activePage) {
      refreshData();
      return;
    }

    if (!visitedPages.has(p)) {
      // First visit — show skeleton
      setPageLoading(true);
      setTimeout(() => {
        setActivePage(p);
        setTimeout(() => {
          setPageLoading(false);
          setVisitedPages(prev => new Set([...prev, p]));
        }, 500);
      }, 50);
    } else {
      setPageKey(k => k + 1);
      setActivePage(p);
    }
  };

  function renderPage() {
    switch (activePage) {
      case 'tasks':    return <MemberTasks    member={member} onNavigateToNotes={() => handleNav('notes')} />;
      case 'payments': return <MemberPayments member={member} />;
      case 'workdesc': return <MemberWorkDesc member={member} />;
      case 'notes':    return <NotesPage deletedBy={{ id: member.id, name: member.name, role: member.role, avatar: member.avatar, color: member.color }} currentUser={{ id: member.id, name: member.name, role: member.role, userRole: 'member' }} />;
      case 'help':     return <MemberHelp />;
      case 'profile':  return <MemberProfile  member={member} />;
      default:         return <MemberHome     member={member} setActivePage={handleNav} onNavigateToNotes={() => handleNav('notes')} />;
    }
  }

  const SkeletonComp = MEMBER_SKELETON_MAP[activePage] || MemberHomeSkeleton;

  // Show full shell skeleton on initial login load
  if (initialLoading) {
    return (
      <>
        <SkeletonStyles />
        {/* Member shell skeleton: sidebar (6 nav items) + header + home content */}
        <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', background: 'var(--bg-main)' }}>
          {/* Sidebar */}
          <aside style={{ width: 230, height: '100vh', background: 'var(--bg-surface)', borderRight: '1.5px solid var(--border-light)', display: 'flex', flexDirection: 'column', padding: '0 12px', flexShrink: 0 }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '22px 8px 20px' }}>
              <Bone w={34} h={34} r={10} style={{ flexShrink: 0 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <Bone w={70} h={14} />
                <Bone w={60} h={9} />
              </div>
            </div>
            {/* 6 nav items */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
              {[90, 75, 85, 55, 45, 65].map((w, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 11, background: i === 0 ? 'var(--bg-subtle)' : 'transparent' }}>
                  <Bone w={30} h={30} r={9} style={{ flexShrink: 0 }} />
                  <Bone w={w} h={12} />
                </div>
              ))}
            </nav>
            {/* Member card */}
            <div style={{ padding: '0 4px 20px' }}>
              <div style={{ background: 'var(--bg-subtle)', borderRadius: 14, padding: '12px 14px', border: '1.5px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Bone w={36} h={36} r={18} style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <Bone w={110} h={13} />
                    <Bone w={80} h={10} />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Bone w={7} h={7} r={4} />
                  <Bone w={45} h={11} />
                  <Bone w={70} h={10} style={{ marginLeft: 'auto' }} />
                </div>
                <Bone w="100%" h={30} r={9} />
              </div>
            </div>
          </aside>
          {/* Right: header + home skeleton */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100%', background: 'var(--bg-main)', overflow: 'hidden' }}>
            <div style={{ height: 64, flexShrink: 0, background: 'var(--bg-surface)', borderBottom: '1.5px solid var(--border-light)', display: 'flex', alignItems: 'center', padding: '0 28px', gap: 12 }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Bone w={120} h={16} />
                <Bone w={180} h={11} />
              </div>
              <Bone w={220} h={36} r={10} />
              <Bone w={36} h={36} r={18} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
              <MemberHomeSkeleton />
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div style={{
      display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden',
      background: 'var(--bg-main)',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(10px)',
      transition: 'opacity 0.4s ease, transform 0.4s ease, background 0.25s ease',
    }}>
      <SkeletonStyles />
      <MemberSidebar activePage={activePage} setActivePage={handleNav} member={member} onLogout={onLogout} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100%', overflow: 'hidden' }}>
        <MemberHeader title={page.title} subtitle={page.subtitle} member={member} />
        <div
          key={pageKey}
          className="page-enter"
          style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', position: 'relative' }}
        >
          {pageLoading ? <SkeletonComp /> : renderPage()}
          {activePage !== 'profile' && <PlanInactiveOverlay />}
        </div>
      </div>

      {/* Profile user card overlay */}
      {showProfileCard && (
        <ProfileUserCardOverlay onDone={() => { 
          setShowProfileCard(false); 
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

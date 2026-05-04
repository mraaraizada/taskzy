import { LayoutDashboard, CheckCircle, Users, Settings2, Wallet, FileText, StickyNote, HelpCircle, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import Avatar from '../components/Avatar';

const NAV_TOP = [
  { id: 'home',     icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'tasks',    icon: CheckCircle,     label: 'Tasks' },
  { id: 'team',     icon: Users,           label: 'Team' },
  { id: 'manage',   icon: Settings2,       label: 'Manage' },
];

const NAV_BOTTOM = [
  { id: 'payments', icon: Wallet,          label: 'Payments' },
  { id: 'workdesc', icon: FileText,        label: 'Description' },
  { id: 'notes',    icon: StickyNote,      label: 'Scribe' },
  { id: 'help',     icon: HelpCircle,      label: 'Help' },
  { id: 'profile',  icon: User,            label: 'Profile' },
];

function NavItem({ item, active, onClick, showDot }) {
  const Icon = item.icon;
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 12px', borderRadius: 11, border: 'none', cursor: 'pointer',
      background: active ? 'linear-gradient(135deg, #EEF2FF, #F0EEFF)' : 'transparent',
      color: active ? '#3B5BFC' : '#6B7280',
      fontWeight: active ? 700 : 500, fontSize: 13,
      transition: 'all 0.15s', width: '100%', textAlign: 'left',
      boxShadow: active ? '0 2px 8px rgba(59,91,252,0.12)' : 'none',
    }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg-subtle)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      <div style={{
        width: 30, height: 30, borderRadius: 9, flexShrink: 0,
        background: active ? '#EEF2FF' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={15} strokeWidth={active ? 2.5 : 2} color={active ? '#3B5BFC' : '#6B7280'} />
      </div>
      <span style={{ flex: 1 }}>{item.label}</span>
      {showDot && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#9CA3AF', boxShadow: '0 0 0 2px #F3F4F6', flexShrink: 0 }} />}
      {active && !showDot && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3B5BFC' }} />}
    </button>
  );
}

export default function ManagementSidebar({ activePage, setActivePage, member, onLogout }) {
  const [confirmLogout, setConfirmLogout] = useState(false);
  const { unreadDescMembers, helpSubmissions } = useApp();
  const hasUnreadDesc = unreadDescMembers.has(member.id);
  const pendingHelp = helpSubmissions.filter(s => s.status === 'pending').length;

  return (
    <div style={{
      width: 230, height: '100vh', background: 'var(--bg-surface)',
      borderRight: '1.5px solid var(--border)', display: 'flex', flexDirection: 'column',
      padding: '0 12px', flexShrink: 0,
      transition: 'background 0.25s ease, border-color 0.25s ease',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '22px 8px 20px' }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: 'linear-gradient(135deg, #3B5BFC, #7C3AED)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(59,91,252,0.4)', flexShrink: 0,
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8L7 4L11 8L7 12L3 8Z" fill="white" opacity="0.7"/>
            <path d="M7 4L11 8L13 6L9 2L7 4Z" fill="white"/>
          </svg>
        </div>
        <div>
          <span style={{ fontWeight: 800, fontSize: 17, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>Taskzy</span>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, marginTop: -1 }}>Management</div>
        </div>
      </div>

      {/* Admin section */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {NAV_TOP.map(item => (
          <NavItem key={item.id} item={item} active={activePage === item.id} onClick={() => setActivePage(item.id)} />
        ))}
      </nav>



      {/* Personal section */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
        {NAV_BOTTOM.map(item => (
          <NavItem key={item.id} item={item} active={activePage === item.id} onClick={() => setActivePage(item.id)} showDot={(item.id === 'workdesc' && hasUnreadDesc) || (item.id === 'help' && pendingHelp > 0)} />
        ))}
      </nav>

      {/* Member card */}
      <div style={{ padding: '0 4px 20px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%)',
          borderRadius: 14, padding: '12px 14px', border: '1.5px solid #E0E7FF',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <Avatar member={member} size={36} style={{ boxShadow: `0 4px 10px ${member.color}55` }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#1A1D2E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.name}</div>
              <div style={{ fontSize: 10, color: '#7C3AED', fontWeight: 700 }}>{member.role}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#12C479', boxShadow: '0 0 0 3px #DCFCE7', flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: '#12C479', fontWeight: 700 }}>Active</span>
            <span style={{ fontSize: 10, color: '#B0B8CC', marginLeft: 'auto' }}>Since {member.joined}</span>
          </div>
          {!confirmLogout ? (
            <button onClick={() => setConfirmLogout(true)} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              width: '100%', padding: '7px 10px', borderRadius: 9,
              background: '#FEF2F2', border: '1px solid #FECACA',
              fontSize: 12, fontWeight: 700, color: '#EF4444', cursor: 'pointer',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
              onMouseLeave={e => e.currentTarget.style.background = '#FEF2F2'}
            >
              <LogOut size={13} /> Logout
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#FEF2F2', borderRadius: 9, padding: '6px 8px', border: '1px solid #FECACA' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#EF4444', flex: 1 }}>Sure?</span>
              <button onClick={onLogout} style={{ background: '#EF4444', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: '#fff', cursor: 'pointer' }}>Yes</button>
              <button onClick={() => setConfirmLogout(false)} style={{ background: '#fff', border: '1px solid #E8EAEF', borderRadius: 6, padding: '4px 8px', fontSize: 11, fontWeight: 700, color: '#6B7280', cursor: 'pointer' }}>No</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

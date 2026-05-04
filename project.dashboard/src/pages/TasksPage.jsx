import { useState, useRef, useEffect } from 'react';
import { Plus, X, RefreshCw, Wallet, Trash2, CheckCircle, AlertCircle, Clock, Shield, UserCheck, Calendar, ChevronDown, ClipboardCheck, Edit2, ChevronLeft, ChevronRight, Hourglass } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AdminPasswordModal } from '../components/AdminPasswordModal';
import { useAdminPassword } from '../hooks/useAdminPassword';
import { TasksSkeleton } from '../components/Skeleton';

// ── Constants ───────────────────────────────────────────────────────────────
const STAGES = ['New', 'Start', 'Issue', 'Review A', 'Review B', 'Update', 'Complete'];
const STAGE_COLORS = { New: '#9CA3AF', Start: '#3B5BFC', Issue: '#EF4444', 'Review A': '#F97316', 'Review B': '#7C3AED', Update: '#D97706', Complete: '#12C479' };
const STAGE_BG     = { New: '#F3F4F6', Start: '#EEF2FF', Issue: '#FEF2F2', 'Review A': '#FFF7ED', 'Review B': '#F5F3FF', Update: '#FFFBEB', Complete: '#ECFDF5' };

const TAGS = [
  { label: 'Instagram', emoji: '📷', color: '#E1306C', bg: '#FDF2F8' },
  { label: 'YouTube',   emoji: '▶️',  color: '#FF0000', bg: '#FFF0F0' },
  { label: 'Facebook',  emoji: '👥',  color: '#1877F2', bg: '#EFF6FF' },
  { label: 'Twitter',   emoji: '🐦',  color: '#1DA1F2', bg: '#E7F5FD' },
  { label: 'Design',    emoji: '🎨',  color: '#7C3AED', bg: '#F5F3FF' },
  { label: 'Content',   emoji: '✍️',  color: '#059669', bg: '#ECFDF5' },
  { label: 'Marketing', emoji: '📢',  color: '#F97316', bg: '#FFF7ED' },
];

const CATEGORIES = [
  { label: 'Development',  emoji: '💻', color: '#3B5BFC', bg: '#EEF2FF' },
  { label: 'Design',       emoji: '🎨', color: '#7C3AED', bg: '#F5F3FF' },
  { label: 'Marketing',    emoji: '📢', color: '#F97316', bg: '#FFF7ED' },
  { label: 'Finance',      emoji: '💰', color: '#059669', bg: '#ECFDF5' },
  { label: 'Operations',   emoji: '⚙️', color: '#6B7280', bg: '#F3F4F6' },
  { label: 'Research',     emoji: '🔬', color: '#0891B2', bg: '#ECFEFF' },
  { label: 'Content',      emoji: '✍️', color: '#D97706', bg: '#FFFBEB' },
  { label: 'Support',      emoji: '🛟', color: '#DC2626', bg: '#FEF2F2' },
];

function generateId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '#';
  for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

function StageFlow({ current, members = [], paid = false, history = [] }) {
  const idx = STAGES.indexOf(current);
  const visitedStages = new Set(history.map(h => h.stage));

  const membersByStage = {};
  members.forEach(m => {
    if (!membersByStage[m.stage]) membersByStage[m.stage] = [];
    membersByStage[m.stage].push(m);
  });

  return (
    <div style={{ position: 'relative', paddingBottom: 18 }}>
      <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        {STAGES.map((s, i) => {
          const skippedUpdate = s === 'Update' && current === 'Complete' && !visitedStages.has('Update');
          const bg = skippedUpdate ? '#BBF7D0' : i <= idx ? STAGE_COLORS[s] : '#E8EAEF';
          const opacity = skippedUpdate ? 1 : i === idx ? 1 : i < idx ? 0.6 : 0.3;
          return (
            <div key={s} style={{ height: 5, flex: 1, borderRadius: 3, background: bg, opacity, transition: 'background 0.2s', position: 'relative' }} />
          );
        })}
      </div>
      <div style={{ position: 'absolute', top: 8, left: 0, right: 0 }}>
        {STAGES.map((s, i) => {
          const group = membersByStage[s];
          if (!group || group.length === 0) return null;
          const leftPct = (i / STAGES.length) * 100 + (100 / STAGES.length / 2);
          return (
            <div key={s} style={{ position: 'absolute', left: `${leftPct}%`, transform: 'translateX(-50%)', display: 'flex', gap: 1 }}>
              {group.slice(0, 3).map((m) => (
                <div key={m.id} style={{ width: 16, height: 16, borderRadius: '50%', background: m.color, border: '1.5px solid var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 6, fontWeight: 800, color: '#fff', position: 'relative', cursor: 'default' }}
                  onMouseEnter={e => { const tip = e.currentTarget.querySelector('.avatar-tip'); if (tip) tip.style.opacity = '1'; }}
                  onMouseLeave={e => { const tip = e.currentTarget.querySelector('.avatar-tip'); if (tip) tip.style.opacity = '0'; }}
                >
                  {m.avatar}
                  {paid && (
                    <div style={{ position: 'absolute', top: -2, right: -2, width: 7, height: 7, borderRadius: '50%', background: '#12C479', border: '1px solid var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 5 }}>✓</div>
                  )}
                  <div className="avatar-tip" style={{ position: 'absolute', bottom: '120%', left: '50%', transform: 'translateX(-50%)', background: '#fff', color: 'var(--text-primary)', fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap', padding: '3px 7px', borderRadius: 6, border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', pointerEvents: 'none', opacity: 0, transition: 'opacity 0.15s', zIndex: 100 }}>
                    {m.name}
                  </div>
                </div>
              ))}
              {group.length > 3 && (
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--bg-subtle)', border: '1.5px solid var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 6, fontWeight: 800, color: 'var(--text-muted)' }}>
                  +{group.length - 3}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Task Requests Panel (Inline Right Side) ─────────────────────────────────
function TaskRequestsModal({ onClose, onApprove, onComplete, requests }) {
  const [statusFilter, setStatusFilter] = useState('Pending');
  const today = new Date();
  const [monthOffset, setMonthOffset] = useState(0); // 0 = current month
  const panelRef = useRef(null);

  const selectedDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const selectedMonth = selectedDate.getMonth();
  const selectedYear = selectedDate.getFullYear();
  const monthLabel = selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const pendingRequests = requests.filter(r => r.status === 'pending');

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setTimeout(() => { onClose(); }, 0);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Filter by pending/complete status + selected month
  const filteredRequests = pendingRequests.filter(r => {
    const d = new Date(r.timestamp);
    if (d.getMonth() !== selectedMonth || d.getFullYear() !== selectedYear) return false;
    if (statusFilter === 'Pending') return !r.isComplete && !r.isCreated;
    if (statusFilter === 'Complete') return r.isComplete || r.isCreated;
    return true;
  });
  
  return (
    <div 
      ref={panelRef}
      style={{ 
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: 420,
        background: 'var(--bg-surface)', 
        zIndex: 10,
        display: 'flex', 
        flexDirection: 'column', 
        boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
        borderLeft: '1px solid var(--border-light)',
      }}
    >
      {/* Header */}
      <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #3B5BFC, #2142D9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(59,91,252,0.3)' }}>
              <ClipboardCheck size={16} color="#fff" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>Task Approvals</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Review & approve member task</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'var(--input-bg)', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={16} color="var(--text-secondary)" />
          </button>
        </div>
        
        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {['Pending', 'Complete'].map(filter => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: 'none',
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                background: statusFilter === filter ? 'linear-gradient(135deg, #3B5BFC, #2142D9)' : 'var(--bg-subtle)',
                color: statusFilter === filter ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.15s',
                boxShadow: statusFilter === filter ? '0 2px 8px rgba(59,91,252,0.3)' : 'none',
              }}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Month Scroller */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-subtle)', borderRadius: 10, padding: '6px 10px' }}>
          <button onClick={() => setMonthOffset(p => p - 1)} style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: 'var(--bg-surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ChevronLeft size={14} color="var(--text-secondary)" />
          </button>
          <div style={{ flex: 1, textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{monthLabel}</div>
          <button onClick={() => setMonthOffset(p => p + 1)} disabled={monthOffset >= 0} style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: 'var(--bg-surface)', cursor: monthOffset >= 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: monthOffset >= 0 ? 0.35 : 1 }}>
            <ChevronRight size={14} color="var(--text-secondary)" />
          </button>
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px', display: 'flex', flexDirection: 'column' }}>
        {filteredRequests.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--text-muted)', gap: 10 }}>
            <ClipboardCheck size={52} color="#C4C9D9" />
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-secondary)' }}>No {statusFilter} Approvals</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 220, lineHeight: 1.6 }}>Member task approvals for this month will appear here</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filteredRequests.map(request => (
              <div key={request.id} style={{ background: 'var(--bg-subtle)', borderRadius: 14, padding: '18px 20px', border: '1.5px solid var(--border)' }}>
                {/* Submitted by */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%', 
                    background: request.submittedBy.color,
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 800,
                    color: '#fff',
                    flexShrink: 0,
                  }}>
                    {request.submittedBy.avatar}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{request.submittedBy.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{request.submittedBy.role} • {request.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  </div>
                </div>

                {/* Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', flex: 1 }}>{request.title}</div>
                  {request.isCreated && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 12, background: '#EEF2FF', color: '#3B5BFC', border: '1px solid #C7D4FF' }}>Created</span>
                  )}
                </div>

                {/* Description */}
                {request.description && (
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 14 }}>{request.description}</div>
                )}

                {/* Approved by */}
                {request.approvedBy && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14, padding: '7px 10px', background: 'var(--bg-surface)', borderRadius: 9, border: '1.5px solid var(--border-light)' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: request.approvedBy.color || '#3B5BFC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                      {request.approvedBy.avatar || request.approvedBy.name?.slice(0,2).toUpperCase()}
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Approved by</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>{request.approvedBy.name}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 'auto' }}>{request.approvedBy.role}</span>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button 
                    onClick={() => onApprove(request)}
                    style={{
                      flex: 1,
                      padding: '10px 18px',
                      background: 'linear-gradient(135deg, #3B5BFC, #2142D9)',
                      border: 'none',
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#fff',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(59,91,252,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <UserCheck size={14} strokeWidth={2.5} />
                    Approve
                  </button>
                  <button 
                    onClick={() => onComplete && onComplete(request)}
                    style={{
                      flex: 1,
                      padding: '10px 18px',
                      background: 'linear-gradient(135deg, #12C479, #059669)',
                      border: 'none',
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#fff',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(18,196,121,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <CheckCircle size={14} strokeWidth={2.5} />
                    Complete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Task Timeline Panel (Right Side) ────────────────────────────────────────
function TaskTimelinePanel({ task, onClose }) {
  const panelRef = useRef(null);
  const { tasks } = useApp();

  // Always read latest task from context
  const t = tasks.find(x => x.id === task.id) || task;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setTimeout(() => onClose(), 0);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!t) return null;

  const timeline = t.history && t.history.length > 0
    ? [...t.history].reverse()
    : [{ stage: t.stage, date: t.createdDate || new Date(), user: 'Admin', action: 'created' }];

  const ACTION_CONFIG = {
    created: { label: 'Task Created',      color: '#3B5BFC', bg: '#EEF2FF', icon: '✦' },
    updated: { label: 'Stage Updated',     color: STAGE_COLORS, bg: null,   icon: '→' },
    paid:    { label: 'Payment Processed', color: '#12C479', bg: '#ECFDF5', icon: '₹' },
    edit:    { label: 'Task Edited',       color: '#F97316', bg: '#FFF7ED', icon: '✎' },
    paused:  { label: 'Task On Hold',    color: '#D97706', bg: '#FFFBEB', icon: '🔒' },
    resumed: { label: 'Task Activated',  color: '#3B5BFC', bg: '#EEF2FF', icon: '🔓' },
  };

  const overdue = new Date(t.deadline) < new Date() && t.stage !== 'Complete';
  const days = Math.ceil((new Date(t.deadline) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div ref={panelRef} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 420, background: 'var(--bg-surface)', zIndex: 10, display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 24px rgba(0,0,0,0.15)', borderLeft: '1px solid var(--border-light)' }}>

      {/* Header */}
      <div style={{ padding: '20px 24px 16px', borderBottom: '1.5px solid var(--border-light)', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', background: t.stage === 'Complete' ? '#12C479' : '#3B5BFC', padding: '2px 7px', borderRadius: 5 }}>{t.id}</span>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: STAGE_BG[t.stage], color: STAGE_COLORS[t.stage] }}>{t.stage}</span>
              {t.paid && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: '#ECFDF5', color: '#12C479' }}>✓ Paid</span>}
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
            <div style={{ fontSize: 11, color: overdue ? '#EF4444' : days <= 2 ? '#F97316' : 'var(--text-muted)', fontWeight: 600 }}>
              {t.stage === 'Complete' ? '✅ Completed' : overdue ? `⚠ ${Math.abs(days)}d overdue` : days === 0 ? '🔥 Due today' : `Due ${new Date(t.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'var(--bg-subtle)', border: 'none', borderRadius: 10, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, fontSize: 15, color: 'var(--text-secondary)' }}>✕</button>
        </div>

        {/* Tags + Category */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {t.category && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: t.category.bg, color: t.category.color, border: `1px solid ${t.category.color}30` }}>{t.category.emoji} {t.category.label}</span>}
          {t.tags?.map(tag => <span key={tag.label} style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: tag.bg, color: tag.color }}>{tag.emoji} {tag.label}</span>)}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Progress bar */}
        <div style={{ background: 'var(--bg-subtle)', borderRadius: 12, padding: '14px 16px', border: '1.5px solid var(--border-light)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Progress</div>
          <StageFlow current={t.stage} members={t.members} paid={t.paid} history={t.history || []} />
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div style={{ background: 'var(--bg-subtle)', borderRadius: 10, padding: '10px 12px', border: '1.5px solid var(--border-light)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Budget</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#12C479' }}>₹ {t.totalBudget?.toLocaleString()}</div>
          </div>
          <div style={{ background: 'var(--bg-subtle)', borderRadius: 10, padding: '10px 12px', border: '1.5px solid var(--border-light)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Payment</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: t.paid ? '#12C479' : '#F97316' }}>{t.paid ? `✅ Paid` : '⏳ Pending'}</div>
            {t.paidOn && <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{new Date(t.paidOn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>}
          </div>
        </div>

        {/* Members */}
        <div style={{ background: 'var(--bg-subtle)', borderRadius: 12, padding: '14px 16px', border: '1.5px solid var(--border-light)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Team Members</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {t.members.map(m => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: '#fff', flexShrink: 0 }}>{m.avatar}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{m.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{m.role}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: STAGE_BG[m.stage], color: STAGE_COLORS[m.stage] }}>{m.stage}</span>
                  {m.budget > 0 && <div style={{ fontSize: 11, fontWeight: 700, color: '#12C479', marginTop: 2 }}>₹ {m.budget?.toLocaleString()}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Timeline */}
        <div>
          <div style={{ marginBottom: 12 }} />
          <div style={{ position: 'relative', paddingLeft: 28 }}>
            <div style={{ position: 'absolute', left: 10, top: 4, bottom: 4, width: 2, background: 'var(--border-light)', borderRadius: 2 }} />
            {timeline.map((item, i) => {
              const isStage = item.action === 'updated' || item.action === 'created';
              const isPaid  = item.action === 'paid';
              const isEdit  = item.action === 'edit';
              const isPaused  = item.action === 'paused';
              const isResumed = item.action === 'resumed';
              const dotColor = isPaid ? '#12C479' : isEdit ? '#F97316' : isPaused ? '#D97706' : isResumed ? '#3B5BFC' : STAGE_COLORS[item.stage] || '#9CA3AF';
              const dotBg   = isPaid ? '#ECFDF5' : isEdit ? '#FFF7ED' : isPaused ? '#FFFBEB' : isResumed ? '#EEF2FF' : STAGE_BG[item.stage] || '#F3F4F6';
              return (
                <div key={i} style={{ position: 'relative', marginBottom: i < timeline.length - 1 ? 16 : 0 }}>
                  {/* Dot */}
                  <div style={{ position: 'absolute', left: -22, top: 6, width: 14, height: 14, borderRadius: '50%', background: dotBg, border: `2px solid ${dotColor}`, zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, color: dotColor, fontWeight: 800 }}>
                    {isPaid ? '₹' : isEdit ? '✎' : item.action === 'created' ? '✦' : isPaused ? '🔒' : isResumed ? '🔓' : '→'}
                  </div>
                  <div style={{ background: dotBg, borderRadius: 10, padding: '10px 12px', border: `1.5px solid ${dotColor}30` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: dotColor }}>
                        {isPaid ? 'Payment Processed' : isEdit ? 'Task Edited' : item.action === 'created' ? 'Task Created' : isPaused ? 'Task On Hold' : isResumed ? 'Task Activated' : `→ ${item.stage}`}
                      </span>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                        {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#E8EAEF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800, color: '#6B7280', flexShrink: 0 }}>
                        {item.user?.slice(0, 2).toUpperCase()}
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>{item.user}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>· {new Date(item.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    {item.note && (
                      <div style={{ marginTop: 5, fontSize: 10, color: 'var(--text-muted)', fontStyle: 'italic' }}>{item.note}</div>
                    )}
                    {isPaid && t.totalBudget > 0 && (
                      <div style={{ marginTop: 6, fontSize: 12, fontWeight: 700, color: '#12C479' }}>₹ {t.totalBudget?.toLocaleString()}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Create Task Modal ───────────────────────────────────────────────────────
function CreateTaskModal({ onClose, onCreate, onSchedule, teamMembers, requestData = null, hideBudget = false, currentUser = null, managementMode = false }) {
  const { showPasswordModal, pendingAction, requestAdminPassword, handlePasswordConfirm, handlePasswordCancel } = useAdminPassword();
  const [taskId, setTaskId] = useState(generateId());
  const [title, setTitle] = useState(requestData?.title || '');
  const [description, setDescription] = useState(requestData?.description || '');
  const [deadline, setDeadline] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [dateMode, setDateMode] = useState('completion'); // 'completion' | 'schedule'
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [stage, setStage] = useState('New');
  const [assignments, setAssignments] = useState([{ memberId: '', memberDesc: '', budget: '' }]);
  
  // Custom tags and categories
  const [showAddTag, setShowAddTag] = useState(false);
  const [newTagLabel, setNewTagLabel] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryLabel, setNewCategoryLabel] = useState('');
  
  // Payment options
  const [paymentEntries, setPaymentEntries] = useState([{ title: '', amount: '' }]);

  const addPaymentEntry = () => setPaymentEntries(prev => [...prev, { title: '', amount: '' }]);
  const removePaymentEntry = (i) => setPaymentEntries(prev => prev.filter((_, idx) => idx !== i));
  const updatePaymentEntry = (i, key, val) => setPaymentEntries(prev => prev.map((p, idx) => idx === i ? { ...p, [key]: val } : p));

  const totalBudget = assignments.reduce((s, a) => s + (parseFloat(a.budget) || 0), 0);

  const toggleTag = (tag) => {
    setSelectedTags(prev => prev.find(t => t.label === tag.label) ? prev.filter(t => t.label !== tag.label) : [...prev, tag]);
  };

  const addCustomTag = () => {
    if (!newTagLabel.trim()) return;
    const customTag = { 
      label: newTagLabel.trim(), 
      emoji: '🏷️', 
      color: '#6B7280', 
      bg: '#F3F4F6' 
    };
    setSelectedTags(prev => [...prev, customTag]);
    setNewTagLabel('');
    setShowAddTag(false);
  };

  const addCustomCategory = () => {
    if (!newCategoryLabel.trim()) return;
    const customCategory = { 
      label: newCategoryLabel.trim(), 
      emoji: '📁', 
      color: '#6B7280', 
      bg: '#F3F4F6' 
    };
    setSelectedCategory(customCategory);
    setNewCategoryLabel('');
    setShowAddCategory(false);
  };

  const addMember = () => setAssignments(prev => [...prev, { memberId: '', memberDesc: '', budget: '' }]);
  const removeMember = (i) => setAssignments(prev => prev.filter((_, idx) => idx !== i));
  const updateAssignment = (i, key, val) => setAssignments(prev => prev.map((a, idx) => idx === i ? { ...a, [key]: val } : a));

  const handleSubmitClick = () => {
    if (!title.trim() || (!deadline && !scheduledDate)) return;
    requestAdminPassword(scheduledDate ? 'schedule this task' : 'create this task', () => {
      const members = assignments
        .filter(a => a.memberId)
        .map(a => {
          const m = teamMembers.find(t => t.id === parseInt(a.memberId));
          return m ? { ...m, memberDesc: a.memberDesc, budget: parseFloat(a.budget) || 0, stage } : null;
        })
        .filter(Boolean);

      const payments = paymentEntries
        .filter(p => p.title.trim() || p.amount)
        .map(p => ({ title: p.title.trim(), amount: parseFloat(p.amount) || 0 }));

      const taskData = {
        id: taskId, title, description,
        deadline: deadline || scheduledDate,
        scheduledDate: scheduledDate || null,
        tags: selectedTags, category: selectedCategory,
        stage, totalBudget, members,
        payments: payments.length > 0 ? payments : null,
      };

      const createdBy = requestData?._approvedBy
        ? { ...requestData._approvedBy, source: 'Approval Panel' }
        : currentUser ? { ...currentUser, source: null } : null;

      if (scheduledDate && !deadline) {
        onSchedule && onSchedule(taskData);
      } else {
        onCreate(taskData, createdBy);
      }
      onClose();
    });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--bg-surface)', borderRadius: 24, width: 680, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.25)' }}>
        {/* Header */}
        <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--bg-surface)', zIndex: 10, borderRadius: '24px 24px 0 0' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>Create New Task</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>Fill in the details to assign work to your team</div>
          </div>
          <button onClick={onClose} style={{ background: 'var(--input-bg)', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={16} color="var(--text-secondary)" />
          </button>
        </div>

        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Task ID */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Task ID</label>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ flex: 1, padding: '11px 16px', background: 'var(--input-bg)', borderRadius: 10, border: '1.5px solid var(--border)', fontFamily: 'monospace', fontSize: 15, fontWeight: 700, color: '#3B5BFC', letterSpacing: 1 }}>{taskId}</div>
              <button onClick={() => setTaskId(generateId())} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '11px 16px', background: '#EEF2FF', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#3B5BFC', cursor: 'pointer' }}>
                <RefreshCw size={14} /> Generate
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter task title..."
              style={{ width: '100%', padding: '11px 16px', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 14, color: 'var(--text-primary)', outline: 'none', background: 'var(--input-bg)', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#3B5BFC'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="General overview visible to all team members..." rows={3}
              style={{ width: '100%', padding: '11px 16px', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 14, color: 'var(--text-primary)', outline: 'none', background: 'var(--input-bg)', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#3B5BFC'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>

          {/* Date — toggle between Completion and Schedule */}
          <div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 10, background: 'var(--bg-subtle)', borderRadius: 10, padding: 4 }}>
              {[{ label: 'Completion Date', key: 'completion' }, { label: 'Schedule Date', key: 'schedule' }].map(opt => (
                <button key={opt.key}
                  onClick={() => { setDateMode(opt.key); setDeadline(''); setScheduledDate(''); }}
                  style={{
                    flex: 1, padding: '7px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none',
                    background: dateMode === opt.key ? 'var(--bg-surface)' : 'transparent',
                    color: dateMode === opt.key ? (opt.key === 'schedule' ? '#7C3AED' : '#3B5BFC') : 'var(--text-muted)',
                    boxShadow: dateMode === opt.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s',
                  }}
                >{opt.label}</button>
              ))}
            </div>
            <input type="date"
              value={dateMode === 'completion' ? deadline : scheduledDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => dateMode === 'completion' ? setDeadline(e.target.value) : setScheduledDate(e.target.value)}
              style={{ width: '100%', padding: '11px 16px', border: `1.5px solid ${(deadline || scheduledDate) ? (dateMode === 'schedule' ? '#7C3AED' : '#3B5BFC') : 'var(--border)'}`, borderRadius: 10, fontSize: 14, color: 'var(--text-primary)', outline: 'none', background: 'var(--input-bg)', boxSizing: 'border-box', colorScheme: 'normal' }}
              onFocus={e => e.target.style.borderColor = dateMode === 'schedule' ? '#7C3AED' : '#3B5BFC'}
              onBlur={e => e.target.style.borderColor = (deadline || scheduledDate) ? (dateMode === 'schedule' ? '#7C3AED' : '#3B5BFC') : 'var(--border)'} />
            {dateMode === 'schedule' && scheduledDate && <div style={{ marginTop: 6, fontSize: 11, color: '#7C3AED', fontWeight: 600 }}>Task will be saved as scheduled — not created until you click Create.</div>}
          </div>

          {/* Stage */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Initial Stage</label>
            <select value={stage} onChange={e => setStage(e.target.value)}
              style={{ width: '100%', padding: '11px 16px', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 14, color: 'var(--text-primary)', outline: 'none', background: 'var(--input-bg)', cursor: 'pointer', boxSizing: 'border-box' }}>
              <option value="New">New (Default)</option>
              <option value="Start">Start (Begin immediately)</option>
            </select>
          </div>

          {/* Tags */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Tags</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {TAGS.map(tag => {
                const sel = selectedTags.find(t => t.label === tag.label);
                return (
                  <button key={tag.label} onClick={() => toggleTag(tag)} style={{
                    padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    border: `1.5px solid ${sel ? tag.color : 'var(--border)'}`,
                    background: sel ? tag.bg : 'var(--bg-surface)', color: sel ? tag.color : 'var(--text-secondary)', transition: 'all 0.15s',
                  }}>
                    {tag.emoji} {tag.label}
                  </button>
                );
              })}
              
              {/* Add custom tag button */}
              {!showAddTag ? (
                <button 
                  onClick={() => setShowAddTag(true)} 
                  style={{
                    padding: '6px 14px', 
                    borderRadius: 20, 
                    fontSize: 12, 
                    fontWeight: 600, 
                    cursor: 'pointer',
                    border: '1.5px dashed #C7D4FF',
                    background: 'var(--bg-surface)', 
                    color: '#3B5BFC', 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Plus size={14} /> Add Tag
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input 
                    value={newTagLabel}
                    onChange={e => setNewTagLabel(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addCustomTag()}
                    placeholder="Tag name..."
                    autoFocus
                    style={{
                      padding: '6px 12px',
                      border: '1.5px solid #3B5BFC',
                      borderRadius: 10,
                      fontSize: 12,
                      outline: 'none',
                      width: 120,
                    }}
                  />
                  <button 
                    onClick={addCustomTag}
                    style={{
                      background: '#ECFDF5',
                      border: 'none',
                      borderRadius: 8,
                      padding: '6px 10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <CheckCircle size={14} color="#12C479" />
                  </button>
                  <button 
                    onClick={() => { setShowAddTag(false); setNewTagLabel(''); }}
                    style={{
                      background: '#FEF2F2',
                      border: 'none',
                      borderRadius: 8,
                      padding: '6px 10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <X size={14} color="#EF4444" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Category */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Category <span style={{ fontSize: 11, textTransform: 'none', fontWeight: 400, color: 'var(--text-muted)' }}>(pick one)</span>
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {CATEGORIES.map(cat => {
                const sel = selectedCategory?.label === cat.label;
                return (
                  <button key={cat.label} onClick={() => setSelectedCategory(sel ? null : cat)} style={{
                    padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    border: `1.5px solid ${sel ? cat.color : 'var(--border)'}`,
                    background: sel ? cat.bg : 'var(--bg-surface)',
                    color: sel ? cat.color : 'var(--text-secondary)',
                    transition: 'all 0.15s',
                    boxShadow: sel ? `0 2px 8px ${cat.color}30` : 'none',
                  }}>
                    {cat.emoji} {cat.label}
                  </button>
                );
              })}
              
              {/* Add custom category button */}
              {!showAddCategory ? (
                <button 
                  onClick={() => setShowAddCategory(true)} 
                  style={{
                    padding: '6px 14px', 
                    borderRadius: 20, 
                    fontSize: 12, 
                    fontWeight: 600, 
                    cursor: 'pointer',
                    border: '1.5px dashed #C7D4FF',
                    background: 'var(--bg-surface)', 
                    color: '#3B5BFC', 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Plus size={14} /> Add Category
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input 
                    value={newCategoryLabel}
                    onChange={e => setNewCategoryLabel(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addCustomCategory()}
                    placeholder="Category name..."
                    autoFocus
                    style={{
                      padding: '6px 12px',
                      border: '1.5px solid #3B5BFC',
                      borderRadius: 10,
                      fontSize: 12,
                      outline: 'none',
                      width: 140,
                    }}
                  />
                  <button 
                    onClick={addCustomCategory}
                    style={{
                      background: '#ECFDF5',
                      border: 'none',
                      borderRadius: 8,
                      padding: '6px 10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <CheckCircle size={14} color="#12C479" />
                  </button>
                  <button 
                    onClick={() => { setShowAddCategory(false); setNewCategoryLabel(''); }}
                    style={{
                      background: '#FEF2F2',
                      border: 'none',
                      borderRadius: 8,
                      padding: '6px 10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <X size={14} color="#EF4444" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Team Assignments */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Assign Team Members</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {assignments.map((a, i) => (
                <div key={i} style={{ background: 'var(--input-bg)', borderRadius: 14, padding: '16px', border: '1.5px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Member {i + 1}</span>
                    {assignments.length > 1 && (
                      <button onClick={() => removeMember(i)} style={{ background: '#FEF2F2', border: 'none', borderRadius: 8, padding: '4px 10px', color: '#EF4444', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Trash2 size={12} /> Remove
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: hideBudget ? '1fr' : '1fr 1fr', gap: 10, marginBottom: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Team Member</label>
                      <select value={a.memberId} onChange={e => updateAssignment(i, 'memberId', e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 9, fontSize: 13, color: 'var(--text-primary)', outline: 'none', background: 'var(--bg-surface)', cursor: 'pointer', boxSizing: 'border-box' }}>
                        <option value="">Select member...</option>
                        {teamMembers.filter(m => m.status === 'Active').map(m => (
                          <option key={m.id} value={m.id}>{m.name} — {m.role}</option>
                        ))}
                      </select>
                    </div>
                    {!hideBudget && (
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Budget (₹)</label>
                        <input type="number" value={a.budget} onChange={e => updateAssignment(i, 'budget', e.target.value)} placeholder="0.00"
                          style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 9, fontSize: 13, color: 'var(--text-primary)', outline: 'none', background: 'var(--bg-surface)', boxSizing: 'border-box' }}
                          onFocus={e => e.target.style.borderColor = '#3B5BFC'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Instructions</label>
                    <input value={a.memberDesc} onChange={e => updateAssignment(i, 'memberDesc', e.target.value)} placeholder="Instructions for this member..."
                      style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 9, fontSize: 13, color: 'var(--text-primary)', outline: 'none', background: 'var(--bg-surface)', boxSizing: 'border-box' }}
                      onFocus={e => e.target.style.borderColor = '#3B5BFC'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                  </div>
                </div>
              ))}
            </div>
            <button onClick={addMember} style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: 'var(--bg-surface)', border: '1.5px dashed #C7D4FF', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#3B5BFC', cursor: 'pointer', width: '100%', justifyContent: 'center' }}>
              <Plus size={14} /> Add More Members
            </button>
          </div>

          {/* Payment Options */}
          {!hideBudget && (
          <div style={{ background: 'var(--input-bg)', borderRadius: 14, padding: '16px 20px', border: '1.5px solid var(--border)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {paymentEntries.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Payment Title</label>
                    <input 
                      value={p.title} 
                      onChange={e => updatePaymentEntry(i, 'title', e.target.value)} 
                      placeholder="e.g., Monthly payment..."
                      style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 9, fontSize: 13, color: 'var(--text-primary)', outline: 'none', background: 'var(--bg-surface)', boxSizing: 'border-box' }}
                      onFocus={e => e.target.style.borderColor = '#3B5BFC'} 
                      onBlur={e => e.target.style.borderColor = 'var(--border)'} 
                    />
                  </div>
                  <div style={{ width: 140 }}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Amount (₹)</label>
                    <input 
                      type="number"
                      value={p.amount} 
                      onChange={e => updatePaymentEntry(i, 'amount', e.target.value)} 
                      placeholder="0.00"
                      style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 9, fontSize: 13, color: 'var(--text-primary)', outline: 'none', background: 'var(--bg-surface)', boxSizing: 'border-box' }}
                      onFocus={e => e.target.style.borderColor = '#3B5BFC'} 
                      onBlur={e => e.target.style.borderColor = 'var(--border)'} 
                    />
                  </div>
                  {paymentEntries.length > 1 && (
                    <button 
                      onClick={() => removePaymentEntry(i)} 
                      style={{ 
                        background: '#FEF2F2', 
                        border: 'none', 
                        borderRadius: 8, 
                        padding: '9px 12px', 
                        color: '#EF4444', 
                        fontSize: 12, 
                        fontWeight: 600, 
                        cursor: 'pointer',
                        height: 38,
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button 
              onClick={addPaymentEntry} 
              style={{ 
                marginTop: 10, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 6, 
                padding: '8px 14px', 
                background: 'var(--bg-surface)', 
                border: '1.5px dashed #C7D4FF', 
                borderRadius: 10, 
                fontSize: 12, 
                fontWeight: 600, 
                color: '#3B5BFC', 
                cursor: 'pointer', 
                width: '100%', 
                justifyContent: 'center' 
              }}
            >
              <Plus size={13} /> Add Payment Entry
            </button>

            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>
              Additional payment details for this task
            </div>
          </div>
          )}

          {/* Budget summary */}
          {!hideBudget && (
          <div style={{ background: 'linear-gradient(135deg, #EEF2FF, #F5F3FF)', borderRadius: 14, padding: '16px 20px', border: '1.5px solid #C7D4FF' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Budget Summary (Auto-Calculated)</div>
            {assignments.filter(a => a.memberId && a.budget).map((a, i) => {
              const m = teamMembers.find(t => t.id === parseInt(a.memberId));
              return m ? (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  <span>{m.name} <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>({m.role})</span></span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹ {parseFloat(a.budget || 0).toLocaleString()}</span>
                </div>
              ) : null;
            })}
            <div style={{ borderTop: '1px solid #C7D4FF', marginTop: 8, paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Total Budget</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: '#3B5BFC' }}>₹ {totalBudget.toLocaleString()}</span>
            </div>
          </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 28px 24px', borderTop: '1px solid var(--border-light)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '11px 22px', background: 'var(--input-bg)', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSubmitClick} disabled={!title.trim() || (!deadline && !scheduledDate)} style={{
            padding: '11px 28px', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700,
            cursor: title.trim() && (deadline || scheduledDate) ? 'pointer' : 'default',
            background: title.trim() && (deadline || scheduledDate)
              ? scheduledDate ? 'linear-gradient(135deg, #7C3AED, #6D28D9)' : 'linear-gradient(135deg, #3B5BFC, #2142D9)'
              : 'var(--border)',
            color: title.trim() && (deadline || scheduledDate) ? '#fff' : 'var(--text-muted)',
            boxShadow: title.trim() && (deadline || scheduledDate) ? '0 6px 20px #3B5BFC40' : 'none',
          }}>{scheduledDate ? 'Schedule Task' : 'Create Task'}</button>
        </div>
      </div>
      {showPasswordModal && (
        <AdminPasswordModal
          onClose={handlePasswordCancel}
          onConfirm={handlePasswordConfirm}
          action={pendingAction?.actionName || 'perform this action'}
          label={managementMode ? 'Management Password' : 'Admin Password'}
        />
      )}
    </div>
  );
}

// ── Edit Task Modal ─────────────────────────────────────────────────────────
function EditTaskModal({ task, onClose, onUpdate, teamMembers, hideBudget = false, managementMode = false }) {
  const { showPasswordModal, pendingAction, requestAdminPassword, handlePasswordConfirm, handlePasswordCancel } = useAdminPassword();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [deadline, setDeadline] = useState(task.deadline);
  const [selectedTags, setSelectedTags] = useState(task.tags || []);
  const [selectedCategory, setSelectedCategory] = useState(task.category);
  const [assignments, setAssignments] = useState(
    task.members.map(m => ({ memberId: m.id.toString(), memberDesc: m.memberDesc || '', budget: m.budget || '' }))
  );
  const [paymentEntries, setPaymentEntries] = useState(
    task.payments && task.payments.length > 0 ? task.payments : [{ title: '', amount: '' }]
  );

  const [showAddTag, setShowAddTag] = useState(false);
  const [newTagLabel, setNewTagLabel] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryLabel, setNewCategoryLabel] = useState('');

  const addPaymentEntry = () => setPaymentEntries(prev => [...prev, { title: '', amount: '' }]);
  const removePaymentEntry = (i) => setPaymentEntries(prev => prev.filter((_, idx) => idx !== i));
  const updatePaymentEntry = (i, key, val) => setPaymentEntries(prev => prev.map((p, idx) => idx === i ? { ...p, [key]: val } : p));

  const totalBudget = assignments.reduce((s, a) => s + (parseFloat(a.budget) || 0), 0);

  const toggleTag = (tag) => {
    setSelectedTags(prev => prev.find(t => t.label === tag.label) ? prev.filter(t => t.label !== tag.label) : [...prev, tag]);
  };

  const addCustomTag = () => {
    if (!newTagLabel.trim()) return;
    const customTag = { label: newTagLabel.trim(), emoji: '🏷️', color: '#6B7280', bg: '#F3F4F6' };
    setSelectedTags(prev => [...prev, customTag]);
    setNewTagLabel('');
    setShowAddTag(false);
  };

  const addCustomCategory = () => {
    if (!newCategoryLabel.trim()) return;
    const customCategory = { label: newCategoryLabel.trim(), emoji: '📁', color: '#6B7280', bg: '#F3F4F6' };
    setSelectedCategory(customCategory);
    setNewCategoryLabel('');
    setShowAddCategory(false);
  };

  const addMember = () => setAssignments(prev => [...prev, { memberId: '', memberDesc: '', budget: '' }]);
  const removeMember = (i) => setAssignments(prev => prev.filter((_, idx) => idx !== i));
  const updateAssignment = (i, key, val) => setAssignments(prev => prev.map((a, idx) => idx === i ? { ...a, [key]: val } : a));

  const handleSubmitClick = () => {
    if (!title.trim() || !deadline) return;
    requestAdminPassword('update this task', () => {
      const members = assignments
        .filter(a => a.memberId)
        .map(a => {
          const m = teamMembers.find(t => t.id === parseInt(a.memberId));
          const existingMember = task.members.find(tm => tm.id === parseInt(a.memberId));
          return m ? { ...m, memberDesc: a.memberDesc, budget: parseFloat(a.budget) || 0, stage: existingMember?.stage || 'New' } : null;
        })
        .filter(Boolean);
      
      const payments = paymentEntries
        .filter(p => p.title.trim() || p.amount)
        .map(p => ({ title: p.title.trim(), amount: parseFloat(p.amount) || 0 }));
      
      const updatedTask = { 
        ...task,
        title, 
        description, 
        deadline, 
        tags: selectedTags, 
        category: selectedCategory, 
        totalBudget, 
        members,
        payments: payments.length > 0 ? payments : null,
      };
      
      onUpdate(task.id, updatedTask);
      onClose();
    });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--bg-surface)', borderRadius: 24, width: 680, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.25)' }}>
        {/* Header */}
        <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--bg-surface)', zIndex: 10, borderRadius: '24px 24px 0 0' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>Edit Task</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>Update task details and assignments</div>
          </div>
          <button onClick={onClose} style={{ background: 'var(--input-bg)', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={16} color="var(--text-secondary)" />
          </button>
        </div>

        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Task ID (read-only) */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Task ID</label>
            <div style={{ padding: '11px 16px', background: 'var(--input-bg)', borderRadius: 10, border: '1.5px solid var(--border)', fontFamily: 'monospace', fontSize: 15, fontWeight: 700, color: '#3B5BFC', letterSpacing: 1 }}>{task.id}</div>
          </div>

          {/* Title */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter task title..."
              style={{ width: '100%', padding: '11px 16px', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 14, color: 'var(--text-primary)', outline: 'none', background: 'var(--input-bg)', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#3B5BFC'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="General overview visible to all team members..." rows={3}
              style={{ width: '100%', padding: '11px 16px', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 14, color: 'var(--text-primary)', outline: 'none', background: 'var(--input-bg)', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#3B5BFC'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>

          {/* Deadline */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Completion Date *</label>
            <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
              style={{ width: '100%', padding: '11px 16px', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 14, color: 'var(--text-primary)', outline: 'none', background: 'var(--input-bg)', boxSizing: 'border-box', colorScheme: 'normal' }}
              onFocus={e => e.target.style.borderColor = '#3B5BFC'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>

          {/* Tags */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Tags</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {TAGS.map(tag => {
                const sel = selectedTags.find(t => t.label === tag.label);
                return (
                  <button key={tag.label} onClick={() => toggleTag(tag)} style={{
                    padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    border: `1.5px solid ${sel ? tag.color : 'var(--border)'}`,
                    background: sel ? tag.bg : 'var(--bg-surface)', color: sel ? tag.color : 'var(--text-secondary)', transition: 'all 0.15s',
                  }}>
                    {tag.emoji} {tag.label}
                  </button>
                );
              })}
              
              {!showAddTag ? (
                <button onClick={() => setShowAddTag(true)} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1.5px dashed #C7D4FF', background: 'var(--bg-surface)', color: '#3B5BFC', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Plus size={14} /> Add Tag
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input value={newTagLabel} onChange={e => setNewTagLabel(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustomTag()} placeholder="Tag name..." autoFocus
                    style={{ padding: '6px 12px', border: '1.5px solid #3B5BFC', borderRadius: 10, fontSize: 12, outline: 'none', width: 120 }} />
                  <button onClick={addCustomTag} style={{ background: '#ECFDF5', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <CheckCircle size={14} color="#12C479" />
                  </button>
                  <button onClick={() => { setShowAddTag(false); setNewTagLabel(''); }} style={{ background: '#FEF2F2', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <X size={14} color="#EF4444" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Category */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Category <span style={{ fontSize: 11, textTransform: 'none', fontWeight: 400, color: 'var(--text-muted)' }}>(pick one)</span>
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {CATEGORIES.map(cat => {
                const sel = selectedCategory?.label === cat.label;
                return (
                  <button key={cat.label} onClick={() => setSelectedCategory(sel ? null : cat)} style={{
                    padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    border: `1.5px solid ${sel ? cat.color : 'var(--border)'}`,
                    background: sel ? cat.bg : 'var(--bg-surface)',
                    color: sel ? cat.color : 'var(--text-secondary)',
                    transition: 'all 0.15s',
                    boxShadow: sel ? `0 2px 8px ${cat.color}30` : 'none',
                  }}>
                    {cat.emoji} {cat.label}
                  </button>
                );
              })}
              
              {!showAddCategory ? (
                <button onClick={() => setShowAddCategory(true)} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1.5px dashed #C7D4FF', background: 'var(--bg-surface)', color: '#3B5BFC', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Plus size={14} /> Add Category
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input value={newCategoryLabel} onChange={e => setNewCategoryLabel(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustomCategory()} placeholder="Category name..." autoFocus
                    style={{ padding: '6px 12px', border: '1.5px solid #3B5BFC', borderRadius: 10, fontSize: 12, outline: 'none', width: 140 }} />
                  <button onClick={addCustomCategory} style={{ background: '#ECFDF5', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <CheckCircle size={14} color="#12C479" />
                  </button>
                  <button onClick={() => { setShowAddCategory(false); setNewCategoryLabel(''); }} style={{ background: '#FEF2F2', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <X size={14} color="#EF4444" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Team Assignments */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Assign Team Members</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {assignments.map((a, i) => (
                <div key={i} style={{ background: 'var(--input-bg)', borderRadius: 14, padding: '16px', border: '1.5px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Member {i + 1}</span>
                    {assignments.length > 1 && (
                      <button onClick={() => removeMember(i)} style={{ background: '#FEF2F2', border: 'none', borderRadius: 8, padding: '4px 10px', color: '#EF4444', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Trash2 size={12} /> Remove
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: hideBudget ? '1fr' : '1fr 1fr', gap: 10, marginBottom: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Team Member</label>
                      <select value={a.memberId} onChange={e => updateAssignment(i, 'memberId', e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 9, fontSize: 13, color: 'var(--text-primary)', outline: 'none', background: 'var(--bg-surface)', cursor: 'pointer', boxSizing: 'border-box' }}>
                        <option value="">Select member...</option>
                        {teamMembers.filter(m => m.status === 'Active').map(m => (
                          <option key={m.id} value={m.id}>{m.name} — {m.role}</option>
                        ))}
                      </select>
                    </div>
                    {!hideBudget && (
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Budget (₹)</label>
                        <input type="number" value={a.budget} onChange={e => updateAssignment(i, 'budget', e.target.value)} placeholder="0.00"
                          style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 9, fontSize: 13, color: 'var(--text-primary)', outline: 'none', background: 'var(--bg-surface)', boxSizing: 'border-box' }}
                          onFocus={e => e.target.style.borderColor = '#3B5BFC'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Instructions</label>
                    <input value={a.memberDesc} onChange={e => updateAssignment(i, 'memberDesc', e.target.value)} placeholder="Instructions for this member..."
                      style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 9, fontSize: 13, color: 'var(--text-primary)', outline: 'none', background: 'var(--bg-surface)', boxSizing: 'border-box' }}
                      onFocus={e => e.target.style.borderColor = '#3B5BFC'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                  </div>
                </div>
              ))}
            </div>
            <button onClick={addMember} style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: 'var(--bg-surface)', border: '1.5px dashed #C7D4FF', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#3B5BFC', cursor: 'pointer', width: '100%', justifyContent: 'center' }}>
              <Plus size={14} /> Add More Members
            </button>
          </div>

          {/* Payment Options */}
          {!hideBudget && <div style={{ background: 'var(--input-bg)', borderRadius: 14, padding: '16px 20px', border: '1.5px solid var(--border)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {paymentEntries.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Payment Title</label>
                    <input value={p.title} onChange={e => updatePaymentEntry(i, 'title', e.target.value)} placeholder="e.g., Monthly payment..."
                      style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 9, fontSize: 13, color: 'var(--text-primary)', outline: 'none', background: 'var(--bg-surface)', boxSizing: 'border-box' }}
                      onFocus={e => e.target.style.borderColor = '#3B5BFC'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                  </div>
                  <div style={{ width: 140 }}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Amount (₹)</label>
                    <input type="number" value={p.amount} onChange={e => updatePaymentEntry(i, 'amount', e.target.value)} placeholder="0.00"
                      style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 9, fontSize: 13, color: 'var(--text-primary)', outline: 'none', background: 'var(--bg-surface)', boxSizing: 'border-box' }}
                      onFocus={e => e.target.style.borderColor = '#3B5BFC'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                  </div>
                  {paymentEntries.length > 1 && (
                    <button onClick={() => removePaymentEntry(i)} style={{ background: '#FEF2F2', border: 'none', borderRadius: 8, padding: '9px 12px', color: '#EF4444', fontSize: 12, fontWeight: 600, cursor: 'pointer', height: 38 }}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button onClick={addPaymentEntry} style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'var(--bg-surface)', border: '1.5px dashed #C7D4FF', borderRadius: 10, fontSize: 12, fontWeight: 600, color: '#3B5BFC', cursor: 'pointer', width: '100%', justifyContent: 'center' }}>
              <Plus size={13} /> Add Payment Entry
            </button>

            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>
              Additional payment details for this task
            </div>
          </div>}

          {/* Budget summary */}
          {!hideBudget && <div style={{ background: 'linear-gradient(135deg, #EEF2FF, #F5F3FF)', borderRadius: 14, padding: '16px 20px', border: '1.5px solid #C7D4FF' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Budget Summary (Auto-Calculated)</div>
            {assignments.filter(a => a.memberId && a.budget).map((a, i) => {
              const m = teamMembers.find(t => t.id === parseInt(a.memberId));
              return m ? (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  <span>{m.name} <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>({m.role})</span></span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹ {parseFloat(a.budget || 0).toLocaleString()}</span>
                </div>
              ) : null;
            })}
            <div style={{ borderTop: '1px solid #C7D4FF', marginTop: 8, paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Total Budget</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: '#3B5BFC' }}>₹ {totalBudget.toLocaleString()}</span>
            </div>
          </div>}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 28px 24px', borderTop: '1px solid var(--border-light)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '11px 22px', background: 'var(--input-bg)', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSubmitClick} disabled={!title.trim() || !deadline} style={{
            padding: '11px 28px', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: title.trim() && deadline ? 'pointer' : 'default',
            background: title.trim() && deadline ? 'linear-gradient(135deg, #3B5BFC, #2142D9)' : 'var(--border)',
            color: title.trim() && deadline ? '#fff' : 'var(--text-muted)',
            boxShadow: title.trim() && deadline ? '0 6px 20px #3B5BFC40' : 'none',
          }}>Update Task</button>
        </div>
      </div>
      {showPasswordModal && (
        <AdminPasswordModal
          onClose={handlePasswordCancel}
          onConfirm={handlePasswordConfirm}
          action={pendingAction?.actionName || 'perform this action'}
        label={managementMode ? 'Management Password' : 'Admin Password'} />
      )}
    </div>
  );
}

// ── Admin Task Detail Modal (same as Dashboard) ─────────────────────────────
export function AdminTaskModal({ task: initialTask, onClose, onEdit, onTimelineClick, hideBudget = false, onCreateScheduled = null, onCancelScheduled = null, managementMode = false }) {
  const { tasks, STAGE_COLORS, STAGE_BG, STAGES, updateTaskStage, deleteTask, markTaskPaid, updateTask, pauseTask, resumeTask, fmt, adminPassword } = useApp();
  const { showPasswordModal, pendingAction, requestAdminPassword, handlePasswordConfirm, handlePasswordCancel } = useAdminPassword();

  const t = tasks.find(t => t.id === initialTask.id) || initialTask;

  const [stageSelect, setStageSelect]     = useState('');
  const [updateNote, setUpdateNote]       = useState('');
  const [memberUpdateNote, setMemberUpdateNote] = useState({});
  const [memberStage, setMemberStage]     = useState({});
  const [updating, setUpdating]           = useState(false);
  const [updatingMember, setUpdatingMember] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting]           = useState(false);
  const [confirmPause, setConfirmPause]   = useState(false);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminPwd, setAdminPwd]           = useState('');
  const [pwdError, setPwdError]           = useState(false);
  const [showCreateDate, setShowCreateDate] = useState(false);
  const [createDate, setCreateDate]         = useState('');

  const todayStr = new Date().toISOString().split('T')[0];
  const ADMIN_PASSWORD = adminPassword;

  function handleAdminUnlock() {
    if (adminPwd === ADMIN_PASSWORD) {
      setAdminUnlocked(true);
      setAdminPwd('');
      setPwdError(false);
    } else {
      setPwdError(true);
      setAdminPwd('');
    }
  }
  const [showExtendDate, setShowExtendDate] = useState(false);
  const [extendDateVal, setExtendDateVal]   = useState(t.extendedDeadline || '');

  const today      = new Date();
  const displayDeadline = t.extendedDeadline || t.deadline;
  const overdueFlag = new Date(displayDeadline) < today && t.stage !== 'Complete';
  const isComplete  = t.stage === 'Complete';
  const days        = Math.ceil((new Date(displayDeadline) - today) / (1000 * 60 * 60 * 24));

  function handleStageUpdate() {
    if (!stageSelect) return;
    requestAdminPassword('update task stage', () => {
      setUpdating(true);
      setTimeout(() => { 
        if (stageSelect === 'Update' && updateNote) {
          updateTask(t.id, { updateNote });
        }
        updateTaskStage(t.id, stageSelect); 
        setUpdating(false); 
        setStageSelect(''); 
        setUpdateNote('');
      }, 700);
    });
  }

  function handleMemberStageUpdate(memberId) {
    const key = `${t.id}-${memberId}`;
    if (!memberStage[key]) return;
    
    // Check if member is on hold
    const member = t.members.find(m => m.id === memberId);
    if (member?.isOnHold) return;
    
    requestAdminPassword('update member stage', () => {
      setUpdatingMember(key);
      setTimeout(() => {
        // If updating to "Update" stage and there's a note, save it
        if (memberStage[key] === 'Update' && memberUpdateNote[key]) {
          updateTask(t.id, { updateNote: memberUpdateNote[key] });
        }
        updateTaskStage(t.id, memberStage[key], memberId);
        setUpdatingMember(null);
        setMemberStage(prev => { const n = { ...prev }; delete n[key]; return n; });
        setMemberUpdateNote(prev => { const n = { ...prev }; delete n[key]; return n; });
      }, 600);
    });
  }

  function handleDelete() {
    setDeleting(true);
    setTimeout(() => { deleteTask(t.id, { name: 'Admin', role: 'Administrator', avatar: 'A', color: '#3B5BFC' }); onClose(); }, 500);
  }

  function handleHoldTaskClick() {
    requestAdminPassword('hold this task', () => {
      pauseTask(t.id);
      setConfirmPause(false);
    });
  }

  function handleRemoveTaskClick() {
    requestAdminPassword('remove this task', () => {
      handleDelete();
    });
  }

  function handleActivateTaskClick() {
    requestAdminPassword('activate this task', () => {
      resumeTask(t.id);
    });
  }

  function handleMemberHoldToggle(memberId, currentHoldStatus) {
    const actionText = currentHoldStatus ? 'activate this member' : 'hold this member';
    requestAdminPassword(actionText, () => {
      const updatedMembers = t.members.map(member => 
        member.id === memberId ? { ...member, isOnHold: !member.isOnHold } : member
      );
      updateTask(t.id, { members: updatedMembers });
    });
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-surface)', borderRadius: 20, width: '100%', maxWidth: 660, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.18)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '18px 22px', borderBottom: '1.5px solid var(--border-light)', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: isComplete ? '#ECFDF5' : overdueFlag ? '#FEF2F2' : STAGE_BG[t.stage], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isComplete ? <CheckCircle size={17} color="#12C479" strokeWidth={2.5} /> : overdueFlag ? <AlertCircle size={17} color="#EF4444" strokeWidth={2.5} /> : <Clock size={17} color={STAGE_COLORS[t.stage]} strokeWidth={2.5} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
              <span 
                onClick={(e) => { e.stopPropagation(); if (onTimelineClick) onTimelineClick(t); }}
                style={{ fontSize: 10, fontWeight: 700, color: '#fff', background: isComplete ? '#12C479' : '#3B5BFC', padding: '2px 8px', borderRadius: 5, cursor: onTimelineClick ? 'pointer' : 'default' }}
              >
                {t.id}
              </span>
              <span 
                className="task-title-hover"
                style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', position: 'relative' }}
              >
                {t.title}
                {t.description && (
                  <div className="task-desc-tooltip" style={{ 
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: 8,
                    padding: '10px 12px',
                    background: 'var(--bg-surface)',
                    borderRadius: 10,
                    border: '1.5px solid var(--border)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    zIndex: 1000,
                    minWidth: 300,
                    maxWidth: 400,
                    opacity: 0,
                    pointerEvents: 'none',
                    transition: 'opacity 0.2s',
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Task Overview</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{t.description}</div>
                  </div>
                )}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: STAGE_BG[t.stage], color: STAGE_COLORS[t.stage] }}>{t.stage}</span>
              <span style={{ fontSize: 11, color: overdueFlag ? '#EF4444' : days <= 2 ? '#F97316' : 'var(--text-secondary)', fontWeight: 600 }}>
                {isComplete ? '✅ Completed' : overdueFlag ? `⚠ ${Math.abs(days)}d overdue` : days === 0 ? '🔥 Due today' : days === 1 ? '⏰ Due tomorrow' : `${t.extendedDeadline ? 'Extended: ' : 'Due '}${new Date(displayDeadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
              </span>
              {t.isScheduled && (
                <span style={{ fontSize: 10, fontWeight: 700, color: '#3B5BFC', background: '#EEF2FF', padding: '3px 10px', borderRadius: 20, border: '1.5px solid #3B5BFC' }}>
                  📅 Scheduled
                </span>
              )}
              {t.category && (
                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: t.category.bg, color: t.category.color, fontWeight: 700, border: `1px solid ${t.category.color}30` }}>{t.category.emoji} {t.category.label}</span>
              )}
              {t.tags.map(tag => <span key={tag.label} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, background: tag.bg, color: tag.color, fontWeight: 600 }}>{tag.emoji} {tag.label}</span>)}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {t.isScheduled ? (
              showCreateDate ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input type="date" value={createDate} min={todayStr}
                    onChange={e => setCreateDate(e.target.value)}
                    style={{ padding: '5px 10px', borderRadius: 8, border: '1.5px solid #C7D4FF', fontSize: 12, color: 'var(--text-primary)', outline: 'none', background: 'var(--input-bg)', colorScheme: 'normal' }}
                    onFocus={e => e.target.style.borderColor = '#3B5BFC'} onBlur={e => e.target.style.borderColor = '#C7D4FF'} />
                  <button
                    disabled={!createDate}
                    onClick={() => { onCreateScheduled && onCreateScheduled({ ...t, deadline: createDate, scheduledDate: null, isScheduled: false }); onClose(); }}
                    style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: createDate ? 'linear-gradient(135deg, #3B5BFC, #2142D9)' : 'var(--border)', color: createDate ? '#fff' : 'var(--text-muted)', fontSize: 12, fontWeight: 700, cursor: createDate ? 'pointer' : 'default' }}>
                    Confirm
                  </button>
                  <button onClick={() => { setShowCreateDate(false); setCreateDate(''); }}
                    style={{ padding: '6px 8px', borderRadius: 8, border: 'none', background: 'var(--bg-subtle)', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer' }}>
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <>
                  <button onClick={() => setShowCreateDate(true)}
                    style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #3B5BFC, #2142D9)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    Create
                  </button>
                  <button onClick={() => { onCancelScheduled && onCancelScheduled(t.id); onClose(); }}
                    style={{ padding: '6px 14px', borderRadius: 8, border: '1.5px solid #FED7D7', background: '#FFF5F5', color: '#EF4444', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    Cancel
                  </button>
                </>
              )
            ) : (
              onEdit && (
                <button onClick={() => onEdit(t)}
                  style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: '#EEF2FF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#C7D4FF'}
                  onMouseLeave={e => e.currentTarget.style.background = '#EEF2FF'}>
                  <Edit2 size={14} color="#3B5BFC" />
                </button>
              )
            )}
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: 'var(--bg-subtle)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16, color: 'var(--text-secondary)' }}>✕</button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 10 }}>
            {!hideBudget && (
              <div style={{ flex: 1, background: 'var(--bg-subtle)', borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Total Budget</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#12C479' }}>₹ {t.totalBudget?.toLocaleString()}</div>
              </div>
            )}
            <div style={{ flex: 1, background: 'var(--bg-subtle)', borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Payment</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: t.paid ? '#12C479' : '#F97316' }}>{t.paid ? '✅ Paid' : '⏳ Pending'}</div>
            </div>
            <div style={{ flex: 1, background: 'var(--bg-subtle)', borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Members</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{t.members.length} assigned</div>
            </div>
          </div>

          {/* Stage progress */}
          <div style={{ padding: '14px 16px', background: 'var(--bg-subtle)', borderRadius: 12, border: '1.5px solid var(--border-light)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 12 }}>Stage Progress</div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {STAGES.map((s, i, arr) => {
                const curIdx = STAGES.indexOf(t.stage);
                const sIdx   = STAGES.indexOf(s);
                const isPast = sIdx < curIdx;
                const isCur  = s === t.stage;
                return (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < arr.length - 1 ? 1 : 'none' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isPast ? '#12C479' : isCur ? '#3B5BFC' : 'var(--bg-surface)', border: `2px solid ${isPast ? '#12C479' : isCur ? '#3B5BFC' : 'var(--border)'}`, fontSize: 10, fontWeight: 800, color: isPast || isCur ? '#fff' : 'var(--text-muted)' }}>
                        {isPast ? '✓' : i + 1}
                      </div>
                      <span style={{ fontSize: 9, fontWeight: isCur ? 800 : 500, color: isCur ? '#3B5BFC' : 'var(--text-muted)', marginTop: 4, whiteSpace: 'nowrap' }}>{s}</span>
                    </div>
                    {i < arr.length - 1 && <div style={{ flex: 1, height: 2, background: isPast ? '#12C479' : 'var(--border-light)', marginBottom: 16, minWidth: 8 }} />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Issue Note - Read Only */}
          {t.issueNote && (
            <div style={{ padding: '14px 16px', background: '#FEF2F2', borderRadius: 12, border: '1.5px solid #FED7D7' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <AlertCircle size={16} color="#EF4444" strokeWidth={2.5} />
                <div style={{ fontSize: 11, fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reported Issue</div>
              </div>
              <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, background: '#fff', padding: '10px 12px', borderRadius: 8, border: '1px solid #FED7D7' }}>
                {t.issueNote}
              </div>
            </div>
          )}

          {/* Team — per-member stage controls */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8 }}>Team</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {t.members.map(m => {
                const key = `${t.id}-${m.id}`;
                const isUpdatingThis = updatingMember === key;
                return (
                  <div key={m.id} style={{ background: 'var(--bg-subtle)', border: '1.5px solid var(--border-light)', borderRadius: 12, padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#fff', flexShrink: 0 }}>{m.avatar}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{m.name}</div>
                        <div 
                          className="member-role-hover"
                          style={{ fontSize: 11, color: 'var(--text-muted)', position: 'relative' }}
                        >
                          {m.role}
                          {m.memberDesc && (
                            <div className="member-desc-tooltip" style={{ 
                              position: 'absolute',
                              top: '100%',
                              left: 0,
                              marginTop: 8,
                              padding: '10px 12px',
                              background: 'var(--bg-surface)',
                              borderRadius: 10,
                              border: '1.5px solid var(--border)',
                              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                              zIndex: 1000,
                              minWidth: 250,
                              maxWidth: 350,
                              opacity: 0,
                              pointerEvents: 'none',
                              transition: 'opacity 0.2s',
                            }}>
                              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Instructions</div>
                              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{m.memberDesc}</div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {!hideBudget && <div style={{ fontSize: 13, fontWeight: 800, color: '#12C479' }}>₹ {m.budget?.toLocaleString()}</div>}
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: m.isOnHold ? '#FFF7ED' : STAGE_BG[m.stage], color: m.isOnHold ? '#F97316' : STAGE_COLORS[m.stage] }}>
                          {m.isOnHold ? 'On Hold' : m.stage}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <UserCheck size={11} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                        <select 
                          value={memberStage[key] !== undefined ? memberStage[key] : m.stage} 
                          onChange={e => setMemberStage(prev => ({ ...prev, [key]: e.target.value }))}
                          disabled={m.isOnHold}
                          style={{ flex: 1, height: 32, borderRadius: 8, border: `1.5px solid ${m.isOnHold ? '#F97316' : memberStage[key] ? '#3B5BFC' : 'var(--border)'}`, padding: '0 10px', fontSize: 11, fontWeight: 600, color: m.isOnHold ? '#F97316' : 'var(--text-primary)', background: m.isOnHold ? '#FFF7ED' : 'var(--bg-surface)', cursor: m.isOnHold ? 'not-allowed' : 'pointer', outline: 'none' }}>
                          {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        {!m.isOnHold && (
                          <button disabled={!memberStage[key] || memberStage[key] === m.stage || isUpdatingThis} onClick={() => handleMemberStageUpdate(m.id)}
                            style={{ height: 32, padding: '0 14px', borderRadius: 8, border: 'none', background: (memberStage[key] && memberStage[key] !== m.stage) ? 'linear-gradient(135deg, #3B5BFC, #2142D9)' : 'var(--border)', color: (memberStage[key] && memberStage[key] !== m.stage) ? '#fff' : 'var(--text-muted)', fontSize: 11, fontWeight: 700, cursor: (memberStage[key] && memberStage[key] !== m.stage) ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0, transition: 'all 0.15s' }}>
                            {isUpdatingThis ? <><RefreshCw size={11} style={{ animation: 'spin 0.7s linear infinite' }} /> Saving</> : 'Apply'}
                          </button>
                        )}
                        <button 
                          onClick={() => handleMemberHoldToggle(m.id, m.isOnHold)}
                          style={{ 
                            height: 32, 
                            padding: '0 12px', 
                            borderRadius: 8, 
                            border: 'none', 
                            background: m.isOnHold ? '#12C479' : '#F97316', 
                            color: '#fff', 
                            fontSize: 11, 
                            fontWeight: 700, 
                            cursor: 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 5, 
                            flexShrink: 0, 
                            transition: 'all 0.15s',
                            whiteSpace: 'nowrap'
                          }}
                          title={m.isOnHold ? 'Activate member' : 'Put member on hold'}
                        >
                          {m.isOnHold ? 'Activate' : 'Hold'}
                        </button>
                      </div>
                      
                      {/* Update Note Field - Show when Update stage is selected for this member */}
                      {memberStage[key] === 'Update' && (
                        <textarea
                          value={memberUpdateNote[key] || ''}
                          onChange={e => setMemberUpdateNote(prev => ({ ...prev, [key]: e.target.value }))}
                          placeholder="Describe what this member needs to update..."
                          rows={2}
                          style={{ 
                            width: '100%', 
                            padding: '6px 8px', 
                            borderRadius: 6, 
                            border: '1.5px solid #D97706', 
                            background: '#FFFBEB', 
                            fontSize: 11, 
                            color: 'var(--text-primary)', 
                            outline: 'none',
                            resize: 'vertical',
                            fontFamily: 'inherit'
                          }}
                        />
                      )}
                      
                      {/* Show existing update note if member is in Update stage (read-only for team members) */}
                      {m.stage === 'Update' && t.updateNote && (
                        <div style={{ padding: '8px 10px', background: '#FFFBEB', borderRadius: 6, border: '1.5px solid #FDE68A' }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: '#D97706', marginBottom: 3 }}>Update Instructions:</div>
                          <div style={{ fontSize: 11, color: '#92400E', lineHeight: 1.4 }}>{t.updateNote}</div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Task Management Controls */}
          <div style={{ padding: '14px 16px', background: 'var(--bg-subtle)', borderRadius: 12, border: '1.5px solid var(--border-light)' }}>
            
            {!isComplete && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 1 }}>Move all members to stage</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Overrides all individual member stages</div>
                  </div>
                  <select value={stageSelect} onChange={e => setStageSelect(e.target.value)}
                    style={{ height: 36, borderRadius: 9, border: `1.5px solid ${stageSelect ? '#3B5BFC' : 'var(--border)'}`, padding: '0 10px', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', background: 'var(--bg-surface)', cursor: 'pointer', outline: 'none', minWidth: 140 }}>
                    <option value="">Select stage…</option>
                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button disabled={!stageSelect || updating} onClick={handleStageUpdate}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 9, border: 'none', background: stageSelect ? 'linear-gradient(135deg, #3B5BFC, #2142D9)' : 'var(--border)', color: stageSelect ? '#fff' : 'var(--text-muted)', fontSize: 12, fontWeight: 700, cursor: stageSelect ? 'pointer' : 'default', boxShadow: stageSelect ? '0 4px 12px rgba(59,91,252,0.3)' : 'none', transition: 'all 0.15s', flexShrink: 0 }}>
                    {updating ? <><RefreshCw size={12} style={{ animation: 'spin 0.7s linear infinite' }} /> Saving…</> : 'Apply All'}
                  </button>
                </div>
                
                {/* Update Note Field - Only show when Update stage is selected */}
                {stageSelect === 'Update' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>Update Instructions (Required)</label>
                    <textarea
                      value={updateNote}
                      onChange={e => setUpdateNote(e.target.value)}
                      placeholder="Describe what needs to be updated..."
                      rows={3}
                      style={{ 
                        width: '100%', 
                        padding: '8px 10px', 
                        borderRadius: 8, 
                        border: '1.5px solid #D97706', 
                        background: '#FFFBEB', 
                        fontSize: 12, 
                        color: 'var(--text-primary)', 
                        outline: 'none',
                        resize: 'vertical',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                )}
                
                {/* Show existing update note if task is in Update stage */}
                {t.stage === 'Update' && t.updateNote && (
                  <div style={{ padding: '10px 12px', background: '#FFFBEB', borderRadius: 8, border: '1.5px solid #FDE68A' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#D97706', marginBottom: 4 }}>Update Instructions:</div>
                    <div style={{ fontSize: 12, color: '#92400E', lineHeight: 1.5 }}>{t.updateNote}</div>
                  </div>
                )}
              </div>
            )}

            {/* Extend Date */}
            {!isComplete && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showExtendDate ? 8 : 0 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>Extend Date</div>
                    {t.extendedDeadline && !showExtendDate && (
                      <div style={{ fontSize: 11, color: '#F97316', fontWeight: 600 }}>Extended to {new Date(t.extendedDeadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                    )}
                  </div>
                  <button onClick={() => { setShowExtendDate(p => !p); setExtendDateVal(t.extendedDeadline || ''); }}
                    style={{ padding: '5px 12px', borderRadius: 8, border: `1.5px solid ${t.extendedDeadline ? '#F97316' : 'var(--border)'}`, background: t.extendedDeadline ? '#FFF7ED' : 'var(--bg-surface)', color: t.extendedDeadline ? '#F97316' : 'var(--text-secondary)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                    {showExtendDate ? 'Cancel' : t.extendedDeadline ? 'Edit' : 'Set'}
                  </button>
                </div>
                {showExtendDate && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="date" value={extendDateVal} onChange={e => setExtendDateVal(e.target.value)}
                      min={t.deadline}
                      style={{ flex: 1, height: 36, borderRadius: 9, border: '1.5px solid #F97316', padding: '0 10px', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', background: 'var(--bg-surface)', outline: 'none' }} />
                    <button onClick={() => requestAdminPassword('extend task deadline', () => { updateTask(t.id, { ...t, extendedDeadline: extendDateVal || null }); setShowExtendDate(false); })}
                      disabled={!extendDateVal}
                      style={{ height: 36, padding: '0 16px', borderRadius: 9, border: 'none', background: extendDateVal ? 'linear-gradient(135deg, #F97316, #EA6C00)' : 'var(--border)', color: extendDateVal ? '#fff' : 'var(--text-muted)', fontSize: 12, fontWeight: 700, cursor: extendDateVal ? 'pointer' : 'default', flexShrink: 0 }}>
                      Apply
                    </button>
                    {t.extendedDeadline && (
                      <button onClick={() => requestAdminPassword('clear extended deadline', () => { updateTask(t.id, { ...t, extendedDeadline: null }); setShowExtendDate(false); })}
                        style={{ height: 36, padding: '0 12px', borderRadius: 9, border: '1.5px solid #FCA5A5', background: '#FEF2F2', color: '#EF4444', fontSize: 11, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
                        Clear
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {!t.paid && isComplete && (
              <button onClick={() => { markTaskPaid(t.id); onClose(); }}
                style={{ width: '100%', padding: '11px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #12C479, #059669)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 12px rgba(18,196,121,0.3)', marginBottom: 10 }}>
                <Wallet size={14} /> Mark as Paid — ₹ {t.totalBudget?.toLocaleString()}
              </button>
            )}

            {isComplete && t.paid && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#F0FDF4', borderRadius: 10, border: '1.5px solid #BBF7D0', marginBottom: 10 }}>
                <CheckCircle size={16} color="#12C479" strokeWidth={2.5} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#12C479' }}>Task completed & paid</div>
                  <div style={{ fontSize: 11, color: '#6B7280' }}>₹ {t.totalBudget?.toLocaleString()} processed to team</div>
                </div>
              </div>
            )}

            {/* Hold / Activate */}
            {!isComplete && !t.paused && !confirmPause && (
              <button onClick={handleHoldTaskClick}
                style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1.5px solid #FDE68A', background: '#FFFBEB', color: '#D97706', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginBottom: 8 }}>
                <Hourglass size={13} /> Hold Task
              </button>
            )}
            {!isComplete && !t.paused && confirmPause && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#FFFBEB', borderRadius: 10, border: '1.5px solid #FDE68A', marginBottom: 8 }}>
                <AlertCircle size={14} color="#D97706" />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#D97706', flex: 1 }}>Place "{t.title}" on hold? Progress will be held.</span>
                <button onClick={handleHoldTaskClick}
                  style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: '#D97706', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  Hold
                </button>
                <button onClick={() => setConfirmPause(false)}
                  style={{ padding: '6px 12px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              </div>
            )}
            {t.paused && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#FFFBEB', borderRadius: 10, border: '1.5px solid #FDE68A', marginBottom: 8 }}>
                <Hourglass size={15} color="#D97706" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#D97706' }}>Task On Hold</div>
                  {t.pausedOn && <div style={{ fontSize: 10, color: '#92400E' }}>Since {new Date(t.pausedOn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>}
                </div>
                <button onClick={handleActivateTaskClick}
                  style={{ padding: '7px 16px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #3B5BFC, #2142D9)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 12px rgba(59,91,252,0.3)', flexShrink: 0 }}>
                  <CheckCircle size={13} strokeWidth={2.5} /> Activate Task
                </button>
              </div>
            )}

            {!confirmDelete ? (
              <button onClick={handleRemoveTaskClick}
                style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1.5px solid #FCA5A5', background: '#FEF2F2', color: '#EF4444', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                <Trash2 size={13} /> Remove Task
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#FEF2F2', borderRadius: 10, border: '1.5px solid #FCA5A5' }}>
                <AlertCircle size={14} color="#EF4444" />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#EF4444', flex: 1 }}>Remove "{t.title}"? This cannot be undone.</span>
                <button onClick={handleRemoveTaskClick} disabled={deleting}
                  style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: '#EF4444', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                  {deleting ? <><RefreshCw size={11} style={{ animation: 'spin 0.7s linear infinite' }} /> Removing</> : 'Remove'}
                </button>
                <button onClick={() => setConfirmDelete(false)}
                  style={{ padding: '6px 12px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              </div>
            )}
          </div>
        </div>
      </div>
      {showPasswordModal && (
        <AdminPasswordModal
          onClose={handlePasswordCancel}
          onConfirm={handlePasswordConfirm}
          action={pendingAction?.actionName || 'perform this action'}
        label={managementMode ? 'Management Password' : 'Admin Password'} />
      )}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .task-title-hover:hover .task-desc-tooltip {
          opacity: 1 !important;
          pointer-events: auto !important;
        }
        .member-role-hover:hover .member-desc-tooltip {
          opacity: 1 !important;
          pointer-events: auto !important;
        }
      `}</style>
    </div>
  );
}

// ── Main Tasks Page ─────────────────────────────────────────────────────────
export default function TasksPage({ hideBudget = false, hideTimeline = false, currentUser: propCurrentUser = null, managementMode = false }) {
  const { tasks, team, createTask, taskRequests, approveTaskRequest, completeTaskRequest, updateTask, scheduledTasks, addScheduledTask, removeScheduledTask, currentUser: contextCurrentUser } = useApp();
  const { showPasswordModal, pendingAction, requestAdminPassword, handlePasswordConfirm, handlePasswordCancel } = useAdminPassword();
  const currentUser = propCurrentUser || contextCurrentUser;
  const isAdmin = currentUser?.userRole === 'admin' || currentUser?.role === 'Administrator';
  const isManagement = currentUser?.userRole === 'management' || currentUser?.role?.includes('Management') || currentUser?.role?.includes('Manager');
  const canViewScheduled = isAdmin || isManagement;
  const [stageFilter, setStageFilter] = useState('All');
  const [showCreate, setShowCreate] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [requestToApprove, setRequestToApprove] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDateFrom, setTempDateFrom] = useState('');
  const [tempDateTo, setTempDateTo] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [viewTask, setViewTask] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [timelineTask, setTimelineTask] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLoading, setPageLoading] = useState(false);
  const itemsPerPage = 15;

  // Check if page has been visited before
  const [initialLoading, setInitialLoading] = useState(() => {
    const visited = sessionStorage.getItem('visited_tasks');
    return !visited;
  });

  // Initial loading effect
  useEffect(() => {
    if (initialLoading) {
      const timer = setTimeout(() => {
        setInitialLoading(false);
        sessionStorage.setItem('visited_tasks', 'true');
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [initialLoading]);

  const handlePageChange = (newPage) => {
    setPageLoading(true);
    setTimeout(() => {
      setCurrentPage(newPage);
      setTimeout(() => setPageLoading(false), 400);
    }, 50);
  };

  const handleApproveRequest = (request) => {
    requestAdminPassword('approve this task request', () => {
      approveTaskRequest(request.id, currentUser);
      setRequestToApprove({ ...request, _approvedBy: currentUser });
      setShowRequests(false);
      setShowCreate(true);
      completeTaskRequest(request.id, currentUser);
    });
  };

  const handleCompleteRequest = (request) => {
    requestAdminPassword('complete this task request', () => {
      completeTaskRequest(request.id, currentUser);
    });
  };

  const handleCreateTaskClick = () => {
    setShowCreate(true);
  };

  // Get unique categories and tags from tasks
  const categories = [...new Set(tasks.filter(t => t.category).map(t => t.category.label))];
  const allTags = [...new Set(tasks.flatMap(t => t.tags || []).map(tag => tag.label))];

  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const filtered = stageFilter === 'Scheduled' ? scheduledTasks : tasks.filter(t => {
    // Stage filter
    const matchesStage = stageFilter === 'All' || t.stage === stageFilter;
    
    // Category filter
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(t.category?.label);
    
    // Tag filter
    const matchesTag = selectedTags.length === 0 || (t.tags && t.tags.some(tag => selectedTags.includes(tag.label)));
    
    // Date range filter
    let matchesDate = true;
    if (dateFrom || dateTo) {
      const taskDate = new Date(t.deadline);
      taskDate.setHours(0, 0, 0, 0);
      
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        matchesDate = matchesDate && taskDate >= fromDate;
      }
      
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && taskDate <= toDate;
      }
    }
    
    return matchesStage && matchesCategory && matchesTag && matchesDate;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTasks = filtered.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const resetPagination = () => setCurrentPage(1);

  // Show skeleton during initial load
  if (initialLoading) {
    return <TasksSkeleton />;
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, padding: '20px 28px', overflow: 'hidden', position: 'relative' }}>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Stage filters */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['All', ...STAGES].map(s => (
              <button key={s} onClick={() => { setStageFilter(s); resetPagination(); }} style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                border: stageFilter === s ? 'none' : '1.5px solid var(--border)',
                background: stageFilter === s ? (s === 'All' ? 'var(--text-primary)' : STAGE_COLORS[s]) : 'var(--bg-surface)',
                color: stageFilter === s ? '#fff' : 'var(--text-secondary)', transition: 'all 0.15s',
              }}>
                {s}
                {s !== 'All' && <span style={{ marginLeft: 4, fontSize: 10, opacity: 0.8 }}>({tasks.filter(t => t.stage === s).length})</span>}
              </button>
            ))}
            {canViewScheduled && (
              <button onClick={() => { setStageFilter('Scheduled'); resetPagination(); }} style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                border: stageFilter === 'Scheduled' ? 'none' : '1.5px solid var(--border)',
                background: stageFilter === 'Scheduled' ? '#7C3AED' : 'var(--bg-surface)',
                color: stageFilter === 'Scheduled' ? '#fff' : 'var(--text-secondary)', transition: 'all 0.15s',
              }}>
                Scheduled <span style={{ marginLeft: 4, fontSize: 10, opacity: 0.8 }}>({scheduledTasks.length})</span>
              </button>
            )}
          </div>
          
          {/* Category filter */}
          <div style={{ height: 24, width: '1px', background: 'var(--border)' }} />
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              style={{
                padding: '6px 12px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                border: '1.5px solid var(--border)', background: 'var(--bg-surface)',
                color: 'var(--text-secondary)', cursor: 'pointer', outline: 'none',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
              Categories {selectedCategories.length > 0 && `(${selectedCategories.length})`}
              <ChevronDown size={14} />
            </button>
            {showCategoryDropdown && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, marginTop: 4,
                background: 'var(--bg-surface)', border: '1.5px solid var(--border)',
                borderRadius: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                minWidth: 200, zIndex: 100, maxHeight: 300, overflowY: 'auto',
              }}>
                <div style={{ padding: '8px' }}>
                  {categories.length === 0 ? (
                    <div style={{ padding: '8px', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>No categories</div>
                  ) : categories.map(cat => (
                    <label key={cat} style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                      cursor: 'pointer', borderRadius: 8, transition: 'background 0.15s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => toggleCategory(cat)}
                        style={{ cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{cat}</span>
                    </label>
                  ))}
                </div>
                {selectedCategories.length > 0 && (
                  <div style={{ borderTop: '1px solid var(--border-light)', padding: '8px' }}>
                    <button
                      onClick={() => setSelectedCategories([])}
                      style={{
                        width: '100%', padding: '6px', background: 'var(--bg-subtle)',
                        border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600,
                        color: 'var(--text-secondary)', cursor: 'pointer',
                      }}>
                      Clear All
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tag filter */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowTagDropdown(!showTagDropdown)}
              style={{
                padding: '6px 12px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                border: '1.5px solid var(--border)', background: 'var(--bg-surface)',
                color: 'var(--text-secondary)', cursor: 'pointer', outline: 'none',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
              Tags {selectedTags.length > 0 && `(${selectedTags.length})`}
              <ChevronDown size={14} />
            </button>
            {showTagDropdown && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, marginTop: 4,
                background: 'var(--bg-surface)', border: '1.5px solid var(--border)',
                borderRadius: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                minWidth: 200, zIndex: 100, maxHeight: 300, overflowY: 'auto',
              }}>
                <div style={{ padding: '8px' }}>
                  {allTags.length === 0 ? (
                    <div style={{ padding: '8px', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>No tags</div>
                  ) : allTags.map(tag => (
                    <label key={tag} style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                      cursor: 'pointer', borderRadius: 8, transition: 'background 0.15s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag)}
                        onChange={() => toggleTag(tag)}
                        style={{ cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{tag}</span>
                    </label>
                  ))}
                </div>
                {selectedTags.length > 0 && (
                  <div style={{ borderTop: '1px solid var(--border-light)', padding: '8px' }}>
                    <button
                      onClick={() => setSelectedTags([])}
                      style={{
                        width: '100%', padding: '6px', background: 'var(--bg-subtle)',
                        border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600,
                        color: 'var(--text-secondary)', cursor: 'pointer',
                      }}>
                      Clear All
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Date range filter */}
          <div style={{ height: 24, width: '1px', background: 'var(--border)' }} />
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowDatePicker(p => !p)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 10px', borderRadius: 10, cursor: 'pointer',
                border: `1.5px solid ${(dateFrom || dateTo) ? '#3B5BFC' : 'var(--border)'}`,
                background: (dateFrom || dateTo) ? '#EEF2FF' : 'var(--bg-surface)',
              }}
            >
              <Calendar size={14} color={(dateFrom || dateTo) ? '#3B5BFC' : 'var(--text-muted)'} />
              {(dateFrom || dateTo) && (
                <span style={{ fontSize: 11, fontWeight: 600, color: '#3B5BFC' }}>
                  {dateFrom && new Date(dateFrom).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {dateFrom && dateTo && ' – '}
                  {dateTo && new Date(dateTo).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              )}
            </button>
            {showDatePicker && (
              <div style={{
                position: 'absolute', top: '110%', left: 0, zIndex: 100,
                background: 'var(--bg-surface)', borderRadius: 12, padding: '14px 16px',
                border: '1.5px solid var(--border)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                display: 'flex', flexDirection: 'column', gap: 10, minWidth: 220,
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>From</span>
                  <input type="date" value={tempDateFrom} onChange={e => setTempDateFrom(e.target.value)}
                    style={{ padding: '6px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 12, color: 'var(--text-primary)', background: 'var(--bg-subtle)', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>To</span>
                  <input type="date" value={tempDateTo} onChange={e => setTempDateTo(e.target.value)}
                    style={{ padding: '6px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 12, color: 'var(--text-primary)', background: 'var(--bg-subtle)', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {(dateFrom || dateTo) && (
                    <button onClick={() => { setDateFrom(''); setDateTo(''); setTempDateFrom(''); setTempDateTo(''); setShowDatePicker(false); }}
                      style={{ flex: 1, padding: '7px', borderRadius: 8, border: 'none', background: '#FEF2F2', color: '#EF4444', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                      Clear
                    </button>
                  )}
                  <button
                    onClick={() => { setDateFrom(tempDateFrom); setDateTo(tempDateTo); setShowDatePicker(false); }}
                    disabled={!tempDateFrom && !tempDateTo}
                    style={{ flex: 1, padding: '7px', borderRadius: 8, border: 'none', background: (tempDateFrom || tempDateTo) ? '#3B5BFC' : 'var(--bg-subtle)', color: (tempDateFrom || tempDateTo) ? '#fff' : 'var(--text-muted)', fontSize: 11, fontWeight: 700, cursor: (tempDateFrom || tempDateTo) ? 'pointer' : 'default' }}>
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setShowRequests(true)} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px',
            background: taskRequests.filter(r => r.status === 'pending').length > 0 ? '#FFF7ED' : 'var(--bg-surface)',
            color: taskRequests.filter(r => r.status === 'pending').length > 0 ? '#F97316' : 'var(--text-secondary)',
            border: `1.5px solid ${taskRequests.filter(r => r.status === 'pending').length > 0 ? '#F97316' : 'var(--border)'}`,
            borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            position: 'relative',
          }}>
            <ClipboardCheck size={15} />
            {taskRequests.filter(r => r.status === 'pending').length > 0 && (
              <span style={{ 
                position: 'absolute', 
                top: -6, 
                right: -6, 
                background: '#F97316', 
                color: '#fff', 
                borderRadius: '50%', 
                width: 18, 
                height: 18, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: 10, 
                fontWeight: 800,
                border: '2px solid var(--bg-main)',
              }}>
                {taskRequests.filter(r => r.status === 'pending').length}
              </span>
            )}
            Approve Tasks
          </button>
          <button onClick={() => { setRequestToApprove(null); handleCreateTaskClick(); }} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px',
            background: 'linear-gradient(135deg, #3B5BFC, #2142D9)', color: '#fff',
            border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 4px 12px #3B5BFC40',
          }}>
            <Plus size={15} /> Create Task
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ flex: 1, background: 'var(--bg-surface)', borderRadius: 16, border: '1.5px solid var(--border)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'grid', gridTemplateColumns: hideBudget ? '110px 1fr 120px 150px 130px 110px' : '110px 1fr 120px 150px 130px 110px 100px', padding: '10px 20px', background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-light)', flexShrink: 0, position: 'relative' }}>
          {['Task ID', 'Title & Progress', 'Category', 'Tags', 'Stage', 'Date', ...(hideBudget ? [] : ['Budget'])].map(h => (
            h === 'Title & Progress' ? (
              <div key={h} style={{ display: 'flex', alignItems: 'center', paddingRight: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</span>
                {totalPages > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'absolute', left: 0, right: 0, justifyContent: 'center', pointerEvents: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, pointerEvents: 'all' }}>
                    <button onClick={() => handlePageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1}
                      style={{ padding: '3px 7px', borderRadius: 6, border: '1.5px solid var(--border)', background: 'var(--bg-surface)', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1, display: 'flex', alignItems: 'center' }}>
                      <ChevronLeft size={12} color="#6B7280" />
                    </button>
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>{currentPage} / {totalPages}</span>
                    <button onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}
                      style={{ padding: '3px 7px', borderRadius: 6, border: '1.5px solid var(--border)', background: 'var(--bg-surface)', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1, display: 'flex', alignItems: 'center' }}>
                      <ChevronRight size={12} color="#6B7280" />
                    </button>
                  </div>
                  </div>
                )}
              </div>
            ) : (
              <span key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</span>
            )
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {pageLoading ? (
            <TasksSkeleton />
          ) : filtered.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--text-muted)', gap: 8 }}>
              <div style={{ fontSize: 32 }}>📋</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>No tasks found</div>
              <div style={{ fontSize: 12 }}>Try adjusting filters or create a new task</div>
            </div>
          ) : paginatedTasks.map((task, i) => {
            const overdue = new Date(task.deadline) < new Date() && task.stage !== 'Complete';
            const reviewMembers = task.members.filter(m => m.stage === 'Review').length;
            return (
              <div key={task.id}
                onClick={() => setViewTask(task)}
                style={{ display: 'grid', gridTemplateColumns: hideBudget ? '110px 1fr 120px 150px 130px 110px' : '110px 1fr 120px 150px 130px 110px 100px', padding: '14px 20px', borderBottom: i < filtered.length - 1 ? '1px solid var(--border-light)' : 'none', alignItems: 'start', cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span 
                  onClick={hideTimeline ? undefined : (e) => { e.stopPropagation(); setTimelineTask(task); }}
                  style={{ fontFamily: 'monospace', fontSize: 12, color: '#3B5BFC', fontWeight: 700, cursor: hideTimeline ? 'default' : 'pointer' }}
                >
                  {task.id}
                </span>
                <div style={{ paddingRight: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{task.title}</div>
                  <StageFlow current={task.stage} members={task.members} paid={task.paid} history={task.history || []} />
                </div>
                <div>
                  {task.category ? (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: task.category.bg, color: task.category.color, border: `1px solid ${task.category.color}30`, display: 'inline-block' }}>{task.category.emoji} {task.category.label}</span>
                  ) : (
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>—</span>
                  )}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, paddingTop: 2 }}>
                  {task.tags && task.tags.length > 0
                    ? task.tags.map(t => (
                        <span key={t.label} style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: t.bg, color: t.color }}>{t.emoji} {t.label}</span>
                      ))
                    : <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>—</span>
                  }
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: STAGE_BG[task.stage], color: STAGE_COLORS[task.stage] }}>{task.stage}</span>
                  {task.paused && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', gap: 3 }}><Hourglass size={9} /> On Hold</span>}
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: overdue ? '#EF4444' : task.extendedDeadline ? '#F97316' : 'var(--text-secondary)' }}>
                  {task.isScheduled ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span>{new Date(task.scheduledDate || task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#7C3AED' }}>Scheduled</span>
                    </div>
                  ) : (() => {
                    const displayDate = task.extendedDeadline || task.deadline;
                    const dateStr = new Date(displayDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    return <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {overdue ? `⚠ ${dateStr}` : dateStr}
                      {task.extendedDeadline && <span style={{ fontSize: 10, fontWeight: 700, color: '#F97316', background: '#FFF7ED', padding: '1px 6px', borderRadius: 5, alignSelf: 'flex-start' }}>Extended</span>}
                      {task.scheduledDate && <span style={{ fontSize: 10, fontWeight: 600, color: '#3B5BFC' }}>Scheduled: {new Date(task.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                    </div>;
                  })()}
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: task.stage === 'Complete' ? '#12C479' : 'var(--text-primary)' }}>{hideBudget ? null : `₹ ${task.totalBudget.toLocaleString()}`}</span>
              </div>
            );
          })}
        </div>
      </div>

      {showRequests && <TaskRequestsModal onClose={() => setShowRequests(false)} onApprove={handleApproveRequest} onComplete={handleCompleteRequest} requests={taskRequests} />}
      {showCreate && <CreateTaskModal onClose={() => { setShowCreate(false); setRequestToApprove(null); }} onCreate={createTask} onSchedule={addScheduledTask} teamMembers={team} requestData={requestToApprove} hideBudget={hideBudget} currentUser={currentUser} managementMode={managementMode} />}
      {editTask && <EditTaskModal task={editTask} onClose={() => setEditTask(null)} onUpdate={updateTask} teamMembers={team} hideBudget={hideBudget} managementMode={managementMode} />}
      {viewTask && <AdminTaskModal task={viewTask} onClose={() => setViewTask(null)} onEdit={(task) => { setEditTask(task); setViewTask(null); }} onTimelineClick={(task) => { setTimelineTask(task); setViewTask(null); }} hideBudget={hideBudget} onCreateScheduled={(task) => { createTask(task); removeScheduledTask(task.id); }} onCancelScheduled={(id) => removeScheduledTask(id)} managementMode={managementMode} />}
      {timelineTask && <TaskTimelinePanel task={timelineTask} onClose={() => setTimelineTask(null)} />}
      {showPasswordModal && (
        <AdminPasswordModal
          onClose={handlePasswordCancel}
          onConfirm={handlePasswordConfirm}
          action={pendingAction?.actionName || 'perform this action'}
        label={managementMode ? 'Management Password' : 'Admin Password'} />
      )}
    </div>
  );
}


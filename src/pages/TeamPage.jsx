import { useState } from 'react';
import { notify } from '../lib/notify';
import { Plus, Search, Mail, Star, CheckCircle, Clock, Edit2, X, User, Users, Phone, MapPin, Lock, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Avatar from '../components/Avatar';
import { AdminPasswordModal } from '../components/AdminPasswordModal';
import { useAdminPassword } from '../hooks/useAdminPassword';

const AVATAR_COLORS = ['#3B5BFC','#7C3AED','#12C479','#F97316','#EF4444','#06B6D4','#EC4899','#8B5CF6'];

function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}
function getColor(index) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

// ── Add / Edit Member Modal ─────────────────────────────────────────────────
function MemberModal({ member, onClose, onSave, roles, managementMode = false }) {
  const { showPasswordModal, pendingAction, requestAdminPassword, handlePasswordConfirm, handlePasswordCancel } = useAdminPassword();
  const isEdit = !!member;
  const [form, setForm] = useState({
    name: member?.name || '',
    email: member?.email || '',
    phone: member?.phone || '',
    location: member?.location || '',
    role: member?.role || roles[0] || '',
    password: '',
    desc: member?.desc || '',
    status: member?.status || 'Active',
  });
  const f = k => v => setForm(p => ({ ...p, [k]: v }));

  const handleSaveClick = () => {
    if (!form.name.trim() || !form.email.trim() || !form.role) return;
    requestAdminPassword(isEdit ? 'update this member' : 'add this member', () => {
      const initials = getInitials(form.name);
      const color = member?.color || getColor(Math.floor(Math.random() * AVATAR_COLORS.length));
      onSave({
        ...member,
        ...form,
        avatar: initials,
        color,
        tasks: member?.tasks || 0,
        completed: member?.completed || 0,
        rating: member?.rating || 0,
        joined: member?.joined || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        id: member?.id || Date.now(),
      }, !member ? { name: 'Admin', avatar: 'A', color: '#3B5BFC' } : null);
      onClose();
    });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.08)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--bg-surface)', borderRadius: 20, width: 600, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.25)' }}>
        {/* Header */}
        <div style={{ padding: '24px 28px 18px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--bg-surface)', borderRadius: '24px 24px 0 0', zIndex: 10 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>{isEdit ? 'Edit Member' : 'Add Team Member'}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{isEdit ? 'Update member details and permissions' : 'Create a new account and assign a role'}</div>
          </div>
          <button onClick={onClose} style={{ background: 'var(--input-bg)', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={16} color="#6B7280" />
          </button>
        </div>

        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Personal details */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Personal Details</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Full Name *', key: 'name', icon: User, placeholder: 'John Doe' },
                { label: 'Email Address *', key: 'email', icon: Mail, placeholder: 'john@taskzy.io' },
                { label: 'Phone Number *', key: 'phone', icon: Phone, placeholder: '+1 555 0000' },
                { label: 'Location *', key: 'location', icon: MapPin, placeholder: 'City, State' },
              ].map(field => (
                <div key={field.key}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{field.label}</label>
                  <div style={{ position: 'relative' }}>
                    <field.icon size={14} color="#9CA3AF" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }} />
                    <input value={form[field.key]} onChange={e => f(field.key)(e.target.value)} placeholder={field.placeholder}
                      style={{ width: '100%', padding: '10px 14px 10px 32px', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 13, color: 'var(--text-primary)', outline: 'none', background: 'var(--input-bg)', boxSizing: 'border-box' }}
                      onFocus={e => e.target.style.borderColor = '#3B5BFC'} onBlur={e => e.target.style.borderColor = '#E8EAEF'} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Login credentials */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Login Credentials</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Username (Email)</label>
                <div style={{ padding: '10px 14px', background: 'var(--input-bg)', borderRadius: 10, border: '1.5px solid var(--border)', fontSize: 13, color: 'var(--text-muted)' }}>
                  {form.email || 'Set email above'}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{isEdit ? 'Reset Password' : 'Initial Password *'}</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={14} color="#9CA3AF" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="password" value={form.password} onChange={e => f('password')(e.target.value)} placeholder={isEdit ? 'Leave blank to keep' : 'Set password...'}
                    style={{ width: '100%', padding: '10px 14px 10px 32px', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 13, color: 'var(--text-primary)', outline: 'none', background: 'var(--input-bg)', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#3B5BFC'} onBlur={e => e.target.style.borderColor = '#E8EAEF'} />
                </div>
              </div>
            </div>
          </div>

          {/* Role */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Role Assignment *</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {roles.map(r => (
                <button key={r} onClick={() => f('role')(r)} style={{
                  padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  border: `1.5px solid ${form.role === r ? '#3B5BFC' : '#E8EAEF'}`,
                  background: form.role === r ? '#EEF2FF' : '#fff',
                  color: form.role === r ? '#3B5BFC' : '#6B7280',
                  transition: 'all 0.15s',
                }}>{r}</button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div style={{ padding: '16px 28px 24px', borderTop: '1px solid var(--border-light)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '11px 22px', background: 'var(--input-bg)', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSaveClick} disabled={!form.name.trim() || !form.email.trim()} style={{
            padding: '11px 28px', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer',
            background: form.name.trim() && form.email.trim() ? 'linear-gradient(135deg, #3B5BFC, #2142D9)' : '#E8EAEF',
            color: form.name.trim() && form.email.trim() ? '#fff' : '#9CA3AF',
            boxShadow: form.name.trim() && form.email.trim() ? '0 6px 20px #3B5BFC40' : 'none',
          }}>{isEdit ? 'Update' : 'Add Member'}</button>
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

// ── Member Profile Modal ────────────────────────────────────────────────────
function MemberProfileModal({ member, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.08)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--bg-surface)', borderRadius: 20, width: 600, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.25)' }}>
        {/* Header */}
        <div style={{ padding: '24px 28px 18px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Avatar member={member} size={64} style={{ borderRadius: 16, boxShadow: `0 8px 24px ${member.color}40` }} />
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>{member.name}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3 }}>{member.role}</div>
              <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: member.status === 'Active' ? '#ECFDF5' : '#FEF2F2', color: member.status === 'Active' ? '#12C479' : '#EF4444' }}>
                  {member.status === 'Active' ? '● Active' : '○ Inactive'}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Member since {member.joined}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'var(--input-bg)', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={16} color="#6B7280" />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px 28px' }}>
          {/* Contact Info */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Contact Information</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--bg-subtle)', borderRadius: 10 }}>
                <Mail size={16} color="#6B7280" />
                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{member.email}</span>
              </div>
              {member.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--bg-subtle)', borderRadius: 10 }}>
                  <Phone size={16} color="#6B7280" />
                  <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{member.phone}</span>
                </div>
              )}
              {member.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--bg-subtle)', borderRadius: 10 }}>
                  <MapPin size={16} color="#6B7280" />
                  <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{member.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {member.desc && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>About</div>
              <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: '1.6', background: 'var(--bg-subtle)', padding: '14px 16px', borderRadius: 10, border: '1px solid var(--border)' }}>
                {member.desc}
              </div>
            </div>
          )}

          {/* Stats */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Performance</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Total Tasks', value: member.tasks, color: member.color, icon: Clock },
                { label: 'Completed', value: member.completed, color: '#12C479', icon: CheckCircle },
              ].map(s => {
                const Icon = s.icon;
                return (
                  <div key={s.label} style={{ background: 'var(--bg-subtle)', borderRadius: 12, padding: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: s.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={16} color={s.color} />
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</span>
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Completion Rate</div>
            <div style={{ background: 'var(--bg-subtle)', borderRadius: 12, padding: '16px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Overall Progress</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: member.color }}>{member.tasks ? Math.round((member.completed / member.tasks) * 100) : 0}%</span>
              </div>
              <div style={{ height: 8, background: '#E8EAEF', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ width: `${member.tasks ? Math.round((member.completed / member.tasks) * 100) : 0}%`, height: '100%', background: member.color, borderRadius: 8, transition: 'width 0.6s ease' }} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Member Card ─────────────────────────────────────────────────────────────
function MemberCard({ member, onEdit, onToggleStatus, onViewProfile, managementMode = false, atLimit = false }) {
  const { showPasswordModal, pendingAction, requestAdminPassword, handlePasswordConfirm, handlePasswordCancel } = useAdminPassword();
  const [hover, setHover] = useState(false);
  
  const handleToggleStatus = (e) => {
    e.stopPropagation();
    // Block activating if at plan limit
    if (member.status === 'Inactive' && atLimit) {
      notify.error('Plan limit reached. Deactivate another member first or upgrade your plan.');
      return;
    }
    const actionText = member.status === 'Active' ? 'deactivate this member' : 'activate this member';
    requestAdminPassword(actionText, () => {
      onToggleStatus(member.id);
    });
  };
  
  return (
    <>
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => onViewProfile(member)}
        style={{
          background: 'var(--bg-surface)', borderRadius: 18, padding: '20px',
          border: `1.5px solid ${hover ? member.color + '40' : '#E8EAEF'}`,
          boxShadow: hover ? `0 8px 24px ${member.color}18` : '0 2px 8px rgba(0,0,0,0.04)',
          transition: 'all 0.2s', transform: hover ? 'translateY(-2px)' : 'none',
          cursor: 'pointer',
        }}
      >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Avatar member={member} size={46} style={{ borderRadius: 14, boxShadow: `0 4px 12px ${member.color}40` }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{member.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{member.role}</div>
          </div>
        </div>
        <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: member.status === 'Active' ? '#ECFDF5' : '#FEF2F2', color: member.status === 'Active' ? '#12C479' : '#EF4444' }}>
          {member.status === 'Active' ? '● Active' : '○ Inactive'}
        </span>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {[
          { label: 'Tasks', value: member.tasks, icon: <Clock size={12} color={member.color} /> },
          { label: 'Done', value: member.completed, icon: <CheckCircle size={12} color="#12C479" /> },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, background: 'var(--input-bg)', borderRadius: 10, padding: '8px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{s.icon}<span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{s.value}</span></div>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Completion</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: member.color }}>{member.tasks ? Math.round((member.completed / member.tasks) * 100) : 0}%</span>
        </div>
        <div style={{ height: 4, background: '#E8EAEF', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ width: `${member.tasks ? Math.round((member.completed / member.tasks) * 100) : 0}%`, height: '100%', background: member.color, borderRadius: 4, transition: 'width 0.6s ease' }} />
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', background: member.addedBy?.color || '#3B5BFC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
            {member.addedBy?.avatar || 'A'}
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{member.addedBy?.name || 'Admin'}</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={handleToggleStatus} style={{ padding: '5px 10px', background: member.status === 'Active' ? '#FEF2F2' : (atLimit ? '#F3F4F6' : '#ECFDF5'), border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: (member.status === 'Inactive' && atLimit) ? 'not-allowed' : 'pointer', color: member.status === 'Active' ? '#EF4444' : (atLimit ? '#9CA3AF' : '#12C479') }} title={member.status === 'Inactive' && atLimit ? 'Plan limit reached — upgrade to activate' : ''}>
            {member.status === 'Active' ? 'Deactivate' : 'Activate'}
          </button>
          <button onClick={(e) => { e.stopPropagation(); onEdit(member); }} style={{ padding: '5px 10px', background: '#EEF2FF', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', color: '#3B5BFC' }}>
            Edit
          </button>
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
  </>
  );
}

function TeamPage({ managementMode = false }) {
  const { team, saveMember, toggleMemberStatus, financials, roles, currentPlan } = useApp();

  // Member limit based on selected plan (default Professional = 15 if no plan selected)
  const PLAN_LIMITS = { starter: 7, professional: 15, business: 28, lifetime: Infinity, custom: Infinity };
  const memberLimit = currentPlan
    ? (currentPlan.users === 'Unlimited' || currentPlan.users === 'Custom' ? Infinity : (PLAN_LIMITS[currentPlan.id] ?? currentPlan.users))
    : 15;
  const activeCount = team.filter(m => m.status === 'Active').length;
  const atLimit = activeCount >= memberLimit;
  const roleNames = roles.map(r => r.name);
  const [filter, setFilter] = useState('Active');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [showModal, setShowModal] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLoading, setPageLoading] = useState(false); // Loading state for pagination
  const membersPerPage = 15;

  const filtered = team.filter(m => {
    const matchFilter = filter === 'All' || (filter === 'Active' ? m.status === 'Active' : m.status === 'Inactive');
    const matchRole = roleFilter === 'All Roles' || m.role === roleFilter;
    return matchFilter && matchRole;
  });

  const totalPages = Math.ceil(filtered.length / membersPerPage);
  const startIndex = (currentPage - 1) * membersPerPage;
  const endIndex = startIndex + membersPerPage;
  const paginatedMembers = filtered.slice(startIndex, endIndex);

  // Handle page change with loading animation
  const handlePageChange = (newPage) => {
    if (newPage === currentPage || newPage < 1 || newPage > totalPages) return;
    setPageLoading(true);
    setTimeout(() => {
      setCurrentPage(newPage);
      setTimeout(() => {
        setPageLoading(false);
      }, 400);
    }, 50);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, padding: '20px 28px' }}>
      {/* Team Members Component Card */}
      <div style={{ flex: 1, background: 'var(--bg-surface)', borderRadius: 18, border: '1.5px solid var(--border)', overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        
        {/* Header with Controls */}
        <div style={{ padding: '14px 18px', borderBottom: '1.5px solid var(--border-light)', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <User size={13} color="#3B5BFC" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>Team Members</div>
            </div>
          </div>

          {/* Pagination — truly centered */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
            {filtered.length > membersPerPage && (<>
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1 || pageLoading}
                style={{ padding: '6px 10px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--bg-surface)', cursor: (currentPage === 1 || pageLoading) ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1, display: 'flex', alignItems: 'center' }}>
                <ChevronLeft size={14} color="#6B7280" />
              </button>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>{currentPage} / {totalPages}</span>
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || pageLoading}
                style={{ padding: '6px 10px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--bg-surface)', cursor: (currentPage === totalPages || pageLoading) ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1, display: 'flex', alignItems: 'center' }}>
                <ChevronRight size={14} color="#6B7280" />
              </button>
            </>)}
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'flex-end' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { label: 'All' },
                { label: 'Active',   count: team.filter(m => m.status === 'Active').length },
                { label: 'Inactive' },
              ].map(({ label, count }) => (
                <button key={label} onClick={() => setFilter(label)} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  border: filter === label ? 'none' : '1.5px solid #E8EAEF',
                  background: filter === label ? '#3B5BFC' : 'var(--bg-surface)',
                  color: filter === label ? '#fff' : '#6B7280', transition: 'all 0.15s',
                }}>
                  {label}
                  {count !== undefined && (
                    <span style={{
                      fontSize: 10, fontWeight: 800,
                      background: filter === label ? 'rgba(255,255,255,0.25)' : '#F0F2F8',
                      color: filter === label ? '#fff' : '#6B7280',
                      padding: '1px 6px', borderRadius: 10, minWidth: 18, textAlign: 'center',
                    }}>{count}</span>
                  )}
                </button>
              ))}
            </div>
            <div style={{ height: 24, width: '1px', background: 'var(--border)' }} />
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
              style={{
                padding: '6px 12px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                border: '1.5px solid var(--border)', background: 'var(--bg-surface)',
                color: 'var(--text-secondary)', cursor: 'pointer', outline: 'none',
              }}>
              <option value="All Roles">All Roles</option>
              {roleNames.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <button onClick={() => {
              if (atLimit) {
                notify.error(`Plan limit reached (${activeCount}/${memberLimit} active members). Upgrade your plan to add more.`);
                return;
              }
              setEditMember(null); setShowModal(true);
            }} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
              background: atLimit ? '#E8EAEF' : 'linear-gradient(135deg, #3B5BFC, #2142D9)',
              color: atLimit ? '#9CA3AF' : '#fff',
              border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600,
              cursor: atLimit ? 'not-allowed' : 'pointer',
              boxShadow: atLimit ? 'none' : '0 4px 12px #3B5BFC40',
              transition: 'all 0.15s',
            }}
              title={atLimit ? `Plan limit: ${memberLimit} members. Upgrade to add more.` : 'Add team member'}
            >
              <Plus size={15} /> Add Member
              {atLimit && <span style={{ fontSize: 10, fontWeight: 700, background: '#F97316', color: '#fff', padding: '1px 6px', borderRadius: 10, marginLeft: 2 }}>Limit</span>}
            </button>
          </div>
        </div>

        {/* Scrollable Grid inside component */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {pageLoading ? (
              // Skeleton loading for pagination
              <>
                {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14].map(i => (
                  <div key={i} style={{ background: 'var(--bg-surface)', borderRadius: 16, border: '1.5px solid var(--border)', padding: '22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div className="skeleton" style={{ width: 56, height: 56, borderRadius: 16 }} />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div className="skeleton" style={{ width: '70%', height: 16, borderRadius: 6 }} />
                        <div className="skeleton" style={{ width: '55%', height: 12, borderRadius: 6 }} />
                        <div className="skeleton" style={{ width: '45%', height: 11, borderRadius: 6 }} />
                      </div>
                      <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 8 }} />
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <div style={{ flex: 1, background: 'var(--bg-subtle)', borderRadius: 12, padding: '12px', display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
                        <div className="skeleton" style={{ width: 32, height: 20, borderRadius: 6 }} />
                        <div className="skeleton" style={{ width: 50, height: 10, borderRadius: 6 }} />
                      </div>
                      <div style={{ flex: 1, background: 'var(--bg-subtle)', borderRadius: 12, padding: '12px', display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
                        <div className="skeleton" style={{ width: 28, height: 20, borderRadius: 6 }} />
                        <div className="skeleton" style={{ width: 60, height: 10, borderRadius: 6 }} />
                      </div>
                    </div>
                    <div className="skeleton" style={{ width: '100%', height: 1, borderRadius: 0 }} />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <div className="skeleton" style={{ flex: 1, height: 34, borderRadius: 8 }} />
                      <div className="skeleton" style={{ flex: 1, height: 34, borderRadius: 8 }} />
                    </div>
                  </div>
                ))}
              </>
            ) : paginatedMembers.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', gap: 16 }}>
                <div style={{ width: 72, height: 72, borderRadius: 20, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={32} color="#3B5BFC" strokeWidth={1.8} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>No team members yet</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 280, lineHeight: 1.6 }}>Add your first team member to start assigning tasks and tracking progress</div>
                </div>
                <button onClick={() => { if (!atLimit) { setEditMember(null); setShowModal(true); } }} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 22px', background: atLimit ? '#E8EAEF' : 'linear-gradient(135deg, #3B5BFC, #2142D9)', border: 'none', borderRadius: 11, color: atLimit ? '#9CA3AF' : '#fff', fontSize: 13, fontWeight: 700, cursor: atLimit ? 'not-allowed' : 'pointer', boxShadow: atLimit ? 'none' : '0 4px 14px rgba(59,91,252,0.3)' }}>
                  <Plus size={15} /> Add First Member
                </button>
              </div>
            ) : (
              paginatedMembers.map(m => (
                <MemberCard key={m.id} member={m}
                  onEdit={m => { setEditMember(m); setShowModal(true); }}
                  onToggleStatus={toggleMemberStatus}
                  onViewProfile={m => { setSelectedMember(m); setShowProfileModal(true); }}
                  managementMode={managementMode}
                  atLimit={atLimit}
                />
              ))
            )}
          </div>
        </div>

      </div>

      {showModal && (
        <MemberModal
          member={editMember}
          onClose={() => { setShowModal(false); setEditMember(null); }}
          onSave={saveMember}
          roles={roleNames}
          managementMode={managementMode}
        />
      )}

      {showProfileModal && selectedMember && (
        <MemberProfileModal
          member={selectedMember}
          onClose={() => { setShowProfileModal(false); setSelectedMember(null); }}
        />
      )}
    </div>
  );
}

export default TeamPage;


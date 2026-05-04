import { useState, useEffect } from 'react';
import { Plus, Search, Mail, Star, CheckCircle, Clock, Edit2, X, Building2, Phone, MapPin, Lock, FileText, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Avatar from '../components/Avatar';
import { AdminPasswordModal } from '../components/AdminPasswordModal';
import { useAdminPassword } from '../hooks/useAdminPassword';
import { TeamSkeleton } from '../components/Skeleton';

const AVATAR_COLORS = ['#3B5BFC','#7C3AED','#12C479','#F97316','#EF4444','#06B6D4','#EC4899','#8B5CF6'];

function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}
function getColor(index) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

// ── Edit Organization Modal ─────────────────────────────────────────────────────
function EditOrganizationModal({ org, onClose, onSave, managementMode = false }) {
  const { showPasswordModal, pendingAction, requestAdminPassword, handlePasswordConfirm, handlePasswordCancel } = useAdminPassword();
  const [form, setForm] = useState({
    email: org?.contactEmail || '',
    password: '',
  });
  const [users, setUsers] = useState(org?.users || []);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Team',
  });
  
  const f = k => v => setForm(p => ({ ...p, [k]: v }));
  const fUser = k => v => setNewUser(p => ({ ...p, [k]: v }));

  const roles = ['Admin', 'Team', 'Management'];

  const handleAddUser = () => {
    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password.trim()) return;
    setUsers([...users, { ...newUser, id: Date.now() }]);
    setNewUser({ name: '', email: '', password: '', role: 'Team' });
  };

  const handleRemoveUser = (id) => {
    setUsers(users.filter(u => u.id !== id));
  };

  const handleSaveClick = () => {
    if (!form.email.trim()) return;
    requestAdminPassword('update organization details', () => {
      onSave({
        ...org,
        contactEmail: form.email,
        users: users,
      });
      onClose();
    });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--bg-surface)', borderRadius: 20, width: 700, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.25)' }}>
        {/* Header */}
        <div style={{ padding: '24px 28px 18px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--bg-surface)', borderRadius: '24px 24px 0 0', zIndex: 10 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>Organization Settings</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>Manage credentials and team members</div>
          </div>
          <button onClick={onClose} style={{ background: 'var(--input-bg)', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={16} color="#6B7280" />
          </button>
        </div>

        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Organization Name (Read-only) */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Organization</div>
            <div style={{ padding: '10px 14px', background: 'var(--input-bg)', borderRadius: 10, border: '1.5px solid var(--border)', fontSize: 13, color: 'var(--text-muted)' }}>
              {org.name}
            </div>
          </div>

          {/* Contact Email */}
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Email Address *</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={14} color="#9CA3AF" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }} />
                  <input value={form.email} onChange={e => f('email')(e.target.value)} placeholder="contact@company.com"
                    style={{ width: '100%', padding: '10px 14px 10px 32px', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 13, color: 'var(--text-primary)', outline: 'none', background: 'var(--input-bg)', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#3B5BFC'} onBlur={e => e.target.style.borderColor = '#E8EAEF'} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={14} color="#9CA3AF" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="password" value={form.password} onChange={e => f('password')(e.target.value)} placeholder="Leave blank to keep"
                    style={{ width: '100%', padding: '10px 14px 10px 32px', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 13, color: 'var(--text-primary)', outline: 'none', background: 'var(--input-bg)', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#3B5BFC'} onBlur={e => e.target.style.borderColor = '#E8EAEF'} />
                </div>
              </div>
            </div>
          </div>

          {/* Add Users Section */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Add Users to Organization</div>
            
            {/* Add User Form */}
            <div style={{ background: 'var(--bg-subtle)', padding: '16px', borderRadius: 12, marginBottom: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Name *</label>
                  <input value={newUser.name} onChange={e => fUser('name')(e.target.value)} placeholder="John Doe"
                    style={{ width: '100%', padding: '8px 10px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text-primary)', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#3B5BFC'} onBlur={e => e.target.style.borderColor = '#E8EAEF'} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Email *</label>
                  <input value={newUser.email} onChange={e => fUser('email')(e.target.value)} placeholder="john@company.com"
                    style={{ width: '100%', padding: '8px 10px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text-primary)', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#3B5BFC'} onBlur={e => e.target.style.borderColor = '#E8EAEF'} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Password *</label>
                  <input type="password" value={newUser.password} onChange={e => fUser('password')(e.target.value)} placeholder="••••••••"
                    style={{ width: '100%', padding: '8px 10px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text-primary)', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#3B5BFC'} onBlur={e => e.target.style.borderColor = '#E8EAEF'} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Role *</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {roles.map(r => (
                      <button key={r} onClick={() => fUser('role')(r)} style={{
                        flex: 1, padding: '6px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                        border: `1.5px solid ${newUser.role === r ? '#3B5BFC' : '#E8EAEF'}`,
                        background: newUser.role === r ? '#EEF2FF' : '#fff',
                        color: newUser.role === r ? '#3B5BFC' : '#6B7280',
                        transition: 'all 0.15s',
                      }}>{r}</button>
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={handleAddUser} disabled={!newUser.name.trim() || !newUser.email.trim() || !newUser.password.trim()} style={{
                width: '100%', padding: '8px 14px', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: (newUser.name.trim() && newUser.email.trim() && newUser.password.trim()) ? '#3B5BFC' : '#E8EAEF',
                color: (newUser.name.trim() && newUser.email.trim() && newUser.password.trim()) ? '#fff' : '#9CA3AF',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <Plus size={14} /> Add User
              </button>
            </div>

            {/* Users List */}
            {users.length > 0 && (
              <div style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {users.map(user => (
                  <div key={user.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg-subtle)', borderRadius: 10, border: '1px solid var(--border)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{user.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{user.email}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 12, background: '#EEF2FF', color: '#3B5BFC' }}>
                        {user.role}
                      </span>
                      <button onClick={() => handleRemoveUser(user.id)} style={{ background: '#FEF2F2', border: 'none', borderRadius: 6, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <X size={12} color="#EF4444" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div style={{ padding: '16px 28px 24px', borderTop: '1px solid var(--border-light)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '11px 22px', background: 'var(--input-bg)', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSaveClick} disabled={!form.email.trim()} style={{
            padding: '11px 28px', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer',
            background: form.email.trim() ? 'linear-gradient(135deg, #3B5BFC, #2142D9)' : '#E8EAEF',
            color: form.email.trim() ? '#fff' : '#9CA3AF',
            boxShadow: form.email.trim() ? '0 6px 20px #3B5BFC40' : 'none',
          }}>Update</button>
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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-surface)', borderRadius: 20, width: 600, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.25)' }}>
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

// ── Organization Card ─────────────────────────────────────────────────────────────
function OrganizationCard({ org, onEdit, onToggleStatus, onViewProfile, managementMode = false }) {
  const { showPasswordModal, pendingAction, requestAdminPassword, handlePasswordConfirm, handlePasswordCancel } = useAdminPassword();
  const [hover, setHover] = useState(false);
  const [clicked, setClicked] = useState(false);
  
  const initials = getInitials(org.name);
  const color = org.color || AVATAR_COLORS[org.id.charCodeAt(0) % AVATAR_COLORS.length];
  
  const handleToggleStatus = (e) => {
    e.stopPropagation();
    const actionText = org.subscriptionStatus === 'active' ? 'suspend this organization' : 'activate this organization';
    requestAdminPassword(actionText, () => {
      onToggleStatus(org.id);
    });
  };
  
  const handleCardClick = () => {
    if (org.subscriptionStatus === 'active') {
      setClicked(!clicked);
    } else {
      onViewProfile(org);
    }
  };
  
  const statusColors = {
    active: { bg: '#ECFDF5', text: '#12C479', label: 'Active' },
    trial: { bg: '#FEF3C7', text: '#F59E0B', label: 'Trial' },
    inactive: { bg: '#FEF2F2', text: '#EF4444', label: 'Inactive' },
    suspended: { bg: '#F3F4F6', text: '#6B7280', label: 'Suspended' },
  };
  
  const planColors = {
    Starter: { bg: '#FEF3C7', text: '#D97706' },
    Professional: { bg: '#DBEAFE', text: '#1D4ED8' },
    Business: { bg: '#F3E8FF', text: '#9333EA' },
    Enterprise: { bg: '#FFF7ED', text: '#F97316' },
  };
  
  const status = statusColors[org.subscriptionStatus] || statusColors.inactive;
  const planStyle = planColors[org.subscriptionPlan] || planColors.Starter;
  
  return (
    <>
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={handleCardClick}
        style={{
          background: 'var(--bg-surface)', borderRadius: 18, padding: '20px',
          border: `1.5px solid ${hover ? color + '40' : '#E8EAEF'}`,
          boxShadow: hover ? `0 8px 24px ${color}18` : '0 2px 8px rgba(0,0,0,0.04)',
          transition: 'all 0.2s', transform: hover ? 'translateY(-2px)' : 'none',
          cursor: 'pointer',
        }}
      >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ 
            width: 46, 
            height: 46, 
            borderRadius: 14, 
            background: color, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: `0 4px 12px ${color}40`,
            fontSize: 16,
            fontWeight: 800,
            color: '#fff'
          }}>
            {initials}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{org.name}</div>
            <div style={{ 
              fontSize: 11, 
              fontWeight: 700,
              marginTop: 4,
              padding: '3px 10px',
              borderRadius: 12,
              background: planStyle.bg,
              color: planStyle.text,
              display: 'inline-block'
            }}>
              {org.subscriptionPlan}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: status.bg, color: status.text }}>
            {org.subscriptionStatus === 'active' ? '● ' : '○ '}{status.label}
          </span>
          <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600 }}>
            Till {new Date(org.renewalDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Contact Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Mail size={11} />
          {org.contactEmail}
        </div>
        {org.contactPhone && (
          <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Phone size={11} />
            {org.contactPhone}
          </div>
        )}
      </div>

      {/* Stats */}
      {org.usageStats && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {[
            { label: 'Users', value: org.usageStats.activeUsers },
            { label: 'Tasks', value: org.usageStats.tasksCreated },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: 'var(--input-bg)', borderRadius: 10, padding: '8px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{s.value}</span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--border-light)' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          Joined {new Date(org.joinDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {org.subscriptionStatus === 'active' && clicked && (
            <button onClick={handleToggleStatus} style={{ padding: '5px 10px', background: '#FEF2F2', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', color: '#EF4444' }}>
              Suspend
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); onEdit(org); }} style={{ padding: '5px 10px', background: '#EEF2FF', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', color: '#3B5BFC' }}>
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
  const { organizations } = useApp();
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [planFilter, setPlanFilter] = useState('All Plans');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [showModal, setShowModal] = useState(false);
  const [editOrg, setEditOrg] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLoading, setPageLoading] = useState(false);
  const [showPlanDropdown, setShowPlanDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const orgsPerPage = 15;

  // Check if page has been visited before
  const [initialLoading, setInitialLoading] = useState(() => {
    const visited = sessionStorage.getItem('visited_team');
    return !visited;
  });

  // Initial loading effect
  useEffect(() => {
    if (initialLoading) {
      const timer = setTimeout(() => {
        setInitialLoading(false);
        sessionStorage.setItem('visited_team', 'true');
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

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const filtered = organizations.filter(org => {
    const matchPlan = planFilter === 'All Plans' || org.subscriptionPlan === planFilter;
    const matchStatus = statusFilter === 'All Status' || org.subscriptionStatus === statusFilter;
    return matchPlan && matchStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    let aVal, bVal;
    
    if (sortBy === 'name') {
      aVal = a.name.toLowerCase();
      bVal = b.name.toLowerCase();
    } else if (sortBy === 'plan') {
      aVal = a.subscriptionPlan;
      bVal = b.subscriptionPlan;
    } else if (sortBy === 'status') {
      aVal = a.subscriptionStatus;
      bVal = b.subscriptionStatus;
    } else if (sortBy === 'joinDate') {
      aVal = new Date(a.joinDate).getTime();
      bVal = new Date(b.joinDate).getTime();
    }
    
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / orgsPerPage);
  const startIndex = (currentPage - 1) * orgsPerPage;
  const endIndex = startIndex + orgsPerPage;
  const paginatedOrgs = sorted.slice(startIndex, endIndex);

  const toggleOrgStatus = (id) => {
    // Placeholder for toggle functionality
    console.log('Toggle organization status:', id);
  };

  const saveOrg = (updatedOrg) => {
    // Placeholder for save functionality
    console.log('Save organization:', updatedOrg);
  };

  // Show skeleton during initial load
  if (initialLoading) {
    return <TeamSkeleton />;
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, padding: '20px 28px' }}>
      {/* Organization Management Component Card */}
      <div style={{ flex: 1, background: 'var(--bg-surface)', borderRadius: 18, border: '1.5px solid var(--border)', overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        
        {/* Header with Controls */}
        <div style={{ padding: '14px 18px', borderBottom: '1.5px solid var(--border-light)', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Sort By */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>Sort by:</span>
              {['Name', 'Plan', 'Status', 'Join Date'].map(field => {
                const fieldKey = field.toLowerCase().replace(' ', '');
                const isActive = sortBy === fieldKey;
                return (
                  <button key={field} onClick={() => handleSort(fieldKey)} style={{
                    padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    border: '1.5px solid var(--border)',
                    background: isActive ? '#EEF2FF' : 'var(--bg-surface)',
                    color: isActive ? '#3B5BFC' : '#6B7280',
                    transition: 'all 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}>
                    {field}{isActive && (sortOrder === 'asc' ? '↑' : '↓')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pagination — truly centered */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
            {sorted.length > orgsPerPage && (<>
              <button onClick={() => handlePageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1}
                style={{ padding: '6px 10px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--bg-surface)', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1, display: 'flex', alignItems: 'center' }}>
                <ChevronLeft size={14} color="#6B7280" />
              </button>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>{currentPage} / {totalPages}</span>
              <button onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}
                style={{ padding: '6px 10px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--bg-surface)', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1, display: 'flex', alignItems: 'center' }}>
                <ChevronRight size={14} color="#6B7280" />
              </button>
            </>)}
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'flex-end' }}>
            {/* Plan Filter Dropdown */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowPlanDropdown(!showPlanDropdown)} style={{
                padding: '6px 12px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                border: '1.5px solid var(--border)', background: 'var(--bg-surface)',
                color: 'var(--text-secondary)', cursor: 'pointer', outline: 'none',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                {planFilter} <ChevronDown size={14} />
              </button>
              {showPlanDropdown && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: 4,
                  background: 'var(--bg-surface)', borderRadius: 10, border: '1.5px solid var(--border)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 100, minWidth: 140,
                }}>
                  {['All Plans', 'Starter', 'Professional', 'Business', 'Enterprise'].map(plan => (
                    <button key={plan} onClick={() => { setPlanFilter(plan); setShowPlanDropdown(false); }} style={{
                      width: '100%', padding: '8px 12px', border: 'none', background: 'transparent',
                      textAlign: 'left', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      color: planFilter === plan ? '#3B5BFC' : 'var(--text-secondary)',
                    }}>
                      {plan}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Status Filter Dropdown */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowStatusDropdown(!showStatusDropdown)} style={{
                padding: '6px 12px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                border: '1.5px solid var(--border)', background: 'var(--bg-surface)',
                color: 'var(--text-secondary)', cursor: 'pointer', outline: 'none',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                {statusFilter} <ChevronDown size={14} />
              </button>
              {showStatusDropdown && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: 4,
                  background: 'var(--bg-surface)', borderRadius: 10, border: '1.5px solid var(--border)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 100, minWidth: 140,
                }}>
                  {['All Status', 'active', 'trial', 'inactive', 'suspended'].map(status => (
                    <button key={status} onClick={() => { setStatusFilter(status); setShowStatusDropdown(false); }} style={{
                      width: '100%', padding: '8px 12px', border: 'none', background: 'transparent',
                      textAlign: 'left', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      color: statusFilter === status ? '#3B5BFC' : 'var(--text-secondary)',
                      textTransform: 'capitalize',
                    }}>
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Grid inside component */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px' }}>
          {pageLoading ? (
            <TeamSkeleton />
          ) : paginatedOrgs.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
              <div style={{ width: 80, height: 80, borderRadius: 20, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <Building2 size={36} color="#3B5BFC" strokeWidth={2} />
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>No Organizations Yet</div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 400 }}>
                Organizations will appear here once they are added to the system
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {paginatedOrgs.map(org => (
                <OrganizationCard key={org.id} org={org}
                  onEdit={org => { setEditOrg(org); setShowModal(true); }}
                  onToggleStatus={toggleOrgStatus}
                  onViewProfile={org => { setSelectedOrg(org); setShowProfileModal(true); }}
                  managementMode={managementMode}
                />
              ))}
            </div>
          )}
        </div>

      </div>

      {showModal && editOrg && (
        <EditOrganizationModal
          org={editOrg}
          onClose={() => { setShowModal(false); setEditOrg(null); }}
          onSave={saveOrg}
          managementMode={managementMode}
        />
      )}
    </div>
  );
}

export default TeamPage;


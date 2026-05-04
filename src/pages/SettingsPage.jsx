import { useState } from 'react';
import { notify } from '../lib/notify';
import { Save, Mail, Phone, MapPin, Building, Calendar, KeyRound, Eye, EyeOff, ShieldCheck, User, Lock, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';

function PwdInput({ label, fieldKey, form, setForm, show, toggle }) {
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
          <KeyRound size={14} color="#9CA3AF" />
        </div>
        <input
          type={show ? 'text' : 'password'}
          value={form[fieldKey]}
          onChange={e => setForm(p => ({ ...p, [fieldKey]: e.target.value }))}
          placeholder="••••••••"
          style={{ width: '100%', padding: '11px 40px 11px 36px', borderRadius: 11, border: '1.5px solid var(--border)', background: 'var(--input-bg)', fontSize: 14, color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color 0.15s' }}
          onFocus={e => e.target.style.borderColor = '#3B5BFC'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
        <button onClick={toggle} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
          {show ? <EyeOff size={15} color="#9CA3AF" /> : <Eye size={15} color="#9CA3AF" />}
        </button>
      </div>
    </div>
  );
}

function StatusMsg({ status, msg }) {
  if (!status) return null;
  return (
    <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 10, background: status === 'success' ? '#ECFDF5' : '#FEF2F2', border: `1.5px solid ${status === 'success' ? '#BBF7D0' : '#FCA5A5'}`, fontSize: 13, fontWeight: 600, color: status === 'success' ? '#12C479' : '#EF4444' }}>
      {status === 'success' ? '✅' : '⚠'} {msg}
    </div>
  );
}

/* ─── Profile Tab ─────────────────────────────────────────── */
function ProfileTab() {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: 'Ferra Alexandra', email: 'admin@taskzy.io',
    phone: '+1 (555) 000-1234',
    location: 'San Francisco, CA',
    about: 'System administrator managing all workspace operations and team performance.',
  });

  function handleSave() { setEditing(false); notify.profileUpdated(); }

  const fields = [
    { icon: Mail,     label: 'Email',       key: 'email',    editable: false },
    { icon: Phone,    label: 'Phone',       key: 'phone',    editable: true  },
    { icon: MapPin,   label: 'Location',    key: 'location', editable: true  },
    { icon: Calendar, label: 'Admin Since', key: null,       editable: false, value: 'January 2025' },
  ];

  return (
    <div>
      {/* Avatar row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
        <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'linear-gradient(135deg, #3B5BFC, #2142D9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, color: '#fff', flexShrink: 0, boxShadow: '0 8px 24px #3B5BFC55' }}>FA</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>{form.name}</div>
          <div style={{ fontSize: 13, color: '#3B5BFC', fontWeight: 600, marginTop: 2 }}>Administrator</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{form.email}</div>
        </div>
        <button onClick={() => setEditing(p => !p)} style={{ padding: '8px 18px', borderRadius: 10, border: `1.5px solid ${editing ? '#3B5BFC' : 'var(--border)'}`, background: editing ? '#EEF2FF' : 'var(--bg-surface)', fontSize: 12, fontWeight: 700, color: editing ? '#3B5BFC' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.15s' }}>
          {editing ? 'Cancel' : 'Update Profile'}
        </button>
      </div>

      {/* About */}
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 8 }}>About</div>
      <div style={{ marginBottom: 20 }}>
        {editing ? (
          <textarea value={form.about} onChange={e => setForm(p => ({ ...p, about: e.target.value }))} rows={3}
            style={{ width: '100%', resize: 'vertical', padding: '12px 14px', borderRadius: 12, border: '1.5px solid #C7D4FF', background: 'var(--bg-subtle)', fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.7, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
        ) : (
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0 }}>{form.about}</p>
        )}
      </div>

      <div style={{ height: 1, background: 'var(--border-light)', marginBottom: 20 }} />

      {/* Contact */}
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 10 }}>Contact</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {fields.map(({ icon: Icon, label, key, editable, value }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--bg-subtle)', borderRadius: 12, border: '1px solid var(--border-light)' }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={15} color="#3B5BFC" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{label}</div>
              {editing && editable && key ? (
                <input value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', background: 'transparent', border: 'none', borderBottom: '1.5px solid #7C3AED', outline: 'none', width: '100%', padding: '2px 0', fontFamily: 'inherit' }} />
              ) : (
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{value || form[key]}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <button onClick={handleSave} style={{ marginTop: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 22px', background: 'linear-gradient(135deg, #3B5BFC, #2142D9)', border: 'none', borderRadius: 11, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(59,91,252,0.35)' }}>
          Update
        </button>
      )}
      {saved && <div style={{ marginTop: 10, fontSize: 13, color: '#12C479', fontWeight: 600 }}>✅ Profile saved successfully!</div>}
    </div>
  );
}

/* ─── Admin Password Tab ──────────────────────────────────── */
function AdminPasswordTab() {
  const { adminPassword, updateAdminPassword } = useApp();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [status, setStatus] = useState(null);
  const [msg, setMsg] = useState('');

  function handleUpdate() {
    if (!form.current || !form.next || !form.confirm) { setStatus('error'); setMsg('All fields are required.'); return; }
    if (form.current !== adminPassword) { setStatus('error'); setMsg('Current admin password is incorrect.'); return; }
    if (form.next.length < 6) { setStatus('error'); setMsg('New password must be at least 6 characters.'); return; }
    if (form.next !== form.confirm) { setStatus('error'); setMsg('Passwords do not match.'); return; }
    updateAdminPassword(form.next);
    setStatus('success'); setMsg('Admin password updated successfully.');
    setForm({ current: '', next: '', confirm: '' });
    notify.adminPwdUpdated();
    setTimeout(() => { setStatus(null); setOpen(false); }, 2500);
  }

  return (
    <div>
      {/* Clickable row */}
      <div onClick={() => { setOpen(p => !p); setStatus(null); setForm({ current: '', next: '', confirm: '' }); }}
        style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', padding: '10px 12px', borderRadius: 12, transition: 'background 0.15s', background: open ? '#EEF2FF' : 'transparent' }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = 'var(--bg-subtle)'; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = 'transparent'; }}
      >
        <div style={{ width: 42, height: 42, borderRadius: 12, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Shield size={18} color="#3B5BFC" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: open ? '#3B5BFC' : 'var(--text-primary)' }}>Admin Password</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>Protects the Admin Controls section in task modals</div>
        </div>
      </div>

      {/* Expanded form */}
      {open && (
        <div style={{ marginTop: 16, padding: '18px 20px', background: 'var(--bg-subtle)', borderRadius: 14, border: '1.5px solid #C7D4FF', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <PwdInput label="Current Admin Password" fieldKey="current" form={form} setForm={setForm} show={show.current} toggle={() => setShow(p => ({ ...p, current: !p.current }))} />
          <PwdInput label="New Admin Password"     fieldKey="next"    form={form} setForm={setForm} show={show.next}    toggle={() => setShow(p => ({ ...p, next: !p.next }))} />
          <PwdInput label="Confirm New Password"   fieldKey="confirm" form={form} setForm={setForm} show={show.confirm} toggle={() => setShow(p => ({ ...p, confirm: !p.confirm }))} />
          <StatusMsg status={status} msg={msg} />
          <button onClick={handleUpdate} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 20px', background: 'linear-gradient(135deg, #3B5BFC, #2142D9)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(59,91,252,0.3)' }}>
            <Shield size={13} /> Update Admin Password
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Account Password Tab ────────────────────────────────── */
function AccountPasswordTab() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [status, setStatus] = useState(null);
  const [msg, setMsg] = useState('');

  const ACCOUNT_PWD = 'account123';

  function handleUpdate() {
    if (!form.current || !form.next || !form.confirm) { setStatus('error'); setMsg('All fields are required.'); return; }
    if (form.current !== ACCOUNT_PWD) { setStatus('error'); setMsg('Current account password is incorrect.'); return; }
    if (form.next.length < 8) { setStatus('error'); setMsg('New password must be at least 8 characters.'); return; }
    if (form.next !== form.confirm) { setStatus('error'); setMsg('Passwords do not match.'); return; }
    setStatus('success'); setMsg('Account password updated successfully.');
    setForm({ current: '', next: '', confirm: '' });
    notify.accountPwdUpdated();
    setTimeout(() => { setStatus(null); setOpen(false); }, 2500);
  }

  return (
    <div>
      {/* Clickable row */}
      <div onClick={() => { setOpen(p => !p); setStatus(null); setForm({ current: '', next: '', confirm: '' }); }}
        style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', padding: '10px 12px', borderRadius: 12, transition: 'background 0.15s', background: open ? '#F5F3FF' : 'transparent' }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = 'var(--bg-subtle)'; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = 'transparent'; }}
      >
        <div style={{ width: 42, height: 42, borderRadius: 12, background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Lock size={18} color="#7C3AED" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: open ? '#7C3AED' : 'var(--text-primary)' }}>Account Password</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>Used to log in to your admin account</div>
        </div>
      </div>

      {/* Expanded form */}
      {open && (
        <div style={{ marginTop: 16, padding: '18px 20px', background: 'var(--bg-subtle)', borderRadius: 14, border: '1.5px solid #DDD6FE', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <PwdInput label="Current Account Password" fieldKey="current" form={form} setForm={setForm} show={show.current} toggle={() => setShow(p => ({ ...p, current: !p.current }))} />
          <PwdInput label="New Account Password"     fieldKey="next"    form={form} setForm={setForm} show={show.next}    toggle={() => setShow(p => ({ ...p, next: !p.next }))} />
          <PwdInput label="Confirm New Password"     fieldKey="confirm" form={form} setForm={setForm} show={show.confirm} toggle={() => setShow(p => ({ ...p, confirm: !p.confirm }))} />
          <StatusMsg status={status} msg={msg} />
          <button onClick={handleUpdate} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 20px', background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}>
            <Lock size={13} /> Update Account Password
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────── */
export default function SettingsPage() {
  return (
    <div style={{ flex: 1, minHeight: 0, padding: '20px 28px 24px', overflowY: 'auto' }}>
      <div style={{ background: 'var(--bg-surface)', borderRadius: 18, padding: 28, border: '1.5px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <ProfileTab />
        <div style={{ height: 1, background: 'var(--border-light)' }} />
        <AdminPasswordTab />
        <div style={{ height: 1, background: 'var(--border-light)' }} />
        <AccountPasswordTab />
      </div>
    </div>
  );
}

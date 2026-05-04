import { Search, X, Zap, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useLottie } from 'lottie-react';
import fullscreenConfetti from '../lottie/Confetti.json';
import PlanSelection from './PlanSelection';
import { AdminPasswordModal } from './AdminPasswordModal';
import { useAdminPassword } from '../hooks/useAdminPassword';

const STAGE_COLOR = {
  New: '#9CA3AF', Start: '#3B5BFC', Accept: '#7C3AED',
  Review: '#F97316', Update: '#EF4444', Complete: '#12C479',
};

// Add animations
const planSelectorStyles = `
@keyframes slideInFromRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
`;

export default function Header({ title, subtitle }) {
  const { tasks, currentUser, planExpiryDate, setPlanExpiryDate, currentPlan: contextPlan, setCurrentPlan: setContextPlan, planAlertBlink, isPlanActive } = useApp();
  const { showPasswordModal, pendingAction, requestAdminPassword, handlePasswordConfirm, handlePasswordCancel } = useAdminPassword();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);
  const dropRef = useRef(null);

  // Badge state
  const [badgeOpen, setBadgeOpen] = useState(false);
  const [brandName, setBrandName] = useState('Taskzy');
  const [brandSub, setBrandSub] = useState('Workspace');
  const [editName, setEditName] = useState('Taskzy');
  const [editSub, setEditSub] = useState('Workspace');
  const [brandImage, setBrandImage] = useState(null);
  const currentPlan = contextPlan?.name || 'Professional';
  const setCurrentPlan = (name) => setContextPlan(prev => ({ ...(prev || {}), name }));
  const [showPlanSelector, setShowPlanSelector] = useState(false);
  const [canClosePlanSelector, setCanClosePlanSelector] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const badgeRef = useRef(null);

  // Calculate plan status dot color
  const getPlanStatusColor = () => {
    if (currentPlan === 'Free Plan' || !planExpiryDate) return '#EF4444'; // Red for no plan/inactive
    
    const today = new Date();
    const expiry = new Date(planExpiryDate);
    const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (daysLeft <= 0) return '#EF4444'; // Red - expired
    if (daysLeft <= 10) return '#F97316'; // Orange - 10 days or less
    if (daysLeft <= 30) return '#F59E0B'; // Yellow/Orange - 30 days or less (1 month)
    return '#12C479'; // Green - more than 1 month
  };
  const fileInputRef = useRef(null);

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const results = query.trim().length > 0
    ? (tasks || []).filter(t =>
        t.id.toLowerCase().includes(query.toLowerCase()) ||
        t.title.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : [];

  const showDrop = focused && query.trim().length > 0;

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setFocused(false);
        setQuery('');
      }
      if (badgeRef.current && !badgeRef.current.contains(e.target)) {
        setBadgeOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function handleSave() {
    requestAdminPassword('update workspace badge', () => {
      if (editName.trim()) setBrandName(editName.trim());
      if (editSub.trim()) setBrandSub(editSub.trim());
      setBadgeOpen(false);
    });
  }

  function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBrandImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  function handleUpgradePlan() {
    setShowPlanSelector(true);
    setBadgeOpen(false);
  }

  function handlePlanSelect(plan, billingCycle, couponInfo) {
    // Update plan details immediately
    setCurrentPlan(plan.name);
    const expiryDate = new Date();
    // Duration coupon overrides billing cycle for expiry calculation
    if (couponInfo && couponInfo.type === 'duration' && couponInfo.duration) {
      const { value, unit } = couponInfo.duration;
      if (unit === 'months') expiryDate.setMonth(expiryDate.getMonth() + value);
      else expiryDate.setDate(expiryDate.getDate() + value);
    } else if (plan.period === 'one-time') {
      expiryDate.setFullYear(expiryDate.getFullYear() + 99); // Lifetime
    } else if (billingCycle === 'yearly') {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    } else {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    }
    const expiryStr = expiryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    setPlanExpiryDate(expiryStr);
    try { localStorage.setItem('planExpiryDate', expiryStr); } catch {}

    // Also persist the full plan object so plan name/color/users update everywhere
    const planData = { id: plan.id, name: plan.name, users: plan.users, color: plan.color, billingCycle };
    setContextPlan(planData);
    try { localStorage.setItem('currentPlan', JSON.stringify(planData)); } catch {}

    setShowPlanSelector(false);
    setCanClosePlanSelector(true);

    // Show fullscreen confetti after panel closes
    setTimeout(() => {
      setShowConfetti(true);
    }, 400);
  }

  function handlePlanCancel() {
    setShowPlanSelector(false);
    setCanClosePlanSelector(true);
  }

  return (
    <>
    <style>{planSelectorStyles}</style>
    <div style={{
      height: 64,
      background: 'var(--bg-surface)',
      borderBottom: '1.5px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px', flexShrink: 0, position: 'relative', zIndex: 200,
      transition: 'background 0.25s ease, border-color 0.25s ease',
    }}>

      {/* Left: greeting + date */}
      <div>
        <h1 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
          {greeting}, {currentUser?.name || 'Admin'}! 👋
        </h1>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{dateStr}</p>
      </div>

      {/* Centre: glassmorphism brand capsule */}
      <div ref={badgeRef} style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 300 }}>
        <div
          onClick={() => { setBadgeOpen(p => !p); setEditName(brandName); setEditSub(brandSub); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 9,
            padding: '7px 18px 7px 10px', borderRadius: 999,
            background: badgeOpen ? 'rgba(59,91,252,0.13)' : 'rgba(59,91,252,0.07)',
            border: `1.5px solid ${badgeOpen ? 'rgba(59,91,252,0.38)' : 'rgba(59,91,252,0.18)'}`,
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            boxShadow: badgeOpen ? '0 4px 24px rgba(59,91,252,0.22), inset 0 1px 0 rgba(255,255,255,0.22)' : '0 2px 16px rgba(59,91,252,0.10), inset 0 1px 0 rgba(255,255,255,0.18)',
            cursor: 'pointer', userSelect: 'none',
            transition: 'background 0.2s, box-shadow 0.2s, border-color 0.2s, transform 0.2s',
          }}
          onMouseEnter={e => { if (!badgeOpen) { e.currentTarget.style.background = 'rgba(59,91,252,0.13)'; e.currentTarget.style.borderColor = 'rgba(59,91,252,0.38)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
          onMouseLeave={e => { if (!badgeOpen) { e.currentTarget.style.background = 'rgba(59,91,252,0.07)'; e.currentTarget.style.borderColor = 'rgba(59,91,252,0.18)'; e.currentTarget.style.transform = 'translateY(0)'; } }}
        >
          <div style={{ width: 28, height: 28, borderRadius: 8, background: brandImage ? 'transparent' : 'linear-gradient(135deg, #3B5BFC 0%, #7C3AED 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(59,91,252,0.35)', flexShrink: 0, overflow: 'hidden' }}>
            {brandImage ? (
              <img src={brandImage} alt="Brand" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <Zap size={13} color="#fff" strokeWidth={2.5} fill="#fff" />
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.2px', background: 'linear-gradient(90deg, #3B5BFC, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{brandName}</span>
            <span style={{ fontSize: 8, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.8px', textTransform: 'uppercase', marginTop: 1 }}>{brandSub}</span>
          </div>
          {/* Status Dot */}
          <div style={{ 
            width: 8, 
            height: 8, 
            borderRadius: '50%', 
            background: getPlanStatusColor(),
            boxShadow: `0 0 8px ${getPlanStatusColor()}`,
            marginLeft: 4,
            flexShrink: 0,
            animation: planAlertBlink ? 'planDotBlink 1.2s ease 4' : 'none',
          }} />
          <style>{`@keyframes planDotBlink { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.1;transform:scale(1.6)} }`}</style>
          <style>{`.plan-dot-blink { animation: planDotBlink 0.6s ease 5; }`}</style>
        </div>

        {/* Popdown */}
        {badgeOpen && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 10px)', left: '50%', transform: 'translateX(-50%)',
            width: 280, background: 'var(--bg-surface)',
            border: '1.5px solid var(--border)', borderRadius: 14,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            padding: '16px', display: 'flex', flexDirection: 'column', gap: 12,
          }}>

            {/* Name and Subtitle Inputs with Edit Icon */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>
                <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Company Name</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {/* Edit Icon Button */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    title="Upload brand logo"
                    style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#3B5BFC'; e.currentTarget.style.background = '#EEF2FF'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-subtle)'; }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </button>
                  {/* Company Name Input */}
                  <input
                    autoFocus
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    style={{ flex: 1, padding: '7px 10px', borderRadius: 8, border: '1.5px solid #C7D4FF', background: 'var(--bg-subtle)', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#3B5BFC'}
                    onBlur={e => e.target.style.borderColor = '#C7D4FF'}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Subtitle</label>
                <input
                  value={editSub}
                  onChange={e => setEditSub(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1.5px solid #C7D4FF', background: 'var(--bg-subtle)', fontSize: 12, color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#3B5BFC'}
                  onBlur={e => e.target.style.borderColor = '#C7D4FF'}
                  onKeyDown={e => e.key === 'Enter' && handleSave()}
                />
              </div>
            </div>

            <div style={{ height: 1, background: 'var(--border-light)' }} />

            {/* Current Plan Section */}
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Current Plan</label>
              {(() => {
                const isExpired = planExpiryDate && new Date(planExpiryDate) < new Date();
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '10px 12px', borderRadius: 10, background: isExpired ? '#FEF2F2' : 'var(--bg-subtle)', border: `1.5px solid ${isExpired ? '#FCA5A5' : 'var(--border)'}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: isExpired ? '#EF4444' : 'var(--text-primary)' }}>{currentPlan}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: isExpired ? '#EF4444' : 'var(--text-muted)' }}>{planExpiryDate}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                        {isExpired && <span style={{ fontSize: 9, fontWeight: 700, color: '#EF4444' }}>Plan Inactive</span>}
                        <button
                          onClick={handleUpgradePlan}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 7, border: 'none', background: 'linear-gradient(135deg, #3B5BFC, #7C3AED)', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: '#fff', boxShadow: '0 2px 8px rgba(59,91,252,0.3)', transition: 'transform 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'translateX(2px)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
                        >
                          Upgrade
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6H10M10 6L6 2M10 6L6 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg, #3B5BFC, #7C3AED)', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#fff', boxShadow: '0 3px 10px rgba(59,91,252,0.3)', transition: 'transform 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Update
            </button>
          </div>
        )}
      </div>

      {/* Right: search + dark toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

        {/* Task search */}
        <div ref={dropRef} style={{ position: 'relative' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: focused ? 'var(--bg-surface)' : 'var(--input-bg)',
            border: `1.5px solid ${focused ? '#3B5BFC' : 'var(--border)'}`,
            borderRadius: 11, padding: '0 12px', height: 38,
            width: focused ? 280 : 220,
            boxShadow: focused ? '0 0 0 3px rgba(59,91,252,0.1)' : 'none',
            transition: 'all 0.2s ease',
          }}>
            <Search size={14} color={focused ? '#3B5BFC' : 'var(--text-muted)'} style={{ flexShrink: 0 }} />
            <input
              ref={inputRef}
              value={query}
              onChange={e => { if (!isPlanActive) return; setQuery(e.target.value); }}
              onFocus={() => { if (!isPlanActive) { inputRef.current?.blur(); return; } setFocused(true); }}
              placeholder="Search by ID or title…"
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: 'var(--text-primary)', width: '100%' }}
            />
            {query && (
              <button onClick={() => { setQuery(''); inputRef.current?.focus(); }} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                <X size={13} color="var(--text-muted)" />
              </button>
            )}
          </div>

          {showDrop && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              width: 340, background: 'var(--bg-surface)',
              border: '1.5px solid var(--border)', borderRadius: 14,
              boxShadow: 'var(--shadow-md)', overflow: 'hidden',
              animation: 'fadeSlideIn 0.18s ease forwards', zIndex: 300,
            }}>
              {results.length === 0 ? (
                <div style={{ padding: '18px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  No tasks found for "<strong>{query}</strong>"
                </div>
              ) : (
                <>
                  <div style={{ padding: '8px 14px 4px', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                    {results.length} result{results.length !== 1 ? 's' : ''}
                  </div>
                  {results.map(task => (
                    <div key={task.id} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px', borderTop: '1px solid var(--border-light)',
                      transition: 'background 0.12s', cursor: 'pointer',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ fontSize: 9, fontWeight: 800, color: '#fff', background: '#3B5BFC', padding: '2px 7px', borderRadius: 5, flexShrink: 0 }}>{task.id}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</span>
                      <span style={{
                        fontSize: 10, fontWeight: 700,
                        color: STAGE_COLOR[task.stage],
                        background: STAGE_COLOR[task.stage] + '18',
                        border: `1px solid ${STAGE_COLOR[task.stage]}33`,
                        padding: '2px 8px', borderRadius: 20, flexShrink: 0,
                      }}>{task.stage}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>



      </div>

      {/* Plan Selector Panel - Slides in from right */}
      {showPlanSelector && (
        <>
          {canClosePlanSelector && (
            <div
              onClick={() => setShowPlanSelector(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'transparent',
                zIndex: 9998,
                animation: 'fadeIn 0.3s ease',
              }}
            />
          )}
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: '54%',
              height: '100vh',
              background: '#F0F2F8',
              zIndex: 9999,
              boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
              animation: 'slideInFromRight 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <PlanSelection
              email={currentUser?.name || 'Admin'}
              onSelectPlan={handlePlanSelect}
              onBack={() => { if (canClosePlanSelector) setShowPlanSelector(false); }}
              onCancel={handlePlanCancel}
              onProcessingStart={() => setCanClosePlanSelector(false)}
              backText="Back"
            />
          </div>
        </>
      )}
    </div>
      {showPasswordModal && (
        <AdminPasswordModal
          onClose={handlePasswordCancel}
          onConfirm={handlePasswordConfirm}
          action={pendingAction?.actionName || 'update workspace badge'}
        />
      )}

      {/* Fullscreen Confetti Overlay */}
      {showConfetti && <FullscreenConfetti onComplete={() => setShowConfetti(false)} />}
    </>
  );
}

function FullscreenConfetti({ onComplete }) {
  const [fading, setFading] = useState(false);

  const dismiss = () => {
    setFading(true);
    setTimeout(onComplete, 500);
  };

  const { View } = useLottie({
    animationData: fullscreenConfetti,
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
        position: 'fixed', inset: 0, zIndex: 10000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.5s ease',
      }}
    >
      {View}
    </div>
  );
}
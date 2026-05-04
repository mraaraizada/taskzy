import { useState, useEffect } from 'react';
import { useLottie } from 'lottie-react';
import successConfetti from '../lottie/success-confetti.json';
import rocketAnimation from '../lottie/Businessman flies up with rocket.json';
import { Check, Mail, ArrowLeft, Tag, Lock, User, Phone, AtSign, Plus, X } from 'lucide-react';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 589,
    users: 7,
    period: 'month',
    features: ['Up to 7 users', 'Basic task management', 'Email support', '10GB storage'],
    color: '#3B5BFC',
    popular: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 1279,
    users: 19,
    period: 'month',
    features: ['Up to 19 users', 'Advanced analytics', 'Priority support', '50GB storage', 'Custom roles'],
    color: '#7C3AED',
    popular: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: 2489,
    users: 45,
    period: 'month',
    features: ['Up to 45 users', 'Full analytics suite', '24/7 support', '200GB storage', 'API access', 'Custom integrations'],
    color: '#12C479',
    popular: false,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 4589,
    users: 'Unlimited',
    period: 'month',
    features: ['Unlimited team members', 'All features included', 'Premium support', 'Unlimited storage', 'White-label option', 'Dedicated account manager'],
    color: '#F97316',
    popular: false,
  },
  {
    id: 'custom',
    name: 'Custom',
    price: null,
    users: 'Custom',
    period: 'custom',
    features: ['Tailored user limits', 'Custom features', 'Dedicated account manager', 'Custom integrations', 'SLA guarantees', 'On-premise option'],
    color: '#EC4899',
    popular: false,
    isCustom: true,
  },
];

const VALID_COUPONS = {
  'TASKZY20': { discount: 20, label: '20% off' },
  'LAUNCH50': { discount: 50, label: '50% off' },
  'FIRST10':  { discount: 10, label: '10% off' },
};

// Load dynamic coupons from localStorage (created in project-dashboard)
function loadDynamicCoupons() {
  try {
    const stored = JSON.parse(localStorage.getItem('taskzy_coupons') || '[]');
    const map = {};
    stored.forEach(c => {
      if (c.active && c.code) {
        map[c.code.toUpperCase()] = {
          discount: c.type === 'percentage' ? c.value : 0,
          label: c.type === 'percentage' ? `${c.value}% off` : `${c.duration?.value} ${c.duration?.unit}`,
          type: c.type,
          amount: c.type !== 'percentage' ? c.value : null,
          duration: c.duration || null,
          plan: c.plan || 'all',
          id: c.id,
        };
      }
    });
    return map;
  } catch { return {}; }
}

function ConfettiPlayer() {
  const { View } = useLottie({
    animationData: successConfetti,
    loop: false,
    style: { width: 220, height: 220 },
  });
  return <div style={{ position: 'relative', zIndex: 1, marginBottom: 8 }}>{View}</div>;
}

function RocketPlayer() {
  const { View } = useLottie({
    animationData: rocketAnimation,
    loop: true,
    autoplay: true,
    style: { width: '100%', height: '100%', objectFit: 'contain' },
  });
  return View;
}

function Divider() {
  return <div style={{ height: 1, background: '#F0F2F8', margin: '18px 0' }} />;
}

function CheckoutStep({ plan, billingCycle, email, onBack, onConfirm, onCancel }) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [userEmail, setUserEmail] = useState(email || '');
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showRocket, setShowRocket] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [nameFocus, setNameFocus] = useState(false);
  const [phoneFocus, setPhoneFocus] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Active plan may be overridden by a duration coupon
  const [activePlan, setActivePlan] = useState(plan);
  const [activeBillingCycle, setActiveBillingCycle] = useState(billingCycle);

  const basePrice = (activePlan.period === 'one-time'
    ? activePlan.price
    : activeBillingCycle === 'yearly'
    ? Math.round(activePlan.price * 12 * 0.8)
    : activePlan.price) * quantity;

  const discount = couponApplied && couponApplied.type === 'percentage'
    ? Math.round(basePrice * couponApplied.discount / 100)
    : 0;

  // For duration coupons, total = coupon amount (flat price override)
  const total = couponApplied && couponApplied.type !== 'percentage'
    ? (couponApplied.amount || 0)
    : basePrice - discount;

  const billingLabel = activeBillingCycle === 'yearly' ? 'year' : activePlan.period === 'one-time' ? 'one-time' : 'month';

  // ── Rocket animation screen with Cancel and Done buttons ──
  if (showRocket) {
    return (
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        zIndex: 10,
        padding: '40px',
      }}>
        {/* Background video */}
        <video
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_015952_e1deeb12-8fb7-4071-a42a-60779fc64ab6.mp4"
          autoPlay muted loop playsInline
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, pointerEvents: 'none' }}
        />
        {/* Overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(240,242,248,0.55)', zIndex: 1, pointerEvents: 'none' }} />
        
        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Rocket Lottie */}
          <div style={{ width: '100%', maxWidth: 500, height: 400, marginBottom: 32 }}>
            <RocketPlayer />
          </div>

          {/* Message */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1A1D2E', letterSpacing: '-0.8px', marginBottom: 8 }}>Processing Your Upgrade</h2>
            <p style={{ fontSize: 15, color: '#6B7280' }}>Your {plan.name} plan is being activated...</p>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 16 }}>
            <button
              onClick={() => {
                setShowRocket(false);
                setError(true);
                setTimeout(() => {
                  setError(false);
                  if (onCancel) onCancel();
                }, 2500);
              }}
              style={{
                padding: '14px 32px',
                borderRadius: 12,
                border: '1.5px solid #E5E7EB',
                background: '#fff',
                fontSize: 15,
                fontWeight: 700,
                color: '#6B7280',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#F9FAFB';
                e.currentTarget.style.borderColor = '#D1D5DB';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.borderColor = '#E5E7EB';
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setShowRocket(false);
                setSuccess(true);
                setTimeout(() => onConfirm(couponApplied), 2500);
              }}
              style={{
                padding: '14px 32px',
                borderRadius: 12,
                border: 'none',
                background: `linear-gradient(135deg, ${plan.color}, ${plan.color}dd)`,
                fontSize: 15,
                fontWeight: 700,
                color: '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: `0 4px 16px ${plan.color}40`,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 6px 20px ${plan.color}50`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 4px 16px ${plan.color}40`;
              }}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Error screen ──
  if (error) {
    return (
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, #EF4444ee, #DC2626cc)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        zIndex: 10,
      }}>
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 40px' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>❌</div>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: '-0.8px', marginBottom: 8 }}>Upgrade Cancelled</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', marginBottom: 4 }}>Your upgrade was not completed</p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>Returning to dashboard...</p>
        </div>
      </div>
    );
  }

  // ── Success screen ──
  if (success) {
    return (
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        zIndex: 10,
      }}>
        {/* Background video */}
        <video
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_015952_e1deeb12-8fb7-4071-a42a-60779fc64ab6.mp4"
          autoPlay muted loop playsInline
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, pointerEvents: 'none' }}
        />
        {/* Gradient overlay */}
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${plan.color}ee, ${plan.color}cc)`, zIndex: 1, pointerEvents: 'none' }} />
        
        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Lottie animation above the text */}
          <ConfettiPlayer />

          {/* Success message */}
          <div style={{ textAlign: 'center', padding: '0 40px' }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: '-0.8px', marginBottom: 8 }}>Payment Successful!</h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', marginBottom: 4 }}>{plan.name} Plan activated</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>Redirecting you to your dashboard…</p>
          </div>
        </div>
      </div>
    );
  }

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    // Merge static + dynamic coupons
    const allCoupons = { ...VALID_COUPONS, ...loadDynamicCoupons() };
    const found = allCoupons[code];

    if (!found) {
      setCouponError('Invalid coupon code');
      setCouponApplied(null);
      return;
    }

    // Check plan restriction
    if (found.plan && found.plan !== 'all' && found.plan !== activePlan.id) {
      setCouponError(`This coupon is only valid for the ${found.plan.charAt(0).toUpperCase() + found.plan.slice(1)} plan`);
      setCouponApplied(null);
      return;
    }

    setCouponApplied(found);
    setCouponCode(code);
    setCouponError('');

    // If duration coupon — lock quantity to 1 and update plan if specified
    if (found.type === 'duration') {
      setQuantity(1); // duration is fixed, quantity doesn't apply
      if (found.plan && found.plan !== 'all') {
        const targetPlan = PLANS.find(p => p.id === found.plan);
        if (targetPlan) {
          setActivePlan(targetPlan);
          setActiveBillingCycle('monthly');
        }
      }
    }

    // Increment used count in localStorage
    try {
      const stored = JSON.parse(localStorage.getItem('taskzy_coupons') || '[]');
      const updated = stored.map(c => c.id === found.id ? { ...c, used: (c.used || 0) + 1 } : c);
      localStorage.setItem('taskzy_coupons', JSON.stringify(updated));
    } catch {}
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponInput('');
    setCouponApplied(null);
    setCouponError('');
    setCouponOpen(false);
    setQuantity(1);
    // Reset plan back to original
    setActivePlan(plan);
    setActiveBillingCycle(billingCycle);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      // Only show rocket animation if onCancel exists (upgrade flow)
      // For login page (no onCancel), go directly to success
      if (onCancel) {
        setShowRocket(true);
      } else {
        setSuccess(true);
        setTimeout(() => onConfirm(couponApplied), 2500);
      }
    }, 1200);
  };

  const inp = (focused) => ({
    width: '100%',
    height: 48,
    borderRadius: 10,
    border: `1.5px solid ${focused ? '#3B5BFC' : '#E5E7EB'}`,
    padding: '0 16px 0 42px',
    fontSize: 14,
    color: '#1A1D2E',
    outline: 'none',
    background: focused ? '#F5F7FF' : '#FAFBFF',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, background 0.2s',
    boxShadow: focused ? '0 0 0 3px rgba(59,91,252,0.10)' : 'none',
  });

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      alignItems: 'flex-start',
      padding: '32px 56px 48px',
      overflowY: 'auto',
      boxSizing: 'border-box',
      position: 'relative',
    }}>
      {/* Background video */}
      <video
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_015952_e1deeb12-8fb7-4071-a42a-60779fc64ab6.mp4"
        autoPlay muted loop playsInline
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, pointerEvents: 'none' }}
      />
      {/* Overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(240,242,248,0.55)', zIndex: 1, pointerEvents: 'none' }} />
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      {/* Header — top-left, same as plan selection */}
      <div style={{ marginBottom: 24, width: '100%' }}>
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}
        >
          <ArrowLeft size={13} /> Back to plans
        </button>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1A1D2E', letterSpacing: '-0.8px', lineHeight: 1.2, marginBottom: 6 }}>Complete your order</h2>
        <p style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 2 }}>Fill in your details to proceed with payment</p>
        <p style={{ fontSize: 12, color: '#6B7280' }}>Logged in as: <span style={{ fontWeight: 600, color: '#3B5BFC' }}>{email}</span></p>
      </div>

      {/* White card — centered horizontally */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div style={{
          width: '100%', maxWidth: 520,
          background: '#fff',
          borderRadius: 24,
          padding: '32px 36px 28px',
          boxShadow: '0 4px 32px rgba(59,91,252,0.08), 0 1px 4px rgba(0,0,0,0.04)',
          border: '1px solid rgba(255,255,255,0.9)',
        }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

          {/* ── Section 1: Your Information ── */}
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }}>
            Your Information
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 0 }}>
            {/* Full Name */}
            <div style={{ position: 'relative' }}>
              <User size={15} color="#9CA3AF" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1 }} />
              <input
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Full Name"
                style={inp(nameFocus)}
                onFocus={() => setNameFocus(true)}
                onBlur={() => setNameFocus(false)}
              />
            </div>
            {/* Phone */}
            <div style={{ position: 'relative' }}>
              <Phone size={15} color="#9CA3AF" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1 }} />
              <input
                required
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/[^\d+\-\s()]/g, ''))}
                placeholder="Phone Number"
                style={inp(phoneFocus)}
                onFocus={() => setPhoneFocus(true)}
                onBlur={() => setPhoneFocus(false)}
              />
            </div>
            {/* Email */}
            <div style={{ position: 'relative' }}>
              <AtSign size={15} color="#9CA3AF" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1 }} />
              <input
                required
                type="email"
                value={userEmail}
                onChange={e => setUserEmail(e.target.value)}
                placeholder="Email Address"
                style={inp(emailFocus)}
                onFocus={() => setEmailFocus(true)}
                onBlur={() => setEmailFocus(false)}
              />
            </div>
          </div>

          <Divider />

          {/* ── Section 2: Plan Summary ── */}
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }}>
            Plan Summary
          </div>
          {/* Plan header row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: `${activePlan.color}08`, borderRadius: 12, border: `1.5px solid ${activePlan.color}20`, marginBottom: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `${activePlan.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Check size={16} color={activePlan.color} strokeWidth={2.5} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1D2E' }}>{activePlan.name} Plan</div>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 1 }}>
                {activeBillingCycle === 'yearly' ? 'Billed yearly' : activePlan.period === 'one-time' ? 'One-time payment' : 'Billed monthly'}
                {' · '}Up to {activePlan.users}{typeof activePlan.users === 'number' ? ' users' : ''}
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: activePlan.color, marginTop: 4 }}>
                Active till{' '}
                {(() => {
                  const d = new Date();
                  if (activePlan.period === 'one-time') return 'Lifetime';
                  // Duration coupon overrides the active period
                  if (couponApplied && couponApplied.type === 'duration' && couponApplied.duration) {
                    const { value, unit } = couponApplied.duration;
                    if (unit === 'months') d.setMonth(d.getMonth() + value * quantity);
                    else d.setDate(d.getDate() + value * quantity);
                  } else if (activeBillingCycle === 'yearly') {
                    d.setFullYear(d.getFullYear() + quantity);
                  } else {
                    d.setMonth(d.getMonth() + quantity);
                  }
                  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                })()}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              {/* Quantity selector — hidden when a duration coupon is applied (fixed period) */}
              {!(couponApplied && couponApplied.type === 'duration') && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginBottom: 6 }}>
                  <button
                    type="button"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    style={{
                      width: 24, height: 24, borderRadius: 6,
                      background: quantity <= 1 ? '#F3F4F6' : '#fff',
                      border: `1.5px solid ${quantity <= 1 ? '#E5E7EB' : activePlan.color}`,
                      color: quantity <= 1 ? '#9CA3AF' : activePlan.color,
                      fontSize: 16, fontWeight: 700,
                      cursor: quantity <= 1 ? 'default' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >−</button>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1D2E', minWidth: 20, textAlign: 'center' }}>{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(q => q + 1)}
                    style={{
                      width: 24, height: 24, borderRadius: 6,
                      background: '#fff',
                      border: `1.5px solid ${activePlan.color}`,
                      color: activePlan.color,
                      fontSize: 16, fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >+</button>
                </div>
              )}
              {/* Duration coupon — show fixed period badge instead of quantity */}
              {couponApplied && couponApplied.type === 'duration' && couponApplied.duration && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 6 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 8,
                    background: '#ECFDF5', color: '#12C479', border: '1px solid #BBF7D0',
                  }}>
                    {couponApplied.duration.value} {couponApplied.duration.unit} fixed
                  </span>
                </div>
              )}
              <div style={{ fontSize: 18, fontWeight: 800, color: activePlan.color }}>
                {couponApplied && couponApplied.type === 'duration'
                  ? `₹${(couponApplied.amount || 0).toLocaleString()}`
                  : `₹${basePrice.toLocaleString()}`
                }
              </div>
              <div style={{ fontSize: 11, color: '#9CA3AF' }}>/{billingLabel}</div>
            </div>
          </div>
          <Divider />

          {/* ── Section 3: Coupon — collapsed behind + button ── */}
          <div>
            {!couponApplied && !couponOpen && (
              <button
                type="button"
                onClick={() => setCouponOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#3B5BFC', fontSize: 13, fontWeight: 600 }}
              >
                <div style={{ width: 20, height: 20, borderRadius: 6, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plus size={12} color="#3B5BFC" strokeWidth={2.5} />
                </div>
                Add coupon code
              </button>
            )}

            {couponOpen && !couponApplied && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8 }}>Coupon Code</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Tag size={14} color="#9CA3AF" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input
                      autoFocus
                      value={couponInput}
                      onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                      placeholder="Enter code"
                      style={{ width: '100%', height: 44, borderRadius: 10, border: `1.5px solid ${couponError ? '#FCA5A5' : '#E5E7EB'}`, padding: '0 14px 0 38px', fontSize: 14, color: '#1A1D2E', outline: 'none', background: '#FAFBFF', boxSizing: 'border-box', transition: 'border-color 0.2s', letterSpacing: '0.5px', fontWeight: 600 }}
                      onFocus={e => e.target.style.borderColor = couponError ? '#FCA5A5' : '#3B5BFC'}
                      onBlur={e => e.target.style.borderColor = couponError ? '#FCA5A5' : '#E5E7EB'}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    style={{ padding: '0 18px', height: 44, borderRadius: 10, border: 'none', background: '#EEF2FF', color: '#3B5BFC', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    Apply
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCouponOpen(false); setCouponInput(''); setCouponError(''); }}
                    style={{ width: 44, height: 44, borderRadius: 10, border: '1.5px solid #E5E7EB', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                  >
                    <X size={14} color="#9CA3AF" />
                  </button>
                </div>
                {couponError && <div style={{ fontSize: 12, color: '#EF4444', marginTop: 5, fontWeight: 500 }}>⚠ {couponError}</div>}
              </div>
            )}

            {couponApplied && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#ECFDF5', borderRadius: 10, border: '1.5px solid #BBF7D0' }}>
                <Tag size={13} color="#12C479" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#12C479' }}>Coupon Applied</div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#059669', letterSpacing: '0.5px', marginTop: 1 }}>{couponCode}</div>
                </div>
                {couponApplied.type === 'percentage' && (
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#12C479' }}>−₹{discount.toLocaleString()}</span>
                )}
                {couponApplied.type !== 'percentage' && couponApplied.duration && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#12C479' }}>{couponApplied.duration.value} {couponApplied.duration.unit}</span>
                )}
                <button type="button" onClick={handleRemoveCoupon} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0, marginLeft: 4 }}>
                  <X size={13} color="#9CA3AF" />
                </button>
              </div>
            )}
          </div>

          <Divider />

          {/* ── Price breakdown + total ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#9CA3AF' }}>Subtotal</span>
              <span style={{ fontSize: 13, color: '#6B7280' }}>₹{basePrice.toLocaleString()}</span>
            </div>
            {activeBillingCycle === 'yearly' && activePlan.period !== 'one-time' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#12C479' }}>Yearly discount</span>
                <span style={{ fontSize: 13, color: '#12C479', fontWeight: 600 }}>20% off</span>
              </div>
            )}
            {couponApplied && couponApplied.type === 'percentage' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#12C479' }}>Coupon ({couponCode})</span>
                <span style={{ fontSize: 13, color: '#12C479', fontWeight: 600 }}>−₹{discount.toLocaleString()}</span>
              </div>
            )}
            {couponApplied && couponApplied.type !== 'percentage' && couponApplied.duration && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#12C479' }}>Coupon ({couponCode}) — {couponApplied.duration.value} {couponApplied.duration.unit}</span>
                <span style={{ fontSize: 13, color: '#12C479', fontWeight: 600 }}>₹{(couponApplied.amount || 0).toLocaleString()}</span>
              </div>
            )}
            <div style={{ height: 1, background: '#F0F2F8', margin: '4px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#1A1D2E' }}>Total</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: activePlan.color }}>₹{total.toLocaleString()}</span>
            </div>
          </div>

          {/* ── Pay button ── */}
          <button
            type="submit"
            disabled={processing}
            style={{ width: '100%', height: 50, borderRadius: 12, border: 'none', background: `linear-gradient(135deg, ${activePlan.color}, ${activePlan.color}CC)`, color: '#fff', fontSize: 15, fontWeight: 700, cursor: processing ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: `0 6px 20px ${activePlan.color}35`, transition: 'transform 0.15s, box-shadow 0.2s' }}
            onMouseEnter={e => { if (!processing) e.currentTarget.style.boxShadow = `0 10px 28px ${activePlan.color}50`; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 6px 20px ${activePlan.color}35`; }}
            onMouseDown={e => { if (!processing) e.currentTarget.style.transform = 'scale(0.97)'; }}
            onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            {processing ? (
              <span style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
            ) : (
              <>
                <Lock size={14} />
                Pay ₹{total.toLocaleString()}{activePlan.period !== 'one-time' ? ` / ${billingLabel}` : ''}
              </>
            )}
          </button>

          <p style={{ textAlign: 'center', fontSize: 11, color: '#C4C9D4', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 10 }}>
            <Lock size={10} /> Secured by 256-bit SSL encryption
          </p>
        </form>
        </div>
      </div>
      </div>
    </div>
  );
}

export default function PlanSelection({ email, onSelectPlan, onBack, onCancel, onProcessingStart, backText = 'Back to login' }) {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [checkoutPlan, setCheckoutPlan] = useState(null);
  const [showCustomize, setShowCustomize] = useState(false);

  const handlePlanSelect = (plan) => {
    if (plan.isCustom) { setShowCustomize(true); return; }
    setSelectedPlan(plan.id);
    setCheckoutPlan(plan);
  };

  const handleCheckoutConfirm = (couponInfo) => onSelectPlan(checkoutPlan, billingCycle, couponInfo);

  const getPrice = (plan) => {
    if (plan.period === 'one-time') return plan.price;
    if (billingCycle === 'yearly') return Math.round(plan.price * 12 * 0.8);
    return plan.price;
  };

  if (checkoutPlan) {
    return (
      <CheckoutStep
        plan={checkoutPlan}
        billingCycle={billingCycle}
        email={email}
        onBack={() => { setCheckoutPlan(null); setSelectedPlan(null); }}
        onConfirm={handleCheckoutConfirm}
        onCancel={onCancel}
      />
    );
  }

  return (
    <div className="plan-selection-enter" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch', padding: '20px 32px 20px', overflow: 'hidden', position: 'relative' }}>
      {/* Background video */}
      <video
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_015952_e1deeb12-8fb7-4071-a42a-60779fc64ab6.mp4"
        autoPlay
        muted
        loop
        playsInline
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
      />
      {/* Overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(240,242,248,0.55)', zIndex: 1, pointerEvents: 'none' }} />
      {/* Content above video */}
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* Header left + Toggle center — same row */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14, width: '100%', flexShrink: 0 }}>
        {/* Left: header */}
        <div style={{ flex: 1 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: 12, fontWeight: 600, cursor: 'pointer', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}>
            ← {backText}
          </button>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1A1D2E', letterSpacing: '-0.8px', lineHeight: 1.2, marginBottom: 3 }}>Choose Your Plan</h2>
          <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 1 }}>Select the perfect plan for your team</p>
          <p style={{ fontSize: 11, color: '#6B7280' }}>Logged in as: <span style={{ fontWeight: 600, color: '#3B5BFC' }}>{email}</span></p>
        </div>
        {/* Center: toggle */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: billingCycle === 'monthly' ? '#1A1D2E' : '#9CA3AF' }}>Monthly</span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            style={{ width: 48, height: 26, borderRadius: 13, background: billingCycle === 'yearly' ? 'linear-gradient(135deg, #3B5BFC, #7C3AED)' : '#E5E7EB', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.3s ease' }}
          >
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: billingCycle === 'yearly' ? 25 : 3, transition: 'left 0.3s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
          </button>
          <span style={{ fontSize: 13, fontWeight: 600, color: billingCycle === 'yearly' ? '#1A1D2E' : '#9CA3AF' }}>
            Yearly
            <span style={{ marginLeft: 5, fontSize: 10, fontWeight: 700, color: '#12C479', background: '#ECFDF5', padding: '2px 5px', borderRadius: 4 }}>Save 20%</span>
          </span>
        </div>
        {/* Right: spacer */}
        <div style={{ flex: 1 }} />
      </div>

      {/* Plans Grid */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', alignItems: 'stretch', alignContent: 'center', width: '100%', flex: 1 }}>
        {PLANS.map((plan) => {
          const price = getPrice(plan);
          const isSelected = selectedPlan === plan.id;

          if (plan.isCustom) {
            return (
              <div
                key={plan.id}
                onClick={() => handlePlanSelect(plan)}
                style={{ background: 'linear-gradient(135deg, #FDF2F8 0%, #FCE7F3 50%, #FFF1F2 100%)', borderRadius: 16, padding: '18px 16px', border: `2px dashed ${plan.color}`, cursor: 'pointer', position: 'relative', transition: 'all 0.2s ease', width: 'calc(33.33% - 8px)', minWidth: 160, boxSizing: 'border-box', transform: isSelected ? 'scale(1.02)' : 'scale(1)', boxShadow: isSelected ? `0 8px 24px ${plan.color}30` : '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'; e.currentTarget.style.boxShadow = `0 12px 32px ${plan.color}40`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}
              >
                <div style={{ position: 'absolute', top: -9, right: 16, background: `linear-gradient(135deg, ${plan.color}, #F43F5E)`, color: '#fff', fontSize: 9, fontWeight: 700, padding: '3px 10px', borderRadius: 10, boxShadow: `0 4px 12px ${plan.color}50` }}>ENTERPRISE</div>
                <div style={{ marginBottom: 12, textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: `linear-gradient(135deg, ${plan.color}, #F43F5E)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', boxShadow: `0 8px 20px ${plan.color}40` }}>
                    <Mail size={24} color="#fff" />
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: '#1A1D2E', marginBottom: 3 }}>{plan.name}</h3>
                  <div style={{ marginBottom: 4 }}>
                    <span style={{ fontSize: 24, fontWeight: 800, background: `linear-gradient(135deg, ${plan.color}, #F43F5E)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '-0.5px' }}>Let's Talk</span>
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 10 }}>Tailored for your needs</p>
                </div>
                <button
                  style={{ width: '100%', height: 38, borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${plan.color}, #F43F5E)`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', marginTop: 'auto', boxShadow: `0 4px 12px ${plan.color}40`, transition: 'transform 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  Contact Sales
                </button>
              </div>
            );
          }

          return (
            <div
              key={plan.id}
              onClick={() => handlePlanSelect(plan)}
              style={{ background: '#fff', borderRadius: 16, padding: '18px 16px', border: `2px solid ${isSelected ? plan.color : '#E5E7EB'}`, cursor: 'pointer', position: 'relative', transition: 'all 0.2s ease', width: 'calc(33.33% - 8px)', minWidth: 160, boxSizing: 'border-box', transform: isSelected ? 'scale(1.02)' : 'scale(1)', boxShadow: isSelected ? `0 8px 24px ${plan.color}30` : '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}
              onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor = plan.color; e.currentTarget.style.transform = 'translateY(-3px)'; } }}
              onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.transform = 'translateY(0)'; } }}
            >
              {plan.popular && (
                <div style={{ position: 'absolute', top: -9, right: 16, background: 'linear-gradient(135deg, #3B5BFC, #7C3AED)', color: '#fff', fontSize: 9, fontWeight: 700, padding: '3px 10px', borderRadius: 10, boxShadow: '0 4px 12px rgba(59,91,252,0.3)' }}>POPULAR</div>
              )}
              <div style={{ marginBottom: 10 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1D2E', marginBottom: 3 }}>{plan.name}</h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 4 }}>
                  <span style={{ fontSize: 28, fontWeight: 800, color: plan.color, letterSpacing: '-1px' }}>₹{price.toLocaleString()}</span>
                  {plan.period !== 'one-time' && (
                    <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>/{billingCycle === 'yearly' ? 'yr' : 'mo'}</span>
                  )}
                </div>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 10 }}>
                  {plan.id === 'lifetime' ? '♾ Unlimited team members' : `Up to ${plan.users}${typeof plan.users === 'number' ? ' users' : ''}`}
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, flex: 1 }}>
                {plan.features.map((feature, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: `${plan.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Check size={10} color={plan.color} strokeWidth={3} />
                    </div>
                    <span style={{ fontSize: 12, color: '#4B5563' }}>{feature}</span>
                  </div>
                ))}
              </div>
              <button
                style={{ width: '100%', height: 38, borderRadius: 10, border: 'none', background: isSelected ? plan.color : `${plan.color}12`, color: isSelected ? '#fff' : plan.color, fontSize: 13, fontWeight: 700, cursor: 'pointer', marginTop: 14, transition: 'all 0.2s', flexShrink: 0 }}
                onMouseEnter={e => { e.currentTarget.style.background = plan.color; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = isSelected ? plan.color : `${plan.color}12`; e.currentTarget.style.color = isSelected ? '#fff' : plan.color; }}
              >
                {isSelected ? 'Selected' : 'Select Plan'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Customize Modal */}
      {showCustomize && (
        <div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setShowCustomize(false)}
        >
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, padding: '32px', maxWidth: 500, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <h3 style={{ fontSize: 24, fontWeight: 800, color: '#1A1D2E', marginBottom: 12 }}>Contact Our Sales Team</h3>
            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24 }}>Send us your requirements and we'll get back to you within 24 hours.</p>
            <input type="email" placeholder="Your email" defaultValue={email} style={{ width: '100%', height: 48, borderRadius: 10, border: '1.5px solid #E5E7EB', padding: '0 16px', fontSize: 14, marginBottom: 12, outline: 'none' }} />
            <textarea placeholder="Tell us about your requirements..." style={{ width: '100%', height: 120, borderRadius: 10, border: '1.5px solid #E5E7EB', padding: '12px 16px', fontSize: 14, marginBottom: 16, outline: 'none', resize: 'none', fontFamily: 'inherit' }} />
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowCustomize(false)} style={{ flex: 1, height: 44, borderRadius: 10, border: '1.5px solid #E5E7EB', background: '#fff', color: '#6B7280', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => { alert('Thank you! We will contact you soon.'); setShowCustomize(false); }} style={{ flex: 1, height: 44, borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #3B5BFC, #7C3AED)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Send Request</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

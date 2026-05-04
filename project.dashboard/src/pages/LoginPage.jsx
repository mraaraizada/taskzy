import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { USERS } from '../context/AppContext';
import PlanSelection from '../components/PlanSelection';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { useLottie } from 'lottie-react';
import emailSentAnimation from '../lottie/Email Sent by Todd Rocheford.json';
import loginAnimation from '../lottie/Login.json';
import carouselE from '../assets/carousel-e.png';
import carouselG from '../assets/carousel-g.png';
import carouselJ from '../assets/carousel-j.png';
import carouselQ from '../assets/carousel-q.png';
import carouselZ from '../assets/carousel-z.png';

const portfolioSlides = [
  { imageUrl: carouselE },
  { imageUrl: carouselG },
  { imageUrl: carouselJ },
  { imageUrl: carouselQ },
  { imageUrl: carouselZ },
];

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.027 4.389 11.022 10.125 11.927v-8.434H7.078v-3.493h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.493h-2.796v8.434C19.612 23.095 24 18.1 24 12.073z"/>
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#1DA1F2">
      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="url(#ig-gradient)">
      <defs>
        <linearGradient id="ig-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f09433"/>
          <stop offset="25%" stopColor="#e6683c"/>
          <stop offset="50%" stopColor="#dc2743"/>
          <stop offset="75%" stopColor="#cc2366"/>
          <stop offset="100%" stopColor="#bc1888"/>
        </linearGradient>
      </defs>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  );
}

const slideAnimStyle = `
@keyframes slideContentIn {
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 1; transform: translateY(0); }
}
.slide-content-anim {}
@keyframes formSlideIn {
  from { opacity: 1; transform: scale(1); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes formSlideInLeft {
  from { opacity: 1; transform: scale(1); }
  to   { opacity: 1; transform: scale(1); }
}
.form-enter {}
.form-enter-left {}
`;

function EmailSentLottie() {
  const { View, animationItem } = useLottie({
    animationData: emailSentAnimation,
    loop: false,
    autoplay: true,
  });

  useEffect(() => {
    if (!animationItem) return;

    let phase = 1; // phase 1: play 0→124, phase 2: play 0→2 then stop

    const onEnterFrame = () => {
      try {
        if (phase === 1 && animationItem.currentFrame >= 124) {
          phase = 2;
          animationItem.goToAndPlay(0, true);
        } else if (phase === 2 && animationItem.currentFrame >= 30) {
          animationItem.goToAndStop(30, true);
        }
      } catch {}
    };

    animationItem.addEventListener('enterFrame', onEnterFrame);
    return () => {
      try { animationItem.removeEventListener('enterFrame', onEnterFrame); } catch {}
    };
  }, [animationItem]);

  return <div style={{ width: 120, height: 120, pointerEvents: 'none' }}>{View}</div>;
}

function LoginLottie() {
  const { View } = useLottie({
    animationData: loginAnimation,
    loop: true,
    autoplay: true,
    style: { width: '100%', height: '100%', objectFit: 'contain' },
  });
  return View;
}

export default function LoginPage({ onLogin }) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [passFocus, setPassFocus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPlanSelection, setShowPlanSelection] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [carouselApi, setCarouselApi] = useState(null);

  const slide = portfolioSlides[slideIndex];

  // Update slideIndex when carousel changes
  useEffect(() => {
    if (!carouselApi) return;

    carouselApi.on('select', () => {
      setSlideIndex(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi]);

  // Auto-play functionality
  useEffect(() => {
    if (!carouselApi) return;

    const autoplay = setInterval(() => {
      carouselApi.scrollNext();
    }, 3500);

    return () => clearInterval(autoplay);
  }, [carouselApi]);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Auto-fill admin credentials if fields are empty
    const loginEmail = email.trim() || 'admin@taskzy.io';
    const loginPassword = password || 'admin123';
    
    setTimeout(() => {
      const match = USERS.find(u => u.email === loginEmail.toLowerCase() && u.password === loginPassword);
      if (match) {
        setLoading(false);
        // Go directly to dashboard without plan selection
        onLogin(match.role, match.memberId, match.email);
      } else {
        setLoading(false);
        setError('Invalid email or password. Please try again.');
      }
    }, 900);
  };

  const handlePlanSelect = (plan, billingCycle) => {
    console.log('Selected plan:', plan, 'Billing:', billingCycle);
    // Proceed with login after plan selection
    setTimeout(() => {
      onLogin(authenticatedUser.role, authenticatedUser.memberId, authenticatedUser.email);
    }, 300);
  };

  const handleBackToLogin = () => {
    setShowPlanSelection(false);
    setAuthenticatedUser(null);
    setPassword('');
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
    setForgotEmail(email);
    setForgotError('');
    setForgotSuccess('');
    setOtpSent(false);
    setOtp('');
  };

  const handleSendOTP = (e) => {
    e.preventDefault();
    setForgotError('');
    
    // Check if email exists
    const userExists = USERS.find(u => u.email === forgotEmail.trim().toLowerCase());
    if (!userExists) {
      setForgotError('Email not found in our system.');
      return;
    }

    // Simulate sending OTP
    setOtpSent(true);
    setForgotSuccess(`OTP sent to ${forgotEmail}. Demo OTP: 123456`);
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    setForgotError('');
    
    // Demo OTP verification (in real app, verify with backend)
    if (otp === '123456') {
      setOtpVerified(true);
      setForgotSuccess('OTP verified successfully!');
      setTimeout(() => setForgotSuccess(''), 2000);
    } else {
      setForgotError('Invalid OTP. Please try again.');
    }
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    setForgotError('');

    // Validation
    if (newPassword.length < 6) {
      setForgotError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match.');
      return;
    }

    // Simulate password reset
    setForgotSuccess('Password updated successfully! Redirecting to login...');
    setTimeout(() => {
      setShowForgotPassword(false);
      setOtpSent(false);
      setOtpVerified(false);
      setOtp('');
      setForgotEmail('');
      setNewPassword('');
      setConfirmPassword('');
      setForgotSuccess('');
    }, 2000);
  };

  const handleBackToLoginForm = () => {
    setShowForgotPassword(false);
    setOtpSent(false);
    setOtpVerified(false);
    setOtp('');
    setForgotEmail('');
    setForgotError('');
    setForgotSuccess('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // Carousel autoplay — no unused variables needed

  return (
    <>
    <style>{slideAnimStyle}</style>
    <style>{`
      .login-panel-right {
        transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s ease;
      }
      .login-panel-right.slide-out {
        transform: translateX(-100%);
        opacity: 0;
      }
      .plan-selection-enter {
        animation: slideInFromRight 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      }
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
    `}</style>
    <div
      className="flex login-enter"
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
        background: '#fff',
      }}
    >
        {/* ─── LEFT: Visual Panel with Carousel ─── */}
        <div className="login-panel-left" style={{ width: '46%', height: '100%', flexShrink: 0 }}>
        <Carousel
          opts={{
            loop: true,
          }}
          setApi={setCarouselApi}
        >
          <CarouselContent style={{ height: '100vh', marginLeft: 0, display: 'flex' }}>
            {portfolioSlides.map((slideData, index) => (
              <CarouselItem key={index} style={{ height: '100vh', paddingLeft: 0, minWidth: '100%', flexShrink: 0 }}>
                <div
                  style={{
                    height: '100vh',
                    width: '100%',
                    backgroundImage: `url(${slideData.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  }}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        </div>

        {/* ─── RIGHT: Login Form or Plan Selection ─── */}
        <div
          className="login-panel-right flex items-center justify-center flex-1"
          style={{
            padding: showPlanSelection ? 0 : '32px 56px',
            height: '100%',
            position: 'relative',
          }}
        >
          {/* Background video */}
          <video
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_015952_e1deeb12-8fb7-4071-a42a-60779fc64ab6.mp4"
            autoPlay
            muted
            loop
            playsInline
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 0,
            }}
          />
          {/* Overlay to keep form readable */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(240,242,248,0.55)',
            zIndex: 1,
            pointerEvents: 'none',
          }} />
          
          {!showPlanSelection ? (
            <>
          {/* Top nav — absolute so it doesn't affect centering */}
          <div className="flex items-center" style={{ position: 'absolute', top: 32, left: 56, zIndex: 12 }}>
            <div className="flex items-center gap-2">
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: 'linear-gradient(135deg, #3B5BFC, #7C3AED)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(59,91,252,0.35)',
              }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8L7 4L11 8L7 12L3 8Z" fill="white" opacity="0.7"/>
                  <path d="M7 4L11 8L13 6L9 2L7 4Z" fill="white"/>
                </svg>
              </div>
              <span style={{ fontWeight: 800, fontSize: 17, color: '#1A1D2E', letterSpacing: '-0.3px' }}>
                Taskzy
              </span>
            </div>
          </div>

          {/* Form section — centered */}
          <div className="login-form-card" style={{
            maxWidth: 520, width: '100%', margin: '0 auto',
            background: '#fff', borderRadius: 24,
            position: 'relative', zIndex: 2,
            padding: '28px 40px 24px',
            boxShadow: '0 4px 32px rgba(59,91,252,0.08), 0 1px 4px rgba(0,0,0,0.04)',
            border: '1px solid rgba(255,255,255,0.9)',
          }}>
            {!showForgotPassword ? (
              <>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: '#1A1D2E',
                letterSpacing: '-1px',
                lineHeight: 1.1,
                marginBottom: 4,
              }}
            >
              Welcome Admin 👋
            </h1>
            <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 16 }}>
              Sign in to your admin account
            </p>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Login Lottie Animation */}
              <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0 16px' }}>
                <div style={{ width: 200, height: 200 }}>
                  <LoginLottie />
                </div>
              </div>
              {/* Email */}
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocus(true)}
                  onBlur={() => setEmailFocus(false)}
                  style={{
                    width: '100%',
                    height: 48,
                    borderRadius: 10,
                    border: `1.5px solid ${emailFocus ? '#3B5BFC' : '#E5E7EB'}`,
                    padding: '0 16px',
                    fontSize: 14,
                    color: '#1A1D2E',
                    outline: 'none',
                    background: emailFocus ? '#F5F7FF' : '#FAFBFF',
                    transition: 'border-color 0.2s, background 0.2s',
                    boxShadow: emailFocus ? '0 0 0 3px rgba(59,91,252,0.10)' : 'none',
                  }}
                />
              </div>

              {/* Password */}
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPassFocus(true)}
                  onBlur={() => setPassFocus(false)}
                  style={{
                    width: '100%',
                    height: 48,
                    borderRadius: 10,
                    border: `1.5px solid ${passFocus ? '#3B5BFC' : '#E5E7EB'}`,
                    padding: '0 44px 0 16px',
                    fontSize: 14,
                    color: '#1A1D2E',
                    outline: 'none',
                    background: passFocus ? '#F5F7FF' : '#FAFBFF',
                    transition: 'border-color 0.2s, background 0.2s',
                    boxShadow: passFocus ? '0 0 0 3px rgba(59,91,252,0.10)' : 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute',
                    right: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    color: '#9CA3AF',
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Forgot */}
              <div style={{ textAlign: 'right', marginTop: -6 }}>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#3B5BFC',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Forgot password ?
                </button>
              </div>

              {/* Error */}
              {error && (
                <div style={{ background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#DC2626', fontWeight: 500 }}>
                  {error}
                </div>
              )}

              {/* Login CTA */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  height: 50,
                  borderRadius: 12,
                  border: 'none',
                  background: 'linear-gradient(135deg, #3B5BFC 0%, #2142D9 100%)',
                  color: '#fff',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: loading ? 'default' : 'pointer',
                  transition: 'transform 0.15s, box-shadow 0.2s',
                  boxShadow: '0 6px 20px rgba(59,91,252,0.35)',
                  letterSpacing: '0.3px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.boxShadow = '0 10px 28px rgba(59,91,252,0.45)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(59,91,252,0.35)'; }}
                onMouseDown={(e) => { if (!loading) e.currentTarget.style.transform = 'scale(0.96)'; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                {loading ? (
                  <>
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        border: '2.5px solid rgba(255,255,255,0.4)',
                        borderTopColor: '#fff',
                        borderRadius: '50%',
                        display: 'inline-block',
                        animation: 'spin 0.7s linear infinite',
                      }}
                    />
                    Logging in…
                  </>
                ) : (
                  'Login'
                )}
              </button>
            </form>
            </>
            ) : (
              <>
                {/* Forgot Password UI */}
                <div style={{ marginBottom: 20 }}>
                  <button
                    onClick={handleBackToLoginForm}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#6B7280',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      marginBottom: 16,
                    }}
                  >
                    <ChevronLeft size={16} /> Back to login
                  </button>
                  <h1
                    style={{
                      fontSize: 28,
                      fontWeight: 800,
                      color: '#1A1D2E',
                      letterSpacing: '-0.8px',
                      lineHeight: 1.1,
                      marginBottom: 6,
                    }}
                  >
                    {otpVerified ? 'Reset Password' : otpSent ? 'Verify OTP' : 'Forgot Password?'}
                  </h1>
                  <p style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 20 }}>
                    {otpVerified 
                      ? 'Enter your new password' 
                      : otpSent 
                        ? 'Enter the 6-digit code sent to your email' 
                        : 'Enter your email to receive a verification code'}
                  </p>
                </div>

                {!otpSent ? (
                  <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="email"
                        placeholder="Email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          height: 48,
                          borderRadius: 10,
                          border: '1.5px solid #E5E7EB',
                          padding: '0 16px',
                          fontSize: 14,
                          color: '#1A1D2E',
                          outline: 'none',
                          background: '#FAFBFF',
                        }}
                      />
                    </div>

                    {forgotError && (
                      <div style={{ background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#DC2626', fontWeight: 500 }}>
                        {forgotError}
                      </div>
                    )}

                    {forgotSuccess && (
                      <div style={{ background: '#F0FDF4', border: '1.5px solid #BBF7D0', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#16A34A', fontWeight: 500 }}>
                        {forgotSuccess}
                      </div>
                    )}

                    <button
                      type="submit"
                      style={{
                        width: '100%',
                        height: 50,
                        borderRadius: 12,
                        border: 'none',
                        background: 'linear-gradient(135deg, #3B5BFC 0%, #2142D9 100%)',
                        color: '#fff',
                        fontSize: 15,
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'transform 0.15s, box-shadow 0.2s',
                        boxShadow: '0 6px 20px rgba(59,91,252,0.35)',
                        letterSpacing: '0.3px',
                      }}
                    >
                      Send OTP
                    </button>
                  </form>
                ) : !otpVerified ? (
                  <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                      <InputOTP 
                        maxLength={6} 
                        value={otp}
                        onChange={(value) => setOtp(value)}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                      
                      <p style={{ fontSize: 12, color: '#6B7280', textAlign: 'center' }}>
                        Sent to: <span style={{ fontWeight: 600, color: '#1A1D2E' }}>{forgotEmail}</span>
                      </p>
                    </div>

                    {forgotError && (
                      <div style={{ background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#DC2626', fontWeight: 500 }}>
                        {forgotError}
                      </div>
                    )}

                    {forgotSuccess && (
                      <div style={{ background: '#F0FDF4', border: '1.5px solid #BBF7D0', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#16A34A', fontWeight: 500 }}>
                        {forgotSuccess}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={otp.length !== 6}
                      style={{
                        width: '100%',
                        height: 50,
                        borderRadius: 12,
                        border: 'none',
                        background: otp.length === 6 ? 'linear-gradient(135deg, #3B5BFC 0%, #2142D9 100%)' : '#E5E7EB',
                        color: '#fff',
                        fontSize: 15,
                        fontWeight: 700,
                        cursor: otp.length === 6 ? 'pointer' : 'not-allowed',
                        transition: 'transform 0.15s, box-shadow 0.2s',
                        boxShadow: otp.length === 6 ? '0 6px 20px rgba(59,91,252,0.35)' : 'none',
                        letterSpacing: '0.3px',
                      }}
                    >
                      Verify OTP
                    </button>

                    <button
                      type="button"
                      onClick={handleSendOTP}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#3B5BFC',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      Resend OTP
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {/* New Password */}
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          height: 48,
                          borderRadius: 10,
                          border: '1.5px solid #E5E7EB',
                          padding: '0 44px 0 16px',
                          fontSize: 14,
                          color: '#1A1D2E',
                          outline: 'none',
                          background: '#FAFBFF',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        style={{
                          position: 'absolute',
                          right: 14,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0,
                          color: '#9CA3AF',
                        }}
                      >
                        {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {/* Confirm Password */}
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showConfirmPass ? 'text' : 'password'}
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          height: 48,
                          borderRadius: 10,
                          border: '1.5px solid #E5E7EB',
                          padding: '0 44px 0 16px',
                          fontSize: 14,
                          color: '#1A1D2E',
                          outline: 'none',
                          background: '#FAFBFF',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        style={{
                          position: 'absolute',
                          right: 14,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0,
                          color: '#9CA3AF',
                        }}
                      >
                        {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {/* Password requirements */}
                    <div style={{ background: '#F0F4FF', border: '1.5px solid #C7D4FF', borderRadius: 10, padding: '10px 14px' }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#3B5BFC', marginBottom: 4 }}>Password Requirements:</p>
                      <ul style={{ fontSize: 11, color: '#6B7280', margin: 0, paddingLeft: 20 }}>
                        <li>At least 6 characters long</li>
                        <li>Both passwords must match</li>
                      </ul>
                    </div>

                    {forgotError && (
                      <div style={{ background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#DC2626', fontWeight: 500 }}>
                        {forgotError}
                      </div>
                    )}

                    {forgotSuccess && (
                      <div style={{ background: '#F0FDF4', border: '1.5px solid #BBF7D0', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#16A34A', fontWeight: 500 }}>
                        {forgotSuccess}
                      </div>
                    )}

                    <button
                      type="submit"
                      style={{
                        width: '100%',
                        height: 50,
                        borderRadius: 12,
                        border: 'none',
                        background: 'linear-gradient(135deg, #3B5BFC 0%, #2142D9 100%)',
                        color: '#fff',
                        fontSize: 15,
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'transform 0.15s, box-shadow 0.2s',
                        boxShadow: '0 6px 20px rgba(59,91,252,0.35)',
                        letterSpacing: '0.3px',
                      }}
                    >
                      Reset Password
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
          </>
          ) : (
            <PlanSelection 
              email={email} 
              onSelectPlan={handlePlanSelect}
              onBack={handleBackToLogin}
            />
          )}
        </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes caret-blink {
          0%, 70%, 100% { opacity: 1; }
          20%, 50% { opacity: 0; }
        }
        .animate-caret-blink {
          animation: caret-blink 1.2s ease-out infinite;
        }
      `}</style>
    </div>
    </>
  );
}

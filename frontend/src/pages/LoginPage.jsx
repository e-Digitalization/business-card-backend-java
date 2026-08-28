import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import BrandLogo from '../components/BrandLogo.jsx';
import api from '../services/api.js';

const loginAdverts = [
  {
    image: '/illustrations/compare-nfc.jpg',
    eyebrow: 'Kadi Moja NFC',
    title: 'One card. Every introduction.',
    text: 'Tap once in Dar, Arusha, or Zanzibar — your full profile opens on their phone.'
  },
  {
    image: '/illustrations/how-tap.jpg',
    eyebrow: 'No app needed',
    title: 'Works on iPhone & Android.',
    text: 'NFC opens your live digital card instantly. QR is ready when tap isn’t.'
  },
  {
    image: '/illustrations/how-share.jpg?v=3',
    eyebrow: 'Always current',
    title: 'Update without reprinting.',
    text: 'Change phone, title, or photo once. Every Kadi Moja tag stays up to date.'
  },
  {
    image: '/illustrations/how-saved.jpg',
    eyebrow: 'AI Scan',
    title: 'Paper cards, digitised.',
    text: 'Photograph a paper card — Kadi Moja reads the details and saves the contact.'
  }
];

/**
 * One login area for clients and admins.
 */
const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  const initialRole = location.state?.role === 'admin' ? 'admin' : 'account';
  const [role, setRole] = useState(initialRole);
  const [mode, setMode] = useState(location.state?.mode === 'signup' ? 'signup' : 'login');
  const [googleEnabled, setGoogleEnabled] = useState(Boolean(googleClientId));
  const [slide, setSlide] = useState(0);
  const [sliderPaused, setSliderPaused] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  // Sign-up is two steps: fill the form, then confirm the emailed OTP.
  const [signupStage, setSignupStage] = useState('form');
  const [otp, setOtp] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');

  const resetSignupFlow = () => {
    setSignupStage('form');
    setOtp('');
    setPendingEmail('');
    setInfo('');
    setError('');
  };

  const isOtpStep = role === 'account' && mode === 'signup' && signupStage === 'otp';

  const fromPath = location.state?.from?.pathname || '';
  const fromAccount =
    fromPath.startsWith('/me') || fromPath.startsWith('/u/') ? fromPath : '/me';
  const fromAdmin = fromPath.startsWith('/admin') ? fromPath : '/admin/dashboard';

  useEffect(() => {
    if (location.state?.role === 'admin') setRole('admin');
    if (location.state?.mode === 'signup') {
      setRole('account');
      setMode('signup');
    }
  }, [location.state]);

  useEffect(() => {
    api
      .get('/api/auth/google/status')
      .then((res) => {
        const enabled = Boolean(res.data?.enabled);
        const apiId = res.data?.clientId || '';
        setGoogleEnabled(enabled && Boolean(apiId || googleClientId));
      })
      .catch(() => setGoogleEnabled(Boolean(googleClientId)));
  }, [googleClientId]);

  const finishClient = (data) => {
    localStorage.setItem('clientToken', data.token);
    localStorage.setItem('clientUser', JSON.stringify(data.user || {}));
    navigate(fromAccount, { replace: true });
  };

  const finishAdmin = (token) => {
    localStorage.setItem('adminToken', token);
    navigate(fromAdmin, { replace: true });
  };

  const onGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/api/auth/google', {
        idToken: credentialResponse.credential
      });
      finishClient(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const requestSignupCode = async () => {
    const response = await api.post('/api/auth/register', { fullName, email, password });
    const data = response.data || {};
    setPendingEmail(data.email || email.trim().toLowerCase());
    setSignupStage('otp');
    setOtp('');
    if (data.otpPreview) {
      setInfo(`Email delivery isn't configured yet — your code is ${data.otpPreview}`);
    } else {
      setInfo(`We sent a 6-digit code to ${data.email || email}. It expires in ${data.expiresInMinutes || 15} minutes.`);
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (role === 'admin') {
        const response = await api.post('/api/auth/login', { username, password });
        finishAdmin(response.data.token);
        return;
      }
      if (mode === 'signup') {
        if (signupStage === 'form') {
          if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
          }
          if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
          }
          setInfo('');
          await requestSignupCode();
        } else {
          const response = await api.post('/api/auth/register/verify', {
            email: pendingEmail,
            otp: otp.trim()
          });
          finishClient(response.data);
        }
        return;
      }
      const response = await api.post('/api/auth/client-login', { email, password });
      finishClient(response.data);
    } catch (err) {
      const status = err.response?.status;
      if (status === 409) setError('An account with this email already exists.');
      else if (status === 429) setError('Too many attempts. Request a new code.');
      else if (status === 401) {
        if (role === 'admin') setError('Invalid admin credentials.');
        else if (mode === 'signup') setError('Incorrect verification code.');
        else setError('Invalid email or password.');
      } else setError(err.response?.data?.message || 'Could not sign in.');
    } finally {
      setLoading(false);
    }
  };

  const resendSignupCode = async () => {
    setError('');
    setInfo('');
    setLoading(true);
    try {
      await requestSignupCode();
      setInfo('New code sent. Check your inbox.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not resend the code.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sliderPaused) return undefined;
    const timer = window.setInterval(() => {
      setSlide((i) => (i + 1) % loginAdverts.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [sliderPaused]);

  const active = loginAdverts[slide];
  const goSlide = (next) => {
    setSliderPaused(true);
    setSlide(next);
  };

  return (
    <div className="admin-login min-h-screen lg:grid lg:grid-cols-[1.08fr_0.92fr]">
      <aside className="km-login-showcase relative hidden overflow-hidden text-white lg:flex lg:flex-col">
        <div className="absolute inset-0 admin-login-hero" />
        <div className="km-login-orbit km-login-orbit-one" aria-hidden="true" />
        <div className="km-login-orbit km-login-orbit-two" aria-hidden="true" />
        <div className="relative z-10 flex h-full flex-col px-10 py-9 xl:px-16 xl:py-12">
          <div>
            <BrandLogo to="/" tone="light" textClassName="text-3xl" markClassName="h-10 w-10" />
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
              Your professional identity, ready to share anywhere.
            </p>
          </div>

          <div className="km-login-slider my-auto w-full max-w-xl">
            <div className="km-login-slider-media">
              {loginAdverts.map((item, index) => (
                <React.Fragment key={item.image}>
                  <img
                    src={item.image}
                    alt=""
                    aria-hidden="true"
                    className={`km-login-slider-img-backdrop ${index === slide ? 'is-active' : ''}`}
                  />
                  <img
                    src={item.image}
                    alt=""
                    className={`km-login-slider-img ${index === slide ? 'is-active' : ''}`}
                  />
                </React.Fragment>
              ))}
              <div className="km-login-slider-fade" aria-hidden="true" />
            </div>

            <div className="km-login-slider-body">
              <p className="km-login-slider-eyebrow">{active.eyebrow}</p>
              <p className="km-login-slider-title">{active.title}</p>
              <p className="km-login-slider-text">{active.text}</p>

              <div className="km-login-slider-nav">
                <div className="km-login-slider-dots" role="tablist" aria-label="Adverts">
                  {loginAdverts.map((item, index) => (
                    <button
                      key={item.image}
                      type="button"
                      role="tab"
                      aria-selected={index === slide}
                      aria-label={`Advert ${index + 1}`}
                      onClick={() => goSlide(index)}
                      className={`km-login-slider-dot ${index === slide ? 'is-active' : ''}`}
                    />
                  ))}
                </div>
                <div className="km-login-slider-arrows">
                  <button
                    type="button"
                    aria-label="Previous advert"
                    className="km-login-slider-arrow"
                    onClick={() => goSlide((slide - 1 + loginAdverts.length) % loginAdverts.length)}
                  >
                    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 4 6 10l6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    aria-label="Next advert"
                    className="km-login-slider-arrow"
                    onClick={() => goSlide((slide + 1) % loginAdverts.length)}
                  >
                    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m8 4 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-6 text-xs text-white/50">
            <p className="tracking-wide">Made for modern connections</p>
            <p className="hidden xl:block">Dar es Salaam · Arusha · Mwanza · Dodoma · Zanzibar</p>
          </div>
        </div>
      </aside>

      <main className="km-login-main relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10 sm:px-8">
        <div className="km-login-main-glow" aria-hidden="true" />
        <div className="relative z-10 w-full max-w-[29rem]">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <BrandLogo to="/" tone="color" textClassName="text-2xl" markClassName="h-9 w-9" />
            <Link to="/" className="text-sm font-medium text-[#0d7377]">
              Visit website
            </Link>
          </div>

          <div className="km-login-card">
            <div className="mb-8 flex rounded-xl bg-[#f3f1ec] p-1.5" role="tablist" aria-label="Sign in type">
              <button
                type="button"
                role="tab"
                aria-selected={role === 'account'}
                onClick={() => {
                  setRole('account');
                  resetSignupFlow();
                }}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                  role === 'account' ? 'bg-white text-[#0d7377] shadow-[0_3px_12px_rgba(26,61,66,0.08)]' : 'text-[#1a3d42]/50 hover:text-[#1a3d42]/75'
                }`}
              >
                My account
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={role === 'admin'}
                onClick={() => {
                  setRole('admin');
                  setMode('login');
                  resetSignupFlow();
                }}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                  role === 'admin' ? 'bg-white text-[#0d7377] shadow-[0_3px_12px_rgba(26,61,66,0.08)]' : 'text-[#1a3d42]/50 hover:text-[#1a3d42]/75'
                }`}
              >
                Admin
              </button>
            </div>

            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#b1784c]">
              {role === 'admin' ? 'Administration' : isOtpStep ? 'Almost there' : mode === 'signup' ? 'Join Kadi Moja' : 'Welcome back'}
            </p>
            <h1 className="font-display text-[2rem] font-semibold leading-tight tracking-[-0.03em] text-[#1a3d42]">
              {role === 'admin'
                ? 'Admin sign in'
                : isOtpStep
                  ? 'Verify your email'
                  : mode === 'signup'
                    ? 'Create account'
                    : 'Karibu tena'}
            </h1>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#1a3d42]/55">
              {role === 'admin'
                ? 'Manage digital cards and NFC tags.'
                : isOtpStep
                  ? 'We emailed you a one-time code to confirm this address.'
                  : 'Sign in to edit your card, scan cards, and manage contacts.'}
            </p>

            {role === 'account' && googleEnabled && mode === 'login' && (
              <div className="km-google-login mt-6 flex justify-center">
                <GoogleLogin
                  onSuccess={onGoogleSuccess}
                  onError={() => setError('Google sign-in was cancelled.')}
                  useOneTap={false}
                  text="signin_with"
                  shape="rectangular"
                  width="360"
                />
              </div>
            )}

            {role === 'account' && googleEnabled && !isOtpStep && (
              <div className="my-6 flex items-center gap-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#1a3d42]/35">
                <span className="h-px flex-1 bg-black/10" />
                or continue with email
                <span className="h-px flex-1 bg-black/10" />
              </div>
            )}

            <form onSubmit={onSubmit} className={`space-y-5 ${role === 'account' && googleEnabled && !isOtpStep ? '' : 'mt-7'}`}>
              {isOtpStep ? (
                <>
                  <div className="rounded-lg border border-black/10 bg-[#f7f4ef] px-3.5 py-3 text-sm text-[#1a3d42]/70">
                    Enter the 6-digit code sent to{' '}
                    <span className="font-semibold text-[#1a3d42]">{pendingEmail}</span>.
                  </div>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-[#1a3d42]/75">Verification code</span>
                    <input
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="123456"
                      className="admin-input text-center text-lg font-semibold tracking-[0.4em]"
                    />
                  </label>
                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      className="font-semibold text-[#0d7377] hover:underline disabled:opacity-50"
                      onClick={resendSignupCode}
                      disabled={loading}
                    >
                      Resend code
                    </button>
                    <button
                      type="button"
                      className="text-[#1a3d42]/55 hover:text-[#1a3d42] hover:underline"
                      onClick={resetSignupFlow}
                    >
                      Use a different email
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {role === 'account' && mode === 'signup' && (
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-[#1a3d42]/75">Full name</span>
                      <input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="admin-input"
                        placeholder="Japhari Mbaru"
                      />
                    </label>
                  )}

                  {role === 'account' ? (
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-[#1a3d42]/75">Email address</span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="admin-input"
                        placeholder="you@email.com"
                      />
                    </label>
                  ) : (
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-[#1a3d42]/75">Username</span>
                      <input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="admin-input"
                        autoComplete="username"
                      />
                    </label>
                  )}

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-[#1a3d42]/75">Password</span>
                    <div className="admin-input-wrap">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={role === 'account' ? 6 : 1}
                        className="w-full bg-transparent outline-none"
                        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="rounded px-1 text-xs font-bold text-[#9a6b45] hover:text-[#74492c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9a6b45]/30"
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </label>

                  {role === 'account' && mode === 'signup' && (
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-[#1a3d42]/75">Confirm password</span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        className={`admin-input ${
                          confirmPassword && confirmPassword !== password ? 'border-rose-300' : ''
                        }`}
                        autoComplete="new-password"
                      />
                      {confirmPassword && confirmPassword !== password && (
                        <span className="mt-1 block text-xs text-rose-500">Passwords do not match.</span>
                      )}
                    </label>
                  )}
                </>
              )}

              {info && (
                <p className="rounded-lg border border-emerald-100 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700">{info}</p>
              )}
              {error && (
                <p role="alert" className="rounded-lg border border-rose-100 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="km-login-submit w-full rounded-lg py-3.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? 'Please wait…'
                  : role === 'admin'
                    ? 'Ingia / Admin sign in'
                    : mode === 'signup'
                      ? isOtpStep
                        ? 'Verify & create account'
                        : 'Send verification code'
                      : 'Sign in'}
              </button>
            </form>

            {role === 'account' && !isOtpStep && (
              <p className="mt-6 text-center text-sm text-[#1a3d42]/55">
                {mode === 'signup' ? 'Already have an account?' : 'New to Kadi Moja?'}{' '}
                <button
                  type="button"
                  className="font-semibold text-[#0d7377] hover:underline"
                  onClick={() => {
                    setMode((m) => (m === 'signup' ? 'login' : 'signup'));
                    resetSignupFlow();
                  }}
                >
                  {mode === 'signup' ? 'Sign in' : 'Create account'}
                </button>
              </p>
            )}
          </div>

          <p className="mt-7 hidden text-center lg:block">
            <Link to="/" className="group inline-flex items-center gap-2 text-sm font-medium text-[#1a3d42]/55 transition hover:text-[#0d7377]">
              <span className="transition-transform group-hover:-translate-x-1">←</span>
              Back to website
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;

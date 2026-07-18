import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import BrandLogo from '../components/BrandLogo.jsx';
import api from '../services/api.js';

const loginAdverts = [
  {
    image: '/kadi-moja-hero-card.png',
    eyebrow: 'Kadi Moja NFC',
    title: 'One card. Every introduction.',
    text: 'Tap once in Dar, Arusha, or Zanzibar — your full profile opens on their phone.'
  },
  {
    image: '/illustrations/how-tap.png',
    eyebrow: 'No app needed',
    title: 'Works on iPhone & Android.',
    text: 'NFC opens your live digital card instantly. QR is ready when tap isn’t.'
  },
  {
    image: '/illustrations/how-share.png?v=3',
    eyebrow: 'Always current',
    title: 'Update without reprinting.',
    text: 'Change phone, title, or photo once. Every Kadi Moja tag stays up to date.'
  },
  {
    image: '/illustrations/how-saved.png',
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
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState(role === 'admin' ? 'admin123' : '');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
        const response = await api.post('/api/auth/register', { fullName, email, password });
        finishClient(response.data);
      } else {
        const response = await api.post('/api/auth/client-login', { email, password });
        finishClient(response.data);
      }
    } catch (err) {
      const status = err.response?.status;
      if (status === 409) setError('An account with this email already exists.');
      else if (status === 401) setError(role === 'admin' ? 'Invalid admin credentials.' : 'Invalid email or password.');
      else setError(err.response?.data?.message || 'Could not sign in.');
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
    <div className="admin-login min-h-screen grid lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden lg:flex lg:flex-col text-white">
        <div className="absolute inset-0 admin-login-hero" />
        <div className="relative z-10 flex h-full flex-col px-10 py-9">
          <div>
            <BrandLogo to="/" tone="light" textClassName="text-3xl" markClassName="h-10 w-10" />
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/75">
              One login for your digital card, contacts, and admin tools across Tanzania.
            </p>
          </div>

          <div className="km-login-slider my-auto w-full max-w-md">
            <div className="km-login-slider-media">
              {loginAdverts.map((item, index) => (
                <img
                  key={item.image}
                  src={item.image}
                  alt=""
                  className={`km-login-slider-img ${index === slide ? 'is-active' : ''}`}
                />
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

          <p className="text-xs tracking-wide text-white/45">
            Dar es Salaam · Arusha · Mwanza · Dodoma · Zanzibar
          </p>
        </div>
      </aside>

      <main className="flex items-center justify-center bg-[#f7f4ef] px-5 py-12">
        <div className="w-full max-w-md">
          <div className="mb-6 lg:hidden">
            <BrandLogo to="/" tone="color" textClassName="text-2xl" markClassName="h-9 w-9" />
          </div>

          <div className="rounded-xl border border-black/5 bg-white p-7 shadow-[0_24px_60px_rgba(26,61,66,0.08)] sm:p-9">
            <div className="mb-6 flex rounded-lg bg-[#f7f4ef] p-1">
              <button
                type="button"
                onClick={() => {
                  setRole('account');
                  setError('');
                }}
                className={`flex-1 rounded-md py-2.5 text-sm font-semibold transition ${
                  role === 'account' ? 'bg-white text-[#0d7377] shadow-sm' : 'text-[#1a3d42]/55'
                }`}
              >
                My account
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole('admin');
                  setMode('login');
                  setError('');
                }}
                className={`flex-1 rounded-md py-2.5 text-sm font-semibold transition ${
                  role === 'admin' ? 'bg-white text-[#0d7377] shadow-sm' : 'text-[#1a3d42]/55'
                }`}
              >
                Admin
              </button>
            </div>

            <h1 className="font-display text-2xl font-semibold text-[#1a3d42]">
              {role === 'admin' ? 'Admin sign in' : mode === 'signup' ? 'Create account' : 'Karibu tena'}
            </h1>
            <p className="mt-1 text-sm text-[#1a3d42]/55">
              {role === 'admin'
                ? 'Manage digital cards and NFC tags.'
                : 'Sign in to edit your card, scan cards, and manage contacts.'}
            </p>

            {role === 'account' && googleEnabled && mode === 'login' && (
              <div className="mt-5 flex justify-center">
                <GoogleLogin
                  onSuccess={onGoogleSuccess}
                  onError={() => setError('Google sign-in was cancelled.')}
                  useOneTap={false}
                  text="signin_with"
                  shape="rectangular"
                  width="320"
                />
              </div>
            )}

            {role === 'account' && googleEnabled && (
              <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-[0.14em] text-[#1a3d42]/35">
                <span className="h-px flex-1 bg-black/10" />
                or email
                <span className="h-px flex-1 bg-black/10" />
              </div>
            )}

            <form onSubmit={onSubmit} className={`space-y-4 ${role === 'account' && googleEnabled ? '' : 'mt-5'}`}>
              {role === 'account' && mode === 'signup' && (
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-[#1a3d42]/70">Full name</span>
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
                  <span className="mb-1 block text-sm font-medium text-[#1a3d42]/70">Email</span>
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
                  <span className="mb-1 block text-sm font-medium text-[#1a3d42]/70">Username</span>
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
                <span className="mb-1 block text-sm font-medium text-[#1a3d42]/70">Password</span>
                <div className="admin-input-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={role === 'account' ? 6 : 1}
                    className="w-full bg-transparent outline-none"
                    autoComplete={role === 'admin' ? 'current-password' : 'current-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-xs font-semibold text-[#9a6b45]"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </label>

              {error && (
                <p className="rounded-md border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-[#9a6b45] py-3.5 text-sm font-semibold text-white hover:bg-[#865c3b] disabled:opacity-60"
              >
                {loading
                  ? 'Please wait…'
                  : role === 'admin'
                    ? 'Ingia / Admin sign in'
                    : mode === 'signup'
                      ? 'Create account'
                      : 'Sign in'}
              </button>
            </form>

            {role === 'account' && (
              <p className="mt-5 text-center text-sm text-[#1a3d42]/55">
                {mode === 'signup' ? 'Already have an account?' : 'New to Kadi Moja?'}{' '}
                <button
                  type="button"
                  className="font-semibold text-[#0d7377] hover:underline"
                  onClick={() => {
                    setMode((m) => (m === 'signup' ? 'login' : 'signup'));
                    setError('');
                  }}
                >
                  {mode === 'signup' ? 'Sign in' : 'Create account'}
                </button>
              </p>
            )}

            {role === 'admin' && (
              <p className="mt-5 text-center text-xs text-[#1a3d42]/45">
                Default: <span className="font-medium text-[#1a3d42]/70">admin</span> /{' '}
                <span className="font-medium text-[#1a3d42]/70">admin123</span>
              </p>
            )}
          </div>

          <p className="mt-6 text-center">
            <Link to="/" className="text-sm text-[#0d7377] hover:underline">
              ← Back to website
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;

import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo.jsx';
import api from '../services/api.js';

const slides = [
  {
    image: '/kadi-moja-hero-card.png',
    eyebrow: 'Digital Card',
    title: 'One card. Every contact.',
    text: 'Share your profile instantly across Dar es Salaam, Arusha, and beyond.'
  },
  {
    image: '/illustrations/how-tap.png',
    eyebrow: 'NFC Tap',
    title: 'Tap once. Connect fast.',
    text: 'Physical NFC tags open a live digital business card—no app required.'
  },
  {
    image: '/illustrations/how-share.png',
    eyebrow: 'Share',
    title: 'Update without reprinting.',
    text: 'Change phone, title, or logo once. Every tag stays current.'
  },
  {
    image: '/illustrations/how-saved.png',
    eyebrow: 'Saved',
    title: 'Contacts that stick.',
    text: 'Recipients save your details in one tap and reach you on WhatsApp or call.'
  }
];

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [slide, setSlide] = useState(0);

  const from = location.state?.from?.pathname || '/admin/dashboard';

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSlide((i) => (i + 1) % slides.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/auth/login', { username, password });
      localStorage.setItem('adminToken', response.data.token);
      navigate(from, { replace: true });
    } catch (err) {
      if (!err.response) {
        setError('Cannot reach the API. Is the backend running on port 8080?');
      } else if (err.response.status === 401) {
        setError('Invalid username or password.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const active = slides[slide];

  return (
    <div className="admin-login min-h-screen grid lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden lg:flex lg:flex-col text-white">
        <div className="absolute inset-0 admin-login-hero" />

        <div className="relative z-10 flex h-full flex-col p-10">
          <BrandLogo to="/" tone="light" textClassName="text-3xl" markClassName="h-10 w-10" />
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/80">
            Manage digital business cards and NFC tags for professionals across Tanzania.
          </p>

          <div className="my-auto py-8">
            <div className="relative overflow-hidden rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-black/10">
                {slides.map((item, index) => (
                  <img
                    key={item.image}
                    src={item.image}
                    alt=""
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                      index === slide ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                ))}
              </div>

              <div className="mt-4 min-h-[96px]">
                <p className="text-xs uppercase tracking-[0.16em] text-white/55">{active.eyebrow}</p>
                <p className="mt-1.5 font-display text-xl font-semibold">{active.title}</p>
                <p className="mt-1.5 text-sm text-white/70">{active.text}</p>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="flex gap-1.5">
                  {slides.map((item, index) => (
                    <button
                      key={item.image}
                      type="button"
                      aria-label={`Show slide ${index + 1}`}
                      onClick={() => setSlide(index)}
                      className={`h-1.5 rounded-full transition-all ${
                        index === slide ? 'w-6 bg-white' : 'w-1.5 bg-white/35 hover:bg-white/55'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    aria-label="Previous slide"
                    onClick={() => setSlide((i) => (i - 1 + slides.length) % slides.length)}
                    className="rounded-md border border-white/20 bg-white/10 px-2.5 py-1.5 text-sm hover:bg-white/20"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    aria-label="Next slide"
                    onClick={() => setSlide((i) => (i + 1) % slides.length)}
                    className="rounded-md border border-white/20 bg-white/10 px-2.5 py-1.5 text-sm hover:bg-white/20"
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-white/50">Dar es Salaam · Arusha · Mwanza · Dodoma · Zanzibar</p>
        </div>
      </aside>

      <main className="flex items-center justify-center px-5 py-12 bg-[#f7f4ef]">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <BrandLogo to="/" tone="color" textClassName="text-2xl" markClassName="h-9 w-9" />
          </div>

          <div className="rounded-xl bg-white border border-black/5 shadow-[0_24px_60px_rgba(26,61,66,0.08)] p-8 sm:p-10">
            <div className="flex items-center gap-3 mb-8">
              <img src="/logos/kadi-moja-mark.png" alt="" className="h-11 w-11 rounded-lg" />
              <div>
                <h1 className="font-display text-2xl font-semibold text-[#1a3d42]">Karibu tena</h1>
                <p className="text-sm text-[#1a3d42]/60">Sign in to your admin dashboard</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#1a3d42]/70 mb-1.5">Username</label>
                <div className="admin-input-wrap">
                  <span className="admin-icon-box shrink-0" aria-hidden="true">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <circle cx="12" cy="8" r="3.5" />
                      <path d="M5 19c1.8-3.2 4.2-4.8 7-4.8s5.2 1.6 7 4.8" strokeLinecap="round" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    className="w-full bg-transparent outline-none text-[#1a3d42]"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1a3d42]/70 mb-1.5">Password</label>
                <div className="admin-input-wrap">
                  <span className="admin-icon-box shrink-0" aria-hidden="true">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="5" y="10" width="14" height="10" rx="2" />
                      <path d="M8 10V8a4 4 0 0 1 8 0v2" strokeLinecap="round" />
                    </svg>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full bg-transparent outline-none text-[#1a3d42]"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-xs font-semibold text-[#9a6b45]"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-md px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-[#9a6b45] hover:bg-[#865c3b] text-white py-3.5 font-semibold transition disabled:opacity-60"
              >
                {loading ? 'Signing in...' : 'Ingia / Sign In'}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-[#1a3d42]/45">
              Default: <span className="font-medium text-[#1a3d42]/70">admin</span> /{' '}
              <span className="font-medium text-[#1a3d42]/70">admin123</span>
            </p>
            <p className="mt-3 text-center">
              <Link to="/" className="text-sm text-[#0d7377] hover:underline">
                ← Back to website
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLogin;

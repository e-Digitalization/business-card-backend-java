import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo.jsx';
import api from '../services/api.js';

const slides = [
  {
    image: '/kadi-moja-hero-card.png',
    eyebrow: 'Kadi Moja NFC',
    title: 'One card. Every introduction.',
    text: 'Share your profile instantly across Dar es Salaam, Arusha, and beyond.'
  },
  {
    image: '/illustrations/how-tap.png',
    eyebrow: 'NFC Tap',
    title: 'Tap once. Connect fast.',
    text: 'Physical NFC tags open a live digital business card—no app required.'
  },
  {
    image: '/illustrations/how-share.png?v=3',
    eyebrow: 'Live profile',
    title: 'Update without reprinting.',
    text: 'Change phone, title, or logo once. Every Kadi Moja tag stays current.'
  },
  {
    image: '/illustrations/how-saved.png',
    eyebrow: 'AI Scan',
    title: 'Paper cards, digitised.',
    text: 'Photograph a paper card — Kadi Moja reads the details and saves the contact.'
  }
];

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [slide, setSlide] = useState(0);
  const [sliderPaused, setSliderPaused] = useState(false);

  const from = location.state?.from?.pathname || '/admin/dashboard';

  useEffect(() => {
    if (sliderPaused) return undefined;
    const timer = window.setInterval(() => {
      setSlide((i) => (i + 1) % slides.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [sliderPaused]);

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
              Manage digital business cards and NFC tags for professionals across Tanzania.
            </p>
          </div>

          <div className="km-login-slider my-auto w-full max-w-md">
            <div className="km-login-slider-media">
              {slides.map((item, index) => (
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
                <div className="km-login-slider-dots" role="tablist" aria-label="Slides">
                  {slides.map((item, index) => (
                    <button
                      key={item.image}
                      type="button"
                      role="tab"
                      aria-selected={index === slide}
                      aria-label={`Slide ${index + 1}`}
                      onClick={() => goSlide(index)}
                      className={`km-login-slider-dot ${index === slide ? 'is-active' : ''}`}
                    />
                  ))}
                </div>
                <div className="km-login-slider-arrows">
                  <button
                    type="button"
                    aria-label="Previous slide"
                    className="km-login-slider-arrow"
                    onClick={() => goSlide((slide - 1 + slides.length) % slides.length)}
                  >
                    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 4 6 10l6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    aria-label="Next slide"
                    className="km-login-slider-arrow"
                    onClick={() => goSlide((slide + 1) % slides.length)}
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

      <main className="flex items-center justify-center px-5 py-12 bg-[#f7f4ef]">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <BrandLogo to="/" tone="color" textClassName="text-2xl" markClassName="h-9 w-9" />
          </div>

          <div className="rounded-xl bg-white border border-black/5 shadow-[0_24px_60px_rgba(26,61,66,0.08)] p-8 sm:p-10">
            <div className="flex items-center gap-3 mb-8">
              <img src="/logos/kadi-moja-icon.png" alt="" className="h-11 w-11 rounded-xl object-contain" />
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

            <p className="mt-6 text-center">
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

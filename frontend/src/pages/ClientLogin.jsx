import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import BrandLogo from '../components/BrandLogo.jsx';
import api from '../services/api.js';

const persistSession = (data) => {
  localStorage.setItem('clientToken', data.token);
  localStorage.setItem('clientUser', JSON.stringify(data.user || {}));
};

const ClientLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/me';
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  const [mode, setMode] = useState('login');
  const [googleEnabled, setGoogleEnabled] = useState(Boolean(googleClientId));
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.mode === 'signup') setMode('signup');
  }, [location.state]);

  useEffect(() => {
    api
      .get('/api/auth/google/status')
      .then((res) => setGoogleEnabled(Boolean(res.data?.enabled) && Boolean(googleClientId)))
      .catch(() => setGoogleEnabled(Boolean(googleClientId)));
  }, [googleClientId]);

  const finish = (data) => {
    persistSession(data);
    navigate(from, { replace: true });
  };

  const onGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/api/auth/google', {
        idToken: credentialResponse.credential
      });
      finish(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Google sign-in failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        const response = await api.post('/api/auth/register', { fullName, email, password });
        finish(response.data);
      } else {
        const response = await api.post('/api/auth/client-login', { email, password });
        finish(response.data);
      }
    } catch (err) {
      const status = err.response?.status;
      if (status === 409) setError('An account with this email already exists.');
      else if (status === 401) setError('Invalid email or password.');
      else setError(err.response?.data?.message || 'Could not complete sign-in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f4ef] px-5 py-10">
      <div className="mx-auto flex w-full max-w-md flex-col">
        <BrandLogo to="/" tone="color" textClassName="text-2xl" markClassName="h-9 w-9" />
        <p className="mt-1 text-sm text-[#1a3d42]/55">Create your digital business card account</p>

        <div className="mt-8 rounded-xl border border-black/5 bg-white p-7 shadow-[0_20px_50px_rgba(26,61,66,0.08)]">
          <h1 className="font-display text-2xl font-semibold text-[#1a3d42]">
            {mode === 'signup' ? 'Create account' : 'Welcome back'}
          </h1>
          <p className="mt-1 text-sm text-[#1a3d42]/55">
            {mode === 'signup'
              ? 'Sign up with Google to use your profile photo on your card.'
              : 'Sign in to edit your Kadi Moja card.'}
          </p>

          {googleEnabled ? (
            <div className="mt-6 flex justify-center">
              <GoogleLogin
                onSuccess={onGoogleSuccess}
                onError={() => setError('Google sign-in was cancelled or failed.')}
                useOneTap={false}
                text={mode === 'signup' ? 'signup_with' : 'signin_with'}
                shape="rectangular"
                width="320"
              />
            </div>
          ) : (
            <div className="mt-6 rounded-md border border-[#9a6b45]/20 bg-[#9a6b45]/08 px-3 py-3 text-sm text-[#1a3d42]/75">
              Google Sign-In needs a Client ID. Set <code className="text-xs">VITE_GOOGLE_CLIENT_ID</code> and{' '}
              <code className="text-xs">GOOGLE_CLIENT_ID</code>, then restart. You can still use email below.
            </div>
          )}

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.14em] text-[#1a3d42]/35">
            <span className="h-px flex-1 bg-black/10" />
            or email
            <span className="h-px flex-1 bg-black/10" />
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === 'signup' && (
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
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-[#1a3d42]/70">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="admin-input"
                placeholder="At least 6 characters"
              />
            </label>

            {error && (
              <p className="rounded-md border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-[#9a6b45] py-3 text-sm font-semibold text-white hover:bg-[#865c3b] disabled:opacity-60"
            >
              {loading ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
            </button>
          </form>

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
        </div>

        <p className="mt-6 text-center text-xs text-[#1a3d42]/40">
          Admin?{' '}
          <Link to="/admin/login" className="text-[#0d7377] hover:underline">
            Go to admin login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ClientLogin;

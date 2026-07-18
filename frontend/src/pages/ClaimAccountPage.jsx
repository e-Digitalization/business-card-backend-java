import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api.js';

const ClaimAccountPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/api/auth/claim', { email, otp, password });
      localStorage.setItem('clientToken', res.data.token);
      localStorage.setItem('clientUser', JSON.stringify(res.data.user || {}));
      navigate('/me', { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          'Could not claim account. Check email and OTP.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f4ef] px-4 py-10">
      <div className="w-full max-w-md rounded-xl border border-black/5 bg-white p-6 shadow-[0_16px_40px_rgba(26,61,66,0.08)] sm:p-8">
        <img src="/logos/kadi-moja-icon.png" alt="Kadi Moja" className="h-10 w-10 rounded-xl object-contain" />
        <h1 className="mt-3 font-display text-2xl font-semibold text-[#1a3d42]">Claim your card</h1>
        <p className="mt-2 text-sm text-[#1a3d42]/55">
          Enter the email on your digital card and the OTP from your admin, then choose a password.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[#1a3d42]/70">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="admin-input"
              placeholder="you@company.co.tz"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[#1a3d42]/70">Invite OTP</span>
            <input
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="admin-input tracking-[0.2em]"
              placeholder="6-digit code"
              inputMode="numeric"
              autoComplete="one-time-code"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[#1a3d42]/70">New password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="admin-input"
              minLength={6}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[#1a3d42]/70">Confirm password</span>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="admin-input"
              minLength={6}
            />
          </label>

          {error && (
            <p className="rounded-md border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-[#0d7377] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? 'Claiming…' : 'Set password & open dashboard'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[#1a3d42]/50">
          Already claimed?{' '}
          <Link to="/login" className="font-semibold text-[#0d7377] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ClaimAccountPage;

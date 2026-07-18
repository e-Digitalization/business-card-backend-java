import { useCallback, useEffect, useState } from 'react';
import api from '../../../services/api.js';

export function useAdminSetups() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [setups, setSetups] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/admin/setups');
      setSetups(res.data.data || null);
    } catch {
      setError('Could not load setups. Restart the backend if you just pulled these changes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (body, successMessage = 'Setups saved.') => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const res = await api.put('/api/admin/setups', body);
      setSetups(res.data.data || null);
      setMessage(successMessage);
      return res.data.data || null;
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.detail || 'Could not save setups.');
      return null;
    } finally {
      setSaving(false);
    }
  };

  const clearKey = async (flag) => {
    await save({ [flag]: true }, 'Cleared database override — .env value is used again if set.');
  };

  return {
    loading,
    saving,
    error,
    message,
    setMessage,
    setError,
    setups,
    load,
    save,
    clearKey
  };
}

export function StatusPill({ ok, label }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        ok ? 'bg-emerald-50 text-emerald-700' : 'bg-[#f3eee7] text-[#1a3d42]/55'
      }`}
    >
      {label}
    </span>
  );
}

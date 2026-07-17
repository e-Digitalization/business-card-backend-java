import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import { ClientWorkspaceContext } from './ClientLayout.jsx';

const fields = [
  ['fullName', 'Full name'],
  ['title', 'Title / Position'],
  ['company', 'Organisation'],
  ['location', 'Location'],
  ['phone', 'Phone (+255…)'],
  ['email', 'Email'],
  ['website', 'Website'],
  ['whatsapp', 'WhatsApp'],
  ['photoUrl', 'Photo URL'],
  ['logoUrl', 'Logo URL'],
  ['linkedin', 'LinkedIn'],
  ['twitter', 'Twitter / X'],
  ['github', 'GitHub']
];

const ClientCardPage = () => {
  const { card, setCard, refresh } = useContext(ClientWorkspaceContext);
  const [form, setForm] = useState(card);
  const [saving, setSaving] = useState(false);
  const [regenLoading, setRegenLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(card);
  }, [card]);

  if (!form) {
    return <p className="text-sm text-[#1a3d42]/50">Loading card…</p>;
  }

  const onChange = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const onSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const response = await api.put('/api/client/me/card', {
        ...form,
        slug: form.slug,
        active: form.active !== false
      });
      setCard(response.data.data);
      setForm(response.data.data);
      await refresh();
      setMessage('Card saved successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save your card.');
    } finally {
      setSaving(false);
    }
  };

  const regenerateLink = async () => {
    if (!window.confirm('Generate a new private link? Your old /u/… link will stop working.')) return;
    setRegenLoading(true);
    setMessage('');
    setError('');
    try {
      const response = await api.post('/api/client/me/card/regenerate-slug');
      setCard(response.data.data);
      setForm(response.data.data);
      await refresh();
      setMessage('New private link created. Share the updated URL only with people you trust.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not regenerate link.');
    } finally {
      setRegenLoading(false);
    }
  };

  const publicPath = form.slug ? `/u/${form.slug}` : '';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-[#9a6b45]">My Kadi Moja</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-[#1a3d42]">Edit digital card</h1>
          <p className="mt-1 text-sm text-[#1a3d42]/55">
            These details appear when someone taps your NFC card or opens your private link.
          </p>
        </div>
        {form.slug && (
          <a
            href={publicPath}
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-[#1a3d42]"
          >
            Preview
          </a>
        )}
      </div>

      <section className="client-panel p-5">
        <p className="text-sm font-semibold text-[#1a3d42]">Private share link</p>
        <p className="mt-1 text-xs text-[#1a3d42]/50">
          This code is random on purpose so people cannot guess your card from your name.
        </p>
        <p className="mt-3 break-all rounded-md bg-[#f7f4ef] px-3 py-3 text-sm font-medium text-[#0d7377]">
          {typeof window !== 'undefined' ? window.location.origin : ''}
          {publicPath}
        </p>
        <button
          type="button"
          onClick={regenerateLink}
          disabled={regenLoading}
          className="mt-3 rounded-md border border-[#9a6b45]/30 bg-[#9a6b45]/10 px-4 py-2.5 text-sm font-semibold text-[#9a6b45] disabled:opacity-60"
        >
          {regenLoading ? 'Generating…' : 'Generate new private link'}
        </button>
      </section>

      <form onSubmit={onSave} className="client-panel p-5 sm:p-7">
        <div className="grid gap-3 sm:grid-cols-2">
          {fields.map(([key, label]) => (
            <label key={key} className="block">
              <span className="mb-1 block text-sm font-medium text-[#1a3d42]/70">{label}</span>
              <input value={form[key] || ''} onChange={onChange(key)} className="admin-input" />
            </label>
          ))}
        </div>

        {message && (
          <p className="mt-4 rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {message}
          </p>
        )}
        {error && (
          <p className="mt-4 rounded-md border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-600">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Link to="/me" className="rounded-md border border-black/10 px-4 py-2.5 text-sm font-medium text-[#1a3d42]">
            Back
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-[#0d7377] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0a5f63] disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save card'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClientCardPage;

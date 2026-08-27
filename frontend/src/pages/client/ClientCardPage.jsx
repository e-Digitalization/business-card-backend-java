import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../services/api.js';
import { resolveMediaUrl } from '../../utils/media.js';
import { CARD_THEME_OPTIONS, CARD_THEME_PRESETS, getCardThemeVars } from '../../utils/cardTheme.js';
import { ClientWorkspaceContext } from './ClientLayout.jsx';
import ContactCardVisual from './ContactCardVisual.jsx';

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
  ['linkedin', 'LinkedIn'],
  ['twitter', 'Twitter / X'],
  ['github', 'GitHub'],
  ['instagram', 'Instagram']
];

const ClientCardPage = () => {
  const { card, setCard, refresh } = useContext(ClientWorkspaceContext);
  const location = useLocation();
  const [form, setForm] = useState(card);
  const [saving, setSaving] = useState(false);
  const [regenLoading, setRegenLoading] = useState(false);
  const [logoBusy, setLogoBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const logoFileRef = useRef(null);

  useEffect(() => {
    setForm(card);
  }, [card]);

  // Jump straight to the branding section when linked as /me/card#branding.
  useEffect(() => {
    if (!form || !location.hash) return;
    document.querySelector(location.hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [form, location.hash]);

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

  const uploadLogo = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLogoBusy(true);
    setMessage('');
    setError('');
    try {
      const body = new FormData();
      body.append('file', file);
      const response = await api.post('/api/client/me/card/logo', body, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setCard(response.data.data);
      setForm(response.data.data);
      await refresh();
      setMessage('Logo uploaded.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not upload logo.');
    } finally {
      setLogoBusy(false);
      event.target.value = '';
    }
  };

  const clearLogo = async () => {
    setLogoBusy(true);
    setMessage('');
    setError('');
    try {
      const response = await api.delete('/api/client/me/card/logo');
      setCard(response.data.data);
      setForm(response.data.data);
      await refresh();
      setMessage('Logo removed.');
    } catch {
      setError('Could not remove logo.');
    } finally {
      setLogoBusy(false);
    }
  };

  const publicPath = form.slug ? `/u/${form.slug}` : '';
  const logoSrc = resolveMediaUrl(form.logoUrl);
  const theme = form.theme || 'lagoon';

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

      <section id="branding" className="client-panel p-5 sm:p-7 scroll-mt-24">
        <p className="text-xs uppercase tracking-[0.14em] text-[#9a6b45]">Branding</p>
        <h2 className="mt-1 font-display text-xl font-semibold text-[#1a3d42]">Card look</h2>
        <p className="mt-1 text-sm text-[#1a3d42]/55">
          Choose a color theme and add your company logo. Changes save with the rest of the card below.
        </p>

        <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_auto]">
          <div className="space-y-6">
            <div>
              <span className="mb-2 block text-sm font-medium text-[#1a3d42]/70">Company logo</span>
              <div className="flex flex-wrap items-center gap-3">
                {logoSrc ? (
                  <img src={logoSrc} alt="" className="h-16 w-16 rounded-lg border border-black/10 object-contain bg-white" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-black/15 text-[10px] text-[#1a3d42]/40">
                    No logo
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => logoFileRef.current?.click()}
                  disabled={logoBusy}
                  className="rounded-md bg-[#0d7377] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0a5f63] disabled:opacity-60"
                >
                  {logoBusy ? 'Working…' : 'Upload logo'}
                </button>
                <input
                  ref={logoFileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={uploadLogo}
                />
                {form.logoUrl && (
                  <button
                    type="button"
                    onClick={clearLogo}
                    disabled={logoBusy}
                    className="rounded-md border border-black/10 px-4 py-2.5 text-sm font-medium text-[#1a3d42] disabled:opacity-60"
                  >
                    Remove logo
                  </button>
                )}
              </div>
            </div>

            <div>
              <span className="mb-2 block text-sm font-medium text-[#1a3d42]/70">Theme</span>
              <div className="flex flex-wrap gap-2">
                {CARD_THEME_OPTIONS.map((option) => {
                  const preset = CARD_THEME_PRESETS[option.value];
                  const isActive = theme === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, theme: option.value }))}
                      className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition ${
                        isActive ? 'border-[#0d7377] bg-[#e7f5f4] text-[#1a3d42]' : 'border-black/10 text-[#1a3d42]/70'
                      }`}
                    >
                      <span
                        className="h-4 w-4 rounded-full"
                        style={{
                          background: preset
                            ? `linear-gradient(135deg, ${preset.c1}, ${preset.accent})`
                            : `linear-gradient(135deg, ${form.primaryColor || '#0d7377'}, ${form.accentColor || '#e8913a'})`
                        }}
                      />
                      {option.label}
                    </button>
                  );
                })}
              </div>

              {theme === 'custom' && (
                <div className="mt-3 flex flex-wrap gap-4">
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-[#1a3d42]/70">Primary color</span>
                    <input
                      type="color"
                      value={form.primaryColor || '#0d7377'}
                      onChange={(e) => setForm((p) => ({ ...p, primaryColor: e.target.value }))}
                      className="h-9 w-16 rounded border border-black/10"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-[#1a3d42]/70">Accent color</span>
                    <input
                      type="color"
                      value={form.accentColor || '#e8913a'}
                      onChange={(e) => setForm((p) => ({ ...p, accentColor: e.target.value }))}
                      className="h-9 w-16 rounded border border-black/10"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="mx-auto w-full max-w-[280px] overflow-hidden rounded-[1.75rem] shadow-[0_16px_40px_rgba(26,61,66,0.16)]">
            <ContactCardVisual
              contact={{
                fullName: form.fullName || 'Your name',
                title: form.title,
                company: form.company,
                phone: form.phone,
                email: form.email,
                location: form.location,
                photoUrl: form.photoUrl,
                logoUrl: form.logoUrl,
                website: form.website,
                whatsapp: form.whatsapp
              }}
              variant="lagoon"
              themeVars={getCardThemeVars(form)}
            />
          </div>
        </div>
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

import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import { resolveMediaUrl } from '../../utils/media.js';
import { CARD_THEME_OPTIONS, CARD_THEME_PRESETS, getCardThemeVars } from '../../utils/cardTheme.js';
import { ClientWorkspaceContext } from './ClientLayout.jsx';
import ContactCardVisual from './ContactCardVisual.jsx';

const ClientCardLookPage = () => {
  const { card, setCard, refresh } = useContext(ClientWorkspaceContext);
  const [form, setForm] = useState(card);
  const [saving, setSaving] = useState(false);
  const [logoBusy, setLogoBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const logoFileRef = useRef(null);

  useEffect(() => {
    setForm(card);
  }, [card]);

  if (!form) {
    return <p className="text-sm text-[#1a3d42]/50">Loading card…</p>;
  }

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
      setMessage('Card look saved.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save your card look.');
    } finally {
      setSaving(false);
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

  const logoSrc = resolveMediaUrl(form.logoUrl);
  const theme = form.theme || 'lagoon';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-[#9a6b45]">Branding</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-[#1a3d42]">Card look</h1>
          <p className="mt-1 text-sm text-[#1a3d42]/55">
            Choose a colour theme and add your company logo. Your contact details live under Edit card.
          </p>
        </div>
        <Link
          to="/me/card"
          className="rounded-md border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-[#1a3d42]"
        >
          Edit card details
        </Link>
      </div>

      <form onSubmit={onSave} className="client-panel p-5 sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_264px] lg:gap-10">
          <div className="space-y-4">
            <div className="rounded-xl border border-black/10 bg-[#faf8f4] p-4">
              <span className="block text-sm font-medium text-[#1a3d42]">Company logo</span>
              <p className="mt-0.5 text-xs text-[#1a3d42]/50">PNG, JPG, WebP or GIF · up to 5&nbsp;MB</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                {logoSrc ? (
                  <img
                    src={logoSrc}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded-lg border border-black/10 bg-white object-contain"
                  />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-black/20 bg-white text-[10px] text-[#1a3d42]/40">
                    No logo
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => logoFileRef.current?.click()}
                    disabled={logoBusy}
                    className="rounded-md bg-[#0d7377] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0a5f63] disabled:opacity-60"
                  >
                    {logoBusy ? 'Working…' : form.logoUrl ? 'Replace' : 'Upload logo'}
                  </button>
                  {form.logoUrl && (
                    <button
                      type="button"
                      onClick={clearLogo}
                      disabled={logoBusy}
                      className="rounded-md border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-[#1a3d42] disabled:opacity-60"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  ref={logoFileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={uploadLogo}
                />
              </div>
            </div>

            <div className="rounded-xl border border-black/10 bg-[#faf8f4] p-4">
              <span className="block text-sm font-medium text-[#1a3d42]">Theme</span>
              <p className="mt-0.5 text-xs text-[#1a3d42]/50">Sets the colours on your public card.</p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {CARD_THEME_OPTIONS.map((option) => {
                  const preset = CARD_THEME_PRESETS[option.value];
                  const isActive = theme === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, theme: option.value }))}
                      className={`flex items-center gap-2 rounded-lg border bg-white px-3 py-2.5 text-sm font-medium transition ${
                        isActive
                          ? 'border-[#0d7377] text-[#1a3d42] ring-2 ring-[#0d7377]/20'
                          : 'border-black/10 text-[#1a3d42]/70 hover:border-black/25'
                      }`}
                    >
                      <span
                        className="h-4 w-4 shrink-0 rounded-full"
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

          <div className="lg:sticky lg:top-6 lg:self-start">
            <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1a3d42]/40 lg:text-left">
              Live preview
            </p>
            <div className="mx-auto w-full max-w-[264px] overflow-hidden rounded-[1.75rem] border border-black/5 shadow-[0_18px_44px_rgba(26,61,66,0.18)]">
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
                  whatsapp: form.whatsapp,
                  linkedin: form.linkedin,
                  twitter: form.twitter,
                  github: form.github,
                  instagram: form.instagram,
                  youtubeChannel: form.youtubeChannel,
                  youtubeVideos: form.youtubeVideos,
                  bookingUrl: form.bookingUrl,
                  podcastUrl: form.podcastUrl,
                  tiktok: form.tiktok,
                  telegram: form.telegram,
                  wechat: form.wechat,
                  weibo: form.weibo,
                  douyin: form.douyin,
                  xiaohongshu: form.xiaohongshu
                }}
                variant="lagoon"
                themeVars={getCardThemeVars(form)}
              />
            </div>
          </div>
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
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-[#0d7377] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0a5f63] disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save card look'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClientCardLookPage;

import React, { useEffect, useState } from 'react';
import api from '../../services/api.js';
import { CARD_THEME_OPTIONS, CARD_THEME_PRESETS } from '../../utils/cardTheme.js';

const fieldDefs = [
  ['fullName', 'Full Name'],
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
  ['github', 'GitHub'],
  ['instagram', 'Instagram'],
  ['youtubeChannel', 'YouTube channel'],
  ['youtubeVideo1', 'YouTube video 1'],
  ['youtubeVideo2', 'YouTube video 2'],
  ['youtubeVideo3', 'YouTube video 3'],
  ['bookingUrl', 'Appointment booking link']
];

const EditCardDialog = ({ open, cardId, onClose, onSaved }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tagCode, setTagCode] = useState('');
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('details');

  useEffect(() => {
    if (!open || !cardId) return undefined;

    let mounted = true;
    setLoading(true);
    setError('');
    setTagCode('');
    setTab('details');

    api
      .get(`/api/admin/cards/${cardId}`)
      .then((response) => {
        if (mounted) setPayload(response.data.data);
      })
      .catch(() => {
        if (mounted) setError('Could not load this card.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [open, cardId]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const card = payload?.card;
  const tags = payload?.tags || [];

  const onChange = (key) => (e) =>
    setPayload((p) => ({
      ...p,
      card: { ...p.card, [key]: e.target.value }
    }));

  const setCardField = (key, value) =>
    setPayload((p) => ({
      ...p,
      card: { ...p.card, [key]: value }
    }));

  const onUpdate = async (e) => {
    e.preventDefault();
    if (!cardId || !card) return;
    setSaving(true);
    setError('');
    try {
      await api.put(`/api/admin/cards/${cardId}`, { ...card });
      onSaved?.();
      onClose();
    } catch {
      setError('Could not save changes.');
    } finally {
      setSaving(false);
    }
  };

  const refresh = async () => {
    const response = await api.get(`/api/admin/cards/${cardId}`);
    setPayload(response.data.data);
    onSaved?.();
  };

  const onAssignTag = async (e) => {
    e.preventDefault();
    if (!tagCode.trim()) return;
    await api.post(`/api/admin/cards/${cardId}/tag`, { tagCode: tagCode.trim() });
    setTagCode('');
    await refresh();
  };

  const onDeactivateTag = async (tagId) => {
    await api.put(`/api/admin/tags/${tagId}/deactivate`);
    await refresh();
  };

  return (
    <div className="admin-dialog-root" role="dialog" aria-modal="true" aria-labelledby="edit-card-title">
      <button type="button" className="admin-dialog-backdrop" aria-label="Close dialog" onClick={onClose} />
      <div className="admin-dialog-panel">
        <div className="flex items-start justify-between gap-3 border-b border-black/5 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.14em] text-[#9a6b45]">Edit card</p>
            <h2 id="edit-card-title" className="mt-1 truncate font-display text-xl font-semibold text-[#1a3d42]">
              {loading ? 'Loading…' : card?.fullName || 'Digital card'}
            </h2>
            {card?.slug && (
              <p className="mt-0.5 truncate text-xs text-[#1a3d42]/45">Private link · /u/{card.slug}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-black/10 px-3 py-1.5 text-sm text-[#1a3d42] hover:bg-[#f7f4ef]"
          >
            Close
          </button>
        </div>

        <div className="flex gap-2 border-b border-black/5 px-5 pt-3">
          {[
            ['details', 'Details'],
            ['look', 'Card look'],
            ['nfc', 'NFC Tags']
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`border-b-2 px-3 pb-2.5 text-sm font-medium transition ${
                tab === key
                  ? 'border-[#9a6b45] text-[#9a6b45]'
                  : 'border-transparent text-[#1a3d42]/50 hover:text-[#1a3d42]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="max-h-[min(70vh,640px)] overflow-y-auto px-5 py-4">
          {loading && <p className="py-8 text-sm text-[#1a3d42]/50">Loading card details…</p>}

          {!loading && error && !card && (
            <p className="rounded-md border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>
          )}

          {!loading && card && tab === 'details' && (
            <form id="edit-card-form" onSubmit={onUpdate} className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2 flex flex-wrap items-center gap-2 rounded-md border border-black/5 bg-[#f7f4ef] px-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-[#9a6b45]">Private link</p>
                  <p className="truncate text-sm text-[#1a3d42]">/u/{card.slug}</p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    if (!window.confirm('Generate a new private link? The old /u/… URL will stop working.')) return;
                    await api.post(`/api/admin/cards/${cardId}/regenerate-slug`);
                    await refresh();
                  }}
                  className="rounded-md border border-black/10 px-3 py-2 text-sm font-medium text-[#1a3d42]"
                >
                  Regenerate
                </button>
              </div>
              {fieldDefs.map(([key, label]) => (
                <label key={key} className="block">
                  <span className="mb-1 block text-sm font-medium text-[#1a3d42]/70">{label}</span>
                  <input
                    value={card[key] || ''}
                    onChange={onChange(key)}
                    required={key === 'fullName'}
                    className="admin-input"
                  />
                </label>
              ))}
            </form>
          )}

          {!loading && card && tab === 'look' && (
            <form id="edit-card-form" onSubmit={onUpdate}>
              <p className="mb-2 text-sm font-medium text-[#1a3d42]/70">Theme</p>
              <div className="flex flex-wrap gap-2">
                {CARD_THEME_OPTIONS.map((option) => {
                  const preset = CARD_THEME_PRESETS[option.value];
                  const isActive = (card.theme || 'lagoon') === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setCardField('theme', option.value)}
                      className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition ${
                        isActive ? 'border-[#0d7377] bg-[#e7f5f4] text-[#1a3d42]' : 'border-black/10 text-[#1a3d42]/70'
                      }`}
                    >
                      <span
                        className="h-4 w-4 rounded-full"
                        style={{
                          background: preset
                            ? `linear-gradient(135deg, ${preset.c1}, ${preset.accent})`
                            : `linear-gradient(135deg, ${card.primaryColor || '#0d7377'}, ${card.accentColor || '#e8913a'})`
                        }}
                      />
                      {option.label}
                    </button>
                  );
                })}
              </div>

              {card.theme === 'custom' && (
                <div className="mt-3 flex flex-wrap gap-4">
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-[#1a3d42]/70">Primary color</span>
                    <input
                      type="color"
                      value={card.primaryColor || '#0d7377'}
                      onChange={(e) => setCardField('primaryColor', e.target.value)}
                      className="h-9 w-16 rounded border border-black/10"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-[#1a3d42]/70">Accent color</span>
                    <input
                      type="color"
                      value={card.accentColor || '#e8913a'}
                      onChange={(e) => setCardField('accentColor', e.target.value)}
                      className="h-9 w-16 rounded border border-black/10"
                    />
                  </label>
                </div>
              )}
            </form>
          )}

          {!loading && card && tab === 'nfc' && (
            <div>
              <p className="text-sm text-[#1a3d42]/55">
                Assign a physical NFC tag so taps open this profile.
              </p>
              <form onSubmit={onAssignTag} className="mt-3 flex flex-wrap gap-2">
                <input
                  value={tagCode}
                  onChange={(e) => setTagCode(e.target.value)}
                  placeholder="e.g. TAG-DAR-001"
                  className="admin-input min-w-[200px] flex-1"
                />
                <button
                  type="submit"
                  className="rounded-md border border-[#9a6b45]/30 bg-[#9a6b45]/10 px-4 py-2.5 text-sm font-semibold text-[#9a6b45]"
                >
                  Assign tag
                </button>
              </form>
              <div className="mt-4 flex flex-wrap gap-2">
                {tags.length === 0 && (
                  <p className="text-sm text-[#1a3d42]/45">No tags assigned yet.</p>
                )}
                {tags.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    disabled={!t.active}
                    onClick={() => t.active && onDeactivateTag(t.id)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      t.active
                        ? 'bg-[#0d7377]/10 text-[#0d7377] hover:bg-[#0d7377]/15'
                        : 'border border-black/10 text-[#1a3d42]/40'
                    }`}
                  >
                    {t.tagCode}
                    {t.active ? ' · Deactivate' : ' · Inactive'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && card && (
            <p className="mt-3 rounded-md border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-600">
              {error}
            </p>
          )}
        </div>

        {(tab === 'details' || tab === 'look') && card && (
          <div className="flex justify-end gap-2 border-t border-black/5 px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-black/10 px-4 py-2.5 text-sm font-medium text-[#1a3d42]"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="edit-card-form"
              disabled={saving}
              className="rounded-md bg-[#9a6b45] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#865c3b] disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditCardDialog;

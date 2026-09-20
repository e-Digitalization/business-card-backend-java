import React, { useEffect, useRef, useState } from 'react';
import api from '../../services/api.js';
import CardDetailsFields from '../../components/CardDetailsFields.jsx';
import CardLookFields from '../../components/CardLookFields.jsx';
import notify from '../../utils/toast.jsx';
import { resolveMediaUrl } from '../../utils/media.js';
import GovernmentEditor from '../../components/GovernmentEditor.jsx';
import BankerEditor from '../../components/BankerEditor.jsx';
import ResearcherEditor from '../../components/ResearcherEditor.jsx';
import { hasCategory } from '../../utils/cardCategories.js';

const EditCardDialog = ({ open, cardId, onClose, onSaved }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tagCode, setTagCode] = useState('');
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('details');
  const [logoBusy, setLogoBusy] = useState(false);
  const logoFileRef = useRef(null);

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
      notify.success('Card updated successfully.');
      onSaved?.();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not save changes.';
      setError(msg);
      notify.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const refresh = async () => {
    const response = await api.get(`/api/admin/cards/${cardId}`);
    setPayload(response.data.data);
    onSaved?.();
  };

  // Logo upload persists on its own endpoint; merge just the new URL back so any
  // other in-progress field edits in the dialog are preserved.
  const uploadLogo = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLogoBusy(true);
    setError('');
    try {
      const body = new FormData();
      body.append('file', file);
      const response = await api.post(`/api/admin/cards/${cardId}/logo`, body, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setCardField('logoUrl', response.data.data.logoUrl);
      notify.success('Logo uploaded.');
      onSaved?.();
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not upload logo.';
      setError(msg);
      notify.error(msg);
    } finally {
      setLogoBusy(false);
      event.target.value = '';
    }
  };

  const clearLogo = async () => {
    setLogoBusy(true);
    setError('');
    try {
      await api.delete(`/api/admin/cards/${cardId}/logo`);
      setCardField('logoUrl', null);
      notify.success('Logo removed.');
      onSaved?.();
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not remove logo.';
      setError(msg);
      notify.error(msg);
    } finally {
      setLogoBusy(false);
    }
  };

  const onAssignTag = async (e) => {
    e.preventDefault();
    if (!tagCode.trim()) return;
    try {
      await api.post(`/api/admin/cards/${cardId}/tag`, { tagCode: tagCode.trim() });
      setTagCode('');
      await refresh();
      notify.success('NFC tag assigned.');
    } catch (err) {
      notify.error(err.response?.data?.message || 'Could not assign tag.');
    }
  };

  const onDeactivateTag = async (tagId) => {
    try {
      await api.put(`/api/admin/tags/${tagId}/deactivate`);
      await refresh();
      notify.success('NFC tag deactivated.');
    } catch (err) {
      notify.error(err.response?.data?.message || 'Could not deactivate tag.');
    }
  };

  return (
    <div className="admin-dialog-root" role="dialog" aria-modal="true" aria-labelledby="edit-card-title">
      <button type="button" className="admin-dialog-backdrop" aria-label="Close dialog" onClick={onClose} />
      <div className="admin-dialog-panel">
        <div className="flex items-start justify-between gap-3 border-b border-black/5 px-6 py-4">
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

        <div className="flex gap-2 border-b border-black/5 px-6 pt-3">
          {[
            ['details', 'Details'],
            ...(hasCategory(card, 'government') ? [['government', 'Government']] : []),
            ...(hasCategory(card, 'banker') ? [['banker', 'Banker']] : []),
            ...(hasCategory(card, 'researcher') ? [['research', 'Researcher']] : []),
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

        <div className="max-h-[min(76vh,720px)] overflow-y-auto px-6 py-5">
          {loading && <p className="py-8 text-sm text-[#1a3d42]/50">Loading card details…</p>}

          {!loading && error && !card && (
            <p className="rounded-md border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>
          )}

          {!loading && card && tab === 'details' && (
            <form id="edit-card-form" onSubmit={onUpdate} className="grid gap-x-4 gap-y-3.5 sm:grid-cols-2">
              <div className="sm:col-span-2 flex flex-wrap items-center gap-2 rounded-md border border-black/5 bg-[#f7f4ef] px-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-[#9a6b45]">Private link</p>
                  <p className="truncate text-sm text-[#1a3d42]">/u/{card.slug}</p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    if (!window.confirm('Generate a new private link? The old /u/… URL will stop working.')) return;
                    try {
                      await api.post(`/api/admin/cards/${cardId}/regenerate-slug`);
                      await refresh();
                      notify.success('New private link generated.');
                    } catch {
                      notify.error('Could not regenerate link.');
                    }
                  }}
                  className="rounded-md border border-black/10 px-3 py-2 text-sm font-medium text-[#1a3d42]"
                >
                  Regenerate
                </button>
              </div>
              <div className="sm:col-span-2">
                <CardDetailsFields card={card} setField={setCardField} />
              </div>
            </form>
          )}

          {!loading && card && tab === 'government' && (
            <form id="edit-card-form" onSubmit={onUpdate}>
              <GovernmentEditor
                value={card.governmentData || ''}
                onChange={(next) => setCardField('governmentData', next)}
                uploadUrl="/api/admin/uploads/banner"
                accent="#9a6b45"
              />
            </form>
          )}

          {!loading && card && tab === 'banker' && (
            <form id="edit-card-form" onSubmit={onUpdate}>
              <BankerEditor
                value={card.bankerData || ''}
                onChange={(next) => setCardField('bankerData', next)}
                uploadUrl="/api/admin/uploads/banner"
                accent="#9a6b45"
              />
            </form>
          )}

          {!loading && card && tab === 'research' && (
            <form id="edit-card-form" onSubmit={onUpdate}>
              <ResearcherEditor
                value={card.researcherData || ''}
                onChange={(next) => setCardField('researcherData', next)}
                importUrl="/api/admin/import/researcher"
                accent="#9a6b45"
              />
            </form>
          )}

          {!loading && card && tab === 'look' && (
            <form id="edit-card-form" onSubmit={onUpdate}>
              <p className="mb-2 text-sm font-medium text-[#1a3d42]/70">Organisation logo</p>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                {resolveMediaUrl(card.logoUrl) ? (
                  <img
                    src={resolveMediaUrl(card.logoUrl)}
                    alt=""
                    className="h-16 w-16 rounded-lg border border-black/10 bg-white object-contain"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-black/15 text-[10px] text-[#1a3d42]/40">
                    No logo
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => logoFileRef.current?.click()}
                  disabled={logoBusy}
                  className="rounded-md bg-[#9a6b45] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#865c3b] disabled:opacity-60"
                >
                  {logoBusy ? 'Working…' : card.logoUrl ? 'Replace logo' : 'Upload logo'}
                </button>
                <input
                  ref={logoFileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={uploadLogo}
                />
                {card.logoUrl && (
                  <button
                    type="button"
                    onClick={clearLogo}
                    disabled={logoBusy}
                    className="rounded-md border border-black/10 px-4 py-2.5 text-sm font-medium text-[#1a3d42] disabled:opacity-60"
                  >
                    Remove
                  </button>
                )}
              </div>
              <label className="mb-5 block">
                <span className="mb-1 block text-xs font-medium text-[#1a3d42]/60">…or paste a logo image URL</span>
                <input
                  value={card.logoUrl || ''}
                  onChange={onChange('logoUrl')}
                  placeholder="https://…/logo.png"
                  className="admin-input"
                />
              </label>

              <CardLookFields card={card} setField={setCardField} />
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

        {(tab === 'details' || tab === 'government' || tab === 'banker' || tab === 'research' || tab === 'look') && card && (
          <div className="flex justify-end gap-2 border-t border-black/5 px-6 py-4">
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

import React, { useRef, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import api from '../services/api.js';
import { resolveMediaUrl } from '../utils/media.js';
import { parseBanker, serializeBanker } from '../utils/cardCategories.js';

// Edits the banker JSON document. `value` is the stored string and `onChange`
// receives the updated string. `uploadUrl` is the role-specific banner upload endpoint.
const BankerEditor = ({ value, onChange, uploadUrl, accent = '#0d7377' }) => {
  const data = parseBanker(value);
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const update = (patch) => onChange(serializeBanker({ ...data, ...patch }));
  const setService = (i, patch) =>
    update({ services: data.services.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) });
  const addBtn = { color: accent, borderColor: `${accent}55` };
  const banner = resolveMediaUrl(data.bannerUrl);

  const upload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !uploadUrl) return;
    setBusy(true);
    setError('');
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await api.post(uploadUrl, body, { headers: { 'Content-Type': 'multipart/form-data' } });
      update({ bannerUrl: res.data.data.url });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not upload the banner.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="km-video-editor space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="km-video-editor-title">Banker profile</p>
          <p className="km-video-editor-hint">A banner picture, your institution and the services you offer.</p>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-[#1a3d42]">Banner picture</p>
        <div className="km-banker-banner km-banker-banner--editor" style={banner ? { backgroundImage: `url(${banner})` } : undefined}>
          {!banner && <span>No banner</span>}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {uploadUrl && (
            <>
              <button type="button" className="km-video-add" style={addBtn} disabled={busy} onClick={() => fileRef.current?.click()}>
                {busy ? 'Uploading…' : data.bannerUrl ? 'Replace banner' : 'Upload banner'}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={upload} />
            </>
          )}
          {data.bannerUrl && (
            <button type="button" className="text-xs font-medium text-rose-600" onClick={() => update({ bannerUrl: '' })}>
              Remove
            </button>
          )}
        </div>
        <input
          className="admin-input mt-2"
          placeholder="…or paste a banner image URL (wide, ~16:7 works best)"
          value={data.bannerUrl}
          onChange={(e) => update({ bannerUrl: e.target.value })}
        />
        {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {[
          ['institution', 'Bank / institution', 'Tanzania Commercial Bank'],
          ['branch', 'Branch / location', 'Dar es Salaam, Corporate Branch'],
          ['department', 'Department', 'SME & Corporate Banking'],
          ['specialties', 'Focus areas (separate with |)', 'Strategy | Partnerships | SME Growth']
        ].map(([key, label, placeholder]) => (
          <label key={key} className="block">
            <span className="mb-1 block text-sm font-medium text-[#1a3d42]/70">{label}</span>
            <input className="admin-input" value={data[key] || ''} placeholder={placeholder} onChange={(e) => update({ [key]: e.target.value })} />
          </label>
        ))}
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm font-medium text-[#1a3d42]/70">Regulatory note (optional)</span>
          <input
            className="admin-input"
            value={data.regulator || ''}
            placeholder="Regulated by the Bank of Tanzania"
            onChange={(e) => update({ regulator: e.target.value })}
          />
        </label>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-[#1a3d42]">Services ({data.services.length})</p>
        <div className="space-y-3">
          {data.services.map((svc, i) => (
            <div key={i} className="flex items-start gap-2 rounded-lg border border-black/10 bg-white p-3">
              <div className="grid flex-1 gap-2">
                <input className="admin-input" placeholder="Service name" value={svc.title || ''} onChange={(e) => setService(i, { title: e.target.value })} />
                <input className="admin-input" placeholder="Short description" value={svc.description || ''} onChange={(e) => setService(i, { description: e.target.value })} />
              </div>
              <button
                type="button"
                className="km-video-remove"
                aria-label="Remove service"
                onClick={() => update({ services: data.services.filter((_, idx) => idx !== i) })}
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="km-video-add mt-2"
          style={addBtn}
          onClick={() => update({ services: [...data.services, { title: '', description: '' }] })}
        >
          <AddIcon sx={{ fontSize: 18 }} /> Add service
        </button>
      </div>
    </div>
  );
};

export default BankerEditor;

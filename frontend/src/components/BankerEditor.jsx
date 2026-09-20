import React from 'react';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import MediaItemListEditor from './MediaItemListEditor.jsx';
import { parseBanker, serializeBanker } from '../utils/cardCategories.js';

// Edits the banker JSON document. `value` is the stored string and `onChange`
// receives the updated string. `uploadUrl` is the role-specific banner upload endpoint.
const BankerEditor = ({ value, onChange, uploadUrl, accent = '#0d7377' }) => {
  const data = parseBanker(value);
  const update = (patch) => onChange(serializeBanker({ ...data, ...patch }));
  const setService = (i, patch) =>
    update({ services: data.services.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) });
  const addBtn = { color: accent, borderColor: `${accent}55` };
  // A single legacy bannerUrl shows up as one poster; the first edit stores it in `banners`.
  const posters = data.banners.length
    ? data.banners
    : data.bannerUrl
      ? [{ imageUrl: data.bannerUrl, title: '', linkUrl: '' }]
      : [];

  return (
    <div className="km-video-editor space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="km-video-editor-title">Banker profile</p>
          <p className="km-video-editor-hint">Featured and small ads, your institution and the services you offer.</p>
        </div>
      </div>

      <MediaItemListEditor
        title="Featured ads (posters)"
        hint="Portrait ad pictures (about 4:5, e.g. 1080×1350) — the text is part of the picture. They slide automatically."
        value={posters}
        onChange={(banners) => update({ banners, bannerUrl: '' })}
        uploadUrl={uploadUrl}
        addLabel="Add poster"
        thumbClass="km-poster-thumb"
        fields={[
          { key: 'title', label: 'Short description (for accessibility)', type: 'text' },
          { key: 'linkUrl', label: 'Link when tapped (optional)', type: 'text' }
        ]}
        accent={accent}
      />

      <MediaItemListEditor
        title="Small ads"
        hint="Compact offers shown in a grid under the posters: a square picture, a title and a line of text."
        value={data.smallAds}
        onChange={(smallAds) => update({ smallAds })}
        uploadUrl={uploadUrl}
        addLabel="Add small ad"
        max={12}
        thumbClass="km-small-thumb"
        fields={[
          { key: 'title', label: 'Title', type: 'text' },
          { key: 'description', label: 'Short text', type: 'text' },
          { key: 'linkUrl', label: 'Link when tapped (optional)', type: 'text' }
        ]}
        accent={accent}
      />

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

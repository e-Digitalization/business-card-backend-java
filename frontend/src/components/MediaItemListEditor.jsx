import React, { useRef, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import api from '../services/api.js';
import { resolveMediaUrl } from '../utils/media.js';

// Editor for a list of items that each have a picture plus a few text fields
// (events, poster ads, small ads). Pictures are uploaded to `uploadUrl` (returns { url })
// or pasted as a URL. `fields` is [{ key, label, type: 'text' | 'textarea' | 'date' }].
const MediaItemListEditor = ({
  title,
  hint,
  value,
  onChange,
  fields,
  uploadUrl,
  addLabel = 'Add item',
  max = 10,
  thumbClass = 'km-banner-thumb',
  accent = '#0d7377'
}) => {
  const items = Array.isArray(value) ? value : [];
  const fileRef = useRef(null);
  const uploadIndex = useRef(-1);
  const [busy, setBusy] = useState(-1);
  const [error, setError] = useState('');
  const addBtn = { color: accent, borderColor: `${accent}55` };

  const setItem = (i, patch) => onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const copy = items.slice();
    [copy[i], copy[j]] = [copy[j], copy[i]];
    onChange(copy);
  };

  const upload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    const i = uploadIndex.current;
    if (!file || !uploadUrl || i < 0) return;
    setBusy(i);
    setError('');
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await api.post(uploadUrl, body, { headers: { 'Content-Type': 'multipart/form-data' } });
      setItem(i, { imageUrl: res.data.data.url });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not upload the image.');
    } finally {
      setBusy(-1);
    }
  };

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-semibold text-[#1a3d42]">{title}</p>
        <span className="text-xs text-[#1a3d42]/50">
          {items.length}/{max}
        </span>
      </div>
      {hint && <p className="mt-0.5 text-xs text-[#1a3d42]/55">{hint}</p>}

      <div className="mt-2 space-y-3">
        {items.map((item, i) => {
          const src = resolveMediaUrl(item.imageUrl);
          return (
            <div key={i} className="rounded-lg border border-black/10 bg-white p-3">
              <div className="flex gap-3">
                <div className={thumbClass} style={src ? { backgroundImage: `url(${src})` } : undefined} aria-hidden="true">
                  {!src && <span>{i + 1}</span>}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {uploadUrl && (
                      <button
                        type="button"
                        className="km-video-add"
                        style={addBtn}
                        disabled={busy === i}
                        onClick={() => {
                          uploadIndex.current = i;
                          fileRef.current?.click();
                        }}
                      >
                        {busy === i ? 'Uploading…' : item.imageUrl ? 'Replace image' : 'Upload image'}
                      </button>
                    )}
                    <input
                      className="admin-input min-w-0 flex-1"
                      placeholder="…or paste an image URL"
                      value={item.imageUrl || ''}
                      onChange={(e) => setItem(i, { imageUrl: e.target.value })}
                    />
                  </div>
                  {fields.map((f) =>
                    f.type === 'textarea' ? (
                      <textarea
                        key={f.key}
                        className="admin-input"
                        rows={3}
                        placeholder={f.label}
                        aria-label={f.label}
                        value={item[f.key] || ''}
                        onChange={(e) => setItem(i, { [f.key]: e.target.value })}
                      />
                    ) : (
                      <label key={f.key} className="block">
                        {f.type === 'date' && <span className="mb-0.5 block text-xs text-[#1a3d42]/55">{f.label}</span>}
                        <input
                          className="admin-input"
                          type={f.type === 'date' ? 'date' : 'text'}
                          placeholder={f.label}
                          aria-label={f.label}
                          value={item[f.key] || ''}
                          onChange={(e) => setItem(i, { [f.key]: e.target.value })}
                        />
                      </label>
                    )
                  )}
                </div>
                <div className="flex flex-col items-center gap-1">
                  <button type="button" className="km-video-remove" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>
                    <ArrowUpwardIcon sx={{ fontSize: 16 }} />
                  </button>
                  <button type="button" className="km-video-remove" aria-label="Move down" disabled={i === items.length - 1} onClick={() => move(i, 1)}>
                    <ArrowDownwardIcon sx={{ fontSize: 16 }} />
                  </button>
                  <button type="button" className="km-video-remove" aria-label="Remove" onClick={() => remove(i)}>
                    <CloseIcon sx={{ fontSize: 18 }} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}

      {items.length < max && (
        <button
          type="button"
          className="km-video-add mt-2"
          style={addBtn}
          onClick={() => onChange([...items, Object.fromEntries([['imageUrl', ''], ...fields.map((f) => [f.key, ''])])])}
        >
          <AddIcon sx={{ fontSize: 18 }} /> {addLabel}
        </button>
      )}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={upload} />
    </div>
  );
};

export default MediaItemListEditor;

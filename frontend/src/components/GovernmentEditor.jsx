import React from 'react';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import MediaItemListEditor from './MediaItemListEditor.jsx';
import { parseGovernment, serializeGovernment } from '../utils/cardCategories.js';

// Edits the government JSON document. `value` is the stored string; `onChange` gets the new string.
const GovernmentEditor = ({ value, onChange, uploadUrl, accent = '#0d7377' }) => {
  const data = parseGovernment(value);
  const update = (patch) => onChange(serializeGovernment({ ...data, ...patch }));
  const setInit = (i, patch) =>
    update({ initiatives: data.initiatives.map((x, idx) => (idx === i ? { ...x, ...patch } : x)) });
  const addBtn = { color: accent, borderColor: `${accent}55` };

  return (
    <div className="km-video-editor space-y-5">
      <div>
        <p className="km-video-editor-title">Government profile</p>
        <p className="km-video-editor-hint">
          Events with dates and descriptions, plus your office and key initiatives.
        </p>
      </div>

      <MediaItemListEditor
        title="Events"
        hint="Meetings, launches and announcements. They slide automatically on the card; the description is shortened with a “Read more” that opens the full text."
        value={data.events}
        onChange={(events) => update({ events })}
        uploadUrl={uploadUrl}
        addLabel="Add event"
        fields={[
          { key: 'title', label: 'Event title', type: 'text' },
          { key: 'date', label: 'Date', type: 'date' },
          { key: 'venue', label: 'Venue / place', type: 'text' },
          { key: 'description', label: 'Description (full text — shown under “Read more”)', type: 'textarea' },
          { key: 'linkUrl', label: 'Link (optional)', type: 'text' }
        ]}
        accent={accent}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {[
          ['institution', 'Ministry / institution', 'Ministry of Finance'],
          ['department', 'Department / office', 'Office of the Permanent Secretary']
        ].map(([key, label, placeholder]) => (
          <label key={key} className="block">
            <span className="mb-1 block text-sm font-medium text-[#1a3d42]/70">{label}</span>
            <input className="admin-input" value={data[key] || ''} placeholder={placeholder} onChange={(e) => update({ [key]: e.target.value })} />
          </label>
        ))}
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm font-medium text-[#1a3d42]/70">Mandate / about the office</span>
          <textarea className="admin-input" rows={3} value={data.mandate || ''} onChange={(e) => update({ mandate: e.target.value })} />
        </label>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-[#1a3d42]">Key initiatives ({data.initiatives.length})</p>
        <div className="space-y-3">
          {data.initiatives.map((it, i) => (
            <div key={i} className="flex items-start gap-2 rounded-lg border border-black/10 bg-white p-3">
              <div className="grid flex-1 gap-2">
                <input className="admin-input" placeholder="Initiative / programme" value={it.title || ''} onChange={(e) => setInit(i, { title: e.target.value })} />
                <input className="admin-input" placeholder="Short description" value={it.description || ''} onChange={(e) => setInit(i, { description: e.target.value })} />
              </div>
              <button type="button" className="km-video-remove" aria-label="Remove initiative" onClick={() => update({ initiatives: data.initiatives.filter((_, idx) => idx !== i) })}>
                <CloseIcon sx={{ fontSize: 18 }} />
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="km-video-add mt-2" style={addBtn} onClick={() => update({ initiatives: [...data.initiatives, { title: '', description: '' }] })}>
          <AddIcon sx={{ fontSize: 18 }} /> Add initiative
        </button>
      </div>
    </div>
  );
};

export default GovernmentEditor;

import React, { useState } from 'react';
import api from '../services/api.js';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { parseResearcher, serializeResearcher } from '../utils/cardCategories.js';

const METRICS = [
  ['citations', 'citationsSince', 'Citations'],
  ['hIndex', 'hIndexSince', 'h-index'],
  ['i10Index', 'i10IndexSince', 'i10-index']
];

// Edits the researcher JSON document. `value` is the stored string and
// `onChange` receives the updated string.
const ResearcherEditor = ({ value, onChange, importUrl, accent = '#0d7377' }) => {
  const data = parseResearcher(value);
  const [link, setLink] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState({ type: '', text: '' });
  const update = (patch) => onChange(serializeResearcher({ ...data, ...patch }));
  const setMetric = (key, v) => update({ metrics: { ...data.metrics, [key]: v } });

  const setRow = (list, index, patch) =>
    update({ [list]: data[list].map((row, i) => (i === index ? { ...row, ...patch } : row)) });
  const removeRow = (list, index) => update({ [list]: data[list].filter((_, i) => i !== index) });
  const addBtn = { color: accent, borderColor: `${accent}55` };

  const runImport = async () => {
    const hasData = data.publications.length || data.metrics.citations;
    if (hasData && !window.confirm('Replace your current researcher details with the imported ones?')) return;
    setBusy(true);
    setStatus({ type: '', text: '' });
    try {
      const res = await api.post(importUrl, { url: link.trim() });
      const { name, researcher } = res.data.data;
      onChange(serializeResearcher({ ...data, ...researcher }));
      setStatus({
        type: 'ok',
        text: `Imported ${researcher.publications.length} papers for ${name}. Check it matches you, then save the card.`
      });
    } catch (err) {
      setStatus({ type: 'error', text: err.response?.data?.message || 'Could not import that profile.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="km-video-editor space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
        <p className="km-video-editor-title">Researcher profile</p>
        <p className="km-video-editor-hint">
          Copy your numbers from Google Scholar, ORCID or ResearchGate. They show on your card as entered.
        </p>
        </div>
      </div>

      {importUrl && (
        <div className="rounded-lg border border-black/10 bg-white p-3">
          <p className="text-sm font-semibold text-[#1a3d42]">Import from Google Scholar</p>
          <p className="mt-0.5 text-xs text-[#1a3d42]/55">
            Paste your Scholar profile link to fill in metrics, citations per year and papers. You can edit
            everything afterwards.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <input
              className="admin-input min-w-0 flex-1"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://scholar.google.com/citations?user=…"
              aria-label="Google Scholar profile link"
            />
            <button type="button" className="km-video-add" style={addBtn} disabled={busy || !link.trim()} onClick={runImport}>
              {busy ? 'Importing…' : 'Import'}
            </button>
          </div>
          {status.text && (
            <p className={`mt-2 text-xs ${status.type === 'error' ? 'text-rose-600' : 'text-emerald-700'}`}>{status.text}</p>
          )}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-[#1a3d42]/70">Scholar / ORCID profile link</span>
          <input
            className="admin-input"
            value={data.scholarUrl}
            onChange={(e) => update({ scholarUrl: e.target.value })}
            placeholder="https://scholar.google.com/citations?user=…"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-[#1a3d42]/70">Research interests (comma separated)</span>
          <input
            className="admin-input"
            value={data.interests}
            onChange={(e) => update({ interests: e.target.value })}
            placeholder="Software quality, AI in Education"
          />
        </label>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-[#1a3d42]">Metrics</p>
        <div className="grid grid-cols-[1fr_5.5rem_5.5rem] items-center gap-2">
          <span />
          <span className="text-xs font-semibold text-[#1a3d42]/55">All</span>
          <input
            className="admin-input"
            aria-label="Since year"
            value={data.sinceYear}
            onChange={(e) => update({ sinceYear: e.target.value })}
            placeholder="Since 2021"
          />
          {METRICS.map(([all, since, label]) => (
            <React.Fragment key={all}>
              <span className="text-sm text-[#1a3d42]/75">{label}</span>
              <input
                className="admin-input"
                inputMode="numeric"
                aria-label={`${label} all time`}
                value={data.metrics[all]}
                onChange={(e) => setMetric(all, e.target.value)}
              />
              <input
                className="admin-input"
                inputMode="numeric"
                aria-label={`${label} since ${data.sinceYear || 'year'}`}
                value={data.metrics[since]}
                onChange={(e) => setMetric(since, e.target.value)}
              />
            </React.Fragment>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-[#1a3d42]">Citations per year</p>
        <div className="space-y-2">
          {data.citationsByYear.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                className="admin-input"
                aria-label="Year"
                placeholder="Year"
                value={row.year || ''}
                onChange={(e) => setRow('citationsByYear', i, { year: e.target.value })}
              />
              <input
                className="admin-input"
                aria-label="Citations"
                placeholder="Citations"
                inputMode="numeric"
                value={row.count ?? ''}
                onChange={(e) => setRow('citationsByYear', i, { count: e.target.value })}
              />
              <button type="button" className="km-video-remove" aria-label="Remove year" onClick={() => removeRow('citationsByYear', i)}>
                <CloseIcon sx={{ fontSize: 18 }} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="km-video-add mt-2"
          style={addBtn}
          onClick={() => update({ citationsByYear: [...data.citationsByYear, { year: '', count: '' }] })}
        >
          <AddIcon sx={{ fontSize: 18 }} /> Add year
        </button>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-[#1a3d42]">Publications ({data.publications.length})</p>
        <div className="space-y-3">
          {data.publications.map((pub, i) => (
            <div key={i} className="rounded-lg border border-black/10 bg-white p-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <input className="admin-input sm:col-span-2" placeholder="Title" value={pub.title || ''} onChange={(e) => setRow('publications', i, { title: e.target.value })} />
                <input className="admin-input sm:col-span-2" placeholder="Authors" value={pub.authors || ''} onChange={(e) => setRow('publications', i, { authors: e.target.value })} />
                <input className="admin-input sm:col-span-2" placeholder="Journal / conference" value={pub.venue || ''} onChange={(e) => setRow('publications', i, { venue: e.target.value })} />
                <input className="admin-input" placeholder="Year" value={pub.year || ''} onChange={(e) => setRow('publications', i, { year: e.target.value })} />
                <input className="admin-input" placeholder="Cited by" inputMode="numeric" value={pub.citedBy ?? ''} onChange={(e) => setRow('publications', i, { citedBy: e.target.value })} />
                <input className="admin-input sm:col-span-2" placeholder="Link (DOI / paper URL)" value={pub.url || ''} onChange={(e) => setRow('publications', i, { url: e.target.value })} />
              </div>
              <button type="button" className="mt-2 text-xs font-medium text-rose-600" onClick={() => removeRow('publications', i)}>
                Remove paper
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="km-video-add mt-2"
          style={addBtn}
          onClick={() =>
            update({ publications: [...data.publications, { title: '', authors: '', venue: '', year: '', citedBy: '', url: '' }] })
          }
        >
          <AddIcon sx={{ fontSize: 18 }} /> Add paper
        </button>
      </div>
    </div>
  );
};

export default ResearcherEditor;

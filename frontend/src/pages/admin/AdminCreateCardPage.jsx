import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createWorker } from 'tesseract.js';
import api from '../../services/api.js';
import { parseBusinessCardText, preprocessCardImage } from '../../utils/ocrCard.js';

const empty = {
  fullName: '',
  title: '',
  company: '',
  location: 'Dar es Salaam, Tanzania',
  phone: '+255 ',
  email: '',
  website: '',
  whatsapp: '+255',
  photoUrl: '',
  logoUrl: '',
  linkedin: '',
  twitter: '',
  github: '',
  instagram: '',
  active: true
};

const fields = [
  ['fullName', 'Full Name', 'Japhari Mbaru'],
  ['title', 'Title / Position', 'Founder'],
  ['company', 'Organisation', 'Swahili Systems'],
  ['location', 'Location', 'Dar es Salaam, Tanzania'],
  ['phone', 'Phone', '+255 714 076 404'],
  ['email', 'Email', 'name@company.co.tz'],
  ['website', 'Website', 'https://'],
  ['whatsapp', 'WhatsApp', '+255714076404'],
  ['photoUrl', 'Photo URL', 'https://...'],
  ['logoUrl', 'Logo URL', '/logos/swahili-systems.svg'],
  ['linkedin', 'LinkedIn', 'https://linkedin.com/in/...'],
  ['twitter', 'Twitter / X', 'https://x.com/...'],
  ['github', 'GitHub', 'https://github.com/...'],
  ['instagram', 'Instagram', 'https://instagram.com/...']
];

const AdminCreateCardPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanPercent, setScanPercent] = useState(0);
  const [progress, setProgress] = useState('');
  const [aiEnabled, setAiEnabled] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const progressTimer = useRef(null);

  useEffect(() => {
    api
      .get('/api/admin/cards/scan/status')
      .then((res) => setAiEnabled(Boolean(res.data.data?.enabled)))
      .catch(() => setAiEnabled(false));
    return () => {
      if (progressTimer.current) clearInterval(progressTimer.current);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, []);

  const onChange = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const applyScan = (data) => {
    setForm((prev) => ({
      ...prev,
      fullName: data.fullName || prev.fullName,
      title: data.title || prev.title,
      company: data.company || prev.company,
      phone: data.phone || prev.phone,
      email: data.email || prev.email,
      website: data.website || prev.website,
      location: data.location || prev.location,
      whatsapp: data.whatsapp || data.phone || prev.whatsapp
    }));
  };

  const stopTicker = () => {
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
  };

  const onScanFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setError('');
    setMessage('');
    setScanning(true);
    setScanPercent(8);
    setProgress('Reading business card…');
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));

    progressTimer.current = setInterval(() => {
      setScanPercent((p) => Math.min(92, p + Math.random() * 8));
    }, 400);

    try {
      if (aiEnabled) {
        const body = new FormData();
        body.append('file', file);
        const res = await api.post('/api/admin/cards/scan', body, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        applyScan(res.data.data || {});
        setMessage('Fields filled from AI scan — review before creating.');
      } else {
        setProgress('Local OCR…');
        const processed = await preprocessCardImage(file);
        const worker = await createWorker('eng');
        const { data } = await worker.recognize(processed);
        await worker.terminate();
        applyScan(parseBusinessCardText(data.text || ''));
        setMessage('Fields filled from local OCR — review carefully before creating.');
      }
      setScanPercent(100);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not scan this card. Fill the form manually.');
    } finally {
      stopTicker();
      setScanning(false);
      setProgress('');
      setTimeout(() => setScanPercent(0), 600);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await api.post('/api/admin/cards', form);
      const created = res.data.data;
      navigate(created?.publicId ? `/admin/cards/${created.publicId}` : '/admin/cards');
    } catch {
      setError('Could not create card. Check required fields and try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <p className="text-sm text-[#1a3d42]/55">
        Scan a paper business card to prefill, or enter details manually. After create, invite the owner with an OTP
        so they can set a login password.
      </p>

      <section className="admin-panel p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-[#1a3d42]">Scan business card</h2>
            <p className="mt-1 text-sm text-[#1a3d42]/50">
              {aiEnabled ? 'AI vision scan available' : 'AI not configured — local OCR fallback'}
            </p>
          </div>
          <label
            className={`cursor-pointer rounded-md px-4 py-2.5 text-sm font-semibold text-white ${
              scanning ? 'bg-[#0d7377]/70' : 'bg-[#0d7377] hover:bg-[#0a5f63]'
            }`}
          >
            {scanning ? 'Scanning…' : 'Upload card photo'}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              disabled={scanning}
              onChange={onScanFile}
            />
          </label>
        </div>

        {(scanning || progress) && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <p className="text-[#0d7377]">{progress || 'Working…'}</p>
              <p className="tabular-nums text-[#1a3d42]/50">{Math.round(scanPercent)}%</p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#0d7377]/10">
              <div
                className="h-full rounded-full bg-[#0d7377] transition-[width] duration-300"
                style={{ width: `${Math.min(100, Math.max(4, scanPercent))}%` }}
              />
            </div>
          </div>
        )}

        {previewUrl && (
          <img
            src={previewUrl}
            alt="Scanned card"
            className="mt-4 h-36 w-full max-w-sm rounded-lg border border-black/5 object-cover"
          />
        )}
      </section>

      <form onSubmit={onSubmit} className="admin-panel p-5 sm:p-7">
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map(([key, label, placeholder]) => (
            <label key={key} className="block">
              <span className="mb-1.5 block text-sm font-medium text-[#1a3d42]/70">{label}</span>
              <input
                value={form[key]}
                onChange={onChange(key)}
                placeholder={placeholder}
                required={key === 'fullName'}
                className="admin-input"
              />
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
          <Link
            to="/admin/cards"
            className="rounded-md border border-black/10 px-4 py-2.5 text-sm font-medium text-[#1a3d42]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving || scanning}
            className="rounded-md bg-[#9a6b45] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#865c3b] disabled:opacity-60"
          >
            {saving ? 'Creating…' : 'Create card'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminCreateCardPage;

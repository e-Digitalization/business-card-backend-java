import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createWorker } from 'tesseract.js';
import api from '../../services/api.js';
import GovernmentEditor from '../../components/GovernmentEditor.jsx';
import BankerEditor from '../../components/BankerEditor.jsx';
import ResearcherEditor from '../../components/ResearcherEditor.jsx';
import CardDetailsFields from '../../components/CardDetailsFields.jsx';
import CardLookFields from '../../components/CardLookFields.jsx';
import notify from '../../utils/toast.jsx';
import { hasCategory } from '../../utils/cardCategories.js';
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
  youtubeChannel: '',
  youtubeVideos: '',
  bookingUrl: '',
  podcastUrl: '',
  tiktok: '',
  telegram: '',
  wechat: '',
  weibo: '',
  douyin: '',
  xiaohongshu: '',
  theme: 'lagoon',
  primaryColor: '',
  accentColor: '',
  linkedin: '',
  twitter: '',
  github: '',
  instagram: '',
  categories: '',
  researcherData: '',
  bankerData: '',
  governmentData: '',
  active: true
};

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

  const setField = (key, value) => setForm((p) => ({ ...p, [key]: value }));

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
        notify.success('Card scanned — review the fields.');
      } else {
        setProgress('Local OCR…');
        const processed = await preprocessCardImage(file);
        const worker = await createWorker('eng');
        const { data } = await worker.recognize(processed);
        await worker.terminate();
        applyScan(parseBusinessCardText(data.text || ''));
        setMessage('Fields filled from local OCR — review carefully before creating.');
        notify.success('Card scanned — review the fields.');
      }
      setScanPercent(100);
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not scan this card. Fill the form manually.';
      setError(msg);
      notify.error(msg);
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
      notify.success('Card created successfully.');
      navigate(created?.publicId ? `/admin/cards/${created.publicId}` : '/admin/cards');
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not create card. Check required fields and try again.';
      setError(msg);
      notify.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="sm:col-span-2 lg:col-span-3">
            <CardDetailsFields card={form} setField={setField} wide />
          </div>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-[#1a3d42]/70">Logo URL</span>
            <input
              value={form.logoUrl}
              onChange={(e) => setField('logoUrl', e.target.value)}
              placeholder="https://…/logo.png (or upload after creating)"
              className="admin-input"
            />
          </label>
          <div className="sm:col-span-2 lg:col-span-3">
            <CardLookFields card={form} setField={setField} />
          </div>
          {hasCategory(form, 'government') && (
            <div className="sm:col-span-2 lg:col-span-3">
              <GovernmentEditor
                value={form.governmentData}
                onChange={(next) => setForm((p) => ({ ...p, governmentData: next }))}
                uploadUrl="/api/admin/uploads/banner"
                accent="#9a6b45"
              />
            </div>
          )}
          {hasCategory(form, 'banker') && (
            <div className="sm:col-span-2 lg:col-span-3">
              <BankerEditor
                value={form.bankerData}
                onChange={(next) => setForm((p) => ({ ...p, bankerData: next }))}
                uploadUrl="/api/admin/uploads/banner"
                accent="#9a6b45"
              />
            </div>
          )}
          {hasCategory(form, 'researcher') && (
            <div className="sm:col-span-2 lg:col-span-3">
              <ResearcherEditor
                value={form.researcherData}
                onChange={(next) => setForm((p) => ({ ...p, researcherData: next }))}
                importUrl="/api/admin/import/researcher"
                accent="#9a6b45"
              />
            </div>
          )}
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

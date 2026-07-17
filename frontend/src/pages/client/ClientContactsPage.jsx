import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { createWorker } from 'tesseract.js';
import api from '../../services/api.js';
import PaginationBar from '../../components/PaginationBar.jsx';
import { initialsFromName } from '../../utils/media.js';
import { parseBusinessCardText, preprocessCardImage } from '../../utils/ocrCard.js';
import ContactCardVisual from './ContactCardVisual.jsx';

const emptyDraft = {
  fullName: '',
  title: '',
  company: '',
  phone: '',
  email: '',
  website: '',
  location: '',
  whatsapp: '',
  notes: '',
  source: 'scan',
  rawText: ''
};

const defaultScanStatus = {
  enabled: false,
  provider: 'none',
  freeLimit: 2,
  used: 0,
  remaining: 2,
  subscribed: false,
  canScan: true,
  priceTzs: 10000,
  currency: 'TZS',
  paymentProvider: 'mock'
};

const formatMoney = (amount, currency = 'TZS') => {
  if (amount == null) return '';
  try {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0
    }).format(amount);
  } catch {
    return `${amount.toLocaleString()} ${currency}`;
  }
};

const ClientContactsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [contacts, setContacts] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanPercent, setScanPercent] = useState(0);
  const [progress, setProgress] = useState('');
  const [draft, setDraft] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showRaw, setShowRaw] = useState(false);
  const [aiScan, setAiScan] = useState(defaultScanStatus);
  const [viewing, setViewing] = useState(null);
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [payPhone, setPayPhone] = useState('');
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);
  const progressTimer = useRef(null);

  const loadScanStatus = async () => {
    try {
      const res = await api.get('/api/client/contacts/scan/status');
      setAiScan({ ...defaultScanStatus, ...(res.data.data || {}) });
    } catch {
      setAiScan(defaultScanStatus);
    }
  };

  const load = async (query = q, nextPage = page, nextSize = size) => {
    setLoading(true);
    try {
      const res = await api.get('/api/client/contacts', {
        params: {
          page: nextPage,
          size: nextSize,
          ...(query.trim() ? { q: query.trim() } : {})
        }
      });
      const data = res.data.data || {};
      setContacts(data.items || []);
      setPage(data.page ?? nextPage);
      setSize(data.size ?? nextSize);
      setTotalElements(data.totalElements ?? 0);
      setTotalPages(data.totalPages ?? 0);
      return data.items || [];
    } catch {
      setError('Could not load contacts.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    loadScanStatus();
  }, []);

  useEffect(() => {
    const pay = searchParams.get('pay');
    const order = searchParams.get('order');
    if (!pay) return undefined;

    const clearPayParams = () => {
      const next = new URLSearchParams(searchParams);
      next.delete('pay');
      next.delete('order');
      setSearchParams(next, { replace: true });
    };

    if (pay === 'success' && order) {
      api
        .get(`/api/client/subscription/orders/${order}`)
        .then(async (res) => {
          if (res.data.data?.subscribed || res.data.data?.status === 'PAID') {
            setMessage('Subscription active — unlimited AI scans unlocked.');
            await loadScanStatus();
          } else {
            setMessage('Payment received. Activating your subscription…');
            await loadScanStatus();
          }
        })
        .catch(() => setError('Could not confirm payment status.'))
        .finally(clearPayParams);
    } else if (pay === 'cancel') {
      setError('Payment cancelled. You can subscribe anytime to keep scanning.');
      clearPayParams();
    } else if (pay === 'mock' && order) {
      setPendingOrder({ orderId: order, mock: true });
      setSubscribeOpen(true);
      clearPayParams();
    }
    return undefined;
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!viewing) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setViewing(null);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [viewing]);

  useEffect(
    () => () => {
      if (progressTimer.current) clearInterval(progressTimer.current);
    },
    []
  );

  const filteredHint = useMemo(() => {
    if (!q.trim()) return `${totalElements} contact${totalElements === 1 ? '' : 's'}`;
    return `${totalElements} result${totalElements === 1 ? '' : 's'}`;
  }, [totalElements, q]);

  const quotaLabel = useMemo(() => {
    if (aiScan.subscribed) return 'Unlimited AI scans';
    const remaining = aiScan.remaining ?? Math.max(0, (aiScan.freeLimit || 2) - (aiScan.used || 0));
    return `${remaining} free AI scan${remaining === 1 ? '' : 's'} left`;
  }, [aiScan]);

  const onSearch = (e) => {
    e.preventDefault();
    setPage(0);
    load(q, 0, size);
  };

  const stopProgressTicker = () => {
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
  };

  const startAiProgressTicker = () => {
    stopProgressTicker();
    setScanPercent(8);
    setProgress('Uploading card photo…');
    progressTimer.current = setInterval(() => {
      setScanPercent((prev) => {
        if (prev < 28) {
          setProgress('Uploading card photo…');
          return prev + 3;
        }
        if (prev < 62) {
          setProgress(`AI reading card (${aiScan.provider})…`);
          return prev + 2;
        }
        if (prev < 88) {
          setProgress('Extracting name, phone & email…');
          return prev + 1;
        }
        return prev;
      });
    }, 420);
  };

  const finishProgress = (label = 'Done') => {
    stopProgressTicker();
    setScanPercent(100);
    setProgress(label);
  };

  const openSubscribe = () => {
    setError('');
    setSubscribeOpen(true);
  };

  const runLocalOcr = async (file) => {
    setProgress('Preparing image…');
    setScanPercent(12);
    const processed = await preprocessCardImage(file);
    setProgress('Reading card (local OCR)…');
    setScanPercent(28);
    const worker = await createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text' && m.progress) {
          const pct = Math.round(28 + m.progress * 70);
          setScanPercent(pct);
          setProgress(`Reading card… ${Math.round(m.progress * 100)}%`);
        }
      }
    });
    await worker.setParameters({
      tessedit_pageseg_mode: '6',
      preserve_interword_spaces: '1'
    });
    const { data } = await worker.recognize(processed);
    await worker.terminate();
    return parseBusinessCardText(data.text || '');
  };

  const onFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (aiScan.enabled && !aiScan.canScan && !aiScan.subscribed) {
      openSubscribe();
      event.target.value = '';
      return;
    }

    setError('');
    setMessage('');
    setShowRaw(false);
    setScanning(true);
    setScanPercent(0);
    setPreviewUrl(URL.createObjectURL(file));

    try {
      let parsed;
      if (aiScan.enabled) {
        startAiProgressTicker();
        const form = new FormData();
        form.append('file', file);
        try {
          const res = await api.post('/api/client/contacts/scan', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 90000,
            onUploadProgress: (evt) => {
              if (!evt.total) return;
              const uploadPct = Math.min(24, Math.round((evt.loaded / evt.total) * 24));
              setScanPercent((prev) => Math.max(prev, uploadPct));
            }
          });
          parsed = res.data.data;
          if (parsed) {
            setAiScan((prev) => ({
              ...prev,
              used: parsed.used ?? prev.used,
              remaining: parsed.remaining ?? prev.remaining,
              subscribed: parsed.subscribed ?? prev.subscribed,
              canScan: parsed.canScan ?? prev.canScan,
              freeLimit: parsed.freeLimit ?? prev.freeLimit
            }));
          }
          finishProgress('AI scan complete');
        } catch (err) {
          stopProgressTicker();
          const status = err?.response?.status;
          const apiMessage = err?.response?.data?.message || err?.response?.data?.error;
          if (status === 402) {
            setScanPercent(0);
            setProgress('');
            setError(apiMessage || 'Free AI scans used up. Subscribe to continue.');
            openSubscribe();
            await loadScanStatus();
            return;
          }
          setProgress('AI unavailable — trying local OCR…');
          setScanPercent(20);
          parsed = await runLocalOcr(file);
          finishProgress('Local OCR complete');
        }
      } else {
        parsed = await runLocalOcr(file);
        finishProgress('Local OCR complete');
      }

      const filled = [parsed.fullName, parsed.email, parsed.phone, parsed.company].filter(Boolean).length;
      setDraft({ ...emptyDraft, ...parsed, source: 'scan' });
      if (filled === 0) {
        setMessage('Little text found — edit the fields using the raw text below, then save.');
        setShowRaw(true);
      } else {
        setMessage(
          parsed.provider
            ? `Extracted with ${parsed.provider}. Review, then save to Contacts.`
            : 'Review the details below, then save to Contacts.'
        );
      }
      setTimeout(() => {
        setProgress('');
        setScanPercent(0);
      }, 600);
    } catch {
      stopProgressTicker();
      setError('Could not read this card. Try a clearer photo, or enter details manually.');
      setDraft({ ...emptyDraft, source: 'scan' });
      setProgress('');
      setScanPercent(0);
    } finally {
      setScanning(false);
      event.target.value = '';
    }
  };

  const startCheckout = async (e) => {
    e.preventDefault();
    setCheckoutBusy(true);
    setError('');
    try {
      const res = await api.post('/api/client/subscription/checkout', {
        phone: payPhone.trim() || undefined
      });
      const data = res.data.data;
      setPendingOrder(data);
      if (data?.paymentGatewayUrl && !data.mock) {
        window.location.href = data.paymentGatewayUrl;
        return;
      }
      setMessage(
        data?.mock
          ? 'Demo checkout ready — confirm payment below to unlock unlimited AI scans.'
          : 'Checkout created. Complete payment to unlock unlimited scans.'
      );
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not start payment.');
    } finally {
      setCheckoutBusy(false);
    }
  };

  const confirmMockPay = async () => {
    if (!pendingOrder?.orderId) return;
    setCheckoutBusy(true);
    setError('');
    try {
      await api.post('/api/client/subscription/mock-pay', { orderId: pendingOrder.orderId });
      setSubscribeOpen(false);
      setPendingOrder(null);
      setMessage('Subscription active — unlimited AI scans unlocked.');
      await loadScanStatus();
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not complete demo payment.');
    } finally {
      setCheckoutBusy(false);
    }
  };

  const saveDraft = async (e) => {
    e.preventDefault();
    if (!draft?.fullName && !draft?.email && !draft?.phone) {
      setError('Add at least a name, phone, or email.');
      return;
    }
    setError('');
    try {
      const { rawText, ...contactFields } = draft;
      const res = await api.post('/api/client/contacts', {
        ...contactFields,
        notes: contactFields.notes || rawText?.slice(0, 500) || '',
        photoUrl: previewUrl.startsWith('blob:') ? '' : previewUrl
      });
      const saved = res.data.data;
      setDraft(null);
      setPreviewUrl('');
      setMessage('Contact saved.');
      await load();
      if (saved) setViewing(saved);
    } catch {
      setError('Could not save contact.');
    }
  };

  const removeContact = async (id) => {
    if (!window.confirm('Remove this contact?')) return;
    await api.delete(`/api/client/contacts/${id}`);
    if (viewing?.id === id) setViewing(null);
    await load();
  };

  const downloadVcf = (c) => {
    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${c.fullName || ''}`,
      c.title ? `TITLE:${c.title}` : '',
      c.company ? `ORG:${c.company}` : '',
      c.phone ? `TEL:${c.phone}` : '',
      c.email ? `EMAIL:${c.email}` : '',
      c.website ? `URL:${c.website}` : '',
      'END:VCARD'
    ].filter(Boolean);
    const blob = new Blob([lines.join('\n')], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${c.fullName || 'contact'}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const cardVariant = (c) => (c?.source === 'tap' || c?.sourceProfileSlug ? 'lagoon' : 'ink');

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-[#9a6b45]">Contacts</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-[#1a3d42]">Your network</h1>
          <p className="mt-1 text-sm text-[#1a3d42]/55">
            Save people after a tap, or photograph a paper card
            {aiScan.enabled ? ` (AI · ${aiScan.provider})` : ' (local OCR)'}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {aiScan.enabled && !aiScan.canScan && !aiScan.subscribed ? (
            <button
              type="button"
              onClick={openSubscribe}
              className="rounded-md bg-[#0d7377] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0a5f63]"
            >
              Subscribe to scan
            </button>
          ) : (
            <label
              className={`cursor-pointer rounded-md px-4 py-2.5 text-sm font-semibold text-white ${
                scanning ? 'bg-[#0d7377]/70' : 'bg-[#0d7377] hover:bg-[#0a5f63]'
              }`}
            >
              {scanning ? 'Scanning…' : aiScan.enabled ? 'Scan with AI' : 'Scan business card'}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={onFile}
                disabled={scanning}
              />
            </label>
          )}
        </div>
      </div>

      {aiScan.enabled && (
        <div className="client-panel flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-[#1a3d42]">{quotaLabel}</p>
            <p className="text-xs text-[#1a3d42]/50">
              {aiScan.subscribed
                ? 'Your Selcom subscription is active.'
                : `Free plan includes ${aiScan.freeLimit || 2} AI scans. Then ${formatMoney(
                    aiScan.priceTzs,
                    aiScan.currency
                  )} via Selcom.`}
            </p>
          </div>
          {!aiScan.subscribed && (
            <button
              type="button"
              onClick={openSubscribe}
              className="rounded-md border border-black/10 px-3 py-2 text-sm font-medium text-[#1a3d42]"
            >
              {aiScan.canScan ? 'View plans' : 'Subscribe with Selcom'}
            </button>
          )}
        </div>
      )}

      <form onSubmit={onSearch} className="client-panel flex flex-wrap gap-2 p-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, company, phone, email…"
          className="admin-input min-w-[220px] flex-1"
        />
        <button type="submit" className="rounded-md border border-black/10 px-4 py-2.5 text-sm font-medium text-[#1a3d42]">
          Search
        </button>
      </form>

      {(scanning || progress) && (
        <div className="client-panel space-y-2 p-4">
          <div className="flex items-center justify-between gap-3 text-sm">
            <p className="font-medium text-[#0d7377]">{progress || 'Working…'}</p>
            <p className="tabular-nums text-[#1a3d42]/55">{Math.min(100, Math.round(scanPercent))}%</p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#0d7377]/10">
            <div
              className="h-full rounded-full bg-[#0d7377] transition-[width] duration-300 ease-out"
              style={{ width: `${Math.min(100, Math.max(4, scanPercent))}%` }}
            />
          </div>
        </div>
      )}

      {message && (
        <p className="rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>
      )}
      {error && (
        <p className="rounded-md border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>
      )}

      {draft && (
        <form onSubmit={saveDraft} className="client-panel space-y-3 p-5">
          <div className="flex flex-wrap items-start gap-4">
            {previewUrl && (
              <img src={previewUrl} alt="Scanned card" className="h-28 w-40 rounded-lg border border-black/5 object-cover" />
            )}
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-lg font-semibold text-[#1a3d42]">Review scanned card</h2>
              <p className="text-sm text-[#1a3d42]/50">Check the details, then save to open the card view.</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ['fullName', 'Full name'],
              ['title', 'Title'],
              ['company', 'Company'],
              ['phone', 'Phone'],
              ['email', 'Email'],
              ['website', 'Website'],
              ['location', 'Location']
            ].map(([key, label]) => (
              <label key={key} className="block">
                <span className="mb-1 block text-sm text-[#1a3d42]/70">{label}</span>
                <input
                  className="admin-input"
                  value={draft[key] || ''}
                  onChange={(e) => setDraft((p) => ({ ...p, [key]: e.target.value }))}
                />
              </label>
            ))}
          </div>
          {draft.rawText && (
            <div className="rounded-md border border-black/5 bg-[#f7f4ef] p-3">
              <button
                type="button"
                className="text-sm font-medium text-[#0d7377]"
                onClick={() => setShowRaw((v) => !v)}
              >
                {showRaw ? 'Hide' : 'Show'} raw OCR text
              </button>
              {showRaw && (
                <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap text-xs text-[#1a3d42]/70">
                  {draft.rawText}
                </pre>
              )}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setDraft(null);
                setPreviewUrl('');
              }}
              className="rounded-md border border-black/10 px-4 py-2.5 text-sm"
            >
              Cancel
            </button>
            <button type="submit" className="rounded-md bg-[#0d7377] px-4 py-2.5 text-sm font-semibold text-white">
              Save contact
            </button>
          </div>
        </form>
      )}

      <section className="client-panel overflow-hidden">
        <div className="border-b border-black/5 px-5 py-3 text-sm text-[#1a3d42]/50">{filteredHint}</div>
        {loading && <p className="px-5 py-8 text-sm text-[#1a3d42]/50">Loading…</p>}
        {!loading && contacts.length === 0 && (
          <div className="px-5 py-12 text-center">
            <p className="font-display text-lg font-semibold text-[#1a3d42]">No contacts yet</p>
            <p className="mt-1 text-sm text-[#1a3d42]/50">
              Tap someone’s Kadi Moja and tap “Save to my Contacts”, or scan a paper card.
            </p>
          </div>
        )}
        <div className="divide-y divide-black/5">
          {contacts.map((c) => (
            <div key={c.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
              <button
                type="button"
                onClick={() => setViewing(c)}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold text-white ${
                    cardVariant(c) === 'ink' ? 'bg-[#312e81]' : 'bg-[#0d7377]'
                  }`}
                >
                  {initialsFromName(c.fullName).slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[#1a3d42]">{c.fullName || 'Unnamed'}</p>
                  <p className="truncate text-sm text-[#1a3d42]/50">
                    {[c.title, c.company].filter(Boolean).join(' · ') || c.email || c.phone || '—'}
                  </p>
                  <p className="mt-0.5 text-[11px] uppercase tracking-wide text-[#9a6b45]">
                    {c.source || 'manual'}
                    {c.sourceProfileSlug ? ` · /u/${c.sourceProfileSlug}` : ''}
                  </p>
                </div>
              </button>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setViewing(c)}
                  className="rounded-md bg-[#312e81] px-3 py-2 text-sm font-semibold text-white hover:bg-[#1e1b4b]"
                >
                  View card
                </button>
                {c.sourceProfileSlug && (
                  <Link
                    to={`/u/${c.sourceProfileSlug}`}
                    className="rounded-md border border-black/10 px-3 py-2 text-sm text-[#1a3d42]"
                  >
                    Live profile
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => downloadVcf(c)}
                  className="rounded-md border border-black/10 px-3 py-2 text-sm text-[#1a3d42]"
                >
                  Save .vcf
                </button>
                <button
                  type="button"
                  onClick={() => removeContact(c.id)}
                  className="rounded-md px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        <PaginationBar
          page={page}
          size={size}
          totalElements={totalElements}
          totalPages={totalPages}
          onPageChange={(next) => {
            setPage(next);
            load(q, next, size);
          }}
          onSizeChange={(next) => {
            setSize(next);
            setPage(0);
            load(q, 0, next);
          }}
          sizeOptions={[5, 10, 25]}
        />
      </section>

      {subscribeOpen && (
        <div className="km-contact-viewer" role="dialog" aria-modal="true" aria-label="Subscribe">
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Close"
            onClick={() => setSubscribeOpen(false)}
          />
          <div className="km-contact-viewer-panel relative z-10 max-w-md">
            <div className="rounded-xl bg-white p-5 text-[#1a3d42] shadow-xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9a6b45]">Subscription</p>
                  <h2 className="mt-1 font-display text-2xl font-semibold">Unlock AI scans</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSubscribeOpen(false)}
                  className="rounded-md border border-black/10 px-2.5 py-1 text-sm"
                >
                  ✕
                </button>
              </div>
              <p className="mt-3 text-sm text-[#1a3d42]/60">
                You’ve used your {aiScan.freeLimit || 2} free AI card scans. Subscribe with Selcom (M-Pesa, Tigo Pesa,
                Airtel Money, or card) for unlimited scanning.
              </p>
              <div className="mt-4 rounded-lg border border-black/5 bg-[#f7f4ef] px-4 py-3">
                <p className="text-sm text-[#1a3d42]/55">AI Scan plan</p>
                <p className="mt-1 font-display text-2xl font-semibold text-[#1a3d42]">
                  {formatMoney(aiScan.priceTzs, aiScan.currency)}
                </p>
                <p className="mt-1 text-xs text-[#1a3d42]/50">One-time unlock · paid via Selcom</p>
              </div>

              {pendingOrder?.mock ? (
                <div className="mt-4 space-y-3">
                  <p className="text-sm text-[#0d7377]">
                    Demo mode (Selcom credentials not set). Confirm to activate subscription locally.
                  </p>
                  <button
                    type="button"
                    disabled={checkoutBusy}
                    onClick={confirmMockPay}
                    className="w-full rounded-md bg-[#0d7377] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {checkoutBusy ? 'Confirming…' : 'Confirm demo payment'}
                  </button>
                </div>
              ) : (
                <form onSubmit={startCheckout} className="mt-4 space-y-3">
                  <label className="block">
                    <span className="mb-1 block text-sm text-[#1a3d42]/70">Mobile money phone (optional)</span>
                    <input
                      className="admin-input"
                      value={payPhone}
                      onChange={(e) => setPayPhone(e.target.value)}
                      placeholder="2557XXXXXXXX"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={checkoutBusy}
                    className="w-full rounded-md bg-[#0d7377] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {checkoutBusy ? 'Starting Selcom…' : 'Pay with Selcom'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {viewing && (
        <div className="km-contact-viewer" role="dialog" aria-modal="true" aria-label="Contact card">
          <button type="button" className="absolute inset-0 cursor-default" aria-label="Close" onClick={() => setViewing(null)} />
          <div className="km-contact-viewer-panel relative z-10">
            <div className="km-contact-viewer-bar">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">Card view</p>
              <button
                type="button"
                onClick={() => setViewing(null)}
                className="rounded-md border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/20"
              >
                Close
              </button>
            </div>
            <div className="p-3 pt-2">
              <ContactCardVisual
                contact={viewing}
                variant={cardVariant(viewing)}
                footer={
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => downloadVcf(viewing)}
                      className="km-card-cta"
                      style={cardVariant(viewing) === 'ink' ? { background: '#312e81' } : undefined}
                    >
                      Save contact details
                    </button>
                    {viewing.sourceProfileSlug && (
                      <Link to={`/u/${viewing.sourceProfileSlug}`} className="km-card-cta-ghost text-center">
                        Open live Kadi Moja profile
                      </Link>
                    )}
                  </div>
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientContactsPage;

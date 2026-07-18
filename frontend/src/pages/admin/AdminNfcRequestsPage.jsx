import React, { useEffect, useState } from 'react';
import api from '../../services/api.js';
import PaginationBar from '../../components/PaginationBar.jsx';
import { initialsFromName, resolveMediaUrl } from '../../utils/media.js';

const formatMoney = (amount, currency = 'TZS') => {
  if (amount == null) return '—';
  try {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0
    }).format(amount);
  } catch {
    return `${Number(amount).toLocaleString()} ${currency}`;
  }
};

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Self-contained CR80 print document — used by Print and Export. */
const buildNfcPrintDocument = (row, { autoPrint = false } = {}) => {
  const name = row.ownerName || 'Card holder';
  const title = row.ownerTitle || 'Professional';
  const company = row.ownerCompany || 'Kadi Moja';
  const location = row.ownerLocation || 'Tanzania';
  const photo = resolveMediaUrl(row.ownerPhotoUrl || '');
  const initials = initialsFromName(name);
  const slug = row.cardSlug ? `/u/${row.cardSlug}` : '';
  const logoUrl = `${window.location.origin}/logos/kadi-moja-mark-light.png`;
  const photoUrl = photo
    ? /^https?:\/\//i.test(photo) || photo.startsWith('data:')
      ? photo
      : `${window.location.origin}${photo.startsWith('/') ? '' : '/'}${photo}`
    : '';

  const avatarHtml = photoUrl
    ? `<img class="avatar" src="${escapeHtml(photoUrl)}" alt="" />`
    : `<div class="avatar avatar-fallback">${escapeHtml(initials)}</div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>NFC card — ${escapeHtml(name)}</title>
  <style>
    /* Exact CR80 credit-card page — fills print preview with the card */
    @page { size: 85.6mm 53.98mm; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 85.6mm;
      height: 53.98mm;
      overflow: hidden;
      background: #fff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      font-family: Georgia, 'Times New Roman', serif;
      color: #fff;
    }
    .card {
      width: 85.6mm;
      height: 53.98mm;
      background: linear-gradient(145deg, #0d7377 0%, #1a3d42 52%, #0a5f63 100%);
      position: relative;
      overflow: hidden;
    }
    .shine {
      position: absolute; inset: 0; pointer-events: none;
      background:
        radial-gradient(circle at 18% 20%, rgba(255,255,255,0.18), transparent 42%),
        radial-gradient(circle at 88% 78%, rgba(232,145,58,0.22), transparent 40%);
    }
    .inner {
      position: relative; z-index: 1;
      display: flex; flex-direction: column;
      width: 100%; height: 100%;
      padding: 4.2mm 5mm;
    }
    .top {
      display: flex; align-items: flex-start; justify-content: space-between; gap: 3mm;
    }
    .brand { display: flex; align-items: center; gap: 2mm; min-width: 0; }
    .brand img { width: 7mm; height: 7mm; object-fit: contain; flex-shrink: 0; }
    .brand-name { font-size: 4.2mm; font-weight: 700; letter-spacing: -0.02em; line-height: 1.1; color: #fff; }
    .brand-sub {
      margin-top: 0.6mm;
      font-size: 2.2mm;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.55);
      font-family: system-ui, sans-serif;
    }
    .badge {
      flex-shrink: 0;
      border: 0.3mm solid rgba(255,255,255,0.25);
      background: rgba(255,255,255,0.1);
      border-radius: 999px;
      padding: 0.8mm 2mm;
      font-size: 2.2mm;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.9);
      font-family: system-ui, sans-serif;
    }
    .body { margin-top: auto; }
    .person { display: flex; align-items: center; gap: 2.8mm; min-width: 0; }
    .avatar {
      width: 11mm; height: 11mm; border-radius: 999px;
      border: 0.5mm solid rgba(255,255,255,0.5);
      object-fit: cover; flex-shrink: 0;
    }
    .avatar-fallback {
      display: flex; align-items: center; justify-content: center;
      background: rgba(255,255,255,0.15);
      font-size: 3.2mm; font-weight: 700; letter-spacing: 0.04em;
      border: 0.5mm solid rgba(255,255,255,0.4);
      color: #fff;
    }
    .person-text { min-width: 0; }
    .person-name {
      font-size: 3.6mm; font-weight: 700; color: #fff;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 48mm;
    }
    .person-title {
      margin-top: 0.4mm;
      font-size: 2.6mm; color: rgba(255,255,255,0.72);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 48mm;
      font-family: system-ui, sans-serif;
    }
    .person-company {
      margin-top: 0.3mm;
      font-size: 2.4mm; font-style: italic; color: rgba(255,255,255,0.5);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 48mm;
    }
    .footer {
      margin-top: 3.5mm;
      display: flex; align-items: flex-end; justify-content: space-between; gap: 3mm;
    }
    .hint {
      font-size: 2.4mm; line-height: 1.35; color: rgba(255,255,255,0.55);
      font-family: system-ui, sans-serif;
    }
    .waves { display: flex; align-items: center; gap: 1mm; opacity: 0.75; flex-shrink: 0; }
    .waves span {
      display: block; border: 0.45mm solid rgba(255,255,255,0.75);
      border-radius: 999px; border-left-color: transparent; border-bottom-color: transparent;
      transform: rotate(45deg);
    }
    .waves span:nth-child(1) { width: 2mm; height: 2mm; }
    .waves span:nth-child(2) { width: 3.2mm; height: 3.2mm; }
    .waves span:nth-child(3) { width: 4.4mm; height: 4.4mm; }
    .screen-meta {
      display: none;
    }
    @media screen {
      html, body {
        width: auto; height: auto; overflow: auto;
        background: #e8eef0;
        padding: 24px;
      }
      .wrap {
        display: flex; flex-direction: column; align-items: flex-start; gap: 16px;
      }
      .card {
        box-shadow: 0 16px 40px rgba(13, 115, 119, 0.35);
        border-radius: 3mm;
      }
      .screen-meta {
        display: block;
        width: 85.6mm;
        font-family: system-ui, sans-serif;
        font-size: 12px; line-height: 1.55; color: #334;
        background: #fff; border-radius: 8px; padding: 12px 14px;
      }
      .screen-meta p { margin: 0; }
      .screen-meta strong { color: #1a3d42; }
      .screen-meta .note { margin-top: 6px; font-size: 11px; color: #889; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <div class="shine"></div>
      <div class="inner">
        <div class="top">
          <div class="brand">
            <img src="${escapeHtml(logoUrl)}" alt="" />
            <div>
              <div class="brand-name">Kadi Moja</div>
              <div class="brand-sub">Digital NFC</div>
            </div>
          </div>
          <span class="badge">NFC</span>
        </div>
        <div class="body">
          <div class="person">
            ${avatarHtml}
            <div class="person-text">
              <div class="person-name">${escapeHtml(name)}</div>
              <div class="person-title">${escapeHtml(title)}</div>
              <div class="person-company">${escapeHtml(company)}</div>
            </div>
          </div>
          <div class="footer">
            <p class="hint">
              Tap phone to connect<br />
              ${escapeHtml(location)}
            </p>
            <div class="waves" aria-hidden="true"><span></span><span></span><span></span></div>
          </div>
        </div>
      </div>
    </div>
    <div class="screen-meta">
      <p><strong>Order</strong> ${escapeHtml(row.paymentOrderId || row.id || '—')}</p>
      <p><strong>Phone</strong> ${escapeHtml(row.ownerPhone || row.phone || '—')}</p>
      <p><strong>Email</strong> ${escapeHtml(row.ownerEmail || '—')}</p>
      <p><strong>Profile</strong> ${escapeHtml(slug || '—')}</p>
      <p class="note">Credit-card size (85.6 × 53.98 mm) · one-time NFC product</p>
    </div>
  </div>
  ${autoPrint ? '<script>window.onload = function () { setTimeout(function () { window.print(); }, 250); };</script>' : ''}
</body>
</html>`;
};

const NfcPrintFace = ({ row }) => {
  const name = row.ownerName || 'Card holder';
  const title = row.ownerTitle || 'Professional';
  const company = row.ownerCompany || 'Kadi Moja';
  const location = row.ownerLocation || 'Tanzania';
  const photo = resolveMediaUrl(row.ownerPhotoUrl || '');
  const initials = initialsFromName(name);

  return (
    <div className="km-nfc-card km-nfc-print-face">
      <div className="km-nfc-card-shine" aria-hidden="true" />
      <div className="km-nfc-card-inner">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <img src="/logos/kadi-moja-mark-light.png" alt="" className="h-8 w-8" />
            <div>
              <p className="font-display text-lg font-bold tracking-tight text-white">Kadi Moja</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-white/55">Digital NFC</p>
            </div>
          </div>
          <span className="rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/85">
            NFC
          </span>
        </div>

        <div className="mt-auto">
          <div className="flex items-center gap-3">
            {photo ? (
              <img
                src={photo}
                alt=""
                className="h-14 w-14 rounded-full border-2 border-white/50 object-cover shadow-lg"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/40 bg-white/15 text-base font-bold tracking-wide text-white">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate font-semibold text-white">{name}</p>
              <p className="truncate text-xs text-white/70">{title}</p>
              <p className="truncate text-[11px] italic text-white/50">{company}</p>
            </div>
          </div>
          <div className="mt-5 flex items-end justify-between gap-3">
            <p className="text-[11px] leading-snug text-white/55">
              Tap phone to connect
              <br />
              {location}
            </p>
            <div className="km-nfc-waves" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminNfcRequestsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState('');
  const [printRow, setPrintRow] = useState(null);

  const load = async (query = q, statusFilter = status, nextPage = page, nextSize = size) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/admin/nfc-requests', {
        params: {
          page: nextPage,
          size: nextSize,
          ...(query.trim() ? { q: query.trim() } : {}),
          ...(statusFilter ? { status: statusFilter } : {})
        }
      });
      const data = res.data.data || {};
      setItems(data.items || []);
      setPage(data.page ?? nextPage);
      setSize(data.size ?? nextSize);
      setTotalElements(data.totalElements ?? 0);
      setTotalPages(data.totalPages ?? 0);
    } catch {
      setError('Could not load NFC card requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!printRow) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setPrintRow(null);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [printRow]);

  const updateStatus = async (id, nextStatus) => {
    await api.put(`/api/admin/nfc-requests/${id}/status`, { status: nextStatus });
    await load();
  };

  const runPrint = () => {
    if (!printRow) return;
    const doc = buildNfcPrintDocument(printRow, { autoPrint: true });
    const win = window.open('', '_blank', 'noopener,noreferrer,width=520,height=420');
    if (!win) {
      setError('Pop-up blocked — allow pop-ups to print, or use Export print file.');
      return;
    }
    win.document.open();
    win.document.write(doc);
    win.document.close();
  };

  const exportPrintHtml = () => {
    if (!printRow) return;
    const doc = buildNfcPrintDocument(printRow, { autoPrint: false });
    const blob = new Blob([doc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nfc-card-${printRow.cardSlug || printRow.id || 'export'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <p className="max-w-2xl text-sm text-[#1a3d42]/55">
        Users requesting physical NFC cards (one-time TZS 100,000). After payment, print the card face, assign an NFC
        tag, then mark fulfilled.
      </p>

      {error && (
        <p className="rounded-md border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>
      )}

      <section className="admin-panel overflow-hidden km-nfc-admin-list">
        <div className="flex flex-wrap gap-2 border-b border-black/5 px-4 py-4 sm:px-5">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, phone, order…"
            className="admin-input min-w-[220px] flex-1"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-md border border-black/10 bg-white px-3 py-2.5 text-sm text-[#1a3d42]"
          >
            <option value="">All statuses</option>
            <option value="PENDING_PAYMENT">Pending payment</option>
            <option value="PAID">Paid</option>
            <option value="FULFILLING">Fulfilling</option>
            <option value="FULFILLED">Fulfilled</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <button
            type="button"
            onClick={() => {
              setPage(0);
              load(q, status, 0, size);
            }}
            className="rounded-md border border-black/10 px-4 py-2.5 text-sm font-medium text-[#1a3d42]"
          >
            Search
          </button>
        </div>

        {loading && <p className="px-5 py-10 text-sm text-[#1a3d42]/50">Loading requests…</p>}
        {!loading && items.length === 0 && (
          <div className="px-5 py-12 text-center">
            <p className="font-display text-lg font-semibold text-[#1a3d42]">No NFC requests yet</p>
            <p className="mt-1 text-sm text-[#1a3d42]/50">Requests appear after users order from NFC & card look.</p>
          </div>
        )}

        <div className="divide-y divide-black/5">
          {items.map((row) => (
            <div key={row.id} className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#1a3d42]">{row.ownerName || 'User'}</p>
                <p className="text-sm text-[#1a3d42]/55">{row.ownerEmail}</p>
                <p className="mt-1 text-sm text-[#1a3d42]">
                  {row.productName} · {formatMoney(row.amount, row.currency)}
                  <span className="text-[#1a3d42]/45"> · one-time</span>
                </p>
                <p className="text-xs text-[#1a3d42]/45">
                  Order {row.paymentOrderId || '—'}
                  {row.ownerPhone || row.phone ? ` · ${row.ownerPhone || row.phone}` : ''}
                  {row.cardSlug ? ` · /u/${row.cardSlug}` : ''}
                </p>
                {row.deliveryNotes && (
                  <p className="mt-1 text-xs text-[#1a3d42]/55">Note: {row.deliveryNotes}</p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#f7f4ef] px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-[#9a6b45]">
                  {row.status}
                </span>
                <button
                  type="button"
                  onClick={() => setPrintRow(row)}
                  className="rounded-md border border-black/10 px-3 py-2 text-sm font-medium text-[#1a3d42]"
                >
                  Print / export
                </button>
                {row.status === 'PAID' && (
                  <button
                    type="button"
                    onClick={() => updateStatus(row.id, 'FULFILLING')}
                    className="rounded-md border border-black/10 px-3 py-2 text-sm"
                  >
                    Start fulfilling
                  </button>
                )}
                {(row.status === 'PAID' || row.status === 'FULFILLING') && (
                  <button
                    type="button"
                    onClick={() => updateStatus(row.id, 'FULFILLED')}
                    className="rounded-md bg-[#0d7377] px-3 py-2 text-sm font-semibold text-white"
                  >
                    Mark fulfilled
                  </button>
                )}
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
            load(q, status, next, size);
          }}
          onSizeChange={(next) => {
            setSize(next);
            setPage(0);
            load(q, status, 0, next);
          }}
        />
      </section>

      {printRow && (
        <div className="km-nfc-print-overlay" role="dialog" aria-modal="true" aria-label="Print NFC card">
          <button
            type="button"
            className="km-nfc-print-backdrop"
            aria-label="Close"
            onClick={() => setPrintRow(null)}
          />
          <div className="km-nfc-print-panel">
            <div className="km-nfc-print-toolbar">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9a6b45]">Card print</p>
                <h2 className="mt-1 font-display text-xl font-semibold text-[#1a3d42]">
                  {printRow.ownerName || 'NFC card'}
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={runPrint}
                  className="rounded-md bg-[#0d7377] px-3.5 py-2 text-sm font-semibold text-white"
                >
                  Print card
                </button>
                <button
                  type="button"
                  onClick={exportPrintHtml}
                  className="rounded-md border border-black/10 px-3.5 py-2 text-sm font-medium text-[#1a3d42]"
                >
                  Export print file
                </button>
                <button
                  type="button"
                  onClick={() => setPrintRow(null)}
                  className="rounded-md border border-black/10 px-3 py-2 text-sm"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="km-nfc-print-sheet">
              <NfcPrintFace row={printRow} />
              <div className="km-nfc-print-meta">
                <p>
                  <strong>Order</strong> {printRow.paymentOrderId || printRow.id}
                </p>
                <p>
                  <strong>Phone</strong> {printRow.ownerPhone || printRow.phone || '—'}
                </p>
                <p>
                  <strong>Email</strong> {printRow.ownerEmail || '—'}
                </p>
                <p>
                  <strong>Profile</strong>{' '}
                  {printRow.cardSlug ? `/u/${printRow.cardSlug}` : '—'}
                </p>
                <p className="km-nfc-print-meta-note">Credit-card size · one-time NFC product</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNfcRequestsPage;

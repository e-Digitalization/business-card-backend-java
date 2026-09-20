import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api.js';
import PaginationBar from '../../components/PaginationBar.jsx';
import ProfileAvatar from '../../components/ProfileAvatar.jsx';
import NfcPrintModal from '../../components/NfcPrintModal.jsx';
import { requestToPrintContact } from '../../utils/nfcPrintDocument.js';
import { notify } from '../../utils/toast.js';

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

const statusLabel = (status) => {
  if (status === 'PENDING') return 'Pending';
  if (status === 'PENDING_PAYMENT') return 'Awaiting payment';
  if (status === 'PAID') return 'Paid';
  if (status === 'FULFILLING') return 'Preparing';
  if (status === 'FULFILLED') return 'Delivered';
  if (status === 'CANCELLED') return 'Cancelled';
  return status;
};

const statusBadgeClass = (status) => {
  switch (status) {
    case 'PENDING':
      return 'bg-amber-50 text-amber-800';
    case 'PENDING_PAYMENT':
      return 'bg-orange-50 text-orange-800';
    case 'PAID':
      return 'bg-sky-50 text-sky-800';
    case 'FULFILLING':
      return 'bg-violet-50 text-violet-800';
    case 'FULFILLED':
      return 'bg-emerald-50 text-emerald-700';
    case 'CANCELLED':
      return 'bg-[#f3eee7] text-[#1a3d42]/55';
    default:
      return 'bg-[#f7f4ef] text-[#9a6b45]';
  }
};

const productBadgeClass = (code) => {
  const c = String(code || '');
  if (c.includes('GOLD')) return 'bg-amber-100 text-amber-900';
  if (c.includes('BLACK')) return 'bg-[#1a3d42] text-white';
  if (c.includes('SILVER')) return 'bg-slate-200 text-slate-800';
  return 'bg-[#0d7377]/10 text-[#0d7377]';
};

const AdminNfcRequestsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [pendingOnly, setPendingOnly] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState('');
  const [printRow, setPrintRow] = useState(null);
  const [menuId, setMenuId] = useState(null);
  const [actionBusy, setActionBusy] = useState(null);

  const load = async (query = q, showPendingOnly = pendingOnly, nextPage = page, nextSize = rowsPerPage) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/admin/nfc-requests', {
        params: {
          page: nextPage,
          size: nextSize,
          pendingOnly: showPendingOnly,
          ...(query.trim() ? { q: query.trim() } : {})
        }
      });
      const data = res.data.data || {};
      setItems(data.items || []);
      setPage(data.page ?? nextPage);
      setRowsPerPage(data.size ?? nextSize);
      setTotalElements(data.totalElements ?? 0);
      setTotalPages(data.totalPages ?? 0);
    } catch {
      setError('Could not load card requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const summary = useMemo(() => {
    const pending = items.filter((r) => r.status === 'PENDING').length;
    const preparing = items.filter((r) => r.status === 'FULFILLING' || r.status === 'PAID').length;
    const awaitingPay = items.filter((r) => r.status === 'PENDING_PAYMENT').length;
    return { pending, preparing, awaitingPay };
  }, [items]);

  const onSearch = (e) => {
    e.preventDefault();
    setPage(0);
    load(q, pendingOnly, 0, rowsPerPage);
  };

  const updateStatus = async (id, nextStatus, successMessage) => {
    setActionBusy(id);
    setMenuId(null);
    try {
      await api.put(`/api/admin/nfc-requests/${id}/status`, { status: nextStatus });
      notify.success(successMessage);
      await load();
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Could not update request.');
    } finally {
      setActionBusy(null);
    }
  };

  return (
    <div className="space-y-5" onClick={() => setMenuId(null)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            load();
          }}
          disabled={loading}
          className="rounded-md border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-[#1a3d42] hover:bg-[#f7f4ef] disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: pendingOnly ? 'Pending queue' : 'Total in list',
            value: totalElements,
            hint: pendingOnly ? 'Awaiting delivery (excludes delivered)' : 'All matching search',
            tone: 'text-[#0d7377]'
          },
          {
            label: 'Pending (this page)',
            value: summary.pending,
            hint: 'New requests from clients',
            tone: 'text-amber-700'
          },
          {
            label: 'In progress (this page)',
            value: summary.preparing + summary.awaitingPay,
            hint: 'Paid, payment, or preparing',
            tone: 'text-[#9a6b45]'
          }
        ].map((stat) => (
          <div key={stat.label} className="admin-stat-card">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1a3d42]/45">{stat.label}</p>
            <p className={`mt-3 font-display text-3xl font-semibold ${stat.tone}`}>
              {loading && !totalElements && stat.value === 0 ? '—' : stat.value}
            </p>
            <p className="mt-1 text-sm text-[#1a3d42]/45">{stat.hint}</p>
          </div>
        ))}
      </div>

      {error && (
        <p className="rounded-md border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>
      )}

      <section className="admin-panel overflow-hidden">
        <form onSubmit={onSearch} className="border-b border-black/5 px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="admin-input-wrap min-w-[220px] flex-1">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#1a3d42]/40" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="11" cy="11" r="6.5" />
                <path d="M16 16l4 4" strokeLinecap="round" />
              </svg>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder="Search name, email, phone, delivery…"
                className="w-full bg-transparent text-sm text-[#1a3d42] outline-none placeholder:text-[#1a3d42]/35"
              />
            </div>
            <label
              className="flex cursor-pointer items-center gap-2 rounded-md border border-black/10 bg-white px-3 py-2.5 text-sm text-[#1a3d42]"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="checkbox"
                checked={pendingOnly}
                onChange={(e) => setPendingOnly(e.target.checked)}
              />
              Pending only
            </label>
            <button
              type="submit"
              className="rounded-md border border-black/10 px-4 py-2.5 text-sm font-medium text-[#1a3d42] hover:bg-[#f7f4ef]"
            >
              Search
            </button>
          </div>
        </form>

        <div className="hidden border-b border-black/5 px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#1a3d42]/40 lg:grid lg:grid-cols-[0.3fr_1.35fr_1.05fr_1.15fr_0.95fr_0.75fr_auto] lg:gap-3">
          <span>No</span>
          <span>Profile</span>
          <span>Card requested</span>
          <span>Delivery</span>
          <span>Phone</span>
          <span>Status</span>
          <span className="text-right">Action</span>
        </div>

        {loading && <p className="px-5 py-10 text-sm text-[#1a3d42]/50">Loading requests…</p>}
        {!loading && items.length === 0 && (
          <div className="px-5 py-12 text-center">
            <p className="font-display text-lg font-semibold text-[#1a3d42]">No requests found</p>
            <p className="mt-1 text-sm text-[#1a3d42]/50">
              {pendingOnly
                ? 'Delivered and cancelled requests are hidden. Uncheck “Pending only” to see history.'
                : 'Requests appear when clients use Request card in their workspace.'}
            </p>
          </div>
        )}

        <div className="divide-y divide-black/5">
          {items.map((row, index) => {
            const phone = row.ownerPhone || row.phone;
            const isOpen = menuId === row.id;
            const busy = actionBusy === row.id;
            return (
              <div
                key={row.id}
                className="grid gap-3 px-4 py-4 sm:px-5 lg:grid-cols-[0.3fr_1.35fr_1.05fr_1.15fr_0.95fr_0.75fr_auto] lg:items-center lg:gap-3"
              >
                <p className="text-sm text-[#1a3d42]/45">{page * rowsPerPage + index + 1}</p>

                <div className="flex min-w-0 items-center gap-3">
                  <ProfileAvatar name={row.ownerName} photoUrl={row.ownerPhotoUrl} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[#1a3d42]">{row.ownerName || '—'}</p>
                    <p className="truncate text-xs text-[#1a3d42]/45">
                      {row.cardSlug ? `/u/${row.cardSlug}` : 'No public slug'}
                      {row.ownerLocation ? ` · ${row.ownerLocation}` : ''}
                    </p>
                    <p className="truncate text-xs text-[#1a3d42]/40">{row.ownerEmail || '—'}</p>
                  </div>
                </div>

                <div className="min-w-0">
                  <span
                    className={`inline-flex max-w-full truncate rounded-full px-2.5 py-1 text-[11px] font-semibold ${productBadgeClass(row.productCode)}`}
                  >
                    {row.productName || 'Card'}
                  </span>
                  <p className="mt-1.5 font-display text-lg font-semibold text-[#1a3d42]">
                    {formatMoney(row.amount, row.currency)}
                  </p>
                  {row.paymentOrderId && (
                    <p className="truncate text-[11px] text-[#1a3d42]/40">Order {row.paymentOrderId}</p>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="line-clamp-3 text-sm text-[#1a3d42]/75">{row.deliveryNotes || '—'}</p>
                  {row.createdAt && (
                    <p className="mt-1 text-[11px] text-[#1a3d42]/40">
                      {new Date(row.createdAt).toLocaleDateString('en-TZ', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#0d7377]">{phone || '—'}</p>
                  {(row.ownerCompany || row.ownerTitle) && (
                    <p className="truncate text-xs text-[#1a3d42]/45">
                      {[row.ownerTitle, row.ownerCompany].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>

                <div>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(row.status)}`}
                  >
                    {statusLabel(row.status)}
                  </span>
                </div>

                <div className="relative flex justify-end" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    disabled={busy}
                    className="rounded-md border border-black/10 px-3 py-2 text-sm font-medium text-[#1a3d42] hover:bg-[#f7f4ef] disabled:opacity-50"
                    onClick={() => setMenuId((id) => (id === row.id ? null : row.id))}
                  >
                    {busy ? '…' : 'Actions'}
                  </button>
                  {isOpen && (
                    <div className="absolute right-0 top-11 z-20 w-52 overflow-hidden rounded-lg border border-black/8 bg-white shadow-[0_16px_40px_rgba(26,61,66,0.12)]">
                      {row.status === 'PAID' && (
                        <button
                          type="button"
                          className="block w-full px-4 py-2.5 text-left text-sm text-[#1a3d42] hover:bg-[#f7f4ef]"
                          onClick={() => updateStatus(row.id, 'FULFILLING', 'Marked as preparing.')}
                        >
                          Start preparing
                        </button>
                      )}
                      {row.status !== 'FULFILLED' && row.status !== 'CANCELLED' && (
                        <button
                          type="button"
                          className="block w-full px-4 py-2.5 text-left text-sm font-semibold text-[#0d7377] hover:bg-[#f7f4ef]"
                          onClick={() => updateStatus(row.id, 'FULFILLED', 'Marked as delivered.')}
                        >
                          Mark delivered
                        </button>
                      )}
                      <button
                        type="button"
                        className="block w-full px-4 py-2.5 text-left text-sm text-[#1a3d42] hover:bg-[#f7f4ef]"
                        onClick={() => {
                          setMenuId(null);
                          setPrintRow(row);
                        }}
                      >
                        Print / export
                      </button>
                      {row.cardSlug && (
                        <a
                          href={`/u/${row.cardSlug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="block px-4 py-2.5 text-sm text-[#1a3d42] hover:bg-[#f7f4ef]"
                        >
                          Open public card
                        </a>
                      )}
                      {row.status !== 'CANCELLED' && row.status !== 'FULFILLED' && (
                        <button
                          type="button"
                          className="block w-full border-t border-black/5 px-4 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50"
                          onClick={() => updateStatus(row.id, 'CANCELLED', 'Request cancelled.')}
                        >
                          Cancel request
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <PaginationBar
          page={page}
          size={rowsPerPage}
          totalElements={totalElements}
          totalPages={totalPages}
          onPageChange={(next) => {
            setPage(next);
            load(q, pendingOnly, next, rowsPerPage);
          }}
          onSizeChange={(next) => {
            setRowsPerPage(next);
            setPage(0);
            load(q, pendingOnly, 0, next);
          }}
        />
      </section>

      {printRow && (
        <NfcPrintModal
          contact={requestToPrintContact(printRow)}
          onClose={() => setPrintRow(null)}
          onError={setError}
        />
      )}
    </div>
  );
};

export default AdminNfcRequestsPage;

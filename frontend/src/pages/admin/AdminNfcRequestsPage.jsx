import React, { useEffect, useState } from 'react';
import api from '../../services/api.js';
import PaginationBar from '../../components/PaginationBar.jsx';

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

  const updateStatus = async (id, nextStatus) => {
    await api.put(`/api/admin/nfc-requests/${id}/status`, { status: nextStatus });
    await load();
  };

  return (
    <div className="space-y-5">
      <p className="max-w-2xl text-sm text-[#1a3d42]/55">
        Users requesting physical NFC cards (TZS 100,000). After payment, fulfill by assigning an NFC tag, then mark
        fulfilled.
      </p>

      {error && (
        <p className="rounded-md border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>
      )}

      <section className="admin-panel overflow-hidden">
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
                </p>
                <p className="text-xs text-[#1a3d42]/45">
                  Order {row.paymentOrderId || '—'}
                  {row.phone ? ` · ${row.phone}` : ''}
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
    </div>
  );
};

export default AdminNfcRequestsPage;

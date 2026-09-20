import React, { useContext, useEffect, useMemo, useState } from 'react';
import api from '../../services/api.js';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import { notify } from '../../utils/toast.js';
import { ClientWorkspaceContext } from './ClientLayout.jsx';

const formatMoney = (amount, currency = 'TZS') => {
  if (amount == null) return '';
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

const FALLBACK_PRODUCTS = [
  { code: 'NFC_CARD_GOLD', name: 'Kadi Moja Gold', priceTzs: 200000, currency: 'TZS', active: true },
  { code: 'NFC_CARD_BLACK', name: 'Kadi Moja Black', priceTzs: 150000, currency: 'TZS', active: true },
  { code: 'NFC_CARD_SILVER', name: 'Kadi Moja Silver', priceTzs: 100000, currency: 'TZS', active: true },
  { code: 'NFC_CARD', name: 'Kadi Moja NFC', priceTzs: 50000, currency: 'TZS', active: true }
];

const statusLabel = (status) => {
  if (status === 'PENDING') return 'Pending';
  if (status === 'PENDING_PAYMENT') return 'Awaiting payment';
  if (status === 'PAID') return 'Paid';
  if (status === 'FULFILLING') return 'Preparing';
  if (status === 'FULFILLED') return 'Delivered';
  if (status === 'CANCELLED') return 'Cancelled';
  return status;
};

const ClientRequestCardPage = () => {
  const { card } = useContext(ClientWorkspaceContext);
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [requests, setRequests] = useState([]);
  const [productCode, setProductCode] = useState(FALLBACK_PRODUCTS[0].code);
  const [phone, setPhone] = useState(card?.phone || '');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const nfcProducts = useMemo(
    () =>
      products
        .filter((p) => String(p.code || '').startsWith('NFC_CARD') && p.active !== false)
        .sort((a, b) => (b.priceTzs || 0) - (a.priceTzs || 0)),
    [products]
  );

  const selected = nfcProducts.find((p) => p.code === productCode) || nfcProducts[0];

  const load = async () => {
    try {
      const prodRes = await api.get('/api/client/nfc/products');
      const list = (prodRes.data.data?.products || []).filter((p) =>
        String(p.code || '').startsWith('NFC_CARD')
      );
      if (list.length) setProducts(list);
    } catch {
      setProducts(FALLBACK_PRODUCTS);
    }
    try {
      const reqRes = await api.get('/api/client/nfc/requests');
      setRequests(reqRes.data.data || []);
    } catch {
      setRequests([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (card?.phone && !phone) setPhone(card.phone);
  }, [card?.phone, phone]);

  useEffect(() => {
    if (nfcProducts.length && !nfcProducts.some((p) => p.code === productCode)) {
      setProductCode(nfcProducts[0].code);
    }
  }, [nfcProducts, productCode]);

  const validateForm = () => {
    if (!selected?.code) {
      notify.error('Choose a card type.');
      return false;
    }
    if (!phone.trim()) {
      notify.error('Enter your phone number.');
      return false;
    }
    if (!deliveryLocation.trim()) {
      notify.error('Enter where we should deliver the card.');
      return false;
    }
    return true;
  };

  const openConfirm = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setConfirmOpen(true);
  };

  const submitRequest = async () => {
    if (!validateForm()) {
      setConfirmOpen(false);
      return;
    }

    setBusy(true);
    try {
      await api.post('/api/client/nfc/submit', {
        productCode: selected.code,
        phone: phone.trim(),
        deliveryLocation: deliveryLocation.trim()
      });
      notify.success('Request submitted. Our team will contact you about delivery.');
      setDeliveryLocation('');
      await load();
    } catch (err) {
      notify.error(err?.response?.data?.message || err?.response?.data?.detail || 'Could not submit request.');
    } finally {
      setBusy(false);
      setConfirmOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.14em] text-[#9a6b45]">Physical card</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-[#1a3d42]">Request card</h1>
        <p className="mt-1 max-w-2xl text-sm text-[#1a3d42]/55">
          Choose your Kadi Moja finish, add your phone and delivery location, and we will prepare your NFC card.
        </p>
      </div>

      <form onSubmit={openConfirm} className="client-panel space-y-5 p-5">
        <div>
          <p className="text-sm font-semibold text-[#1a3d42]">Card type</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {nfcProducts.map((p) => {
              const active = p.code === productCode;
              return (
                <label
                  key={p.code}
                  className={`cursor-pointer rounded-lg border px-4 py-4 transition ${
                    active ? 'border-[#0d7377]/40 bg-[#e8f4f4] ring-1 ring-[#0d7377]/20' : 'border-black/5 bg-white hover:border-[#0d7377]/20'
                  }`}
                >
                  <input
                    type="radio"
                    name="cardType"
                    className="sr-only"
                    checked={active}
                    onChange={() => setProductCode(p.code)}
                  />
                  <p className="font-semibold text-[#1a3d42]">{p.name}</p>
                  <p className="mt-1 font-display text-2xl font-semibold text-[#1a3d42]">
                    {formatMoney(p.priceTzs, p.currency)}
                  </p>
                </label>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm text-[#1a3d42]/70">Phone number</span>
            <input
              className="admin-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="2557XXXXXXXX"
              required
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-sm text-[#1a3d42]/70">Delivery location</span>
            <textarea
              className="admin-input min-h-[88px] resize-y"
              value={deliveryLocation}
              onChange={(e) => setDeliveryLocation(e.target.value)}
              placeholder="Area, street, city — or pickup point"
              required
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-black/5 pt-4">
          <button
            type="submit"
            disabled={busy || !selected}
            className="rounded-md bg-[#0d7377] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {busy ? 'Sending…' : `Submit request · ${formatMoney(selected?.priceTzs, selected?.currency)}`}
          </button>
          <p className="text-sm text-[#1a3d42]/50">Payment and delivery details will be confirmed by our team.</p>
        </div>
      </form>

      {requests.length > 0 && (
        <section className="client-panel p-5">
          <h2 className="font-display text-lg font-semibold text-[#1a3d42]">Your requests</h2>
          <div className="mt-4 divide-y divide-black/5">
            {requests.map((r) => (
              <div key={r.id} className="flex flex-wrap items-start justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="font-medium text-[#1a3d42]">{r.productName}</p>
                  <p className="text-xs text-[#1a3d42]/50">{formatMoney(r.amount, r.currency)}</p>
                  {r.deliveryNotes && (
                    <p className="mt-1 text-xs text-[#1a3d42]/55">Deliver to: {r.deliveryNotes}</p>
                  )}
                  {r.phone && <p className="text-xs text-[#1a3d42]/45">Phone: {r.phone}</p>}
                </div>
                <span className="rounded-full bg-[#f7f4ef] px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-[#9a6b45]">
                  {statusLabel(r.status)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Submit card request?"
        message={`Send a request for ${selected?.name || 'this card'} at ${formatMoney(selected?.priceTzs, selected?.currency)} to ${deliveryLocation.trim()}? You can only change details by contacting support after submitting.`}
        confirmLabel="Yes, submit request"
        busy={busy}
        onCancel={() => !busy && setConfirmOpen(false)}
        onConfirm={submitRequest}
      />
    </div>
  );
};

export default ClientRequestCardPage;

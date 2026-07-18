import React, { useContext, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api.js';
import { initialsFromName, resolveMediaUrl } from '../../utils/media.js';
import ContactCardVisual from './ContactCardVisual.jsx';
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

const ClientPreviewsPage = () => {
  const { user, card } = useContext(ClientWorkspaceContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const photo = resolveMediaUrl(card?.photoUrl || user?.pictureUrl || '');
  const initials = initialsFromName(card?.fullName || user?.fullName);
  const name = card?.fullName || user?.fullName || 'Your Name';
  const title = card?.title || 'Your title';
  const company = card?.company || 'Your organisation';
  const phone = card?.phone || '+255 …';
  const email = card?.email || user?.email || 'you@email.com';
  const location = card?.location || 'Tanzania';
  const publicPath = card?.slug ? `/u/${card.slug}` : null;

  const [products, setProducts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [payPhone, setPayPhone] = useState(card?.phone || '');
  const [notes, setNotes] = useState('');
  const [pendingOrder, setPendingOrder] = useState(null);

  const previewContact = {
    fullName: name,
    title,
    company,
    phone,
    email,
    location,
    photoUrl: photo,
    website: card?.website,
    whatsapp: card?.whatsapp,
    source: 'tap'
  };

  const loadCatalog = async () => {
    setError('');
    const fallbackProducts = [
      {
        code: 'NFC_CARD',
        name: 'Kadi Moja NFC Card',
        description: 'Physical PVC NFC card linked to your private profile.',
        priceTzs: 100000,
        currency: 'TZS',
        active: true
      },
      {
        code: 'NFC_CARD_PRO',
        name: 'Kadi Moja Pro',
        description: 'Custom logo & brand colours — coming soon.',
        priceTzs: 75000,
        currency: 'TZS',
        active: false
      },
      {
        code: 'NFC_CARD_METAL',
        name: 'Kadi Moja Metal',
        description: 'Premium metal finish — coming soon.',
        priceTzs: 145000,
        currency: 'TZS',
        active: false
      }
    ];

    try {
      const prodRes = await api.get('/api/client/nfc/products');
      setProducts(prodRes.data.data?.products || fallbackProducts);
    } catch {
      setProducts(fallbackProducts);
    }

    try {
      const reqRes = await api.get('/api/client/nfc/requests');
      setRequests(reqRes.data.data || []);
    } catch {
      setRequests([]);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  useEffect(() => {
    const pay = searchParams.get('pay');
    const order = searchParams.get('order');
    if (!pay) return undefined;

    const clear = () => {
      const next = new URLSearchParams(searchParams);
      next.delete('pay');
      next.delete('order');
      setSearchParams(next, { replace: true });
    };

    if (pay === 'success' && order) {
      api
        .get(`/api/client/subscription/orders/${order}`)
        .then(async () => {
          setMessage('Payment received. Your NFC card request is with our team.');
          await loadCatalog();
        })
        .catch(() => setError('Could not confirm payment status.'))
        .finally(clear);
    } else if (pay === 'cancel') {
      setError('Payment cancelled. You can request your NFC card anytime.');
      clear();
    } else if (pay === 'mock' && order) {
      setPendingOrder({ orderId: order, mock: true });
      clear();
    }
    return undefined;
  }, [searchParams, setSearchParams]);

  const nfcProducts = products.filter((p) => String(p.code || '').startsWith('NFC_CARD'));
  const activeNfc = nfcProducts.find((p) => p.active) || nfcProducts[0];

  const requestCard = async (e) => {
    e.preventDefault();
    if (!activeNfc?.active) {
      setError('This product is not available yet.');
      return;
    }
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const res = await api.post('/api/client/nfc/request', {
        productCode: activeNfc.code,
        phone: payPhone.trim() || undefined,
        deliveryNotes: notes.trim() || undefined
      });
      const data = res.data.data;
      setPendingOrder(data);
      if (data?.paymentGatewayUrl && !data.mock) {
        window.location.href = data.paymentGatewayUrl;
        return;
      }
      setMessage('Checkout ready — confirm demo payment to submit your NFC card request.');
      await loadCatalog();
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not start NFC card request.');
    } finally {
      setBusy(false);
    }
  };

  const confirmMockPay = async () => {
    if (!pendingOrder?.orderId) return;
    setBusy(true);
    setError('');
    try {
      await api.post('/api/client/subscription/mock-pay', { orderId: pendingOrder.orderId });
      setPendingOrder(null);
      setMessage('Payment confirmed. Your NFC card request is queued for fulfillment.');
      await loadCatalog();
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not complete demo payment.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-[#9a6b45]">How it looks</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-[#1a3d42]">NFC & business card</h1>
          <p className="mt-1 max-w-2xl text-sm text-[#1a3d42]/55">
            Preview your digital profile, then request a physical Kadi Moja NFC card.
          </p>
        </div>
        {publicPath && (
          <a
            href={publicPath}
            target="_blank"
            rel="noreferrer"
            className="rounded-md bg-[#0d7377] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0a5f63]"
          >
            Open live profile
          </a>
        )}
      </div>

      {message && (
        <p className="rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>
      )}
      {error && (
        <p className="rounded-md border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="client-panel overflow-hidden p-5">
          <h2 className="font-display text-lg font-semibold text-[#1a3d42]">Digital card (after tap)</h2>
          <p className="mt-1 text-sm text-[#1a3d42]/50">What someone sees on their phone.</p>

          <div className="km-phone-stage mt-6">
            <div className="km-phone-frame">
              <div className="km-phone-notch" aria-hidden="true" />
              <div className="km-phone-screen">
                <div className="km-phone-card-scale">
                  <ContactCardVisual
                    contact={previewContact}
                    variant="lagoon"
                    footer={
                      <div className="rounded-xl bg-[#0d7377] py-2.5 text-center text-[11px] font-semibold text-white">
                        Save contact details
                      </div>
                    }
                  />
                </div>
              </div>
              <div className="km-phone-home" aria-hidden="true" />
            </div>
          </div>
        </section>

        <section className="client-panel overflow-hidden p-5">
          <h2 className="font-display text-lg font-semibold text-[#1a3d42]">Physical NFC card</h2>
          <p className="mt-1 text-sm text-[#1a3d42]/50">Tap this card on a phone to open your profile.</p>

          <div className="mt-10 flex justify-center px-2">
            <div className="km-nfc-card km-nfc-float">
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
          </div>
        </section>
      </div>

      <section className="client-panel p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-[#1a3d42]">Request an NFC card</h2>
            <p className="mt-1 text-sm text-[#1a3d42]/55">
              Active option: physical NFC card at {formatMoney(activeNfc?.priceTzs || 100000, activeNfc?.currency)}{' '}
              (one-time). Other options stay inactive for now.
            </p>
          </div>
          <Link to="/me/share" className="text-sm font-semibold text-[#0d7377] hover:underline">
            Open Share & QR →
          </Link>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {nfcProducts.map((p) => (
            <div
              key={p.code}
              className={`rounded-lg border px-4 py-4 ${
                p.active ? 'border-[#0d7377]/30 bg-[#e8f4f4]' : 'border-black/5 bg-[#f7f4ef] opacity-70'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-[#1a3d42]">{p.name}</p>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    p.active ? 'bg-[#0d7377] text-white' : 'bg-black/5 text-[#1a3d42]/50'
                  }`}
                >
                  {p.active ? 'Active' : 'Soon'}
                </span>
              </div>
              <p className="mt-2 font-display text-2xl font-semibold text-[#1a3d42]">
                {formatMoney(p.priceTzs, p.currency)}
              </p>
              <p className="mt-1 text-sm text-[#1a3d42]/55">{p.description}</p>
            </div>
          ))}
        </div>

        <form onSubmit={requestCard} className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm text-[#1a3d42]/70">Mobile money phone</span>
            <input
              className="admin-input"
              value={payPhone}
              onChange={(e) => setPayPhone(e.target.value)}
              placeholder="2557XXXXXXXX"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-[#1a3d42]/70">Delivery note (optional)</span>
            <input
              className="admin-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="City / pickup preference"
            />
          </label>
          <div className="sm:col-span-2 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={busy || !activeNfc?.active}
              className="rounded-md bg-[#0d7377] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {busy ? 'Starting…' : `Request NFC card · ${formatMoney(activeNfc?.priceTzs || 100000)}`}
            </button>
            {pendingOrder?.mock && (
              <button
                type="button"
                disabled={busy}
                onClick={confirmMockPay}
                className="rounded-md border border-[#0d7377]/30 bg-[#e8f4f4] px-4 py-2.5 text-sm font-semibold text-[#0d7377]"
              >
                Confirm demo payment
              </button>
            )}
          </div>
        </form>

        {requests.length > 0 && (
          <div className="mt-6 border-t border-black/5 pt-4">
            <p className="text-sm font-semibold text-[#1a3d42]">Your requests</p>
            <div className="mt-3 divide-y divide-black/5">
              {requests.map((r) => (
                <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                  <div>
                    <p className="font-medium text-[#1a3d42]">{r.productName}</p>
                    <p className="text-xs text-[#1a3d42]/50">
                      {formatMoney(r.amount, r.currency)} · {r.paymentOrderId || '—'}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#f7f4ef] px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-[#9a6b45]">
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default ClientPreviewsPage;

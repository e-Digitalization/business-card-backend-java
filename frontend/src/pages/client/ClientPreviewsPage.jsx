import React, { useContext, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api.js';
import { initialsFromName, resolveMediaUrl } from '../../utils/media.js';
import { getCardThemeVars } from '../../utils/cardTheme.js';
import { notify } from '../../utils/toast.js';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import ContactCardVisual from './ContactCardVisual.jsx';
import NfcCardVisual from '../../components/NfcCardVisual.jsx';
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
  const [paymentProvider, setPaymentProvider] = useState('selcom');
  const [busy, setBusy] = useState(false);
  const [payPhone, setPayPhone] = useState(card?.phone || '');
  const [notes, setNotes] = useState('');
  const [pendingOrder, setPendingOrder] = useState(null);
  const [confirmRequestOpen, setConfirmRequestOpen] = useState(false);
  const [confirmPayOpen, setConfirmPayOpen] = useState(false);

  const previewContact = {
    fullName: name,
    title,
    company,
    phone,
    email,
    location,
    photoUrl: photo,
    logoUrl: card?.logoUrl,
    website: card?.website,
    whatsapp: card?.whatsapp,
    linkedin: card?.linkedin,
    twitter: card?.twitter,
    github: card?.github,
    instagram: card?.instagram,
    youtubeChannel: card?.youtubeChannel,
    youtubeVideo1: card?.youtubeVideo1,
    youtubeVideo2: card?.youtubeVideo2,
    youtubeVideo3: card?.youtubeVideo3,
    bookingUrl: card?.bookingUrl,
    podcastUrl: card?.podcastUrl,
    tiktok: card?.tiktok,
    telegram: card?.telegram,
    wechat: card?.wechat,
    weibo: card?.weibo,
    douyin: card?.douyin,
    xiaohongshu: card?.xiaohongshu,
    source: 'tap'
  };
  const themeVars = getCardThemeVars(card);

  const loadCatalog = async () => {
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
      setPaymentProvider(String(prodRes.data.data?.paymentProvider || 'selcom').toLowerCase());
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
      next.delete('provider');
      setSearchParams(next, { replace: true });
    };

    if ((pay === 'success' || pay === 'nmb') && order) {
      api
        .get(`/api/client/subscription/orders/${order}`)
        .then(async (res) => {
          const data = res.data.data;
          if (data?.status === 'PAID') {
            notify.success('Payment received. Your NFC card request is with our team.');
            setPendingOrder(null);
            await loadCatalog();
          } else if (data?.controlNumber || data?.provider === 'nmb') {
            setPendingOrder(data);
            notify.info('Complete payment with the NMB control number, then confirm below.');
          } else {
            notify.info('Checkout opened. Complete payment to submit your NFC request.');
          }
        })
        .catch(() => notify.error('Could not confirm payment status.'))
        .finally(clear);
    } else if (pay === 'cancel') {
      notify.error('Payment cancelled. You can request your NFC card anytime.');
      clear();
    }
    return undefined;
  }, [searchParams, setSearchParams]);

  const nfcProducts = products.filter((p) => String(p.code || '').startsWith('NFC_CARD'));
  const activeNfc = nfcProducts.find((p) => p.active) || nfcProducts[0];
  const priceLabel = formatMoney(activeNfc?.priceTzs || 100000, activeNfc?.currency);
  const isNmb = paymentProvider.includes('nmb');
  const isNmbOrder =
    pendingOrder?.provider === 'nmb' || Boolean(pendingOrder?.controlNumber || pendingOrder?.referenceNumber);

  const startCheckout = async () => {
    if (!activeNfc?.active) {
      notify.error('This product is not available yet.');
      return;
    }
    if (!payPhone.trim()) {
      notify.error('Enter a mobile money phone number (e.g. 2557XXXXXXXX).');
      return;
    }

    setBusy(true);
    try {
      const res = await api.post('/api/client/nfc/request', {
        productCode: activeNfc.code,
        phone: payPhone.trim(),
        deliveryNotes: notes.trim() || undefined
      });
      const data = res.data.data;
      setPendingOrder(data);

      if (data?.provider === 'nmb' || data?.controlNumber) {
        notify.success('NMB control number created. Pay it, then tap “I have paid”.');
        await loadCatalog();
        return;
      }

      if (data?.paymentGatewayUrl && !data.mock) {
        notify.info('Redirecting to payment…');
        window.location.href = data.paymentGatewayUrl;
        return;
      }

      if (data?.mock) {
        notify.error(
          'Live payment is not active. Set active provider to NMB in Admin → Setups → NMB (credentials are already saved).'
        );
        setPendingOrder(null);
        return;
      }

      notify.success('Checkout created. Complete payment to submit your request.');
      await loadCatalog();
    } catch (err) {
      notify.error(err?.response?.data?.message || err?.response?.data?.detail || 'Could not start NFC card request.');
    } finally {
      setBusy(false);
      setConfirmRequestOpen(false);
    }
  };

  const checkNmbPayment = async () => {
    if (!pendingOrder?.orderId) return;
    setBusy(true);
    try {
      const res = await api.get(`/api/client/subscription/orders/${pendingOrder.orderId}`);
      const data = res.data.data;
      setPendingOrder((prev) => ({ ...prev, ...data }));
      if (data?.status === 'PAID') {
        setPendingOrder(null);
        notify.success('Payment confirmed. Your NFC card request is with our team.');
        await loadCatalog();
        return;
      }
      notify.info('Payment not confirmed yet. If you already paid, wait a moment and try again.');
    } catch (err) {
      notify.error(err?.response?.data?.message || 'Could not check NMB payment status.');
    } finally {
      setBusy(false);
      setConfirmPayOpen(false);
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
                    themeVars={themeVars}
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
            <NfcCardVisual
              name={name}
              title={title}
              company={company}
              location={location}
              photoUrl={photo}
              slug={card?.slug}
            />
          </div>
        </section>
      </div>

      <section className="client-panel p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-[#1a3d42]">Request an NFC card</h2>
            <p className="mt-1 text-sm text-[#1a3d42]/55">
              Active option: physical NFC card at {priceLabel} (one-time)
              {isNmb ? ' · paid via NMB control number' : ' · paid via Selcom'}.
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

        {isNmbOrder ? (
          <div className="mt-5 space-y-3 rounded-xl border border-[#0d7377]/20 bg-[#eef6f6] p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0d7377]">
                NMB control number
              </p>
              <p className="mt-2 font-display text-2xl font-bold tracking-wide text-[#1a3d42]">
                {pendingOrder.controlNumber || pendingOrder.referenceNumber}
              </p>
              <p className="mt-2 text-sm text-[#1a3d42]/60">
                {pendingOrder.instructions ||
                  'Pay this control number via NMB / supported channels, then confirm below.'}
              </p>
              {pendingOrder.orderId && (
                <p className="mt-1 text-xs text-[#1a3d42]/45">Order {pendingOrder.orderId}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => setConfirmPayOpen(true)}
                className="rounded-md bg-[#0d7377] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {busy ? 'Checking…' : 'I have paid — check status'}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setPendingOrder(null);
                  notify.info('Checkout dismissed. You can request again anytime.');
                }}
                className="rounded-md border border-black/10 px-4 py-2.5 text-sm font-medium text-[#1a3d42]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setConfirmRequestOpen(true);
            }}
            className="mt-5 grid gap-3 sm:grid-cols-2"
          >
            <label className="block">
              <span className="mb-1 block text-sm text-[#1a3d42]/70">Mobile money phone</span>
              <input
                className="admin-input"
                value={payPhone}
                onChange={(e) => setPayPhone(e.target.value)}
                placeholder="2557XXXXXXXX"
                required
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
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={busy || !activeNfc?.active}
                className="rounded-md bg-[#0d7377] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {busy
                  ? 'Starting…'
                  : isNmb
                    ? `Get NMB control number · ${priceLabel}`
                    : `Request NFC card · ${priceLabel}`}
              </button>
            </div>
          </form>
        )}

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

      <ConfirmDialog
        open={confirmRequestOpen}
        title="Request NFC card?"
        message={`We will create an ${isNmb ? 'NMB control number' : 'online payment'} for ${priceLabel}. Continue only if you intend to pay for a physical Kadi Moja card.`}
        confirmLabel={isNmb ? 'Get control number' : 'Continue to pay'}
        busy={busy}
        onCancel={() => setConfirmRequestOpen(false)}
        onConfirm={startCheckout}
      />

      <ConfirmDialog
        open={confirmPayOpen}
        title="Have you paid?"
        message={`Only continue if you have already paid control number ${pendingOrder?.controlNumber || pendingOrder?.referenceNumber || ''}. We will check with NMB.`}
        confirmLabel="Yes, check with NMB"
        busy={busy}
        onCancel={() => setConfirmPayOpen(false)}
        onConfirm={checkNmbPayment}
      />
    </div>
  );
};

export default ClientPreviewsPage;

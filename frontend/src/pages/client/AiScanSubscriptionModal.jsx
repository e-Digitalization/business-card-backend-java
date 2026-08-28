import React, { useEffect, useState } from 'react';
import api from '../../services/api.js';

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

const formatDate = (iso) => {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString('en-TZ', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return iso;
  }
};

/**
 * AI-scan subscription modal — Selcom redirect or NMB control number.
 */
const AiScanSubscriptionModal = ({ open, onClose, subscription, onSubscribed }) => {
  const [payPhone, setPayPhone] = useState('');
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!open) return undefined;
    setError('');
    setMessage('');
    setPendingOrder(null);
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const price = subscription?.priceTzs ?? 10000;
  const currency = subscription?.currency || 'TZS';
  const freeLimit = subscription?.freeLimit ?? 2;
  const monthlyLimit = subscription?.monthlyLimit ?? 20;
  const monthlyUsed = subscription?.monthlyUsed ?? null;
  const remaining = subscription?.remaining ?? freeLimit;
  const subscribed = Boolean(subscription?.subscribed);
  const providerLabel = subscription?.provider || 'selcom';
  const isNmb = String(providerLabel).includes('nmb');
  const payLabel = isNmb ? 'NMB control number' : 'Selcom mobile money / card';
  const isNmbOrder = pendingOrder?.provider === 'nmb' || Boolean(pendingOrder?.controlNumber);

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
      if (data?.provider === 'nmb' || data?.controlNumber) {
        setMessage('Pay with the NMB control number below, then tap “I have paid”.');
        return;
      }
      if (data?.paymentGatewayUrl && !data.mock) {
        window.location.href = data.paymentGatewayUrl;
        return;
      }
      setMessage(
        data?.mock
          ? `Demo checkout ready — confirm payment below to unlock ${monthlyLimit} AI scans a month.`
          : `Checkout created. Complete payment to unlock ${monthlyLimit} AI scans a month.`
      );
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.detail || 'Could not start payment.');
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
      setPendingOrder(null);
      setMessage(`AI Scan Monthly is active — ${monthlyLimit} card scans this month.`);
      onSubscribed?.();
      onClose?.();
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not complete demo payment.');
    } finally {
      setCheckoutBusy(false);
    }
  };

  const checkNmbPayment = async () => {
    if (!pendingOrder?.orderId) return;
    setCheckoutBusy(true);
    setError('');
    try {
      const res = await api.get(`/api/client/subscription/orders/${pendingOrder.orderId}`);
      const data = res.data.data;
      setPendingOrder((prev) => ({ ...prev, ...data }));
      if (data?.status === 'PAID' || data?.subscribed) {
        setPendingOrder(null);
        setMessage(`Payment confirmed — ${monthlyLimit} AI scans unlocked for this month.`);
        onSubscribed?.();
        onClose?.();
        return;
      }
      setMessage('Payment not confirmed yet. If you already paid, wait a moment and try again.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not check NMB payment status.');
    } finally {
      setCheckoutBusy(false);
    }
  };

  return (
    <div className="km-contact-viewer" role="dialog" aria-modal="true" aria-label="Subscription">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Close" onClick={onClose} />
      <div className="km-contact-viewer-panel relative z-10" style={{ width: 'min(100%, 520px)' }}>
        <div className="rounded-2xl bg-white p-6 text-[#1a3d42] shadow-xl sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9a6b45]">Subscription</p>
              <h2 className="mt-1 font-display text-2xl font-semibold">AI Scan Monthly</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-black/10 px-2.5 py-1 text-sm hover:bg-[#f7f4ef]"
            >
              ✕
            </button>
          </div>

          {subscribed ? (
            <>
              <p className="mt-3 text-sm text-emerald-700">Your monthly subscription is active.</p>
              <div className="mt-4 rounded-xl border border-black/5 bg-[#f7f4ef] px-4 py-4">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm font-semibold text-[#1a3d42]">{monthlyLimit} card scans / month</p>
                  {monthlyUsed != null && (
                    <p className="text-xs font-medium text-[#1a3d42]/55">
                      {monthlyUsed} of {monthlyLimit} used
                    </p>
                  )}
                </div>
                {monthlyUsed != null && (
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/10">
                    <div
                      className="h-full rounded-full bg-[#0d7377]"
                      style={{ width: `${Math.min(100, Math.round((monthlyUsed / Math.max(1, monthlyLimit)) * 100))}%` }}
                    />
                  </div>
                )}
                <p className="mt-3 text-sm text-[#1a3d42]">
                  Renews / expires {formatDate(subscription.expiresAt) || 'after this billing month'}
                </p>
                <p className="mt-1 text-xs text-[#1a3d42]/50">
                  Your {monthlyLimit} scans reset each time you renew ({formatMoney(price, currency)} / month).
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="mt-5 w-full rounded-md bg-[#0d7377] px-4 py-2.5 text-sm font-semibold text-white"
              >
                Done
              </button>
            </>
          ) : (
            <>
              <p className="mt-3 text-sm text-[#1a3d42]/60">
                Free plan: {remaining} of {freeLimit} AI scans left. Subscribe to scan up to {monthlyLimit} business
                cards per month for 30 days, paid with {payLabel}.
              </p>
              <div className="mt-4 rounded-xl border border-black/5 bg-[#f7f4ef] px-4 py-4">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm text-[#1a3d42]/55">AI Scan Monthly</p>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#9a6b45]">
                    {monthlyLimit} scans / month
                  </p>
                </div>
                <p className="mt-1 font-display text-3xl font-semibold text-[#1a3d42]">
                  {formatMoney(price, currency)}
                </p>
                <p className="mt-1 text-xs text-[#1a3d42]/50">
                  Per month · {isNmb ? 'NMB' : 'Selcom'}
                </p>
              </div>

              <ul className="mt-4 space-y-1.5 text-sm text-[#1a3d42]/70">
                {[
                  `${monthlyLimit} AI business-card scans every month`,
                  'Auto-fills name, title, company, phone & email',
                  'Saved straight into your Contacts',
                  'Renew anytime from this window'
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <span aria-hidden="true" className="text-[#0d7377]">✓</span>
                    {item}
                  </li>
                ))}
              </ul>

              {message && (
                <p className="mt-3 rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  {message}
                </p>
              )}
              {error && (
                <p className="mt-3 rounded-md border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-600">
                  {error}
                </p>
              )}

              {isNmbOrder ? (
                <div className="mt-4 space-y-3">
                  <div className="rounded-lg border border-[#0d7377]/20 bg-[#eef6f6] px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0d7377]">
                      NMB control number
                    </p>
                    <p className="mt-2 font-display text-2xl font-bold tracking-wide text-[#1a3d42]">
                      {pendingOrder.controlNumber || pendingOrder.referenceNumber}
                    </p>
                    <p className="mt-2 text-xs text-[#1a3d42]/55">
                      {pendingOrder.instructions || 'Pay this control number via NMB, then confirm below.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={checkoutBusy}
                    onClick={checkNmbPayment}
                    className="w-full rounded-md bg-[#0d7377] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {checkoutBusy ? 'Checking…' : 'I have paid — check status'}
                  </button>
                </div>
              ) : pendingOrder?.mock ? (
                <div className="mt-4 space-y-3">
                  <p className="text-sm text-[#0d7377]">
                    Demo mode (payment credentials not set). Confirm to activate subscription locally.
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
                    {checkoutBusy
                      ? 'Starting…'
                      : String(providerLabel).includes('nmb')
                        ? 'Get NMB control number'
                        : 'Pay with Selcom'}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiScanSubscriptionModal;

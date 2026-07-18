import React, { useEffect, useState } from 'react';
import { StatusPill, useAdminSetups } from './useAdminSetups.jsx';

const AdminSetupsSelcomPage = () => {
  const { loading, saving, error, message, setups, load, save, clearKey } = useAdminSetups();

  const [baseUrl, setBaseUrl] = useState('https://apigw.selcommobile.com');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [vendor, setVendor] = useState('');
  const [amountTzs, setAmountTzs] = useState('10000');
  const [currency, setCurrency] = useState('TZS');
  const [forceMock, setForceMock] = useState(false);
  const [activeProvider, setActiveProvider] = useState('selcom');

  useEffect(() => {
    if (!setups) return;
    const s = setups.selcom || {};
    setBaseUrl(s.baseUrl || 'https://apigw.selcommobile.com');
    setVendor(s.vendor || '');
    setAmountTzs(String(s.amountTzs ?? 10000));
    setCurrency(s.currency || 'TZS');
    setForceMock(Boolean(s.forceMock));
    setActiveProvider(setups.payments?.activeProvider || 'selcom');
    setApiKey('');
    setApiSecret('');
  }, [setups]);

  const onSave = async (e) => {
    e.preventDefault();
    const body = {
      selcomBaseUrl: baseUrl.trim() || null,
      selcomVendor: vendor.trim() || null,
      selcomAmountTzs: amountTzs.trim() || null,
      selcomCurrency: currency.trim() || null,
      selcomForceMock: forceMock,
      paymentsActiveProvider: activeProvider
    };
    if (apiKey.trim()) body.selcomApiKey = apiKey.trim();
    if (apiSecret.trim()) body.selcomApiSecret = apiSecret.trim();
    await save(body, 'Selcom setups saved. Checkout uses these values immediately.');
  };

  if (loading) {
    return <p className="text-sm text-[#1a3d42]/50">Loading setups…</p>;
  }

  const selcom = setups?.selcom || {};

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <p className="text-sm text-[#1a3d42]/55">
        Selcom powers AI scan subscriptions and NFC card payments (M-Pesa, Tigo Pesa, Airtel Money). Leave API key /
        secret blank to keep the current value.
      </p>

      {error && (
        <p className="rounded-md border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>
      )}
      {message && (
        <p className="rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {message}
        </p>
      )}

      <section className="admin-panel p-5">
        <div className="flex flex-wrap gap-3">
          <div className="rounded-lg border border-black/5 bg-[#f7f4ef] px-4 py-3">
            <p className="text-xs text-[#1a3d42]/50">Mode</p>
            <div className="mt-2">
              <StatusPill ok={selcom.configured} label={selcom.mode === 'live' ? 'Live' : 'Demo / mock'} />
            </div>
          </div>
          <div className="rounded-lg border border-black/5 bg-[#f7f4ef] px-4 py-3">
            <p className="text-xs text-[#1a3d42]/50">API key</p>
            <p className="mt-1 text-xs text-[#1a3d42]/55">
              <code>{selcom.maskedApiKey || 'not set'}</code> · {selcom.apiKeySource || 'unset'}
            </p>
          </div>
        </div>
      </section>

      <form onSubmit={onSave} className="space-y-5">
        <section className="admin-panel space-y-4 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9a6b45]">Credentials</p>
            <h2 className="mt-1 font-display text-lg font-semibold text-[#1a3d42]">Selcom gateway</h2>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[#1a3d42]/70">Base URL</span>
            <input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} className="admin-input" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[#1a3d42]/70">Vendor</span>
            <input value={vendor} onChange={(e) => setVendor(e.target.value)} className="admin-input" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[#1a3d42]/70">API key (leave blank to keep)</span>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="admin-input"
              autoComplete="off"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[#1a3d42]/70">API secret (leave blank to keep)</span>
            <input
              type="password"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              className="admin-input"
              autoComplete="off"
            />
          </label>
          <div className="flex flex-wrap gap-4">
            {selcom.apiKeySource === 'database' && (
              <button
                type="button"
                disabled={saving}
                onClick={() => clearKey('clearSelcomApiKey')}
                className="text-sm font-medium text-rose-600 hover:underline"
              >
                Clear DB API key
              </button>
            )}
            {selcom.apiSecretSource === 'database' && (
              <button
                type="button"
                disabled={saving}
                onClick={() => clearKey('clearSelcomApiSecret')}
                className="text-sm font-medium text-rose-600 hover:underline"
              >
                Clear DB API secret
              </button>
            )}
          </div>
        </section>

        <section className="admin-panel space-y-4 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9a6b45]">Pricing</p>
            <h2 className="mt-1 font-display text-lg font-semibold text-[#1a3d42]">AI scan monthly fee</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-[#1a3d42]/70">Amount (TZS)</span>
              <input value={amountTzs} onChange={(e) => setAmountTzs(e.target.value)} className="admin-input" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-[#1a3d42]/70">Currency</span>
              <input value={currency} onChange={(e) => setCurrency(e.target.value)} className="admin-input" />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm text-[#1a3d42]/75">
            <input
              type="checkbox"
              checked={forceMock}
              onChange={(e) => setForceMock(e.target.checked)}
              className="rounded border-black/20"
            />
            Force demo / mock checkout (ignore live keys)
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[#1a3d42]/70">Active payment provider</span>
            <select
              value={activeProvider}
              onChange={(e) => setActiveProvider(e.target.value)}
              className="admin-input"
            >
              <option value="selcom">Selcom</option>
              <option value="nmb">NMB</option>
            </select>
            <p className="mt-1 text-xs text-[#1a3d42]/45">
              When NMB is active, checkout generates an NMB control number instead of Selcom redirect.
            </p>
          </label>
        </section>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={load}
            className="rounded-md border border-black/10 px-4 py-2.5 text-sm font-medium text-[#1a3d42]"
          >
            Reset form
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-[#0d7377] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Selcom'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSetupsSelcomPage;

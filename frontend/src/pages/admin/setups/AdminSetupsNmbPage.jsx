import React, { useEffect, useState } from 'react';
import { StatusPill, useAdminSetups } from './useAdminSetups.jsx';

const AdminSetupsNmbPage = () => {
  const { loading, saving, error, message, setups, load, save, clearKey } = useAdminSetups();

  const [baseUrl, setBaseUrl] = useState('https://nmb.spg.co.tz');
  const [clientUsr, setClientUsr] = useState('');
  const [clientKey, setClientKey] = useState('');
  const [systemName, setSystemName] = useState('');
  const [activeProvider, setActiveProvider] = useState('selcom');

  useEffect(() => {
    if (!setups) return;
    const n = setups.nmb || {};
    setBaseUrl(n.baseUrl || 'https://nmb.spg.co.tz');
    setSystemName(n.systemName || '');
    setActiveProvider(setups.payments?.activeProvider || 'selcom');
    setClientUsr('');
    setClientKey('');
  }, [setups]);

  const onSave = async (e) => {
    e.preventDefault();
    const body = {
      nmbBaseUrl: baseUrl.trim() || null,
      nmbSystemName: systemName.trim() || null,
      nmbEnabled: true,
      paymentsActiveProvider: activeProvider
    };
    if (clientUsr.trim()) body.nmbClientUsr = clientUsr.trim();
    if (clientKey.trim()) body.nmbClientKey = clientKey.trim();
    await save(
      body,
      activeProvider === 'nmb'
        ? 'NMB saved as the active payment provider. Card checkout will call the live NMB API.'
        : 'NMB setups saved.'
    );
  };

  if (loading) {
    return <p className="text-sm text-[#1a3d42]/50">Loading setups…</p>;
  }

  const nmb = setups?.nmb || {};

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <p className="text-sm text-[#1a3d42]/55">
        NMB Payment Gateway (<code>nmb.spg.co.tz</code>): login → generate control number → confirm payment. Leave
        username / password blank to keep the current value.
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
            <p className="text-xs text-[#1a3d42]/50">Status</p>
            <div className="mt-2">
              <StatusPill ok={nmb.configured} label={nmb.configured ? 'Keys ready' : 'Not configured'} />
            </div>
          </div>
          <div className="rounded-lg border border-black/5 bg-[#f7f4ef] px-4 py-3">
            <p className="text-xs text-[#1a3d42]/50">System name</p>
            <p className="mt-1 text-sm font-medium text-[#1a3d42]">{nmb.systemName || '—'}</p>
          </div>
        </div>
        <ol className="mt-4 list-decimal space-y-1 pl-5 text-xs text-[#1a3d42]/60">
          <li>
            <code>POST /api/v1/login</code> with client_usr / client_key
          </li>
          <li>
            <code>POST /api/v1/generatectlno</code> → control number for the customer
          </li>
          <li>
            <code>POST /api/v1/getpayment</code> to confirm payment
          </li>
        </ol>
      </section>

      <form onSubmit={onSave} className="space-y-5">
        <section className="admin-panel space-y-4 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9a6b45]">NMB</p>
            <h2 className="mt-1 font-display text-lg font-semibold text-[#1a3d42]">Gateway credentials</h2>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[#1a3d42]/70">Base URL</span>
            <input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} className="admin-input" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[#1a3d42]/70">System name</span>
            <input
              value={systemName}
              onChange={(e) => setSystemName(e.target.value)}
              className="admin-input"
              placeholder="SP1007"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[#1a3d42]/70">
              Client username (leave blank to keep)
            </span>
            <input
              type="password"
              value={clientUsr}
              onChange={(e) => setClientUsr(e.target.value)}
              className="admin-input"
              autoComplete="off"
              placeholder={nmb.maskedClientUsr || '••••'}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[#1a3d42]/70">
              Client key / password (leave blank to keep)
            </span>
            <input
              type="password"
              value={clientKey}
              onChange={(e) => setClientKey(e.target.value)}
              className="admin-input"
              autoComplete="off"
              placeholder={nmb.maskedClientKey || '••••'}
            />
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
            <p className="mt-1.5 text-xs text-[#1a3d42]/50">
              Choose NMB to use live control numbers for NFC card and AI Scan payments (no demo / mock).
            </p>
          </label>
          <div className="flex flex-wrap gap-4">
            {nmb.clientUsrSource === 'database' && (
              <button
                type="button"
                disabled={saving}
                onClick={() => clearKey('clearNmbClientUsr')}
                className="text-sm font-medium text-rose-600 hover:underline"
              >
                Clear DB username
              </button>
            )}
            {nmb.clientKeySource === 'database' && (
              <button
                type="button"
                disabled={saving}
                onClick={() => clearKey('clearNmbClientKey')}
                className="text-sm font-medium text-rose-600 hover:underline"
              >
                Clear DB client key
              </button>
            )}
          </div>
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
            {saving ? 'Saving…' : 'Save NMB'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSetupsNmbPage;

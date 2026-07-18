import React from 'react';
import { Link } from 'react-router-dom';
import { StatusPill, useAdminSetups } from './useAdminSetups.jsx';

const AdminSetupsOverviewPage = () => {
  const { loading, error, setups, load } = useAdminSetups();

  if (loading) {
    return <p className="text-sm text-[#1a3d42]/50">Loading setups…</p>;
  }

  const scan = setups?.scan || {};
  const openai = setups?.openai || {};
  const google = setups?.google || {};
  const selcom = setups?.selcom || {};
  const nmb = setups?.nmb || {};
  const payments = setups?.payments || {};

  const cards = [
    {
      to: '/admin/setups/ai',
      title: 'AI & Google',
      blurb: 'OpenAI, Gemini, and Google OAuth for scan + login.',
      status: scan.enabled || google.configured,
      detail: scan.enabled ? `Scan · ${scan.activeProvider}` : google.configured ? 'Google ready' : 'Not configured'
    },
    {
      to: '/admin/setups/selcom',
      title: 'Selcom',
      blurb: 'M-Pesa, Tigo Pesa, Airtel Money checkout for AI scan & NFC.',
      status: selcom.configured,
      detail: selcom.mode === 'live' ? 'Live' : 'Demo / mock'
    },
    {
      to: '/admin/setups/nmb',
      title: 'NMB',
      blurb: 'NMB Payment Gateway — login, control number, payment confirmation.',
      status: nmb.configured,
      detail: nmb.status === 'ready' ? 'Ready' : 'Not configured'
    }
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <p className="text-sm text-[#1a3d42]/55">
        Manage API keys and payment providers. Values saved here override <code>.env</code> until cleared. Secrets stay
        masked.
      </p>

      {error && (
        <p className="rounded-md border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>
      )}

      <section className="admin-panel p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9a6b45]">Overview</p>
            <h2 className="mt-1 font-display text-xl font-semibold text-[#1a3d42]">Integration status</h2>
          </div>
          <button
            type="button"
            onClick={load}
            className="rounded-md border border-black/10 px-3 py-2 text-sm font-medium text-[#1a3d42]"
          >
            Refresh
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-black/5 bg-[#f7f4ef] px-4 py-3">
            <p className="text-xs text-[#1a3d42]/50">Active payment provider</p>
            <p className="mt-1 font-display text-lg font-semibold capitalize text-[#1a3d42]">
              {payments.activeProvider || 'selcom'}
            </p>
          </div>
          <div className="rounded-lg border border-black/5 bg-[#f7f4ef] px-4 py-3">
            <p className="text-xs text-[#1a3d42]/50">OpenAI</p>
            <div className="mt-2">
              <StatusPill ok={openai.configured} label={openai.configured ? 'Configured' : 'Missing'} />
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-1">
        {cards.map((card) => (
          <Link
            key={card.to}
            to={card.to}
            className="admin-panel block p-5 transition hover:border-[#0d7377]/25 hover:shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-lg font-semibold text-[#1a3d42]">{card.title}</h3>
                <p className="mt-1 text-sm text-[#1a3d42]/55">{card.blurb}</p>
              </div>
              <StatusPill ok={card.status} label={card.detail} />
            </div>
            <p className="mt-4 text-sm font-semibold text-[#0d7377]">Configure →</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminSetupsOverviewPage;

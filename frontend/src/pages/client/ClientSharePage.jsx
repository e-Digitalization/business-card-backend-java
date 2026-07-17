import React, { useContext, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClientWorkspaceContext } from './ClientLayout.jsx';

const ClientSharePage = () => {
  const { card } = useContext(ClientWorkspaceContext);
  const [copied, setCopied] = useState(false);

  const publicUrl = useMemo(() => {
    if (!card?.slug) return '';
    return `${window.location.origin}/u/${card.slug}`;
  }, [card]);

  const qrUrl = publicUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(publicUrl)}`
    : '';

  const copyLink = async () => {
    if (!publicUrl) return;
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  if (!card?.slug) {
    return (
      <div className="client-panel p-8 text-center">
        <p className="font-display text-xl font-semibold text-[#1a3d42]">No public link yet</p>
        <p className="mt-2 text-sm text-[#1a3d42]/55">Create your card slug first.</p>
        <Link to="/me/card" className="mt-4 inline-flex rounded-md bg-[#0d7377] px-4 py-2.5 text-sm font-semibold text-white">
          Edit card
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.14em] text-[#9a6b45]">Share & QR</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-[#1a3d42]">Share your Kadi Moja</h1>
        <p className="mt-1 text-sm text-[#1a3d42]/55">
          Send your link or show the QR code when NFC is not available.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="client-panel p-6">
          <h2 className="font-display text-lg font-semibold text-[#1a3d42]">Public link</h2>
          <p className="mt-3 break-all rounded-md bg-[#f7f4ef] px-3 py-3 text-sm text-[#0d7377]">{publicUrl}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyLink}
              className="rounded-md bg-[#0d7377] px-4 py-2.5 text-sm font-semibold text-white"
            >
              {copied ? 'Copied' : 'Copy link'}
            </button>
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-black/10 px-4 py-2.5 text-sm font-medium text-[#1a3d42]"
            >
              Open
            </a>
          </div>
        </section>

        <section className="client-panel flex flex-col items-center p-6 text-center">
          <h2 className="font-display text-lg font-semibold text-[#1a3d42]">QR code</h2>
          <img src={qrUrl} alt="QR code for your Kadi Moja card" className="mt-4 h-48 w-48 rounded-lg border border-black/5 bg-white p-2" />
          <p className="mt-3 text-sm text-[#1a3d42]/50">Scan to open your digital card</p>
        </section>
      </div>
    </div>
  );
};

export default ClientSharePage;

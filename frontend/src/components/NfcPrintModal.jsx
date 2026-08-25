import React, { useEffect, useState } from 'react';
import NfcCardVisual from './NfcCardVisual.jsx';
import { buildNfcPrintDocument, buildNfcSvgDocument } from '../utils/nfcPrintDocument.js';

/** Print / export dialog for a Kadi Moja NFC card face. `contact` — see cardToPrintContact / requestToPrintContact. */
const NfcPrintModal = ({ contact, onClose, onError }) => {
  const [svgBusy, setSvgBusy] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const runPrint = () => {
    const doc = buildNfcPrintDocument(contact, { autoPrint: true });
    // No noopener/noreferrer here — we need the window reference to write the
    // print document into it, and this is same-origin, self-generated content.
    const win = window.open('', '_blank', 'width=520,height=420');
    if (!win) {
      onError?.('Pop-up blocked — allow pop-ups to print, or use Export print file.');
      return;
    }
    win.document.open();
    win.document.write(doc);
    win.document.close();
  };

  const exportPrintHtml = () => {
    const doc = buildNfcPrintDocument(contact, { autoPrint: false });
    const blob = new Blob([doc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nfc-card-${contact.slug || contact.refValue || 'export'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportSvg = async () => {
    setSvgBusy(true);
    try {
      const svg = await buildNfcSvgDocument(contact);
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nfc-card-${contact.slug || contact.refValue || 'export'}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      onError?.('Could not export SVG.');
    } finally {
      setSvgBusy(false);
    }
  };

  return (
    <div className="km-nfc-print-overlay" role="dialog" aria-modal="true" aria-label="Print NFC card">
      <button type="button" className="km-nfc-print-backdrop" aria-label="Close" onClick={onClose} />
      <div className="km-nfc-print-panel">
        <div className="km-nfc-print-toolbar">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9a6b45]">Card print</p>
            <h2 className="mt-1 font-display text-xl font-semibold text-[#1a3d42]">{contact.name || 'NFC card'}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={runPrint}
              className="rounded-md bg-[#0d7377] px-3.5 py-2 text-sm font-semibold text-white"
            >
              Print card
            </button>
            <button
              type="button"
              onClick={exportPrintHtml}
              className="rounded-md border border-black/10 px-3.5 py-2 text-sm font-medium text-[#1a3d42]"
            >
              Export print file
            </button>
            <button
              type="button"
              onClick={exportSvg}
              disabled={svgBusy}
              className="rounded-md border border-black/10 px-3.5 py-2 text-sm font-medium text-[#1a3d42] disabled:opacity-50"
            >
              {svgBusy ? 'Preparing SVG…' : 'Save as SVG'}
            </button>
            <button type="button" onClick={onClose} className="rounded-md border border-black/10 px-3 py-2 text-sm">
              Close
            </button>
          </div>
        </div>

        <div className="km-nfc-print-sheet">
          <NfcCardVisual
            name={contact.name}
            title={contact.title}
            company={contact.company}
            location={contact.location}
            photoUrl={contact.photoUrl}
            float={false}
            className="km-nfc-print-face"
          />
          <div className="km-nfc-print-meta">
            <p>
              <strong>{contact.refLabel || 'Reference'}</strong> {contact.refValue ?? '—'}
            </p>
            <p>
              <strong>Phone</strong> {contact.phone || '—'}
            </p>
            <p>
              <strong>Email</strong> {contact.email || '—'}
            </p>
            <p>
              <strong>Profile</strong> {contact.slug ? `/u/${contact.slug}` : '—'}
            </p>
            <p className="km-nfc-print-meta-note">Credit-card size (85.6 × 53.98 mm) · Kadi Moja NFC card</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NfcPrintModal;

import { initialsFromName, resolveMediaUrl } from './media.js';

export const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Normalise an NFC request row into the shape buildNfcPrintDocument / NfcPrintModal expect. */
export const requestToPrintContact = (row) => ({
  name: row.ownerName || 'Card holder',
  title: row.ownerTitle,
  company: row.ownerCompany,
  location: row.ownerLocation,
  photoUrl: row.ownerPhotoUrl,
  slug: row.cardSlug,
  phone: row.ownerPhone || row.phone,
  email: row.ownerEmail,
  refLabel: 'Order',
  refValue: row.paymentOrderId || row.id
});

/** Normalise an admin Card entity into the shape buildNfcPrintDocument / NfcPrintModal expect. */
export const cardToPrintContact = (card) => ({
  name: card.fullName,
  title: card.title,
  company: card.company,
  location: card.location,
  photoUrl: card.photoUrl,
  slug: card.slug,
  phone: card.phone,
  email: card.email,
  refLabel: 'Card ID',
  refValue: card.id
});

/** Self-contained CR80 print document — used by Print and Export actions across admin pages. */
export const buildNfcPrintDocument = (contact, { autoPrint = false } = {}) => {
  const name = contact.name || 'Card holder';
  const title = contact.title || 'Professional';
  const company = contact.company || 'Kadi Moja';
  const location = contact.location || 'Tanzania';
  const photo = resolveMediaUrl(contact.photoUrl || '');
  const initials = initialsFromName(name);
  const slug = contact.slug ? `/u/${contact.slug}` : '';
  const logoUrl = `${window.location.origin}/logos/kadi-moja-mark-light.png`;
  const photoUrl = photo
    ? /^https?:\/\//i.test(photo) || photo.startsWith('data:')
      ? photo
      : `${window.location.origin}${photo.startsWith('/') ? '' : '/'}${photo}`
    : '';

  const avatarHtml = photoUrl
    ? `<img class="avatar" src="${escapeHtml(photoUrl)}" alt="" />`
    : `<div class="avatar avatar-fallback">${escapeHtml(initials)}</div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>NFC card — ${escapeHtml(name)}</title>
  <style>
    /* Exact CR80 credit-card page — fills print preview with the card */
    @page { size: 85.6mm 53.98mm; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 85.6mm;
      height: 53.98mm;
      overflow: hidden;
      background: #fff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      font-family: Georgia, 'Times New Roman', serif;
      color: #fff;
    }
    .card {
      width: 85.6mm;
      height: 53.98mm;
      background: linear-gradient(145deg, #0d7377 0%, #1a3d42 52%, #0a5f63 100%);
      position: relative;
      overflow: hidden;
    }
    .shine {
      position: absolute; inset: 0; pointer-events: none;
      background:
        radial-gradient(circle at 18% 20%, rgba(255,255,255,0.18), transparent 42%),
        radial-gradient(circle at 88% 78%, rgba(232,145,58,0.22), transparent 40%);
    }
    .inner {
      position: relative; z-index: 1;
      display: flex; flex-direction: column;
      width: 100%; height: 100%;
      padding: 4.2mm 5mm;
    }
    .top {
      display: flex; align-items: flex-start; justify-content: space-between; gap: 3mm;
    }
    .brand { display: flex; align-items: center; gap: 2mm; min-width: 0; }
    .brand img { width: 7mm; height: 7mm; object-fit: contain; flex-shrink: 0; }
    .brand-name { font-size: 4.2mm; font-weight: 700; letter-spacing: -0.02em; line-height: 1.1; color: #fff; }
    .brand-sub {
      margin-top: 0.6mm;
      font-size: 2.2mm;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.55);
      font-family: system-ui, sans-serif;
    }
    .badge {
      flex-shrink: 0;
      border: 0.3mm solid rgba(255,255,255,0.25);
      background: rgba(255,255,255,0.1);
      border-radius: 999px;
      padding: 0.8mm 2mm;
      font-size: 2.2mm;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.9);
      font-family: system-ui, sans-serif;
    }
    .body { margin-top: auto; }
    .person { display: flex; align-items: center; gap: 2.8mm; min-width: 0; }
    .avatar {
      width: 11mm; height: 11mm; border-radius: 999px;
      border: 0.5mm solid rgba(255,255,255,0.5);
      object-fit: cover; flex-shrink: 0;
    }
    .avatar-fallback {
      display: flex; align-items: center; justify-content: center;
      background: rgba(255,255,255,0.15);
      font-size: 3.2mm; font-weight: 700; letter-spacing: 0.04em;
      border: 0.5mm solid rgba(255,255,255,0.4);
      color: #fff;
    }
    .person-text { min-width: 0; }
    .person-name {
      font-size: 3.6mm; font-weight: 700; color: #fff;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 48mm;
    }
    .person-title {
      margin-top: 0.4mm;
      font-size: 2.6mm; color: rgba(255,255,255,0.72);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 48mm;
      font-family: system-ui, sans-serif;
    }
    .person-company {
      margin-top: 0.3mm;
      font-size: 2.4mm; font-style: italic; color: rgba(255,255,255,0.5);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 48mm;
    }
    .footer {
      margin-top: 3.5mm;
      display: flex; align-items: flex-end; justify-content: space-between; gap: 3mm;
    }
    .hint {
      font-size: 2.4mm; line-height: 1.35; color: rgba(255,255,255,0.55);
      font-family: system-ui, sans-serif;
    }
    .waves { display: flex; align-items: center; gap: 1mm; opacity: 0.75; flex-shrink: 0; }
    .waves span {
      display: block; border: 0.45mm solid rgba(255,255,255,0.75);
      border-radius: 999px; border-left-color: transparent; border-bottom-color: transparent;
      transform: rotate(45deg);
    }
    .waves span:nth-child(1) { width: 2mm; height: 2mm; }
    .waves span:nth-child(2) { width: 3.2mm; height: 3.2mm; }
    .waves span:nth-child(3) { width: 4.4mm; height: 4.4mm; }
    .screen-meta {
      display: none;
    }
    @media screen {
      html, body {
        width: auto; height: auto; overflow: auto;
        background: #e8eef0;
        padding: 24px;
      }
      .wrap {
        display: flex; flex-direction: column; align-items: flex-start; gap: 16px;
      }
      .card {
        box-shadow: 0 16px 40px rgba(13, 115, 119, 0.35);
        border-radius: 3mm;
      }
      .screen-meta {
        display: block;
        width: 85.6mm;
        font-family: system-ui, sans-serif;
        font-size: 12px; line-height: 1.55; color: #334;
        background: #fff; border-radius: 8px; padding: 12px 14px;
      }
      .screen-meta p { margin: 0; }
      .screen-meta strong { color: #1a3d42; }
      .screen-meta .note { margin-top: 6px; font-size: 11px; color: #889; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <div class="shine"></div>
      <div class="inner">
        <div class="top">
          <div class="brand">
            <img src="${escapeHtml(logoUrl)}" alt="" />
            <div>
              <div class="brand-name">Kadi Moja</div>
              <div class="brand-sub">Digital NFC</div>
            </div>
          </div>
          <span class="badge">NFC</span>
        </div>
        <div class="body">
          <div class="person">
            ${avatarHtml}
            <div class="person-text">
              <div class="person-name">${escapeHtml(name)}</div>
              <div class="person-title">${escapeHtml(title)}</div>
              <div class="person-company">${escapeHtml(company)}</div>
            </div>
          </div>
          <div class="footer">
            <p class="hint">
              Tap phone to connect<br />
              ${escapeHtml(location)}
            </p>
            <div class="waves" aria-hidden="true"><span></span><span></span><span></span></div>
          </div>
        </div>
      </div>
    </div>
    <div class="screen-meta">
      <p><strong>${escapeHtml(contact.refLabel || 'Reference')}</strong> ${escapeHtml(contact.refValue ?? '—')}</p>
      <p><strong>Phone</strong> ${escapeHtml(contact.phone || '—')}</p>
      <p><strong>Email</strong> ${escapeHtml(contact.email || '—')}</p>
      <p><strong>Profile</strong> ${escapeHtml(slug || '—')}</p>
      <p class="note">Credit-card size (85.6 × 53.98 mm) · Kadi Moja NFC card</p>
    </div>
  </div>
  ${autoPrint ? '<script>window.onload = function () { setTimeout(function () { window.print(); }, 250); };</script>' : ''}
</body>
</html>`;
};

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
  refValue: card.publicId
});

export const profileUrlFor = (slug) => (slug ? `${window.location.origin}/u/${slug}` : '');

export const qrCodeImageUrl = (data, size = 300) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=0&data=${encodeURIComponent(data)}`;

const toDataUri = async (url) => {
  if (!url) return '';
  try {
    const res = await fetch(url);
    if (!res.ok) return '';
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('read failed'));
      reader.readAsDataURL(blob);
    });
  } catch {
    return '';
  }
};

const resolveAbsoluteUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url) || url.startsWith('data:')) return url;
  return `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
};

/**
 * Standalone CR80-sized SVG of the card face — images are embedded as data
 * URIs so the file renders correctly on its own (e.g. opened by a print
 * vendor) without depending on kadimoja.com being reachable.
 */
export const buildNfcSvgDocument = async (contact) => {
  const name = contact.name || 'Card holder';
  const title = contact.title || 'Professional';
  const company = contact.company || 'Kadi Moja';
  const location = contact.location || 'Tanzania';
  const initials = initialsFromName(name);
  const photoUrl = resolveAbsoluteUrl(resolveMediaUrl(contact.photoUrl || ''));
  const logoUrl = `${window.location.origin}/logos/kadi-moja-mark-light.png`;
  const profileUrl = profileUrlFor(contact.slug);

  const [photoData, logoData, qrData] = await Promise.all([
    toDataUri(photoUrl),
    toDataUri(logoUrl),
    profileUrl ? toDataUri(qrCodeImageUrl(profileUrl, 300)) : Promise.resolve('')
  ]);

  const avatar = photoData
    ? `<clipPath id="avatarClip"><circle cx="15.5" cy="41.5" r="5.5"/></clipPath>
       <image href="${photoData}" x="10" y="36" width="11" height="11" clip-path="url(#avatarClip)" preserveAspectRatio="xMidYMid slice" />
       <circle cx="15.5" cy="41.5" r="5.5" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="0.5" />`
    : `<circle cx="15.5" cy="41.5" r="5.5" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" stroke-width="0.5" />
       <text x="15.5" y="42.7" text-anchor="middle" font-family="system-ui, sans-serif" font-size="3.2" font-weight="700" fill="#fff">${escapeHtml(initials)}</text>`;

  const brandX = logoData ? 13.5 : 5;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="85.6mm" height="53.98mm" viewBox="0 0 85.6 53.98">
  <title>NFC card — ${escapeHtml(name)}</title>
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0d7377"/>
      <stop offset="52%" stop-color="#1a3d42"/>
      <stop offset="100%" stop-color="#0a5f63"/>
    </linearGradient>
    <radialGradient id="shine1" cx="18%" cy="20%" r="45%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="shine2" cx="88%" cy="78%" r="40%">
      <stop offset="0%" stop-color="#e8913a" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#e8913a" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="cardClip"><rect width="85.6" height="53.98" rx="3"/></clipPath>
  </defs>
  <g clip-path="url(#cardClip)">
    <rect width="85.6" height="53.98" fill="url(#bg)"/>
    <rect width="85.6" height="53.98" fill="url(#shine1)"/>
    <rect width="85.6" height="53.98" fill="url(#shine2)"/>

    ${logoData ? `<image href="${logoData}" x="5" y="4.2" width="7" height="7" />` : ''}
    <text x="${brandX}" y="8" font-family="Georgia, 'Times New Roman', serif" font-size="4.2" font-weight="700" fill="#ffffff">Kadi Moja</text>
    <text x="${brandX}" y="11.3" font-family="system-ui, sans-serif" font-size="2.2" letter-spacing="0.3" fill="#ffffff" fill-opacity="0.55">DIGITAL NFC</text>

    <rect x="68.6" y="4.2" width="12" height="4.4" rx="2.2" fill="#ffffff" fill-opacity="0.1" stroke="#ffffff" stroke-opacity="0.25" stroke-width="0.3"/>
    <text x="74.6" y="7.1" text-anchor="middle" font-family="system-ui, sans-serif" font-size="2.2" font-weight="700" letter-spacing="0.15" fill="#ffffff" fill-opacity="0.9">NFC</text>

    ${avatar}

    <text x="23" y="40" font-family="Georgia, 'Times New Roman', serif" font-size="3.6" font-weight="700" fill="#ffffff">${escapeHtml(name)}</text>
    <text x="23" y="43.3" font-family="system-ui, sans-serif" font-size="2.6" fill="#ffffff" fill-opacity="0.72">${escapeHtml(title)}</text>
    <text x="23" y="46.1" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="2.4" fill="#ffffff" fill-opacity="0.5">${escapeHtml(company)}</text>

    <text x="5" y="49.5" font-family="system-ui, sans-serif" font-size="2.4" fill="#ffffff" fill-opacity="0.55">Tap phone to connect</text>
    <text x="5" y="52.3" font-family="system-ui, sans-serif" font-size="2.4" fill="#ffffff" fill-opacity="0.55">${escapeHtml(location)}</text>

    ${qrData
      ? `<rect x="70.6" y="39" width="12" height="12" rx="1" fill="#ffffff"/>
         <image href="${qrData}" x="71.4" y="39.8" width="10.4" height="10.4" />`
      : ''}
  </g>
</svg>`;
};

/** Self-contained CR80 print document — used by Print and Export actions across admin pages. */
export const buildNfcPrintDocument = (contact, { autoPrint = false } = {}) => {
  const name = contact.name || 'Card holder';
  const title = contact.title || 'Professional';
  const company = contact.company || 'Kadi Moja';
  const location = contact.location || 'Tanzania';
  const photo = resolveMediaUrl(contact.photoUrl || '');
  const initials = initialsFromName(name);
  const slug = contact.slug ? `/u/${contact.slug}` : '';
  const profileUrl = profileUrlFor(contact.slug);
  const qrHtml = profileUrl
    ? `<div class="qr"><img src="${escapeHtml(qrCodeImageUrl(profileUrl, 200))}" alt="QR code to open profile" /></div>`
    : '';
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
    .qr {
      flex-shrink: 0;
      width: 12mm; height: 12mm;
      background: #fff;
      border-radius: 1mm;
      padding: 0.8mm;
    }
    .qr img { width: 100%; height: 100%; display: block; }
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
            ${qrHtml}
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

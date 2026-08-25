import React from 'react';
import { initialsFromName, resolveMediaUrl } from '../utils/media.js';
import { profileUrlFor, qrCodeImageUrl } from '../utils/nfcPrintDocument.js';

const NfcCardVisual = ({ name, title, company, location = 'Tanzania', photoUrl, slug, float = true, className = '' }) => {
  const photo = resolveMediaUrl(photoUrl || '');
  const initials = initialsFromName(name);
  const profileUrl = profileUrlFor(slug);

  return (
    <div className={`km-nfc-card ${float ? 'km-nfc-float' : ''} ${className}`}>
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
              <p className="truncate font-semibold text-white">{name || 'Your Name'}</p>
              <p className="truncate text-xs text-white/70">{title || 'Your title'}</p>
              <p className="truncate text-[11px] italic text-white/50">{company || 'Your organisation'}</p>
            </div>
          </div>
          <div className="mt-5 flex items-end justify-between gap-3">
            <p className="text-[11px] leading-snug text-white/55">
              Tap phone to connect
              <br />
              {location}
            </p>
            {profileUrl && (
              <div className="flex-shrink-0 rounded-md bg-white p-1">
                <img
                  src={qrCodeImageUrl(profileUrl, 120)}
                  alt="Scan to open profile"
                  className="h-11 w-11"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NfcCardVisual;

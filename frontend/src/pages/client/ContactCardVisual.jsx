import React, { useMemo, useState } from 'react';
import { initialsFromName, resolveMediaUrl } from '../../utils/media.js';

const ContactIcon = ({ type }) => {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.8',
    className: 'h-[18px] w-[18px]'
  };
  if (type === 'call') {
    return (
      <svg {...common}>
        <path
          d="M6.6 3.8c.5-.5 1.3-.6 1.9-.2l2 1.4c.5.4.7 1.1.4 1.7l-.8 1.6c-.2.3-.1.7.1 1 1.2 1.6 2.7 3 4.4 4.2.3.2.7.3 1 .1l1.6-.8c.6-.3 1.3-.1 1.7.4l1.4 2c.4.6.3 1.4-.2 1.9l-1.1 1.1c-.5.5-1.2.7-1.9.6-2-.3-5-1.7-7.9-4.6S3.9 9.6 3.6 7.6c-.1-.7.1-1.4.6-1.9l1.1-1.1z"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (type === 'mail') {
    return (
      <svg {...common}>
        <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
        <path d="M4 7l8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === 'chat') {
    return (
      <svg {...common}>
        <path
          d="M5 18.5l-1.2 2.4c-.3.6.3 1.2.9.9L8 20.5A8.5 8.5 0 1 0 5 18.5z"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (type === 'language') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M3.5 12h17M12 3.5c2.4 2.6 3.6 5.4 3.6 8.5s-1.2 5.9-3.6 8.5c-2.4-2.6-3.6-5.4-3.6-8.5s1.2-5.9 3.6-8.5z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M12 21s6.5-5.2 6.5-10.2A6.5 6.5 0 0 0 12 4.3a6.5 6.5 0 0 0-6.5 6.5C5.5 15.8 12 21 12 21z" />
      <circle cx="12" cy="11" r="2.2" />
    </svg>
  );
};

/**
 * Beautiful card visual for saved/scanned contacts.
 * variant: "ink" (scanned) | "lagoon" (tap/Kadi Moja style)
 */
const ContactCardVisual = ({ contact, variant = 'ink', footer = null }) => {
  const [photoFailed, setPhotoFailed] = useState(false);
  const initials = initialsFromName(contact?.fullName);
  const photoSrc = resolveMediaUrl(contact?.photoUrl);
  const showPhoto = Boolean(photoSrc) && !photoFailed;

  const phoneList = useMemo(
    () =>
      contact?.phone
        ? contact.phone.split(/[,;]+/).map((item) => item.trim()).filter(Boolean)
        : [],
    [contact]
  );
  const primaryPhone = phoneList[0];
  const wa = contact?.whatsapp?.replace(/[^0-9]/g, '') || primaryPhone?.replace(/[^0-9]/g, '');

  const rows = [
    contact?.email && { label: 'Email', value: contact.email, href: `mailto:${contact.email}`, icon: 'mail' },
    primaryPhone && { label: 'Phone', value: phoneList.join(' · '), href: `tel:${primaryPhone}`, icon: 'call' },
    wa && {
      label: 'WhatsApp',
      value: contact.whatsapp || primaryPhone,
      href: `https://wa.me/${wa}`,
      icon: 'chat'
    },
    contact?.website && {
      label: 'Website',
      value: contact.website.replace(/^https?:\/\//, ''),
      href: contact.website.startsWith('http') ? contact.website : `https://${contact.website}`,
      icon: 'language'
    },
    contact?.location && { label: 'Location', value: contact.location, icon: 'location' }
  ].filter(Boolean);

  const brand =
    variant === 'lagoon'
      ? 'Kadi Moja'
      : contact?.source === 'scan'
        ? 'Scanned card'
        : 'Saved contact';

  return (
    <article className={`km-card km-saved-card km-saved-card--${variant} overflow-hidden bg-white sm:rounded-[1.75rem]`}>
      <header className="km-card-hero km-fade-in">
        <div className="km-card-hero-pattern" aria-hidden="true" />
        <div className="km-card-hero-content">
          <p className="km-card-brand">{brand}</p>
          <div className="km-card-portrait">
            {showPhoto ? (
              <img src={photoSrc} alt="" onError={() => setPhotoFailed(true)} />
            ) : (
              <span className="km-card-portrait-initials">{initials}</span>
            )}
          </div>
        </div>
        <svg className="km-card-wave" viewBox="0 0 400 72" preserveAspectRatio="none" aria-hidden="true">
          <path className="km-card-wave-fill" d="M0 44 C70 18 130 62 200 38 C270 14 330 8 400 34 V72 H0 Z" />
          <path className="km-card-wave-stroke" d="M0 44 C70 18 130 62 200 38 C270 14 330 8 400 34" fill="none" />
        </svg>
      </header>

      <div className="km-card-body relative px-6 pb-7 pt-1">
        <div className="km-fade-up">
          <h1 className="font-display text-[1.7rem] font-bold leading-tight tracking-tight text-[#1a3d42]">
            {contact?.fullName || 'Unnamed contact'}
          </h1>
          {contact?.title && (
            <p className="mt-1.5 text-[15px] font-medium text-[#1a3d42]/80">{contact.title}</p>
          )}
          {contact?.company && (
            <p className="mt-0.5 text-sm italic text-[#1a3d42]/50">{contact.company}</p>
          )}
        </div>

        {footer && <div className="km-fade-up km-fade-up-delay mt-5">{footer}</div>}

        {rows.length > 0 && (
          <ul className="km-fade-up km-fade-up-delay-2 mt-6 space-y-3.5">
            {rows.map((row) => {
              const inner = (
                <>
                  <span className="km-card-icon">
                    <ContactIcon type={row.icon} />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[15px] text-[#1a3d42]">{row.value}</span>
                </>
              );
              return (
                <li key={row.label}>
                  {row.href ? (
                    <a
                      href={row.href}
                      target={row.href.startsWith('http') ? '_blank' : undefined}
                      rel={row.href.startsWith('http') ? 'noreferrer' : undefined}
                      className="km-card-row"
                    >
                      {inner}
                    </a>
                  ) : (
                    <div className="km-card-row">{inner}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {contact?.notes && (
          <p className="km-fade-up mt-5 rounded-xl bg-[#f7f4ef] px-3.5 py-3 text-sm leading-relaxed text-[#1a3d42]/65">
            {contact.notes}
          </p>
        )}
      </div>
    </article>
  );
};

export default ContactCardVisual;

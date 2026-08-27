import React, { useMemo, useState } from 'react';
import { initialsFromName, resolveMediaUrl } from '../../utils/media.js';
import SocialLinks from '../../components/SocialLinks.jsx';
import ContactMethodIcon from '../../components/ContactMethodIcon.jsx';
import { AppointmentLink, YoutubeVideos } from '../../components/ProfileExtras.jsx';

/**
 * Beautiful card visual for saved/scanned contacts.
 * variant: "ink" (scanned) | "lagoon" (tap/Kadi Moja style)
 */
const ContactCardVisual = ({ contact, variant = 'ink', footer = null, themeVars = null }) => {
  const [photoFailed, setPhotoFailed] = useState(false);
  const initials = initialsFromName(contact?.fullName);
  const photoSrc = resolveMediaUrl(contact?.photoUrl);
  const logoSrc = resolveMediaUrl(contact?.logoUrl);
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

  const brandLabel =
    variant === 'lagoon'
      ? null
      : contact?.source === 'scan'
        ? 'Scanned card'
        : 'Saved contact';

  return (
    <article
      className={`km-card km-saved-card km-saved-card--${variant} overflow-hidden bg-white sm:rounded-[1.75rem]`}
      style={themeVars || undefined}
    >
      <header className="km-card-hero km-fade-in">
        <div className="km-card-hero-pattern" aria-hidden="true" />
        <div className="km-card-hero-content">
          <p className="km-card-brand">
            {variant === 'lagoon' ? (
              <img src="/logos/kadi-moja-icon-light.png" alt="Kadi Moja" className="km-card-brand-logo" />
            ) : (
              brandLabel
            )}
          </p>
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
        {logoSrc && <img src={logoSrc} alt="" className="km-card-logo" />}

        <div className={`km-fade-up ${logoSrc ? 'pr-16' : ''}`}>
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
        <AppointmentLink profile={contact} className="mt-2" />

        {rows.length > 0 && (
          <ul className="km-fade-up km-fade-up-delay-2 mt-6 space-y-3.5">
            {rows.map((row) => {
              const inner = (
                <>
                  <span className={`km-card-icon km-card-icon--${row.icon}`}>
                    <ContactMethodIcon type={row.icon} />
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

        <SocialLinks profile={contact} className="mt-6 justify-center" />
        <YoutubeVideos profile={contact} className="mt-6" />

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

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api.js';
import { initialsFromName, resolveMediaUrl } from '../utils/media.js';

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

const ProfilePage = () => {
  const { slug } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savedPulse, setSavedPulse] = useState(false);
  const [contactSaved, setContactSaved] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [photoFailed, setPhotoFailed] = useState(false);

  const isLoggedIn = Boolean(localStorage.getItem('clientToken'));

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setPhotoFailed(false);
    api
      .get(`/api/public/profile/${slug}`)
      .then((response) => {
        if (mounted) {
          setProfile(response.data);
          setError('');
        }
      })
      .catch(() => {
        if (mounted) setError('Profile not found.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [slug]);

  const downloadVCard = async () => {
    if (!profile) return;
    const response = await api.get(`/api/public/profile/${slug}/vcard`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${profile.fullName || 'contact'}.vcf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    setSavedPulse(true);
    window.setTimeout(() => setSavedPulse(false), 1600);
  };

  const saveToContacts = async () => {
    if (!profile || !isLoggedIn) return;
    setSaveMsg('');
    try {
      await api.post('/api/client/contacts', {
        fullName: profile.fullName,
        title: profile.title,
        company: profile.company,
        phone: profile.phone,
        email: profile.email,
        website: profile.website,
        location: profile.location,
        whatsapp: profile.whatsapp,
        photoUrl: profile.photoUrl,
        sourceProfileSlug: slug,
        source: 'tap'
      });
      setContactSaved(true);
      setSaveMsg('Saved to your Contacts.');
    } catch {
      setSaveMsg('Could not save contact. Sign in and try again.');
    }
  };

  const phoneList = useMemo(
    () =>
      profile?.phone
        ? profile.phone.split(/[,;]+/).map((item) => item.trim()).filter(Boolean)
        : [],
    [profile]
  );
  const primaryPhone = phoneList[0];
  const wa = profile?.whatsapp?.replace(/[^0-9]/g, '') || primaryPhone?.replace(/[^0-9]/g, '');
  const initials = initialsFromName(profile?.fullName);
  const photoSrc = resolveMediaUrl(profile?.photoUrl);
  const logoSrc = resolveMediaUrl(profile?.logoUrl);
  const showPhoto = Boolean(photoSrc) && !photoFailed;

  if (loading) {
    return (
      <div className="km-card-page flex min-h-screen items-center justify-center">
        <p className="km-fade-in text-sm text-[#1a3d42]/50">Opening card…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="km-card-page flex min-h-screen flex-col items-center justify-center gap-4 px-5">
        <p className="font-display text-2xl font-semibold text-[#1a3d42]">{error}</p>
        <Link to="/" className="text-sm text-[#0d7377] hover:underline">
          Back to Kadi Moja
        </Link>
      </div>
    );
  }

  const rows = [
    profile.email && { label: 'Email', value: profile.email, href: `mailto:${profile.email}`, icon: 'mail' },
    primaryPhone && { label: 'Phone', value: phoneList.join(' · '), href: `tel:${primaryPhone}`, icon: 'call' },
    wa && {
      label: 'WhatsApp',
      value: profile.whatsapp || primaryPhone,
      href: `https://wa.me/${wa}`,
      icon: 'chat'
    },
    profile.website && {
      label: 'Website',
      value: profile.website.replace(/^https?:\/\//, ''),
      href: profile.website.startsWith('http') ? profile.website : `https://${profile.website}`,
      icon: 'language'
    },
    profile.location && { label: 'Location', value: profile.location, icon: 'location' }
  ].filter(Boolean);

  return (
    <div className="km-card-page min-h-screen px-0 pb-12 sm:px-4 sm:py-10">
      <article className="km-card mx-auto w-full max-w-[400px] overflow-hidden bg-white sm:rounded-[1.75rem]">
        <header className="km-card-hero km-fade-in">
          <div className="km-card-hero-pattern" aria-hidden="true" />
          <div className="km-card-hero-content">
            <p className="km-card-brand">Kadi Moja</p>
            <div className="km-card-portrait">
              {showPhoto ? (
                <img
                  src={photoSrc}
                  alt=""
                  onError={() => setPhotoFailed(true)}
                />
              ) : (
                <span className="km-card-portrait-initials">{initials}</span>
              )}
            </div>
          </div>
          <svg className="km-card-wave" viewBox="0 0 400 72" preserveAspectRatio="none" aria-hidden="true">
            <path className="km-card-wave-fill" d="M0 44 C70 18 130 62 200 38 C270 14 330 8 400 34 V72 H0 Z" />
            <path
              className="km-card-wave-stroke"
              d="M0 44 C70 18 130 62 200 38 C270 14 330 8 400 34"
              fill="none"
            />
          </svg>
        </header>

        <div className="km-card-body relative px-6 pb-7 pt-1">
          {logoSrc && (
            <img src={logoSrc} alt="" className="km-card-logo km-fade-up" />
          )}

          <div className={`km-fade-up ${logoSrc ? 'pr-16' : ''}`}>
            <h1 className="font-display text-[1.7rem] font-bold leading-tight tracking-tight text-[#1a3d42]">
              {profile.fullName}
            </h1>
            {profile.title && (
              <p className="mt-1.5 text-[15px] font-medium text-[#1a3d42]/80">{profile.title}</p>
            )}
            {profile.company && (
              <p className="mt-0.5 text-sm italic text-[#1a3d42]/50">{profile.company}</p>
            )}
          </div>

          <div className="km-fade-up km-fade-up-delay mt-5 flex flex-col gap-2">
            <button
              type="button"
              onClick={downloadVCard}
              className={`km-card-cta ${savedPulse ? 'is-saved' : ''}`}
            >
              {savedPulse ? 'Contact saved' : 'Save contact details'}
            </button>
            {isLoggedIn ? (
              <button
                type="button"
                onClick={saveToContacts}
                disabled={contactSaved}
                className="km-card-cta-ghost"
              >
                {contactSaved ? 'In your Contacts' : 'Save to my Contacts'}
              </button>
            ) : (
              <Link
                to="/login"
                state={{ from: { pathname: `/u/${slug}` } }}
                className="km-card-cta-ghost text-center"
              >
                Sign in to save to Contacts
              </Link>
            )}
            {saveMsg && <p className="text-center text-xs text-[#0d7377]">{saveMsg}</p>}
          </div>

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

          {(profile.linkedin || profile.twitter || profile.github) && (
            <div className="mt-7 flex justify-center gap-3">
              {profile.linkedin && (
                <a href={profile.linkedin} target="_blank" rel="noreferrer" className="km-card-social">
                  in
                </a>
              )}
              {profile.twitter && (
                <a href={profile.twitter} target="_blank" rel="noreferrer" className="km-card-social">
                  𝕏
                </a>
              )}
              {profile.github && (
                <a href={profile.github} target="_blank" rel="noreferrer" className="km-card-social">
                  GH
                </a>
              )}
            </div>
          )}
        </div>
      </article>
    </div>
  );
};

export default ProfilePage;

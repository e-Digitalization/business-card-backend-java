import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api.js';
import { initialsFromName, resolveMediaUrl } from '../utils/media.js';
import { getCardThemeVars } from '../utils/cardTheme.js';
import SocialLinks from '../components/SocialLinks.jsx';
import ContactMethodIcon from '../components/ContactMethodIcon.jsx';
import { AppointmentLink, YoutubeVideos } from '../components/ProfileExtras.jsx';

const ProfilePage = () => {
  const { slug } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [photoFailed, setPhotoFailed] = useState(false);

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

  const vcardUrl = `${import.meta.env.VITE_API_BASE_URL || ''}/api/public/profile/${slug}/vcard`;

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
    return <div className="km-card-page min-h-screen" aria-busy="true" />;
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
      <article
        className="km-card mx-auto w-full max-w-[400px] overflow-hidden bg-white sm:rounded-[1.75rem]"
        style={getCardThemeVars(profile)}
      >
        <header className="km-card-hero km-fade-in">
          <div className="km-card-hero-pattern" aria-hidden="true" />
          <div className="km-card-hero-content">
            <p className="km-card-brand">
              <img src="/logos/kadi-moja-icon-light.png" alt="Kadi Moja" className="km-card-brand-logo" />
            </p>
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
            <a href={vcardUrl} className="km-card-cta text-center">
              Save contact details
            </a>
            <AppointmentLink profile={profile} />
          </div>

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

          <SocialLinks profile={profile} className="mt-7 justify-center" />
          <YoutubeVideos profile={profile} className="mt-7" />
        </div>
      </article>
    </div>
  );
};

export default ProfilePage;

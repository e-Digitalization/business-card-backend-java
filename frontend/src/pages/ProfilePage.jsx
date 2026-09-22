import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api.js';
import { initialsFromName, resolveMediaUrl } from '../utils/media.js';
import { getCardThemeVars } from '../utils/cardTheme.js';
import { sampleVcard } from '../utils/professionSamples.js';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import FlagIcon from '@mui/icons-material/Flag';
import CampaignIcon from '@mui/icons-material/Campaign';
import EventIcon from '@mui/icons-material/Event';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SocialLinks from '../components/SocialLinks.jsx';
import ContactMethodIcon from '../components/ContactMethodIcon.jsx';
import { AppointmentLink, YoutubeVideos } from '../components/ProfileExtras.jsx';
import ResearcherSection, { hasResearchContent } from '../components/ResearcherSection.jsx';
import { BankerAds, BankerServices, hasBankerAds, hasBankerServices } from '../components/BankerSection.jsx';
import { GovernmentEvents, GovernmentOffice, hasGovernmentEvents, hasGovernmentOffice } from '../components/GovernmentSection.jsx';

const ProfilePage = ({ demoProfile = null, initialTab = 'profile' }) => {
  const { slug } = useParams();
  const [profile, setProfile] = useState(demoProfile);
  const [tab, setTab] = useState(initialTab);
  const [dir, setDir] = useState('next');
  const swipeStart = useRef(null);
  const bodyRef = useRef(null);
  const [loading, setLoading] = useState(!demoProfile);
  const [error, setError] = useState('');
  const [photoFailed, setPhotoFailed] = useState(false);

  // The public card is always a light design; keep the page behind it (overscroll, area under
  // Safari's toolbar) in the same tone even when the visitor's phone is in dark mode.
  useEffect(() => {
    document.documentElement.classList.add('km-card-view');
    return () => document.documentElement.classList.remove('km-card-view');
  }, []);

  useEffect(() => {
    if (demoProfile) return undefined;
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
  }, [slug, demoProfile]);

  const vcardUrl = demoProfile ? sampleVcard(demoProfile) : `${import.meta.env.VITE_API_BASE_URL || ''}/api/public/profile/${slug}/vcard`;

  const phoneList = useMemo(
    () =>
      profile?.phone
        ? profile.phone.split(/[,;]+/).map((item) => item.trim()).filter(Boolean)
        : [],
    [profile]
  );
  const primaryPhone = phoneList[0];
  const wa = demoProfile ? '' : profile?.whatsapp?.replace(/[^0-9]/g, '') || primaryPhone?.replace(/[^0-9]/g, '');
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

  // The bottom bar never has more than 3 tabs:
  //   Profile  – identity, contact rows, socials, videos
  //   Events / Ads – auto-sliding government events, or bank poster + small ads
  //   More     – office, services and research, stacked when a card has several categories
  const isGov = hasGovernmentEvents(profile);
  const isBank = hasBankerAds(profile);
  const moreSections = [
    hasGovernmentOffice(profile) && { label: 'Office', Icon: FlagIcon },
    hasBankerServices(profile) && { label: 'Bank', Icon: AccountBalanceIcon },
    hasResearchContent(profile) && { label: 'Research', Icon: SchoolIcon }
  ].filter(Boolean);
  const tabs = [
    { id: 'profile', label: 'Profile', Icon: PersonIcon },
    (isGov || isBank) && {
      id: 'updates',
      label: isGov && isBank ? 'Updates' : isGov ? 'Events' : 'Ads',
      Icon: isGov && !isBank ? EventIcon : CampaignIcon
    },
    moreSections.length > 0 && {
      id: 'more',
      label: moreSections.length === 1 ? moreSections[0].label : 'Details',
      Icon: moreSections.length === 1 ? moreSections[0].Icon : InfoOutlinedIcon
    }
  ].filter(Boolean);
  const showTabs = tabs.length > 1;
  const activeIndex = Math.max(0, tabs.findIndex((t) => t.id === tab));

  const changeTab = (id) => {
    const next = tabs.findIndex((t) => t.id === id);
    if (next < 0 || id === tab) return;
    setDir(next > activeIndex ? 'next' : 'prev');
    setTab(id);
    // Keep the new tab's content in view if the reader had scrolled far down.
    requestAnimationFrame(() => {
      const body = bodyRef.current;
      if (body && body.getBoundingClientRect().top < 0) body.scrollIntoView({ block: 'start', behavior: 'smooth' });
    });
  };

  // Swipe left/right anywhere on the card to move between tabs (carousels keep their own swipe).
  const onSwipeStart = (e) => {
    if (!showTabs || e.target.closest?.('.km-slider, input, textarea, [data-no-swipe]')) {
      swipeStart.current = null;
      return;
    }
    const t = e.touches[0];
    swipeStart.current = { x: t.clientX, y: t.clientY };
  };
  const onSwipeEnd = (e) => {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      const target = tabs[activeIndex + (dx < 0 ? 1 : -1)];
      if (target) changeTab(target.id);
    }
  };

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
    <div className="km-card-page min-h-screen px-0 pb-0 sm:px-4 sm:py-10">
      <article
        className="km-card mx-auto min-h-[100dvh] w-full max-w-[400px] overflow-clip bg-white sm:min-h-0 sm:rounded-[1.75rem]"
        style={getCardThemeVars(profile)}
        onTouchStart={onSwipeStart}
        onTouchEnd={onSwipeEnd}
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

        <div ref={bodyRef} className={`km-card-body relative px-6 pt-1 ${showTabs ? 'pb-28' : 'pb-7'}`}>
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
            <a href={vcardUrl} download={demoProfile ? "kadi-moja-sample.vcf" : undefined} className="km-card-cta text-center">
              Save contact details
            </a>
            <AppointmentLink profile={profile} />
          </div>

          <div key={tab} className={`km-tab-panel km-tab-panel--${dir}`}>
          {tab === 'profile' && (
          <>
          {demoProfile?.bio && (
            <section className="mt-6 space-y-4 text-sm leading-relaxed text-[#1a3d42]" aria-label="About">
              <h2 className="font-semibold">About {profile.fullName.replace(/^Dr\.\s*/, '').split(' ')[0]}</h2>
              <p>{profile.bio}</p>
              <div><h3 className="mb-2 font-semibold">Expertise</h3><div className="km-card-research-tags">{profile.expertise.map(item => <span key={item}>{item}</span>)}</div></div>
              <div><h3 className="mb-2 font-semibold">Education & qualifications</h3><ul className="space-y-1">{profile.qualifications.map(item => <li key={item}>{item}</li>)}</ul></div>
              <dl className="space-y-3">
                <div><dt className="font-semibold">Languages</dt><dd>{profile.languages.join(' · ')}</dd></div>
                <div><dt className="font-semibold">Office</dt><dd>{profile.officeAddress}</dd></div>
                <div><dt className="font-semibold">Office hours</dt><dd>{profile.officeHours}</dd></div>
              </dl>
              <p className="text-xs text-[#1a3d42]/60">Fictional sample profile. Portrait is AI-generated; contact details are illustrative.</p>
            </section>
          )}
          {demoProfile?.bio && <h2 className="mt-6 text-sm font-semibold text-[#1a3d42]">Contact details</h2>}
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
                  {row.href && !demoProfile ? (
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

          <SocialLinks
            profile={profile}
            whatsappUrl={wa ? `https://wa.me/${wa}` : ''}
            className="mt-7 justify-center"
          />
          <YoutubeVideos profile={profile} className="mt-7" />
          </>
          )}

          {tab === 'updates' && (
            <div className="km-card-stack mt-6">
              <GovernmentEvents profile={profile} />
              <BankerAds profile={profile} />
            </div>
          )}

          {tab === 'more' && (
            <div className="km-card-stack mt-6">
              <GovernmentOffice profile={profile} />
              <BankerServices profile={profile} />
              <ResearcherSection profile={profile} />
            </div>
          )}
          </div>
        </div>

        {/* Rendered in a portal and pinned to the screen (position: fixed): a sticky bar inside the card
            drifts away from the screen edge on iOS Safari and inside any transformed / clipped parent. */}
        {showTabs &&
          createPortal(
            <nav className="km-card-tabbar" aria-label="Card sections" style={getCardThemeVars(profile)}>
              <div className="km-card-tabbar-pill" role="tablist" style={{ '--tabs': tabs.length, '--i': activeIndex }}>
                <span className="km-tab-indicator" aria-hidden="true" />
                {tabs.map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={tab === id}
                    className={tab === id ? 'is-active' : ''}
                    onClick={() => changeTab(id)}
                  >
                    <span className="km-tab-icon">
                      <Icon aria-hidden="true" />
                    </span>
                    <span className="km-tab-label">{label}</span>
                  </button>
                ))}
              </div>
            </nav>,
            document.body
          )}
      </article>
    </div>
  );
};

export default ProfilePage;

import React, { useMemo } from 'react';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CampaignIcon from '@mui/icons-material/Campaign';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import AutoSlider from './AutoSlider.jsx';
import { cleanBanker, hasCategory } from '../utils/cardCategories.js';
import { resolveMediaUrl } from '../utils/media.js';
import { safeExternalUrl } from '../utils/profileLinks.js';

const useBanker = (profile) =>
  useMemo(
    () => (hasCategory(profile, 'banker') ? cleanBanker(profile?.bankerData) : null),
    [profile?.bankerData, profile?.categories]
  );

const flag = (profile, fn) => {
  const b = hasCategory(profile, 'banker') ? cleanBanker(profile?.bankerData) : null;
  return Boolean(b && fn(b));
};
export const hasBankerAds = (profile) => flag(profile, (b) => b.hasAds);
export const hasBankerServices = (profile) => flag(profile, (b) => b.hasInfo);

const Linked = ({ href, className, children, label }) => {
  const safe = safeExternalUrl(href);
  return safe ? (
    <a href={safe} target="_blank" rel="noreferrer" className={className} aria-label={label}>
      {children}
    </a>
  ) : (
    <div className={className}>{children}</div>
  );
};

// Ads-tab block: featured poster ads (auto-sliding, portrait) and a grid of small ads.
export const BankerAds = ({ profile, className = '' }) => {
  const b = useBanker(profile);
  if (!b || !b.hasAds) return null;
  return (
    <div className={`km-card-stack ${className}`}>
      {b.posters.length > 0 && (
        <section aria-label="Featured offers">
          <h2 className="km-card-videos-title km-card-research-title mb-3">
            <CampaignIcon aria-hidden="true" sx={{ fontSize: 22 }} />
            Featured offers
          </h2>
          <AutoSlider
            items={b.posters}
            label="Featured offers"
            mediaRatio={5 / 4}
            renderSlide={(poster) => (
              <Linked href={poster.linkUrl} className="km-poster" label={poster.title || 'Offer'}>
                <img src={resolveMediaUrl(poster.imageUrl)} alt={poster.title || ''} loading="lazy" draggable="false" />
              </Linked>
            )}
          />
        </section>
      )}

      {b.smallAds.length > 0 && (
        <section aria-label="More offers">
          <h2 className="km-card-videos-title km-card-research-title mb-3">More offers</h2>
          <ul className="km-small-ads">
            {b.smallAds.map((ad, i) => (
              <li key={`${ad.title}-${i}`}>
                <Linked href={ad.linkUrl} className="km-small-ad">
                  {ad.imageUrl && (
                    <div className="km-small-ad-media">
                      <img src={resolveMediaUrl(ad.imageUrl)} alt="" loading="lazy" draggable="false" />
                    </div>
                  )}
                  <div className="km-small-ad-body">
                    {ad.title && <p className="km-small-ad-title">{ad.title}</p>}
                    {ad.description && <p className="km-small-ad-desc">{ad.description}</p>}
                  </div>
                </Linked>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

// More-tab block: the bank (institution, branch, department, focus areas), its services and regulatory note.
export const BankerServices = ({ profile, className = '' }) => {
  const b = useBanker(profile);
  if (!b || !b.hasInfo) return null;

  return (
    <section className={`km-banker ${className}`} aria-label="Bank">
      <h2 className="km-card-videos-title km-card-research-title">
        <AccountBalanceIcon aria-hidden="true" sx={{ fontSize: 22 }} />
        {b.institution || 'Services'}
      </h2>
      {(b.branch || b.department) && (
        <p className="km-org-sub">{[b.department, b.branch].filter(Boolean).join(' · ')}</p>
      )}
      {b.specialties.length > 0 && (
        <div className="km-card-research-tags mt-3">
          {b.specialties.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      )}
      {b.services.length > 0 && (
        <>
          <h3 className="km-org-heading">Services</h3>
          <ul className="km-banker-services">
            {b.services.map((s, i) => (
              <li key={`${s.title}-${i}`}>
                <span className="km-banker-service-num">{i + 1}</span>
                <div>
                  <p className="km-banker-service-title">{s.title}</p>
                  {s.description && <p className="km-banker-service-desc">{s.description}</p>}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
      {b.regulator && (
        <p className="km-banker-regulator">
          <VerifiedUserIcon aria-hidden="true" sx={{ fontSize: 16 }} />
          {b.regulator}
        </p>
      )}
    </section>
  );
};

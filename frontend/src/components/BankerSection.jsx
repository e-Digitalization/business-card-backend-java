import React, { useMemo } from 'react';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { cleanBanker, hasCategory } from '../utils/cardCategories.js';
import { resolveMediaUrl } from '../utils/media.js';

const useBanker = (profile) =>
  useMemo(
    () => (hasCategory(profile, 'banker') ? cleanBanker(profile?.bankerData) : null),
    [profile?.bankerData, profile?.categories]
  );

export const hasBankerServices = (profile) => {
  const b = hasCategory(profile, 'banker') ? cleanBanker(profile?.bankerData) : null;
  return Boolean(b && (b.services.length || b.regulator));
};

// Profile-tab block: banner picture with institution overlay, plus focus areas.
export const BankerProfile = ({ profile, className = '' }) => {
  const b = useBanker(profile);
  if (!b || !b.hasProfile) return null;
  const banner = resolveMediaUrl(b.bannerUrl);
  const [first, ...rest] = b.specialties;

  return (
    <section className={`km-banker ${className}`} aria-label="Banking profile">
      <div
        className={`km-banker-banner ${banner ? '' : 'is-fallback'}`}
        style={banner ? { backgroundImage: `url(${banner})` } : undefined}
        role={banner ? 'img' : undefined}
        aria-label={banner ? b.institution || 'Banner' : undefined}
      >
        {(b.institution || b.branch) && (
          <div className="km-banker-banner-caption">
            {b.institution && <strong>{b.institution}</strong>}
            {b.branch && <span>{b.branch}</span>}
          </div>
        )}
      </div>
      {(b.department || b.specialties.length > 0) && (
        <ul className="km-banker-facts">
          {b.department && (
            <li>
              <AccountBalanceIcon aria-hidden="true" />
              <span>{b.department}</span>
            </li>
          )}
          {b.specialties.length > 0 && (
            <li>
              <BusinessCenterIcon aria-hidden="true" />
              <span>{[first, ...rest].join('  |  ')}</span>
            </li>
          )}
        </ul>
      )}
    </section>
  );
};

// Services-tab block.
export const BankerServices = ({ profile, className = '' }) => {
  const b = useBanker(profile);
  if (!b || (!b.services.length && !b.regulator)) return null;

  return (
    <section className={`km-banker ${className}`} aria-label="Services">
      <h2 className="km-card-videos-title km-card-research-title mb-3">
        <AccountBalanceIcon aria-hidden="true" sx={{ fontSize: 22 }} />
        Services
      </h2>
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
      {b.regulator && (
        <p className="km-banker-regulator">
          <VerifiedUserIcon aria-hidden="true" sx={{ fontSize: 16 }} />
          {b.regulator}
        </p>
      )}
    </section>
  );
};

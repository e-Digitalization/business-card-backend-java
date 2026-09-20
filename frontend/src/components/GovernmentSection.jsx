import React, { useMemo, useState } from 'react';
import EventIcon from '@mui/icons-material/Event';
import FlagIcon from '@mui/icons-material/Flag';
import PlaceIcon from '@mui/icons-material/Place';
import AutoSlider from './AutoSlider.jsx';
import EventDateTile from './EventDateTile.jsx';
import EventDialog from './EventDialog.jsx';
import { cleanGovernment, hasCategory, isUpcomingEvent } from '../utils/cardCategories.js';
import { getCardThemeVars } from '../utils/cardTheme.js';
import { resolveMediaUrl } from '../utils/media.js';

const useGovernment = (profile) =>
  useMemo(
    () => (hasCategory(profile, 'government') ? cleanGovernment(profile?.governmentData) : null),
    [profile?.governmentData, profile?.categories]
  );

const flag = (profile, key) => {
  const g = hasCategory(profile, 'government') ? cleanGovernment(profile?.governmentData) : null;
  return Boolean(g && g[key]);
};
export const hasGovernmentEvents = (profile) => flag(profile, 'hasEvents');
export const hasGovernmentOffice = (profile) => flag(profile, 'hasOffice');

const EventCard = ({ event, onOpen }) => {
  const upcoming = isUpcomingEvent(event.date);
  const canOpen = Boolean(event.description || event.linkUrl || event.venue);
  return (
    <article className="km-event-card">
      {/* Same picture slot with or without a photo, so every slide has the same shape */}
      <div className={`km-event-media ${event.imageUrl ? '' : 'is-placeholder'}`}>
        {event.imageUrl ? (
          <img src={resolveMediaUrl(event.imageUrl)} alt="" loading="lazy" draggable="false" />
        ) : (
          <EventIcon aria-hidden="true" className="km-event-placeholder-icon" />
        )}
        {upcoming && <span className="km-event-badge">Upcoming</span>}
      </div>
      <div className="km-event-body">
        <div className="km-event-head">
          <EventDateTile value={event.date} />
          <div className="km-event-head-text">
            {event.title && <h3 className="km-event-title">{event.title}</h3>}
            {event.venue && (
              <p className="km-event-venue">
                <PlaceIcon aria-hidden="true" sx={{ fontSize: 15 }} />
                {event.venue}
              </p>
            )}
          </div>
        </div>
        {event.description && <p className="km-event-desc">{event.description}</p>}
        {canOpen && (
          <button type="button" className="km-event-more" onClick={() => onOpen(event)}>
            Read more →
          </button>
        )}
      </div>
    </article>
  );
};

// Events-tab block: auto-sliding event cards; "Read more" opens the full details.
export const GovernmentEvents = ({ profile, className = '' }) => {
  const g = useGovernment(profile);
  const [open, setOpen] = useState(null);
  if (!g || !g.hasEvents) return null;
  return (
    <section className={className} aria-label="Events">
      <h2 className="km-card-videos-title km-card-research-title mb-3">
        <EventIcon aria-hidden="true" sx={{ fontSize: 22 }} />
        Events
      </h2>
      <AutoSlider
        items={g.events}
        label="Events"
        mediaRatio={9 / 16}
        paused={Boolean(open)}
        renderSlide={(event) => <EventCard event={event} onOpen={setOpen} />}
      />
      <EventDialog event={open} onClose={() => setOpen(null)} themeVars={getCardThemeVars(profile)} />
    </section>
  );
};

// More-tab block: mandate and key initiatives.
export const GovernmentOffice = ({ profile, className = '' }) => {
  const g = useGovernment(profile);
  if (!g || !g.hasOffice) return null;
  return (
    <section className={`km-banker ${className}`} aria-label="Office">
      <h2 className="km-card-videos-title km-card-research-title">
        <FlagIcon aria-hidden="true" sx={{ fontSize: 22 }} />
        {g.institution || 'Office'}
      </h2>
      {g.department && <p className="km-org-sub">{g.department}</p>}
      {g.mandate && <p className="mb-4 mt-3 text-sm leading-relaxed text-[#1a3d42]/80">{g.mandate}</p>}
      {g.initiatives.length > 0 && (
        <ul className="km-banker-services">
          {g.initiatives.map((it, i) => (
            <li key={`${it.title}-${i}`}>
              <span className="km-banker-service-num">{i + 1}</span>
              <div>
                <p className="km-banker-service-title">{it.title}</p>
                {it.description && <p className="km-banker-service-desc">{it.description}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

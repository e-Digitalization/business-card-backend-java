import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import CloseIcon from '@mui/icons-material/Close';
import EventIcon from '@mui/icons-material/Event';
import PlaceIcon from '@mui/icons-material/Place';
import EventDateTile from './EventDateTile.jsx';
import { formatEventDateLong } from '../utils/cardCategories.js';
import { resolveMediaUrl } from '../utils/media.js';
import { safeExternalUrl } from '../utils/profileLinks.js';

// Full event details ("Read more"). Rendered in a portal so card animations/overflow never clip it.
const EventDialog = ({ event, onClose, themeVars }) => {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!event) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [event, onClose]);

  if (!event) return null;
  const href = safeExternalUrl(event.linkUrl);

  return createPortal(
    <div className="km-event-overlay" style={themeVars} onClick={onClose}>
      <div className="km-event-dialog" role="dialog" aria-modal="true" aria-label={event.title || 'Event'} onClick={(e) => e.stopPropagation()}>
        <button ref={closeRef} type="button" className="km-event-close" onClick={onClose} aria-label="Close">
          <CloseIcon />
        </button>
        {event.imageUrl && (
          <div className="km-event-dialog-media">
            <img src={resolveMediaUrl(event.imageUrl)} alt="" />
          </div>
        )}
        <div className="km-event-dialog-body">
          <div className="km-event-head">
            <EventDateTile value={event.date} size="lg" />
            <div className="km-event-head-text">
              {event.title && <h3 className="km-event-dialog-title">{event.title}</h3>}
              <div className="km-event-meta">
                {event.date && (
                  <span>
                    <EventIcon aria-hidden="true" sx={{ fontSize: 16 }} />
                    {formatEventDateLong(event.date)}
                  </span>
                )}
                {event.venue && (
                  <span>
                    <PlaceIcon aria-hidden="true" sx={{ fontSize: 16 }} />
                    {event.venue}
                  </span>
                )}
              </div>
            </div>
          </div>
          {event.description && <p className="km-event-dialog-text">{event.description}</p>}
          {href && (
            <a href={href} target="_blank" rel="noreferrer" className="km-card-cta mt-4 block text-center">
              Learn more
            </a>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default EventDialog;

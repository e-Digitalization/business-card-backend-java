import React, { useEffect, useState } from 'react';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import YouTubeIcon from '@mui/icons-material/YouTube';
import { safeExternalUrl, youtubeVideoIds } from '../utils/profileLinks.js';

export const AppointmentLink = ({ profile, className = '' }) => {
  const href = safeExternalUrl(profile?.bookingUrl);
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`km-card-appointment ${className}`}
    >
      <CalendarMonthIcon aria-hidden="true" sx={{ fontSize: 19 }} />
      Book an appointment
    </a>
  );
};

const VideoFrame = ({ id, index }) => (
  <iframe
    src={`https://www.youtube-nocookie.com/embed/${id}`}
    title={`Featured YouTube video ${index + 1}`}
    loading="lazy"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    referrerPolicy="strict-origin-when-cross-origin"
    allowFullScreen
  />
);

export const YoutubeVideos = ({ profile, className = '' }) => {
  const videoIds = youtubeVideoIds(profile);
  const [active, setActive] = useState(0);
  const count = videoIds.length;

  // Keep the active index valid if the underlying list changes (live previews).
  useEffect(() => {
    setActive((i) => Math.min(i, Math.max(count - 1, 0)));
  }, [count]);

  if (!count) return null;

  const single = count === 1;
  const go = (next) => setActive((next + count) % count);

  return (
    <section className={`km-card-videos ${className}`} aria-label="Featured videos" aria-roledescription="carousel">
      <div className="km-card-videos-head">
        <h2 className="km-card-videos-title">
          <YouTubeIcon aria-hidden="true" sx={{ fontSize: 22 }} />
          {single ? 'Featured video' : 'Featured videos'}
        </h2>
        {!single && (
          <span className="km-card-videos-count" aria-live="polite">
            {active + 1} / {count}
          </span>
        )}
      </div>

      {single ? (
        <div className="km-card-videos-grid">
          <VideoFrame id={videoIds[0]} index={0} />
        </div>
      ) : (
        <div className="km-card-videos-slider">
          <div className="km-card-videos-viewport">
            <div className="km-card-videos-track" style={{ transform: `translateX(-${active * 100}%)` }}>
              {videoIds.map((id, index) => (
                <div className="km-card-videos-slide" key={id}>
                  {/* Only mount a player for the current slide and its neighbours;
                      the rest stay as lightweight thumbnails until swiped to. */}
                  {Math.abs(index - active) <= 1 ? (
                    <VideoFrame id={id} index={index} />
                  ) : (
                    <img
                      className="km-card-videos-poster"
                      src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
                      alt=""
                      loading="lazy"
                    />
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              className="km-card-videos-arrow km-card-videos-arrow--prev"
              onClick={() => go(active - 1)}
              aria-label="Previous video"
            >
              <ChevronLeftIcon aria-hidden="true" />
            </button>
            <button
              type="button"
              className="km-card-videos-arrow km-card-videos-arrow--next"
              onClick={() => go(active + 1)}
              aria-label="Next video"
            >
              <ChevronRightIcon aria-hidden="true" />
            </button>
          </div>

          <div className="km-card-videos-dots" role="tablist" aria-label="Choose video">
            {videoIds.map((id, index) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={index === active}
                aria-label={`Video ${index + 1}`}
                className={`km-card-videos-dot ${index === active ? 'is-active' : ''}`}
                onClick={() => setActive(index)}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

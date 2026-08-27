import React from 'react';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
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

export const YoutubeVideos = ({ profile, className = '' }) => {
  const videoIds = youtubeVideoIds(profile);
  if (!videoIds.length) return null;

  return (
    <section className={`km-card-videos ${className}`} aria-label="YouTube videos">
      <h2 className="km-card-videos-title">
        <YouTubeIcon aria-hidden="true" sx={{ fontSize: 22 }} />
        Featured videos
      </h2>
      <div className="km-card-videos-grid">
        {videoIds.map((id, index) => (
          <iframe
            key={id}
            src={`https://www.youtube-nocookie.com/embed/${id}`}
            title={`Featured YouTube video ${index + 1}`}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ))}
      </div>
    </section>
  );
};

import React, { useEffect, useState } from 'react';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AutoSlider from './AutoSlider.jsx';
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

// Thumbnail first: the YouTube player only loads when a video is tapped, so the card stays fast
// and no heavy iframes sit under the bottom nav. Leaving the slide stops playback.
const VideoCard = ({ id, index, active }) => {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!active) setPlaying(false);
  }, [active]);

  return (
    <div className="km-video-card">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
          title={`Featured YouTube video ${index + 1}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : (
        <button type="button" className="km-video-poster" onClick={() => setPlaying(true)} aria-label={`Play video ${index + 1}`}>
          <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" draggable="false" />
          <span className="km-video-play">
            <PlayArrowIcon aria-hidden="true" />
          </span>
        </button>
      )}
    </div>
  );
};

export const YoutubeVideos = ({ profile, className = '' }) => {
  const videoIds = youtubeVideoIds(profile);
  if (!videoIds.length) return null;

  return (
    <section className={`km-card-videos ${className}`} aria-label="Featured videos">
      <div className="km-card-videos-head">
        <h2 className="km-card-videos-title">
          <YouTubeIcon aria-hidden="true" sx={{ fontSize: 22 }} />
          {videoIds.length === 1 ? 'Featured video' : 'Featured videos'}
        </h2>
        {videoIds.length > 1 && <span className="km-card-videos-count">{videoIds.length} videos</span>}
      </div>
      <AutoSlider
        items={videoIds}
        label="Featured videos"
        mediaRatio={9 / 16}
        autoplay={false}
        renderSlide={(id, index, active) => <VideoCard id={id} index={index} active={active} />}
      />
    </section>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import GitHubIcon from '@mui/icons-material/GitHub';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import PodcastsIcon from '@mui/icons-material/Podcasts';
import TelegramIcon from '@mui/icons-material/Telegram';
import XIcon from '@mui/icons-material/X';
import YouTubeIcon from '@mui/icons-material/YouTube';
import { safeExternalUrl } from '../utils/profileLinks.js';

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.1-1.3A10 10 0 1 0 12 2Zm5.8 14.2c-.2.7-1.4 1.3-2 1.4-.5.1-1.2.1-1.9-.1-.4-.1-1-.3-1.8-.6-3-1.3-5-4.4-5.1-4.6-.2-.2-1.3-1.7-1.3-3.2s.8-2.3 1.1-2.6c.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .7.5l.9 2.1c.1.2.1.4 0 .6l-.4.6c-.2.2-.3.4-.1.7.2.3.9 1.4 1.9 2.3 1.3 1.1 2.3 1.5 2.6 1.6.3.1.5.1.7-.1l.9-1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.6.3.1.2.1.8-.1 1.4Z" />
  </svg>
);

const MusicSocialIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M14 3v11.2a4.2 4.2 0 1 1-2-3.6V6.4c2 1.8 3.8 2.7 6.5 2.8V12A10.2 10.2 0 0 1 14 10.6" />
  </svg>
);

const WeChatIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M9.5 4C5.9 4 3 6.4 3 9.3c0 1.6.9 3 2.3 4l-.6 2.1 2.4-1.2c.7.2 1.5.4 2.4.4h.4a5.7 5.7 0 0 1-.2-1.5c0-3.1 2.8-5.6 6.3-5.6h.3C15.4 5.5 12.7 4 9.5 4Zm-2.2 3.1a.8.8 0 1 1 0 1.6.8.8 0 0 1 0-1.6Zm4.4 0a.8.8 0 1 1 0 1.6.8.8 0 0 1 0-1.6Z" />
    <path d="M21 13.1c0-2.5-2.4-4.6-5.4-4.6s-5.4 2.1-5.4 4.6 2.4 4.6 5.4 4.6c.7 0 1.4-.1 2-.3l2 1-.5-1.8c1.2-.8 1.9-2.1 1.9-3.5Zm-7.2-.7a.7.7 0 1 1 0-1.4.7.7 0 0 1 0 1.4Zm3.7 0a.7.7 0 1 1 0-1.4.7.7 0 0 1 0 1.4Z" />
  </svg>
);

const LetterIcon = ({ children }) => <span className="km-social-letter">{children}</span>;

const NETWORKS = [
  {
    key: 'linkedin',
    label: 'LinkedIn',
    Icon: LinkedInIcon,
    baseUrl: 'https://www.linkedin.com/in/'
  },
  {
    key: 'twitter',
    label: 'X',
    Icon: XIcon,
    baseUrl: 'https://x.com/'
  },
  {
    key: 'github',
    label: 'GitHub',
    Icon: GitHubIcon,
    baseUrl: 'https://github.com/'
  },
  {
    key: 'instagram',
    label: 'Instagram',
    Icon: InstagramIcon,
    baseUrl: 'https://www.instagram.com/'
  },
  {
    key: 'youtubeChannel',
    label: 'YouTube',
    Icon: YouTubeIcon,
    baseUrl: 'https://www.youtube.com/'
  },
  {
    key: 'podcastUrl',
    label: 'Podcast',
    Icon: PodcastsIcon,
    direct: true
  },
  {
    key: 'tiktok',
    label: 'TikTok',
    Icon: MusicSocialIcon,
    baseUrl: 'https://www.tiktok.com/@'
  },
  {
    key: 'telegram',
    label: 'Telegram',
    Icon: TelegramIcon,
    baseUrl: 'https://t.me/'
  },
  {
    key: 'wechat',
    label: 'WeChat',
    Icon: WeChatIcon,
    direct: true
  },
  {
    key: 'weibo',
    label: 'Weibo',
    Icon: () => <LetterIcon>微</LetterIcon>,
    baseUrl: 'https://weibo.com/'
  },
  {
    key: 'douyin',
    label: 'Douyin',
    Icon: MusicSocialIcon,
    baseUrl: 'https://www.douyin.com/user/'
  },
  {
    key: 'xiaohongshu',
    label: 'Xiaohongshu',
    Icon: () => <LetterIcon>RED</LetterIcon>,
    baseUrl: 'https://www.xiaohongshu.com/user/profile/'
  }
];

const socialHref = (value, baseUrl) => {
  const clean = String(value || '').trim();
  if (/^https?:\/\//i.test(clean)) return clean;
  return `${baseUrl}${clean.replace(/^@/, '').replace(/^\/+|\/+$/g, '')}`;
};

const SocialLinks = ({ profile, whatsappUrl = '', className = '' }) => {
  const trackRef = useRef(null);
  const [canScrollBack, setCanScrollBack] = useState(false);
  const [canScrollForward, setCanScrollForward] = useState(false);
  const visible = [
    whatsappUrl && { key: 'whatsapp', label: 'WhatsApp', Icon: WhatsAppIcon, href: whatsappUrl },
    ...NETWORKS.filter(
      ({ key, direct }) => profile?.[key] && (!direct || safeExternalUrl(profile[key]))
    ).map((network) => ({
      ...network,
      href: network.direct
        ? safeExternalUrl(profile[network.key])
        : socialHref(profile[network.key], network.baseUrl)
    }))
  ].filter(Boolean);
  const hasMany = visible.length > 6;

  const updateScrollState = () => {
    const track = trackRef.current;
    if (!track) return;
    setCanScrollBack(track.scrollLeft > 2);
    setCanScrollForward(track.scrollLeft + track.clientWidth < track.scrollWidth - 2);
  };

  useEffect(() => {
    updateScrollState();
    const track = trackRef.current;
    if (!track || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(track);
    return () => observer.disconnect();
  }, [visible.length]);

  const scroll = (direction) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({
      left: direction * Math.max(150, track.clientWidth * 0.75),
      behavior: 'smooth'
    });
  };

  if (!visible.length) return null;

  return (
    <div className={`km-social-carousel ${hasMany ? 'has-many' : ''} ${className}`}>
      {hasMany && (
        <button
          type="button"
          className="km-social-arrow"
          onClick={() => scroll(-1)}
          disabled={!canScrollBack}
          aria-label="Previous social links"
        >
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="m12 5-5 5 5 5" />
          </svg>
        </button>
      )}
      <div ref={trackRef} className="km-social-links" onScroll={updateScrollState}>
        {visible.map(({ key, label, Icon, href }) => (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noreferrer"
            className={`km-card-social km-card-social--${key}`}
            aria-label={label}
            title={label}
          >
            <Icon aria-hidden="true" fontSize="small" />
          </a>
        ))}
      </div>
      {hasMany && (
        <button
          type="button"
          className="km-social-arrow"
          onClick={() => scroll(1)}
          disabled={!canScrollForward}
          aria-label="Next social links"
        >
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="m8 5 5 5-5 5" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default SocialLinks;

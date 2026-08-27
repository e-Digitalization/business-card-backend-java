import React from 'react';
import GitHubIcon from '@mui/icons-material/GitHub';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import XIcon from '@mui/icons-material/X';

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
  }
];

const socialHref = (value, baseUrl) => {
  const clean = String(value || '').trim();
  if (/^https?:\/\//i.test(clean)) return clean;
  return `${baseUrl}${clean.replace(/^@/, '').replace(/^\/+|\/+$/g, '')}`;
};

const SocialLinks = ({ profile, className = '' }) => {
  const visible = NETWORKS.filter(({ key }) => profile?.[key]);
  if (!visible.length) return null;

  return (
    <div className={`km-social-links ${className}`}>
      {visible.map(({ key, label, Icon, baseUrl }) => (
        <a
          key={key}
          href={socialHref(profile[key], baseUrl)}
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
  );
};

export default SocialLinks;

import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Kadi Moja official OK monogram + wordmark.
 * variant: "full" | "mark" | "wordmark"
 * tone: "color" | "light" | "ink"
 */
const BrandLogo = ({
  variant = 'full',
  tone = 'color',
  className = '',
  markClassName = 'h-8 w-8',
  textClassName = 'text-xl',
  to,
  href
}) => {
  const textTone =
    tone === 'light' ? 'text-white' : tone === 'ink' ? 'text-[#1a3d42]' : 'text-[#0d7377]';

  // Square icon tiles — full OK mark without circular crop distortion
  const markSrc =
    tone === 'light' ? '/logos/kadi-moja-icon-light.png' : '/logos/kadi-moja-icon.png';

  const inner = (
    <>
      {variant !== 'wordmark' && (
        <img src={markSrc} alt="" className={`shrink-0 object-contain ${markClassName}`} />
      )}
      {variant !== 'mark' && (
        <span className={`font-display font-bold tracking-tight ${textTone} ${textClassName}`}>
          Kadi Moja
        </span>
      )}
    </>
  );

  const classes = `inline-flex items-center gap-2.5 no-underline ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes} aria-label="Kadi Moja">
        {inner}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={classes} aria-label="Kadi Moja">
        {inner}
      </a>
    );
  }
  return (
    <span className={classes} aria-label="Kadi Moja">
      {inner}
    </span>
  );
};

export default BrandLogo;

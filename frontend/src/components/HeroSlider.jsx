import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { canAdvance } from './heroPlayback.mjs';

const slides = [
  {
    label: 'The NFC card', eyebrow: 'One tap. Every connection.',
    lead: 'One tap.', accent: '', end: 'Every connection.',
    description: 'Tap once — your contacts, WhatsApp, and socials open on their phone. Make every introduction count. No app required.',
    action: 'Get your card', href: '#products',
    image: '/illustrations/hero/nfc-cutout.png', theme: 'tap'
  },
  {
    label: 'Your digital identity', eyebrow: 'Your next opportunity starts here.',
    lead: 'Your story.', accent: '', end: 'Beautifully shared.',
    description: 'Your photo, business, links, and contact details in one beautiful digital profile. Update anytime. Share everywhere.',
    action: 'Explore a sample', href: '#samples',
    image: '/illustrations/hero/profile-cutout.png', theme: 'profile'
  },
  {
    label: 'Kadi Moja AI Scan', eyebrow: 'Less typing. More connecting.',
    lead: 'Less typing.', accent: '', end: 'More connecting.',
    description: 'Turn a paper business card into a saved contact. Snap a photo, let AI read the details, and keep your next opportunity close.',
    action: 'Discover AI Scan', href: '#ai-scan',
    image: '/illustrations/hero/scan-cutout.png', theme: 'scan'
  },
  {
    label: 'For teams',
    lead: 'One brand.', accent: '', end: 'Every teammate.',
    description: 'Assign NFC cards, manage profiles, and keep everyone consistent — ideal for sales floors and growing companies.',
    action: 'Get team pricing', href: '/login',
    secondary: { label: 'Explore a sample', href: '#samples' },
    features: [
      'Centralised admin for all profiles',
      'Instant updates when roles change',
      'Reassign lost or returned cards',
      'Consistent brand across the company'
    ], theme: 'teams'
  },
  {
    label: 'Always current',
    lead: 'Change once.', accent: '', end: 'Share forever.',
    description: 'New role, number, or location? Update your profile in seconds. Every tap and shared link instantly shows your latest details.',
    action: 'Create your profile', href: '/login',
    secondary: { label: 'See how it works', href: '#how' },
    image: '/illustrations/hero/always-current.png', theme: 'current'
  }
];

function TypedHeadline({ text, reducedMotion }) {
  const [length, setLength] = useState(0);
  useEffect(() => {
    if (reducedMotion) return undefined;
    const timer = window.setInterval(() => setLength((current) => {
      if (current >= text.length) { window.clearInterval(timer); return current; }
      return current + 1;
    }), 45);
    return () => window.clearInterval(timer);
  }, [text, reducedMotion]);
  return <h1 className="km-promo-headline font-display font-semibold" aria-label={text.replace('\n', ' ')}>
    <span className="km-type-reserve" aria-hidden="true">{text}</span>
    <span className="km-type-visible" aria-hidden="true">{reducedMotion ? text : text.slice(0, length)}{!reducedMotion && length < text.length && <span className="km-type-cursor">|</span>}</span>
  </h1>;
}

export default function HeroSlider() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [explicitPlay, setExplicitPlay] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const touchStart = useRef(null);
  const slide = slides[active];
  const playing = canAdvance({ paused, hovered, hidden, reducedMotion, explicitPlay });
  const select = (index) => {
    setActive((index + slides.length) % slides.length);
    setPaused(true);
    setExplicitPlay(false);
  };

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReducedMotion(media.matches);
    const updateVisibility = () => setHidden(document.hidden);
    updateVisibility();
    media.addEventListener('change', updateMotion);
    document.addEventListener('visibilitychange', updateVisibility);
    return () => {
      media.removeEventListener('change', updateMotion);
      document.removeEventListener('visibilitychange', updateVisibility);
    };
  }, []);

  useEffect(() => {
    if (!playing) return undefined;
    const timer = window.setTimeout(() => setActive((current) => (current + 1) % slides.length), 7000);
    return () => window.clearTimeout(timer);
  }, [active, playing]);

  return (
    <section id="top" aria-label="Discover Kadi Moja" aria-roledescription="carousel"
      className={`km-promo-slider relative overflow-hidden`}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocusCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) { setPaused(true); setExplicitPlay(false); } }}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          select(active + (event.key === 'ArrowRight' ? 1 : -1));
        }
      }}
      onTouchStart={(event) => { touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }}
      onTouchCancel={() => { touchStart.current = null; }}
      onTouchEnd={(event) => {
        if (!touchStart.current) return;
        const dx = event.changedTouches[0].clientX - touchStart.current.x;
        const dy = event.changedTouches[0].clientY - touchStart.current.y;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) select(active + (dx < 0 ? 1 : -1));
        touchStart.current = null;
      }}>
      <div className="km-promo-inner relative z-10 mx-auto max-w-6xl px-5 lg:px-8">
        <div className="km-promo-stage" aria-live={playing ? 'off' : 'polite'} aria-atomic="true">
          <div className="km-promo-copy" role="group" aria-roledescription="slide" aria-label={`${active + 1} of ${slides.length}: ${slide.label}`}>
            <TypedHeadline key={slide.theme} text={`${slide.lead}\n${slide.end}`} reducedMotion={reducedMotion} />
            <p className="km-promo-description">{slide.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {slide.href.startsWith('#') ? <a href={slide.href} className="km-btn-primary km-landing-cta-primary">{slide.action} <span aria-hidden="true">→</span></a>
                : <Link to={slide.href} className="km-btn-primary km-landing-cta-primary">{slide.action} <span aria-hidden="true">→</span></Link>}
              {slide.secondary
                ? (slide.secondary.href.startsWith('#')
                  ? <a href={slide.secondary.href} className="km-btn-outline">{slide.secondary.label}</a>
                  : <Link to={slide.secondary.href} className="km-btn-outline">{slide.secondary.label}</Link>)
                : <Link to="/login" className="km-btn-outline">Create account</Link>}
            </div>
          </div>
          <div className={`km-promo-visual km-promo-visual--${slide.theme}`}>
            {slides.map((item, index) => item.features
              ? (
                <ul key={item.theme} className={`km-promo-feature-box${index === active ? ' is-active' : ''}`} aria-hidden={index !== active}>
                  {item.features.map((feature) => <li key={feature}><span aria-hidden="true">→</span>{feature}</li>)}
                </ul>
              )
              : <img key={item.theme} src={item.image} alt={index === active ? `${item.label} product illustration` : ''} aria-hidden={index !== active} width="1536" height="1024" loading={index === 0 ? 'eager' : 'lazy'} className={index === active ? 'is-active' : ''} />)}
          </div>
        </div>
        <div className="km-promo-controls">
         
          <div className="km-promo-buttons">
            <span className="km-promo-count">0{active + 1} <span>/ 0{slides.length}</span></span>
            <button type="button" className="km-promo-play" aria-label={playing ? 'Pause automatic slides' : 'Start automatic slides'} onClick={() => {
              if (playing) { setPaused(true); setExplicitPlay(false); }
              else { setExplicitPlay(true); setPaused(false); }
            }}><span aria-hidden="true">{playing ? 'Ⅱ' : '▶'}</span><span>{playing ? 'Pause' : 'Play'}</span></button>
            <button type="button" aria-label="Previous slide" onClick={() => select(active - 1)}>←</button>
            <button type="button" aria-label="Next slide" onClick={() => select(active + 1)}>→</button>
          </div>
        </div>
      </div>
    </section>
  );
}

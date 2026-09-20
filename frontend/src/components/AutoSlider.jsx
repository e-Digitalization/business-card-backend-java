import React, { useCallback, useEffect, useRef, useState } from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Generic auto-advancing carousel (arrows, dots, swipe). It pauses while hovered, focused, touched
// or when `paused` is set, and never autoplays for people who prefer reduced motion.
// `mediaRatio` is picture height / width so the arrows sit on the middle of the picture.
const AutoSlider = ({ items, renderSlide, mediaRatio = 9 / 16, interval = 5500, autoplay = true, paused: externalPause = false, label = 'Slides', className = '' }) => {
  const count = items.length;
  const [active, setActive] = useState(0);
  const [hold, setHold] = useState(false);
  const touchX = useRef(null);
  const reduced = useRef(prefersReducedMotion());
  const paused = hold || externalPause;

  const go = useCallback((next) => setActive(((next % count) + count) % count), [count]);

  useEffect(() => {
    setActive((i) => Math.min(i, Math.max(count - 1, 0)));
  }, [count]);

  useEffect(() => {
    if (!autoplay || count < 2 || paused || reduced.current) return undefined;
    const id = setTimeout(() => go(active + 1), interval);
    return () => clearTimeout(id);
  }, [active, count, paused, interval, autoplay, go]);

  if (!count) return null;

  const onTouchEnd = (e) => {
    const start = touchX.current;
    touchX.current = null;
    setHold(false);
    if (start == null) return;
    const dx = (e.changedTouches?.[0]?.clientX ?? start) - start;
    if (Math.abs(dx) > 40) go(active + (dx < 0 ? 1 : -1));
  };

  return (
    <section
      className={`km-slider ${className}`}
      aria-label={label}
      aria-roledescription="carousel"
      // Pause only for a real mouse pointer or keyboard focus. Touch taps also fire emulated
      // mouse-enter / focus events that never "leave", which would freeze autoplay on phones.
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHold(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setHold(false)}
      onFocus={(e) => e.target.matches?.(':focus-visible') && setHold(true)}
      onBlur={() => setHold(false)}
      onTouchStart={(e) => {
        touchX.current = e.touches?.[0]?.clientX ?? null;
        setHold(true);
      }}
      onTouchEnd={onTouchEnd}
      onTouchCancel={() => {
        touchX.current = null;
        setHold(false);
      }}
    >
      <div className="km-slider-viewport" style={{ '--media-ratio': mediaRatio }}>
        <div className="km-slider-track" style={{ transform: `translateX(-${active * 100}%)` }}>
          {items.map((item, index) => (
            <div
              className="km-slider-slide"
              key={index}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${count}`}
              aria-hidden={index !== active}
            >
              {renderSlide(item, index, index === active)}
            </div>
          ))}
        </div>

        {count > 1 && (
          <>
            <button type="button" className="km-slider-arrow km-slider-arrow--prev" onClick={() => go(active - 1)} aria-label="Previous">
              <ChevronLeftIcon aria-hidden="true" />
            </button>
            <button type="button" className="km-slider-arrow km-slider-arrow--next" onClick={() => go(active + 1)} aria-label="Next">
              <ChevronRightIcon aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="km-slider-dots" role="tablist" aria-label="Choose slide">
          {items.map((_, index) => (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-label={`Slide ${index + 1}`}
              className={index === active ? 'is-active' : ''}
              onClick={() => go(index)}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default AutoSlider;

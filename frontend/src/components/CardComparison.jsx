import React, { useEffect, useRef, useState } from 'react';
import './CardComparison.css';

export default function CardComparison() {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.15 });
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} aria-labelledby="comparison-title" className={`km-comparison px-5 py-20 lg:px-8 lg:py-28 ${visible ? 'is-visible' : ''}`}>
      <div className="mx-auto max-w-6xl">
        <header className="mx-auto max-w-2xl text-center">
          
          <h2 id="comparison-title" className="mt-4 font-display text-4xl font-semibold sm:text-5xl">Small card.<br /><span className="text-km-lagoon">Lasting connection.</span></h2>
          <p className="mt-5 text-km-ink/70 leading-relaxed">Go from handing out details to making meaningful connections.<br className="hidden sm:block" /> See the difference with Kadi Moja.</p>
        </header>

        <div className="km-comparison-grid">
          <article className="km-comparison-card km-comparison-paper">
            <div className="km-comparison-image">
              <img src="/illustrations/compare-paper.jpg?v=3" alt="A scattered collection of traditional paper business cards" width="800" height="600" loading="lazy" />
              <span className="km-comparison-label">The traditional way</span>
            </div>
            <div className="km-comparison-body">
              <p className="km-comparison-kicker">Hand it over. Hope it stays.</p>
              <h3 className="font-display text-3xl font-semibold">Paper cards</h3>
              <ul>
                {['Easy to misplace or forget', 'Type every detail by hand', 'Reprint when your details change'].map(point => <li key={point}><span className="km-comparison-mark" aria-hidden="true">−</span>{point}</li>)}
              </ul>
            </div>
          </article>

          <div className="km-comparison-vs" aria-hidden="true">vs</div>

          <article className="km-comparison-card km-comparison-digital">
            <div className="km-comparison-image">
              <img src="/illustrations/compare-nfc-woman-profile-matched.png" alt="A woman holding a teal Kadi Moja NFC card and a phone displaying a digital profile with save-contact buttons and contact details" width="1536" height="1024" loading="lazy" />
              <span className="km-comparison-label"><span className="km-comparison-dot" /> The Kadi Moja way</span>
              <div className="km-comparison-saved" aria-hidden="true"><span className="km-comparison-check">✓</span><span><strong>Contact saved</strong><small>One tap. A new connection.</small></span></div>
            </div>
            <div className="km-comparison-body">
              <p className="km-comparison-kicker">One card. Every introduction.</p>
              <h3 className="font-display text-3xl font-semibold">Kadi Moja</h3>
              <ul>
                {['Tap once — your details appear', 'Save to contacts in seconds', 'Update anytime, keep the same card'].map(point => <li key={point}><span className="km-comparison-mark" aria-hidden="true">✓</span>{point}</li>)}
              </ul>
            </div>
          </article>
        </div>
        
      </div>
    </section>
  );
}

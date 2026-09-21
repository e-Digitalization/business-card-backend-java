import React, { useEffect, useRef, useState } from 'react';
import BrandLogo from './BrandLogo.jsx';
import './HowItWorks.css';

const steps = [
  { title: 'Tap your card', label: 'One simple gesture', body: 'Hold your Kadi Moja card near the NFC reader on a compatible phone.' },
  { title: 'Open your profile', label: 'Your world, in one place', body: 'They open the notification to see your contact details, links, and more.' },
  { title: 'Save the connection', label: 'Ready for what’s next', body: 'They save your details to contacts, ready to call, message, or reconnect.' }
];

function PhonePreview({ step, person }) {
  return (
    <div className={`km-journey-phone km-journey-phone--${step}`}>
      <div className="km-journey-island" />
      {step === 0 ? (
        <div className="km-journey-lock">
          <svg className="km-journey-lock-icon" width="12" height="14" viewBox="0 0 16 18" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="8" width="10" height="8" rx="2" /><path d="M5 8V5a3 3 0 0 1 6 0v3" /></svg>
          <span className="km-journey-time">09:41</span>
          <span className="km-journey-date">A good day to connect</span>
          <div className="km-journey-notification"><img src="/logos/kadi-moja-icon.png" alt="" /><div><strong>Kadi Moja</strong><span>Open your new connection ↗</span></div></div>
          <span className="km-journey-lock-caption">A connection starts here.</span>
        </div>
      ) : (
        <div className="km-journey-profile">
          <div className="km-journey-profile-top">{step === 1 ? <BrandLogo tone="light" markClassName="h-4 w-4" textClassName="text-[9px]" /> : <span>‹ Contacts <span className="km-journey-done">Done</span></span>}</div>
          <img className="km-journey-avatar" src={person.photo} alt="" loading="lazy" />
          <strong className="km-journey-name">{person.name}</strong>
          <span className="km-journey-role">{person.title}</span>
          <span className="km-journey-company">{person.company}</span>
          {step === 1 ? <div className="km-journey-save">＋ Save contact details</div> : <div className="km-journey-contact-actions"><span>Call</span><span>Message</span><span>Email</span></div>}
          <div className="km-journey-details"><span>mobile</span><strong>{person.phone}</strong><span>email</span><strong>{person.email}</strong><span>company</span><strong>{person.company}</strong></div>
          {step === 2 && <div className="km-journey-saved-inline">✓ Saved to contacts</div>}
        </div>
      )}
      <div className="km-journey-home" />
    </div>
  );
}

export default function HowItWorks({ person }) {
  const stage = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!('IntersectionObserver' in window)) { setVisible(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { threshold: 0.15 });
    observer.observe(stage.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="how" aria-labelledby="how-title" className="km-journey px-5 py-20 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <header className="mx-auto max-w-2xl text-center">
         
          <h2 id="how-title" className="mt-4 font-display text-4xl font-semibold sm:text-5xl">A small tap.<br /><span className="text-km-lagoon">A lasting introduction.</span></h2>
          <p className="mt-5 leading-relaxed text-km-ink/65">Three simple steps from hello to staying in touch.</p>
        </header>
        <ol ref={stage} className={`km-journey-steps ${visible ? 'is-visible' : ''}`}>
          {steps.map((step, index) => (
            <li key={step.title} className="km-journey-step" style={{ '--step-delay': `${index * 220}ms` }}>
              <div className="km-journey-step-top"><span className="km-journey-number">0{index + 1}</span><span>{step.label}</span></div>
              <div className="km-journey-scene" aria-hidden="true">
                <div className="km-journey-halo" />
                <PhonePreview step={index} person={person} />
                {index === 0 && <div className="km-journey-nfc"><BrandLogo tone="light" markClassName="h-5 w-5" textClassName="text-[12px]" /><span className="km-journey-nfc-bottom">One card. Every introduction.<span>)))</span></span></div>}
                {index === 2 && <span className="km-journey-success">✓</span>}
              </div>
              <div className="km-journey-copy"><h3 className="font-display text-2xl font-semibold">{step.title}</h3><p>{step.body}</p></div>
              {index < 2 && <span className="km-journey-next" aria-hidden="true">→</span>}
            </li>
          ))}
        </ol>
        <div className="km-journey-footnotes"><span>✓ No app needed to receive your details</span><span>↗ QR sharing available too</span></div>
      </div>
    </section>
  );
}

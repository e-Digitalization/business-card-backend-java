import React, { useRef, useState } from 'react';
import ArrowOutward from '@mui/icons-material/ArrowOutward';
import Check from '@mui/icons-material/Check';
import SchoolOutlined from '@mui/icons-material/SchoolOutlined';
import AccountBalanceOutlined from '@mui/icons-material/AccountBalanceOutlined';
import PublicOutlined from '@mui/icons-material/PublicOutlined';
import LanguageOutlined from '@mui/icons-material/LanguageOutlined';
import { PROFESSION_SAMPLES } from '../utils/professionSamples.js';
import './ProfessionSamples.css';

const professionIcons = [SchoolOutlined, AccountBalanceOutlined, AccountBalanceOutlined, LanguageOutlined, PublicOutlined];

export default function ProfessionSamples() {
  const [selected, setSelected] = useState(0);
  const buttons = useRef([]);
  const phone = useRef(null);
  const sample = PROFESSION_SAMPLES[selected];
  const { profile } = sample;
  const onKey = (event, index) => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % PROFESSION_SAMPLES.length;
    if (event.key === 'ArrowLeft') next = (index + PROFESSION_SAMPLES.length - 1) % PROFESSION_SAMPLES.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = PROFESSION_SAMPLES.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    setSelected(next);
    buttons.current[next]?.focus();
  };
  return (
    <section id="samples" className="km-professions px-5 py-20 lg:px-8 lg:py-28" aria-labelledby="samples-title">
      <div className="mx-auto max-w-6xl">
        <header className="km-professions-heading">
          <div>
            <h2 id="samples-title" className="font-display">Different professions.<br /><span>Distinct first impressions.</span></h2></div>
          <p className="km-professions-intro">Your expertise deserves an introduction of its own. Find the profile that feels like you.</p>
        </header>
        <div className="km-professions-tabs" role="tablist" aria-label="Sample professions">
          {PROFESSION_SAMPLES.map((item, index) => {
            const Icon = professionIcons[index];
            return <button key={item.id} ref={el => { buttons.current[index] = el; }} id={`sample-tab-${item.id}`} role="tab" aria-selected={selected === index} aria-controls="profession-panel" tabIndex={selected === index ? 0 : -1} onKeyDown={e => onKey(e, index)} onClick={() => setSelected(index)}><Icon aria-hidden="true" /><span>{item.label}</span></button>;
          })}
        </div>
        <div id="profession-panel" role="tabpanel" aria-labelledby={`sample-tab-${sample.id}`} tabIndex={0} className="km-profession-panel" style={{ '--profession-color': profile.primaryColor, '--profession-accent': profile.accentColor }}>
          <div className="km-profession-content">
            <div className="km-profession-story">
              <div key={sample.id} className="km-profession-copy">
                <div className="km-profession-label"><span>{String(selected + 1).padStart(2, '0')} / 05</span>{sample.label} collection</div>
                <h3 className="font-display">{sample.short}</h3><p>{sample.description}</p>
                <ul>{sample.features.map(feature => <li key={feature}><Check aria-hidden="true" />{feature}</li>)}</ul>
                <button type="button" className="km-profession-link" onClick={() => {
                  phone.current?.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
                  phone.current?.focus({ preventScroll: true });
                }}>Explore this profile <ArrowOutward aria-hidden="true" /></button>
              </div>
              <figure className="km-profession-product"><img src="/illustrations/professions-cards.png" alt="Matte teal and brushed silver Kadi Moja contactless business cards" loading="lazy" width="1536" height="1024" /><figcaption>
               
                </figcaption></figure>
            </div>
            <div className="km-profession-preview">
              <div className="km-profession-preview-caption"><span>Your digital first impression</span><span>Sample profile</span></div>
              <div className="km-profession-phone">
                <div className="km-profession-phone-top" aria-hidden="true"><span>9:41</span><span className="km-profession-phone-speaker" /><span>5G</span></div>
                <iframe key={sample.id} ref={phone} className="km-profession-phone-screen" src={`/demo/professions/${sample.id}/preview`} title={`${sample.label}: ${profile.fullName} interactive phone preview`} />
                <div className="km-profession-phone-bottom" aria-hidden="true"><span /></div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

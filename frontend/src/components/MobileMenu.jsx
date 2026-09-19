import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo.jsx';

const icons = {
  home: 'm3 10 9-7 9 7M5 9v12h5v-7h4v7h5V9',
  card: 'M3 5h18v14H3zM3 9h18M7 15h4',
  samples: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  scan: 'M8 3H3v5M16 3h5v5M21 16v5h-5M8 21H3v-5M4 12h16',
  steps: 'm5 6 2 2 4-4M14 6h7M5 13l2 2 4-4M14 13h7M5 20l2 2 4-4M14 20h7',
  team: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M22 21v-2a4 4 0 0 0-3-4M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8M17 3a4 4 0 0 1 0 8',
  help: 'M9 9a3 3 0 0 1 6 0c0 2-3 2-3 5M12 17v.01M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20',
  login: 'M14 3h7v18h-7M3 12h12m-4-4 4 4-4 4'
};
const Icon = ({ name }) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={icons[name]} /></svg>;

export default function MobileMenu({ open, onClose }) {
  const dialog = useRef(null);
  useEffect(() => {
    if (!open) return;
    const element = dialog.current;
    const previousOverflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = 'hidden';
    const desktop = window.matchMedia('(min-width: 1024px)');
    const handleResize = () => { if (desktop.matches) onClose(); };
    desktop.addEventListener('change', handleResize);
    return () => {
      desktop.removeEventListener('change', handleResize);
      element.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  const menuLink = (href, label, icon) => <a key={href} href={href} className="km-mobile-menu-link" onClick={onClose}><Icon name={icon} /><span>{label}</span><span className="km-mobile-menu-arrow" aria-hidden="true">›</span></a>;

  return <dialog ref={dialog} id="home-mobile-nav" className="km-mobile-menu" aria-label="Kadi Moja navigation" onCancel={onClose}>
    <div className="km-mobile-menu-header">
      <div onClick={onClose}><BrandLogo href="#top" tone="color" textClassName="text-2xl" markClassName="h-9 w-9" /></div>
      <button type="button" autoFocus className="km-menu-toggle" aria-label="Close menu" onClick={onClose}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6" /></svg></button>
    </div>
    <nav aria-label="Mobile navigation" className="km-mobile-menu-content">
      {menuLink('#top', 'Home', 'home')}
      <div className="km-mobile-menu-group">
        <p>Explore Kadi Moja</p>
        {menuLink('#products', 'NFC cards', 'card')}
        {menuLink('#samples', 'Digital card samples', 'samples')}
        {menuLink('#ai-scan', 'AI Scan', 'scan')}
      </div>
      <div className="km-mobile-menu-group">
        <p>Discover more</p>
        {menuLink('#how', 'How it works', 'steps')}
        {menuLink('#teams', 'For teams', 'team')}
        {menuLink('#faq', 'Common questions', 'help')}
      </div>
      <div className="km-mobile-menu-group">
        <p>Your account</p>
        <Link to="/login" className="km-mobile-menu-link" onClick={onClose}><Icon name="login" /><span>Sign in</span><span className="km-mobile-menu-arrow" aria-hidden="true">›</span></Link>
        <Link to="/login" className="km-btn-primary km-mobile-menu-cta" onClick={onClose}>Create account <span aria-hidden="true">→</span></Link>
      </div>
      <p className="km-mobile-menu-footer">One card. Every connection.</p>
    </nav>
  </dialog>;
}

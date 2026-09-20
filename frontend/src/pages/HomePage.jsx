import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo.jsx';
import CardComparison from '../components/CardComparison.jsx';
import HowItWorks from '../components/HowItWorks.jsx';
import '../components/AiScanShowcase.css';
import HeroSlider from '../components/HeroSlider.jsx';
import MobileMenu from '../components/MobileMenu.jsx';
import ContactCardVisual from './client/ContactCardVisual';


const products = [
  {
    name: 'Kadi Moja NFC Card',
    tag: 'Available now',
    price: 'TZS 100,000',
    blurb: 'Physical PVC NFC card linked to your private profile. Tap once—share everything.',
    points: ['iPhone & Android', 'Private profile link', 'QR backup', 'Pay once with Selcom'],
    featured: true,
    active: true
  },
  {
    name: 'Kadi Moja Pro',
    tag: 'Coming soon',
    price: 'TZS 75,000',
    blurb: 'Fully customised with your logo and brand colours for meetings that leave a mark.',
    points: ['Custom logo & design', 'iPhone & Android', 'No monthly fees', 'Priority support'],
    active: false
  },
  {
    name: 'Kadi Moja Metal',
    tag: 'Coming soon',
    price: 'From TZS 145,000',
    blurb: 'Precision-finished metal card. Sleek, durable, built to impress at every handshake.',
    points: ['Metal finish', 'iPhone & Android', 'No monthly fees', 'Long-lasting'],
    active: false
  }
];

const aiScanSteps = [
  {
    n: '01',
    title: 'Snap the card',
    body: 'Take a photo of any paper business card with your phone.'
  },
  {
    n: '02',
    title: 'Review the details',
    body: 'AI picks out the contact details. Give them a quick check before saving.'
  },
  {
    n: '03',
    title: 'Saved to contacts',
    body: 'Review once, then save — no typing, no lost cards in your pocket.'
  }
];

const aiScanPerson = {
  tag: 'TAG-DANIEL',
  name: 'Daniel Mushi',
  title: 'Lead Architect',
  company: 'Mushi Studio',
  location: 'Dar es Salaam, Tanzania',
  phone: '+255 712 345 678',
  email: 'daniel@mushistudio.example',
  whatsapp: '+255 712 345 678',
  website: 'mushistudio.example',
  photo: '/illustrations/ai-scan-daniel-mushi.png',
  accent: '#c46a4a',
  tint: '#f6e4dc'
};

const navLinks = [
  ['#products', 'Cards'],
  ['#samples', 'Samples'],
  ['#ai-scan', 'AI Scan'],
  ['#how', 'How it works'],
  ['#teams', 'For teams'],
  ['#faq', 'FAQ']
];

const reasons = [
  {
    title: 'One card, forever',
    body: 'Update phone, title, or company from the dashboard. Never reprint for content changes.'
  },
  {
    title: 'Complete profile',
    body: 'Photo, bio, WhatsApp, LinkedIn, portfolio—everything in a single tap.'
  },
  {
    title: 'NFC + QR',
    body: 'Works on virtually any phone. Tap when you can, scan when you need to.'
  }
];

const faqs = [
  {
    q: 'What is an NFC business card?',
    a: 'A contactless card. One tap on a phone shares your contacts, socials, website, and more—faster and cleaner than paper.'
  },
  {
    q: 'Do I need an app?',
    a: 'No. Most modern iPhones and Androids read NFC out of the box. Older phones can scan the QR code.'
  },
  {
    q: 'Can I update my details after purchase?',
    a: 'Yes. Edit anytime in the dashboard. The physical card never needs reprinting for content changes.'
  },
  {
    q: 'Do you offer team / bulk pricing?',
    a: 'Yes. Volume discounts and a shared admin dashboard for assigning cards and keeping brand consistency.'
  },
  {
    q: 'Where do you deliver?',
    a: 'Across Tanzania (Dar, Arusha, Mwanza, Dodoma, Zanzibar and more), with international shipping available.'
  },
  {
    q: 'What is AI Scan?',
    a: 'Photograph any paper business card and Kadi Moja reads the details for you—name, phone, email, company, and more—then saves them to your contacts. You get free scans to start, then a low monthly Selcom subscription for unlimited use.'
  }
];

const sampleCard = {
  tag: 'TAG12345',
  name: 'Japhari Masha',
  title: 'Founder & Systems Architect',
  company: 'Swahili Systems',
  location: 'Dar es Salaam, Tanzania',
  phone: '+255 714 076 990',
  email: 'japhari@swahilisystems.com',
  whatsapp: '+255 714 076 990',
  website: 'www.swahilisystems.com',
  photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  logo: '/logos/swahili-systems.svg',
  accent: '#d4783a',
  tint: '#f8e8d8'
};

const toContact = (person) => ({
  fullName: person.name,
  title: person.title,
  company: person.company,
  email: person.email,
  phone: person.phone,
  whatsapp: person.whatsapp,
  website: person.website,
  location: person.location,
  photoUrl: person.photo
});

const NfcCardSample = ({ person, className = '' }) => (
  <div className={`km-nfc-card km-sample-nfc-card ${className}`}>
    <div className="km-nfc-card-shine" aria-hidden="true" />
    <div className="km-nfc-card-inner">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <img src="/logos/kadi-moja-mark-light.png" alt="" className="h-8 w-8" />
          <div>
            <p className="font-display text-lg font-bold tracking-tight text-white">Kadi Moja</p>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-white/55">Digital NFC</p>
          </div>
        </div>
        <div className="km-nfc-waves" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className="mt-auto">
        <div className="flex items-center gap-3">
          <img
            src={person.photo}
            alt=""
            className="h-12 w-12 rounded-full border-2 border-white/50 object-cover"
          />
          <div className="min-w-0">
            <p className="truncate font-semibold text-white">{person.name}</p>
            <p className="truncate text-xs text-white/70">{person.title}</p>
            <p className="truncate text-[11px] italic text-white/50">{person.company}</p>
          </div>
        </div>
        <p className="mt-4 text-[11px] text-white/55">Tap phone to open digital card</p>
      </div>
    </div>
  </div>
);

const DigitalCardSample = ({ person, className = '' }) => (
  <div className={`km-phone-frame km-sample-digital-phone ${className}`}>
    <div className="km-phone-notch" aria-hidden="true" />
    <div className="km-phone-screen km-sample-digital-screen">
      <div className="km-phone-card-scale km-sample-digital-scale">
        <ContactCardVisual
          contact={toContact(person)}
          variant="lagoon"
          footer={
            <div className="flex flex-col gap-2">
              <div className="rounded-xl bg-[#0d7377] py-2.5 text-center text-[11px] font-semibold text-white">
                Save contact details
              </div>
              <div className="rounded-xl border border-[#0d7377]/35 bg-white py-2.5 text-center text-[11px] font-semibold text-[#0d7377]">
                Save to my Contacts
              </div>
            </div>
          }
        />
      </div>
    </div>
    <div className="km-phone-home" aria-hidden="true" />
  </div>
);

const HomePage = () => {
  const scanStageRef = useRef(null);
  const [scanVisible, setScanVisible] = useState(false);
  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      setScanVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setScanVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.2 });
    if (scanStageRef.current) observer.observe(scanStageRef.current);
    return () => observer.disconnect();
  }, []);

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="km-home bg-km-paper text-km-ink font-sans">
      <header
        className={`sticky top-0 z-50 border-b border-km-ink/10 bg-white transition-shadow duration-300 ${
          scrolled
            ? 'shadow-sm'
            : ''
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 lg:px-8">
          <BrandLogo
            href="#top"
            tone="color"
            textClassName="text-2xl"
            markClassName="h-9 w-9"
          />
          <nav aria-label="Main navigation" className="hidden items-center gap-5 xl:gap-7 lg:flex">
            {navLinks.map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="text-sm font-medium text-km-ink transition-colors hover:text-km-lagoon"
              >
                {label}
              </a>
            ))}
            <Link
              to="/login"
              className="text-sm font-medium text-km-ink transition-colors hover:text-km-lagoon"
            >
              Sign in
            </Link>
            <Link to="/login" className="km-btn-primary !px-5 !py-2.5">
              Create account
            </Link>
          </nav>
          <button
            type="button"
            className="km-menu-toggle lg:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="home-mobile-nav"
            aria-label="Open menu"
            aria-haspopup="dialog"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>
        <MobileMenu open={menuOpen} onClose={closeMenu} />
      </header>

      <HeroSlider />

      <div className="border-b border-km-lagoon/10 bg-km-foam">
        <ul className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-5 py-5 text-sm font-medium text-km-ink lg:px-8">
          {['No app required', 'iPhone & Android', 'NFC + QR sharing', 'Update details anytime'].map((benefit) => (
            <li key={benefit} className="flex items-center gap-2"><span aria-hidden="true" className="text-km-lagoon">✓</span>{benefit}</li>
          ))}
        </ul>
      </div>

      {/* Digital + NFC card showcase */}
      <section id="products" className="km-landing-showcase relative overflow-hidden px-5 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="mt-3 font-display text-4xl font-semibold leading-tight sm:text-5xl">
              Make an impression that stays
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-km-ink/65">
              One physical NFC card. One live digital profile. Both work together—tap in a meeting, save contacts in
              seconds.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/login" className="km-btn-dark">
                Create my free account
              </Link>
              <a href="#samples" className="km-btn-outline">
                See sample
              </a>
            </div>
          </div>
          <div className="km-landing-duo relative mx-auto flex w-full max-w-lg flex-col items-center gap-8 sm:flex-row sm:items-end sm:justify-center lg:max-w-none">
            <div className="km-landing-duo-nfc">
              <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-km-ink/45">
                NFC card
              </p>
              <NfcCardSample person={sampleCard} />
            </div>
            <div className="km-landing-duo-digital">
              <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-km-ink/45">
                Digital card
              </p>
              <DigitalCardSample person={sampleCard} />
            </div>
          </div>
        </div>
      </section>

      <section className="km-section-light px-5 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-end lg:gap-16">
          <div>
            <h2 className="mt-3 font-display text-4xl font-semibold leading-tight sm:text-5xl">
              Most business cards get lost. Yours shouldn&apos;t.
            </h2>
          </div>
          <p className="text-base leading-relaxed text-km-ink/65 lg:pb-1">
            Paper disappears into pockets and bins. Kadi Moja puts your full professional identity on a tap—so people
            save you now, and you stay current forever.
          </p>
        </div>
      </section>
      <section id="samples" className="km-section-foam px-5 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <h2 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">See both cards in action</h2>
            <p className="mt-4 text-km-ink/65 leading-relaxed">
              Physical NFC card and the digital profile it unlocks.
            </p>
          </div>

          <div className="km-sample-featured mt-14">
            <div className="km-sample-featured-copy">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-km-copper">Sample card</p>
              <h3 className="mt-2 font-display text-2xl font-semibold text-km-ink sm:text-3xl">
                {sampleCard.name}
              </h3>
              <p className="mt-1 text-sm text-km-ink/60">
                {sampleCard.title} · {sampleCard.company}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-km-ink/65">
                Hand over the NFC card in a meeting — their phone opens this digital profile with contacts,
                WhatsApp, and socials ready to save.
              </p>
              <Link to={`/c/${sampleCard.tag}`} className="km-btn-primary mt-6 inline-flex">
                Open live digital card →
              </Link>
            </div>
            <div className="km-sample-featured-visuals">
              <div className="km-sample-featured-nfc">
                <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-km-ink/45">
                  NFC card
                </p>
                <NfcCardSample person={sampleCard} />
              </div>
              <div className="km-sample-featured-digital">
                <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-km-ink/45">
                  Digital card
                </p>
                <DigitalCardSample person={sampleCard} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="ai-scan" aria-labelledby="ai-scan-title" className="km-ai-scan km-ai-refined relative overflow-hidden px-5 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="km-ai-eyebrow"><span aria-hidden="true">✦</span> Meet your new contact assistant</p>
            <h2 id="ai-scan-title" className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">
              From paper card
              <br />
              <span className="text-km-lagoon">to your next connection.</span>
            </h2>
            <p className="mt-5 text-base leading-relaxed text-km-ink/65">
              Snap a card. Let AI pick out the details. Review and save them
              in seconds, ready for your next conversation.
            </p>
          </div>

          <div ref={scanStageRef} className={`km-ai-scan-stage mt-12 ${scanVisible ? 'is-visible' : ''}`} aria-hidden="true">
            <div className="km-ai-scan-col">
              <p className="km-ai-scan-label"><span>01</span> Capture the card</p>
              <div className="km-ai-paper">
                <div className="km-ai-paper-texture" />
                <div className="km-ai-paper-inner">
                  <div className="km-ai-paper-top">
                    <img src={aiScanPerson.photo} alt="" className="km-ai-paper-photo" />
                    <div>
                      <p className="km-ai-paper-company">{aiScanPerson.company}</p>
                      <p className="km-ai-paper-name">{aiScanPerson.name}</p>
                      <p className="km-ai-paper-title">{aiScanPerson.title}</p>
                    </div>
                  </div>
                  <div className="km-ai-paper-rule" />
                  <div className="km-ai-paper-details">
                    <p>{aiScanPerson.phone}</p>
                    <p>{aiScanPerson.email}</p>
                    <p>{aiScanPerson.website}</p>
                    <p>{aiScanPerson.location}</p>
                  </div>
                </div>
                <div className="km-ai-scan-beam">
                  <span className="km-ai-scan-beam-line" />
                </div>
                <div className="km-ai-scan-particles">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
              </div>
              <div className="km-ai-extracted">
                <p><span aria-hidden="true">✦</span> The details, without the typing</p>
                <div>{['Name', 'Company', 'Phone', 'Email'].map((field, index) => <span key={field} style={{ '--field-delay': `${index * 180 + 500}ms` }}><b>✓</b> {field}</span>)}</div>
                <small>Illustrative preview · Always review before saving</small>
              </div>
            </div>

            <div className="km-ai-scan-bridge">
              <div className="km-ai-scan-pulse">
                <span className="km-ai-scan-pulse-ring" />
                <span className="km-ai-scan-pulse-ring" />
                <span className="km-ai-scan-pulse-core">AI</span>
              </div>
              <p className="km-ai-scan-bridge-caption">Read & organise</p>
              <span className="km-ai-flow-arrow">→</span>
            </div>

            <div className="km-ai-scan-col km-ai-scan-col--out">
              <p className="km-ai-scan-label"><span>02</span> Ready to review</p>
              <div className="km-ai-digital">
                <span className="km-ai-digital-badge">✓ Details captured</span>
                <DigitalCardSample person={aiScanPerson} className="km-ai-digital-phone" />
              </div>
            </div>
          </div>

          <ol className="km-ai-process mx-auto mt-8 grid gap-4 sm:grid-cols-3">
            {aiScanSteps.map((step) => (
              <li key={step.n} className="text-center sm:text-left">
                <span className="km-ai-scan-step-n mx-auto sm:mx-0">{step.n}</span>
                <h3 className="mt-3 font-display text-lg font-semibold text-km-ink">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-km-ink/60">{step.body}</p>
              </li>
            ))}
          </ol>

          <div className="km-ai-cta mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to="/login" className="km-btn-primary">
              Try AI Scan →
            </Link>
            <p className="text-sm text-km-ink/50">2 free scans · then from TZS 10,000 / month</p>
          </div>
        </div>
      </section>

      <HowItWorks person={aiScanPerson} />

      <CardComparison />

      <section className="bg-white px-5 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-km-copper">Why Kadi Moja</p>
            <h2 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">
              Built for professionals who move
            </h2>
          </div>
          <div className="mt-14 grid gap-10 sm:grid-cols-2">
            {reasons.map((r) => (
              <div key={r.title} className="border-l-2 border-km-copper/55 pl-5">
                <h3 className="font-display text-xl font-semibold">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-km-ink/65">{r.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="teams" className="km-section-lagoon px-5 py-20 text-white lg:px-8 lg:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-km-ember">For teams</p>
            <h2 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">
              One brand. Every teammate.
            </h2>
            <p className="mt-5 max-w-md text-white/75 leading-relaxed">
              Assign NFC cards, manage profiles, and keep everyone consistent—ideal for sales floors and growing
              companies.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#contact" className="km-btn-primary">
                Get team pricing
              </a>
              <Link to="/c/TAG12345" className="km-btn-ghost">
                Explore a sample
              </Link>
            </div>
          </div>
          <ul className="space-y-5 border border-white/15 bg-white/8 p-8 text-sm text-white/85 backdrop-blur-[2px]">
            {[
              'Centralised admin for all profiles',
              'Instant updates when roles change',
              'Reassign lost or returned cards',
              'Consistent brand across the company'
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="text-km-ember">→</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="faq" className="bg-white px-5 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-4xl font-semibold sm:text-5xl">Common questions</h2>
          <p className="mt-4 text-km-ink/65">New to NFC networking? Start here.</p>
          <div className="mt-10 divide-y divide-km-ink/10 border-y border-km-ink/10">
            {faqs.map((item) => (
              <details key={item.q} className="km-faq group py-5">
                <summary className="flex items-center justify-between gap-4 font-medium">
                  <span>{item.q}</span>
                  <span className="text-km-copper transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-km-ink/65">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="km-landing-cta relative overflow-hidden px-5 py-24 text-white lg:px-8">
        <div className="relative mx-auto max-w-3xl text-center">
          <div className="flex flex-col items-center gap-3">
            <img src="/logos/kadi-moja-icon-light.png" alt="" className="h-14 w-14 rounded-2xl object-contain" />
            <p className="font-display text-5xl font-bold tracking-tight sm:text-6xl">Kadi Moja</p>
          </div>
          <h2 className="mt-5 font-display text-3xl font-semibold sm:text-4xl">
            Ready to upgrade how you connect?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-white/75">Pay once. Share instantly. Stay up to date.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/login" className="km-btn-primary">
              Create your account
            </Link>
            <Link to="/login" className="km-btn-ghost">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-km-lagoon/15 bg-km-foam px-5 py-12 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:justify-between">
          <div>
            <BrandLogo tone="color" textClassName="text-2xl" markClassName="h-9 w-9" href="#top" />
            <p className="mt-2 max-w-xs text-sm text-km-ink/55">
              Your professional identity, reimagined—for Tanzania and beyond.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 text-sm">
            <div className="space-y-2">
              <p className="font-semibold text-km-ink/80">Explore</p>
              <a href="#products" className="block text-km-ink/50 hover:text-km-lagoon">
                NFC cards
              </a>
              <a href="#ai-scan" className="block text-km-ink/50 hover:text-km-lagoon">
                AI Scan
              </a>
              <a href="#how" className="block text-km-ink/50 hover:text-km-lagoon">
                How it works
              </a>
              <a href="#teams" className="block text-km-ink/50 hover:text-km-lagoon">
                For teams
              </a>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-km-ink/80">Account</p>
              <Link to="/login" className="block text-km-ink/50 hover:text-km-lagoon">
                Sign in
              </Link>
              <Link to="/me" className="block text-km-ink/50 hover:text-km-lagoon">
                My card
              </Link>
              <Link to="/login" state={{ role: 'admin' }} className="block text-km-ink/50 hover:text-km-lagoon">
                Admin
              </Link>
            </div>
          </div>
        </div>
        <p className="mx-auto mt-10 max-w-6xl text-xs text-km-ink/40">
          © {new Date().getFullYear()} Kadi Moja — The last digital business card you will ever need.
        </p>
      </footer>
    </div>
  );
};

export default HomePage;

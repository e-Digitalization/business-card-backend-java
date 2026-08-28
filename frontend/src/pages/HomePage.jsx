import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo.jsx';
import ContactCardVisual from './client/ContactCardVisual';

const heroDemoContact = {
  fullName: 'Neema Hassan',
  title: 'Brand Strategist',
  company: 'Dar Collective',
  email: 'neema@darcollective.co.tz',
  phone: '+255 712 345 678',
  whatsapp: '+255 712 345 678',
  website: 'www.darcollective.co.tz',
  location: 'Dar es Salaam, Tanzania',
  photoUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=400&q=80'
};

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

const steps = [
  {
    n: '01',
    title: 'Tap',
    body: 'Hold the card to any modern phone. No app required.',
    image: '/illustrations/how-tap.jpg'
  },
  {
    n: '02',
    title: 'Open',
    body: 'Your private profile appears with contacts, links, and socials.',
    image: '/illustrations/how-share.jpg'
  },
  {
    n: '03',
    title: 'Saved',
    body: 'They save you instantly. QR is there when NFC isn’t.',
    image: '/illustrations/how-saved.jpg'
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
    title: 'AI reads everything',
    body: 'Name, title, company, phone, email, WhatsApp, and website are extracted automatically.'
  },
  {
    n: '03',
    title: 'Saved to contacts',
    body: 'Review once, then save — no typing, no lost cards in your pocket.'
  }
];

const aiScanPerson = {
  tag: 'TAG-GRACE',
  name: 'Grace Kimaro',
  title: 'Creative Director',
  company: 'Studio Bahari',
  location: 'Zanzibar, Tanzania',
  phone: '+255 777 889 900',
  email: 'grace@studiobahari.co.tz',
  whatsapp: '+255 777 889 900',
  website: 'www.studiobahari.co.tz',
  photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
  logo: '/logos/studio-bahari.svg',
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
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="bg-km-paper text-km-ink font-sans">
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'border-b border-km-ink/10 bg-white shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 lg:px-8">
          <BrandLogo
            href="#top"
            tone={scrolled ? 'color' : 'light'}
            textClassName="text-2xl"
            markClassName="h-9 w-9"
          />
          <nav className="hidden items-center gap-7 md:flex">
            {navLinks.map(([href, label]) => (
              <a
                key={href}
                href={href}
                className={`text-sm font-medium transition-colors ${
                  scrolled
                    ? 'text-[#1a3d42] hover:text-[#0d7377]'
                    : 'text-white hover:text-white/90'
                }`}
              >
                {label}
              </a>
            ))}
            <Link
              to="/login"
              className={`text-sm font-medium transition-colors ${
                scrolled
                  ? 'text-[#1a3d42] hover:text-[#0d7377]'
                  : 'text-white hover:text-white/90'
              }`}
            >
              Sign in
            </Link>
            <Link to="/login" className="km-btn-primary !px-5 !py-2.5">
              Create account
            </Link>
          </nav>
          <button
            type="button"
            className={`border px-3 py-2 text-sm md:hidden ${
              scrolled ? 'border-km-ink/20 text-km-ink' : 'border-white/30 text-white'
            }`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
          >
            {menuOpen ? 'Close' : 'Menu'}
          </button>
        </div>
        {menuOpen && (
          <div className="space-y-3 border-t border-km-ink/8 bg-white px-5 py-4 md:hidden">
            {navLinks.map(([href, label]) => (
              <a key={href} href={href} className="block text-km-ink/80" onClick={() => setMenuOpen(false)}>
                {label}
              </a>
            ))}
            <Link to="/login" className="block text-km-ink/80" onClick={() => setMenuOpen(false)}>
              Sign in
            </Link>
            <Link to="/login" className="km-btn-primary w-full" onClick={() => setMenuOpen(false)}>
              Create account
            </Link>
          </div>
        )}
      </header>

      {/* Hero — meeting atmosphere + tap exchange + full digital card */}
      <section id="top" className="km-landing-hero km-landing-hero--v2 relative overflow-hidden text-white">
        <div className="km-landing-hero-bg" aria-hidden="true">
          <img
            src="https://images.unsplash.com/photo-1758599543278-32d9d073941e?auto=format&fit=crop&w=1800&q=80"
            alt=""
            className="km-landing-hero-bg-img km-landing-hero-bg-img--exchange"
          />
          <div className="km-landing-hero-bg-veil" />
          <div className="km-landing-hero-bg-glow" />
        </div>

        <div className="relative z-10 mx-auto grid min-h-[100svh] max-w-6xl items-center gap-10 px-5 pb-16 pt-28 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6 lg:px-8 lg:pb-20 lg:pt-24">
          <div className="km-landing-hero-copy max-w-xl">
            
            <div className="animate-fade-up mt-4 flex items-center gap-4">
            
            </div>
            <h1 className="animate-fade-up-delay mt-6 font-display text-[clamp(1.75rem,4.2vw,2.85rem)] font-semibold leading-[1.12]">
              The <span className="km-landing-accent-text">last card</span>
              <br />
              you&apos;ll ever need
            </h1>
            <p className="animate-fade-up-delay-2 mt-5 max-w-md text-base leading-relaxed text-white/72 sm:text-lg">
              In the meeting, tap once — your contacts, WhatsApp, and socials open on their phone. No app required.
            </p>
            <div className="animate-fade-up-delay-2 mt-9 flex flex-wrap gap-3">
              <a href="#products" className="km-btn-primary km-landing-cta-primary">
                Get your card →
              </a>
              <Link to="/c/TAG12345" className="km-btn-ghost km-landing-cta-ghost">
                See live demo
              </Link>
            </div>
          </div>

          <div className="km-landing-hero-props relative mx-auto w-full max-w-[460px] lg:max-w-none lg:justify-self-end">
            <div className="km-landing-hero-prop-stage km-landing-hero-prop-stage--tap">
              {/* Physical NFC approaching the phone — tap exchange */}
              <div className="km-hero-nfc km-hero-nfc--tap" aria-hidden="true">
                <div className="km-hero-nfc-shine" />
                <div className="km-hero-nfc-inner">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <img src="/logos/kadi-moja-mark-light.png" alt="" className="h-7 w-7" />
                      <div>
                        <p className="font-display text-base font-bold tracking-tight text-white">Kadi Moja</p>
                        <p className="mt-0.5 text-[9px] uppercase tracking-[0.18em] text-white/50">Digital NFC</p>
                      </div>
                    </div>
                    <div className="km-hero-nfc-waves">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                  <div className="mt-auto flex items-end justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold text-white">Neema Hassan</p>
                      <p className="text-[10px] text-white/55">Tap to exchange</p>
                    </div>
                    <div className="mt-3 h-px w-10 bg-gradient-to-r from-[#e8913a] to-transparent" />
                  </div>
                </div>
              </div>

              <div className="km-hero-tap-pulse" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>

              {/* Phone — full digital card after tap */}
              <div className="km-landing-hero-device km-landing-hero-device--profile" aria-label="Digital business card on phone">
                <div className="km-phone-frame km-landing-hero-phone-frame">
                  <div className="km-phone-notch" />
                  <div className="km-phone-screen km-landing-hero-phone-screen">
                    <div className="km-phone-card-scale km-landing-hero-card-scale">
                      <ContactCardVisual
                        contact={heroDemoContact}
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
                  <div className="km-phone-home" />
                </div>
              </div>
            </div>
           
          </div>
        </div>
      </section>

      <section className="border-y border-km-lagoon/10 bg-km-foam">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-5 py-5 text-sm text-km-ink/65 lg:px-8">
        
        </div>
      </section>

      {/* Digital + NFC card showcase */}
      <section className="km-landing-showcase relative overflow-hidden px-5 py-20 lg:px-8 lg:py-28">
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

      <section id="ai-scan" className="km-ai-scan relative overflow-hidden px-5 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-km-copper">AI Scan</p>
            <h2 className="mt-3 font-display text-4xl font-semibold leading-tight sm:text-5xl">
              Snap a paper card.
              <br />
              Every detail is saved.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-km-ink/65">
              Still collecting paper cards in meetings? Photograph one with Kadi Moja — AI reads the name, phone,
              email, company, and more, then opens your Kadi Moja digital card. No retyping.
            </p>
          </div>

          <div className="km-ai-scan-stage mt-12" aria-hidden="true">
            <div className="km-ai-scan-col">
              <p className="km-ai-scan-label">Paper business card</p>
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
            </div>

            <div className="km-ai-scan-bridge">
              <div className="km-ai-scan-pulse">
                <span className="km-ai-scan-pulse-ring" />
                <span className="km-ai-scan-pulse-ring" />
                <span className="km-ai-scan-pulse-core">AI</span>
              </div>
              <p className="km-ai-scan-bridge-caption">Scanning…</p>
            </div>

            <div className="km-ai-scan-col km-ai-scan-col--out">
              <p className="km-ai-scan-label">Kadi Moja digital card</p>
              <div className="km-ai-digital">
                <span className="km-ai-digital-badge">Auto-filled</span>
                <DigitalCardSample person={aiScanPerson} className="km-ai-digital-phone" />
              </div>
            </div>
          </div>

          <ol className="mx-auto mt-14 grid max-w-4xl gap-6 sm:grid-cols-3">
            {aiScanSteps.map((step) => (
              <li key={step.n} className="text-center sm:text-left">
                <span className="km-ai-scan-step-n mx-auto sm:mx-0">{step.n}</span>
                <h3 className="mt-3 font-display text-lg font-semibold text-km-ink">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-km-ink/60">{step.body}</p>
              </li>
            ))}
          </ol>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link to="/login" className="km-btn-primary">
              Try AI Scan →
            </Link>
            <p className="text-sm text-km-ink/50">2 free scans · then from TZS 10,000 / month</p>
          </div>
        </div>
      </section>

      <section id="how" className="bg-white px-5 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-km-sea">How it works</p>
            <h2 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">Three steps. Zero friction.</h2>
            <p className="mt-4 text-km-ink/60 leading-relaxed">
              No apps to install. No numbers to type. Tap, open, save.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <article key={step.title} className="km-how-card overflow-hidden bg-km-sand/40">
                <div className="bg-white px-5 pt-6">
                  <img
                    src={`${step.image}?v=3`}
                    alt=""
                    width={600}
                    height={900}
                    className="mx-auto h-56 w-auto max-w-full object-contain sm:h-64"
                    loading="lazy"
                  />
                </div>
                <div className="px-6 py-6 text-center">
                  <p className="text-xs font-semibold tracking-[0.16em] text-km-copper">{step.n}</p>
                  <h3 className="mt-2 font-display text-2xl font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-km-ink/60">{step.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="km-section-light px-5 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-4xl font-semibold sm:text-5xl">Paper vs Kadi Moja</h2>
            <p className="mt-4 text-km-ink/60">Handing out cards vs capturing connections.</p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <article className="overflow-hidden bg-[#eceff3]">
              <img
                src="/illustrations/compare-paper.jpg?v=3"
                alt="Scattered paper business cards"
                className="aspect-[4/3] w-full object-cover grayscale"
                loading="lazy"
              />
              <div className="px-6 py-5">
                <h3 className="font-display text-xl font-semibold">Paper</h3>
                <ul className="mt-4 space-y-2 text-sm text-km-ink/55">
                  <li>Hope they keep it</li>
                  <li>Manual typing later</li>
                  <li>Reprint when details change</li>
                </ul>
              </div>
            </article>
            <article className="overflow-hidden bg-km-lagoon">
              <img
                src="/illustrations/compare-nfc.jpg?v=3"
                alt="NFC card saving a contact on a phone"
                className="aspect-[4/3] w-full object-cover"
                loading="lazy"
              />
              <div className="px-6 py-5 text-white">
                <h3 className="font-display text-xl font-semibold">Kadi Moja</h3>
                <ul className="mt-4 space-y-2 text-sm text-white/80">
                  <li>Tap once—details appear</li>
                  <li>Save to contacts in seconds</li>
                  <li>Update anytime from dashboard</li>
                </ul>
              </div>
            </article>
          </div>
        </div>
      </section>

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

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const products = [
  {
    name: 'Kadi Moja NFC Card',
    tag: 'Available now',
    price: 'TZS 100,000',
    blurb: 'Physical PVC NFC card linked to your private Kadi Moja profile. Tap once—share everything.',
    points: ['Works with iPhone & Android', 'Private profile link', 'QR code backup', 'Selcom payment'],
    featured: true,
    active: true
  },
  {
    name: 'Kadi Moja Pro',
    tag: 'Coming soon',
    price: 'TZS 75,000',
    blurb: 'Fully customised with your logo and brand colours for meetings that leave a mark.',
    points: ['Custom logo & design', 'Works with iPhone & Android', 'No monthly fees', 'Priority support'],
    active: false
  },
  {
    name: 'Kadi Moja Metal',
    tag: 'Coming soon',
    price: 'From TZS 145,000',
    blurb: 'Precision-finished metal card. Sleek, durable, and built to impress at every handshake.',
    points: ['Metal finish', 'Works with iPhone & Android', 'No monthly fees', 'Long-lasting'],
    active: false
  }
];

const steps = [
  {
    n: '01',
    title: 'Tap',
    body: 'Works instantly on most smartphones. No app required.',
    image: '/illustrations/how-tap.png'
  },
  {
    n: '02',
    title: 'Share',
    body: 'Your digital profile opens with your details, links and more.',
    image: '/illustrations/how-share.png'
  },
  {
    n: '03',
    title: 'Saved',
    body: 'They can save you to contacts on the spot. QR backup included.',
    image: '/illustrations/how-saved.png'
  }
];

const reasons = [
  {
    title: 'Reusable & sustainable',
    body: 'Update your details anytime. One card replaces thousands of paper cards.'
  },
  {
    title: 'Fully-optimised profile',
    body: 'Photo, bio, socials, portfolio—share your complete story with a single tap.'
  },
  {
    title: 'Instant updates',
    body: 'Change phone, title, or company from the dashboard. No reprinting. Ever.'
  },
  {
    title: 'QR for every phone',
    body: 'NFC plus QR means your profile is reachable on virtually any device.'
  }
];

const faqs = [
  {
    q: 'What is an NFC business card?',
    a: 'A smart contactless card. One tap on a phone shares your contacts, socials, website, and more—faster and cleaner than paper.'
  },
  {
    q: 'Do I need an app?',
    a: 'No app needed on either side. Most modern iPhones and Androids read NFC out of the box. Older phones can scan the QR code.'
  },
  {
    q: 'Can I update my details after purchase?',
    a: 'Yes. Log into the dashboard and edit anytime. The physical card never needs reprinting for content changes.'
  },
  {
    q: 'Do you offer team / bulk pricing?',
    a: 'Yes. Volume discounts and a shared admin dashboard for assigning cards, updating profiles, and keeping brand consistency.'
  },
  {
    q: 'Where do you deliver?',
    a: 'Yes. We deliver across Tanzania (Dar, Arusha, Mwanza, Dodoma, Zanzibar and more) and can ship internationally. Typical local fulfilment is a few working days after design approval.'
  }
];

const sampleProfiles = [
  {
    tag: 'TAG12345',
    name: 'Japhari Mbaru',
    title: 'Founder & Systems Architect',
    company: 'Swahili Systems',
    location: 'Dar es Salaam',
    phone: '+255 714 076 404',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    logo: '/logos/swahili-systems.svg',
    accent: '#d4783a',
    tint: '#f8e8d8'
  },
  {
    tag: 'TAG67890',
    name: 'Amina Kassim',
    title: 'Product Lead',
    company: 'Swahili Systems',
    location: 'Dar es Salaam',
    phone: '+255 754 221 100',
    photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    logo: '/logos/swahili-systems.svg',
    accent: '#0d7377',
    tint: '#d9efef'
  },
  {
    tag: 'TAG-DAVID',
    name: 'David Mwakyusa',
    title: 'Sales Director',
    company: 'Safiri Logistics',
    location: 'Arusha',
    phone: '+255 762 334 455',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    logo: '/logos/ealogistics.svg',
    accent: '#2f6fad',
    tint: '#dde9f6'
  },
  {
    tag: 'TAG-GRACE',
    name: 'Grace Kimaro',
    title: 'Creative Director',
    company: 'Studio Bahari',
    location: 'Zanzibar',
    phone: '+255 777 889 900',
    photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    logo: '/logos/studio-bahari.svg',
    accent: '#c46a4a',
    tint: '#f6e4dc'
  },
  {
    tag: 'TAG-JAMES',
    name: 'James Mwakasege',
    title: 'Head of Engineering',
    company: 'FinLink Tanzania',
    location: 'Mwanza',
    phone: '+255 688 112 233',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    logo: '/logos/finlink.svg',
    accent: '#3d8b5a',
    tint: '#dcefe3'
  },
  {
    tag: 'TAG-NEEMA',
    name: 'Neema Hassan',
    title: 'Brand Strategist',
    company: 'Coastal Collective',
    location: 'Dodoma',
    phone: '+255 755 667 788',
    photo: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=400&q=80',
    logo: '/logos/coastal.svg',
    accent: '#9a5fb0',
    tint: '#f0e4f5'
  }
];

const HomePage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="bg-km-paper text-km-ink font-sans">
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-md border-b border-km-ink/8 shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 lg:px-8">
          <a
            href="#top"
            className={`font-display text-2xl font-bold tracking-tight transition-colors ${
              scrolled ? 'text-km-lagoon' : 'text-white'
            }`}
          >
            Kadi Moja
          </a>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#products" className={scrolled ? 'km-nav-link-dark' : 'km-nav-link'}>
              Cards
            </a>
            <a href="#samples" className={scrolled ? 'km-nav-link-dark' : 'km-nav-link'}>
              Samples
            </a>
            <a href="#how" className={scrolled ? 'km-nav-link-dark' : 'km-nav-link'}>
              How it works
            </a>
            <a href="#teams" className={scrolled ? 'km-nav-link-dark' : 'km-nav-link'}>
              For teams
            </a>
            <a href="#faq" className={scrolled ? 'km-nav-link-dark' : 'km-nav-link'}>
              FAQ
            </a>
            <Link to="/login" className={scrolled ? 'km-nav-link-dark' : 'km-nav-link'}>
              Sign in
            </Link>
            <Link to="/login" className="km-btn-primary !py-2.5 !px-5">
              Create account
            </Link>
          </nav>
          <button
            type="button"
            className={`md:hidden text-sm border px-3 py-2 ${
              scrolled
                ? 'text-km-ink border-km-ink/20'
                : 'text-white border-white/30'
            }`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
          >
            {menuOpen ? 'Close' : 'Menu'}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-km-ink/8 bg-white px-5 py-4 space-y-3">
            {[
              ['#products', 'Cards'],
              ['#samples', 'Samples'],
              ['#how', 'How it works'],
              ['#teams', 'For teams'],
              ['#faq', 'FAQ']
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="block text-km-ink/80"
                onClick={() => setMenuOpen(false)}
              >
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

      <section id="top" className="km-grain relative min-h-[100svh] overflow-hidden text-white">
        <div className="pointer-events-none absolute inset-0 opacity-50">
          <div className="absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-km-ember/30 blur-3xl" />
          <div className="absolute -right-16 bottom-1/4 h-80 w-80 rounded-full bg-white/20 blur-3xl" />
        </div>

        <div className="relative mx-auto grid min-h-[100svh] max-w-6xl items-center gap-8 px-5 pb-12 pt-24 lg:grid-cols-12 lg:gap-10 lg:px-8 lg:pb-16 lg:pt-20">
          <div className="lg:col-span-5">
            <p className="animate-fade-up font-display text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
              Kadi Moja
            </p>
            <h1 className="animate-fade-up-delay mt-4 font-display text-2xl font-semibold leading-snug text-white sm:text-3xl lg:text-[2.15rem] lg:leading-tight">
              The last card you&apos;ll ever need
            </h1>
            <p className="animate-fade-up-delay-2 mt-4 max-w-md text-sm leading-relaxed text-white/80 sm:text-base">
              Share your contact details, links and social profiles with a simple tap. Works with
              iPhone and Android. No app required.
            </p>
            <div className="animate-fade-up-delay-2 mt-7 flex flex-wrap gap-3">
              <a href="#products" className="km-btn-primary">
                Get your card
              </a>
              <Link to="/c/TAG12345" className="km-btn-ghost">
                See live demo
              </Link>
            </div>
          </div>

          <div className="relative lg:col-span-7">
            <div className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/35 animate-pulse-ring" />
            <div
              className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-km-ember/40 animate-pulse-ring"
              style={{ animationDelay: '0.8s' }}
            />
            <img
              src="/kadi-moja-hero-card.png?v=3"
              alt="Kadi Moja NFC business card"
              className="animate-float relative z-10 mx-auto w-full max-w-lg object-contain drop-shadow-[0_30px_60px_rgba(13,80,85,0.45)] lg:max-w-none"
            />
          </div>
        </div>
      </section>

      <section className="border-y border-km-lagoon/10 bg-km-foam">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5 text-sm text-km-ink/70 lg:px-8">
          <span>No monthly fees. Ever.</span>
          <span>Works with iPhone + Android</span>
          <span>Custom design included</span>
          <span>Delivered across Tanzania</span>
        </div>
      </section>

      <section className="km-section-light px-5 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-km-copper">
              Why switch
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold leading-tight sm:text-5xl">
              Most business cards get lost. Yours shouldn&apos;t.
            </h2>
          </div>
          <div className="space-y-5 text-base leading-relaxed text-km-ink/70">
            <p>
              Paper cards disappear into pockets, drawers and bins. Kadi Moja lets you share your
              details with a simple tap so people can save you instantly—and you can update your
              profile whenever life changes.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <a href="#products" className="km-btn-dark">
                Get Kadi Moja
              </a>
              <a href="#teams" className="km-btn-outline">
                Team pricing
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="products" className="bg-white px-5 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-km-copper">
              NFC Business Cards
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">
              Share everything with a tap
            </h2>
            <p className="mt-4 text-km-ink/65 leading-relaxed">
              Your all-in-one professional card. Tap any phone and instantly share contacts,
              website, socials, and more. Perfect for professionals, sales teams, and founders.
            </p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-3 lg:items-stretch">
            {products.map((p) => (
              <article
                key={p.name}
                className={`flex flex-col border p-7 text-km-ink ${
                  p.featured
                    ? 'border-km-copper/35 bg-white shadow-soft lg:-translate-y-2'
                    : 'border-km-lagoon/15 bg-km-bone opacity-80'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-km-copper">
                    {p.tag}
                  </p>
                  {p.featured && (
                    <span className="rounded-sm bg-km-ember/15 px-2 py-0.5 text-[11px] font-semibold text-km-copper">
                      Recommended
                    </span>
                  )}
                </div>
                <h3 className="mt-4 font-display text-2xl font-semibold text-km-ink">{p.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-km-ink/65">{p.blurb}</p>
                <p className="mt-6 font-display text-3xl font-semibold text-km-ink">{p.price}</p>
                <ul className="mt-6 space-y-2.5 text-sm text-km-ink/70">
                  {p.points.map((point) => (
                    <li key={point} className="flex gap-2">
                      <span className="text-km-sea">—</span>
                      {point}
                    </li>
                  ))}
                </ul>
                {p.active ? (
                  <Link to="/login" className={`mt-auto pt-8 ${p.featured ? 'km-btn-primary' : 'km-btn-dark'}`}>
                    Request this card
                  </Link>
                ) : (
                  <span className="mt-auto pt-8 inline-flex cursor-not-allowed items-center justify-center rounded-md border border-km-ink/10 px-4 py-2.5 text-sm font-semibold text-km-ink/40">
                    Not available yet
                  </span>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="samples" className="km-section-foam px-5 py-20 text-km-ink lg:px-8 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-km-copper">
              Live profiles
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">
              See Kadi Moja in action
            </h2>
            <p className="mt-4 text-km-ink/65 leading-relaxed">
              Branded digital cards with company logos—open any sample and experience the tap-ready profile.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sampleProfiles.map((person) => (
              <Link
                key={person.tag}
                to={`/c/${person.tag}`}
                className="km-sample group"
              >
                <article
                  className="km-sample-card"
                  style={{
                    '--sample-accent': person.accent,
                    '--sample-tint': person.tint
                  }}
                >
                  <div className="km-sample-band" />
                  <div className="km-sample-top">
                    <img src={person.logo} alt={`${person.company} logo`} className="km-sample-logo" />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold uppercase tracking-[0.16em] text-km-ink/55">
                        {person.company}
                      </p>
                      <p className="truncate text-[11px] text-km-ink/40">
                        {person.location}, Tanzania
                      </p>
                    </div>
                    <span className="km-sample-nfc" aria-hidden="true">
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <path d="M7 8c2.5-2.5 7.5-2.5 10 0" strokeLinecap="round" />
                        <path d="M9 11c1.5-1.5 4.5-1.5 6 0" strokeLinecap="round" />
                        <path d="M11.5 14c.7-.7 1.8-.7 2.5 0" strokeLinecap="round" />
                        <circle cx="12.75" cy="16.5" r="1" fill="currentColor" stroke="none" />
                      </svg>
                    </span>
                  </div>

                  <div className="km-sample-body">
                    <div className="km-sample-photo-wrap">
                      <img src={person.photo} alt={person.name} className="km-sample-photo" />
                    </div>
                    <h3 className="mt-5 font-display text-2xl font-semibold tracking-tight text-km-ink">
                      {person.name}
                    </h3>
                    <p className="mt-1 text-sm text-km-ink/60">{person.title}</p>
                    <p className="mt-2 text-sm font-medium text-km-lagoon">{person.phone}</p>
                    <div className="mt-6 flex items-center justify-between border-t border-km-ink/8 pt-4">
                      <span className="text-xs text-km-ink/40">Tap to open</span>
                      <span className="text-sm font-semibold text-[var(--sample-accent)] transition group-hover:translate-x-0.5">
                        View profile →
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="km-section-foam px-5 py-20 text-km-ink lg:px-8 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-km-sea">
              How it works
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">
              How Kadi Moja works
            </h2>
            <p className="mt-3 text-lg font-semibold text-km-ink/80">
              Networking has never been easier or more impressive.
            </p>
            <p className="mt-4 text-km-ink/60 leading-relaxed">
              With Kadi Moja, you can share your complete professional profile in seconds. No apps,
              no typing, and no paper. Just a simple tap delivers your contact details, social links,
              and portfolio directly to any smartphone.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <article key={step.title} className="km-how-card overflow-hidden bg-white shadow-soft">
                <div className="bg-white px-5 pt-6">
                  <img
                    src={`${step.image}?v=2`}
                    alt={step.title}
                    width={600}
                    height={900}
                    className="mx-auto h-64 w-auto max-w-full object-contain sm:h-72"
                    loading="lazy"
                  />
                </div>
                <div className="bg-km-sand/80 px-6 py-6 text-center">
                  <h3 className="font-display text-2xl font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-km-ink/60">{step.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-4xl font-semibold sm:text-5xl">Paper vs Kadi Moja</h2>
            <p className="mt-4 text-km-ink/60">
              The difference between handing out cards… and actually capturing connections.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <article className="overflow-hidden rounded-[1.5rem] bg-[#eceff3]">
              <img
                src="/illustrations/compare-paper.png?v=2"
                alt="Scattered paper business cards"
                width={900}
                height={600}
                className="aspect-[4/3] w-full object-cover grayscale"
                loading="lazy"
              />
              <div className="px-6 py-5">
                <h3 className="font-display text-xl font-semibold text-km-ink">Paper Business Cards</h3>
              </div>
            </article>

            <article className="overflow-hidden rounded-[1.5rem] bg-km-lagoon p-2.5 shadow-soft">
              <img
                src="/illustrations/compare-nfc.png?v=2"
                alt="NFC card saving a contact on a phone"
                width={900}
                height={600}
                className="aspect-[4/3] w-full rounded-[1.1rem] object-cover"
                loading="lazy"
              />
              <div className="px-4 py-5">
                <h3 className="font-display text-xl font-semibold text-white">
                  NFC Business Cards (Kadi Moja)
                </h3>
              </div>
            </article>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <ul className="space-y-3 text-sm text-km-ink/55">
              <li>Hand out cards and hope people keep them</li>
              <li>Details get lost in wallets or thrown away</li>
              <li>Contacts must be typed in manually later</li>
              <li>No way to update without reprinting</li>
              <li>No analytics on who viewed your details</li>
            </ul>
            <ul className="space-y-3 text-sm text-km-lagoon">
              <li>Tap once—details appear instantly</li>
              <li>Contacts can save you in seconds</li>
              <li>Links, socials, and portfolio in one place</li>
              <li>Update your profile anytime from the dashboard</li>
              <li>See when people view your profile</li>
            </ul>
          </div>

          <div className="mt-10 text-center">
            <p className="font-display text-2xl font-semibold text-km-ink sm:text-3xl">
              Every conversation has the chance to become a client.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a href="#products" className="km-btn-dark">
                Get your Kadi Moja
              </a>
              <a href="#teams" className="km-btn-outline">
                Get team pricing
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="km-section-light px-5 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-km-copper">
              Why Kadi Moja
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">
              Built for professionals who move
            </h2>
          </div>
          <div className="mt-14 grid gap-8 sm:grid-cols-2">
            {reasons.map((r) => (
              <div key={r.title} className="border-l-2 border-km-copper/60 pl-5">
                <h3 className="font-display text-xl font-semibold">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-km-ink/65">{r.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="teams" className="km-section-lagoon px-5 py-20 text-white lg:px-8 lg:py-28">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-km-ember">
              For teams
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">
              Want Kadi Moja for your team?
            </h2>
            <p className="mt-5 text-white/75 leading-relaxed">
              Give every teammate a branded profile. Manage access, update details, and reassign
              cards from one dashboard—perfect for sales, events, and growing companies.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#contact" className="km-btn-primary">
                Get team pricing
              </a>
              <Link to="/c/TAG12345" className="km-btn-ghost">
                Explore a sample profile
              </Link>
            </div>
          </div>
          <div className="border border-white/20 bg-white/10 p-8 backdrop-blur-sm">
            <ul className="space-y-4 text-sm text-white/85">
              <li className="flex gap-3">
                <span className="text-km-ember">→</span>
                Centralised admin for all profiles
              </li>
              <li className="flex gap-3">
                <span className="text-km-ember">→</span>
                Instant updates when roles change
              </li>
              <li className="flex gap-3">
                <span className="text-km-ember">→</span>
                Reassign lost or returned cards
              </li>
              <li className="flex gap-3">
                <span className="text-km-ember">→</span>
                Consistent brand across the company
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section id="faq" className="bg-white px-5 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-4xl font-semibold sm:text-5xl">Common questions</h2>
          <p className="mt-4 text-km-ink/65">
            New to NFC networking? These answers cover the essentials.
          </p>
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

      <section id="contact" className="km-grain px-5 py-24 text-white lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-display text-5xl font-bold tracking-tight sm:text-6xl">Kadi Moja</p>
          <h2 className="mt-5 font-display text-3xl font-semibold sm:text-4xl">
            Ready to upgrade how you connect?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-white/80">
            Pay once. Share instantly. Stay up to date.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/login" className="km-btn-primary">
              Create your account
            </Link>
            <Link to="/login" className="km-btn-ghost">
              Sign in
            </Link>
          </div>
          <p className="mt-8 text-sm text-white/60">
            No monthly fees · Custom design included · iPhone + Android
          </p>
        </div>
      </section>

      <footer className="border-t border-km-lagoon/20 bg-km-foam px-5 py-12 text-km-ink lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:justify-between">
          <div>
            <p className="font-display text-2xl font-bold text-km-lagoon">Kadi Moja</p>
            <p className="mt-2 max-w-xs text-sm text-km-ink/55">
              Your professional identity, reimagined. Effortless networking with one card.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 text-sm">
            <div className="space-y-2">
              <p className="font-semibold text-km-ink/80">Explore</p>
              <a href="#products" className="block text-km-ink/50 hover:text-km-lagoon">
                NFC cards
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

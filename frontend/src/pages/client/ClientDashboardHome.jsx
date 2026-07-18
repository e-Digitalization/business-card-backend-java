import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import { initialsFromName, resolveMediaUrl } from '../../utils/media.js';
import { ClientWorkspaceContext } from './ClientLayout.jsx';
import AiScanSubscriptionModal from './AiScanSubscriptionModal.jsx';

const StatIcon = ({ name }) => {
  const props = {
    viewBox: '0 0 24 24',
    className: 'h-5 w-5',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.8'
  };
  if (name === 'card') {
    return (
      <svg {...props}>
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M3 10h18" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === 'progress') {
    return (
      <svg {...props}>
        <path d="M12 3a9 9 0 1 1-7.5 4" strokeLinecap="round" />
        <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === 'link') {
    return (
      <svg {...props}>
        <path d="M10 13a5 5 0 0 0 7.07 0l1.41-1.41a5 5 0 0 0-7.07-7.07L10 6" strokeLinecap="round" />
        <path d="M14 11a5 5 0 0 0-7.07 0L5.5 12.4a5 5 0 0 0 7.07 7.07L14 18" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === 'photo') {
    return (
      <svg {...props}>
        <circle cx="12" cy="8" r="3.2" />
        <path d="M5 19c1.6-3 4-4.5 7-4.5s5.4 1.5 7 4.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === 'status') {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M8.5 12.5l2.2 2.2 4.8-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <path
        d="M6.6 3.8c.5-.5 1.3-.6 1.9-.2l2 1.4c.5.4.7 1.1.4 1.7l-.8 1.6c-.2.3-.1.7.1 1 1.2 1.6 2.7 3 4.4 4.2.3.2.7.3 1 .1l1.6-.8c.6-.3 1.3-.1 1.7.4l1.4 2c.4.6.3 1.4-.2 1.9l-1.1 1.1c-.5.5-1.2.7-1.9.6-2-.3-5-1.7-7.9-4.6S3.9 9.6 3.6 7.6c-.1-.7.1-1.4.6-1.9l1.1-1.1z"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const formatMoney = (amount, currency = 'TZS') => {
  if (amount == null) return '';
  try {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0
    }).format(amount);
  } catch {
    return `${Number(amount).toLocaleString()} ${currency}`;
  }
};

const formatDate = (iso) => {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString('en-TZ', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return iso;
  }
};

const ClientDashboardHome = () => {
  const { user, card } = React.useContext(ClientWorkspaceContext);
  const [welcomeOpen, setWelcomeOpen] = useState(() => localStorage.getItem('kmWelcomeDismissed') !== '1');
  const [subscription, setSubscription] = useState(null);
  const [nfcRequests, setNfcRequests] = useState([]);
  const [subscribeOpen, setSubscribeOpen] = useState(false);

  const loadSubscription = () =>
    api
      .get('/api/client/subscription')
      .then((res) => setSubscription(res.data.data || null))
      .catch(() => setSubscription(null));

  useEffect(() => {
    loadSubscription();
    api
      .get('/api/client/nfc/requests')
      .then((res) => setNfcRequests(res.data.data || []))
      .catch(() => setNfcRequests([]));
  }, []);

  const completeness = useMemo(() => {
    if (!card) return 0;
    const keys = ['fullName', 'title', 'company', 'phone', 'email', 'photoUrl', 'location', 'whatsapp'];
    const filled = keys.filter((k) => Boolean(card[k] && String(card[k]).trim())).length;
    return Math.round((filled / keys.length) * 100);
  }, [card]);

  const photo = resolveMediaUrl(card?.photoUrl || user?.pictureUrl || '');
  const initials = initialsFromName(card?.fullName || user?.fullName);
  const latestNfc = nfcRequests[0];

  const Avatar = ({ className = 'h-14 w-14 rounded-full' }) =>
    photo ? (
      <img src={photo} alt="" className={`${className} border border-black/5 object-cover`} />
    ) : (
      <div
        className={`${className} flex items-center justify-center border border-black/5 bg-[#0d7377] text-sm font-bold tracking-wide text-white`}
      >
        {initials}
      </div>
    );

  const stats = [
    {
      label: 'Digital cards',
      value: card ? 1 : 0,
      hint: 'Your Kadi Moja profile',
      tone: 'bg-[#e8f4f4] text-[#0d7377]',
      icon: 'card'
    },
    {
      label: 'Profile complete',
      value: `${completeness}%`,
      hint: 'Fill missing details',
      tone: 'bg-[#fff4e8] text-[#9a6b45]',
      icon: 'progress'
    },
    {
      label: 'Public link',
      value: card?.slug ? 1 : 0,
      hint: card?.slug ? `/u/${card.slug}` : 'Not ready',
      tone: 'bg-[#eef6ff] text-[#2563eb]',
      icon: 'link'
    },
    {
      label: 'Photo set',
      value: card?.photoUrl || user?.pictureUrl ? 1 : 0,
      hint: user?.hasGoogle ? 'Google connected' : 'Add a photo',
      tone: 'bg-[#f3eef8] text-[#7c3aed]',
      icon: 'photo'
    },
    {
      label: 'Card status',
      value: card?.active ? 'On' : 'Off',
      hint: card?.active ? 'Visible publicly' : 'Hidden',
      tone: 'bg-emerald-50 text-emerald-700',
      icon: 'status'
    },
    {
      label: 'Share ready',
      value: card?.phone || card?.whatsapp ? 1 : 0,
      hint: 'Phone / WhatsApp',
      tone: 'bg-rose-50 text-rose-600',
      icon: 'share'
    }
  ];

  const dismissWelcome = () => {
    localStorage.setItem('kmWelcomeDismissed', '1');
    setWelcomeOpen(false);
  };

  return (
    <div className="space-y-6">
      {welcomeOpen && (
        <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">
          <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xs text-white">
            ✓
          </span>
          <p className="flex-1 text-sm">
            Karibu {user?.fullName?.split(' ')[0] || ''} — welcome to Kadi Moja. Complete your digital card and share it with one tap.
          </p>
          <button type="button" onClick={dismissWelcome} className="text-emerald-700/70 hover:text-emerald-900" aria-label="Dismiss">
            ✕
          </button>
        </div>
      )}

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="client-panel p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9a6b45]">Subscription</p>
          <h2 className="mt-1 font-display text-xl font-semibold text-[#1a3d42]">AI Scan Monthly</h2>
          {subscription?.subscribed ? (
            <>
              <p className="mt-2 text-sm text-emerald-700">Active · unlimited AI scans</p>
              <p className="mt-1 text-sm text-[#1a3d42]/55">
                Renews / expires {formatDate(subscription.expiresAt) || 'after this month'}
              </p>
              <button
                type="button"
                onClick={() => setSubscribeOpen(true)}
                className="mt-4 inline-flex rounded-md border border-black/10 px-3.5 py-2 text-sm font-medium text-[#1a3d42]"
              >
                View subscription
              </button>
            </>
          ) : (
            <>
              <p className="mt-2 text-sm text-[#1a3d42]/70">
                Free plan: {subscription?.remaining ?? subscription?.freeLimit ?? 2} of{' '}
                {subscription?.freeLimit ?? 2} AI scans left
              </p>
              <p className="mt-1 text-sm text-[#1a3d42]/55">
                Then {formatMoney(subscription?.priceTzs || 10000)} / month via Selcom
              </p>
              <button
                type="button"
                onClick={() => setSubscribeOpen(true)}
                className="mt-4 inline-flex rounded-md bg-[#0d7377] px-3.5 py-2 text-sm font-semibold text-white"
              >
                Manage subscription
              </button>
            </>
          )}
        </div>

        <div className="client-panel p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9a6b45]">NFC card</p>
          <h2 className="mt-1 font-display text-xl font-semibold text-[#1a3d42]">Physical card</h2>
          {latestNfc ? (
            <>
              <p className="mt-2 text-sm text-[#1a3d42]/70">
                {latestNfc.productName} · {formatMoney(latestNfc.amount, latestNfc.currency)}
              </p>
              <p className="mt-1 text-sm text-[#1a3d42]/55">
                Status: <span className="font-medium text-[#9a6b45]">{latestNfc.status}</span>
                {' · '}one-time payment
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-[#1a3d42]/55">
              One-time TZS 100,000 payment. Request a printed NFC card for taps.
            </p>
          )}
          <Link
            to="/me/looks"
            className="mt-4 inline-flex rounded-md border border-black/10 px-3.5 py-2 text-sm font-medium text-[#1a3d42]"
          >
            {latestNfc ? 'View NFC order' : 'Request NFC card'}
          </Link>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="client-stat-card">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-3xl font-semibold text-[#1a3d42]">{stat.value}</p>
                <p className="mt-1 text-sm font-medium text-[#1a3d42]">{stat.label}</p>
                <p className="mt-0.5 truncate text-xs text-[#1a3d42]/45">{stat.hint}</p>
              </div>
              <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.tone}`}>
                <StatIcon name={stat.icon} />
              </span>
            </div>
          </div>
        ))}
      </div>

      <section className="client-panel overflow-hidden">
        {completeness < 70 ? (
          <div className="px-6 py-12 text-center">
            <div className="mx-auto flex h-36 w-full max-w-md items-end justify-center gap-3">
              {[56, 96, 72, 118, 64].map((h, i) => (
                <div
                  key={i}
                  className="w-8 rounded-t-md bg-gradient-to-t from-[#0d7377]/20 to-[#0d7377]/65"
                  style={{ height: `${h}px` }}
                />
              ))}
            </div>
            <p className="mt-6 font-display text-xl font-semibold text-[#1a3d42]">Finish your card to unlock insights</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#1a3d42]/55">
              Add your phone, photo, and company details so taps and profile views start showing up here.
            </p>
            <Link
              to="/me/card"
              className="mt-5 inline-flex rounded-md bg-[#0d7377] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0a5f63]"
            >
              Complete my card
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 px-6 py-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9a6b45]">Overview</p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-[#1a3d42]">Your card is live</h2>
              <p className="mt-2 text-sm text-[#1a3d42]/60">
                Share <span className="font-medium text-[#0d7377]">/u/{card.slug}</span> or tap an NFC tag linked by your admin.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <a
                  href={`/u/${card.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md bg-[#0d7377] px-4 py-2.5 text-sm font-semibold text-white"
                >
                  Open public card
                </a>
                <Link
                  to="/me/share"
                  className="rounded-md border border-black/10 px-4 py-2.5 text-sm font-medium text-[#1a3d42]"
                >
                  Share & QR
                </Link>
                <Link
                  to="/me/contacts"
                  className="rounded-md border border-black/10 px-4 py-2.5 text-sm font-medium text-[#1a3d42]"
                >
                  Contacts
                </Link>
                <Link
                  to="/me/looks"
                  className="rounded-md border border-black/10 px-4 py-2.5 text-sm font-medium text-[#1a3d42]"
                >
                  NFC & card look
                </Link>
              </div>
            </div>
            <div className="rounded-xl border border-black/5 bg-[#f7f4ef] p-5">
              <div className="flex items-center gap-3">
                <Avatar />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[#1a3d42]">{card.fullName}</p>
                  <p className="truncate text-sm text-[#1a3d42]/50">
                    {card.title || 'Professional'} · {card.company || 'Kadi Moja'}
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#0d7377]">{card.phone || 'Add +255 phone'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="client-panel">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 px-5 py-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-[#1a3d42]">Kadi Moja profiles</h2>
            <p className="text-sm text-[#1a3d42]/50">Your digital business card in Tanzania</p>
          </div>
          <Link
            to="/me/card"
            className="inline-flex items-center gap-1 rounded-md bg-[#0d7377] px-3.5 py-2 text-sm font-semibold text-white"
          >
            <span>+</span> Edit card
          </Link>
        </div>

        {card ? (
          <div className="flex flex-wrap items-center gap-4 px-5 py-4">
            <Avatar className="h-12 w-12 rounded-lg" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-[#1a3d42]">{card.fullName || 'Untitled card'}</p>
              <p className="text-sm text-[#1a3d42]/50">
                /u/{card.slug} · {card.location || 'Tanzania'}
              </p>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                card.active ? 'bg-emerald-50 text-emerald-700' : 'bg-[#f3eee7] text-[#1a3d42]/55'
              }`}
            >
              {card.active ? 'Active' : 'Inactive'}
            </span>
            <Link
              to="/me/card"
              className="rounded-md border border-black/10 px-3 py-2 text-sm font-medium text-[#1a3d42] hover:bg-[#f7f4ef]"
            >
              Manage
            </Link>
          </div>
        ) : (
          <p className="px-5 py-8 text-sm text-[#1a3d42]/50">No card yet. Create your first Kadi Moja profile.</p>
        )}
      </section>

      <AiScanSubscriptionModal
        open={subscribeOpen}
        onClose={() => setSubscribeOpen(false)}
        subscription={subscription}
        onSubscribed={loadSubscription}
      />
    </div>
  );
};

export default ClientDashboardHome;

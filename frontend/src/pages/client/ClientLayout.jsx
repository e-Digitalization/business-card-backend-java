import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import { initialsFromName, resolveMediaUrl } from '../../utils/media.js';

const icons = {
  dashboard: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z" strokeLinejoin="round" />
    </svg>
  ),
  card: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 10h18" />
    </svg>
  ),
  link: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M10 13a5 5 0 0 0 7.07 0l1.41-1.41a5 5 0 0 0-7.07-7.07L10 6" strokeLinecap="round" />
      <path d="M14 11a5 5 0 0 0-7.07 0L5.5 12.4a5 5 0 0 0 7.07 7.07L14 18" strokeLinecap="round" />
    </svg>
  ),
  photo: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 19c1.6-3 4-4.5 7-4.5s5.4 1.5 7 4.5" strokeLinecap="round" />
    </svg>
  ),
  contacts: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" />
      <circle cx="9" cy="7" r="3.2" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a3.2 3.2 0 0 1 0 6.26" strokeLinecap="round" />
    </svg>
  ),
  pin: (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
      <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
    </svg>
  )
};

const Chevron = ({ open }) => (
  <svg
    viewBox="0 0 20 20"
    className={`h-4 w-4 opacity-60 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path d="M7.5 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ClientWorkspaceContext = React.createContext({
  user: null,
  card: null,
  loading: true,
  refresh: async () => {},
  setCard: () => {}
});

const ClientLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cardOpen, setCardOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarFailed, setAvatarFailed] = useState(false);

  const refresh = async () => {
    const me = await api.get('/api/client/me');
    setUser(me.data.data);
    let nextCard = me.data.data.card || null;
    if (!nextCard) {
      const cardRes = await api.get('/api/client/me/card');
      nextCard = cardRes.data.data;
    }
    setCard(nextCard);
    return { user: me.data.data, card: nextCard };
  };

  useEffect(() => {
    let mounted = true;
    refresh()
      .catch(() => {
        localStorage.removeItem('clientToken');
        localStorage.removeItem('clientUser');
        navigate('/login', { replace: true });
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [navigate]);

  useEffect(() => {
    if (
      location.pathname.startsWith('/me/card') ||
      location.pathname.startsWith('/me/share') ||
      location.pathname.startsWith('/me/photo') ||
      location.pathname.startsWith('/me/looks')
    ) {
      setCardOpen(true);
    }
  }, [location.pathname]);

  const logout = () => {
    localStorage.removeItem('clientToken');
    localStorage.removeItem('clientUser');
    navigate('/login');
  };

  const photo = resolveMediaUrl(card?.photoUrl || user?.pictureUrl || '');
  const initials = initialsFromName(card?.fullName || user?.fullName);
  const value = useMemo(
    () => ({ user, card, loading, refresh, setCard, setUser }),
    [user, card, loading]
  );

  useEffect(() => {
    setAvatarFailed(false);
  }, [photo]);

  const cardSectionActive =
    location.pathname.startsWith('/me/card') ||
    location.pathname.startsWith('/me/share') ||
    location.pathname.startsWith('/me/photo') ||
    location.pathname.startsWith('/me/looks');

  const sidebar = (
    <aside className="snav flex h-full flex-col">
      <div className="snav-profile">
        {photo && !avatarFailed ? (
          <img
            src={photo}
            alt=""
            className="snav-avatar"
            onError={() => setAvatarFailed(true)}
          />
        ) : (
          <div className="snav-avatar snav-avatar-initials">{initials}</div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold text-[#243b45]">{user?.fullName || 'Client'}</p>
          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-[#0d7377]">
            <span className="text-[#e25555]">{icons.pin}</span>
            {card?.location || 'Tanzania'}
          </p>
          <p className="mt-1 truncate text-[11px] font-semibold uppercase tracking-[0.08em] text-[#0d7377]/75">
            {card?.title || 'Digital card owner'}
          </p>
        </div>
        <button
          type="button"
          className="rounded-md border border-black/10 px-2 py-1 text-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          Close
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
        <NavLink
          to="/me"
          end
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) => `snav-item ${isActive ? 'is-active' : ''}`}
        >
          <span className="snav-item-icon">{icons.dashboard}</span>
          <span className="flex-1">Dashboard</span>
        </NavLink>

        <div className={`snav-group ${cardOpen ? 'is-open' : ''}`}>
          <button
            type="button"
            className={`snav-item w-full ${cardSectionActive ? 'is-active' : ''}`}
            onClick={() => setCardOpen((v) => !v)}
          >
            <span className="snav-item-icon">{icons.card}</span>
            <span className="flex-1 text-left">My Kadi Moja</span>
            <Chevron open={cardOpen} />
          </button>
          <div className="snav-collapse">
            <div className="snav-collapse-inner">
              <div className="snav-sub">
                <NavLink
                  to="/me/card"
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `snav-subitem ${isActive ? 'is-active' : ''}`}
                >
                  <span className="snav-bullet" />
                  Edit card
                </NavLink>
                <NavLink
                  to="/me/share"
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `snav-subitem ${isActive ? 'is-active' : ''}`}
                >
                  <span className="snav-bullet" />
                  Share & QR
                </NavLink>
                <NavLink
                  to="/me/photo"
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `snav-subitem ${isActive ? 'is-active' : ''}`}
                >
                  <span className="snav-bullet" />
                  Profile photo
                </NavLink>
                <NavLink
                  to="/me/looks"
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `snav-subitem ${isActive ? 'is-active' : ''}`}
                >
                  <span className="snav-bullet" />
                  NFC & card look
                </NavLink>
              </div>
            </div>
          </div>
        </div>

        <NavLink
          to="/me/contacts"
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) => `snav-item ${isActive ? 'is-active' : ''}`}
        >
          <span className="snav-item-icon">{icons.contacts}</span>
          <span className="flex-1">Contacts</span>
        </NavLink>

        {card?.slug && (
          <a
            href={`/u/${card.slug}`}
            target="_blank"
            rel="noreferrer"
            className="snav-item"
            onClick={() => setMobileOpen(false)}
          >
            <span className="snav-item-icon">{icons.link}</span>
            <span className="flex-1">Public profile</span>
            <span className="snav-chevron">›</span>
          </a>
        )}
      </nav>

      <div className="border-t border-black/5 p-3">
        <button type="button" onClick={logout} className="snav-item w-full">
          <span className="snav-item-icon">
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path d="M10 7V5a2 2 0 0 1 2-2h7v18h-7a2 2 0 0 1-2-2v-2" strokeLinecap="round" />
              <path d="M4 12h10M11 9l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="flex-1 text-left">Toka / Logout</span>
        </button>
      </div>
    </aside>
  );

  return (
    <ClientWorkspaceContext.Provider value={value}>
      <div className="client-shell min-h-screen">
        <div className="snav-topbar lg:hidden">
          <button type="button" className="snav-topbar-btn" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          </button>
          <p className="font-display text-lg font-bold text-white">Kadi Moja</p>
        </div>

        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button type="button" className="absolute inset-0 bg-black/35" onClick={() => setMobileOpen(false)} />
            <div className="relative h-full w-[300px] max-w-[88vw] bg-white shadow-xl">{sidebar}</div>
          </div>
        )}

        <div className="mx-auto flex min-h-[calc(100vh-52px)] max-w-[1500px] lg:min-h-screen">
          <div className="hidden w-[292px] shrink-0 border-r border-black/5 bg-white lg:block">{sidebar}</div>
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            {loading ? (
              <p className="text-sm text-[#1a3d42]/50">Loading your workspace…</p>
            ) : (
              <Outlet />
            )}
          </main>
        </div>
      </div>
    </ClientWorkspaceContext.Provider>
  );
};

export default ClientLayout;

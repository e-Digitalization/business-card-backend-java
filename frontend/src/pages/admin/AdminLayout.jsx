import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

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

const icons = {
  dashboard: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z" strokeLinejoin="round" />
    </svg>
  ),
  cards: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 10h18" />
    </svg>
  ),
  nfc: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M7 8c2.8-2.8 7.2-2.8 10 0" strokeLinecap="round" />
      <path d="M9 11c1.7-1.7 4.3-1.7 6 0" strokeLinecap="round" />
      <path d="M11 14c.8-.8 2.2-.8 3 0" strokeLinecap="round" />
      <circle cx="12.5" cy="17" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M10 7V5a2 2 0 0 1 2-2h7v18h-7a2 2 0 0 1-2-2v-2" strokeLinecap="round" />
      <path d="M4 12h10M11 9l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  pin: (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
      <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
    </svg>
  )
};

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sectionFromPath = useMemo(() => {
    if (location.pathname.startsWith('/admin/tags') || location.pathname.startsWith('/admin/nfc-requests')) {
      return 'nfc';
    }
    if (location.pathname.startsWith('/admin/cards')) return 'cards';
    return null;
  }, [location.pathname]);

  const [openSection, setOpenSection] = useState(sectionFromPath || 'cards');

  useEffect(() => {
    if (sectionFromPath) setOpenSection(sectionFromPath);
  }, [sectionFromPath]);

  const pageTitle = useMemo(() => {
    if (location.pathname.startsWith('/admin/cards/new')) return 'Create Digital Card';
    if (location.pathname.startsWith('/admin/cards')) return 'Digital Business Cards';
    if (location.pathname.startsWith('/admin/nfc-requests')) return 'NFC Card Requests';
    if (location.pathname.startsWith('/admin/tags')) return 'NFC Cards';
    return 'Dashibodi';
  }, [location.pathname]);

  const onLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login', { state: { role: 'admin' } });
  };

  const closeMobile = () => setMobileOpen(false);

  const toggleSection = (key) => {
    setOpenSection((current) => (current === key ? null : key));
  };

  const sidebar = (
    <aside className="snav flex h-full flex-col">
      <div className="snav-profile">
        <div className="snav-avatar snav-avatar-fallback">KM</div>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold text-[#243b45]">Kadi Moja Admin</p>
          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-[#0d7377]">
            <span className="text-[#e25555]">{icons.pin}</span>
            Tanzania
          </p>
          <p className="mt-1 truncate text-[11px] font-semibold uppercase tracking-[0.08em] text-[#0d7377]/75">
            Platform administrator
          </p>
        </div>
        <button
          type="button"
          className="ml-auto rounded-md border border-black/10 px-2 py-1 text-xs lg:hidden"
          onClick={closeMobile}
        >
          Close
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
        <NavLink
          to="/admin/dashboard"
          onClick={closeMobile}
          className={({ isActive }) => `snav-item ${isActive ? 'is-active' : ''}`}
        >
          <span className="snav-item-icon">{icons.dashboard}</span>
          <span className="flex-1">Dashibodi</span>
        </NavLink>

        <div className={`snav-group ${openSection === 'cards' ? 'is-open' : ''}`}>
          <button
            type="button"
            className={`snav-item w-full ${sectionFromPath === 'cards' ? 'is-active' : ''}`}
            aria-expanded={openSection === 'cards'}
            onClick={() => toggleSection('cards')}
          >
            <span className="snav-item-icon">{icons.cards}</span>
            <span className="flex-1 text-left">Digital Business Cards</span>
            <Chevron open={openSection === 'cards'} />
          </button>
          <div className="snav-collapse">
            <div className="snav-collapse-inner">
              <div className="snav-sub">
                <NavLink
                  to="/admin/cards"
                  end
                  onClick={closeMobile}
                  className={({ isActive }) => `snav-subitem ${isActive ? 'is-active' : ''}`}
                >
                  <span className="snav-bullet" />
                  All Cards
                </NavLink>
                <NavLink
                  to="/admin/cards/new"
                  onClick={closeMobile}
                  className={({ isActive }) => `snav-subitem ${isActive ? 'is-active' : ''}`}
                >
                  <span className="snav-bullet" />
                  Create Card
                </NavLink>
              </div>
            </div>
          </div>
        </div>

        <div className={`snav-group ${openSection === 'nfc' ? 'is-open' : ''}`}>
          <button
            type="button"
            className={`snav-item w-full ${sectionFromPath === 'nfc' ? 'is-active' : ''}`}
            aria-expanded={openSection === 'nfc'}
            onClick={() => toggleSection('nfc')}
          >
            <span className="snav-item-icon">{icons.nfc}</span>
            <span className="flex-1 text-left">NFC Cards</span>
            <Chevron open={openSection === 'nfc'} />
          </button>
          <div className="snav-collapse">
            <div className="snav-collapse-inner">
              <div className="snav-sub">
                <NavLink
                  to="/admin/nfc-requests"
                  onClick={closeMobile}
                  className={({ isActive }) => `snav-subitem ${isActive ? 'is-active' : ''}`}
                >
                  <span className="snav-bullet" />
                  Card Requests
                </NavLink>
                <NavLink
                  to="/admin/tags"
                  onClick={closeMobile}
                  className={({ isActive }) => `snav-subitem ${isActive ? 'is-active' : ''}`}
                >
                  <span className="snav-bullet" />
                  Manage NFC Tags
                </NavLink>
                <NavLink to="/admin/cards" onClick={closeMobile} className="snav-subitem">
                  <span className="snav-bullet" />
                  Assign Tag to Card
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="border-t border-black/5 p-3">
        <button type="button" onClick={onLogout} className="snav-item w-full">
          <span className="snav-item-icon">{icons.logout}</span>
          <span className="flex-1 text-left">Toka / Logout</span>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="admin-shell min-h-screen">
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
          <button
            type="button"
            className="absolute inset-0 bg-black/35"
            aria-label="Close menu overlay"
            onClick={closeMobile}
          />
          <div className="relative h-full w-[300px] max-w-[88vw] bg-white shadow-xl">{sidebar}</div>
        </div>
      )}

      <div className="mx-auto flex min-h-[calc(100vh-52px)] max-w-[1600px] lg:min-h-screen">
        <div className="hidden w-[292px] shrink-0 border-r border-black/5 bg-white lg:block">{sidebar}</div>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 hidden lg:block">
            <p className="text-xs uppercase tracking-[0.16em] text-[#9a6b45]">Kadi Moja Admin</p>
            <h1 className="mt-1 font-display text-3xl font-semibold text-[#1a3d42]">{pageTitle}</h1>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

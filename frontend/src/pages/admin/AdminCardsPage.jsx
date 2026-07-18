import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import PaginationBar from '../../components/PaginationBar.jsx';
import ProfileAvatar from '../../components/ProfileAvatar.jsx';
import EditCardDialog from './EditCardDialog.jsx';

const AdminCardsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [stats, setStats] = useState({ totalCards: 0, activeCards: 0, assignedTags: 0 });
  const [menuId, setMenuId] = useState(null);
  const [editId, setEditId] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await api.get('/api/admin/cards/stats');
      setStats(res.data.data || { totalCards: 0, activeCards: 0, assignedTags: 0 });
    } catch {
      /* ignore */
    }
  };

  const fetchCards = async (query = q, nextPage = page, nextSize = rowsPerPage) => {
    setLoading(true);
    try {
      const response = await api.get('/api/admin/cards', {
        params: {
          page: nextPage,
          size: nextSize,
          ...(query.trim() ? { q: query.trim() } : {})
        }
      });
      const data = response.data.data || {};
      setCards(data.items || []);
      setPage(data.page ?? nextPage);
      setRowsPerPage(data.size ?? nextSize);
      setTotalElements(data.totalElements ?? 0);
      setTotalPages(data.totalPages ?? 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
    fetchStats();
  }, []);

  useEffect(() => {
    if (location.state?.editId) {
      setEditId(location.state.editId);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  const onSearch = (e) => {
    e?.preventDefault?.();
    setPage(0);
    fetchCards(q, 0, rowsPerPage);
  };

  const openEdit = (id) => {
    setMenuId(null);
    setEditId(id);
  };

  return (
    <div className="space-y-5" onClick={() => setMenuId(null)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="max-w-xl text-sm text-[#1a3d42]/55">
          Profiles shared when someone taps an NFC card in Tanzania.
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fetchCards();
              fetchStats();
            }}
            disabled={loading}
            className="rounded-md border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-[#1a3d42] hover:bg-[#f7f4ef] disabled:opacity-50"
          >
            Refresh
          </button>
          <Link
            to="/admin/cards/new"
            className="rounded-md bg-[#9a6b45] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#865c3b]"
          >
            + Create / Scan Card
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Total Cards', value: stats.totalCards, hint: 'Profiles created', tone: 'text-[#0d7377]' },
          { label: 'Active Cards', value: stats.activeCards, hint: 'Visible to the public', tone: 'text-emerald-700' },
          { label: 'Assigned Tags', value: stats.assignedTags, hint: 'NFC tag codes', tone: 'text-[#9a6b45]' }
        ].map((stat) => (
          <div key={stat.label} className="admin-stat-card">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1a3d42]/45">
              {stat.label}
            </p>
            <p className={`mt-3 font-display text-3xl font-semibold ${stat.tone}`}>
              {loading && !stats.totalCards ? '—' : stat.value}
            </p>
            <p className="mt-1 text-sm text-[#1a3d42]/45">{stat.hint}</p>
          </div>
        ))}
      </div>

      <section className="admin-panel overflow-hidden">
        <form onSubmit={onSearch} className="border-b border-black/5 px-4 py-4 sm:px-5">
          <div className="flex flex-wrap gap-2">
            <div className="admin-input-wrap min-w-[220px] flex-1">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#1a3d42]/40" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="11" cy="11" r="6.5" />
                <path d="M16 16l4 4" strokeLinecap="round" />
              </svg>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder="Search name, phone +255, company, email…"
                className="w-full bg-transparent text-sm text-[#1a3d42] outline-none placeholder:text-[#1a3d42]/35"
              />
            </div>
            <button
              type="submit"
              className="rounded-md border border-black/10 px-4 py-2.5 text-sm font-medium text-[#1a3d42]"
            >
              Search
            </button>
          </div>
        </form>

        <div className="hidden border-b border-black/5 px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#1a3d42]/40 lg:grid lg:grid-cols-[1.4fr_1fr_1fr_0.9fr_0.7fr_auto] lg:gap-3">
          <span>Profile</span>
          <span>Company</span>
          <span>Phone</span>
          <span>NFC Tags</span>
          <span>Status</span>
          <span className="text-right">Action</span>
        </div>

        {loading && <p className="px-5 py-10 text-sm text-[#1a3d42]/50">Loading cards…</p>}
        {!loading && cards.length === 0 && (
          <div className="px-5 py-12 text-center">
            <p className="font-display text-lg font-semibold text-[#1a3d42]">No cards found</p>
            <p className="mt-1 text-sm text-[#1a3d42]/50">Try another search or create a new digital card.</p>
            <Link
              to="/admin/cards/new"
              className="mt-4 inline-flex rounded-md bg-[#9a6b45] px-4 py-2.5 text-sm font-semibold text-white"
            >
              Create Card
            </Link>
          </div>
        )}

        <div className="divide-y divide-black/5">
          {cards.map((row) => (
            <div
              key={row.card.id}
              className="grid gap-3 px-4 py-4 sm:px-5 lg:grid-cols-[1.4fr_1fr_1fr_0.9fr_0.7fr_auto] lg:items-center lg:gap-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <ProfileAvatar
                  name={row.card.fullName}
                  photoUrl={row.card.photoUrl}
                  logoUrl={row.card.logoUrl}
                />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[#1a3d42]">{row.card.fullName || '—'}</p>
                  <p className="truncate text-xs text-[#1a3d42]/45">
                    /u/{row.card.slug} · {row.card.location || 'Tanzania'}
                  </p>
                </div>
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[#1a3d42]">{row.card.company || '—'}</p>
                <p className="truncate text-xs text-[#1a3d42]/45">{row.card.title || '—'}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-[#0d7377]">{row.card.phone || '—'}</p>
                <p className="truncate text-xs text-[#1a3d42]/40">{row.card.email || '—'}</p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {(row.tags || []).length === 0 ? (
                  <span className="text-xs text-[#1a3d42]/40">No NFC</span>
                ) : (
                  row.tags.map((t) => (
                    <span
                      key={t.id}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        t.active
                          ? 'bg-[#0d7377]/10 text-[#0d7377]'
                          : 'border border-black/10 text-[#1a3d42]/45'
                      }`}
                    >
                      {t.tagCode}
                    </span>
                  ))
                )}
              </div>

              <div>
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                    row.card.active
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-[#f3eee7] text-[#1a3d42]/55'
                  }`}
                >
                  {row.card.active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="relative flex justify-end" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  className="rounded-md border border-black/10 px-3 py-2 text-sm font-medium text-[#1a3d42] hover:bg-[#f7f4ef]"
                  onClick={() => setMenuId((id) => (id === row.card.id ? null : row.card.id))}
                >
                  Actions
                </button>
                {menuId === row.card.id && (
                  <div className="absolute right-0 top-11 z-20 w-48 overflow-hidden rounded-lg border border-black/8 bg-white shadow-[0_16px_40px_rgba(26,61,66,0.12)]">
                    <Link
                      to={`/admin/cards/${row.card.id}`}
                      className="block px-4 py-2.5 text-sm text-[#1a3d42] hover:bg-[#f7f4ef]"
                      onClick={() => setMenuId(null)}
                    >
                      View profile
                    </Link>
                    <button
                      type="button"
                      onClick={() => openEdit(row.card.id)}
                      className="block w-full px-4 py-2.5 text-left text-sm text-[#1a3d42] hover:bg-[#f7f4ef]"
                    >
                      Edit card
                    </button>
                    <Link
                      to={`/admin/cards/${row.card.id}`}
                      className="block px-4 py-2.5 text-sm text-[#1a3d42] hover:bg-[#f7f4ef]"
                      onClick={() => setMenuId(null)}
                    >
                      Link NFC
                    </Link>
                    <a
                      href={`/u/${row.card.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="block px-4 py-2.5 text-sm text-[#1a3d42] hover:bg-[#f7f4ef]"
                    >
                      Open public card
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <PaginationBar
          page={page}
          size={rowsPerPage}
          totalElements={totalElements}
          totalPages={totalPages}
          onPageChange={(next) => {
            setPage(next);
            fetchCards(q, next, rowsPerPage);
          }}
          onSizeChange={(next) => {
            setRowsPerPage(next);
            setPage(0);
            fetchCards(q, 0, next);
          }}
        />
      </section>

      <EditCardDialog
        open={Boolean(editId)}
        cardId={editId}
        onClose={() => setEditId(null)}
        onSaved={() => {
          fetchCards();
          fetchStats();
        }}
      />
    </div>
  );
};

export default AdminCardsPage;

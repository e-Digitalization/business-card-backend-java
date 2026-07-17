import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import EditCardDialog from './EditCardDialog.jsx';

const AdminDashboard = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    let mounted = true;
    api
      .get('/api/admin/cards')
      .then((response) => {
        if (mounted) setCards(response.data.data || []);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const refresh = () => {
    api.get('/api/admin/cards').then((response) => setCards(response.data.data || []));
  };

  const stats = useMemo(() => {
    const active = cards.filter((c) => c.card?.active).length;
    const tags = cards.reduce((acc, c) => acc + (c.tags?.length || 0), 0);
    const activeTags = cards.reduce(
      (acc, c) => acc + (c.tags?.filter((t) => t.active).length || 0),
      0
    );
    return {
      total: cards.length,
      active,
      tags,
      activeTags
    };
  }, [cards]);

  const recent = cards.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Digital Cards', value: stats.total, hint: 'All profiles' },
          { label: 'Active Cards', value: stats.active, hint: 'Live on the web' },
          { label: 'NFC Tags', value: stats.tags, hint: 'Physical tap codes' },
          { label: 'Active NFC', value: stats.activeTags, hint: 'Ready to tap' }
        ].map((item) => (
          <div key={item.label} className="admin-stat-card">
            <p className="text-xs uppercase tracking-[0.14em] text-[#9a6b45]">{item.label}</p>
            <p className="mt-3 font-display text-3xl font-semibold text-[#1a3d42]">
              {loading ? '—' : item.value}
            </p>
            <p className="mt-1 text-sm text-[#1a3d42]/50">{item.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Link to="/admin/cards/new" className="admin-action-card">
          <span className="admin-nav-icon is-active">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="8" />
              <path d="M12 8v8M8 12h8" strokeLinecap="round" />
            </svg>
          </span>
          <div>
            <p className="font-display text-lg font-semibold text-[#1a3d42]">New Digital Card</p>
            <p className="text-sm text-[#1a3d42]/55">Create a branded profile for a professional</p>
          </div>
        </Link>
        <Link to="/admin/tags" className="admin-action-card">
          <span className="admin-nav-icon is-active">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M7 8c2.8-2.8 7.2-2.8 10 0" strokeLinecap="round" />
              <path d="M9 11c1.7-1.7 4.3-1.7 6 0" strokeLinecap="round" />
              <path d="M11 14c.8-.8 2.2-.8 3 0" strokeLinecap="round" />
            </svg>
          </span>
          <div>
            <p className="font-display text-lg font-semibold text-[#1a3d42]">Manage NFC</p>
            <p className="text-sm text-[#1a3d42]/55">View tag codes linked to digital cards</p>
          </div>
        </Link>
        <Link to="/admin/cards" className="admin-action-card">
          <span className="admin-nav-icon is-active">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="6" width="18" height="12" rx="2" />
              <path d="M3 10h18" />
            </svg>
          </span>
          <div>
            <p className="font-display text-lg font-semibold text-[#1a3d42]">All Cards</p>
            <p className="text-sm text-[#1a3d42]/55">Search, edit, and assign NFC tags</p>
          </div>
        </Link>
      </div>

      <section className="admin-panel">
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-black/5">
          <div>
            <h2 className="font-display text-xl font-semibold text-[#1a3d42]">Recent digital cards</h2>
            <p className="text-sm text-[#1a3d42]/50">Latest profiles in your Tanzania workspace</p>
          </div>
          <Link to="/admin/cards" className="text-sm font-semibold text-[#9a6b45] hover:underline">
            View all →
          </Link>
        </div>
        <div className="divide-y divide-black/5">
          {loading && <p className="px-5 py-8 text-sm text-[#1a3d42]/50">Loading...</p>}
          {!loading && recent.length === 0 && (
            <p className="px-5 py-8 text-sm text-[#1a3d42]/50">No cards yet. Create your first digital card.</p>
          )}
          {recent.map((row) => (
            <div key={row.card.id} className="flex items-center gap-4 px-5 py-4">
              <img
                src={row.card.logoUrl || row.card.photoUrl || '/logos/swahili-systems.svg'}
                alt=""
                className="h-11 w-11 rounded-lg object-cover border border-black/5"
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#1a3d42] truncate">{row.card.fullName}</p>
                <p className="text-sm text-[#1a3d42]/50 truncate">
                  {row.card.title} · {row.card.location || 'Tanzania'}
                </p>
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-[#0d7377]">{row.card.phone || '—'}</p>
                <p className="text-xs text-[#1a3d42]/40">{row.tags?.length || 0} NFC tag(s)</p>
              </div>
              <button
                type="button"
                onClick={() => setEditId(row.card.id)}
                className="rounded-md border border-black/10 px-3 py-2 text-sm font-medium text-[#1a3d42] hover:bg-[#f7f4ef]"
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      </section>

      <EditCardDialog
        open={Boolean(editId)}
        cardId={editId}
        onClose={() => setEditId(null)}
        onSaved={refresh}
      />
    </div>
  );
};

export default AdminDashboard;

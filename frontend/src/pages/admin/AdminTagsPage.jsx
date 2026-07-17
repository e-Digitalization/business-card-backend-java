import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import EditCardDialog from './EditCardDialog.jsx';

const AdminTagsPage = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);

  const fetchCards = () => {
    api.get('/api/admin/cards').then((response) => setCards(response.data.data || []));
  };

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

  const rows = useMemo(() => {
    const list = [];
    cards.forEach((item) => {
      (item.tags || []).forEach((tag) => {
        list.push({
          tag,
          card: item.card
        });
      });
    });
    return list;
  }, [cards]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-[#1a3d42]/55">
            Physical NFC tap codes linked to digital business cards
          </p>
        </div>
        <Link
          to="/admin/cards"
          className="rounded-md bg-[#9a6b45] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#865c3b]"
        >
          Assign from Cards
        </Link>
      </div>

      <div className="admin-panel overflow-hidden">
        <div className="hidden border-b border-black/5 px-5 py-3 text-xs uppercase tracking-[0.12em] text-[#1a3d42]/45 sm:grid sm:grid-cols-[1.2fr_1fr_0.8fr_auto] sm:gap-3">
          <span>NFC Tag</span>
          <span>Digital Card</span>
          <span>Status</span>
          <span />
        </div>

        {loading && <p className="px-5 py-8 text-sm text-[#1a3d42]/50">Loading NFC tags...</p>}
        {!loading && rows.length === 0 && (
          <p className="px-5 py-8 text-sm text-[#1a3d42]/50">
            No NFC tags yet. Open a digital card and assign a tag code.
          </p>
        )}

        <div className="divide-y divide-black/5">
          {rows.map(({ tag, card }) => (
            <div
              key={tag.id}
              className="grid grid-cols-1 gap-2 px-5 py-4 sm:grid-cols-[1.2fr_1fr_0.8fr_auto] sm:items-center sm:gap-3"
            >
              <div>
                <p className="font-semibold text-[#1a3d42]">{tag.tagCode}</p>
                <p className="text-xs text-[#1a3d42]/40">Tap URL: /c/{tag.tagCode}</p>
              </div>
              <div>
                <p className="font-medium text-[#1a3d42]">{card.fullName}</p>
                <p className="text-xs text-[#1a3d42]/45">{card.phone || '—'}</p>
              </div>
              <div>
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                    tag.active
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {tag.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEditId(card.id)}
                className="justify-self-start rounded-md border border-black/10 px-3 py-2 text-sm font-medium text-[#1a3d42] hover:bg-[#f7f4ef] sm:justify-self-end"
              >
                Manage
              </button>
            </div>
          ))}
        </div>
      </div>

      <EditCardDialog
        open={Boolean(editId)}
        cardId={editId}
        onClose={() => setEditId(null)}
        onSaved={fetchCards}
      />
    </div>
  );
};

export default AdminTagsPage;

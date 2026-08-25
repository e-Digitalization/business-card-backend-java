import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api.js';
import ProfileAvatar from '../../components/ProfileAvatar.jsx';
import NfcPrintModal from '../../components/NfcPrintModal.jsx';
import { cardToPrintContact } from '../../utils/nfcPrintDocument.js';

const AdminCardDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [printOpen, setPrintOpen] = useState(false);
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tagCode, setTagCode] = useState('');
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteResult, setInviteResult] = useState(null);
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/api/admin/cards/${id}`);
      setPayload(res.data.data || null);
    } catch {
      setError('Could not load this card.');
      setPayload(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const card = payload?.card;
  const tags = payload?.tags || [];
  const account = payload?.account || {};

  const onAssignTag = async (e) => {
    e.preventDefault();
    if (!tagCode.trim()) return;
    setMessage('');
    try {
      await api.post(`/api/admin/cards/${id}/tag`, { tagCode: tagCode.trim() });
      setTagCode('');
      setMessage('NFC tag linked.');
      await load();
    } catch {
      setError('Could not link that NFC tag. It may already be in use.');
    }
  };

  const onDeactivateTag = async (tagId) => {
    await api.put(`/api/admin/tags/${tagId}/deactivate`);
    await load();
  };

  const onInvite = async () => {
    setInviteBusy(true);
    setError('');
    setInviteResult(null);
    try {
      const res = await api.post(`/api/admin/cards/${id}/invite`);
      setInviteResult(res.data.data || null);
      setMessage('Invite OTP created — share it with the card owner.');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.detail || 'Could not create invite.');
    } finally {
      setInviteBusy(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-[#1a3d42]/50">Loading profile…</p>;
  }

  if (!card) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-rose-600">{error || 'Card not found.'}</p>
        <Link to="/admin/cards" className="text-sm font-semibold text-[#0d7377]">
          ← Back to cards
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate('/admin/cards')}
          className="text-sm font-medium text-[#0d7377] hover:underline"
        >
          ← All cards
        </button>
        <div className="flex flex-wrap gap-2">
          <a
            href={`/u/${card.slug}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-black/10 px-3.5 py-2 text-sm font-medium text-[#1a3d42]"
          >
            Open public card
          </a>
          <button
            type="button"
            onClick={() => setPrintOpen(true)}
            className="rounded-md border border-black/10 px-3.5 py-2 text-sm font-medium text-[#1a3d42]"
          >
            Print card
          </button>
          <Link
            to={`/admin/cards?edit=${card.publicId}`}
            className="rounded-md bg-[#9a6b45] px-3.5 py-2 text-sm font-semibold text-white"
            onClick={(e) => {
              e.preventDefault();
              navigate('/admin/cards', { state: { editId: card.publicId } });
            }}
          >
            Edit details
          </Link>
        </div>
      </div>

      {error && (
        <p className="rounded-md border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>
      )}
      {message && (
        <p className="rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {message}
        </p>
      )}

      <section className="overflow-hidden rounded-xl border border-black/5 bg-white shadow-[0_12px_40px_rgba(26,61,66,0.06)]">
        <div className="relative h-36 bg-gradient-to-br from-[#0d7377] via-[#1a3d42] to-[#0a5f63]">
          <div className="absolute inset-0 opacity-40"
            style={{
              background:
                'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.2), transparent 45%), radial-gradient(circle at 80% 70%, rgba(232,145,58,0.25), transparent 40%)'
            }}
          />
        </div>
        <div className="relative px-5 pb-6 sm:px-7">
          <ProfileAvatar
            name={card.fullName}
            photoUrl={card.photoUrl}
            logoUrl={card.logoUrl}
            className="-mt-12 h-24 w-24 rounded-2xl border-4 border-white shadow-md"
            textClassName="text-2xl"
          />
          <div className="mt-4 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-semibold text-[#1a3d42] sm:text-3xl">
                {card.fullName}
              </h1>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  card.active ? 'bg-emerald-50 text-emerald-700' : 'bg-[#f3eee7] text-[#1a3d42]/55'
                }`}
              >
                {card.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="mt-1 text-sm text-[#1a3d42]/60">
              {card.title || 'Professional'}
              {card.company ? ` · ${card.company}` : ''}
            </p>
            <p className="mt-1 text-xs text-[#1a3d42]/45">
              /u/{card.slug} · {card.location || 'Tanzania'}
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ['Phone', card.phone],
              ['Email', card.email],
              ['WhatsApp', card.whatsapp],
              ['Website', card.website],
              ['LinkedIn', card.linkedin],
              ['Company', card.company]
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-black/5 bg-[#f7f4ef] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9a6b45]">{label}</p>
                <p className="mt-1 break-all text-sm font-medium text-[#1a3d42]">{value || '—'}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="admin-panel p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9a6b45]">Credentials</p>
          <h2 className="mt-1 font-display text-xl font-semibold text-[#1a3d42]">Login access</h2>
          <p className="mt-2 text-sm text-[#1a3d42]/55">
            Admin-created cards start without a password. Send an OTP so the owner can claim the card and set
            credentials.
          </p>

          <div className="mt-4 space-y-2 rounded-lg border border-black/5 bg-[#f7f4ef] px-4 py-3 text-sm">
            <p>
              <span className="text-[#1a3d42]/50">Account: </span>
              {account.hasAccount ? (
                <span className="font-medium text-[#1a3d42]">{account.accountEmail}</span>
              ) : (
                <span className="text-[#1a3d42]/55">Not linked yet</span>
              )}
            </p>
            <p>
              <span className="text-[#1a3d42]/50">Password: </span>
              {account.passwordSet ? (
                <span className="font-medium text-emerald-700">Set</span>
              ) : (
                <span className="font-medium text-[#9a6b45]">Pending claim</span>
              )}
            </p>
            <p>
              <span className="text-[#1a3d42]/50">Invite: </span>
              {account.invitePending ? (
                <span className="font-medium text-[#0d7377]">OTP active</span>
              ) : (
                <span className="text-[#1a3d42]/55">None</span>
              )}
            </p>
          </div>

          <button
            type="button"
            disabled={inviteBusy || !card.email || account.passwordSet}
            onClick={onInvite}
            className="mt-4 rounded-md bg-[#0d7377] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {inviteBusy ? 'Creating OTP…' : account.passwordSet ? 'Already claimed' : 'Send invite OTP'}
          </button>
          {!card.email && (
            <p className="mt-2 text-xs text-rose-600">Add an email on the card before inviting.</p>
          )}

          {inviteResult?.otp && (
            <div className="mt-4 rounded-lg border border-[#0d7377]/20 bg-[#e8f4f4] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0d7377]">Share this OTP</p>
              <p className="mt-2 font-display text-3xl font-semibold tracking-[0.2em] text-[#1a3d42]">
                {inviteResult.otp}
              </p>
              <p className="mt-2 text-sm text-[#1a3d42]/65">
                Email: <strong>{inviteResult.email}</strong>
              </p>
              <p className="mt-1 text-xs text-[#1a3d42]/50">
                Owner opens <code className="rounded bg-white px-1">/claim</code>, enters email + OTP, sets a
                password. Expires in 24 hours.
              </p>
              <a
                href={inviteResult.claimPath || `/claim?email=${encodeURIComponent(inviteResult.email || '')}`}
                className="mt-3 inline-flex text-sm font-semibold text-[#0d7377] hover:underline"
              >
                Open claim page →
              </a>
            </div>
          )}
        </section>

        <section className="admin-panel p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9a6b45]">NFC card</p>
          <h2 className="mt-1 font-display text-xl font-semibold text-[#1a3d42]">Link physical tag</h2>
          <p className="mt-2 text-sm text-[#1a3d42]/55">
            Assign the code programmed on the NFC chip. Taps at <code>/c/TAG-CODE</code> open this profile.
          </p>

          <form onSubmit={onAssignTag} className="mt-4 flex flex-wrap gap-2">
            <input
              value={tagCode}
              onChange={(e) => setTagCode(e.target.value)}
              placeholder="e.g. TAG-NEEMA"
              className="admin-input min-w-[180px] flex-1"
            />
            <button
              type="submit"
              className="rounded-md bg-[#0d7377] px-4 py-2.5 text-sm font-semibold text-white"
            >
              Link NFC
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {tags.length === 0 ? (
              <p className="text-sm text-[#1a3d42]/45">No NFC tags linked yet.</p>
            ) : (
              tags.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  title={t.active ? 'Click to deactivate' : 'Inactive'}
                  onClick={() => t.active && onDeactivateTag(t.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    t.active
                      ? 'bg-[#0d7377]/10 text-[#0d7377] hover:bg-rose-50 hover:text-rose-600'
                      : 'border border-black/10 text-[#1a3d42]/40'
                  }`}
                >
                  {t.tagCode}
                  {t.active ? '' : ' (off)'}
                </button>
              ))
            )}
          </div>

          {tags.some((t) => t.active) && (
            <div className="mt-5 rounded-xl border border-black/5 bg-[#1a3d42] p-4 text-white">
              <p className="text-[10px] uppercase tracking-[0.16em] text-white/50">Tap URL</p>
              <p className="mt-1 font-mono text-sm">
                /c/{tags.find((t) => t.active)?.tagCode}
              </p>
              <p className="mt-2 text-xs text-white/55">→ redirects to /u/{card.slug}</p>
            </div>
          )}
        </section>
      </div>

      {printOpen && (
        <NfcPrintModal contact={cardToPrintContact(card)} onClose={() => setPrintOpen(false)} />
      )}
    </div>
  );
};

export default AdminCardDetailPage;

import React, { useEffect, useState } from 'react';
import api from '../../services/api.js';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import { notify } from '../../utils/toast.js';

const emptyCreate = { username: '', password: '' };

const formatDate = (value) => {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
};

const AdminUsersPage = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreate);
  const [createBusy, setCreateBusy] = useState(false);
  const [createError, setCreateError] = useState('');

  const [resetTarget, setResetTarget] = useState(null);
  const [resetValue, setResetValue] = useState('');
  const [resetBusy, setResetBusy] = useState(false);
  const [resetError, setResetError] = useState('');

  const [confirm, setConfirm] = useState(null); // { admin, action: 'deactivate' | 'activate' | 'delete' }
  const [confirmBusy, setConfirmBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/admin-users');
      setAdmins(res.data.data || []);
    } catch {
      notify.error('Could not load admin accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateBusy(true);
    try {
      await api.post('/api/admin/admin-users', createForm);
      notify.success('Admin account created.');
      setCreateForm(emptyCreate);
      setShowCreate(false);
      await load();
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Could not create admin account.');
    } finally {
      setCreateBusy(false);
    }
  };

  const onResetPassword = async (e) => {
    e.preventDefault();
    if (!resetTarget) return;
    setResetError('');
    setResetBusy(true);
    try {
      await api.post(`/api/admin/admin-users/${resetTarget.id}/reset-password`, { newPassword: resetValue });
      notify.success(`Password reset for ${resetTarget.username}.`);
      setResetTarget(null);
      setResetValue('');
    } catch (err) {
      setResetError(err.response?.data?.message || 'Could not reset password.');
    } finally {
      setResetBusy(false);
    }
  };

  const runConfirm = async () => {
    if (!confirm) return;
    const { admin, action } = confirm;
    setConfirmBusy(true);
    try {
      if (action === 'delete') {
        await api.delete(`/api/admin/admin-users/${admin.id}`);
        notify.success(`${admin.username} removed.`);
      } else {
        await api.put(`/api/admin/admin-users/${admin.id}/active`, { active: action === 'activate' });
        notify.success(action === 'activate' ? `${admin.username} re-enabled.` : `${admin.username} deactivated.`);
      }
      setConfirm(null);
      await load();
    } catch (err) {
      notify.error(err.response?.data?.message || 'Could not complete that action.');
    } finally {
      setConfirmBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="max-w-xl text-sm text-[#1a3d42]/55">
          Accounts that can sign in to this admin panel. Deactivating or removing one blocks that login
          immediately.
        </p>
        <button
          type="button"
          onClick={() => setShowCreate((v) => !v)}
          className="rounded-md bg-[#9a6b45] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#865c3b]"
        >
          {showCreate ? 'Close' : '+ Add admin'}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={onCreate} className="admin-panel space-y-3 p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm text-[#1a3d42]/70">Username</span>
              <input
                value={createForm.username}
                onChange={(e) => setCreateForm((f) => ({ ...f, username: e.target.value }))}
                className="admin-input"
                required
                autoFocus
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-[#1a3d42]/70">Password</span>
              <input
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
                className="admin-input"
                minLength={6}
                required
              />
            </label>
          </div>
          {createError && <p className="text-sm text-rose-600">{createError}</p>}
          <button
            type="submit"
            disabled={createBusy}
            className="rounded-md bg-[#0d7377] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {createBusy ? 'Creating…' : 'Create admin'}
          </button>
        </form>
      )}

      <section className="admin-panel overflow-hidden">
        <div className="hidden border-b border-black/5 px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#1a3d42]/40 sm:grid sm:grid-cols-[1.4fr_1fr_1fr_auto] sm:gap-3">
          <span>Username</span>
          <span>Status</span>
          <span>Created</span>
          <span className="text-right">Action</span>
        </div>

        {loading && <p className="px-5 py-10 text-sm text-[#1a3d42]/50">Loading admins…</p>}
        {!loading && admins.length === 0 && (
          <p className="px-5 py-10 text-sm text-[#1a3d42]/50">No admin accounts found.</p>
        )}

        <div className="divide-y divide-black/5">
          {admins.map((admin) => (
            <div
              key={admin.id}
              className="grid gap-2 px-5 py-4 sm:grid-cols-[1.4fr_1fr_1fr_auto] sm:items-center sm:gap-3"
            >
              <p className="font-semibold text-[#1a3d42]">{admin.username}</p>
              <span
                className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${
                  admin.active ? 'bg-emerald-50 text-emerald-700' : 'bg-[#f3eee7] text-[#1a3d42]/55'
                }`}
              >
                {admin.active ? 'Active' : 'Deactivated'}
              </span>
              <p className="text-sm text-[#1a3d42]/55">{formatDate(admin.createdAt)}</p>
              <div className="flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setResetTarget(admin);
                    setResetValue('');
                    setResetError('');
                  }}
                  className="rounded-md border border-black/10 px-3 py-2 text-sm font-medium text-[#1a3d42] hover:bg-[#f7f4ef]"
                >
                  Reset password
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setConfirm({ admin, action: admin.active ? 'deactivate' : 'activate' })
                  }
                  className="rounded-md border border-black/10 px-3 py-2 text-sm font-medium text-[#1a3d42] hover:bg-[#f7f4ef]"
                >
                  {admin.active ? 'Deactivate' : 'Re-enable'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirm({ admin, action: 'delete' })}
                  className="rounded-md border border-rose-200 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {resetTarget && (
        <div className="km-confirm-overlay" role="dialog" aria-modal="true">
          <button
            type="button"
            className="km-confirm-backdrop"
            aria-label="Dismiss"
            disabled={resetBusy}
            onClick={() => !resetBusy && setResetTarget(null)}
          />
          <div className="km-confirm-panel">
            <h2 className="font-display text-xl font-semibold text-[#1a3d42]">
              Reset password for {resetTarget.username}
            </h2>
            <form onSubmit={onResetPassword} className="mt-4 space-y-3">
              <label className="block">
                <span className="mb-1 block text-sm text-[#1a3d42]/70">New password</span>
                <input
                  type="password"
                  value={resetValue}
                  onChange={(e) => setResetValue(e.target.value)}
                  className="admin-input"
                  minLength={6}
                  required
                  autoFocus
                />
              </label>
              {resetError && <p className="text-sm text-rose-600">{resetError}</p>}
              <div className="flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  disabled={resetBusy}
                  onClick={() => setResetTarget(null)}
                  className="rounded-md border border-black/10 px-3.5 py-2 text-sm font-medium text-[#1a3d42] disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetBusy}
                  className="rounded-md bg-[#0d7377] px-3.5 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {resetBusy ? 'Saving…' : 'Reset password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirm)}
        title={
          confirm?.action === 'delete'
            ? `Delete ${confirm.admin.username}?`
            : confirm?.action === 'deactivate'
              ? `Deactivate ${confirm.admin.username}?`
              : `Re-enable ${confirm?.admin?.username}?`
        }
        message={
          confirm?.action === 'delete'
            ? 'This permanently removes the account. This cannot be undone.'
            : confirm?.action === 'deactivate'
              ? 'They will be signed out and unable to log in until re-enabled.'
              : 'They will be able to log in again.'
        }
        confirmLabel={
          confirm?.action === 'delete' ? 'Delete' : confirm?.action === 'deactivate' ? 'Deactivate' : 'Re-enable'
        }
        danger={confirm?.action !== 'activate'}
        busy={confirmBusy}
        onCancel={() => !confirmBusy && setConfirm(null)}
        onConfirm={runConfirm}
      />
    </div>
  );
};

export default AdminUsersPage;

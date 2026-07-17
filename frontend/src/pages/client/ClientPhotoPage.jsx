import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import { initialsFromName, resolveMediaUrl } from '../../utils/media.js';
import { ClientWorkspaceContext } from './ClientLayout.jsx';

const ClientPhotoPage = () => {
  const { user, card, setCard, refresh } = useContext(ClientWorkspaceContext);
  const fileRef = useRef(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [photoFailed, setPhotoFailed] = useState(false);

  const rawPhoto = card?.photoUrl || user?.pictureUrl || '';
  const photo = resolveMediaUrl(rawPhoto);
  const initials = initialsFromName(card?.fullName || user?.fullName);
  const showPhoto = Boolean(photo) && !photoFailed;

  useEffect(() => {
    setPhotoFailed(false);
  }, [rawPhoto]);

  const useGooglePhoto = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const response = await api.post('/api/client/me/card/use-google-photo');
      setCard(response.data.data);
      await refresh();
      setMessage('Google profile photo applied to your Kadi Moja card.');
    } catch (err) {
      setError(err.response?.data?.message || 'No Google photo available. Sign in with Google first.');
    } finally {
      setLoading(false);
    }
  };

  const onUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      const response = await api.post('/api/client/me/card/photo', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setCard(response.data.data);
      await refresh();
      setMessage('Photo uploaded.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not upload photo.');
    } finally {
      setLoading(false);
      event.target.value = '';
    }
  };

  const clearPhoto = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const response = await api.delete('/api/client/me/card/photo');
      setCard(response.data.data);
      await refresh();
      setMessage('Photo removed. Initials will show on your profile.');
    } catch {
      setError('Could not remove photo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.14em] text-[#9a6b45]">Profile photo</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-[#1a3d42]">Your card photo</h1>
        <p className="mt-1 text-sm text-[#1a3d42]/55">
          Upload a photo, or keep initials ({initials}) on your public profile.
        </p>
      </div>

      <section className="client-panel flex flex-col items-center gap-5 p-8 sm:flex-row sm:items-start">
        {showPhoto ? (
          <img
            src={photo}
            alt=""
            className="h-36 w-36 rounded-full border border-black/5 object-cover"
            onError={() => setPhotoFailed(true)}
          />
        ) : (
          <div className="flex h-36 w-36 items-center justify-center rounded-full bg-[#0d7377] text-3xl font-bold tracking-wide text-white">
            {initials}
          </div>
        )}
        <div className="flex-1 text-center sm:text-left">
          <p className="font-semibold text-[#1a3d42]">{user?.fullName}</p>
          <p className="text-sm text-[#1a3d42]/50">{user?.email}</p>
          <p className="mt-2 text-sm text-[#1a3d42]/55">
            {user?.hasGoogle
              ? 'Google account connected. You can sync your Google picture anytime.'
              : 'Upload a photo from your device, or sign in with Google to sync one.'}
          </p>

          <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={loading}
              className="rounded-md bg-[#0d7377] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0a5f63] disabled:opacity-60"
            >
              {loading ? 'Working…' : 'Upload photo'}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={onUpload}
            />
            {user?.hasGoogle && (
              <button
                type="button"
                onClick={useGooglePhoto}
                disabled={loading}
                className="rounded-md bg-[#9a6b45] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#865c3b] disabled:opacity-60"
              >
                Use Google photo
              </button>
            )}
            {card?.photoUrl && (
              <button
                type="button"
                onClick={clearPhoto}
                disabled={loading}
                className="rounded-md border border-black/10 px-4 py-2.5 text-sm font-medium text-[#1a3d42] disabled:opacity-60"
              >
                Use initials
              </button>
            )}
            <Link
              to="/me/card"
              className="rounded-md border border-black/10 px-4 py-2.5 text-sm font-medium text-[#1a3d42]"
            >
              Edit card
            </Link>
          </div>

          {message && (
            <p className="mt-4 rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {message}
            </p>
          )}
          {error && (
            <p className="mt-4 rounded-md border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-600">
              {error}
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default ClientPhotoPage;

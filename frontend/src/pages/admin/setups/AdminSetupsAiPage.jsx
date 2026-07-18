import React, { useEffect, useState } from 'react';
import { StatusPill, useAdminSetups } from './useAdminSetups.jsx';

const AdminSetupsAiPage = () => {
  const { loading, saving, error, message, setups, load, save, clearKey } = useAdminSetups();

  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [openaiModel, setOpenaiModel] = useState('gpt-4o-mini');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [geminiModel, setGeminiModel] = useState('gemini-2.0-flash');
  const [googleClientId, setGoogleClientId] = useState('');
  const frontendGoogleId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  useEffect(() => {
    if (!setups) return;
    setOpenaiModel(setups.openai?.model || 'gpt-4o-mini');
    setGeminiModel(setups.gemini?.model || 'gemini-2.0-flash');
    setGoogleClientId(setups.google?.clientId || '');
    setOpenaiApiKey('');
    setGeminiApiKey('');
  }, [setups]);

  const onSave = async (e) => {
    e.preventDefault();
    const body = {
      openaiModel: openaiModel.trim() || null,
      geminiModel: geminiModel.trim() || null,
      googleClientId: googleClientId.trim() || null
    };
    if (openaiApiKey.trim()) body.openaiApiKey = openaiApiKey.trim();
    if (geminiApiKey.trim()) body.geminiApiKey = geminiApiKey.trim();
    await save(body, 'AI & Google setups saved. Changes apply immediately.');
  };

  if (loading) {
    return <p className="text-sm text-[#1a3d42]/50">Loading setups…</p>;
  }

  const openai = setups?.openai || {};
  const gemini = setups?.gemini || {};
  const google = setups?.google || {};
  const scan = setups?.scan || {};

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <p className="text-sm text-[#1a3d42]/55">
        OpenAI / Gemini power AI card scan. Google Client ID powers Sign in with Google.
      </p>

      {error && (
        <p className="rounded-md border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>
      )}
      {message && (
        <p className="rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {message}
        </p>
      )}

      <section className="admin-panel p-5">
        <div className="flex flex-wrap gap-3">
          <div className="rounded-lg border border-black/5 bg-[#f7f4ef] px-4 py-3">
            <p className="text-xs text-[#1a3d42]/50">AI scan</p>
            <div className="mt-2 flex items-center gap-2">
              <StatusPill ok={scan.enabled} label={scan.enabled ? 'On' : 'Off'} />
              <span className="text-sm text-[#1a3d42]">{scan.activeProvider || 'none'}</span>
            </div>
          </div>
          <div className="rounded-lg border border-black/5 bg-[#f7f4ef] px-4 py-3">
            <p className="text-xs text-[#1a3d42]/50">Google OAuth</p>
            <div className="mt-2">
              <StatusPill ok={google.configured} label={google.configured ? 'Configured' : 'Missing'} />
            </div>
          </div>
        </div>
      </section>

      <form onSubmit={onSave} className="space-y-5">
        <section className="admin-panel space-y-4 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9a6b45]">OpenAI</p>
            <h2 className="mt-1 font-display text-lg font-semibold text-[#1a3d42]">AI business-card scan</h2>
            <p className="mt-1 text-sm text-[#1a3d42]/50">
              Current key: <code className="text-xs">{openai.maskedKey || 'not set'}</code>
            </p>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[#1a3d42]/70">API key (leave blank to keep)</span>
            <input
              type="password"
              value={openaiApiKey}
              onChange={(e) => setOpenaiApiKey(e.target.value)}
              placeholder="sk-proj-…"
              className="admin-input"
              autoComplete="off"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[#1a3d42]/70">Model</span>
            <input
              value={openaiModel}
              onChange={(e) => setOpenaiModel(e.target.value)}
              className="admin-input"
              placeholder="gpt-4o-mini"
            />
          </label>
          {openai.source === 'database' && (
            <button
              type="button"
              disabled={saving}
              onClick={() => clearKey('clearOpenaiApiKey')}
              className="text-sm font-medium text-rose-600 hover:underline"
            >
              Clear DB OpenAI key (fall back to .env)
            </button>
          )}
        </section>

        <section className="admin-panel space-y-4 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9a6b45]">Gemini (optional)</p>
            <h2 className="mt-1 font-display text-lg font-semibold text-[#1a3d42]">Fallback AI provider</h2>
            <p className="mt-1 text-sm text-[#1a3d42]/50">
              Used only if OpenAI is not set. Current:{' '}
              <code className="text-xs">{gemini.maskedKey || 'not set'}</code>
            </p>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[#1a3d42]/70">API key (leave blank to keep)</span>
            <input
              type="password"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              className="admin-input"
              autoComplete="off"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[#1a3d42]/70">Model</span>
            <input value={geminiModel} onChange={(e) => setGeminiModel(e.target.value)} className="admin-input" />
          </label>
          {gemini.source === 'database' && (
            <button
              type="button"
              disabled={saving}
              onClick={() => clearKey('clearGeminiApiKey')}
              className="text-sm font-medium text-rose-600 hover:underline"
            >
              Clear DB Gemini key
            </button>
          )}
        </section>

        <section className="admin-panel space-y-4 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9a6b45]">Google OAuth</p>
            <h2 className="mt-1 font-display text-lg font-semibold text-[#1a3d42]">Client login with Google</h2>
            <p className="mt-1 text-sm text-[#1a3d42]/50">
              Frontend build env:{' '}
              <code className="text-xs">
                {frontendGoogleId ? maskValue(frontendGoogleId) : 'VITE_GOOGLE_CLIENT_ID not set'}
              </code>
            </p>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[#1a3d42]/70">Google Client ID</span>
            <input
              value={googleClientId}
              onChange={(e) => setGoogleClientId(e.target.value)}
              className="admin-input"
              placeholder="xxxxx.apps.googleusercontent.com"
            />
          </label>
          {google.source === 'database' && (
            <button
              type="button"
              disabled={saving}
              onClick={() => clearKey('clearGoogleClientId')}
              className="text-sm font-medium text-rose-600 hover:underline"
            >
              Clear DB Client ID (fall back to .env)
            </button>
          )}
        </section>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={load}
            className="rounded-md border border-black/10 px-4 py-2.5 text-sm font-medium text-[#1a3d42]"
          >
            Reset form
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-[#0d7377] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save AI & Google'}
          </button>
        </div>
      </form>
    </div>
  );
};

function maskValue(value) {
  if (!value || value.length < 12) return '••••';
  return `${value.slice(0, 10)}…${value.slice(-6)}`;
}

export default AdminSetupsAiPage;

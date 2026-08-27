import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './styles/index.css';
import MuiThemeProvider from './components/MuiThemeProvider.jsx';
import AppSplash from './components/AppSplash.jsx';

const envGoogleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const Bootstrap = () => {
  const [clientId, setClientId] = useState(envGoogleClientId);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 5000);
    fetch(`${apiBase}/api/auth/google/status`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const fromApi = data?.clientId || '';
        if (fromApi) setClientId(fromApi);
      })
      .catch(() => {
        /* keep env fallback */
      })
      .finally(() => {
        window.clearTimeout(timeout);
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  if (!ready) {
    return <AppSplash message="Preparing your experience" />;
  }

  const tree = (
    <MuiThemeProvider>
      <BrowserRouter>
        <App />
        <Toaster position="top-right" reverseOrder={false} />
      </BrowserRouter>
    </MuiThemeProvider>
  );

  return clientId ? <GoogleOAuthProvider clientId={clientId}>{tree}</GoogleOAuthProvider> : tree;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Bootstrap />
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* installability is a bonus, not a hard requirement */
    });
  });
}

import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.jsx';
import './styles/index.css';
import MuiThemeProvider from './components/MuiThemeProvider.jsx';

const envGoogleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const Bootstrap = () => {
  const [clientId, setClientId] = useState(envGoogleClientId);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`${apiBase}/api/auth/google/status`)
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
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return null;
  }

  const tree = (
    <MuiThemeProvider>
      <BrowserRouter>
        <App />
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

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.jsx';
import './styles/index.css';
import MuiThemeProvider from './components/MuiThemeProvider.jsx';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const root = (
  <MuiThemeProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </MuiThemeProvider>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {googleClientId ? (
      <GoogleOAuthProvider clientId={googleClientId}>{root}</GoogleOAuthProvider>
    ) : (
      root
    )}
  </React.StrictMode>
);

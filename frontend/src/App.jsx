import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ProfilePage from './pages/ProfilePage.jsx';
import RedirectPage from './pages/RedirectPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ClientLayout from './pages/client/ClientLayout.jsx';
import ClientDashboardHome from './pages/client/ClientDashboardHome.jsx';
import ClientCardPage from './pages/client/ClientCardPage.jsx';
import ClientSharePage from './pages/client/ClientSharePage.jsx';
import ClientPhotoPage from './pages/client/ClientPhotoPage.jsx';
import ClientContactsPage from './pages/client/ClientContactsPage.jsx';
import ClientPreviewsPage from './pages/client/ClientPreviewsPage.jsx';
import NotFound from './pages/NotFound.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ClientProtectedRoute from './components/ClientProtectedRoute.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
import HomePage from './pages/HomePage.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminCardsPage from './pages/admin/AdminCardsPage.jsx';
import AdminCreateCardPage from './pages/admin/AdminCreateCardPage.jsx';
import AdminTagsPage from './pages/admin/AdminTagsPage.jsx';
import AdminNfcRequestsPage from './pages/admin/AdminNfcRequestsPage.jsx';

const AppShell = () => {
  const { pathname } = useLocation();
  const showThemeToggle =
    !pathname.startsWith('/admin') &&
    !pathname.startsWith('/me') &&
    !pathname.startsWith('/u/') &&
    pathname !== '/' &&
    pathname !== '/login';

  return (
    <>
      {showThemeToggle && <ThemeToggle />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/u/:slug" element={<ProfilePage />} />
        <Route path="/c/:tagCode" element={<RedirectPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<Navigate to="/login" replace state={{ mode: 'signup' }} />} />
        <Route path="/admin/login" element={<Navigate to="/login" replace state={{ role: 'admin' }} />} />
        <Route
          path="/me"
          element={
            <ClientProtectedRoute>
              <ClientLayout />
            </ClientProtectedRoute>
          }
        >
          <Route index element={<ClientDashboardHome />} />
          <Route path="card" element={<ClientCardPage />} />
          <Route path="share" element={<ClientSharePage />} />
          <Route path="photo" element={<ClientPhotoPage />} />
          <Route path="contacts" element={<ClientContactsPage />} />
          <Route path="looks" element={<ClientPreviewsPage />} />
        </Route>
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="cards" element={<AdminCardsPage />} />
          <Route path="cards/new" element={<AdminCreateCardPage />} />
          <Route path="cards/:id/edit" element={<Navigate to="/admin/cards" replace />} />
          <Route path="tags" element={<AdminTagsPage />} />
          <Route path="nfc-requests" element={<AdminNfcRequestsPage />} />
        </Route>
        <Route path="/not-found" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => <AppShell />;

export default App;

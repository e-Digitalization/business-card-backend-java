import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ClientProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem('clientToken');
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
};

export default ClientProtectedRoute;

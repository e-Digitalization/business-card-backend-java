import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

const RedirectPage = () => {
  const { tagCode } = useParams();

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    window.location.href = `${baseUrl}/c/${tagCode}`;
  }, [tagCode]);

  return (
    <div className="min-h-screen flex items-center justify-center text-slate-900 dark:text-white sdt-page relative overflow-hidden">
      <div className="absolute inset-0 gradient-ring opacity-70" />
      <div className="relative">Redirecting...</div>
    </div>
  );
};

export default RedirectPage;

import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center sdt-page text-slate-900 dark:text-white px-4 relative overflow-hidden">
      <div className="absolute inset-0 gradient-ring opacity-70" />
      <div className="relative text-center space-y-4">
        <h1 className="text-3xl font-semibold">Page not found</h1>
        <p className="text-slate-600 dark:text-slate-300">The card you are looking for does not exist.</p>
        <Link
          to="/"
          className="inline-block px-5 py-2 rounded-full bg-gradient-to-r from-sdtBlue via-sdtOrange to-sdtGreen"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

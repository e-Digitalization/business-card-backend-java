import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

/**
 * NFC / sample taps land here (/c/:tagCode), then bounce through the API
 * which redirects to the frontend profile (/u/:slug).
 */
const RedirectPage = () => {
  const { tagCode } = useParams();

  useEffect(() => {
    const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');
    window.location.replace(`${baseUrl}/c/${encodeURIComponent(tagCode)}`);
  }, [tagCode]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f4ef] text-[#1a3d42]/60">
      Opening digital card…
    </div>
  );
};

export default RedirectPage;

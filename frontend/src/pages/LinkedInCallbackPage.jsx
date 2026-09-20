import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api.js';
import { consumeLinkedInState, linkedinRedirectUri } from '../utils/linkedin.js';
import { notify } from '../utils/toast.jsx';

const LinkedInCallbackPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const started = useRef(false);

  useEffect(() => {
    // The code is single-use; guard against React StrictMode's double effect.
    if (started.current) return;
    started.current = true;

    const fail = (message) => {
      setError(message);
      notify.error(message);
    };

    if (params.get('error')) {
      fail(params.get('error') === 'user_cancelled_login' ? 'LinkedIn sign-in was cancelled.' : 'LinkedIn sign-in failed.');
      return;
    }
    const next = consumeLinkedInState(params.get('state'));
    const code = params.get('code');
    if (!code || next === null) {
      fail('LinkedIn sign-in could not be verified. Please try again.');
      return;
    }

    api
      .post('/api/auth/linkedin', { code, redirectUri: linkedinRedirectUri() })
      .then((res) => {
        localStorage.setItem('clientToken', res.data.token);
        localStorage.setItem('clientUser', JSON.stringify(res.data.user || {}));
        notify.success('Signed in with LinkedIn.');
        navigate(next, { replace: true });
      })
      .catch((err) => fail(err.response?.data?.message || 'LinkedIn sign-in failed.'));
  }, [params, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f4ef] px-5">
      <div className="text-center">
        {error ? (
          <>
            <p className="text-sm text-rose-600">{error}</p>
            <Link to="/login" className="mt-4 inline-block text-sm font-semibold text-[#9a6b45]">
              Back to sign in
            </Link>
          </>
        ) : (
          <p className="text-sm text-[#1a3d42]/60">Signing you in with LinkedIn…</p>
        )}
      </div>
    </div>
  );
};

export default LinkedInCallbackPage;

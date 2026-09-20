const STATE_KEY = 'linkedinOAuthState';

export const linkedinRedirectUri = () => `${window.location.origin}/auth/linkedin/callback`;

// Sends the browser to LinkedIn's consent screen (OpenID Connect, authorization-code flow).
export const startLinkedInLogin = (clientId, next = '/me') => {
  const state = crypto.randomUUID();
  try {
    sessionStorage.setItem(STATE_KEY, JSON.stringify({ state, next }));
  } catch {
    /* storage blocked — callback will reject the missing state */
  }
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: linkedinRedirectUri(),
    state,
    scope: 'openid profile email'
  });
  window.location.href = `https://www.linkedin.com/oauth/v2/authorization?${params}`;
};

// Returns the saved `next` path when `state` matches, otherwise null. One-time use.
export const consumeLinkedInState = (state) => {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STATE_KEY) || 'null');
    sessionStorage.removeItem(STATE_KEY);
    return saved && saved.state === state ? saved.next || '/me' : null;
  } catch {
    return null;
  }
};

export const safeExternalUrl = (value) => {
  const clean = String(value || '').trim();
  if (!clean) return null;
  const candidate = /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
  try {
    const url = new URL(candidate);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch {
    return null;
  }
};

export const youtubeVideoId = (value) => {
  const clean = String(value || '').trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) return clean;

  const url = safeExternalUrl(clean);
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');
    let id = null;

    if (host === 'youtu.be') id = parsed.pathname.split('/').filter(Boolean)[0];
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      id =
        parsed.searchParams.get('v') ||
        parsed.pathname.match(/^\/(?:shorts|embed)\/([a-zA-Z0-9_-]{11})/)?.[1];
    }

    return /^[a-zA-Z0-9_-]{11}$/.test(id || '') ? id : null;
  } catch {
    return null;
  }
};

export const youtubeVideoIds = (profile) =>
  [profile?.youtubeVideo1, profile?.youtubeVideo2, profile?.youtubeVideo3]
    .map(youtubeVideoId)
    .filter(Boolean);

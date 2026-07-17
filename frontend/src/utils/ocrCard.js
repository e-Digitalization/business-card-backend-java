/**
 * Preprocess card photos and parse Tesseract output into contact fields.
 */

const TITLE_RE =
  /\b(director|manager|founder|engineer|officer|consultant|ceo|cto|cfo|lead|specialist|architect|designer|developer|analyst|executive|president|partner|head of|coordinator|advisor|strategist|sales|marketing|product)\b/i;

const cleanLine = (line = '') =>
  line
    .replace(/[^\w\s@.+#&/'()-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const looksLikeGarbage = (line = '') => {
  const s = line.trim();
  if (s.length < 2) return true;
  if (/^[\W\d_]+$/.test(s)) return true;
  const letters = (s.match(/[A-Za-z]/g) || []).length;
  const junk = (s.match(/[^A-Za-z0-9\s@.+-]/g) || []).length;
  return letters < 2 || junk > letters;
};

const extractEmails = (text) => {
  const matches = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [];
  return [...new Set(matches.map((m) => m.toLowerCase()))];
};

const extractPhones = (text) => {
  const matches = text.match(/(?:\+?255[\s.-]*)?(?:0)?(?:7\d{2}|6\d{2})[\s.-]*\d{3}[\s.-]*\d{3,4}|\+?\d[\d\s().-]{8,}\d/g) || [];
  return [...new Set(matches.map((m) => m.replace(/\s+/g, ' ').trim()))];
};

const extractUrls = (text) => {
  const matches = text.match(/(?:https?:\/\/)?(?:www\.)?[a-z0-9][-a-z0-9.]+\.[a-z]{2,}(?:\/\S*)?/gi) || [];
  return [...new Set(matches.filter((u) => !u.includes('@')).map((u) => u.replace(/[),.;]+$/, '')))];
};

export const preprocessCardImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const maxSide = 1800;
        let { width, height } = img;
        const scale = Math.min(2.2, maxSide / Math.max(width, height));
        width = Math.round(width * Math.max(scale, 1));
        height = Math.round(height * Math.max(scale, 1));

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const imageData = ctx.getImageData(0, 0, width, height);
        const { data } = imageData;
        for (let i = 0; i < data.length; i += 4) {
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          const contrasted = Math.min(255, Math.max(0, (gray - 128) * 1.35 + 128));
          const bw = contrasted > 165 ? 255 : contrasted < 90 ? 0 : contrasted;
          data[i] = data[i + 1] = data[i + 2] = bw;
        }
        ctx.putImageData(imageData, 0, 0);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            if (!blob) reject(new Error('Could not process image'));
            else resolve(blob);
          },
          'image/png',
          1
        );
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not load image'));
    };
    img.src = url;
  });

export const parseBusinessCardText = (rawText = '') => {
  const text = rawText.replace(/\r/g, '\n');
  const lines = text
    .split(/\n+/)
    .map(cleanLine)
    .filter((l) => l && !looksLikeGarbage(l));

  const emails = extractEmails(text);
  const phones = extractPhones(text);
  const urls = extractUrls(text);

  const skip = new Set(
    [...emails, ...phones, ...urls].map((v) => v.toLowerCase())
  );

  const candidates = lines.filter((l) => {
    const lower = l.toLowerCase();
    return (
      !skip.has(lower) &&
      !/@/.test(l) &&
      !/www\.|https?:/i.test(l) &&
      !/^\+?\d[\d\s().-]{6,}$/.test(l) &&
      l.length >= 3 &&
      l.length <= 70
    );
  });

  const nameLine =
    candidates.find((l) => {
      const words = l.split(/\s+/);
      return (
        words.length >= 2 &&
        words.length <= 5 &&
        !TITLE_RE.test(l) &&
        words.every((w) => /^[A-Za-z][A-Za-z'.-]*$/.test(w))
      );
    }) ||
    candidates.find((l) => /^[A-Za-z][A-Za-z'.-]*(?:\s+[A-Za-z][A-Za-z'.-]*){0,3}$/.test(l)) ||
    '';

  const titleLine =
    candidates.find((l) => l !== nameLine && TITLE_RE.test(l)) || '';

  const companyLine =
    candidates.find((l) => {
      if (l === nameLine || l === titleLine) return false;
      return (
        /\b(ltd|limited|llc|inc|corp|company|systems|studio|group|co\.|plc|bank|agency)\b/i.test(l) ||
        (l === l.toUpperCase() && l.length > 3 && l.length < 40)
      );
    }) || '';

  return {
    fullName: nameLine,
    title: titleLine,
    company: companyLine,
    phone: phones[0] || '',
    email: emails[0] || '',
    website: urls[0] || '',
    location: candidates.find((l) => /\b(tanzania|dar|arusha|mwanza|dodoma|zanzibar|nairobi|kampala)\b/i.test(l)) || '',
    notes: text.slice(0, 800),
    rawText: text
  };
};

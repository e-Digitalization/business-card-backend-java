// Profile categories a card can belong to (several at once). Keep ids in sync
// with CardProfileValidator.ALLOWED_CATEGORIES on the backend.
export const CARD_CATEGORIES = [
  { id: 'researcher', label: 'Researcher', hint: 'Publications, citations and h-index' },
  { id: 'banker', label: 'Banker', hint: 'Banner, services and institution details' },
  { id: 'government', label: 'Government', hint: 'Coming soon' }
];

export const categoryLabel = (id) => CARD_CATEGORIES.find((c) => c.id === id)?.label || id;

export const parseCategories = (value) =>
  String(value || '')
    .split(',')
    .map((id) => id.trim().toLowerCase())
    .filter((id) => CARD_CATEGORIES.some((c) => c.id === id));

export const hasCategory = (profile, id) => parseCategories(profile?.categories).includes(id);

export const toggleCategory = (value, id) => {
  const current = parseCategories(value);
  const next = current.includes(id) ? current.filter((c) => c !== id) : [...current, id];
  return next.join(',');
};

// --- Researcher data -------------------------------------------------------
// Stored on the card as one JSON string (researcherData):
// { scholarUrl, interests, sinceYear,
//   metrics: { citations, citationsSince, hIndex, hIndexSince, i10Index, i10IndexSince },
//   citationsByYear: [{ year, count }],
//   publications: [{ title, authors, venue, year, citedBy, url }] }

export const emptyResearcher = () => ({
  scholarUrl: '',
  interests: '',
  sinceYear: '',
  metrics: {
    citations: '',
    citationsSince: '',
    hIndex: '',
    hIndexSince: '',
    i10Index: '',
    i10IndexSince: ''
  },
  citationsByYear: [],
  publications: []
});

export const parseResearcher = (json) => {
  const base = emptyResearcher();
  if (!json) return base;
  try {
    const data = typeof json === 'string' ? JSON.parse(json) : json;
    if (!data || typeof data !== 'object') return base;
    return {
      ...base,
      ...data,
      metrics: { ...base.metrics, ...(data.metrics || {}) },
      citationsByYear: Array.isArray(data.citationsByYear) ? data.citationsByYear : [],
      publications: Array.isArray(data.publications) ? data.publications : []
    };
  } catch {
    return base;
  }
};

export const serializeResearcher = (data) => JSON.stringify(data);

const num = (value) => {
  const n = Number(String(value ?? '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) && String(value ?? '').trim() !== '' ? n : null;
};

// Drops blank rows / values so the public card only renders real content.
export const cleanResearcher = (json) => {
  const data = parseResearcher(json);
  const metrics = data.metrics;
  const metricRows = [
    ['Citations', metrics.citations, metrics.citationsSince],
    ['h-index', metrics.hIndex, metrics.hIndexSince],
    ['i10-index', metrics.i10Index, metrics.i10IndexSince]
  ].filter(([, all, since]) => String(all).trim() || String(since).trim());

  const byYear = data.citationsByYear
    .map((row) => ({ year: String(row.year || '').trim(), count: num(row.count) }))
    .filter((row) => row.year && row.count !== null)
    .sort((a, b) => a.year.localeCompare(b.year));

  const publications = data.publications
    .map((p) => ({
      title: String(p.title || '').trim(),
      authors: String(p.authors || '').trim(),
      venue: String(p.venue || '').trim(),
      year: String(p.year || '').trim(),
      citedBy: String(p.citedBy ?? '').trim(),
      url: String(p.url || '').trim()
    }))
    .filter((p) => p.title);

  const interests = String(data.interests || '')
    .split(/[,\n]+/)
    .map((i) => i.trim())
    .filter(Boolean);

  return {
    scholarUrl: String(data.scholarUrl || '').trim(),
    sinceYear: String(data.sinceYear || '').trim(),
    interests,
    metricRows,
    byYear,
    publications,
    isEmpty: !metricRows.length && !byYear.length && !publications.length && !interests.length
  };
};

// Fictional example used by the "Load sample" button and the /demo/researcher page.
export const SAMPLE_RESEARCHER = {
  scholarUrl: 'https://scholar.google.com/',
  interests: 'Software quality, Health informatics, AI in Education, GIS',
  sinceYear: '2021',
  metrics: {
    citations: '255',
    citationsSince: '132',
    hIndex: '8',
    hIndexSince: '5',
    i10Index: '8',
    i10IndexSince: '2'
  },
  citationsByYear: [
    { year: '2019', count: 12 },
    { year: '2020', count: 19 },
    { year: '2021', count: 9 },
    { year: '2022', count: 9 },
    { year: '2023', count: 15 },
    { year: '2024', count: 38 },
    { year: '2025', count: 40 },
    { year: '2026', count: 22 }
  ],
  publications: [
    {
      title: 'An efficient LoRa-enabled smart fault detection and monitoring platform for the power distribution system',
      authors: 'A Musa, R Mrema, D Hanyurwimfura',
      venue: 'IEEE Access 10, 73403-73420',
      year: '2022',
      citedBy: '73',
      url: ''
    },
    {
      title: 'Opportunities and challenges of open source software integration in developing countries: case of the health sector',
      authors: 'A Musa, Y Sheikh, B Sultan',
      venue: 'Journal of Health Informatics in Developing Countries 6 (2)',
      year: '2012',
      citedBy: '35',
      url: ''
    },
    {
      title: 'Implementation of ICTs in Health and Management Information Systems',
      authors: 'F Igira, B Abubakar, JH Lungo, ...',
      venue: '',
      year: '2007',
      citedBy: '31',
      url: ''
    },
    {
      title: 'Review on "maintainability" metrics in open source software',
      authors: 'A Musa, ABM Sultan, H Zulzalil',
      venue: 'International Review on Computers and Software 7 (3)',
      year: '2012',
      citedBy: '21',
      url: ''
    },
    {
      title: 'Introduction of ICT subject in primary education: challenges and opportunities',
      authors: 'A Musa, MM Ali',
      venue: 'Social Sciences & Humanities Open 8 (1)',
      year: '2023',
      citedBy: '12',
      url: ''
    },
    {
      title: 'Predicting maintainability of object-oriented software using metric thresholds',
      authors: 'A Musa, A Sultan, H Zulzalil',
      venue: 'Information Technology Journal 13 (8)',
      year: '2014',
      citedBy: '11',
      url: ''
    }
  ]
};

export const SAMPLE_PROFILE = {
  fullName: 'Dr. Amina Musa',
  title: 'Associate Professor, Computer Science',
  company: 'State University of Zanzibar',
  location: 'Zanzibar, Tanzania',
  email: 'amina.musa@example.ac.tz',
  phone: '+255 700 000 000',
  website: 'https://example.ac.tz',
  categories: 'researcher',
  researcherData: JSON.stringify(SAMPLE_RESEARCHER)
};

// --- Banker data -----------------------------------------------------------
// Stored on the card as one JSON string (bankerData):
// { bannerUrl, institution, branch, department, specialties, regulator,
//   services: [{ title, description }] }

export const emptyBanker = () => ({
  bannerUrl: '',
  institution: '',
  branch: '',
  department: '',
  specialties: '',
  regulator: '',
  services: []
});

export const parseBanker = (json) => {
  const base = emptyBanker();
  if (!json) return base;
  try {
    const data = typeof json === 'string' ? JSON.parse(json) : json;
    if (!data || typeof data !== 'object') return base;
    return { ...base, ...data, services: Array.isArray(data.services) ? data.services : [] };
  } catch {
    return base;
  }
};

export const serializeBanker = (data) => JSON.stringify(data);

// Drops blank rows so the public card only renders real content.
export const cleanBanker = (json) => {
  const data = parseBanker(json);
  const text = (v) => String(v || '').trim();
  const services = data.services
    .map((s) => ({ title: text(s.title), description: text(s.description) }))
    .filter((s) => s.title);
  const specialties = text(data.specialties)
    .split(/[|,\n]+/)
    .map((t) => t.trim())
    .filter(Boolean);
  const out = {
    bannerUrl: text(data.bannerUrl),
    institution: text(data.institution),
    branch: text(data.branch),
    department: text(data.department),
    regulator: text(data.regulator),
    specialties,
    services
  };
  out.hasProfile = Boolean(
    out.bannerUrl || out.institution || out.branch || out.department || specialties.length
  );
  out.isEmpty = !out.hasProfile && !services.length && !out.regulator;
  return out;
};

export const SAMPLE_BANKER = {
  bannerUrl: '',
  institution: 'Tanzania Commercial Bank',
  branch: 'Dar es Salaam, Corporate Branch',
  department: 'SME & Corporate Banking',
  specialties: 'Strategy | Partnerships | SME Growth',
  regulator: 'Regulated by the Bank of Tanzania',
  services: [
    { title: 'SME Business Loans', description: 'Working capital and asset finance tailored to growing businesses.' },
    { title: 'Corporate Accounts', description: 'Multi-currency accounts, payroll and trade finance.' },
    { title: 'Mobile & Agency Banking', description: 'Collect and pay anywhere with wallet and agent integrations.' },
    { title: 'Advisory', description: 'Financial planning and partnership structuring.' }
  ]
};

export const SAMPLE_BANKER_PROFILE = {
  fullName: 'Neema Kileo',
  title: 'Director, SME Banking',
  company: 'Tanzania Commercial Bank',
  location: 'Dar es Salaam, Tanzania',
  email: 'neema.kileo@example.co.tz',
  phone: '+255 700 111 222',
  categories: 'banker',
  bankerData: JSON.stringify(SAMPLE_BANKER)
};

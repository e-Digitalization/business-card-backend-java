// Profile categories a card can belong to (several at once). Keep ids in sync
// with CardProfileValidator.ALLOWED_CATEGORIES on the backend.
export const CARD_CATEGORIES = [
  { id: 'researcher', label: 'Researcher', hint: 'Publications, citations and h-index' },
  { id: 'banker', label: 'Banker', hint: 'Banner, services and institution details' },
  { id: 'government', label: 'Government', hint: 'Banners, mandate and initiatives' }
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

// --- Shared helpers for banner / event / ad lists -------------------------

const text = (v) => String(v || '').trim();

const demoAsset = (name) => `${typeof window !== 'undefined' ? window.location.origin : ''}/demo/${name}`;

// Event dates are stored as ISO "YYYY-MM-DD" (from a date input) but free text is tolerated.
export const parseEventDate = (value) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text(value));
  if (!m) return null;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12));
  return Number.isNaN(d.getTime()) ? null : d;
};

export const formatEventDate = (value) => {
  const d = parseEventDate(value);
  if (!d) return text(value);
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(d);
};

// "Thursday, 5 November 2026" for the details sheet; falls back to the raw text.
export const formatEventDateLong = (value) => {
  const d = parseEventDate(value);
  if (!d) return text(value);
  return new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);
};

export const isUpcomingEvent = (value) => {
  const d = parseEventDate(value);
  if (!d) return false;
  const now = new Date();
  return d.getTime() >= Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
};

const parseJsonObject = (json) => {
  if (!json) return null;
  try {
    const data = typeof json === 'string' ? JSON.parse(json) : json;
    return data && typeof data === 'object' ? data : null;
  } catch {
    return null;
  }
};

const asArray = (v) => (Array.isArray(v) ? v : []);

// --- Banker data -----------------------------------------------------------
// Stored on the card as one JSON string (bankerData):
// { institution, branch, department, specialties, regulator,
//   banners: [{ imageUrl, title, linkUrl }]      // featured poster ads (portrait), auto-sliding
//   smallAds: [{ imageUrl, title, description, linkUrl }]
//   services: [{ title, description }] }

export const emptyBanker = () => ({
  institution: '',
  branch: '',
  department: '',
  specialties: '',
  regulator: '',
  banners: [],
  smallAds: [],
  services: []
});

export const parseBanker = (json) => {
  const base = emptyBanker();
  const data = parseJsonObject(json);
  if (!data) return base;
  return { ...base, ...data, banners: asArray(data.banners), smallAds: asArray(data.smallAds), services: asArray(data.services) };
};

export const serializeBanker = (data) => JSON.stringify(data);

// Drops blank rows so the public card only renders real content.
export const cleanBanker = (json) => {
  const data = parseBanker(json);
  let posters = data.banners
    .map((b) => ({ imageUrl: text(b?.imageUrl), title: text(b?.title || b?.caption), linkUrl: text(b?.linkUrl) }))
    .filter((b) => b.imageUrl);
  // A single legacy bannerUrl becomes one poster when no list was saved.
  if (!posters.length && text(data.bannerUrl)) posters = [{ imageUrl: text(data.bannerUrl), title: '', linkUrl: '' }];
  const smallAds = data.smallAds
    .map((a) => ({ imageUrl: text(a?.imageUrl), title: text(a?.title), description: text(a?.description), linkUrl: text(a?.linkUrl) }))
    .filter((a) => a.title || a.imageUrl);
  const services = data.services
    .map((x) => ({ title: text(x?.title), description: text(x?.description) }))
    .filter((x) => x.title);
  const specialties = text(data.specialties)
    .split(/[|,\n]+/)
    .map((t) => t.trim())
    .filter(Boolean);
  const out = {
    institution: text(data.institution),
    branch: text(data.branch),
    department: text(data.department),
    regulator: text(data.regulator),
    specialties,
    posters,
    smallAds,
    services
  };
  out.hasFacts = Boolean(out.institution || out.branch || out.department || specialties.length);
  out.hasInfo = Boolean(out.hasFacts || services.length || out.regulator);
  out.hasAds = Boolean(posters.length || smallAds.length);
  out.isEmpty = !out.hasFacts && !out.hasAds && !services.length && !out.regulator;
  return out;
};

export const SAMPLE_BANKER = {
  institution: 'Sample Commercial Bank',
  branch: 'Dar es Salaam, Corporate Branch',
  department: 'SME & Corporate Banking',
  specialties: 'Strategy | Partnerships | SME Growth',
  regulator: 'Regulated by the Bank of Tanzania',
  banners: [
    { imageUrl: demoAsset('ad-1.svg'), title: 'Instant payments on internet banking and mobile app', linkUrl: '' },
    { imageUrl: demoAsset('ad-2.svg'), title: 'Book flights with our card and save up to $200', linkUrl: '' },
    { imageUrl: demoAsset('ad-3.svg'), title: 'SME business loans — approval in 48 hours', linkUrl: '' }
  ],
  smallAds: [
    { imageUrl: demoAsset('ad-s1.svg'), title: 'Fixed deposit 12%', description: 'Earn more on 12-month deposits.', linkUrl: '' },
    { imageUrl: demoAsset('ad-s2.svg'), title: 'Corporate cards', description: 'Zero fees for the first year.', linkUrl: '' },
    { imageUrl: demoAsset('ad-s3.svg'), title: 'Mobile banking', description: 'Bank from any phone, 24/7.', linkUrl: '' },
    { imageUrl: demoAsset('ad-s4.svg'), title: 'Home loans', description: 'Flexible terms up to 20 years.', linkUrl: '' }
  ],
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
  company: 'Sample Commercial Bank',
  location: 'Dar es Salaam, Tanzania',
  email: 'neema.kileo@example.co.tz',
  phone: '+255 700 111 222',
  categories: 'banker',
  theme: 'midnight',
  bankerData: JSON.stringify(SAMPLE_BANKER)
};

// --- Government data -------------------------------------------------------
// Stored on the card as one JSON string (governmentData):
// { institution, department, mandate,
//   events: [{ imageUrl, title, date, venue, description, linkUrl }],
//   initiatives: [{ title, description }] }

export const emptyGovernment = () => ({ institution: '', department: '', mandate: '', events: [], initiatives: [] });

export const parseGovernment = (json) => {
  const base = emptyGovernment();
  const data = parseJsonObject(json);
  if (!data) return base;
  return { ...base, ...data, events: asArray(data.events), initiatives: asArray(data.initiatives) };
};

export const serializeGovernment = (data) => JSON.stringify(data);

export const cleanGovernment = (json) => {
  const data = parseGovernment(json);
  // Early drafts stored plain banners ({ imageUrl, caption }); show them as events.
  const legacy = asArray(data.banners).map((b) => ({ imageUrl: b?.imageUrl, description: b?.caption, linkUrl: b?.linkUrl }));
  const events = [...data.events, ...(data.events.length ? [] : legacy)]
    .map((e) => ({
      imageUrl: text(e?.imageUrl),
      title: text(e?.title),
      date: text(e?.date),
      venue: text(e?.venue),
      description: text(e?.description),
      linkUrl: text(e?.linkUrl)
    }))
    .filter((e) => e.title || e.imageUrl);
  const out = {
    institution: text(data.institution),
    department: text(data.department),
    mandate: text(data.mandate),
    events,
    initiatives: data.initiatives
      .map((i) => ({ title: text(i?.title), description: text(i?.description) }))
      .filter((i) => i.title)
  };
  out.hasFacts = Boolean(out.institution || out.department);
  out.hasEvents = events.length > 0;
  out.hasOffice = Boolean(out.hasFacts || out.mandate || out.initiatives.length);
  out.isEmpty = !out.hasFacts && !out.hasEvents && !out.hasOffice;
  return out;
};

export const SAMPLE_GOVERNMENT = {
  institution: 'Ministry of Finance',
  department: 'Office of the Permanent Secretary',
  mandate:
    'Formulates and oversees national fiscal, monetary and investment policy to drive inclusive economic growth and attract strategic partnerships.',
  events: [
    {
      imageUrl: demoAsset('gov-1.svg'),
      title: 'Tanzania Strategic Investment & Partnership Forum',
      date: '2026-11-05',
      venue: 'London, United Kingdom',
      description:
        'Waziri wa Fedha akizungumza wakati wa Mkutano wa Kimkakati wa Uwekezaji na Ushirikiano wa Tanzania uliowakutanisha viongozi wakuu wa taasisi kubwa za kifedha duniani, sekta ya bima na vihatarishi, ulioandaliwa na Wizara ya Fedha kwa kushirikiana na Standard Bank, Jijini London nchini Uingereza.',
      linkUrl: ''
    },
    {
      imageUrl: demoAsset('gov-2.svg'),
      title: 'National Budget 2026/27 briefing',
      date: '2026-09-12',
      venue: 'Dodoma',
      description: 'Priorities for infrastructure, agriculture and digital services, with a Q&A for development partners.',
      linkUrl: ''
    },
    {
      imageUrl: demoAsset('gov-3.svg'),
      title: 'Public–private partnership pipeline launch',
      date: '2026-08-20',
      venue: 'Dar es Salaam',
      description: 'Investors were briefed on the new PPP project pipeline, procurement steps and incentives.',
      linkUrl: ''
    },
    {
      imageUrl: '',
      title: 'Annual Development Partners Meeting',
      date: 'Q1 2027',
      venue: 'To be announced',
      description: 'Date to be confirmed. Partners will review progress on the national development priorities.',
      linkUrl: ''
    }
  ],
  initiatives: [
    { title: 'Investment & Partnerships', description: 'Facilitating PPP projects and foreign direct investment.' },
    { title: 'Public Finance Management', description: 'Transparent budgeting, revenue and expenditure oversight.' },
    { title: 'Financial Inclusion', description: 'Expanding access to banking, insurance and capital markets.' }
  ]
};

export const SAMPLE_GOVERNMENT_PROFILE = {
  fullName: 'Hon. Amani Mwakyusa',
  title: 'Permanent Secretary',
  company: 'Ministry of Finance',
  location: 'Dodoma, Tanzania',
  email: 'ps@example.go.tz',
  phone: '+255 700 333 444',
  categories: 'government',
  youtubeVideos: 'aqz-KE-bpKQ\nYE7VzlLtp-4',
  governmentData: JSON.stringify(SAMPLE_GOVERNMENT)
};

// Card with every category, to show that the bottom bar stays at 3 tabs.
export const SAMPLE_MULTI_PROFILE = {
  ...SAMPLE_GOVERNMENT_PROFILE,
  fullName: 'Dr. Neema Mushi',
  title: 'Director, Policy & Research',
  categories: 'government,banker,researcher',
  bankerData: JSON.stringify(SAMPLE_BANKER),
  researcherData: JSON.stringify(SAMPLE_RESEARCHER)
};

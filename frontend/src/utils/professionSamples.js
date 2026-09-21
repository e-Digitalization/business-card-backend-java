// All identities, institutions, metrics and programmes here are illustrative.
const office = (institution, department, mandate, initiatives, events = []) => JSON.stringify({
  institution, department, mandate,
  initiatives: initiatives.map(([title, description]) => ({ title, description })),
  events: events.map(([title, venue, description]) => ({ title, venue, description, date: 'Sample event', imageUrl: '', linkUrl: '' }))
});
const identity = (fullName, title, company, location, email, primaryColor, accentColor) => ({
  fullName, title, company, location, email, theme: 'custom', primaryColor, accentColor
});

export const PROFESSION_SAMPLES = [
  {
    id: 'academia', label: 'Academia', short: 'Research that travels with you.',
    description: 'Introduce your expertise with publications, research interests, citation metrics, and a clear academic identity.',
    features: ['Research interests', 'Citations & h-index', 'Selected publications'],
    previewTitle: 'Research at a glance',
    highlights: [['186', 'Citations'], ['7', 'h-index'], ['5', 'i10-index']],
    details: ['Climate resilience', 'Coastal ecosystems', 'Environmental data'],
    profile: {
      ...identity('Dr. Zawadi Mollel', 'Senior Lecturer, Environmental Science', 'Coastal Research University', 'Zanzibar, Tanzania', 'zawadi@coastal.example', '#634579', '#d2b47f'),
      categories: 'researcher',
      researcherData: JSON.stringify({
        interests: 'Climate resilience, Coastal ecosystems, Environmental data', sinceYear: '2021',
        metrics: { citations: '186', citationsSince: '144', hIndex: '7', hIndexSince: '6', i10Index: '5', i10IndexSince: '4' },
        citationsByYear: [{ year: '2021', count: 18 }, { year: '2022', count: 24 }, { year: '2023', count: 27 }, { year: '2024', count: 32 }, { year: '2025', count: 43 }],
        publications: [
          { title: 'Community-led coastal resilience: a participatory approach', authors: 'Z. Mollel, E. Mtei', venue: 'Illustrative research publication', year: '2025', citedBy: '43' },
          { title: 'Mapping mangrove restoration with open environmental data', authors: 'Z. Mollel, H. Kweka', venue: 'Illustrative research publication', year: '2024', citedBy: '32' },
          { title: 'Local knowledge and climate adaptation in island communities', authors: 'Z. Mollel', venue: 'Illustrative research publication', year: '2023', citedBy: '27' }
        ]
      })
    }
  },
  {
    id: 'banking', label: 'Banking', short: 'A more personal banking connection.',
    description: 'Put your branch, specialist services, and business expertise beside your contact details. Give every introduction a useful next step.',
    features: ['Branch & department', 'Banking services', 'Specialist expertise'],
    previewTitle: 'How I can help', details: ['Foreign exchange', 'Agribusiness accounts', 'Business banking'],
    profile: {
      ...identity('Neema Mwakalinga', 'Corporate Relationship Manager', 'Upendo Commercial Bank', 'Dar es Salaam, Tanzania', 'neema@upendobank.example', '#203c64', '#d4ac64'),
      categories: 'banker',
      bankerData: JSON.stringify({ institution: 'Upendo Commercial Bank', branch: 'Dar es Salaam · Business Centre', department: 'Corporate & SME Banking', specialties: 'Trade finance | Agribusiness | Business growth', banners: [], smallAds: [],
        services: [
          { title: 'Foreign Exchange', description: 'Discuss currency requirements and cross-border payments for your business.' },
          { title: 'Agribusiness Accounts', description: 'Explore account services for farmers, cooperatives, and agricultural enterprises.' },
          { title: 'Business Banking', description: 'Connect with a relationship manager about collections, payments, and working capital.' }
        ]
      })
    }
  },
  {
    id: 'government', label: 'Government', short: 'Public service. Clear communication.',
    description: 'Bring your office mandate, citizen services, and public initiatives together in a professional profile built for easy access.',
    features: ['Office & mandate', 'Public initiatives', 'Community events'],
    previewTitle: 'Public priorities', details: ['Digital public services', 'Community engagement', 'Open service information'],
    profile: {
      ...identity('Baraka Mtenzi', 'Director of Citizen Services', 'Public Service Office · Demo', 'Dodoma, Tanzania', 'baraka@publicservice.example', '#315a49', '#c4a15a'),
      categories: 'government',
      governmentData: office('Public Service Office · Demo', 'Citizen Services', 'Make public information easier to find and help residents connect with the right service team.', [
        ['Digital Public Services', 'Simplifying access to service guidance and application information.'],
        ['Community Engagement', 'Creating opportunities for residents to share feedback and local priorities.'],
        ['Service Transparency', 'Sharing office responsibilities, service standards, and useful contacts.']
      ], [['Community service forum', 'Dodoma · Demonstration event', 'An illustrative forum for residents to discuss service access.']])
    }
  },
  {
    id: 'diplomacy', label: 'Diplomats', short: 'An introduction without borders.',
    description: 'Share a diplomatic portfolio with a clear mission, cooperation priorities, and briefings for international partners.',
    features: ['Mission & portfolio', 'Bilateral cooperation', 'Delegation briefings'],
    previewTitle: 'Diplomatic portfolio', details: ['Economic cooperation', 'Cultural exchange', 'Partner engagement'],
    profile: {
      ...identity('Leila Mwinyi', 'Counsellor, Economic Cooperation', 'International Cooperation Mission · Demo', 'Geneva, Switzerland', 'leila@mission.example', '#3c355e', '#d7b779'),
      categories: 'government',
      governmentData: office('International Cooperation Mission · Demo', 'Economic & Cultural Affairs', 'Build relationships between institutions through dialogue, exchange, and shared opportunities.', [
        ['Economic Cooperation', 'Connecting delegations with relevant investment and trade counterparts.'],
        ['Cultural Exchange', 'Supporting educational, cultural, and people-to-people partnerships.'],
        ['Partner Engagement', 'Coordinating introductory meetings and information for visiting delegations.']
      ], [['Cooperation roundtable', 'Geneva · Demonstration event', 'An illustrative briefing for international partners and visiting delegations.']])
    }
  },
  {
    id: 'un', label: 'UN Organisations', short: 'Connect people around a shared mission.',
    description: 'Present a programme portfolio, focus areas, and coordination activities for a UN-style professional profile.',
    features: ['Programme portfolio', 'SDG focus areas', 'Partner coordination'],
    previewTitle: 'Programme focus', details: ['SDG 4 · Quality education', 'SDG 13 · Climate action', 'SDG 17 · Partnerships'],
    profile: {
      ...identity('Samuel Okello', 'Programme & Partnerships Officer', 'UN Programme Team · Illustrative', 'Nairobi, Kenya', 'samuel@programmes.example', '#176e9a', '#84cbdc'),
      categories: 'government',
      governmentData: office('UN Programme Team · Illustrative', 'Programmes & Partnerships', 'An illustrative programme profile showing how development professionals can present their work. Not an official UN profile or endorsement.', [
        ['Quality Education · SDG 4', 'Presenting education access and learning programme priorities.'],
        ['Climate Action · SDG 13', 'Sharing community resilience and climate adaptation focus areas.'],
        ['Partnerships · SDG 17', 'Connecting implementing partners and programme stakeholders.']
      ], [['Programme coordination workshop', 'Nairobi · Demonstration event', 'An illustrative workshop for sharing programme priorities and partnership opportunities.']])
    }
  }
];

export const sampleInitials = (name) => name.replace(/^Dr\.\s*/, '').split(/\s+/).map(part => part[0]).slice(0, 2).join('');

export function sampleVcard(profile) {
  const escape = value => String(value || '').replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
  return 'data:text/vcard;charset=utf-8,' + encodeURIComponent([
    'BEGIN:VCARD', 'VERSION:3.0', `FN:${escape(profile.fullName)}`, `N:;${escape(profile.fullName)};;;`, `ORG:${escape(profile.company)}`,
    `TITLE:${escape(profile.title)}`, `EMAIL:${escape(profile.email)}`, 'NOTE:Fictional Kadi Moja demonstration contact.', 'END:VCARD', ''
  ].join('\r\n'));
}

// All identities, institutions, metrics and programmes here are illustrative.
const demoAsset = name => `${typeof window !== 'undefined' ? window.location.origin : ''}/demo/${name}`;
const office = (institution, department, mandate, initiatives, events = []) => JSON.stringify({
  institution, department, mandate,
  initiatives: initiatives.map(([title, description]) => ({ title, description })),
  events: events.map(([title, venue, description, date, image = 'gov-1.svg']) => ({ title, venue, description, date, imageUrl: demoAsset(image), linkUrl: '' }))
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
      photoUrl: demoAsset('zawadi.png'), phone: '+255 700 000 101', website: 'https://coastal.example',
      bio: 'I work with coastal communities to turn environmental research into practical climate adaptation. My teaching and fieldwork connect marine ecology, open data, and local knowledge across the Western Indian Ocean.',
      expertise: ['Coastal resilience', 'Environmental GIS', 'Postgraduate supervision'],
      languages: ['Kiswahili', 'English'], officeHours: 'Tuesday & Thursday, 10:00–13:00 EAT',
      officeAddress: 'Marine Sciences Building, Stone Town, Zanzibar',
      qualifications: ['PhD in Environmental Science', 'MSc in Marine Ecology'],
      categories: 'researcher',
      researcherData: JSON.stringify({
        interests: 'Climate resilience, Coastal ecosystems, Environmental data', sinceYear: '2021',
        metrics: { citations: '186', citationsSince: '144', hIndex: '7', hIndexSince: '6', i10Index: '5', i10IndexSince: '4' },
        citationsByYear: [{ year: '2019', count: 19 }, { year: '2020', count: 23 }, { year: '2021', count: 18 }, { year: '2022', count: 24 }, { year: '2023', count: 27 }, { year: '2024', count: 32 }, { year: '2025', count: 43 }],
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
      photoUrl: demoAsset('neema.png'), phone: '+255 700 000 102', website: 'https://upendobank.example',
      bio: 'I help growing businesses organise their banking, manage cross-border payments, and plan their next stage of growth. My focus is long-term relationships with entrepreneurs, agricultural enterprises, and corporate teams.',
      expertise: ['SME relationships', 'Trade finance', 'Treasury services'],
      languages: ['Kiswahili', 'English'], officeHours: 'Monday–Friday, 09:00–16:00 EAT',
      officeAddress: 'Business Centre, Samora Avenue, Dar es Salaam',
      qualifications: ['MBA in Finance', 'BCom in Banking and Financial Services'],
      categories: 'banker',
      bankerData: JSON.stringify({ institution: 'Upendo Commercial Bank', branch: 'Dar es Salaam · Business Centre', department: 'Corporate & SME Banking', specialties: 'Trade finance | Agribusiness | Business growth', banners: [], smallAds: [
        { title: 'Business account review', description: 'A sample consultation covering collections, supplier payments, and payroll workflows.' },
        { title: 'Trade readiness session', description: 'An introduction to documentation, foreign exchange planning, and cross-border payment options.' },
        { title: 'Agribusiness connections', description: 'Relationship support for growers, cooperatives, processors, and distributors.' }
      ],
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
      photoUrl: demoAsset('baraka.png'), phone: '+255 700 000 103', website: 'https://publicservice.example',
      bio: 'I lead a citizen services team focused on making public information clear and accessible. My work brings together service teams, community representatives, and digital delivery specialists to improve everyday access to public services.',
      expertise: ['Service delivery', 'Community consultation', 'Digital inclusion'],
      languages: ['Kiswahili', 'English'], officeHours: 'Monday–Friday, 08:30–15:30 EAT',
      officeAddress: 'Citizen Services Centre, Dodoma',
      qualifications: ['Master of Public Administration', 'BA in Public Policy'],
      categories: 'government',
      governmentData: office('Public Service Office · Demo', 'Citizen Services', 'Make public information easier to find and help residents connect with the right service team.', [
        ['Digital Public Services', 'Simplifying access to service guidance and application information.'],
        ['Community Engagement', 'Creating opportunities for residents to share feedback and local priorities.'],
        ['Service Transparency', 'Sharing office responsibilities, service standards, and useful contacts.']
      ], [
        ['Community service forum', 'Citizen Services Centre, Dodoma', 'A sample public forum on service access. The programme includes a service information desk, community feedback session, and a discussion of accessible digital services.', '2026-11-12', 'gov-1.svg'],
        ['Digital access open day', 'Community Learning Centre, Dodoma', 'A demonstration workshop with guided service information sessions and practical support for residents using digital public services.', '2026-12-03', 'gov-2.svg']
      ])
    }
  },
  {
    id: 'diplomacy', label: 'Diplomats', short: 'An introduction without borders.',
    description: 'Share a diplomatic portfolio with a clear mission, cooperation priorities, and briefings for international partners.',
    features: ['Mission & portfolio', 'Bilateral cooperation', 'Delegation briefings'],
    previewTitle: 'Diplomatic portfolio', details: ['Economic cooperation', 'Cultural exchange', 'Partner engagement'],
    profile: {
      ...identity('Leila Mwinyi', 'Counsellor, Economic Cooperation', 'International Cooperation Mission · Demo', 'Geneva, Switzerland', 'leila@mission.example', '#3c355e', '#d7b779'),
      photoUrl: demoAsset('leila.png'), phone: '+41 00 000 00 04', website: 'https://mission.example',
      bio: 'I connect institutions through economic dialogue, cultural exchange, and practical cooperation. My portfolio includes partner briefings, delegation coordination, and relationships that support shared educational and commercial opportunities.',
      expertise: ['Economic diplomacy', 'Delegation coordination', 'Cultural partnerships'],
      languages: ['Kiswahili', 'English', 'French'], officeHours: 'Monday–Friday, 09:00–17:00 Europe/Zurich',
      officeAddress: 'Cooperation Mission, Geneva',
      qualifications: ['MA in International Relations', 'BA in Economics'],
      categories: 'government',
      governmentData: office('International Cooperation Mission · Demo', 'Economic & Cultural Affairs', 'Build relationships between institutions through dialogue, exchange, and shared opportunities.', [
        ['Economic Cooperation', 'Connecting delegations with relevant investment and trade counterparts.'],
        ['Cultural Exchange', 'Supporting educational, cultural, and people-to-people partnerships.'],
        ['Partner Engagement', 'Coordinating introductory meetings and information for visiting delegations.']
      ], [
        ['Cooperation roundtable', 'Partner Dialogue Centre, Geneva', 'A sample briefing for visiting delegations with sessions on economic cooperation, institutional introductions, and opportunities for joint programmes.', '2026-10-22', 'gov-3.svg'],
        ['Education & cultural exchange', 'International Exchange Hall, Geneva', 'An illustrative gathering of education and cultural partners to discuss exchange programmes, institutional collaboration, and upcoming delegation visits.', '2026-11-19', 'gov-1.svg']
      ])
    }
  },
  {
    id: 'un', label: 'UN Organisations', short: 'Connect people around a shared mission.',
    description: 'Present a programme portfolio, focus areas, and coordination activities for a UN-style professional profile.',
    features: ['Programme portfolio', 'SDG focus areas', 'Partner coordination'],
    previewTitle: 'Programme focus', details: ['SDG 4 · Quality education', 'SDG 13 · Climate action', 'SDG 17 · Partnerships'],
    profile: {
      ...identity('Samuel Okello', 'Programme & Partnerships Officer', 'UN Programme Team · Illustrative', 'Nairobi, Kenya', 'samuel@programmes.example', '#176e9a', '#84cbdc'),
      photoUrl: demoAsset('samuel.png'), phone: '+254 000 000 105', website: 'https://programmes.example',
      bio: 'I coordinate partnerships that connect education access, community resilience, and sustainable development. My work centres on listening to local organisations, aligning programme priorities, and sharing clear progress updates with partners.',
      expertise: ['Programme coordination', 'Monitoring & evaluation', 'Development partnerships'],
      languages: ['English', 'Kiswahili', 'Luo'], officeHours: 'Monday–Friday, 09:00–17:00 EAT',
      officeAddress: 'Programme Coordination Hub, Nairobi',
      qualifications: ['MA in Development Studies', 'BA in Sociology'],
      categories: 'government',
      governmentData: office('UN Programme Team · Illustrative', 'Programmes & Partnerships', 'An illustrative programme profile showing how development professionals can present their work. Not an official UN profile or endorsement.', [
        ['Quality Education · SDG 4', 'Presenting education access and learning programme priorities.'],
        ['Climate Action · SDG 13', 'Sharing community resilience and climate adaptation focus areas.'],
        ['Partnerships · SDG 17', 'Connecting implementing partners and programme stakeholders.']
      ], [
        ['Programme coordination workshop', 'Programme Coordination Hub, Nairobi', 'A sample workshop bringing implementing partners together to map education and climate priorities, review programme milestones, and agree on coordination actions.', '2026-11-05', 'gov-2.svg'],
        ['Community partnerships exchange', 'Community Learning Hub, Nairobi', 'An illustrative peer-learning session on community-led programme design, inclusive reporting, and sharing local lessons across partner organisations.', '2026-12-10', 'gov-3.svg']
      ])
    }
  }
];

export const sampleInitials = (name) => name.replace(/^Dr\.\s*/, '').split(/\s+/).map(part => part[0]).slice(0, 2).join('');

export function sampleVcard(profile) {
  const escape = value => String(value || '').replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
  return 'data:text/vcard;charset=utf-8,' + encodeURIComponent([
    'BEGIN:VCARD', 'VERSION:3.0', `FN:${escape(profile.fullName)}`, `N:;${escape(profile.fullName)};;;`, `ORG:${escape(profile.company)}`,
    `TITLE:${escape(profile.title)}`, `EMAIL:${escape(profile.email)}`,
    ...(profile.phone ? [`TEL:${escape(profile.phone)}`] : []),
    ...(profile.website ? [`URL:${escape(profile.website)}`] : []),
    ...(profile.officeAddress ? [`ADR:;;${escape(profile.officeAddress)};;;;`] : []),
    'NOTE:Fictional Kadi Moja demonstration contact. Contact details are not live.', 'END:VCARD', ''
  ].join('\r\n'));
}

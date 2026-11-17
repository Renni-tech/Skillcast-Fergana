// ─── Approved source catalogue (SkillCast Fergana) ─────────────────────────
// Only sources from the separately researched approved list. Nothing here is
// "live": three sources are retrieved periodically by the backend, the rest are
// linked references or planned integrations. Unknown facts stay unknown/null.
// Excluded on purpose: Greenhouse, Stripe, Cloudflare (careers or Radar),
// Arbeitnow, Ashby and obsolete Malaysian sources.

export type SourceScope = 'city' | 'district' | 'region' | 'valley' | 'national' | 'global' | 'globalRemote' | 'eu' | 'us';
export type SourceType = 'statistics' | 'api' | 'jobs' | 'portal' | 'report' | 'framework' | 'taxonomy' | 'course' | 'academic';
export type CatalogueStatus = 'periodic' | 'reference' | 'planned' | 'keyRequired';
export type SourceGroup = 'integrated' | 'uzbekistan' | 'global' | 'reports' | 'academic';
export type IntegratedId = 'siat' | 'worldbank' | 'remotive';

export interface ApprovedSource {
  id: string;
  name: string;
  publisher: string;
  url: string;
  docsUrl?: string;
  group: SourceGroup;
  scopes: SourceScope[];
  type: SourceType;
  tier: 1 | 2 | 3 | 4;
  status: CatalogueStatus;
  integratedId?: IntegratedId;
  /** i18n key under src.freq.*, or null when the publisher cadence is not verified. */
  updateFrequency: string | null;
  /** ISO date of the last confirmed publisher update; null when not verified. */
  lastUpdated: string | null;
  licence: 'unverified' | 'attribution';
}

export const APPROVED_SOURCES: ApprovedSource[] = [
  // Integrated (periodic, server-side retrieval)
  { id: 'siat', name: 'SIAT open-stat portal', publisher: 'National Statistics Committee of Uzbekistan', url: 'https://siat.stat.uz/data/1311/?lang=en', docsUrl: 'https://siat.stat.uz/data/4150/?lang=en', group: 'integrated', scopes: ['region', 'national'], type: 'statistics', tier: 1, status: 'periodic', integratedId: 'siat', updateFrequency: null, lastUpdated: null, licence: 'unverified' },
  { id: 'worldbank', name: 'World Bank Indicators API (v2)', publisher: 'World Bank', url: 'https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api', group: 'integrated', scopes: ['national'], type: 'api', tier: 2, status: 'periodic', integratedId: 'worldbank', updateFrequency: null, lastUpdated: null, licence: 'unverified' },
  { id: 'remotive', name: 'Remotive API', publisher: 'Remotive', url: 'https://remotive.com/remote-jobs/api', docsUrl: 'https://github.com/remotive-com/remote-jobs-api', group: 'integrated', scopes: ['globalRemote'], type: 'jobs', tier: 4, status: 'periodic', integratedId: 'remotive', updateFrequency: 'src.freq.remotive', lastUpdated: null, licence: 'attribution' },

  // Uzbekistan and Fergana references
  { id: 'dataegov', name: 'Open Data Portal of Uzbekistan', publisher: 'data.egov.uz', url: 'https://data.egov.uz', docsUrl: 'https://olddata.gov.uz/en/docs/do/view/usage', group: 'uzbekistan', scopes: ['national', 'region'], type: 'portal', tier: 1, status: 'keyRequired', updateFrequency: null, lastUpdated: null, licence: 'unverified' },
  { id: 'mehnat', name: 'Ministry of Employment and Poverty Reduction', publisher: 'gov.uz', url: 'https://gov.uz/en/bv', docsUrl: 'https://gov.uz/en/fargonatuman/news/view/234791', group: 'uzbekistan', scopes: ['national', 'district'], type: 'portal', tier: 1, status: 'reference', updateFrequency: null, lastUpdated: null, licence: 'unverified' },
  { id: 'ishmehnat', name: 'National vacancy database', publisher: 'ish.mehnat.uz', url: 'https://ish.mehnat.uz', docsUrl: 'https://dgov.uz/en/solution/detail/87/', group: 'uzbekistan', scopes: ['national'], type: 'jobs', tier: 1, status: 'reference', updateFrequency: null, lastUpdated: null, licence: 'unverified' },
  { id: 'civilservice', name: 'Civil-service vacancy portal', publisher: 'vacancy.gov.uz', url: 'https://vacancy.gov.uz', group: 'uzbekistan', scopes: ['national'], type: 'jobs', tier: 1, status: 'reference', updateFrequency: null, lastUpdated: null, licence: 'unverified' },
  { id: 'itpark', name: 'Uzbekistan Digital Inclusion (World Bank and IT Park)', publisher: 'IT Park Uzbekistan', url: 'https://www.it-park.uz/en', group: 'uzbekistan', scopes: ['national', 'region'], type: 'portal', tier: 2, status: 'reference', updateFrequency: null, lastUpdated: null, licence: 'unverified' },
  { id: 'undpvalley', name: 'UNDP Ferghana Valley project evaluation', publisher: 'UNDP', url: 'https://erc.undp.org/evaluation/documents/download/23514', group: 'uzbekistan', scopes: ['valley'], type: 'report', tier: 2, status: 'reference', updateFrequency: null, lastUpdated: null, licence: 'unverified' },

  // Global data (planned or key-gated)
  { id: 'ilostat', name: 'ILOSTAT', publisher: 'International Labour Organization', url: 'https://ilostat.ilo.org', docsUrl: 'https://webapps.ilo.org/ilostat-files/Documents/ILOSTAT_BulkDownload_Guidelines.pdf', group: 'global', scopes: ['global', 'national'], type: 'statistics', tier: 2, status: 'planned', updateFrequency: 'src.freq.weekly', lastUpdated: null, licence: 'unverified' },
  { id: 'uis', name: 'UNESCO Institute for Statistics (UIS)', publisher: 'UNESCO', url: 'https://databrowser.uis.unesco.org', docsUrl: 'https://uis.unesco.org/sites/default/files/documents/background-information-education-statistics-uis-database-en-2025.pdf', group: 'global', scopes: ['global', 'national'], type: 'statistics', tier: 2, status: 'planned', updateFrequency: null, lastUpdated: null, licence: 'unverified' },
  { id: 'sdg', name: 'UN SDG Global Database', publisher: 'UN Statistics Division', url: 'https://unstats.un.org/sdgs/indicators/database/', docsUrl: 'https://mdgs.un.org/sdgs/files/SDMX_SDG_API_MANUAL.pdf', group: 'global', scopes: ['global', 'national'], type: 'statistics', tier: 1, status: 'planned', updateFrequency: null, lastUpdated: null, licence: 'unverified' },
  { id: 'itu', name: 'ITU ICT skills statistics', publisher: 'International Telecommunication Union', url: 'https://www.itu.int/itu-d/reports/statistics/2024/11/10/ff24-ict-skills', group: 'global', scopes: ['global'], type: 'report', tier: 2, status: 'reference', updateFrequency: null, lastUpdated: null, licence: 'unverified' },
  { id: 'esco', name: 'ESCO skills and occupations', publisher: 'European Commission', url: 'https://esco.ec.europa.eu', docsUrl: 'https://esco.ec.europa.eu/en/use-esco/use-esco-services-api/esco-web-service-api', group: 'global', scopes: ['eu'], type: 'taxonomy', tier: 1, status: 'reference', updateFrequency: null, lastUpdated: null, licence: 'unverified' },
  { id: 'onet', name: 'O*NET Web Services', publisher: 'O*NET Resource Center', url: 'https://services.onetcenter.org', docsUrl: 'https://services.onetcenter.org/about', group: 'global', scopes: ['us'], type: 'taxonomy', tier: 1, status: 'keyRequired', updateFrequency: null, lastUpdated: null, licence: 'attribution' },
  { id: 'adzuna', name: 'Adzuna API', publisher: 'Adzuna', url: 'https://developer.adzuna.com', group: 'global', scopes: ['global'], type: 'jobs', tier: 4, status: 'keyRequired', updateFrequency: null, lastUpdated: null, licence: 'unverified' },

  // Static reports and frameworks (citation only)
  { id: 'wef', name: 'Future of Jobs Report 2025', publisher: 'World Economic Forum', url: 'https://www.weforum.org/publications/the-future-of-jobs-report-2025/', group: 'reports', scopes: ['global'], type: 'report', tier: 2, status: 'reference', updateFrequency: null, lastUpdated: null, licence: 'unverified' },
  { id: 'ilowp140', name: 'ILO Working Paper 140: GenAI occupational exposure', publisher: 'International Labour Organization', url: 'https://doi.org/10.54394/HETP0387', docsUrl: 'https://www.ilo.org/node/706766', group: 'reports', scopes: ['global'], type: 'report', tier: 2, status: 'reference', updateFrequency: null, lastUpdated: null, licence: 'unverified' },
  { id: 'unescoiite', name: 'ICT Skills Development in the Republic of Uzbekistan', publisher: 'UNESCO IITE', url: 'https://iite.unesco.org/wp-content/uploads/2025/10/ICT-Skills-Development-in-the-Republic-of-Uzbekistan.pdf', group: 'reports', scopes: ['national'], type: 'report', tier: 2, status: 'reference', updateFrequency: null, lastUpdated: null, licence: 'unverified' },
  { id: 'oecd', name: 'Digital Skills for Private Sector Competitiveness in Uzbekistan', publisher: 'OECD', url: 'https://www.oecd.org/science-and-technology/digital-skills-for-private-sector-competitiveness-in-uzbekistan_6c54f447-en', docsUrl: 'https://www.oecd.org/en/publications/digital-skills-for-private-sector-competitiveness-in-uzbekistan_6c54f447-en/full-report/component-5', group: 'reports', scopes: ['national'], type: 'report', tier: 2, status: 'reference', updateFrequency: null, lastUpdated: null, licence: 'unverified' },
  { id: 'undpgdd', name: 'Gender Digital Divide Assessment', publisher: 'UNDP', url: 'https://www.undp.org/sites/g/files/zskgke326/files/2023-03/GDD%20Summary%20-%20eng.pdf', group: 'reports', scopes: ['national'], type: 'report', tier: 2, status: 'reference', updateFrequency: null, lastUpdated: null, licence: 'unverified' },
  { id: 'undphdr', name: 'Human Development Report 2025', publisher: 'UNDP', url: 'https://www.undp.org/node/530356', group: 'reports', scopes: ['global', 'national'], type: 'report', tier: 2, status: 'reference', updateFrequency: null, lastUpdated: null, licence: 'unverified' },
  { id: 'unescoai', name: 'UNESCO AI Competency Frameworks', publisher: 'UNESCO', url: 'https://www.unesco.org', docsUrl: 'https://unesco.org.nz/knowledge-hub/unesco-ai-competency-framework-for-students-and-teachers', group: 'reports', scopes: ['global'], type: 'framework', tier: 2, status: 'reference', updateFrequency: null, lastUpdated: null, licence: 'unverified' },
  { id: 'elementsofai', name: 'Elements of AI', publisher: 'University of Helsinki and MinnaLearn', url: 'https://www.elementsofai.com', docsUrl: 'https://digital-skills-jobs.europa.eu/en/opportunities/training/elements-ai', group: 'reports', scopes: ['global'], type: 'course', tier: 2, status: 'reference', updateFrequency: null, lastUpdated: null, licence: 'unverified' },

  // Optional academic sources
  { id: 'zawacki', name: 'Zawacki-Richter et al. (2019), AI applications in higher education', publisher: 'Int. Journal of Educational Technology in Higher Education', url: 'https://link.springer.com/article/10.1186/S41239-019-0171-0', group: 'academic', scopes: ['global'], type: 'academic', tier: 3, status: 'reference', updateFrequency: null, lastUpdated: null, licence: 'unverified' },
  { id: 'eloundou', name: 'Eloundou et al., GPTs are GPTs', publisher: 'arXiv', url: 'https://arxiv.org/abs/2303.10130', group: 'academic', scopes: ['us'], type: 'academic', tier: 3, status: 'reference', updateFrequency: null, lastUpdated: null, licence: 'unverified' },
];

export const SOURCE_GROUPS: SourceGroup[] = ['integrated', 'uzbekistan', 'global', 'reports', 'academic'];

export const INTEGRATED_SOURCES = APPROVED_SOURCES.filter((s) => s.integratedId);
export const sourceByIntegratedId = (id: string) => APPROVED_SOURCES.find((s) => s.integratedId === id);

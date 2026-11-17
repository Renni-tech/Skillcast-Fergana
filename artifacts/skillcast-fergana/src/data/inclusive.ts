// ─── Accessible and disability-inclusive opportunities ─────────────────────
// What SkillCast can honestly say about work and study that is accessible to
// people with disabilities.
//
// Verification levels (shown in the UI):
//   'approved' — from the separately researched approved source list.
//   'official' — published by a government or UN body; the link points to the
//                publisher, and the specific page was not re-checked here.
//   'curated'  — well-known organisation added by the team; not re-checked.
//   'demo'     — fictional example that shows how a verified entry would look.
// Nothing here labels a job "for disabled people". Entries describe rights,
// programmes, standards and support that a source actually describes.
// Descriptions live in i18n (key `inc.<id>.d`) in Uzbek, Russian and English.

export type InclusiveKind = 'rights' | 'employment' | 'vacancies' | 'employers' | 'standard' | 'training' | 'demo';
export type InclusiveScope = 'district' | 'national' | 'global';
export type InclusiveVerification = 'approved' | 'official' | 'curated' | 'demo';

export interface InclusiveEntry {
  id: string;
  kind: InclusiveKind;
  name: string;
  publisher: string;
  url: string | null;
  scope: InclusiveScope;
  verification: InclusiveVerification;
  lastChecked: string | null;
}

export const INCLUSIVE_ENTRIES: InclusiveEntry[] = [
  {
    id: 'mehnat-fergana', kind: 'employment', name: 'Employment quotas and vocational training (Fergana District report)',
    publisher: 'Ministry of Employment and Poverty Reduction', url: 'https://gov.uz/en/fargonatuman/news/view/234791',
    scope: 'district', verification: 'approved', lastChecked: null,
  },
  {
    id: 'ishmehnat', kind: 'vacancies', name: 'National vacancy database', publisher: 'ish.mehnat.uz',
    url: 'https://ish.mehnat.uz', scope: 'national', verification: 'approved', lastChecked: null,
  },
  {
    id: 'uz-law', kind: 'rights', name: 'Law “On the rights of persons with disabilities” (2020)',
    publisher: 'National Database of Legislation (lex.uz)', url: 'https://lex.uz', scope: 'national', verification: 'official', lastChecked: null,
  },
  {
    id: 'un-crpd', kind: 'rights', name: 'Convention on the Rights of Persons with Disabilities (Articles 24 and 27)',
    publisher: 'United Nations (DESA)', url: 'https://www.un.org/development/desa/disabilities/', scope: 'global', verification: 'official', lastChecked: null,
  },
  {
    id: 'ilo-gbdn', kind: 'employers', name: 'Global Business and Disability Network',
    publisher: 'International Labour Organization', url: 'https://www.businessanddisability.org', scope: 'global', verification: 'curated', lastChecked: null,
  },
  {
    id: 'w3c-wai', kind: 'standard', name: 'Web accessibility standards (WCAG)',
    publisher: 'W3C Web Accessibility Initiative', url: 'https://www.w3.org/WAI/', scope: 'global', verification: 'curated', lastChecked: null,
  },
  {
    id: 'w3c-course', kind: 'training', name: 'Digital Accessibility Foundations (free course)',
    publisher: 'W3C Web Accessibility Initiative', url: 'https://www.w3.org/WAI/courses/foundations-course/', scope: 'global', verification: 'curated', lastChecked: null,
  },
  {
    id: 'demo-employer', kind: 'demo', name: 'Fergana Smart Manufacturing',
    publisher: 'Fictional demo organisation', url: null, scope: 'district', verification: 'demo', lastChecked: null,
  },
];

// Work options a role's typical tasks often allow. Indicative only: based on
// the role's task profile in SkillCast, not on employer data. The UI says so
// and asks learners to confirm with each employer. Values match the work
// preferences learners choose in onboarding.
export type WorkOption = 'remote-hybrid' | 'flexible-hours' | 'written-instructions' | 'assistive-technology' | 'flexible-communication' | 'quiet-workplace';

const DESK: WorkOption[] = ['remote-hybrid', 'flexible-hours', 'written-instructions', 'assistive-technology', 'quiet-workplace'];

export const ROLE_WORK_OPTIONS: Record<string, WorkOption[]> = {
  'ai-ops-specialist': DESK,
  'ai-marketing-strategist': [...DESK, 'flexible-communication'],
  'ai-hr-partner': ['remote-hybrid', 'written-instructions', 'assistive-technology', 'flexible-communication'],
  'ai-business-analyst': DESK,
  'ai-cx-lead': ['remote-hybrid', 'written-instructions', 'assistive-technology', 'flexible-communication'],
  'solar-technician': ['written-instructions'],
  'esg-analyst': DESK,
  'telehealth-coordinator': ['remote-hybrid', 'written-instructions', 'assistive-technology', 'flexible-communication'],
  'cyber-analyst': ['remote-hybrid', 'written-instructions', 'assistive-technology', 'quiet-workplace'],
  'data-analyst': DESK,
  'smart-ag-technologist': ['written-instructions', 'flexible-hours'],
  'digital-skills-trainer': ['remote-hybrid', 'flexible-communication', 'written-instructions'],
  'prompt-workflow-designer': DESK,
  'agent-ops-engineer': DESK,
  'responsible-ai-associate': DESK,
  'ml-engineer': DESK,
};

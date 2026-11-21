import { OCCUPATION_MAP, OTHER_OCCUPATION, SECTOR_MAP, type SectorId } from '@/data/occupations';
import type {
  CareerStrategy,
  EmploymentStatus,
  IndividualProfileDetails,
  Persona,
  Profile,
} from '@/lib/types';

const EMPTY_DETAILS: IndividualProfileDetails = {
  employmentStatus: '',
  fieldOfWork: '',
  fieldId: '',
  profession: '',
  professionId: '',
  targetOccupationId: '',
  specialization: '',
  educationLevel: '',
  country: '',
  city: '',
  languages: [],
  careerStrategy: '',
  strategyRole: '',
  focusSkill: '',
  newField: '',
  aiGoal: '',
  aiSkill: '',
  workPreferences: ['none'],
};

export const EMPTY_PROFILE: Profile = {
  persona: null,
  years: 0,
  interests: [],
  budget: 5,
  skills: {},
  inclusion: {
    dyslexia: false,
    visual: false,
    hearing: false,
    mobility: false,
    none: true,
  },
  objective: '',
  cvScrub: null,
  intakeMode: null,
  extended: EMPTY_DETAILS,
};

const PERSONAS: Persona[] = ['working-adult', 'fresh-grad', 'switcher', 'tvet-student'];
const EMPLOYMENT_STATUSES: EmploymentStatus[] = ['student', 'working', 'unemployed', 'career-changer', ''];
const CAREER_STRATEGIES: CareerStrategy[] = ['enhance', 'related-transition', 'new-field', 'ai-skills', ''];
const INCLUSION_KEYS = ['dyslexia', 'visual', 'hearing', 'mobility', 'none'] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

/** Weekly study availability: the whole week can be selected (7 × 24 = 168 h). */
export const MAX_WEEKLY_HOURS = 168;
/**
 * Plans are paced at no more than full-time study, however much time is
 * available. Above this the user sees a note; the selection itself is kept.
 */
export const PLAN_PACE_CAP = 40;
/** Hours per week a learning plan is paced at. */
export function planningHours(weeklyHours: number): number {
  const h = Number.isFinite(weeklyHours) && weeklyHours > 0 ? weeklyHours : EMPTY_PROFILE.budget;
  return Math.min(Math.max(1, h), PLAN_PACE_CAP);
}

function boundedNumber(value: unknown, fallback: number, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

export function normalizeProfile(value: unknown): Profile {
  const source = isRecord(value) ? value : {};
  const details = isRecord(source.extended) ? source.extended : {};
  const sourceInclusion = isRecord(source.inclusion) ? source.inclusion : {};
  const sourceSkills = isRecord(source.skills) ? source.skills : {};
  const sourceLanguages = Array.isArray(details.languages) ? details.languages : [];
  const sourceCvScrub = isRecord(source.cvScrub) ? source.cvScrub : null;
  const sourceTaskStatuses = isRecord(source.haradaTaskStatuses) ? source.haradaTaskStatuses : null;

  const inclusion = { ...EMPTY_PROFILE.inclusion };
  for (const key of INCLUSION_KEYS) {
    if (typeof sourceInclusion[key] === 'boolean') inclusion[key] = sourceInclusion[key] as boolean;
  }

  const skills = Object.fromEntries(
    Object.entries(sourceSkills)
      .filter(([slug, level]) => slug.length > 0 && typeof level === 'number' && Number.isFinite(level))
      .map(([slug, level]) => [slug, boundedNumber(level, 0, 0, 5)]),
  );

  const extended: IndividualProfileDetails = {
    ...EMPTY_DETAILS,
    employmentStatus: EMPLOYMENT_STATUSES.includes(details.employmentStatus as EmploymentStatus)
      ? details.employmentStatus as EmploymentStatus
      : '',
    fieldOfWork: stringValue(details.fieldOfWork),
    profession: stringValue(details.profession),
    fieldId: SECTOR_MAP[stringValue(details.fieldId) as SectorId] ? stringValue(details.fieldId) : '',
    professionId: OCCUPATION_MAP[stringValue(details.professionId)] || stringValue(details.professionId) === OTHER_OCCUPATION ? stringValue(details.professionId) : '',
    targetOccupationId: OCCUPATION_MAP[stringValue(details.targetOccupationId)] ? stringValue(details.targetOccupationId) : '',
    specialization: stringValue(details.specialization),
    educationLevel: stringValue(details.educationLevel),
    country: stringValue(details.country),
    city: stringValue(details.city),
    languages: sourceLanguages
      .filter((item): item is Record<string, unknown> => isRecord(item))
      .map((item) => ({
        language: stringValue(item.language),
        proficiency: ['basic', 'intermediate', 'advanced', 'native'].includes(String(item.proficiency))
          ? item.proficiency as 'basic' | 'intermediate' | 'advanced' | 'native'
          : 'basic',
      }))
      .filter((item) => item.language.length > 0),
    careerStrategy: CAREER_STRATEGIES.includes(details.careerStrategy as CareerStrategy)
      ? details.careerStrategy as CareerStrategy
      : '',
    strategyRole: stringValue(details.strategyRole),
    focusSkill: stringValue(details.focusSkill),
    newField: stringValue(details.newField),
    aiGoal: stringValue(details.aiGoal),
    aiSkill: stringValue(details.aiSkill),
    workPreferences: Array.isArray(details.workPreferences)
      ? stringArray(details.workPreferences)
      : ['none'],
  };

  return {
    persona: PERSONAS.includes(source.persona as Persona) ? source.persona as Persona : null,
    years: boundedNumber(source.years, 0, 0, 60),
    interests: stringArray(source.interests),
    budget: Math.round(boundedNumber(source.budget, EMPTY_PROFILE.budget, 1, MAX_WEEKLY_HOURS)),
    skills,
    inclusion,
    objective: stringValue(source.objective),
    cvScrub: sourceCvScrub
      ? {
          items: boundedNumber(sourceCvScrub.items, 0, 0, 10000),
          kinds: stringArray(sourceCvScrub.kinds),
        }
      : null,
    intakeMode: source.intakeMode === 'cv' || source.intakeMode === 'form' ? source.intakeMode : null,
    extended,
    weeklyHoursCompleted: typeof source.weeklyHoursCompleted === 'number' && Number.isFinite(source.weeklyHoursCompleted)
      ? boundedNumber(source.weeklyHoursCompleted, 0, 0, 168)
      : undefined,
    weeklyReflection: stringValue(source.weeklyReflection),
    completedRoadmapTasks: stringArray(source.completedRoadmapTasks),
    haradaTaskStatuses: sourceTaskStatuses
      ? Object.fromEntries(
          Object.entries(sourceTaskStatuses).filter(([, status]) =>
            status === 'not-started' || status === 'in-progress' || status === 'completed',
          ),
        ) as Profile['haradaTaskStatuses']
      : undefined,
  };
}

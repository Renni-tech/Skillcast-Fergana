// ─── One-click demo learner (synthetic data only) ──────────────────────────
// A realistic, fabricated learner for judges and presentations. Everything
// here is ordinary profile data that flows through the same matching, Wind
// Rose, Harada, pathway, progression and badge logic as a real learner: the
// course completions go through applyUpdates/proposeUpdates, the roadmap uses
// the Harada roadmap's own task keys, and badges are earned by the badge
// rules, never hard-coded.
//
// The demo is deliberately part-way through: some goals are reached, some are
// in progress and some have not started, so every chart shows real gaps.

import { ROLE_MAP } from '@/data/roles';
import { applyUpdates, proposeUpdates, type SkillUpdate } from '@/lib/progression';
import { normalizeProfile } from '@/lib/profile';
import type { Profile } from '@/lib/types';

export const DEMO_ROLE = 'ai-business-analyst';
/** localStorage key for the learner's own state while the demo is shown. */
export const DEMO_BACKUP_KEY = 'skillcast-pre-demo';

/** Number of tasks per skill in the Harada roadmap (see components/skillcast/harada.tsx). */
export const HARADA_TASKS_PER_SKILL = 8;

/** Self-rated levels before the two finished courses were confirmed. */
const STARTING_SKILLS: Record<string, number> = {
  communication: 3,
  'critical-thinking': 3,
  'digital-literacy': 4,
  'english-for-work': 3,
  'customer-experience': 3,
  'project-management': 2,
  'accounting-finance': 2,
  'business-analysis': 1,
  'data-analysis': 1,
  'prompt-engineering': 1,
  'ai-augmented-ops': 1,
};

/** Courses the demo learner already finished, oldest first. */
export const DEMO_COMPLETED_COURSES = ['google-ai-essentials', 'ai-for-everyone'];

/**
 * Harada progress per role skill: how many of the eight tasks are completed
 * and how many are in progress. Two skills are fully done (milestones), three
 * are part-way, the rest are untouched.
 */
const HARADA_PROGRESS: Record<string, { done: number; doing: number }> = {
  communication: { done: 8, doing: 0 },
  'critical-thinking': { done: 8, doing: 0 },
  'prompt-engineering': { done: 5, doing: 2 },
  'business-analysis': { done: 3, doing: 1 },
  'data-analysis': { done: 2, doing: 1 },
};

const daysAgo = (n: number, now: Date) => {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  return d;
};
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export interface DemoState {
  profile: Profile;
  chosenRole: string;
  completedCourses: string[];
  skillUpdates: SkillUpdate[];
  activeDays: string[];
  reflections: Array<{ id: string; text: string; createdAt: string }>;
}

/** Builds the demo learner. Pure: the same `now` always gives the same state. */
export function buildDemoState(now = new Date()): DemoState {
  const role = ROLE_MAP[DEMO_ROLE];
  let skills = { ...STARTING_SKILLS };
  const skillUpdates: SkillUpdate[] = [];
  // Finish each course the way the pathway does: propose, then confirm every level-up.
  DEMO_COMPLETED_COURSES.forEach((slug, i) => {
    const applied = applyUpdates(slug, proposeUpdates(slug, skills), skills, daysAgo(9 - i * 5, now));
    skills = applied.skills;
    skillUpdates.push(...applied.log);
  });

  const haradaTaskStatuses: NonNullable<Profile['haradaTaskStatuses']> = {};
  const completedRoadmapTasks: string[] = [];
  for (const { skill } of role.skills) {
    const plan = HARADA_PROGRESS[skill] ?? { done: 0, doing: 0 };
    for (let i = 0; i < HARADA_TASKS_PER_SKILL; i++) {
      if (i < plan.done) haradaTaskStatuses[`${DEMO_ROLE}:${skill}:${i}`] = 'completed';
      else if (i < plan.done + plan.doing) haradaTaskStatuses[`${DEMO_ROLE}:${skill}:${i}`] = 'in-progress';
    }
    if (plan.done >= HARADA_TASKS_PER_SKILL) completedRoadmapTasks.push(`${DEMO_ROLE}:${skill}`);
  }

  const profile = normalizeProfile({
    persona: 'working-adult',
    years: 4,
    interests: ['business', 'ai', 'technology', 'people'],
    budget: 6,
    skills,
    inclusion: { dyslexia: false, visual: false, hearing: false, mobility: false, none: true },
    objective: 'Move from office administration to an AI-augmented business analyst role at a Fergana textile exporter within 9 months.',
    cvScrub: null,
    intakeMode: 'form',
    weeklyHoursCompleted: 4,
    weeklyReflection: '',
    haradaTaskStatuses,
    completedRoadmapTasks,
    extended: {
      employmentStatus: 'working',
      fieldOfWork: 'Business, finance & management',
      fieldId: 'business',
      profession: 'Office administrator',
      professionId: 'office-administrator',
      targetOccupationId: 'business-analyst-occ',
      learningFormat: 'any',
      specialization: 'Export paperwork and monthly sales reports for a silk textile company',
      educationLevel: 'Bachelor\'s degree',
      country: 'Uzbekistan',
      city: 'Fergana',
      languages: [
        { language: 'Uzbek', proficiency: 'native' },
        { language: 'Russian', proficiency: 'advanced' },
        { language: 'English', proficiency: 'intermediate' },
      ],
      careerStrategy: 'related-transition',
      strategyRole: DEMO_ROLE,
      focusSkill: 'data-analysis',
      newField: '',
      aiGoal: '',
      aiSkill: '',
      workPreferences: ['remote-hybrid', 'flexible-hours'],
    },
  });

  return {
    profile,
    chosenRole: DEMO_ROLE,
    completedCourses: [...DEMO_COMPLETED_COURSES],
    skillUpdates,
    // Four study days over the last two weeks: "Consistent Learner" silver is one day away.
    activeDays: [12, 9, 4, 1].map((n) => ymd(daysAgo(n, now))),
    reflections: [{
      id: 'r-demo-1',
      text: 'Pivot tables finally clicked this week. Next: practise charts on our real (anonymised) export figures.',
      createdAt: daysAgo(1, now).toISOString(),
    }],
  };
}

/** True when the store holds a learner's own data that the demo would replace. */
export function hasOwnLearnerData(s: { learnerOnboarded: boolean; profile: Profile; completedCourses: string[] }): boolean {
  return s.learnerOnboarded
    || Object.keys(s.profile.skills ?? {}).length > 0
    || Boolean(s.profile.extended?.employmentStatus)
    || s.completedCourses.length > 0;
}

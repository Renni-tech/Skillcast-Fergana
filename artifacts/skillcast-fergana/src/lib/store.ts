'use client';

import { applyUpdates, revertUpdates, type ProposedUpdate, type SkillUpdate } from './progression';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  EmployerProfile,
  InstitutionProfile,
  Lang,
  Persona,
  Profile,
  ScenarioId,
  UserType,
} from '@/lib/types';
import { EMPTY_PROFILE, normalizeProfile } from '@/lib/profile';
import { ROLE_MAP } from '@/data/roles';
export { EMPTY_PROFILE } from '@/lib/profile';

export type View =
  | 'landing'
  | 'onboarding'
  | 'dashboard'
  | 'employer'
  | 'institution'
  | 'signals';

type HaradaTaskStatus = 'todo' | 'in_progress' | 'done';

/** Personal display preferences. Kept when the demo data is reset. */
export interface A11ySettings {
  textScale: 'normal' | 'large' | 'larger';
  highContrast: boolean;
  reduceMotion: boolean;
  underlineLinks: boolean;
  readingSpacing: boolean;
}

export const DEFAULT_A11Y: A11ySettings = {
  textScale: 'normal', highContrast: false, reduceMotion: false, underlineLinks: false, readingSpacing: false,
};

export function normalizeA11y(value: unknown): A11ySettings {
  const v = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  return {
    textScale: v.textScale === 'large' || v.textScale === 'larger' ? v.textScale : 'normal',
    highContrast: v.highContrast === true,
    reduceMotion: v.reduceMotion === true,
    underlineLinks: v.underlineLinks === true,
    readingSpacing: v.readingSpacing === true,
  };
}

interface SkillCastState {
  lang: Lang;
  view: View;
  userType: UserType | null;
  scenario: ScenarioId;
  profile: Profile;
  employer: EmployerProfile;
  institution: InstitutionProfile;
  chosenRole: string | null;
  completedCourses: string[];
  /** Logged skill-level changes from completed courses (see lib/progression). */
  skillUpdates: SkillUpdate[];
  /** Assistant reads answers aloud (where the browser has a voice). */
  assistantSpeak: boolean;
  setAssistantSpeak: (on: boolean) => void;
  /** Applies user-confirmed level changes for a completed course. */
  confirmSkillUpdates: (courseSlug: string, chosen: ProposedUpdate[]) => SkillUpdate[];
  haradaTaskStatus: Record<string, HaradaTaskStatus>;
  onboarded: boolean;
  learnerOnboarded: boolean;
  dashTab: string;
  a11y: A11ySettings;

  setA11y: (patch: Partial<A11ySettings>) => void;
  setLang: (l: Lang) => void;
  setView: (v: View) => void;
  setUserType: (u: UserType | null) => void;
  setScenario: (s: ScenarioId) => void;
  setProfile: (p: Partial<Profile>) => void;
  setEmployer: (p: Partial<EmployerProfile>) => void;
  setInstitution: (p: Partial<InstitutionProfile>) => void;
  setSkillLevel: (slug: string, level: number) => void;
  setChosenRole: (slug: string | null) => void;
  toggleCourse: (slug: string) => void;
  setHaradaTaskStatus: (
    taskId: string,
    status: HaradaTaskStatus,
  ) => void;
  resetDemo: () => void;
  setDashTab: (tab: string) => void;
}

export const EMPTY_EMPLOYER: EmployerProfile = {
  company: '',
  industry: '',
  teamSize: 10,
  intake: '',
  matrixUrl: '',
  template: '',
  objective: '',
  timelineMonths: 6,
  budgetPref: '',
};

export const EMPTY_INSTITUTION: InstitutionProfile = {
  name: '',
  field: '',
  intake: '',
  focus: '',
  lowBandwidth: false,
};

export const useSkillCast = create<SkillCastState>()(
  persist(
    (set, get) => ({
      lang: 'uz',
      view: 'landing',
      userType: null,
      scenario: 'moderate',
      profile: EMPTY_PROFILE,
      employer: EMPTY_EMPLOYER,
      institution: EMPTY_INSTITUTION,
      chosenRole: null,
      completedCourses: [],
      haradaTaskStatus: {},
      onboarded: false,
      learnerOnboarded: false,
      dashTab: 'overview',
      a11y: DEFAULT_A11Y,
      setA11y: (patch) => set((state) => ({ a11y: normalizeA11y({ ...state.a11y, ...patch }) })),

      setLang: (l) => set({ lang: l }),

      setView: (v) => set({ view: v }),

      setUserType: (u) => set({ userType: u }),

      setScenario: (s) => set({ scenario: s }),

      setProfile: (p) =>
        set((st) => {
          const inclusion = p.inclusion
            ? { ...st.profile.inclusion, ...p.inclusion }
            : st.profile.inclusion;
          const extended = p.extended
            ? { ...st.profile.extended, ...p.extended }
            : st.profile.extended;
          return {
            profile: normalizeProfile({
              ...st.profile,
              ...p,
              inclusion,
              extended,
            }),
          };
        }),

      setEmployer: (p) =>
        set((st) => ({
          employer: { ...st.employer, ...p },
        })),

      setInstitution: (p) =>
        set((st) => ({
          institution: { ...st.institution, ...p },
        })),

      setSkillLevel: (slug, level) =>
        set((st) => {
          const skills = { ...st.profile.skills };

          if (level <= 0) {
            delete skills[slug];
          } else {
            skills[slug] = level;
          }

          return {
            profile: { ...st.profile, skills },
          };
        }),

      setChosenRole: (slug) =>
        set({ chosenRole: slug }),

      toggleCourse: (slug) =>
        set((st) => {
          if (!st.completedCourses.includes(slug)) {
            return { completedCourses: [...st.completedCourses, slug] };
          }
          // Un-marking a course reverts the skill levels it raised.
          const reverted = revertUpdates(slug, st.skillUpdates, st.profile.skills);
          return {
            completedCourses: st.completedCourses.filter((c) => c !== slug),
            skillUpdates: reverted.log,
            profile: { ...st.profile, skills: reverted.skills },
          };
        }),

      skillUpdates: [],
      assistantSpeak: true,
      setAssistantSpeak: (on) => set({ assistantSpeak: on }),
      confirmSkillUpdates: (courseSlug, chosen) => {
        const st = get();
        const applied = applyUpdates(courseSlug, chosen, st.profile.skills);
        set({
          profile: { ...st.profile, skills: applied.skills },
          skillUpdates: [...st.skillUpdates.filter((e) => e.courseSlug !== courseSlug), ...applied.log],
        });
        return applied.log;
      },

      setHaradaTaskStatus: (taskId, status) =>
        set((st) => ({
          haradaTaskStatus: {
            ...st.haradaTaskStatus,
            [taskId]: status,
          },
        })),

      setDashTab: (tab) =>
        set({ dashTab: tab }),

      resetDemo: () =>
        set({
          view: 'landing',
          userType: null,
          profile: EMPTY_PROFILE,
          employer: EMPTY_EMPLOYER,
          institution: EMPTY_INSTITUTION,
          chosenRole: null,
          completedCourses: [],
          skillUpdates: [],
          haradaTaskStatus: {},
          onboarded: false,
          learnerOnboarded: false,
          scenario: 'moderate',
          dashTab: 'overview',
        }),
    }),
    {
      name: 'skillcast-poc',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        lang: s.lang,
        scenario: s.scenario,
        userType: s.userType,
        profile: s.profile,
        employer: s.employer,
        institution: s.institution,
        chosenRole: s.chosenRole,
        completedCourses: s.completedCourses,
        skillUpdates: s.skillUpdates,
        assistantSpeak: s.assistantSpeak,
        dashTab: s.dashTab,
        haradaTaskStatus: s.haradaTaskStatus,
        onboarded: s.onboarded,
        learnerOnboarded: s.learnerOnboarded,
        a11y: s.a11y,
      }),
      // Normalize saved data before the first render, not after consumers
      // have already read nullable arrays or incomplete nested profiles.
      merge: (persisted, current) => {
        const saved = persisted && typeof persisted === 'object'
          ? persisted as Record<string, unknown> : {};
        const strings = (value: unknown) => Array.isArray(value)
          ? value.filter((item): item is string => typeof item === 'string') : [];
        return {
          ...current,
          lang: ['en', 'uz', 'ru'].includes(String(saved.lang)) ? saved.lang as Lang : 'uz',
          scenario: saved.scenario === 'accelerated' ? 'accelerated' : 'moderate',
          userType: ['individual', 'employer', 'institution'].includes(String(saved.userType))
            ? saved.userType as UserType : null,
          profile: normalizeProfile(saved.profile),
          a11y: normalizeA11y(saved.a11y),
          employer: { ...EMPTY_EMPLOYER, ...(saved.employer && typeof saved.employer === 'object' ? saved.employer : {}) },
          institution: { ...EMPTY_INSTITUTION, ...(saved.institution && typeof saved.institution === 'object' ? saved.institution : {}) },
          chosenRole: typeof saved.chosenRole === 'string' && ROLE_MAP[saved.chosenRole] ? saved.chosenRole : null,
          completedCourses: strings(saved.completedCourses),
          skillUpdates: Array.isArray(saved.skillUpdates)
            ? (saved.skillUpdates as unknown[]).filter((u): u is SkillUpdate => !!u && typeof u === 'object'
              && typeof (u as SkillUpdate).courseSlug === 'string' && typeof (u as SkillUpdate).skill === 'string'
              && Number.isFinite((u as SkillUpdate).from) && Number.isFinite((u as SkillUpdate).to)) : [],
          assistantSpeak: saved.assistantSpeak !== false,
          dashTab: typeof saved.dashTab === 'string' ? saved.dashTab as typeof current.dashTab : 'overview',
          haradaTaskStatus: saved.haradaTaskStatus && typeof saved.haradaTaskStatus === 'object'
            ? Object.fromEntries(Object.entries(saved.haradaTaskStatus).filter(([, status]) => ['todo', 'in_progress', 'done'].includes(String(status)))) as Record<string, HaradaTaskStatus> : {},
          onboarded: saved.onboarded === true,
          learnerOnboarded: typeof saved.learnerOnboarded === 'boolean'
            ? saved.learnerOnboarded : saved.userType === 'individual' && saved.onboarded === true,
        };
      },
      onRehydrateStorage: () => (state) => {
        if (state) state.setProfile(normalizeProfile(state.profile));
        if (state && !['en', 'uz', 'ru'].includes(String(state.lang))) {
          state.setLang('uz');
        }
        if (state && String(state.employer?.budgetPref) === 'hrd') {
          state.setEmployer({ budgetPref: 'paid' });
        }
      },
    },
  ),
);

export const PERSONAS: Array<{
  id: Persona;
  labelKey: string;
  descKey: string;
}> = [
  {
    id: 'working-adult',
    labelKey: 'persona.working-adult',
    descKey: 'persona.working-adult.d',
  },
  {
    id: 'fresh-grad',
    labelKey: 'persona.fresh-grad',
    descKey: 'persona.fresh-grad.d',
  },
  {
    id: 'switcher',
    labelKey: 'persona.switcher',
    descKey: 'persona.switcher.d',
  },
  {
    id: 'tvet-student',
    labelKey: 'persona.tvet-student',
    descKey: 'persona.tvet-student.d',
  },
];

export const INTERESTS = [
  'technology',
  'ai',
  'business',
  'people',
  'education',
  'service',
  'health',
  'green',
  'sustainability',
  'creative',
] as const;
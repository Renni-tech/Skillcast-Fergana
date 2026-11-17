'use client';

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
  haradaTaskStatus: Record<string, HaradaTaskStatus>;
  onboarded: boolean;
  learnerOnboarded: boolean;
  dashTab: string;

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
    (set) => ({
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
        set((st) => ({
          completedCourses: st.completedCourses.includes(slug)
            ? st.completedCourses.filter((c) => c !== slug)
            : [...st.completedCourses, slug],
        })),

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
        haradaTaskStatus: s.haradaTaskStatus,
        onboarded: s.onboarded,
        learnerOnboarded: s.learnerOnboarded,
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
          employer: { ...EMPTY_EMPLOYER, ...(saved.employer && typeof saved.employer === 'object' ? saved.employer : {}) },
          institution: { ...EMPTY_INSTITUTION, ...(saved.institution && typeof saved.institution === 'object' ? saved.institution : {}) },
          chosenRole: typeof saved.chosenRole === 'string' && ROLE_MAP[saved.chosenRole] ? saved.chosenRole : null,
          completedCourses: strings(saved.completedCourses),
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
'use client';

import { addItem, newPathId, normalizePaths, setItemStatus, type LearningPath, type PathItemStatus } from './learning-paths';
import { applyUpdates, revertUpdates, type ProposedUpdate, type SkillUpdate } from './progression';
import { today, ALL_BADGES, WIND_ROSE_THEMES, type WindRoseTheme } from './achievements';
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

const withToday = (days: string[]) => {
  const d = today();
  return days.includes(d) ? days : [...days, d].slice(-400);
};

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
  /** Earned badges: id → ISO time first earned. Never removed except by reset. */
  badges: Record<string, string>;
  /** Badges whose reveal has been shown (or skipped). */
  badgesSeen: string[];
  /** Distinct local days with real learning activity (YYYY-MM-DD). */
  activeDays: string[];
  /** Reward sound; off by default. */
  badgeSound: boolean;
  windRoseTheme: WindRoseTheme;
  /** One-time hints and guides the learner has dismissed. */
  seenTips: string[];
  dismissTip: (id: string) => void;
  /** Learner-made learning paths (see lib/learning-paths). */
  learningPaths: LearningPath[];
  activePathId: string | null;
  /** One-shot hand-offs between tabs (not saved): a catalogue search and a Wind Rose skill to highlight. */
  catalogFocus: string | null;
  roseFocus: string | null;
  focusCatalog: (query: string | null) => void;
  focusRose: (skill: string | null) => void;
  /** Set when the learner just chose a new Wind Rose colour, so the chart can show the change. */
  roseThemeChange: { from: WindRoseTheme; to: WindRoseTheme } | null;
  setRoseThemeChange: (change: { from: WindRoseTheme; to: WindRoseTheme } | null) => void;
  /** Wind Rose colours whose unlock has been announced. */
  themesAnnounced: WindRoseTheme[];
  /** Badges the learner has looked at in the collection (for the header's "new" dot). */
  badgesViewed: string[];
  markBadgesViewed: (ids: string[]) => void;
  announceTheme: (theme: WindRoseTheme) => void;
  createPath: (name: string, firstEntryId?: string) => string;
  renamePath: (id: string, name: string) => void;
  deletePath: (id: string) => void;
  setActivePath: (id: string | null) => void;
  addToPath: (pathId: string, entryId: string) => void;
  removeFromPath: (pathId: string, entryId: string) => void;
  setPathItemStatus: (pathId: string, entryId: string, status: PathItemStatus) => void;
  awardBadges: (ids: string[]) => void;
  markBadgesSeen: (ids: string[]) => void;
  setBadgeSound: (on: boolean) => void;
  setWindRoseTheme: (theme: WindRoseTheme) => void;
  recordActivity: () => void;
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
          // A newly completed Harada task or milestone counts as a study day.
          const before = st.profile.haradaTaskStatuses ?? {};
          const progressed = Object.entries(p.haradaTaskStatuses ?? {}).some(([k, v]) => v === 'completed' && before[k] !== 'completed')
            || (p.completedRoadmapTasks ?? []).some((k) => !(st.profile.completedRoadmapTasks ?? []).includes(k));
          return {
            profile: normalizeProfile({
              ...st.profile,
              ...p,
              inclusion,
              extended,
            }),
            ...(progressed ? { activeDays: withToday(st.activeDays) } : {}),
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
            return { completedCourses: [...st.completedCourses, slug], activeDays: withToday(st.activeDays) };
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
          activeDays: applied.log.length ? withToday(st.activeDays) : st.activeDays,
        });
        return applied.log;
      },

      setHaradaTaskStatus: (taskId, status) =>
        set((st) => ({
          haradaTaskStatus: {
            ...st.haradaTaskStatus,
            [taskId]: status,
          },
          activeDays: status === 'done' ? withToday(st.activeDays) : st.activeDays,
        })),

      badges: {},
      badgesSeen: [],
      activeDays: [],
      badgeSound: false,
      windRoseTheme: 'classic',
      seenTips: [],
      dismissTip: (id) => set((st) => ({ seenTips: [...new Set([...st.seenTips, id])] })),
      learningPaths: [],
      activePathId: null,
      catalogFocus: null,
      roseFocus: null,
      focusCatalog: (query) => set({ catalogFocus: query }),
      focusRose: (skill) => set({ roseFocus: skill }),
      roseThemeChange: null,
      setRoseThemeChange: (change) => set({ roseThemeChange: change }),
      badgesViewed: [],
      markBadgesViewed: (ids) => set((st) => (ids.every((id) => st.badgesViewed.includes(id)) ? {} : { badgesViewed: [...new Set([...st.badgesViewed, ...ids])] })),
      themesAnnounced: [],
      announceTheme: (theme) => set((st) => ({ themesAnnounced: [...new Set([...st.themesAnnounced, theme])] })),
      createPath: (name, firstEntryId) => {
        const st = get();
        const id = newPathId(st.learningPaths);
        const base: LearningPath = { id, name: name.trim().slice(0, 60) || id, createdAt: new Date().toISOString(), items: [] };
        set({ learningPaths: [...st.learningPaths, firstEntryId ? addItem(base, firstEntryId) : base], activePathId: id });
        return id;
      },
      renamePath: (id, name) => set((st) => ({
        learningPaths: st.learningPaths.map((p) => (p.id === id && name.trim() ? { ...p, name: name.trim().slice(0, 60) } : p)),
      })),
      deletePath: (id) => set((st) => {
        const learningPaths = st.learningPaths.filter((p) => p.id !== id);
        return { learningPaths, activePathId: st.activePathId === id ? (learningPaths[0]?.id ?? null) : st.activePathId };
      }),
      setActivePath: (id) => set({ activePathId: id }),
      addToPath: (pathId, entryId) => set((st) => ({
        learningPaths: st.learningPaths.map((p) => (p.id === pathId ? addItem(p, entryId) : p)),
      })),
      removeFromPath: (pathId, entryId) => set((st) => ({
        learningPaths: st.learningPaths.map((p) => (p.id === pathId ? { ...p, items: p.items.filter((i) => i.entryId !== entryId) } : p)),
      })),
      setPathItemStatus: (pathId, entryId, status) => set((st) => ({
        learningPaths: st.learningPaths.map((p) => (p.id === pathId ? setItemStatus(p, entryId, status) : p)),
        activeDays: status === 'done' ? withToday(st.activeDays) : st.activeDays,
      })),
      awardBadges: (ids) => set((st) => {
        const fresh = ids.filter((id) => !st.badges[id]);
        if (!fresh.length) return {};
        const at = new Date().toISOString();
        return { badges: { ...st.badges, ...Object.fromEntries(fresh.map((id) => [id, at])) } };
      }),
      markBadgesSeen: (ids) => set((st) => ({ badgesSeen: [...new Set([...st.badgesSeen, ...ids])] })),
      setBadgeSound: (on) => set({ badgeSound: on }),
      setWindRoseTheme: (theme) => set({ windRoseTheme: theme }),
      recordActivity: () => set((st) => ({ activeDays: withToday(st.activeDays) })),

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
          badges: {},
          badgesSeen: [],
          activeDays: [],
          windRoseTheme: 'classic',
          seenTips: [],
          learningPaths: [],
          activePathId: null,
          themesAnnounced: [],
          badgesViewed: [],
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
        badges: s.badges,
        badgesSeen: s.badgesSeen,
        activeDays: s.activeDays,
        badgeSound: s.badgeSound,
        windRoseTheme: s.windRoseTheme,
        seenTips: s.seenTips,
        learningPaths: s.learningPaths,
        activePathId: s.activePathId,
        themesAnnounced: s.themesAnnounced,
        badgesViewed: s.badgesViewed,
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
          badges: saved.badges && typeof saved.badges === 'object'
            ? Object.fromEntries(Object.entries(saved.badges as Record<string, unknown>)
              .filter(([id, at]) => ALL_BADGES.includes(id) && typeof at === 'string')) as Record<string, string> : {},
          badgesSeen: strings(saved.badgesSeen).filter((id) => ALL_BADGES.includes(id)),
          activeDays: strings(saved.activeDays).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).slice(-400),
          badgeSound: saved.badgeSound === true,
          windRoseTheme: String(saved.windRoseTheme) in WIND_ROSE_THEMES ? saved.windRoseTheme as WindRoseTheme : 'classic',
          seenTips: strings(saved.seenTips).slice(0, 50),
          // Older saves have no "viewed" list: treat what was already seen as viewed.
          badgesViewed: Array.isArray(saved.badgesViewed) ? strings(saved.badgesViewed) : strings(saved.badgesSeen),
          themesAnnounced: strings(saved.themesAnnounced).filter((x) => x in WIND_ROSE_THEMES) as WindRoseTheme[],
          ...(() => {
            const learningPaths = normalizePaths(saved.learningPaths);
            const activePathId = learningPaths.some((p) => p.id === saved.activePathId) ? saved.activePathId as string : (learningPaths[0]?.id ?? null);
            return { learningPaths, activePathId };
          })(),
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
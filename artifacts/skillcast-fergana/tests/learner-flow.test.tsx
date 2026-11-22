import { beforeEach, describe, expect, mock, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { ROLES } from '../src/data/roles';
import { COURSES } from '../src/data/courses';
import { normalizeProfile } from '../src/lib/profile';
import { matchAll, matchRole, strategyPriority } from '../src/lib/matching';
import { makeT } from '../src/lib/i18n';
import { scrubCV } from '../src/lib/cv';
import type { Lang, RoleMatch } from '../src/lib/types';

const values = new Map<string, string>();
const storage: Storage = {
  get length() { return values.size; },
  clear: () => values.clear(),
  getItem: (key) => values.get(key) ?? null,
  key: (index) => [...values.keys()][index] ?? null,
  removeItem: (key) => { values.delete(key); },
  setItem: (key, value) => { values.set(key, value); },
};
Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true });
const storeModule = await import('../src/lib/store');
const { useSkillCast } = storeModule;
// Zustand deliberately uses its initial snapshot during server rendering.
// Render fixtures against the current test state rather than that snapshot.
mock.module('../src/lib/store', () => ({
  ...storeModule,
  useSkillCast: Object.assign(
    (selector?: (state: ReturnType<typeof useSkillCast.getState>) => unknown) =>
      selector ? selector(useSkillCast.getState()) : useSkillCast.getState(),
    { getState: useSkillCast.getState, setState: useSkillCast.setState },
  ),
}));
const { MatchesTab } = await import('../src/components/skillcast/matches');
const { Dashboard } = await import('../src/components/skillcast/dashboard');
const { Onboarding } = await import('../src/components/skillcast/onboarding');
const { EmployerView } = await import('../src/components/skillcast/employer');
const { pickCourses } = await import('../src/components/skillcast/pathway');
const { skillName, skillCategory } = await import('../src/components/skillcast/shared');

const target = ROLES[0];
const complete = normalizeProfile({
  persona: 'working-adult', years: 5, budget: 8, interests: ['technology', 'education'],
  skills: { 'data-analysis': 3, 'prompt-engineering': 2 },
  objective: 'Build practical digital learning skills',
  intakeMode: 'form',
  extended: {
    employmentStatus: 'working', fieldOfWork: 'Education', profession: 'Teacher',
    careerStrategy: 'related-transition', strategyRole: target.slug, workPreferences: ['written-instructions'],
  },
});
const profiles = [
  ['fresh', normalizeProfile(null)],
  ['partial', normalizeProfile({ interests: ['a personal interest'], skills: { 'legacy-custom-skill': 3 } })],
  ['complete', complete],
  ['malformed', normalizeProfile({ skills: null, interests: [null, 5], inclusion: null, extended: { languages: [null], workPreferences: null }, budget: -2 })],
] as const;

beforeEach(() => {
  useSkillCast.getState().resetDemo();
  useSkillCast.setState({ lang: 'en', userType: 'individual' });
});

describe('safe learner data and deterministic personalization', () => {
  test('saved partial state is normalized before consumers render', () => {
    const state = useSkillCast.persist.getOptions().merge!({
      lang: 'invalid', userType: 'individual', onboarded: true,
      profile: { skills: null, inclusion: null, extended: null },
      completedCourses: null, haradaTaskStatus: null, chosenRole: 'deleted-role',
    }, useSkillCast.getState());
    expect(state.profile.skills).toEqual({});
    expect(state.profile.inclusion.none).toBe(true);
    expect(state.completedCourses).toEqual([]);
    expect(state.haradaTaskStatus).toEqual({});
    expect(state.chosenRole).toBeNull();
    expect(state.lang).toBe('uz'); // invalid or legacy locale falls back to the Uzbek default
    expect(state.learnerOnboarded).toBe(true);
  });

  test('employer onboarding does not imply learner onboarding', () => {
    const state = useSkillCast.persist.getOptions().merge!({
      userType: 'employer', onboarded: true,
    }, useSkillCast.getState());
    expect(state.learnerOnboarded).toBe(false);
  });

  test('skill ratings drive readiness and gaps without changing the formula', () => {
    const empty = matchRole(null, target.slug)!;
    const rated = matchRole({ skills: Object.fromEntries(target.skills.map((req) => [req.skill, req.minLevel])) }, target.slug)!;
    expect(empty.skillReadiness).toBe(0);
    expect(rated.skillReadiness).toBe(100);
    expect(rated.gap).toEqual([]);
    expect(rated.score).toBeGreaterThan(empty.score);
  });

  test('interests and experience change their existing factors', () => {
    const role = ROLES.find((item) => item.category.toLowerCase().includes('technology')) ?? target;
    const a = matchRole({ years: 0, interests: ['unrelated'] }, role.slug)!;
    const b = matchRole({ years: 12, interests: ['technology', 'ai'] }, role.slug)!;
    expect(b.factors.find((item) => item.label === 'Experience')!.value).not.toBe(a.factors.find((item) => item.label === 'Experience')!.value);
    expect(matchAll(complete)).toHaveLength(ROLES.length);
    expect(strategyPriority(complete, target.slug)).toBe(0);
  });

  test('learning commitment changes course schedules, not compatibility scores', () => {
    const match = matchRole(complete, target.slug)!;
    const slow = pickCourses(match.gap, complete.inclusion, 2);
    const fast = pickCourses(match.gap, complete.inclusion, 10);
    expect(slow.length).toBeGreaterThan(0);
    expect(slow.map((node) => node.courseSlug)).toEqual(fast.map((node) => node.courseSlug));
    expect(slow[0].weeks).toBeGreaterThanOrEqual(fast[0].weeks);
    expect(slow.every((node) => COURSES.some((course) => course.slug === node.courseSlug && course.skills.includes(node.skill)))).toBe(true);
  });

  test('unknown saved values are user data, not translation keys', () => {
    for (const lang of ['en', 'uz', 'ru'] as const) {
      const t = makeT(lang);
      expect(() => t('skill.legacy-custom-skill')).toThrow();
      expect(skillName(t, 'legacy-custom-skill')).toBe('legacy-custom-skill');
      expect(skillCategory(t, 'My own category')).toBe('My own category');
    }
  });

  test('CV scrubbing removes contact data before extraction', () => {
    const result = scrubCV('Sample learner\nEmail: sample@example.test\nPhone: +998 90 123 45 67\nSkills: Python, SQL and data analysis.');
    expect(result.scrubbedText).not.toContain('sample@example.test');
    expect(result.scrubbedText).not.toContain('+998 90 123 45 67');
    expect(result.scrubbedText).toContain('Python');
  });
});

describe('real learner screens in every language', () => {
  for (const lang of ['en', 'uz', 'ru'] as Lang[]) {
    for (const [name, profile] of profiles) {
      test(`${lang}: ${name} profile renders Matches and all forecast tabs`, () => {
        useSkillCast.setState({ lang, profile, chosenRole: target.slug });
        expect(renderToStaticMarkup(<MatchesTab matches={matchAll(profile)} />)).toContain('role="radiogroup"');
        for (const dashTab of ['overview', 'matches', 'radar', 'pathway', 'harada', 'progress', 'sdg', 'demand']) {
          useSkillCast.setState({ dashTab });
          expect(() => renderToStaticMarkup(<Dashboard />)).not.toThrow();
        }
        expect(() => renderToStaticMarkup(<Onboarding />)).not.toThrow();
      });
    }

    test(`${lang}: invalid match entries render a useful empty state`, () => {
      useSkillCast.setState({ lang });
      const valid = matchAll(complete)[0];
      for (const value of [null, {}, { ...valid, factors: [null] }, { ...valid, missingSkills: [null] }, { ...valid, matchingSkills: [null] }, { ...valid, gap: [null] }, { ...valid, roleSlug: 'deleted-role' }]) {
        const html = renderToStaticMarkup(<MatchesTab matches={[value] as RoleMatch[]} />);
        expect(html).toContain(makeT(lang)('Complete learner profile'));
      }
    });
  }
});

// Regression: commit 87861f6 made OnboardingShell translate `nextLabel` while
// the employer flow still passed already-translated text, so the whole HR
// onboarding crashed with `Missing en translation for "Next"`.
describe('employer (HR) onboarding renders and feeds the HR dashboard', () => {
  for (const lang of ['en', 'uz', 'uz-cyrl', 'ru'] as Lang[]) {
    test(`employer onboarding step 1 renders in ${lang}`, () => {
      useSkillCast.setState({ lang, userType: 'employer' });
      const html = renderToStaticMarkup(<Onboarding />);
      expect(html).toContain(makeT(lang)('onb.emp.step1.q'));
      expect(html).toContain(makeT(lang)('common.next'));
    });
  }
  test('a saved company personalises the HR dashboard', () => {
    useSkillCast.setState({
      lang: 'en', userType: 'employer', onboarded: true,
      employer: { company: 'Margilan Silk Works', industry: 'manufacturing', teamSize: 42, intake: 'template', matrixUrl: '', template: 'production-40', objective: 'transition', timelineMonths: 12, budgetPref: 'free' },
    });
    const html = renderToStaticMarkup(<EmployerView />);
    expect(html).toContain('Margilan Silk Works');
    expect(html).toContain('42');
    expect(html).toContain(makeT('en')('emp.edit'));
    expect(html).not.toContain(makeT('en')('emp.demo.note'));
  });
  test('without a company the HR dashboard shows the labelled demo and set-up button', () => {
    useSkillCast.setState({ lang: 'en', userType: 'employer' });
    const html = renderToStaticMarkup(<EmployerView />);
    expect(html).toContain(makeT('en')('emp.setup.cta'));
  });
});

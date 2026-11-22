import './setup-storage';
import { describe, expect, test } from 'bun:test';
import { ROLE_MAP } from '../src/data/roles';
import { COURSE_MAP } from '../src/data/courses';
import { ALL_BADGES, CATEGORIES, TIERS, badgeProgress, eligibleBadges } from '../src/lib/achievements';
import { buildDemoState, DEMO_BACKUP_KEY, DEMO_ROLE, HARADA_TASKS_PER_SKILL, hasOwnLearnerData } from '../src/lib/demo-profile';
import { I18N_DICTS, makeT } from '../src/lib/i18n';
import { matchAll } from '../src/lib/matching';
import { useSkillCast } from '../src/lib/store';
import type { Lang } from '../src/lib/types';
import { computeWindRose } from '../src/lib/wind-rose';
import { computeProgressSnapshot } from '../src/components/skillcast/achievements';
import { hashFor, parseHash, DASH_TABS } from '../src/components/skillcast/route-sync';
import { explainWindRose } from '../src/components/skillcast/voice-assistant';

const NOW = new Date('2026-11-20T10:00:00Z');
const LANGS: Lang[] = ['en', 'uz', 'uz-cyrl', 'ru'];

describe('demo learner (synthetic) flows through the real logic', () => {
  const demo = buildDemoState(NOW);

  test('targets a real pathway and stays deterministic', () => {
    expect(ROLE_MAP[demo.chosenRole]).toBeDefined();
    expect(buildDemoState(NOW)).toEqual(demo);
  });

  test('finished courses raise skills through the progression rule', () => {
    expect(demo.completedCourses.every((slug) => COURSE_MAP[slug])).toBe(true);
    expect(demo.skillUpdates.length).toBeGreaterThan(0);
    for (const u of demo.skillUpdates) {
      expect(demo.completedCourses).toContain(u.courseSlug);
      expect(u.to).toBe(u.from + 1);
      expect(demo.profile.skills[u.skill]).toBeGreaterThanOrEqual(u.to);
    }
  });

  test('Harada roadmap is part-way: done, in progress and not started', () => {
    const statuses = Object.values(demo.profile.haradaTaskStatuses ?? {});
    expect(statuses).toContain('completed');
    expect(statuses).toContain('in-progress');
    const total = ROLE_MAP[DEMO_ROLE].skills.length * HARADA_TASKS_PER_SKILL;
    expect(statuses.length).toBeLessThan(total); // some tasks untouched
    expect(demo.profile.completedRoadmapTasks?.length).toBeGreaterThan(0);
    expect(demo.profile.completedRoadmapTasks?.length).toBeLessThan(ROLE_MAP[DEMO_ROLE].skills.length);
  });

  test('match keeps real skill gaps and readiness below the gold bar', () => {
    const match = matchAll(demo.profile, {}).find((m) => m.roleSlug === DEMO_ROLE)!;
    expect(match.gap.length).toBeGreaterThan(0);
    expect(match.skillReadiness).toBeGreaterThan(40);
    expect(match.skillReadiness).toBeLessThan(85);
  });

  test('badge rules award some badges, not all, and leave visible progress', () => {
    const snap = computeProgressSnapshot({ ...demo, learnerOnboarded: true }, {});
    const earned = eligibleBadges(snap);
    expect(earned.length).toBeGreaterThan(3);
    expect(earned.length).toBeLessThan(ALL_BADGES.length / 2 + 1);
    const partial = ALL_BADGES.filter((id) => !earned.includes(id)).filter((id) => {
      const p = badgeProgress(id, snap);
      return p.value > 0 && p.value < p.target;
    });
    expect(partial.length).toBeGreaterThan(2);
  });

  test('Wind Rose shows gaps and strengths for the demo', () => {
    const rose = computeWindRose(demo.profile, {}, demo.chosenRole, 10);
    expect(rose.priorities.length).toBeGreaterThan(0);
    expect(rose.strengths.length).toBeGreaterThan(0);
    expect(rose.points.some((p) => p.target !== null)).toBe(true);
  });

  test('loading the demo keeps the learner’s own data and leaving restores it', async () => {
    const store = useSkillCast.getState();
    store.resetDemo();
    store.setProfile({ skills: { python: 4 } });
    await new Promise((r) => setTimeout(r, 0));
    expect(hasOwnLearnerData(useSkillCast.getState())).toBe(true);
    useSkillCast.getState().loadDemo(demo, ['first-steps:bronze'], 'first-steps:bronze');
    expect(localStorage.getItem(DEMO_BACKUP_KEY)).toContain('"python":4');
    expect(useSkillCast.getState().demoMode).toBe(true);
    expect(useSkillCast.getState().badgesSeen).not.toContain('first-steps:bronze');
    useSkillCast.getState().exitDemo();
    await new Promise((r) => setTimeout(r, 20));
    expect(useSkillCast.getState().demoMode).toBe(false);
    expect(useSkillCast.getState().profile.skills.python).toBe(4);
    expect(localStorage.getItem(DEMO_BACKUP_KEY)).toBeNull();
  });
});

describe('Wind Rose voice explanation uses the chart’s own data', () => {
  const demo = buildDemoState(NOW);
  const rose = computeWindRose(demo.profile, {}, demo.chosenRole, 10);
  for (const lang of LANGS) {
    test(`complete and specific in ${lang}`, () => {
      const t = makeT(lang);
      const text = explainWindRose(t, rose, demo.chosenRole, 'Course X');
      expect(text).not.toMatch(/\{[a-z]+\}/); // no unfilled placeholders
      expect(text).toContain(String(rose.points.length));
      const top = rose.priorities[0];
      expect(text).toContain(String(top.you));
      expect(text).toContain(String(top.market));
      expect(text).toContain('Course X');
    });
  }
  test('mentions the teal target line, never amber', () => {
    const text = explainWindRose(makeT('en'), rose, demo.chosenRole);
    expect(text).toMatch(/teal/);
    expect(text).not.toMatch(/amber/i);
  });
  test('handles an empty profile without a pathway', () => {
    const empty = computeWindRose({ ...demo.profile, skills: {} }, {}, null, 8);
    const text = explainWindRose(makeT('ru'), empty, null);
    expect(text).not.toMatch(/\{[a-z]+\}/);
    expect(text.length).toBeGreaterThan(40);
  });
});

describe('every badge can be previewed with its own copy', () => {
  for (const lang of LANGS) {
    test(`all 24 badges have name, riddle, requirement, meaning and lore in ${lang}`, () => {
      const dict = I18N_DICTS[lang];
      const names = new Set<string>();
      for (const cat of CATEGORIES) for (const tier of TIERS) {
        for (const key of [`sb.art.${cat.id}.${tier}`, `sb.riddle.${cat.id}.${tier}`, `ach.req.${cat.id}.${tier}`, `sb.lore.${cat.id}.${tier}`, `ach.why.${cat.id}`, `sb.story.${cat.id}`]) {
          expect(dict[key]?.trim(), `${lang}:${key}`).toBeTruthy();
        }
        names.add(dict[`sb.art.${cat.id}.${tier}`]);
      }
      expect(names.size).toBe(ALL_BADGES.length);
      for (const key of ['sb.preview', 'sb.preview.unlock', 'sb.preview.riddle', 'sb.preview.play', 'sb.preview.note']) expect(dict[key]?.trim()).toBeTruthy();
    });
  }
});

describe('traceable addresses for every screen', () => {
  test('dashboard tabs round-trip through the URL hash', () => {
    for (const tab of DASH_TABS) expect(parseHash(hashFor('dashboard', tab))).toEqual({ view: 'dashboard', tab });
    expect(parseHash(hashFor('signals', 'overview'))).toEqual({ view: 'signals', tab: undefined });
    expect(parseHash('#/')).toEqual({ view: 'landing', tab: undefined });
  });
  test('unknown addresses are ignored', () => {
    expect(parseHash('#/nope')).toBeNull();
    expect(parseHash('#/forecast/hack')).toEqual({ view: 'dashboard', tab: undefined });
    expect(parseHash('#<script>')).toBeNull();
  });
});

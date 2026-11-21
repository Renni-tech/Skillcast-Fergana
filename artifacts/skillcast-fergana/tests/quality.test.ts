import './setup-storage';
import { describe, expect, test } from 'bun:test';
import { APPROVED_SOURCES, SOURCE_AUDIT_DATE } from '../src/data/approved-sources';
import { LEARNING_SOURCES } from '../src/data/learning-sources';
import { INCLUSIVE_ENTRIES } from '../src/data/inclusive';
import { makeT } from '../src/lib/i18n';
import { QUALITY_COPY } from '../src/lib/quality-i18n';
import { SOURCE_COPY } from '../src/lib/signal-source-i18n';

const LANGS = ['uz', 'ru', 'en'] as const;
const isoDay = /^\d{4}-\d{2}-\d{2}$/;

describe('source audit honesty', () => {
  test('every recorded check has a date, an https evidence link and translated facts', () => {
    const checked = APPROVED_SOURCES.filter((s) => s.check);
    expect(checked.length).toBeGreaterThan(10);
    for (const s of checked) {
      expect(s.check!.on, s.id).toMatch(isoDay);
      expect(s.check!.on <= SOURCE_AUDIT_DATE, s.id).toBe(true);
      expect(s.check!.url, s.id).toMatch(/^https:\/\//);
      const copy = SOURCE_COPY[`src.check.${s.id}`];
      expect(copy, s.id).toBeDefined();
      for (const lang of LANGS) expect(copy[lang].trim(), `${s.id}.${lang}`).toBeTruthy();
    }
  });

  test('sources that could not be opened stay unchecked', () => {
    // Blocked automated access or unreadable file during the audit.
    for (const id of ['dataegov', 'oecd', 'ilowp140', 'undpvalley']) {
      expect(APPROVED_SOURCES.find((s) => s.id === id)?.check, id).toBeUndefined();
    }
  });

  test('licence and frequency labels exist, and nothing is called live', () => {
    for (const s of APPROVED_SOURCES) {
      expect(SOURCE_COPY[`src.licence.${s.licence}`], s.id).toBeDefined();
      if (s.updateFrequency) expect(SOURCE_COPY[s.updateFrequency], s.id).toBeDefined();
      expect(s.status as string).not.toBe('live');
    }
    // ILOSTAT publishes bulk files daily (checked on its bulk download page).
    expect(APPROVED_SOURCES.find((s) => s.id === 'ilostat')?.updateFrequency).toBe('src.freq.daily');
    for (const lang of LANGS) expect(SOURCE_COPY['src.desc.ilostat'][lang]).not.toMatch(/weekly|haftalik|еженедел/i);
  });

  test('learning and inclusive entries only carry real check dates and supported levels', () => {
    for (const s of LEARNING_SOURCES) {
      if (s.lastChecked) expect(s.lastChecked, s.id).toMatch(isoDay);
      if (s.level) expect(s.level).toBe('beginner');
    }
    for (const e of INCLUSIVE_ENTRIES) if (e.lastChecked) expect(e.lastChecked, e.id).toMatch(isoDay);
  });
});

describe('quality copy', () => {
  test('all three languages are present and not copied from English', () => {
    for (const [key, copy] of Object.entries(QUALITY_COPY)) {
      for (const lang of LANGS) expect(copy[lang]?.trim(), `${key}.${lang}`).toBeTruthy();
      if (copy.en.length > 12) {
        expect(copy.uz, `${key}.uz`).not.toBe(copy.en);
        expect(copy.ru, `${key}.ru`).not.toBe(copy.en);
      }
    }
  });

  test('empty states name the real tab, never the retired "Matches" label', () => {
    for (const lang of LANGS) {
      const t = makeT(lang);
      expect(t('sdg.notchosen')).not.toMatch(/Matches|Mosliklar|Подбор/);
      expect(t('empty.choosePath', { tab: t('tab.matches') })).toContain(t('tab.matches'));
    }
  });

  test('badge encouragement uses an idiom native to each language', () => {
    const [uz, ru, en] = LANGS.map((l) => makeT(l)('nb.proverb'));
    expect(uz).toBe('Oz-oz o‘rganib dono bo‘lur.');
    expect(ru).toBe('Дорогу осилит идущий.');
    expect(en).toBe('Little by little, a little becomes a lot.');
    expect(makeT('ru')('nb.msg.some', { name: 'X' })).toContain('X');
  });
});

describe('weekly study availability (1–168 h)', () => {
  test('profiles accept the whole week and clamp beyond it', async () => {
    const { normalizeProfile, MAX_WEEKLY_HOURS } = await import('../src/lib/profile');
    expect(MAX_WEEKLY_HOURS).toBe(168);
    for (const h of [150, 160, 168]) expect(normalizeProfile({ budget: h }).budget).toBe(h);
    expect(normalizeProfile({ budget: 500 }).budget).toBe(168);
    expect(normalizeProfile({ budget: 0 }).budget).toBe(1);
  });

  test('plans are paced realistically: at most 40 h a week, otherwise the user’s hours', async () => {
    const { planningHours, PLAN_PACE_CAP } = await import('../src/lib/profile');
    expect(planningHours(8)).toBe(8);
    expect(planningHours(40)).toBe(40);
    expect(planningHours(168)).toBe(PLAN_PACE_CAP);
    const { pickCourses } = await import('../src/components/skillcast/pathway');
    const { matchAll } = await import('../src/lib/matching');
    const { normalizeProfile } = await import('../src/lib/profile');
    const p = normalizeProfile({ persona: 'working-adult', years: 5, interests: ['technology'], skills: { python: 1, 'data-analysis': 2 } });
    const gap = matchAll(p, {}).find((m) => pickCourses(m.gap, p.inclusion, 8).length > 1)!.gap;
    const weeks = (h: number) => pickCourses(gap, p.inclusion, h).map((n) => n.weeks);
    expect(weeks(168)).toEqual(weeks(40));
    expect(weeks(5).reduce((a, b) => a + b, 0)).toBeGreaterThan(weeks(40).reduce((a, b) => a + b, 0));
  });

  test('copy explains the weekly scope and the high-value note in all languages', () => {
    for (const lang of LANGS) {
      const t = makeT(lang);
      expect(t('onb.budget.hint')).toContain('168');
      expect(t('onb.budget.high', { n: 160, cap: 40 })).toContain('160');
    }
  });
});

describe('skill progression from completed courses', () => {
  test('proposes +1 per taught skill, capped by course depth, and never above it', async () => {
    const { proposeUpdates, LEVEL_CAP } = await import('../src/lib/progression');
    const { COURSE_MAP } = await import('../src/data/courses');
    const course = Object.values(COURSE_MAP).find((c) => c.level === 'beginner' && c.skills.length > 0)!;
    const s = course.skills[0];
    expect(proposeUpdates(course.slug, { [s]: 1 })).toContainEqual({ skill: s, from: 1, to: 2 });
    expect(proposeUpdates(course.slug, {}).find((u) => u.skill === s)).toEqual({ skill: s, from: 0, to: 1 });
    expect(proposeUpdates(course.slug, { [s]: LEVEL_CAP.beginner }).find((u) => u.skill === s)).toBeUndefined();
    expect(proposeUpdates('no-such-course', {})).toEqual([]);
  });

  test('confirmed updates apply, recompute matches, and un-marking reverts them', async () => {
    const { useSkillCast } = await import('../src/lib/store');
    const { matchAll } = await import('../src/lib/matching');
    const { proposeUpdates } = await import('../src/lib/progression');
    const st = useSkillCast.getState();
    st.resetDemo();
    st.setProfile({ persona: 'working-adult', years: 5, interests: ['technology'], skills: { 'data-analysis': 2, python: 1 } });
    const before = matchAll(useSkillCast.getState().profile, {}).find((m) => m.roleSlug === 'data-analyst')!.score;
    useSkillCast.getState().toggleCourse('kaggle-pandas');
    const proposals = proposeUpdates('kaggle-pandas', useSkillCast.getState().profile.skills);
    expect(proposals.length).toBeGreaterThan(0);
    const log = useSkillCast.getState().confirmSkillUpdates('kaggle-pandas', proposals);
    expect(log.length).toBe(proposals.length);
    const raised = useSkillCast.getState().profile.skills;
    for (const u of proposals) expect(raised[u.skill]).toBe(u.to);
    const after = matchAll(useSkillCast.getState().profile, {}).find((m) => m.roleSlug === 'data-analyst')!.score;
    expect(after).toBeGreaterThanOrEqual(before);
    useSkillCast.getState().toggleCourse('kaggle-pandas'); // un-mark
    expect(useSkillCast.getState().completedCourses).not.toContain('kaggle-pandas');
    expect(useSkillCast.getState().profile.skills).toEqual({ 'data-analysis': 2, python: 1 });
    expect(useSkillCast.getState().skillUpdates).toEqual([]);
  });

  test('a completed course stays on the path after its gap closes', async () => {
    const { rolePathway } = await import('../src/components/skillcast/pathway');
    const { matchAll } = await import('../src/lib/matching');
    const { normalizeProfile } = await import('../src/lib/profile');
    const p = normalizeProfile({ persona: 'working-adult', years: 5, interests: ['technology'], skills: { 'data-analysis': 5, python: 5 } });
    const m = matchAll(p, {}).find((x) => x.roleSlug === 'data-analyst')!;
    expect(rolePathway(m, p, ['kaggle-pandas']).map((n) => n.courseSlug)).toContain('kaggle-pandas');
  });
});

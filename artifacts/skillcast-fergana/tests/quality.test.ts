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

describe('occupation taxonomy and autocomplete', () => {
  test('covers every sector with unique, trilingual, valid entries', async () => {
    const { OCCUPATIONS, SECTORS } = await import('../src/data/occupations');
    const { SKILL_MAP } = await import('../src/data/skills');
    expect(new Set(OCCUPATIONS.map((o) => o.id)).size).toBe(OCCUPATIONS.length);
    for (const sec of SECTORS) expect(OCCUPATIONS.some((o) => o.sector === sec.id), sec.id).toBe(true);
    for (const o of OCCUPATIONS) {
      for (const l of LANGS) expect(o.name[l].trim(), o.id).toBeTruthy();
      expect(o.name.uz).not.toMatch(/[а-яё]/i);
      for (const sk of o.skills) expect(SKILL_MAP[sk], `${o.id}:${sk}`).toBeDefined();
      if (o.isco) expect(o.isco).toMatch(/^\d{4}$/);
    }
  });

  test('partial words find the right professions in all three languages', async () => {
    const { searchOccupations } = await import('../src/data/occupations');
    const top = (q: string, l: 'en' | 'uz' | 'ru') => searchOccupations(q, l).map((h) => h.item.id);
    expect(top('soft', 'en')[0]).toBe('software-developer');
    expect(top('design', 'en').slice(0, 4)).toEqual(expect.arrayContaining(['graphic-designer', 'ux-designer', 'interior-designer']));
    expect(top('design', 'en')).not.toContain('actor-performer');
    expect(top('emb', 'en')[0]).toBe('embroiderer');
    expect(top('agri', 'en')).toEqual(expect.arrayContaining(['agri-technician', 'agronomist', 'crop-farmer']));
    expect(top("o'qituvchi", 'uz')).toContain('school-teacher');
    expect(top('кашта', 'ru')).toEqual([]);
    expect(top('выш', 'ru')[0]).toBe('embroiderer');
    expect(top('teacher', 'uz')[0]).toBe('school-teacher');
  });

  test('a selected profession feeds matching, and current ≠ target', async () => {
    const { normalizeProfile } = await import('../src/lib/profile');
    const { strategyPriority } = await import('../src/lib/matching');
    const base = { persona: 'working-adult', years: 3, interests: ['health'], skills: { communication: 3 } };
    const nurse = normalizeProfile({ ...base, extended: { careerStrategy: 'enhance', professionId: 'nurse', profession: 'Hamshira' } });
    expect(strategyPriority(nurse, 'telehealth-coordinator')).toBe(0);
    const target = normalizeProfile({ ...base, extended: { careerStrategy: 'new-field', professionId: 'nurse', targetOccupationId: 'solar-installer' } });
    expect(target.extended.professionId).toBe('nurse');
    expect(target.extended.targetOccupationId).toBe('solar-installer');
    expect(strategyPriority(target, 'solar-technician')).toBe(0);
    expect(normalizeProfile({ extended: { professionId: 'made-up' } }).extended.professionId).toBe('');
  });
});

describe('badge rewards', () => {
  const base = {
    onboarded: true, ratedSkills: 0, chosenRole: false, readiness: 0, coursesDone: 0, aiCoursesDone: 0, greenCoursesDone: 0,
    activeDays: 0, levelUps: 0, milestones: 0, pathway: { done: 0, total: 0 }, roleMilestones: { done: 0, total: 0 },
  };

  test('badges come from real progress, in tier order', async () => {
    const { eligibleBadges, ALL_BADGES } = await import('../src/lib/achievements');
    expect(ALL_BADGES.length).toBe(24);
    expect(eligibleBadges({ ...base, onboarded: false })).toEqual([]);
    expect(eligibleBadges(base)).toEqual(['first-steps:bronze']);
    const some = eligibleBadges({ ...base, ratedSkills: 6, chosenRole: true, readiness: 70, coursesDone: 3, aiCoursesDone: 1, levelUps: 5, activeDays: 2, pathway: { done: 3, total: 5 } });
    expect(some).toContain('first-steps:gold');
    expect(some).toContain('career-explorer:silver');
    expect(some).not.toContain('career-explorer:gold');
    expect(some).toContain('knowledge-seeker:silver');
    expect(some).toContain('skill-builder:silver');
    expect(some).toContain('curious-mind:bronze');
    expect(some).not.toContain('curious-mind:silver');
    expect(some).toContain('future-ready:bronze');
    expect(some).not.toContain('future-ready:silver');
    // A finished pathway alone is not enough without real skill growth.
    expect(eligibleBadges({ ...base, chosenRole: true, readiness: 42, pathway: { done: 1, total: 1 } })).not.toContain('future-ready:silver');
    expect(eligibleBadges({ ...base, chosenRole: true, readiness: 72, pathway: { done: 1, total: 1 } })).toContain('future-ready:silver');
    // An empty pathway never counts as "half done".
    expect(eligibleBadges({ ...base, pathway: { done: 0, total: 0 } })).not.toContain('future-ready:bronze');
  });

  test('rewards: titles, themes, completed sets and milestones', async () => {
    const { rewardsFor, titleFor, WIND_ROSE_THEMES } = await import('../src/lib/achievements');
    expect(titleFor(0).current).toBe('newcomer');
    expect(titleFor(3).current).toBe('explorer');
    expect(rewardsFor('first-steps:gold', ['first-steps:bronze', 'first-steps:silver'])).toMatchObject({ set: 'first-steps', title: 'explorer', theme: 'saffron' });
    expect(WIND_ROSE_THEMES.silk.unlock(['a', 'b', 'c', 'd'])).toBe(false);
    expect(rewardsFor('x:bronze', ['1', '2', '3', '4', '5']).milestone).toBe(25);
  });

  test('earned badges and seen reveals persist; reset clears them', async () => {
    const { useSkillCast } = await import('../src/lib/store');
    const st = useSkillCast.getState();
    st.resetDemo();
    st.awardBadges(['first-steps:bronze', 'not-a-badge']);
    st.markBadgesSeen(['first-steps:bronze']);
    const firstAt = useSkillCast.getState().badges['first-steps:bronze'];
    st.awardBadges(['first-steps:bronze']);
    expect(useSkillCast.getState().badges['first-steps:bronze']).toBe(firstAt);
    const saved = JSON.parse(localStorage.getItem('skillcast-poc')!).state;
    const merged = useSkillCast.persist.getOptions().merge!(saved, useSkillCast.getState());
    expect(Object.keys(merged.badges)).toEqual(['first-steps:bronze']);
    expect(merged.badgesSeen).toEqual(['first-steps:bronze']);
    expect(merged.badgeSound).toBe(false);
    st.toggleCourse('python-for-data');
    expect(useSkillCast.getState().activeDays.length).toBe(1);
    st.resetDemo();
    expect(useSkillCast.getState().badges).toEqual({});
    expect(useSkillCast.getState().activeDays).toEqual([]);
  });

  test('every category, tier and title is translated', async () => {
    const { CATEGORIES, TIERS, TITLES } = await import('../src/lib/achievements');
    for (const lang of LANGS) {
      const t = makeT(lang);
      for (const cat of CATEGORIES) {
        t(`ach.cat.${cat.id}`); t(`ach.why.${cat.id}`);
        for (const tier of TIERS) { t(`ach.req.${cat.id}.${tier}`); t(`ach.tier.${tier}`); t(`ach.msg.${tier}`); }
      }
      for (const title of TITLES) t(`ach.titles.${title.id}`);
    }
  });
});

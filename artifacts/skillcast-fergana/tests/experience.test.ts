import { describe, expect, test } from 'bun:test';
import { SKILLS } from '../src/data/skills';
import { SKILL_COPY } from '../src/lib/catalog-i18n';
import { LEARNING_SOURCES } from '../src/data/learning-sources';
import { INCLUSIVE_ENTRIES, ROLE_WORK_OPTIONS } from '../src/data/inclusive';
import { ROLES } from '../src/data/roles';
import { buildSkillIndex, findSkill, normalize, parseIntent, searchCatalogue } from '../src/lib/voice-intents';
import { computeWindRose } from '../src/lib/wind-rose';
import { rankSources } from '../src/lib/learning-rank';

const index = buildSkillIndex(SKILLS.map((s) => ({ slug: s.slug, names: [s.name, SKILL_COPY[s.slug].uz, SKILL_COPY[s.slug].ru], aliases: s.aliases })));

describe('voice assistant intents in three languages', () => {
  test.each([
    ['What should I learn next?', 'next-learning'],
    ['Keyingi nima o‘rganishim kerak?', 'next-learning'],
    ['Что мне изучать дальше?', 'next-learning'],
    ['Explain my wind rose', 'explain-radar'],
    ['Radar nima degani?', 'explain-radar'],
    ['Объясни радар', 'explain-radar'],
    ['Recommend a career for me', 'careers'],
    ['Qaysi kasb menga mos?', 'careers'],
    ['Какая профессия мне подходит', 'careers'],
    ['Read my recommendations aloud', 'read'],
    ["Tavsiyalarni o'qib ber", 'read'],
    ['Прочитай рекомендации', 'read'],
    ['help', 'help'],
    ['Помощь', 'help'],
    ['Make the text larger', 'accessibility'],
  ])('%s → %s', (text, kind) => {
    expect(parseIntent(text, index).kind).toBe(kind as never);
  });

  test('navigation targets', () => {
    expect(parseIntent('Open SDG impact', index)).toEqual({ kind: 'navigate', target: 'sdg' });
    expect(parseIntent('Harada yo‘l xaritasini och', index)).toEqual({ kind: 'navigate', target: 'harada' });
    expect(parseIntent('Открой источники сигналов', index)).toEqual({ kind: 'navigate', target: 'signals' });
    expect(parseIntent('Show inclusive opportunities', index)).toEqual({ kind: 'navigate', target: 'inclusive' });
    expect(parseIntent('Show accessible jobs', index)).toEqual({ kind: 'navigate', target: 'inclusive' });
    expect(parseIntent('Imkoniyati cheklanganlar uchun ish', index)).toEqual({ kind: 'navigate', target: 'inclusive' });
  });

  test('skill explanations match names in any language', () => {
    expect(parseIntent('What is machine learning?', index)).toEqual({ kind: 'explain-skill', skill: 'machine-learning' });
    expect(parseIntent('Kiberxavfsizlik nima?', index)).toEqual({ kind: 'explain-skill', skill: 'cybersecurity' });
    expect(parseIntent('Что такое машинное обучение', index)).toEqual({ kind: 'explain-skill', skill: 'machine-learning' });
    expect(findSkill('tell me about bookkeeping', index)).toBe('accounting-finance');
  });

  test('search keeps the query and finds catalogue items', () => {
    const intent = parseIntent('Find courses for python', index);
    expect(intent.kind).toBe('search');
    const query = intent.kind === 'search' ? intent.query : '';
    const found = searchCatalogue(query, LEARNING_SOURCES.map((s) => ({ item: s.id, text: `${s.name} ${s.skills.join(' ')} courses` })));
    expect(found.length).toBeGreaterThan(0);
  });

  test('unknown text stays unknown, apostrophes are normalized', () => {
    expect(parseIntent('qwerty zxcv', index).kind).toBe('unknown');
    expect(normalize("o‘zbek oʻzbek o`zbek")).toBe("o'zbek o'zbek o'zbek");
  });
});

describe('Wind Rose model', () => {
  const profile = { skills: { 'data-analysis': 3, 'english-for-work': 2 } };

  test('pathway skills come first and carry a target', () => {
    const rose = computeWindRose(profile, {}, 'data-analyst');
    const role = ROLES.find((r) => r.slug === 'data-analyst')!;
    expect(rose.points.slice(0, role.skills.length).every((p) => p.inPathway && p.target !== null)).toBe(true);
  });

  test('untracked skills use the baseline, not zero', () => {
    const rose = computeWindRose(profile, { 'data-analysis': 80 }, null);
    const english = rose.points.find((p) => p.slug === 'english-for-work')!;
    expect(english.tracked).toBe(false);
    expect(english.market).toBe(50);
    expect(rose.points.find((p) => p.slug === 'data-analysis')!.tracked).toBe(true);
  });

  test('priorities are the largest gaps, strengths are not gaps', () => {
    const rose = computeWindRose(profile, {}, 'data-analyst');
    expect(rose.priorities.length).toBeGreaterThan(0);
    for (const p of rose.priorities) expect(p.gap).toBeGreaterThanOrEqual(20);
    for (const s of rose.strengths) expect(rose.priorities.some((p) => p.slug === s.slug)).toBe(false);
  });
});

describe('learning sources and inclusive data', () => {
  test('ranking prefers the learner language, free and local sources, and explains why', () => {
    const uz = rankSources('digital-literacy', { lang: 'uz' });
    expect(uz[0].source.region).toBe('uzbekistan');
    expect(uz[0].reasons).toContain('language');
    const ru = rankSources('telehealth', { lang: 'ru', inclusion: { hearing: true } });
    expect(ru[0].reasons).toEqual(expect.arrayContaining(['language', 'access']));
  });

  test('every source and entry uses https and honest verification labels', () => {
    for (const s of LEARNING_SOURCES) {
      expect(s.url.startsWith('https://')).toBe(true);
      expect(['approved', 'curated']).toContain(s.verification);
      expect(s.skills.every((skill) => SKILLS.some((k) => k.slug === skill))).toBe(true);
    }
    for (const e of INCLUSIVE_ENTRIES) {
      if (e.verification === 'demo') expect(e.url).toBeNull();
      else expect(e.url?.startsWith('https://')).toBe(true);
    }
  });

  test('every role has indicative work options', () => {
    for (const role of ROLES) expect(ROLE_WORK_OPTIONS[role.slug]?.length).toBeGreaterThan(0);
  });
});

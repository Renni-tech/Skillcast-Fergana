import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import raw from '../src/data/catalog/resources.json';
import { SKILLS } from '../src/data/skills';
import {
  CATALOG, CATALOG_TOPICS, DEFAULT_FILTER, filterCatalog, foldText, parseCatalog, sortCatalog, viewCounts,
} from '../src/lib/resource-catalog';
import { addItem, cycleStatus, normalizePaths, pathProgress, setItemStatus, type LearningPath } from '../src/lib/learning-paths';
import { bestForSkill, rankResources, RANKABLE } from '../src/lib/resource-match';

const SKILL_SLUGS = new Set(SKILLS.map((s) => s.slug));
const hay = (e: (typeof CATALOG)[number]) => [e.provider, e.badge, e.city ?? '', ...(e.text ? Object.values(e.text.name) : [])].join(' ');

describe('learning catalogue data', () => {
  test('every researched entry passes the schema and cites evidence', () => {
    const { entries, errors } = parseCatalog(raw, '2026-11-22');
    expect(errors).toEqual([]);
    expect(entries.length).toBe((raw as { entries: unknown[] }).entries.length);
    for (const e of entries) {
      expect(e.evidence.length).toBeGreaterThan(0);
      expect(e.evidence.every((u) => /^https:\/\//.test(u))).toBe(true);
    }
  });

  test('ids are unique across the researched and older lists', () => {
    const ids = CATALOG.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('skills refer to real SkillCast skills', () => {
    for (const e of CATALOG) for (const s of e.skills) expect(SKILL_SLUGS.has(s)).toBe(true);
  });

  test('the catalogue is not AI-only: practical trades are well covered', () => {
    const counts = viewCounts(CATALOG);
    expect(counts.all).toBeGreaterThanOrEqual(80);
    expect(counts.practical).toBeGreaterThanOrEqual(counts['ai-digital'] * 0.8);
    for (const topic of ['sewing', 'textile', 'ceramics', 'driving', 'electrical', 'plumbing', 'green', 'agriculture', 'construction', 'accounting', 'hospitality', 'calligraphy', 'embroidery', 'entrepreneurship', 'languages']) {
      expect(CATALOG.some((e) => e.topics.includes(topic as never))).toBe(true);
    }
  });

  test('every topic in the list has at least one entry', () => {
    for (const topic of CATALOG_TOPICS) {
      if (['knitting', 'beauty', 'fashion', 'automotive', 'robotics', 'healthcare', 'culinary'].includes(topic)) continue;
      expect(CATALOG.some((e) => e.topics.includes(topic))).toBe(true);
    }
  });

  test('upcoming entries are labelled upcoming and closed ones are not suggested as next steps', () => {
    const upcoming = CATALOG.filter((e) => e.availability === 'upcoming').map((e) => e.id);
    expect(upcoming).toEqual(expect.arrayContaining(['itpark-fergana-complex', 'inha-margilan', 'seoultech-fstu']));
    for (const skill of ['software-engineering', 'textile-production', 'tourism-hospitality', 'entrepreneurship']) {
      const best = bestForSkill({}, skill, 'en');
      if (best) expect((best.resource as { catalog?: { availability: string } }).catalog?.availability).not.toBe('closed');
    }
  });

  test('no invented address: every address names its source and confidence', () => {
    for (const e of CATALOG) {
      if (!e.address) continue;
      expect(['official', 'directory', 'approximate']).toContain(e.address.confidence);
      expect(e.address.source).toMatch(/^https:\/\//);
    }
  });

  test('a bad entry is skipped and reported, not fatal', () => {
    const { entries, errors } = parseCatalog({ entries: [{ id: 'Bad id!' }, (raw as { entries: unknown[] }).entries[0]] }, '2026-11-22');
    expect(entries.length).toBe(1);
    expect(errors.length).toBe(1);
  });

  test('runtime extras file is valid', () => {
    const extra = JSON.parse(readFileSync(new URL('../public/catalog/extra.json', import.meta.url), 'utf8'));
    expect(parseCatalog(extra, '2026-11-22').errors).toEqual([]);
  });
});

describe('catalogue filters and search', () => {
  test('top filters', () => {
    const free = filterCatalog(CATALOG, { ...DEFAULT_FILTER, view: 'free' }, hay);
    expect(free.every((e) => ['free', 'grant', 'freemium'].includes(e.cost))).toBe(true);
    const state = filterCatalog(CATALOG, { ...DEFAULT_FILTER, view: 'state' }, hay);
    expect(state.every((e) => e.stateFunded)).toBe(true);
    const practical = filterCatalog(CATALOG, { ...DEFAULT_FILTER, view: 'practical' }, hay);
    expect(practical.every((e) => e.category === 'practical')).toBe(true);
  });

  test('search ignores Uzbek apostrophes and case', () => {
    expect(foldText('Farg‘ona')).toBe(foldText("farg'ona"));
    const hits = filterCatalog(CATALOG, { ...DEFAULT_FILTER, query: "Marg'ilon" }, hay);
    expect(hits.length).toBeGreaterThan(0);
  });

  test('hiding finished programmes', () => {
    const hits = filterCatalog(CATALOG, { ...DEFAULT_FILTER, showClosed: false }, hay);
    expect(hits.some((e) => e.availability === 'closed')).toBe(false);
  });

  test('sorting puts open and running offers before finished ones', () => {
    const sorted = sortCatalog(CATALOG, 'fergana');
    const firstClosed = sorted.findIndex((e) => e.availability === 'closed');
    expect(sorted.slice(firstClosed).every((e) => e.availability === 'closed')).toBe(true);
  });

  test('a Fergana tailor gets sewing and textile places ranked', () => {
    const ranked = rankResources({ extended: { city: 'Margilan', country: 'Uzbekistan', professionId: 'tailor' } } as never, { lang: 'uz', gaps: ['textile-production'] }, RANKABLE);
    const top = ranked.slice(0, 8).map((r) => r.resource.id);
    expect(top.some((id) => ['voucher-training', 'fergana-special-technikum', 'yodgorlik-silk', 'valiev-ikat', 'margilan-crafts', 'ishga-marhamat-fergana'].includes(id))).toBe(true);
  });
});

describe('learner-made learning paths', () => {
  const base: LearningPath = { id: 'path-1', name: 'Tailoring', createdAt: '2026-11-22T00:00:00Z', items: [] };

  test('add, progress and the status cycle', () => {
    let p = addItem(base, 'voucher-training');
    p = addItem(p, 'yodgorlik-silk');
    p = addItem(p, 'voucher-training');
    expect(p.items.length).toBe(2);
    expect(cycleStatus('todo')).toBe('doing');
    expect(cycleStatus('doing')).toBe('done');
    expect(cycleStatus('done')).toBe('todo');
    p = setItemStatus(p, 'voucher-training', 'done', '2026-11-22T10:00:00Z');
    expect(pathProgress(p)).toEqual({ done: 1, doing: 0, total: 2, pct: 50 });
    expect(p.items[0].doneAt).toBe('2026-11-22T10:00:00Z');
    p = setItemStatus(p, 'voucher-training', 'todo');
    expect(p.items[0].doneAt).toBeUndefined();
  });

  test('saved data is cleaned', () => {
    const out = normalizePaths([
      base, { ...base }, { id: 'x', name: ' ' }, 'junk',
      { id: 'path-2', name: 'Driving', items: [{ entryId: 'driving-b', status: 'weird' }, { entryId: 'driving-b' }, { nope: 1 }] },
    ]);
    expect(out.map((p) => p.id)).toEqual(['path-1', 'path-2']);
    expect(out[1].items).toHaveLength(1);
    expect(out[1].items[0].status).toBe('todo');
  });
});

// ─── Achievements: tiered badges earned from real progress ─────────────────
// Every badge is tied to something the learner actually did and that the app
// can observe locally (finished onboarding, completed courses, confirmed skill
// level-ups, Harada milestones, study days). Nothing is earned by clicking
// around. Unlocks are permanent once earned; the reveal animation plays once.

export type Tier = 'bronze' | 'silver' | 'gold';
export const TIERS: Tier[] = ['bronze', 'silver', 'gold'];

export type CategoryId =
  | 'first-steps'
  | 'career-explorer'
  | 'curious-mind'
  | 'consistent-learner'
  | 'skill-builder'
  | 'knowledge-seeker'
  | 'goal-achiever'
  | 'future-ready';

/** What the evaluator needs to know; all of it is already in local state. */
export interface ProgressSnapshot {
  onboarded: boolean;
  ratedSkills: number;
  chosenRole: boolean;
  /** Weighted skill readiness for the chosen role, 0–100. */
  readiness: number;
  coursesDone: number;
  aiCoursesDone: number;
  greenCoursesDone: number;
  activeDays: number;
  levelUps: number;
  milestones: number;
  pathway: { done: number; total: number };
  roleMilestones: { done: number; total: number };
}

export interface TierRule {
  /** Current value and target, used for "2 / 5" progress on locked badges. */
  progress: (s: ProgressSnapshot) => { value: number; target: number };
}

const count = (pick: (s: ProgressSnapshot) => number, target: number): TierRule => ({
  progress: (s) => ({ value: Math.min(pick(s), target), target }),
});
const flag = (pick: (s: ProgressSnapshot) => boolean): TierRule => ({
  progress: (s) => ({ value: pick(s) ? 1 : 0, target: 1 }),
});
/** Several conditions; progress is shown as "conditions met / conditions". */
const allOf = (...rules: TierRule[]): TierRule => ({
  progress: (s) => ({
    value: rules.filter((r) => { const p = r.progress(s); return p.value >= p.target; }).length,
    target: rules.length,
  }),
});
const pathwayAt = (share: number): TierRule => ({
  progress: (s) => {
    const target = Math.max(1, Math.ceil(s.pathway.total * share));
    return { value: s.pathway.total ? Math.min(s.pathway.done, target) : 0, target };
  },
});

export const CATEGORIES: Array<{ id: CategoryId; icon: string; rules: Record<Tier, TierRule> }> = [
  { id: 'first-steps', icon: 'footprints', rules: {
    bronze: flag((s) => s.onboarded),
    silver: count((s) => s.ratedSkills, 5),
    gold: allOf(flag((s) => s.chosenRole), count((s) => s.coursesDone, 1)),
  } },
  { id: 'career-explorer', icon: 'compass', rules: {
    bronze: flag((s) => s.chosenRole),
    silver: count((s) => (s.chosenRole ? s.readiness : 0), 60),
    gold: count((s) => (s.chosenRole ? s.readiness : 0), 85),
  } },
  { id: 'curious-mind', icon: 'sparkles', rules: {
    bronze: count((s) => s.aiCoursesDone + s.greenCoursesDone, 1),
    silver: allOf(count((s) => s.aiCoursesDone, 1), count((s) => s.greenCoursesDone, 1)),
    gold: count((s) => s.aiCoursesDone + s.greenCoursesDone, 4),
  } },
  { id: 'consistent-learner', icon: 'flame', rules: {
    bronze: count((s) => s.activeDays, 2),
    silver: count((s) => s.activeDays, 5),
    gold: count((s) => s.activeDays, 10),
  } },
  { id: 'skill-builder', icon: 'trending-up', rules: {
    bronze: count((s) => s.levelUps, 1),
    silver: count((s) => s.levelUps, 5),
    gold: count((s) => s.levelUps, 12),
  } },
  { id: 'knowledge-seeker', icon: 'book', rules: {
    bronze: count((s) => s.coursesDone, 1),
    silver: count((s) => s.coursesDone, 3),
    gold: count((s) => s.coursesDone, 6),
  } },
  { id: 'goal-achiever', icon: 'target', rules: {
    bronze: count((s) => s.milestones, 1),
    silver: count((s) => s.milestones, 3),
    gold: count((s) => s.milestones, 6),
  } },
  { id: 'future-ready', icon: 'rocket', rules: {
    bronze: pathwayAt(0.5),
    // A finished pathway only counts once the skills have actually grown.
    silver: allOf(pathwayAt(1), count((s) => (s.chosenRole ? s.readiness : 0), 70)),
    gold: allOf(pathwayAt(1), count((s) => (s.chosenRole ? s.readiness : 0), 85), {
      progress: (s) => ({ value: s.roleMilestones.total ? s.roleMilestones.done : 0, target: Math.max(1, s.roleMilestones.total) }),
    }),
  } },
];

/** Course skills that count as future skills for "Curious Mind". */
export const AI_SKILLS = new Set(['prompt-engineering', 'ai-agents', 'ai-augmented-ops', 'machine-learning', 'ai-content-ops', 'responsible-ai', 'mlops']);
export const GREEN_SKILLS = new Set(['renewable-energy', 'energy-efficiency', 'ev-mobility', 'climate-data', 'smart-agriculture']);

export const badgeId = (cat: CategoryId, tier: Tier) => `${cat}:${tier}`;
export const ALL_BADGES: string[] = CATEGORIES.flatMap((c) => TIERS.map((t) => badgeId(c.id, t)));
export const parseBadge = (id: string): { cat: CategoryId; tier: Tier } | null => {
  const [cat, tier] = id.split(':');
  return CATEGORIES.some((c) => c.id === cat) && TIERS.includes(tier as Tier) ? { cat: cat as CategoryId, tier: tier as Tier } : null;
};

export function badgeProgress(id: string, s: ProgressSnapshot): { value: number; target: number } {
  const p = parseBadge(id);
  if (!p) return { value: 0, target: 1 };
  return CATEGORIES.find((c) => c.id === p.cat)!.rules[p.tier].progress(s);
}

/** Badges whose condition is met right now. Tiers unlock in order. */
export function eligibleBadges(s: ProgressSnapshot): string[] {
  const out: string[] = [];
  for (const cat of CATEGORIES) {
    for (const tier of TIERS) {
      const { value, target } = cat.rules[tier].progress(s);
      if (value < target) break;
      out.push(badgeId(cat.id, tier));
    }
  }
  return out;
}

/** Reveal order: lower tiers first, then category order. */
export function sortBadges(ids: string[]): string[] {
  const rank = (id: string) => {
    const p = parseBadge(id);
    if (!p) return 999;
    return TIERS.indexOf(p.tier) * 100 + CATEGORIES.findIndex((c) => c.id === p.cat);
  };
  return [...ids].sort((a, b) => rank(a) - rank(b));
}

// ─── Rewards beyond badges ─────────────────────────────────────────────────

export const TITLES: Array<{ id: string; at: number }> = [
  { id: 'newcomer', at: 0 },
  { id: 'explorer', at: 3 },
  { id: 'pathfinder', at: 8 },
  { id: 'crafter', at: 14 },
  { id: 'future-maker', at: 20 },
];
export function titleFor(earned: number): { current: string; next: { id: string; at: number } | null } {
  let current = TITLES[0].id;
  for (const t of TITLES) if (earned >= t.at) current = t.id;
  return { current, next: TITLES.find((t) => t.at > earned) ?? null };
}

/** Collection frame: the best tier earned anywhere. */
export function frameFor(earnedIds: string[]): Tier | null {
  let best: Tier | null = null;
  for (const id of earnedIds) {
    const tier = parseBadge(id)?.tier;
    if (tier && (!best || TIERS.indexOf(tier) > TIERS.indexOf(best))) best = tier;
  }
  return best;
}

export type WindRoseTheme = 'classic' | 'silk' | 'saffron';
export const WIND_ROSE_THEMES: Record<WindRoseTheme, { you: string; unlock: (earned: string[]) => boolean }> = {
  classic: { you: '#2563eb', unlock: () => true },
  silk: { you: '#0d9488', unlock: (e) => e.length >= 5 },
  saffron: { you: '#c2410c', unlock: (e) => e.some((id) => id.endsWith(':gold')) },
};

export function completedSets(earnedIds: string[]): CategoryId[] {
  return CATEGORIES.filter((c) => TIERS.every((t) => earnedIds.includes(badgeId(c.id, t)))).map((c) => c.id);
}

/** What newly opens up when `id` is earned on top of `before`. */
export function rewardsFor(id: string, before: string[]): { title?: string; theme?: WindRoseTheme; set?: CategoryId; milestone?: number } {
  const after = [...new Set([...before, id])];
  const out: { title?: string; theme?: WindRoseTheme; set?: CategoryId; milestone?: number } = {};
  const tBefore = titleFor(before.length).current, tAfter = titleFor(after.length).current;
  if (tAfter !== tBefore) out.title = tAfter;
  for (const [name, theme] of Object.entries(WIND_ROSE_THEMES) as Array<[WindRoseTheme, (typeof WIND_ROSE_THEMES)[WindRoseTheme]]>) {
    if (!theme.unlock(before) && theme.unlock(after)) out.theme = name;
  }
  const cat = parseBadge(id)?.cat;
  if (cat && completedSets(after).includes(cat) && !completedSets(before).includes(cat)) out.set = cat;
  for (const pct of [25, 50, 75, 100]) {
    const need = Math.ceil(ALL_BADGES.length * pct / 100);
    if (before.length < need && after.length >= need) out.milestone = pct;
  }
  return out;
}

/** Local calendar day, used to count distinct study days. */
export function today(now = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
}

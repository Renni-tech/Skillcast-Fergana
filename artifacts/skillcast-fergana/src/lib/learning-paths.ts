// ─── Learning paths the learner builds themselves ──────────────────────────
// Besides the roadmap SkillCast computes for the chosen pathway, a learner can
// keep any number of their own paths (Robotics, Tailoring, Driving …), each a
// list of catalogue entries with its own progress. Progress is stored in this
// browser only; SkillCast cannot see what happens on the provider's site, so
// the learner marks steps themselves.
//
// A path is never "finished for good": when every step is done the UI offers
// to add another course or start a new path.

export type PathItemStatus = 'todo' | 'doing' | 'done';

export interface PathItem {
  entryId: string;
  status: PathItemStatus;
  addedAt: string;
  doneAt?: string;
}

export interface LearningPath {
  id: string;
  name: string;
  createdAt: string;
  items: PathItem[];
}

export const MAX_PATHS = 12;
export const MAX_ITEMS = 40;
const STATUSES: PathItemStatus[] = ['todo', 'doing', 'done'];

export function newPathId(existing: LearningPath[]): string {
  let n = existing.length + 1;
  while (existing.some((p) => p.id === `path-${n}`)) n++;
  return `path-${n}`;
}

export function pathProgress(path: LearningPath): { done: number; doing: number; total: number; pct: number } {
  const done = path.items.filter((i) => i.status === 'done').length;
  const doing = path.items.filter((i) => i.status === 'doing').length;
  const total = path.items.length;
  return { done, doing, total, pct: total ? Math.round((done / total) * 100) : 0 };
}

/** Next status when the learner taps a step: to do → in progress → done → to do. */
export function cycleStatus(s: PathItemStatus): PathItemStatus {
  return s === 'todo' ? 'doing' : s === 'doing' ? 'done' : 'todo';
}

export function addItem(path: LearningPath, entryId: string, at = new Date().toISOString()): LearningPath {
  if (path.items.some((i) => i.entryId === entryId) || path.items.length >= MAX_ITEMS) return path;
  return { ...path, items: [...path.items, { entryId, status: 'todo', addedAt: at }] };
}

export function setItemStatus(path: LearningPath, entryId: string, status: PathItemStatus, at = new Date().toISOString()): LearningPath {
  return {
    ...path,
    items: path.items.map((i) => (i.entryId === entryId
      ? { ...i, status, doneAt: status === 'done' ? (i.doneAt ?? at) : undefined }
      : i)),
  };
}

/** Saved data is untrusted: keep only well-formed paths and items. */
export function normalizePaths(input: unknown): LearningPath[] {
  if (!Array.isArray(input)) return [];
  const out: LearningPath[] = [];
  for (const raw of input.slice(0, MAX_PATHS)) {
    if (!raw || typeof raw !== 'object') continue;
    const p = raw as Partial<LearningPath>;
    if (typeof p.id !== 'string' || typeof p.name !== 'string' || !p.name.trim()) continue;
    if (out.some((o) => o.id === p.id)) continue;
    const items: PathItem[] = [];
    for (const it of Array.isArray(p.items) ? p.items.slice(0, MAX_ITEMS) : []) {
      if (!it || typeof it !== 'object' || typeof it.entryId !== 'string') continue;
      if (items.some((i) => i.entryId === it.entryId)) continue;
      items.push({
        entryId: it.entryId,
        status: STATUSES.includes(it.status) ? it.status : 'todo',
        addedAt: typeof it.addedAt === 'string' ? it.addedAt : new Date(0).toISOString(),
        ...(typeof it.doneAt === 'string' && it.status === 'done' ? { doneAt: it.doneAt } : {}),
      });
    }
    out.push({ id: p.id, name: p.name.trim().slice(0, 60), createdAt: typeof p.createdAt === 'string' ? p.createdAt : new Date(0).toISOString(), items });
  }
  return out;
}

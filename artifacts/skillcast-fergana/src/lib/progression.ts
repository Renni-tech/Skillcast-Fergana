// ─── Skill progression from completed courses ─────────────────────────────
// Transparent rule, always confirmed by the user before it is applied:
//
//   A completed course can raise each skill it teaches by ONE level,
//   up to the depth of the course: beginner → 3, intermediate → 4,
//   advanced → 5. A skill already at or above that level is unchanged.
//
// Every applied change is logged with its course, so un-marking the course
// reverts exactly what it changed (only if the user has not edited that
// skill since). Nothing is raised just because a button was clicked.
import { COURSE_MAP } from '@/data/courses';
import type { CourseDef } from '@/lib/types';

export const LEVEL_CAP: Record<CourseDef['level'], number> = { beginner: 3, intermediate: 4, advanced: 5 };

export interface SkillUpdate {
  courseSlug: string;
  skill: string;
  from: number;
  to: number;
  at: string; // ISO time
}

export interface ProposedUpdate { skill: string; from: number; to: number }

/** Level changes a completed course may justify, given current levels. */
export function proposeUpdates(courseSlug: string, skills: Record<string, number>): ProposedUpdate[] {
  const course = COURSE_MAP[courseSlug];
  if (!course) return [];
  const cap = LEVEL_CAP[course.level];
  return course.skills
    .map((skill) => {
      const from = skills[skill] ?? 0;
      return { skill, from, to: Math.min(cap, from + 1) };
    })
    .filter((u) => u.to > u.from);
}

/** Applies confirmed updates; returns the new skills and the log entries. */
export function applyUpdates(
  courseSlug: string, chosen: ProposedUpdate[], skills: Record<string, number>, now = new Date(),
): { skills: Record<string, number>; log: SkillUpdate[] } {
  const next = { ...skills };
  const log: SkillUpdate[] = [];
  for (const u of chosen) {
    if ((next[u.skill] ?? 0) !== u.from) continue; // stale proposal: level changed meanwhile
    next[u.skill] = u.to;
    log.push({ courseSlug, skill: u.skill, from: u.from, to: u.to, at: now.toISOString() });
  }
  return { skills: next, log };
}

/** Reverts a course's logged updates where the level is still what the course set. */
export function revertUpdates(
  courseSlug: string, log: SkillUpdate[], skills: Record<string, number>,
): { skills: Record<string, number>; log: SkillUpdate[] } {
  const next = { ...skills };
  for (const u of log.filter((e) => e.courseSlug === courseSlug)) {
    if (next[u.skill] !== u.to) continue; // edited by the user since: keep their value
    if (u.from <= 0) delete next[u.skill];
    else next[u.skill] = u.from;
  }
  return { skills: next, log: log.filter((e) => e.courseSlug !== courseSlug) };
}

'use client';

import { planningHours } from '@/lib/profile';
import { useMemo } from 'react';
import { Award, BadgeCheck, BookOpen, Check, Clock, ExternalLink, Flag, Lock, Sparkles, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { COURSES, COURSE_MAP } from '@/data/courses';
import { ROLE_MAP } from '@/data/roles';
import type { RoleMatch } from '@/lib/types';
import { useSkillCast } from '@/lib/store';
import { courseOutcome, courseProvider, courseTitle, roleSignals, roleTitle, SdgBadge, skillName, useSignals, useT } from './shared';
import { LearningSources } from './learning-sources';
import { ChoosePathwayEmpty } from './explainer';

// ─── Pathway tab: step-by-step tracked roadmap from the curated registry ───
// Courses are picked deterministically: gap priority (weight × momentum),
// then inclusion-aware format preference, then free-first. Nothing invented.

export interface PathwayNode {
  courseSlug: string;
  skill: string;
  startWeek: number;
  weeks: number;
}

const AI_SLUGS = new Set(['prompt-engineering', 'ai-agents', 'ai-augmented-ops', 'machine-learning', 'ai-content-ops', 'responsible-ai', 'mlops']);
const GREEN_SLUGS = new Set(['renewable-energy', 'energy-efficiency', 'ev-mobility', 'climate-data', 'smart-agriculture']);

export function pickCourses(gap: RoleMatch['gap'], inclusion: { dyslexia: boolean; visual: boolean; hearing: boolean }, weeklyBudget = 5) {
  const covered = new Set<string>();
  const picked: PathwayNode[] = [];
  let hours = 0;
  const budget = planningHours(weeklyBudget);

  for (const g of gap) {
    if (covered.has(g.skill)) continue;
    const candidates = COURSES.filter((c) => c.skills.includes(g.skill) && !picked.some((p) => p.courseSlug === c.slug));
    if (candidates.length === 0) continue;
    const scored = candidates.map((c) => {
      let s = 0;
      if (c.free) s += 2;
      if (inclusion.dyslexia && c.formats.some((f) => f === 'video' || f === 'interactive' || f === 'project')) s += 3;
      if (inclusion.dyslexia && c.formats.includes('text')) s -= 1;
      if (inclusion.visual && (c.accessibility.includes('screen-reader-friendly') || c.formats.includes('text'))) s += 3;
      if (inclusion.hearing && (c.accessibility.includes('captions') || c.accessibility.includes('transcripts'))) s += 3;
      if (c.certificate) s += 0.5;
      return { c, s };
    });
    scored.sort((a, b) => b.s - a.s || a.c.totalHours - b.c.totalHours);
    const best = scored[0].c;
    picked.push({
      courseSlug: best.slug,
      skill: g.skill,
      startWeek: Math.max(1, Math.ceil((hours + 1) / budget)),
      weeks: Math.max(1, Math.ceil(best.totalHours / budget)),
    });
    hours += best.totalHours;
    best.skills.forEach((s) => covered.add(s));
  }
  return picked;
}

export function PathwayTab({ matches }: { matches: RoleMatch[] }) {
  const t = useT();
  const { chosenRole, profile, completedCourses, toggleCourse, setDashTab } = useSkillCast();
  const { momentumMap } = useSignals();

  const match = useMemo(
    () => matches.find((m) => m.roleSlug === chosenRole) ?? null,
    [matches, chosenRole],
  );
  const role = chosenRole ? ROLE_MAP[chosenRole] : null;

  const nodes = useMemo(
    () => (match ? pickCourses(match.gap, profile.inclusion, profile.budget) : []),
    [match, profile.inclusion, profile.budget],
  );

  const badges = useMemo(() => {
    const done = nodes.filter((n) => completedCourses.includes(n.courseSlug));
    const b: BadgeItem[] = [];
    b.push({ label: t('badge.first'), desc: t('badge.first.d'), icon: Flag, earned: done.length >= 1, tone: 'from-sky-500 to-blue-600' });
    b.push({ label: t('badge.halfway'), desc: t('badge.halfway.d'), icon: BadgeCheck, earned: nodes.length > 0 && done.length >= Math.ceil(nodes.length / 2), tone: 'from-teal-500 to-emerald-600' });
    const aiDone = done.some((n) => COURSE_MAP[n.courseSlug].skills.some((s) => AI_SLUGS.has(s)));
    b.push({ label: t('badge.ai'), desc: t('badge.ai.d'), icon: Sparkles, earned: aiDone, tone: 'from-violet-500 to-fuchsia-600' });
    const greenDone = done.some((n) => COURSE_MAP[n.courseSlug].skills.some((s) => GREEN_SLUGS.has(s)));
    b.push({ label: t('badge.green'), desc: t('badge.green.d'), icon: Trophy, earned: greenDone, tone: 'from-lime-500 to-emerald-600' });
    b.push({ label: t('badge.complete'), desc: t('badge.complete.d'), icon: Award, earned: nodes.length > 0 && done.length === nodes.length, tone: 'from-amber-500 to-orange-600' });
    return b;
  }, [nodes, completedCourses, t]);

  if (!role || !match) {
    return <ChoosePathwayEmpty onGo={() => setDashTab('matches')} />;
  }

  const doneCount = nodes.filter((n) => completedCourses.includes(n.courseSlug)).length;
  const firstIncomplete = nodes.findIndex((n) => !completedCourses.includes(n.courseSlug));
  const inclusionNeeds = Object.entries(profile.inclusion)
    .filter(([k, v]) => v && k !== 'none')
    .map(([k]) => t(`inclusion.${k}`));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{t('pw.title')}</h2>
          <p className="text-sm text-muted-foreground">
            {roleTitle(t, role.slug)} · {t('pw.subtitle')}
          </p>
        </div>
        <Badge variant="outline" className="gap-1.5">
          <Clock className="h-3.5 w-3.5" aria-hidden />
          {doneCount}/{nodes.length} · {Math.max(0, Math.ceil(nodes.reduce((hours, node) => hours + COURSE_MAP[node.courseSlug].totalHours, 0) / planningHours(profile.budget)))} {t('pw.weeks')}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('Skills to Build')}</CardTitle>
          <CardDescription>{t('Skills needed for this learning pathway')}</CardDescription>
        </CardHeader>
        <CardContent>
          {match.gap.length ? (
            <ul className="space-y-3">
              {match.gap.map((gap) => {
                const mapped = nodes.find((node) => COURSE_MAP[node.courseSlug].skills.includes(gap.skill));
                return (
                  <li key={gap.skill} className="grid gap-2 rounded-lg border p-3 text-sm md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-center">
                    <div className="min-w-0">
                      <p className="font-medium leading-snug">{skillName(t, gap.skill)}</p>
                      <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                        <Badge variant="outline">{t('pw.gap.now', { n: gap.userLevel })}</Badge>
                        <span aria-hidden>→</span>
                        <Badge variant="outline" className="border-amber-500/70 text-amber-800 dark:text-amber-300">{t('pw.gap.need', { n: gap.minLevel })}</Badge>
                      </p>
                    </div>
                    {mapped ? (
                      <a className="min-w-0 break-words font-medium text-blue-700 underline-offset-2 hover:underline dark:text-blue-300 md:text-right" href={`#learning-${mapped.courseSlug}`}>
                        {courseTitle(t, mapped.courseSlug)} →
                      </a>
                    ) : <span className="text-xs text-muted-foreground md:text-right">{t('flow.noCourse')}</span>}
                  </li>
                );
              })}
            </ul>
          ) : <p className="text-sm text-muted-foreground">{t('Your current levels meet the mapped requirements for this role.')}</p>}
        </CardContent>
      </Card>

      {/* Progress + badges: motivating, never colour-only (icon + text state) */}
      <BadgeShelf badges={badges} done={doneCount} total={nodes.length} />
      {inclusionNeeds.length > 0 && (
        <p className="break-words rounded-lg bg-violet-50 px-3 py-2 text-xs leading-relaxed text-violet-800 dark:bg-violet-950/40 dark:text-violet-300">
          {t('pw.access.note', { needs: inclusionNeeds.join(' · ') })}
        </p>
      )}

      {/* Step-by-step learning path */}
      <div className="relative mx-auto max-w-xl">
        <div className="absolute bottom-8 left-1/2 top-8 w-1 -translate-x-1/2 rounded bg-gradient-to-b from-teal-300 via-teal-200 to-emerald-200 dark:from-teal-800 dark:via-teal-900 dark:to-emerald-900" aria-hidden />
        <ol className="relative space-y-4">
          {nodes.map((n, i) => {
            const course = COURSE_MAP[n.courseSlug];
            const done = completedCourses.includes(n.courseSlug);
            const next = i === firstIncomplete;
            const locked = !done && !next;
            const state = done ? 'done' : next ? 'next' : 'locked';
            return (
              <li id={`learning-${n.courseSlug}`} key={n.courseSlug} className="flex scroll-mt-24 justify-center">
                <Card
                  className={`w-full max-w-md transition-shadow ${
                    state === 'next'
                      ? 'border-teal-500 shadow-lg shadow-teal-100 dark:shadow-teal-950'
                      : state === 'locked'
                        ? 'border-dashed bg-muted/30'
                        : 'border-emerald-400'
                  }`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Badge
                        className={
                          state === 'done'
                            ? 'gap-1 bg-emerald-700 text-white'
                            : state === 'next'
                              ? 'gap-1 bg-teal-700 text-white'
                              : 'gap-1 text-muted-foreground'
                        }
                        variant={state === 'locked' ? 'outline' : 'default'}
                      >
                        {state === 'done' ? <Check className="h-3 w-3" aria-hidden /> : state === 'locked' ? <Lock className="h-3 w-3" aria-hidden /> : <BookOpen className="h-3 w-3" aria-hidden />}
                        {state === 'done' ? t('pw.done') : state === 'locked' ? t('pw.locked') : t('pw.available')}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {t('pw.week', { n: n.startWeek })} · {t('pw.hours', { n: course.totalHours })}
                      </span>
                    </div>
                    <CardTitle className="mt-1 text-base">{courseTitle(t, course.slug)}</CardTitle>
                    <CardDescription className="flex flex-wrap items-center gap-1.5">
                      <span>{courseProvider(t, course.slug)}</span>
                      {course.free && <Badge variant="secondary" className="text-[10px]">{t('pw.free')}</Badge>}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">{t('pw.youll', { outcome: courseOutcome(t, course.slug) })}</p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {course.skills.map((s) => (
                        <span key={s} className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                          {skillName(t, s)}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {ROLE_MAP[role.slug].sdgTags.slice(0, 3).map((g) => (
                          <SdgBadge key={g} goal={g} />
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={course.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:underline dark:text-teal-400"
                        >
                          {courseProvider(t, course.slug)} <ExternalLink className="h-3 w-3" aria-hidden />
                        </a>
                        {!locked && (
                          <Button
                            size="sm"
                            variant={done ? 'secondary' : 'outline'}
                            onClick={() => toggleCourse(n.courseSlug)}
                            className="h-7 gap-1 text-xs"
                          >
                            {!done && <Check className="h-3 w-3" aria-hidden />}
                            {done ? t('pw.done') : t('pw.mark')}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </li>
            );
          })}

          {/* Internship milestone */}
          {role.entryLevel && (
            <li className="flex justify-center">
              <Card className="w-full max-w-md border-dashed">
                <CardHeader className="pb-2">
                  <p className="flex items-start gap-2 rounded-md border border-amber-400/70 bg-amber-50 px-3 py-2 text-sm font-medium leading-snug text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                    <Flag className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> <span className="min-w-0">{t('pw.internship')}</span>
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {roleTitle(t, role.slug)} — {roleSignals(t, role.slug)}
                  </p>
                </CardContent>
              </Card>
            </li>
          )}
        </ol>
      </div>

      <LearningSources skills={match.gap.map((g) => g.skill)} />
    </div>
  );
}

interface BadgeItem { label: string; icon: typeof Flag; earned: boolean; desc?: string; tone: string }

/** Small SVG progress ring; the number in the middle carries the meaning. */
function ProgressRing({ value, label }: { value: number; label: string }) {
  const r = 30, len = 2 * Math.PI * r;
  return (
    <div className="relative h-20 w-20 shrink-0" role="img" aria-label={label}>
      <svg viewBox="0 0 72 72" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx="36" cy="36" r={r} fill="none" strokeWidth="7" className="stroke-muted" />
        <circle cx="36" cy="36" r={r} fill="none" strokeWidth="7" strokeLinecap="round" className="stroke-teal-600 transition-[stroke-dashoffset] duration-700 motion-reduce:transition-none dark:stroke-teal-400"
          strokeDasharray={len} strokeDashoffset={len * (1 - value / 100)} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-lg font-bold tabular-nums">{Math.round(value)}%</span>
    </div>
  );
}

function BadgeShelf({ badges, done, total }: { badges: BadgeItem[]; done: number; total: number }) {
  const t = useT();
  const earned = badges.filter((b) => b.earned).length;
  const next = badges.find((b) => !b.earned);
  const pct = total ? (done / total) * 100 : 0;
  const message = total === 0 ? t('nb.msg.noCourses')
    : earned === badges.length ? t('nb.msg.all')
      : earned === 0 ? t('nb.msg.zero')
        : t('nb.msg.some', { name: next?.label ?? '' });
  return (
    <section aria-labelledby="pw-badges" className="overflow-hidden rounded-2xl border bg-gradient-to-br from-teal-50 via-background to-amber-50 p-4 shadow-sm dark:from-teal-950/40 dark:via-background dark:to-amber-950/20 sm:p-5">
      <div className="flex flex-wrap items-center gap-4">
        <ProgressRing value={pct} label={t('nb.courses', { done, total })} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 id="pw-badges" className="text-lg font-bold">{t('nb.title')}</h3>
            <span className="rounded-full bg-teal-700 px-2.5 py-0.5 text-xs font-semibold tabular-nums text-white">{t('pw.badges.count', { n: earned, total: badges.length })}</span>
          </div>
          <p className="mt-1 text-sm font-medium" aria-live="polite">{message}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{t('nb.courses', { done, total })}</p>
        </div>
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        {badges.map((b) => {
          const isNext = b === next && total > 0;
          return (
            <li key={b.label}
              className={`relative flex min-w-0 flex-col items-center rounded-xl border p-3 text-center transition-transform motion-safe:hover:-translate-y-0.5 ${b.earned
                ? 'border-transparent bg-background shadow-md ring-1 ring-teal-500/40'
                : isNext ? 'border-2 border-dashed border-amber-500/80 bg-background' : 'border-dashed bg-background/60'}`}>
              {isNext && (
                <span className="absolute -top-2.5 rounded-full bg-amber-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">{t('nb.next')}</span>
              )}
              <span className={`flex h-12 w-12 items-center justify-center rounded-full ${b.earned ? `bg-gradient-to-br ${b.tone} text-white shadow-lg` : 'bg-muted text-muted-foreground'}`}>
                <b.icon className="h-6 w-6" aria-hidden />
              </span>
              <span className="mt-2 text-sm font-semibold leading-tight">{b.label}</span>
              {b.desc && <span className="mt-1 text-xs leading-snug text-muted-foreground">{b.desc}</span>}
              <span className={`mt-auto inline-flex items-center gap-1 pt-2 text-[11px] font-semibold ${b.earned ? 'text-teal-800 dark:text-teal-300' : 'text-muted-foreground'}`}>
                {b.earned ? <Check className="h-3 w-3" aria-hidden /> : <Lock className="h-3 w-3" aria-hidden />}
                {b.earned ? t('badge.earned') : t('badge.locked')}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-center text-xs italic text-muted-foreground">“{t('nb.proverb')}”</p>
    </section>
  );
}

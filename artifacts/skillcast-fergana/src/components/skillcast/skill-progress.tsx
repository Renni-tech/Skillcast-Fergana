'use client';

import { useState } from 'react';
import { ArrowRight, Sparkles, TrendingUp, X } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { COURSE_MAP } from '@/data/courses';
import { LEVEL_CAP, type ProposedUpdate, type SkillUpdate } from '@/lib/progression';
import { courseTitle, skillName, useT } from './shared';

/**
 * Asks before raising skill levels after a course is marked done. The rule is
 * shown in plain words; each proposed change can be unticked.
 */
export function SkillUpdateDialog({ courseSlug, proposals, onConfirm, onClose }: {
  courseSlug: string | null;
  proposals: ProposedUpdate[];
  onConfirm: (chosen: ProposedUpdate[]) => void;
  onClose: () => void;
}) {
  const t = useT();
  const [unticked, setUnticked] = useState<Set<string>>(new Set());
  const course = courseSlug ? COURSE_MAP[courseSlug] : null;
  const chosen = proposals.filter((p) => !unticked.has(p.skill));
  return (
    <AlertDialog open={!!course && proposals.length > 0} onOpenChange={(open) => { if (!open) { setUnticked(new Set()); onClose(); } }}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-amber-500" aria-hidden />{t('prog.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {course && t('prog.lede', { course: courseTitle(t, course.slug), cap: LEVEL_CAP[course.level], level: t(`prog.level.${course.level}`) })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <ul className="space-y-2">
          {proposals.map((p) => (
            <li key={p.skill}>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-2.5 hover:bg-muted/50">
                <Checkbox checked={!unticked.has(p.skill)} onCheckedChange={(on) => setUnticked((prev) => {
                  const next = new Set(prev); if (on) next.delete(p.skill); else next.add(p.skill); return next;
                })} />
                <span className="min-w-0 flex-1 text-sm font-medium">{skillName(t, p.skill)}</span>
                <span className="flex shrink-0 items-center gap-1 text-sm tabular-nums">
                  {p.from}<ArrowRight className="h-3.5 w-3.5 text-muted-foreground" aria-label={t('prog.to')} /><strong className="text-teal-700 dark:text-teal-300">{p.to}</strong>/5
                </span>
              </label>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground">{t('prog.honest')}</p>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('prog.notNow')}</AlertDialogCancel>
          <AlertDialogAction disabled={chosen.length === 0} onClick={() => { onConfirm(chosen); setUnticked(new Set()); }}
            className="bg-teal-700 text-white hover:bg-teal-800">
            {t('prog.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/** What just changed, and the pathway fit before → after. */
export function SkillUpdateBanner({ log, before, after, roleLabel, onDismiss }: {
  log: SkillUpdate[]; before: number; after: number; roleLabel: string; onDismiss: () => void;
}) {
  const t = useT();
  if (log.length === 0) return null;
  return (
    <div role="status" className="flex items-start gap-3 rounded-xl border border-teal-500/50 bg-teal-500/10 p-3 text-sm">
      <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-teal-700 dark:text-teal-300" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{t('prog.done.title')}</p>
        <p className="mt-0.5">{log.map((u) => `${skillName(t, u.skill)} ${u.from}→${u.to}`).join(' · ')}</p>
        <p className="mt-0.5 text-muted-foreground">{t('prog.done.fit', { role: roleLabel, before, after })}</p>
      </div>
      <button type="button" onClick={onDismiss} aria-label={t('wr.detail.dismiss')} className="rounded p-1 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

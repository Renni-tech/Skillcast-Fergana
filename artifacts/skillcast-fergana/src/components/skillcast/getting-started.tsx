'use client';

import { ArrowRight, Check, Lightbulb, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useSkillCast } from '@/lib/store';
import { useT } from './shared';

// ─── Getting started: a short guided path for new learners ────────────────
// Five steps, each checked off from real state. The current step is
// highlighted with a single clear action. Dismissing hides the guide for
// good (saved locally); it also hides itself once every step is done.

interface Step { id: string; done: boolean; tab: string; anchor?: string }

export function GettingStarted() {
  const t = useT();
  const { chosenRole, completedCourses, skillUpdates, profile, seenTips, dismissTip, setDashTab } = useSkillCast();
  const steps: Step[] = [
    { id: 'profile', done: true, tab: 'overview' },
    { id: 'rose', done: seenTips.includes('rose-read'), tab: 'overview', anchor: 'wind-rose' },
    { id: 'choose', done: !!chosenRole, tab: 'matches' },
    { id: 'course', done: completedCourses.length > 0 && skillUpdates.length > 0, tab: 'pathway' },
    { id: 'milestone', done: (profile.completedRoadmapTasks ?? []).length > 0, tab: 'harada' },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  if (seenTips.includes('getting-started') || doneCount === steps.length) return null;
  const current = steps.find((s) => !s.done)!;

  const go = (s: Step) => {
    if (s.id === 'rose') dismissTip('rose-read');
    setDashTab(s.tab);
    window.setTimeout(() => {
      const el = s.anchor ? document.getElementById(s.anchor) : document.querySelector('[role="tablist"]');
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  return (
    <Card className="mb-4 border-blue-300/70 bg-blue-50/40 dark:border-blue-800 dark:bg-blue-950/20" aria-labelledby="gs-title">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle id="gs-title" className="flex items-center gap-2 text-base"><Lightbulb className="h-5 w-5 text-amber-500" aria-hidden />{t('gs.title')}</CardTitle>
            <CardDescription>{t('gs.lede', { n: doneCount, total: steps.length })}</CardDescription>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => dismissTip('getting-started')} aria-label={t('gs.hide')}>
            <X className="h-4 w-4" aria-hidden />
          </Button>
        </div>
        <Progress value={(doneCount / steps.length) * 100} aria-label={t('gs.lede', { n: doneCount, total: steps.length })} className="mt-2" />
      </CardHeader>
      <CardContent>
        <ol className="grid gap-2 md:grid-cols-5">
          {steps.map((s, i) => {
            const isCurrent = s === current;
            return (
              <li key={s.id} aria-current={isCurrent ? 'step' : undefined}
                className={`flex min-w-0 flex-col rounded-lg border p-2.5 text-sm ${isCurrent ? 'border-blue-500 bg-background shadow-sm ring-2 ring-blue-500/30' : s.done ? 'bg-background/60' : 'border-dashed bg-background/40'}`}>
                <span className="flex items-center gap-2">
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${s.done ? 'bg-emerald-600 text-white' : isCurrent ? 'bg-blue-600 text-white' : 'bg-muted text-muted-foreground'}`}>
                    {s.done ? <Check className="h-3.5 w-3.5" aria-hidden /> : i + 1}
                  </span>
                  <span className={`font-medium leading-snug ${s.done ? 'text-muted-foreground line-through decoration-1' : ''}`}>{t(`gs.${s.id}`)}</span>
                  <span className="sr-only">{s.done ? t('gs.done') : isCurrent ? t('gs.now') : ''}</span>
                </span>
                {isCurrent && (
                  <>
                    <span className="mt-1.5 text-xs text-muted-foreground">{t(`gs.${s.id}.d`)}</span>
                    <Button size="sm" className="mt-2 w-fit gap-1" onClick={() => go(s)}>{t(`gs.${s.id}.go`)}<ArrowRight className="h-3.5 w-3.5" aria-hidden /></Button>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}

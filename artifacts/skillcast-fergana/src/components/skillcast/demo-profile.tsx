'use client';

// "Try Demo Profile": loads a synthetic learner through the normal store
// actions, so every chart and recommendation is computed by the real logic.
// A learner's own data is never replaced without confirmation, and it comes
// back when they leave the demo.

import { useState } from 'react';
import { FlaskConical, LogOut, PencilLine, Sparkles } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { eligibleBadges, sortBadges } from '@/lib/achievements';
import { buildDemoState, hasOwnLearnerData } from '@/lib/demo-profile';
import { useSkillCast } from '@/lib/store';
import { computeProgressSnapshot } from './achievements';
import { useSignals, useT } from './shared';

function useLoadDemo() {
  const { momentumMap } = useSignals();
  return () => {
    const demo = buildDemoState();
    // Badges are whatever the badge rules award for this progress: nothing is hard-coded.
    const earned = eligibleBadges(computeProgressSnapshot({ ...demo, learnerOnboarded: true }, momentumMap));
    const sorted = sortBadges(earned);
    useSkillCast.getState().loadDemo(demo, earned, sorted[sorted.length - 1]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
}

export function TryDemoButton({ className = '', dark = false }: { className?: string; dark?: boolean }) {
  const t = useT();
  const load = useLoadDemo();
  const [confirm, setConfirm] = useState(false);
  const onClick = () => {
    const st = useSkillCast.getState();
    if (!st.demoMode && hasOwnLearnerData(st)) setConfirm(true);
    else load();
  };
  return (
    <>
      <Button
        type="button"
        onClick={onClick}
        data-testid="try-demo-profile"
        className={`h-auto min-h-10 gap-2 whitespace-normal rounded-full px-4 text-left font-semibold shadow-sm ${dark
          ? 'bg-amber-300 text-slate-950 hover:bg-amber-200'
          : 'bg-gradient-to-r from-violet-600 to-blue-600 text-white hover:from-violet-700 hover:to-blue-700'} ${className}`}
      >
        <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
        <span>{t('demo.try')}</span>
      </Button>
      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('demo.confirm.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('demo.confirm.d')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('demo.confirm.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={load}>{t('demo.confirm.go')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/** Always-visible label while the demo learner is loaded. */
export function DemoBanner({ onboarding = false }: { onboarding?: boolean }) {
  const t = useT();
  const { demoMode, exitDemo, setView, setUserType } = useSkillCast();
  if (!demoMode) return null;
  return (
    <div role="status" data-testid="demo-banner"
      className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border-2 border-dashed border-violet-400/70 bg-violet-50 px-4 py-3 text-sm text-violet-950 dark:border-violet-500/50 dark:bg-violet-950/40 dark:text-violet-50">
      <FlaskConical className="h-5 w-5 shrink-0 text-violet-700 dark:text-violet-300" aria-hidden />
      <p className="min-w-0 flex-1 basis-60">
        <span className="font-bold">{t('demo.banner.label')}</span>{' '}
        {t('demo.banner')}
      </p>
      <div className="flex flex-wrap gap-2">
        {!onboarding && (
          <Button size="sm" variant="outline" className="h-auto min-h-9 gap-1.5 whitespace-normal bg-background/70" onClick={() => { setUserType('individual'); setView('onboarding'); }}>
            <PencilLine className="h-4 w-4 shrink-0" aria-hidden /> {t('demo.banner.review')}
          </Button>
        )}
        <Button size="sm" variant="outline" data-testid="exit-demo" className="h-auto min-h-9 gap-1.5 whitespace-normal bg-background/70" onClick={exitDemo}>
          <LogOut className="h-4 w-4 shrink-0" aria-hidden /> {t('demo.banner.exit')}
        </Button>
      </div>
    </div>
  );
}

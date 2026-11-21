'use client';

import { useState } from 'react';
import { Crown, Eye, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useT } from './shared';

// ─── HR premium analytics: a prototype preview ────────────────────────────
// Shows what paid employer analytics could look like. The panels are locked
// sample shapes, not the company's data; nothing can be bought and no
// payment flow exists. Each preview explains what the feature would use and
// what is still missing.

const FEATURES = ['heatmap', 'matcher', 'roi', 'passport'] as const;
type Feature = (typeof FEATURES)[number];

/** Decorative stand-in shapes, hidden from assistive tech and blurred. */
function SampleShape({ feature }: { feature: Feature }) {
  if (feature === 'heatmap') {
    return (
      <div className="grid grid-cols-6 gap-1">
        {Array.from({ length: 24 }, (_, i) => (
          <span key={i} className="h-5 rounded-sm bg-teal-600" style={{ opacity: 0.2 + ((i * 37) % 70) / 100 }} />
        ))}
      </div>
    );
  }
  if (feature === 'roi') {
    return (
      <div className="flex h-24 items-end gap-1.5">
        {[30, 42, 38, 55, 61, 70, 78, 84].map((h, i) => <span key={i} className="flex-1 rounded-t bg-violet-500" style={{ height: `${h}%` }} />)}
      </div>
    );
  }
  return (
    <ul className="space-y-1.5">
      {[78, 64, 59].map((w, i) => (
        <li key={i} className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-full bg-slate-400" />
          <span className="h-2.5 rounded bg-slate-400" style={{ width: `${w}%` }} />
        </li>
      ))}
    </ul>
  );
}

export function PremiumPreview() {
  const t = useT();
  const [open, setOpen] = useState<Feature | null>(null);
  return (
    <Card className="mt-4 border-amber-300/70 dark:border-amber-800">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="flex items-center gap-2 text-base"><Crown className="h-5 w-5 text-amber-600 dark:text-amber-400" aria-hidden />{t('prem.title')}</CardTitle>
          <Badge className="bg-amber-800 text-white hover:bg-amber-800">{t('prem.badge')}</Badge>
        </div>
        <CardDescription>{t('prem.lede')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-3 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <li key={f} className="relative min-w-0 overflow-hidden rounded-xl border bg-muted/30 p-3">
              <p className="text-sm font-semibold">{t(`prem.${f}.title`)}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{t(`prem.${f}.short`)}</p>
              <div className="relative mt-3">
                <div className="pointer-events-none select-none blur-[5px] opacity-70" aria-hidden inert>
                  <SampleShape feature={f} />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/55 backdrop-blur-[1px]">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/85 px-2.5 py-1 text-xs font-semibold text-white">
                    <Lock className="h-3.5 w-3.5" aria-hidden />{t('prem.locked')}
                  </span>
                  <Button size="sm" variant="secondary" className="gap-1.5" onClick={() => setOpen(f)}>
                    <Eye className="h-3.5 w-3.5" aria-hidden />{t('prem.preview')}<span className="sr-only">: {t(`prem.${f}.title`)}</span>
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">{t('prem.note')}</p>
      </CardContent>

      <Dialog open={open !== null} onOpenChange={(o) => { if (!o) setOpen(null); }}>
        {open && (
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Crown className="h-5 w-5 text-amber-600" aria-hidden />{t(`prem.${open}.title`)}</DialogTitle>
              <DialogDescription>{t(`prem.${open}.short`)}</DialogDescription>
            </DialogHeader>
            <div className="rounded-lg border bg-muted/30 p-3" aria-hidden><SampleShape feature={open} /></div>
            <p className="text-[11px] text-muted-foreground">{t('prem.sample')}</p>
            <dl className="space-y-3 text-sm">
              <div><dt className="font-semibold">{t('prem.what')}</dt><dd className="text-muted-foreground">{t(`prem.${open}.what`)}</dd></div>
              <div><dt className="font-semibold">{t('prem.data')}</dt><dd className="text-muted-foreground">{t(`prem.${open}.data`)}</dd></div>
              <div><dt className="font-semibold">{t('prem.status')}</dt><dd className="text-muted-foreground">{t('prem.status.d')}</dd></div>
            </dl>
            <DialogFooter><Button onClick={() => setOpen(null)}>{t('ach.close')}</Button></DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </Card>
  );
}

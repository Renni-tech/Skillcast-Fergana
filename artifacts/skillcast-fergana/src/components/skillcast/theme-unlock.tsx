'use client';

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { WIND_ROSE_THEMES, type WindRoseTheme } from '@/lib/achievements';
import { useSkillCast } from '@/lib/store';
import { playChime } from '@/lib/reward-sound';
import { useReducedMotion } from './a11y';
import { useT } from './shared';

// ─── A new Wind Rose colour is a reward ────────────────────────────────────
// Shown only after every badge reveal has finished (never in the middle of
// one). The learner chooses: use the colour now and see it on the Wind Rose,
// or keep the current colour. Either way it is announced only once.

export function pendingTheme(earnedSeen: string[], announced: WindRoseTheme[]): WindRoseTheme | null {
  const order: WindRoseTheme[] = ['silk', 'saffron'];
  return order.find((name) => !announced.includes(name) && WIND_ROSE_THEMES[name].unlock(earnedSeen)) ?? null;
}

/** Tiny preview of the rose in the new colour. */
function MiniRose({ color, reduce }: { color: string; reduce: boolean }) {
  const pts = [0.9, 0.55, 0.8, 0.45, 0.95, 0.6, 0.75, 0.5].map((r, i) => {
    const a = (Math.PI * 2 * i) / 8 - Math.PI / 2;
    return `${50 + Math.cos(a) * 40 * r},${50 + Math.sin(a) * 40 * r}`;
  }).join(' ');
  return (
    <svg viewBox="0 0 100 100" className={`h-28 w-28 ${reduce ? '' : 'motion-safe:animate-[spin_12s_linear_infinite]'}`} aria-hidden>
      {[40, 28, 16].map((r) => <circle key={r} cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeOpacity="0.15" />)}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (Math.PI * 2 * i) / 8;
        return <line key={i} x1="50" y1="50" x2={50 + Math.cos(a) * 40} y2={50 + Math.sin(a) * 40} stroke="currentColor" strokeOpacity="0.15" />;
      })}
      <polygon points={pts} fill={color} fillOpacity="0.4" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  );
}

export function ThemeUnlockPrompt({ theme, onClose }: { theme: WindRoseTheme; onClose: () => void }) {
  const t = useT();
  const reduce = useReducedMotion();
  const { windRoseTheme, setWindRoseTheme, announceTheme, setDashTab, setView, setRoseThemeChange, badgeSound } = useSkillCast();
  const color = WIND_ROSE_THEMES[theme].you;
  const [played, setPlayed] = useState(false);
  useEffect(() => {
    if (played) return;
    setPlayed(true);
    if (badgeSound) playChime('theme');
  }, [played, badgeSound]);

  const close = () => { announceTheme(theme); onClose(); };
  const useIt = () => {
    const from = windRoseTheme;
    announceTheme(theme);
    setWindRoseTheme(theme);
    setRoseThemeChange({ from, to: theme });
    setView('dashboard');
    setDashTab('radar');
    onClose();
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) close(); }}>
      <DialogContent className="max-w-sm overflow-hidden text-center" data-theme-unlock>
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-70" style={{ background: `radial-gradient(ellipse at top, ${color}66, transparent 70%)` }} />
        <DialogHeader className="items-center">
          <div className="relative mx-auto flex items-center justify-center" style={{ color }}>
            <MiniRose color={color} reduce={reduce} />
            <Sparkles className="absolute -right-1 top-1 h-6 w-6 text-amber-400" aria-hidden />
          </div>
          <DialogTitle className="text-xl">{t('wr.unlock.title')}</DialogTitle>
          <DialogDescription className="text-base">{t('wr.unlock.body', { color: t(`wr.color.${theme}`) })}</DialogDescription>
        </DialogHeader>
        <div className="mt-2 flex flex-col gap-2">
          <Button onClick={useIt} className="min-h-11 font-semibold text-white" style={{ background: color }}>{t('wr.unlock.use')}</Button>
          <Button variant="ghost" onClick={close} className="min-h-11">{t('wr.unlock.later')}</Button>
        </div>
        <p className="text-xs text-muted-foreground">{t('wr.unlock.note')}</p>
      </DialogContent>
    </Dialog>
  );
}

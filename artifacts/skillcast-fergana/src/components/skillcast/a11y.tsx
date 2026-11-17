'use client';

import { useEffect } from 'react';
import { Accessibility, Mic, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { DEFAULT_A11Y, useSkillCast, type A11ySettings } from '@/lib/store';
import { usePanels } from '@/lib/ui-panels';
import { useT } from './shared';

// ─── Accessibility: display settings applied app-wide ──────────────────────
// Each setting toggles a class on <html>; app/globals.css implements them, so every
// page benefits without per-component work.

const CLASS_FOR: Array<[keyof A11ySettings, string]> = [
  ['highContrast', 'a11y-contrast'],
  ['reduceMotion', 'a11y-reduce-motion'],
  ['underlineLinks', 'a11y-underline'],
  ['readingSpacing', 'a11y-spacing'],
];

export function useA11y(): A11ySettings {
  return useSkillCast((s) => s.a11y) ?? DEFAULT_A11Y;
}

/** True when charts should not animate (user setting or OS preference). */
export function useReducedMotion(): boolean {
  const a11y = useA11y();
  const osReduce = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return a11y.reduceMotion || osReduce;
}

export function A11yEffects() {
  const a11y = useA11y();
  useEffect(() => {
    const root = document.documentElement;
    for (const [key, cls] of CLASS_FOR) root.classList.toggle(cls, Boolean(a11y[key]));
    root.dataset.textScale = a11y.textScale;
  }, [a11y]);
  return null;
}

export function A11yButton({ landing }: { landing: boolean }) {
  const t = useT();
  const setOpen = usePanels((s) => s.setA11yOpen);
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setOpen(true)}
      aria-label={t('a11y.button')}
      className={`h-8 gap-1.5 px-2 text-xs ${landing ? 'text-blue-100/80 hover:bg-white/10 hover:text-white' : ''}`}
    >
      <Accessibility className="h-4 w-4 shrink-0" aria-hidden />
      <span className="hidden md:inline">{t('a11y.title')}</span>
    </Button>
  );
}

export function A11yPanel() {
  const t = useT();
  const a11y = useA11y();
  const setA11y = useSkillCast((s) => s.setA11y);
  const { a11yOpen, setA11yOpen, openVoice } = usePanels();

  const toggles: Array<[keyof A11ySettings, string]> = [
    ['highContrast', t('a11y.contrast')],
    ['reduceMotion', t('a11y.motion')],
    ['underlineLinks', t('a11y.links')],
    ['readingSpacing', t('a11y.spacing')],
  ];

  return (
    <Sheet open={a11yOpen} onOpenChange={setA11yOpen}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2"><Accessibility className="h-5 w-5" aria-hidden />{t('a11y.title')}</SheetTitle>
          <SheetDescription>{t('a11y.lede')}</SheetDescription>
        </SheetHeader>
        <div className="space-y-6 px-4 pb-6">
          <Button className="h-11 w-full gap-2" onClick={() => openVoice()}>
            <Mic className="h-4 w-4" aria-hidden /> {t('a11y.voice')}
          </Button>

          <fieldset>
            <legend className="text-sm font-semibold">{t('a11y.text')}</legend>
            <div className="mt-2 grid grid-cols-3 gap-2" role="radiogroup" aria-label={t('a11y.text')}>
              {(['normal', 'large', 'larger'] as const).map((scale, i) => (
                <button
                  key={scale}
                  type="button"
                  role="radio"
                  aria-checked={a11y.textScale === scale}
                  onClick={() => setA11y({ textScale: scale })}
                  className={`flex min-h-14 flex-col items-center justify-center rounded-lg border px-2 py-2 text-center text-xs leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${a11y.textScale === scale ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-muted'}`}
                >
                  <span aria-hidden className={['text-sm', 'text-base', 'text-lg'][i]}>A</span>
                  {t(`a11y.text.${scale}`)}
                </button>
              ))}
            </div>
          </fieldset>

          <ul className="space-y-1">
            {toggles.map(([key, label]) => (
              <li key={key}>
                <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-lg px-1 text-sm hover:bg-muted/60">
                  <span>{label}</span>
                  <Switch checked={Boolean(a11y[key])} onCheckedChange={(v) => setA11y({ [key]: v } as Partial<A11ySettings>)} />
                </label>
              </li>
            ))}
          </ul>

          <Button variant="outline" className="w-full gap-2" onClick={() => setA11y(DEFAULT_A11Y)}>
            <RotateCcw className="h-4 w-4" aria-hidden /> {t('a11y.reset')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

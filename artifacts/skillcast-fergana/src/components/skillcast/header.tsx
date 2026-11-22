'use client';

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';
import { flushSync } from 'react-dom';
import { CloudSun, Languages, Moon, RotateCcw, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LANGS } from '@/lib/i18n';

/** Short labels so four languages fit the 360px header. */
const LANG_SHORT: Record<string, string> = { uz: 'UZ', 'uz-cyrl': 'ЎЗ', ru: 'RU', en: 'EN' };
import { A11yButton } from './a11y';
import { CollectionButton } from './achievements';
import { useSkillCast, type View } from '@/lib/store';
import { useT } from './shared';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Hydration guard for theme-dependent icons (matches page.tsx pattern)
const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

/**
 * Switch theme in about 0.1 s. Element transitions are suspended during the
 * swap (next-themes disableTransitionOnChange), and where the browser
 * supports view transitions the whole page cross-fades in 100 ms.
 */
export function switchTheme(apply: () => void) {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  const reduce = document.documentElement.classList.contains('a11y-reduce-motion') || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  root.classList.add('theme-switching');
  const done = () => requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('theme-switching')));
  if (doc.startViewTransition && !reduce) {
    const vt = doc.startViewTransition(() => { flushSync(apply); }) as { finished?: Promise<unknown> };
    void (vt.finished ?? Promise.resolve()).finally(done);
  } else { flushSync(apply); done(); }
}

export function Header() {
  const t = useT();
  const { view, setView, lang, setLang, learnerOnboarded, setUserType, resetDemo } = useSkillCast();
  const { theme, setTheme } = useTheme();
  const [confirmReset, setConfirmReset] = useState(false);
  const mounted = useMounted();
  useEffect(() => { document.documentElement.lang = lang === 'uz-cyrl' ? 'uz-Cyrl' : lang; }, [lang]);
  const landing = view === 'landing';

  const views: Array<{ id: View; label: string; enabled: boolean }> = [
    { id: 'landing', label: t('nav.home'), enabled: true },
    { id: 'dashboard', label: t('nav.dashboard'), enabled: true },
    { id: 'employer', label: t('nav.employer'), enabled: true },
    { id: 'signals', label: t('nav.signals'), enabled: true },
  ];

  return (
    <header className={`relative top-0 z-40 sm:sticky border-b backdrop-blur-xl transition-colors ${landing
      ? 'border-white/10 bg-[#090b2b] text-white'
      : 'border-border bg-background/90 text-foreground supports-[backdrop-filter]:bg-background/75'
    }`}>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5">
        <button
          onClick={() => setView('landing')}
          className="flex items-center gap-2 rounded-md font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
          aria-label={t('SkillCast Fergana home')}
        >
          <CloudSun className={`h-5 w-5 ${landing ? 'text-blue-300' : 'text-blue-600 dark:text-blue-400'}`} aria-hidden />
          <span className="text-lg">
            Skill<span className={landing ? 'text-blue-300' : 'text-blue-600 dark:text-blue-400'}>Cast</span> <span className="text-sm font-medium">Fergana</span>
          </span>
          <span className={`hidden rounded-full border px-2 py-0.5 text-[10px] font-medium sm:inline ${landing ? 'border-white/15 text-blue-100/55' : 'border-border text-muted-foreground'}`}>
            POC
          </span>
        </button>

        <nav aria-label={t('Primary')} className="order-3 -mx-1 flex basis-full items-center sm:basis-auto sm:flex-1 gap-1 overflow-x-auto px-1 [scrollbar-width:none] sm:order-2 sm:mx-0 sm:w-auto sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0">
          {views.map((v) => (
            <Button
              key={v.id}
              variant={view === v.id ? 'secondary' : 'ghost'}
              size="sm"
              disabled={!v.enabled}
              onClick={() => {
                if (v.id === 'dashboard') {
                  setUserType('individual');
                  setView(learnerOnboarded ? 'dashboard' : 'onboarding');
                } else setView(v.id);
              }}
              className={`h-11 shrink-0 text-sm sm:h-8 ${landing
                ? view === v.id
                  ? 'bg-white/10 text-white hover:bg-white/15 hover:text-white'
                  : 'text-blue-100/70 hover:bg-white/[0.07] hover:text-white disabled:text-blue-100/30'
                : ''}`}
            >
              {v.label}
            </Button>
          ))}
        </nav>

        <div className="order-2 ml-auto flex items-center gap-1 sm:order-3 sm:gap-2">
          {mounted && <CollectionButton landing={landing} />}
          <A11yButton landing={landing} />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-11 w-11 sm:h-8 sm:w-8 ${landing ? 'text-blue-100/75 hover:bg-white/10 hover:text-white' : ''}`}
                  aria-label={t('nav.theme')}
                  onClick={() => switchTheme(() => setTheme(theme === 'dark' ? 'light' : 'dark'))}
                >
                  {mounted && theme === 'light' ? (
                    <Moon className="h-4 w-4" aria-hidden />
                  ) : (
                    <Sun className="h-4 w-4" aria-hidden />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="text-xs">
                {t('nav.theme')}: {mounted && theme === 'light' ? t('nav.theme.light') : t('nav.theme.dark')}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Select value={lang} onValueChange={(v) => setLang(v as typeof lang)}>
                  <SelectTrigger size="sm" aria-label={t('nav.lang')} className={`w-auto gap-1 px-2 text-xs data-[size=sm]:h-11 sm:px-3 sm:data-[size=sm]:h-8 ${landing ? 'border-white/15 bg-white/[0.04] text-blue-100/85 hover:bg-white/10' : 'border-dashed'}`}>
                    <Languages className="h-3.5 w-3.5" aria-hidden />
                    <SelectValue aria-label={t('nav.lang')}>
                      <span className="sm:hidden">{LANG_SHORT[lang]}</span>
                      <span className="hidden sm:inline">{LANGS.find((l) => l.code === lang)?.label}</span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {LANGS.map((l) => (
                      <SelectItem key={l.code} value={l.code} className="text-xs">
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TooltipTrigger>
              <TooltipContent className="text-xs">{t('English · Uzbek (Latin, Cyrillic) · Русский')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className={`h-11 w-11 sm:h-8 sm:w-8 ${landing ? 'text-blue-100/75 hover:bg-white/10 hover:text-white' : ''}`} aria-label={t('nav.reset')}>
                <RotateCcw className="h-4 w-4" aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setConfirmReset(true)}>{t('nav.reset')}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('reset.title')}</AlertDialogTitle>
                <AlertDialogDescription>{t('reset.body')}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('reset.cancel')}</AlertDialogCancel>
                <AlertDialogAction className="bg-red-700 text-white hover:bg-red-800" onClick={() => resetDemo()}>{t('reset.confirm')}</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </header>
  );
}

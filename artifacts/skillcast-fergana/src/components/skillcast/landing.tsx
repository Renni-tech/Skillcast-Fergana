'use client';

import {
  Accessibility, ArrowRight, BadgeCheck, Briefcase, Building2, FileCheck2, GitBranch, GraduationCap, Mic, Radar, Scale, ShieldCheck, Sparkles, User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSkillCast } from '@/lib/store';
import { usePanels } from '@/lib/ui-panels';
import { SdgBadge, useT } from './shared';

export function Landing() {
  const t = useT();
  const { setView, setUserType, learnerOnboarded, setDashTab } = useSkillCast();
  const { openVoice, setA11yOpen } = usePanels();

  const navigate = (type: 'individual' | 'employer' | 'institution') => {
    setUserType(type);
    if (type === 'individual' && learnerOnboarded) setView('dashboard');
    else setView('onboarding');
  };
  const journey = [
    { icon: FileCheck2, title: t('landing.step1'), desc: t('landing.step1d') },
    { icon: Radar, title: t('landing.step2'), desc: t('landing.step2d') },
    { icon: GitBranch, title: t('landing.step3'), desc: t('landing.step3d') },
    { icon: GraduationCap, title: t('landing.step4'), desc: t('landing.step4d') },
  ];

  return (
    <div className="skillcast-landing overflow-hidden">
      {/* Hero */}
      <section className="skillcast-hero relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden px-5 py-20 sm:px-10">
        <div className="skillcast-hero-glow" aria-hidden="true" />
        <div className="skillcast-bubble skillcast-bubble--one" aria-hidden="true" />
        <div className="skillcast-bubble skillcast-bubble--two" aria-hidden="true" />
        <div className="skillcast-bubble skillcast-bubble--three" aria-hidden="true"><span>{t('Future-ready')}</span></div>
        <div className="skillcast-bubble skillcast-bubble--four" aria-hidden="true" />
        <div className="skillcast-bubble skillcast-bubble--five" aria-hidden="true"><span>+18%<small>{t('Illustrative demo')}</small></span></div>
        <div className="skillcast-bubble skillcast-bubble--six" aria-hidden="true" />
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <Badge variant="outline" className="mb-6 gap-1.5 border-indigo-300 bg-white/70 px-3 py-1 text-indigo-800 shadow-[0_0_32px_rgba(112,118,255,.15)] backdrop-blur-md dark:border-indigo-200/25 dark:bg-white/[0.06] dark:text-indigo-100">
            <Sparkles className="h-3 w-3" aria-hidden />
            {t('hero.badge')}
          </Badge>
          <h1 className="mx-auto max-w-4xl text-[26px] font-semibold leading-[1.15] tracking-[-0.04em] text-balance text-slate-950 dark:text-white sm:text-6xl lg:text-7xl">
            {t('hero.title')}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-7 text-slate-600 dark:text-blue-100/75 sm:mt-6 sm:text-lg sm:leading-8">{t('hero.subtitle')}</p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              onClick={() => navigate('individual')}
              className="mx-auto h-12 gap-2 rounded-full border border-indigo-200/25 bg-gradient-to-r from-indigo-500 to-violet-500 px-7 text-white shadow-[0_10px_40px_rgba(91,91,220,.38)] transition-transform hover:-translate-y-0.5 hover:from-indigo-400 hover:to-violet-400"
            >
              {t(learnerOnboarded ? 'nav.dashboard' : 'hero.cta')}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </div>
          {learnerOnboarded && (
            <p className="mt-3 text-sm font-medium text-emerald-700 dark:text-emerald-200" role="status">{t('welcome.back')} {t('welcome.continue')}.</p>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
        <h2 className="text-lg font-semibold">{t('landing.steps.title')}</h2>
        <ol className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {journey.map((s, i) => (
            <li key={s.title}>
              <Card className="h-full border-blue-100 bg-white dark:border-slate-700 dark:bg-slate-900">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 font-bold text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-200">
                      {i + 1}
                    </span>
                    <s.icon className="h-5 w-5 text-muted-foreground" aria-hidden />
                  </div>
                  <CardTitle className="mt-2 text-base">{s.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">{s.desc}</CardDescription>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      {/* SDG + Responsible AI + Accessibility */}
      <section className="mx-auto mt-16 grid max-w-6xl gap-4 px-4 sm:px-6 md:grid-cols-2 xl:grid-cols-3">
        <Card className="border-emerald-300/15 bg-gradient-to-br from-emerald-400/[0.07] to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BadgeCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden />
              {t('landing.sdg.title')}
            </CardTitle>
            <CardDescription className="leading-relaxed">{t('landing.sdg.desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">{t('sdg.list.title')}</p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {[4, 5, 8, 9, 10].map((g) => (
                <li
                  key={g}
                  className={`flex items-center gap-2 rounded-lg border p-2 text-sm ${g === 4 ? 'border-[#C5192D]/50 bg-[#C5192D]/10 font-semibold sm:col-span-2' : 'border-border'}`}
                >
                  <SdgBadge goal={g} size="md" label={`${t('SDG {goal}', { goal: g })} · ${t(`sdg.name.${g}`)}`} />
                  <span className="min-w-0">
                    {t(`sdg.name.${g}`)} <span className="text-xs font-normal text-muted-foreground">({t('SDG {goal}', { goal: g })})</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">{t('sdg.core4')}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-5 w-5 text-slate-600 dark:text-slate-400" aria-hidden />
              {t('landing.privacy.title')}
            </CardTitle>
            <CardDescription className="leading-relaxed">{t('landing.privacy.desc')}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="gap-1 border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
              <Scale className="h-3 w-3" aria-hidden /> {t('common.estimates')}
            </Badge>
            <Badge variant="outline" className="border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">{t('2 scenarios')}</Badge>
            <Badge variant="outline" className="border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">O‘zbek · Русский · English</Badge>
            <Badge variant="outline" className="border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">{t('SDG ledger on every role')}</Badge>
          </CardContent>
        </Card>
        <Card className="border-blue-300/30 bg-gradient-to-br from-blue-400/[0.07] to-transparent md:col-span-2 xl:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Accessibility className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden />
              {t('landing.a11y.title')}
            </CardTitle>
            <CardDescription className="leading-relaxed">{t('landing.a11y.desc')}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => openVoice()}><Mic className="h-4 w-4" aria-hidden />{t('va.title')}</Button>
            <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => setA11yOpen(true)}><Accessibility className="h-4 w-4" aria-hidden />{t('a11y.title')}</Button>
            <Button size="sm" variant="ghost" className="h-auto min-h-8 gap-1.5 whitespace-normal text-left" onClick={() => {
              setUserType('individual');
              if (!learnerOnboarded) { setView('onboarding'); return; }
              setDashTab('matches');
              setView('dashboard');
              window.setTimeout(() => {
                const el = document.getElementById('inclusive');
                el?.scrollIntoView({ block: 'start' });
                el?.focus({ preventScroll: true });
              }, 150);
            }}><Briefcase className="h-4 w-4 shrink-0" aria-hidden />{t('inc.title')}</Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

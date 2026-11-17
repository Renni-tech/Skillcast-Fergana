'use client';

import { useMemo, useState } from 'react';
import {
  RefreshCw,
  Activity,
  BookOpen,
  Mail,
  RadioTower,
  Radar as RadarIcon,
  ListChecks,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SKILL_MAP } from '@/data/skills';
import { ROLE_MAP } from '@/data/roles';
import { COURSE_MAP } from '@/data/courses';
import { useSkillCast } from '@/lib/store';
import { matchAll } from '@/lib/matching';
import { courseProvider, courseTitle, MomentumPill, roleTitle, skillName, TrendArrow, useSignals, useT } from './shared';
import { ChangelogCard, postingLine, StatusBadge } from './signalsview';
import { sourceByIntegratedId } from '@/data/approved-sources';
import { useSourceT } from '@/lib/signal-source-i18n';
import { MatchesTab } from './matches';
import { PathwayTab, pickCourses } from './pathway';
import { HaradaTab } from './harada';
import { SdgTab } from './sdgview';
import { DemandTab } from './demand';
import { FutureRadarStep } from './onboarding';
import { ProgressDashboard } from './progress-dashboard';
import { WindRose } from './wind-rose';

const EMPLOYMENT_STATUS_LABELS = {
  student: 'Student',
  working: 'Working professional',
  unemployed: 'Unemployed',
  'career-changer': 'Career changer',
} as const;

export function Dashboard() {
  const t = useT();
  const { setScenario, profile, dashTab, setDashTab, setUserType, setView } = useSkillCast();
  const { momentumMap } = useSignals();

  const matches = useMemo(() => matchAll(profile, momentumMap), [profile, momentumMap]);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      {/* Greeting + scenario toggle */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('dash.hello')}</h1>
          <p className="text-sm text-muted-foreground">{t('scenario.note')}</p>
        </div>
        <Button variant="outline" onClick={() => { setUserType('individual'); setView('onboarding'); }}>
          {t('flow.edit')}
        </Button>
      </div>

      <Tabs value={dashTab} onValueChange={setDashTab} className="mt-4">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 p-1 sm:grid-cols-4">
          <TabsTrigger className="h-auto min-h-10 whitespace-normal px-2 py-1.5 text-center leading-tight" value="overview"><Activity className="h-4 w-4" aria-hidden />{t('tab.overview')}</TabsTrigger>
          <TabsTrigger className="h-auto min-h-10 whitespace-normal px-2 py-1.5 text-center leading-tight" value="matches">{t('tab.matches')}</TabsTrigger>
          <TabsTrigger className="h-auto min-h-10 whitespace-normal px-2 py-1.5 text-center leading-tight" value="radar"><RadarIcon className="h-4 w-4" aria-hidden />{t('ov.radar.title')}</TabsTrigger>
          <TabsTrigger className="h-auto min-h-10 whitespace-normal px-2 py-1.5 text-center leading-tight" value="pathway"><BookOpen className="h-4 w-4" aria-hidden />{t('tab.learn')}</TabsTrigger>
          <TabsTrigger className="h-auto min-h-10 whitespace-normal px-2 py-1.5 text-center leading-tight" value="harada">{t('tab.harada')}</TabsTrigger>
          <TabsTrigger className="h-auto min-h-10 whitespace-normal px-2 py-1.5 text-center leading-tight" value="progress"><ListChecks className="h-4 w-4" aria-hidden />{t('Progress')}</TabsTrigger>
          <TabsTrigger className="h-auto min-h-10 whitespace-normal px-2 py-1.5 text-center leading-tight" value="sdg">{t('tab.sdg')}</TabsTrigger>
          <TabsTrigger className="h-auto min-h-10 whitespace-normal px-2 py-1.5 text-center leading-tight" value="demand">{t('tab.demand')}</TabsTrigger>
        </TabsList>
        <p className="mt-3 text-sm text-muted-foreground">{t(`flow.${['overview', 'matches', 'pathway', 'radar', 'harada', 'progress', 'sdg', 'demand'].includes(dashTab) ? dashTab : 'overview'}`)}</p>

        <TabsContent value="overview" className="mt-4">
          <OverviewTab matches={matches} />
        </TabsContent>
        <TabsContent value="matches" className="mt-4">
          <MatchesTab matches={matches} />
        </TabsContent>
        <TabsContent value="pathway" className="mt-4">
          <PathwayTab matches={matches} />
        </TabsContent>
        <TabsContent value="radar" className="mt-4 space-y-6">
          <WindRose />
          <FutureRadarStep details={profile.extended ?? {}} onScenario={setScenario} />
        </TabsContent>
        <TabsContent value="harada" className="mt-4">
          <HaradaTab matches={matches} />
        </TabsContent>
        <TabsContent value="progress" className="mt-4">
          <ProgressDashboard matches={matches} />
        </TabsContent>
        <TabsContent value="sdg" className="mt-4">
          <SdgTab matches={matches} />
        </TabsContent>
        <TabsContent value="demand" className="mt-4">
          <DemandTab matches={matches} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Overview: forecast status + radar + movers + changelog ────────────────

function OverviewTab({ matches }: { matches: ReturnType<typeof matchAll> }) {
  const t = useT();
  const { profile, chosenRole, completedCourses, setDashTab, setView } = useSkillCast();
  const { data, loading, refreshing, refresh, momentumMap } = useSignals();
  const { st, fmt } = useSourceT();
  const mode = data?.provenance?.mode;
  const [emailOpen, setEmailOpen] = useState(false);


  const movers = data?.changelog?.[0]?.details?.movers ?? [];

  const strongest = useMemo(() => {
    return Object.keys(profile.skills)
      .map((s) => ({ slug: s, m: momentumMap[s] ?? SKILL_MAP[s]?.seedMomentum ?? 50 }))
      .sort((a, b) => b.m - a.m);
  }, [profile.skills, momentumMap]);

  const nextCourse = useMemo(() => {
    const role = chosenRole ? ROLE_MAP[chosenRole] : null;
    if (!role) return null;
    const m = matches.find((x) => x.roleSlug === role.slug);
    if (!m) return null;
    const node = pickCourses(m.gap, profile.inclusion, profile.budget)
      .find((item) => !completedCourses.includes(item.courseSlug));
    return node ? COURSE_MAP[node.courseSlug] : null;
  }, [chosenRole, matches, profile.inclusion, profile.budget, completedCourses]);

  const leadingMatch = matches.find((match) => match.roleSlug === chosenRole) ?? matches[0];
  const leadingRole = leadingMatch ? ROLE_MAP[leadingMatch.roleSlug] : null;
  const leadingExposure = leadingRole ? (leadingRole.automationExposure < 0.3 ? 'Lower' : leadingRole.automationExposure < 0.6 ? 'Moderate' : 'Higher') : null;
  const profileDetails = profile.extended;

  if (loading) {
    return <div className="py-20 text-center text-muted-foreground">{t('Loading signals…')}</div>;
  }

  return (
    <div className="space-y-4">
      <Card className="border-blue-100 dark:border-slate-700 bg-gradient-to-r from-white dark:from-slate-900 via-blue-50/70 dark:via-slate-800 to-indigo-50/70 dark:to-slate-900 shadow-sm">
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-blue-200 bg-white text-blue-700 dark:bg-slate-900 dark:text-slate-200">{t('snap.title')}</Badge>
                {profileDetails?.employmentStatus && <Badge variant="secondary">{t(EMPLOYMENT_STATUS_LABELS[profileDetails.employmentStatus as keyof typeof EMPLOYMENT_STATUS_LABELS])}</Badge>}
              </div>
              <h2 className="mt-2 break-words text-xl font-semibold text-slate-900 dark:text-slate-100">{profileDetails?.profession || t('snap.fallback')}</h2>
              {profileDetails?.specialization && <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">{profileDetails.specialization}</p>}
            </div>
          </div>
          {/* Fixed label/value grid: identical structure in every language */}
          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { label: t('snap.skills'), value: String(Object.keys(profile.skills ?? {}).length) },
              { label: t('snap.hours'), value: String(profile.budget) },
              { label: t('snap.completed'), value: String(completedCourses.length) },
              { label: t('snap.pathway'), value: leadingRole ? roleTitle(t, leadingRole.slug) : t('snap.none'), sub: leadingRole ? t('snap.fit', { n: leadingMatch.score }) : undefined, wide: true },
              { label: t('snap.exposure'), value: leadingExposure ? t(leadingExposure) : t('snap.none'), sub: leadingExposure ? t('snap.exposure.note') : undefined },
            ].map((item) => (
              <div key={item.label} className={`flex min-h-[5.5rem] min-w-0 flex-col rounded-xl border border-blue-100 bg-white/80 p-3 dark:border-slate-700 dark:bg-slate-900/60 ${item.wide ? 'col-span-2' : ''}`}>
                <dt className="text-[11px] font-medium uppercase leading-tight tracking-wide text-slate-500 dark:text-slate-400">{item.label}</dt>
                <dd className="mt-1 break-words text-base font-semibold leading-snug text-slate-900 dark:text-slate-100">{item.value}</dd>
                {item.sub && <dd className="mt-auto pt-1 text-[11px] leading-snug text-slate-500 dark:text-slate-400">{item.sub}</dd>}
              </div>
            ))}
          </dl>
          <div className="flex flex-col gap-3 rounded-xl border border-blue-100 bg-white/80 p-3 dark:border-slate-700 dark:bg-slate-900/60 md:flex-row md:items-center md:justify-between">
            <p className="min-w-0 text-sm text-slate-700 dark:text-slate-200">
              <span className="font-medium text-slate-500 dark:text-slate-400">{t('snap.next')}: </span>
              {nextCourse ? courseTitle(t, nextCourse.slug) : t('snap.next.none')}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="border-blue-200 dark:border-slate-600 text-blue-700 dark:text-slate-200" onClick={() => setDashTab('radar')}>{t('Explore your radar')}</Button>
              <Button variant="outline" size="sm" className="border-blue-200 dark:border-slate-600 text-blue-700 dark:text-slate-200" onClick={() => setDashTab('pathway')}>{t('Open learning pathway')}</Button>
              <Button variant="outline" size="sm" className="border-blue-200 dark:border-slate-600 text-blue-700 dark:text-slate-200" onClick={() => setDashTab('progress')}>{t('View next steps')}</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wind Rose: the career direction map is the centre of the overview */}
      <WindRose />

      {/* Forecast status: real mode and posting count, never labelled live */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3">
          <StatusBadge status={mode ?? 'demo'} label={st(`src.mode.${mode ?? 'demo'}`)} />
          <span className="text-sm text-muted-foreground">
            {postingLine(st, mode, data?.totalPostings ?? 0)}
            {data?.provenance?.calculatedAt ? ` · ${st('src.f.calculated')}: ${fmt(data.provenance.calculatedAt)}` : ''}
          </span>
          <div className="ml-auto flex flex-wrap gap-2">
            <Button onClick={() => void refresh()} disabled={refreshing} variant="outline" className="gap-2">
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} aria-hidden />
              {refreshing ? t('ov.refreshing') : t('ov.refresh')}
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => setEmailOpen(true)}>
              <Mail className="h-4 w-4" aria-hidden /> {t('ov.email.btn')}
            </Button>
          </div>
          <ul className="flex w-full flex-wrap gap-2" aria-label={st('src.history.sources')}>
            {(data?.provenance?.sources ?? []).map((s) => {
              const def = sourceByIntegratedId(s.id);
              return (
                <li key={s.id}>
                  <a href={def?.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-0.5 text-[11px] text-muted-foreground hover:text-foreground">
                    <RadioTower className="h-3 w-3" aria-hidden />
                    {def?.name ?? s.id} · {st(`src.status.${s.status}`)}
                    <span className="sr-only"> ({st('src.newTab')})</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t('ov.movers.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              {movers.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('ov.movers.none')}</p>
              ) : (
                <ul className="space-y-1.5">
                  {movers.slice(0, 5).map((m) => (
                    <li key={m.skill} className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate">{skillName(t, m.skill)}</span>
                      <span className="flex items-center gap-2">
                        <TrendArrow delta={m.delta} />
                        <MomentumPill momentum={m.momentum} />
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t('ov.strong')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5">
                {strongest.slice(0, 4).map((s) => (
                  <li key={s.slug} className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate">{skillName(t, s.slug)}</span>
                    <MomentumPill momentum={s.m} />
                  </li>
                ))}
                {strongest.length > 4 && (
                  <li className="text-xs text-muted-foreground">{t('ov.weak')}: {strongest.slice(-2).map((s) => skillName(t, s.slug)).join(', ')}</li>
                )}
              </ul>
            </CardContent>
          </Card>
      </div>

      {/* Forecast changelog: source → refresh time → data → effect on skills */}
      <ChangelogCard st={st} fmt={fmt} compact onOpenSources={() => setView('signals')} />

      {/* Monthly email preview (simulated) */}
      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('ov.email.subject')}</DialogTitle>
            <DialogDescription>{t('ov.email.sim')}</DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border bg-muted/40 p-4 text-sm">
            <p className="mb-2">{t('ov.email.greeting')}</p>
            <p className="mb-1 font-semibold">{t('ov.email.changes')}</p>
            {movers.length ? (
              <ul className="mb-3 list-inside list-disc text-muted-foreground">
                {movers.slice(0, 3).map((m) => (
                  <li key={m.skill}>
                    {skillName(t, m.skill)} {m.delta >= 0 ? '↑' : '↓'}{Math.abs(m.delta)} → {m.momentum}/100
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mb-3 text-muted-foreground">{t('ov.movers.none')}</p>
            )}
            <p className="mb-1 font-semibold">{t('ov.email.next')}</p>
            <p className="mb-3 text-muted-foreground">
              {nextCourse ? `${courseTitle(t, nextCourse.slug)} (${courseProvider(t, nextCourse.slug)})` : '—'}
            </p>
            <Button size="sm" onClick={() => { setEmailOpen(false); setDashTab(nextCourse ? 'pathway' : 'matches'); }} className="bg-teal-700 text-white hover:bg-teal-800 dark:bg-teal-700 dark:hover:bg-teal-800">
              {t('ov.email.cta')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

'use client';

import { useMemo, useState } from 'react';
import {
  RefreshCw,
  Activity,
  BookOpen,
  Mail,
  RadioTower,
  ScrollText,
  Radar as RadarIcon,
  ListChecks,
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Legend,
  ResponsiveContainer,
} from 'recharts';
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
import { courseProvider, courseTitle, MomentumPill, roleTitle, skillName, SourceChip, TrendArrow, useSignals, useT } from './shared';
import { MatchesTab } from './matches';
import { PathwayTab, pickCourses } from './pathway';
import { HaradaTab } from './harada';
import { SdgTab } from './sdgview';
import { DemandTab } from './demand';
import { FutureRadarStep } from './onboarding';
import { ProgressDashboard } from './progress-dashboard';

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
        <TabsList className="flex h-auto w-full flex-wrap gap-1">
          <TabsTrigger value="overview" className="gap-1.5"><Activity className="h-4 w-4" aria-hidden />{t('tab.overview')}</TabsTrigger>
          <TabsTrigger value="matches" className="gap-1.5">{t('tab.matches')}</TabsTrigger>
          <TabsTrigger value="radar" className="gap-1.5"><RadarIcon className="h-4 w-4" aria-hidden />{t('ov.radar.title')}</TabsTrigger>
          <TabsTrigger value="pathway" className="gap-1.5"><BookOpen className="h-4 w-4" aria-hidden />{t('Learning pathways')}</TabsTrigger>
          <TabsTrigger value="harada" className="gap-1.5">{t('Harada Method')}</TabsTrigger>
          <TabsTrigger value="progress" className="gap-1.5"><ListChecks className="h-4 w-4" aria-hidden />{t('Progress')}</TabsTrigger>
          <TabsTrigger value="sdg" className="gap-1.5">{t('tab.sdg')}</TabsTrigger>
          <TabsTrigger value="demand" className="gap-1.5">{t('tab.demand')}</TabsTrigger>
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
        <TabsContent value="radar" className="mt-4">
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
  const { profile, chosenRole, completedCourses, setDashTab } = useSkillCast();
  const { data, loading, refreshing, refresh, momentumMap } = useSignals();
  const [emailOpen, setEmailOpen] = useState(false);

  const radarData = useMemo(() => {
    const userSlugs = Object.keys(profile.skills);
    const marketTop = Object.entries(momentumMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([s]) => s);
    const slugs = [...new Set([...userSlugs.slice(0, 8), ...marketTop])].slice(0, 12);
    return slugs.map((slug) => ({
      skill: skillName(t, slug).split(' ').slice(0, 2).join(' '),
      you: Math.round((profile.skills[slug] ?? 0) * 20),
      market: momentumMap[slug] ?? 0,
    }));
  }, [profile.skills, momentumMap, t]);

  const movers = data?.changelog?.[0]?.details?.movers ?? [];

  const strongest = useMemo(() => {
    return Object.keys(profile.skills)
      .map((s) => ({ slug: s, m: momentumMap[s] ?? 0 }))
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
        <CardContent className="grid gap-5 pt-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2"><Badge variant="outline" className="border-blue-200 bg-white text-blue-700">{t('Your learning profile')}</Badge>{profileDetails?.employmentStatus && <Badge variant="secondary">{t(EMPLOYMENT_STATUS_LABELS[profileDetails.employmentStatus as keyof typeof EMPLOYMENT_STATUS_LABELS])}</Badge>}</div>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">{profileDetails?.profession || t('Your future-ready learning plan')}</h2>
            <p className="mt-1 text-sm text-slate-600">{profileDetails?.specialization ? `${profileDetails.specialization} · ` : ''}{profile.skills ? Object.keys(profile.skills).length : 0} {t('skills in your profile ·')} {profile.budget} {t('learning hours per week')}</p>
            {leadingRole && <p className="mt-2 text-sm text-slate-700">{t('Leading pathway:')} <strong>{roleTitle(t, leadingRole.slug)}</strong> · {leadingMatch.score}{t('% fit based on your profile')}</p>}
            {leadingRole && <p className="mt-1 text-sm text-slate-600">{t('AI task exposure:')} {t(leadingExposure ?? '')} {t('· this describes task change, not a job replacement probability.')}</p>}
            <p className="mt-1 text-sm text-slate-600">{t('Learning:')} {completedCourses.length} {t('completed course')} · {t('· Next:')} {nextCourse ? courseTitle(t, nextCourse.slug) : t('review your pathway')}</p>
          </div>
          <div className="flex flex-wrap gap-2"><Button variant="outline" className="border-blue-200 dark:border-slate-600 text-blue-700 dark:text-slate-200" onClick={() => setDashTab('radar')}>{t('Explore your radar')}</Button><Button variant="outline" className="border-blue-200 dark:border-slate-600 text-blue-700 dark:text-slate-200" onClick={() => setDashTab('pathway')}>{t('Open learning pathway')}</Button><Button variant="outline" className="border-blue-200 dark:border-slate-600 text-blue-700 dark:text-slate-200" onClick={() => setDashTab('progress')}>{t('View next steps')}</Button></div>
        </CardContent>
      </Card>

      {/* Forecast status */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 pt-6">
          <Badge
            className={
              data?.live
                ? 'gap-1.5 bg-emerald-600 dark:bg-emerald-500 text-white'
                : 'gap-1.5 bg-amber-600 dark:bg-amber-500 text-white'
            }
          >
            <RadioTower className="h-3 w-3" aria-hidden />
            {data?.live ? t('ov.live') : t('ov.cached')}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {t('ov.runinfo', { n: data?.totalPostings ?? 0 })} ·{' '}
            {data ? new Date(data.fetchedAt).toLocaleString() : ''}
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
          {data?.sources?.map((s) => (
            <SourceChip key={s.name} href={s.url}>
              {s.name} · {s.postings || '—'}
            </SourceChip>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Radar */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-0">
            <CardTitle className="text-base">{t('ov.radar.title')}</CardTitle>
            <CardDescription>{t('ov.radar.desc')}</CardDescription>
          </CardHeader>
          <CardContent className="h-80 min-w-0 overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="72%">
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="You" dataKey="you" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.35} />
                <Radar name="Market" dataKey="market" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.2} />
                <Legend wrapperStyle={{ fontSize: 12, color: 'var(--muted-foreground)' }} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Movers + strengths */}
        <div className="space-y-4 lg:col-span-2">
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
      </div>

      {/* Changelog */}
      

{/* Forecast Changelog */}
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <ScrollText className="h-5 w-5" />
      {t('Forecast Changelog')}
    </CardTitle>
    <CardDescription>
      {t('Historical changes in market skill demand based on recorded signal updates.')}
    </CardDescription>
  </CardHeader>

  <CardContent>
    {(!data?.changelog || data.changelog.length === 0) ? (
      <p className="text-sm text-muted-foreground">
        {t('No market updates recorded yet.')}
      </p>
    ) : (
      <div className="space-y-6">
        {data.changelog.map((entry) => (
          <div key={entry.id} className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">
                  {entry.summary}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(entry.createdAt).toLocaleString()}
                </p>
              </div>
              <Badge variant={entry.live ? 'default' : 'secondary'}>
                {entry.live ? t('sig.live') : t('Cached')}
              </Badge>
            </div>

            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left">{t('inst.skill')}</th>
                    <th className="px-4 py-3 text-center">{t('Previous')}</th>
                    <th className="px-4 py-3 text-center">{t('harada.current')}</th>
                    <th className="px-4 py-3 text-center">{t('Change')}</th>
                  </tr>
                </thead>
                <tbody>
                  {entry.details.movers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-5 text-center text-muted-foreground"
                      >
                        {t('No comparable momentum changes recorded for this update.')}
                      </td>
                    </tr>
                  ) : (
                    entry.details.movers.map((m) => (
                      <tr key={m.skill} className="border-t">
                        <td className="px-4 py-3 font-medium">
                          {skillName(t, m.skill)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {m.momentum - m.delta}
                        </td>
                        <td className="px-4 py-3 text-center font-semibold">
                          {m.momentum}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={
                            m.delta > 0
                              ? 'text-emerald-500'
                              : m.delta < 0
                                ? 'text-rose-500'
                                : 'text-muted-foreground'
                          }>
                            {m.delta > 0 ? `↑ +${m.delta}` :
                             m.delta < 0 ? `↓ ${m.delta}` : '→ 0'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    )}
  </CardContent>
</Card>


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
            <Button size="sm" onClick={() => { setEmailOpen(false); setDashTab(nextCourse ? 'pathway' : 'matches'); }} className="bg-teal-700 text-white hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500">
              {t('ov.email.cta')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

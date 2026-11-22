'use client';

import { useMemo, useState } from 'react';
import {
  ArrowRight, BadgeCheck, BookOpen, ChevronDown, Database, ExternalLink, FileWarning, GitBranch, GraduationCap, Info, Map as MapIcon,
  RadioTower, Radar as RadarIcon, RefreshCw, ScrollText,
} from 'lucide-react';
import type { FerganaSourceState } from '@workspace/api-client-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  APPROVED_SOURCES, SOURCE_GROUPS, sourceByIntegratedId, type ApprovedSource, type SourceGroup,
} from '@/data/approved-sources';
import { useSourceT, type SourceT } from '@/lib/signal-source-i18n';
import { useSkillCast } from '@/lib/store';
import { skillName, useSignals, useT } from './shared';
import { SourceStatusPanel } from './source-status';

// ─── Signal sources: provenance for every number SkillCast shows ───────────
// Only the approved catalogue is rendered. Three sources are retrieved on a
// schedule by the API; nothing is labelled live, because nothing is real-time.

type Mode = 'periodic' | 'cached' | 'demo';

const STATUS_STYLE: Record<string, string> = {
  periodic: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300',
  cached: 'border-amber-500/50 bg-amber-500/10 text-amber-800 dark:text-amber-300',
  unavailable: 'border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-300',
  demo: 'border-amber-500/50 bg-amber-500/10 text-amber-800 dark:text-amber-300',
  reference: 'border-sky-500/40 bg-sky-500/10 text-sky-800 dark:text-sky-300',
  planned: 'border-slate-400/50 bg-slate-500/10 text-slate-700 dark:text-slate-300',
  keyRequired: 'border-slate-400/50 bg-slate-500/10 text-slate-700 dark:text-slate-300',
};

export function StatusBadge({ status, label }: { status: string; label: string }) {
  return <Badge variant="outline" className={`text-[10px] font-semibold ${STATUS_STYLE[status] ?? ''}`}>{label}</Badge>;
}

/** Posting line used by the Forecast changelog and this page; never says "live". */
export function postingLine(st: SourceT, mode: Mode | undefined, n: number) {
  if (mode === 'demo' || (!mode && n === 0)) return st('src.postings.demo');
  if (mode === 'cached') return st('src.postings.cached', { n });
  return st('src.postings.counted', { n });
}

function ExtLink({ href, label, st }: { href: string; label: string; st: SourceT }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 rounded-md text-xs font-medium text-teal-700 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-teal-400"
    >
      <ExternalLink className="h-3 w-3" aria-hidden />
      {label}
      <span className="sr-only"> ({st('src.newTab')})</span>
    </a>
  );
}

export function SignalsView() {
  const { st, fmt } = useSourceT();
  const t = useT();
  const { setView, setDashTab, learnerOnboarded } = useSkillCast();
  const { data, loading, refreshing, refresh, error } = useSignals();
  const [group, setGroup] = useState<SourceGroup | 'all'>('all');

  const provenance = data?.provenance;
  const mode: Mode | undefined = provenance?.mode;
  const states = provenance?.sources ?? [];
  const stateFor = (id?: string) => states.find((s) => s.id === id);

  const openTab = (tab: string) => {
    if (!learnerOnboarded) { setView('onboarding'); return; }
    setDashTab(tab);
    setView('dashboard');
  };

  const chain = [
    { icon: RadioTower, title: st('src.chain.1'), desc: st('src.chain.1.d') },
    { icon: RadarIcon, title: st('src.chain.2'), desc: st('src.chain.2.d'), tab: 'radar' },
    { icon: GitBranch, title: st('src.chain.3'), desc: st('src.chain.3.d'), tab: 'matches' },
    { icon: BookOpen, title: st('src.chain.4'), desc: st('src.chain.4.d'), tab: 'pathway' },
    { icon: MapIcon, title: st('src.chain.5'), desc: st('src.chain.5.d'), tab: 'harada' },
  ];

  const skillCounts = useMemo(
    () => (data?.snapshots ?? []).filter((s) => s.postings > 0).sort((a, b) => b.postings - a.postings).slice(0, 12),
    [data],
  );
  const catalogue = APPROVED_SOURCES.filter((s) => !s.integratedId && (group === 'all' || s.group === group));

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10">
      {/* Header */}
      <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <RadioTower className="h-6 w-6 shrink-0 text-teal-700 dark:text-teal-400" aria-hidden />
            {st('src.page.title')}
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{st('src.page.lede')}</p>
        </div>
      </div>
      <Card className="mt-4"><CardContent className="pt-6"><SourceStatusPanel /></CardContent></Card>

      {/* API failure: page keeps working from the static catalogue and last good cache */}
      {error && (
        <div role="alert" className="mt-4 rounded-lg border border-red-500/60 bg-red-500/10 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-red-700 dark:text-red-300">
            <FileWarning className="h-5 w-5 shrink-0" aria-hidden />
            {st('src.error.title')}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {st('src.error.body')}{data ? ` ${st('src.unavailable.generic')}` : ''}
          </p>
          <Button variant="outline" size="sm" onClick={() => void refresh()} className="mt-2 gap-2">
            <RefreshCw className="h-4 w-4" aria-hidden />
            {st('src.retry')}
          </Button>
        </div>
      )}

      {/* Signals → future skills → gaps → learning → roadmap */}
      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <GraduationCap className="h-5 w-5 text-teal-700 dark:text-teal-400" aria-hidden />
            {st('src.chain.title')}
          </CardTitle>
          <CardDescription>{st('src.chain.desc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {chain.map((step, i) => (
              <li key={step.title} className="flex flex-col rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-teal-100 text-xs font-bold text-teal-800 dark:bg-teal-400/15 dark:text-teal-200">{i + 1}</span>
                  <step.icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                </div>
                <p className="mt-2 text-sm font-semibold leading-snug">{step.title}</p>
                <p className="mt-1 flex-1 text-xs text-muted-foreground">{step.desc}</p>
                {step.tab && (
                  <Button variant="ghost" size="sm" className="mt-2 h-8 justify-start gap-1 px-2 text-xs" onClick={() => openTab(step.tab!)}>
                    {st('src.chain.open')} <ArrowRight className="h-3 w-3" aria-hidden />
                  </Button>
                )}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Provenance chain: source → period → signal → forecast */}
      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{st('src.method.title')}</CardTitle>
          <CardDescription>{st('src.honesty')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <li key={n} className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{n}. {st(`src.method.step${n}`)}</p>
                <p className="mt-1 text-sm">{st(`src.method.step${n}.d`)}</p>
              </li>
            ))}
          </ol>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li className="flex gap-1.5"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />{st('src.method.heuristic')}</li>
            <li className="flex gap-1.5"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />{st('src.method.context')}</li>
            <li className="flex gap-1.5"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />{st('src.method.noCityVacancy')}</li>
          </ul>
        </CardContent>
      </Card>

      {/* Current calculation */}
      <Card className="mt-4">
        <CardContent className="flex flex-wrap items-center gap-2 text-sm">
          {loading && !data ? (
            <span className="text-muted-foreground">{st('src.refreshing')}</span>
          ) : !provenance ? (
            <span className="text-muted-foreground">{st('src.provenance.waiting')}</span>
          ) : (
            <>
              <StatusBadge status={mode ?? 'demo'} label={st(`src.mode.${mode ?? 'demo'}`)} />
              <span>{postingLine(st, mode, data?.totalPostings ?? 0)}</span>
              <span className="text-muted-foreground">· {st('src.f.calculated')}: {fmt(provenance.calculatedAt) ?? st('src.unknown')}</span>
              <p className="w-full text-xs text-muted-foreground">
                {mode === 'demo' ? st('src.mode.demo.note') : st('src.mode.actual.note', { n: data?.totalPostings ?? 0 })}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <StatusLegend st={st} />

      {/* Retrieved sources with their real status */}
      <h2 className="mt-6 text-lg font-semibold">{st('src.integrated.title')}</h2>
      <p className="text-sm text-muted-foreground">{st('src.group.integrated.d')}</p>
      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        {(['siat', 'worldbank', 'remotive'] as const).map((id) => (
          <IntegratedCard key={id} source={sourceByIntegratedId(id)!} state={stateFor(id)} st={st} fmt={fmt} postings={id === 'remotive' ? data?.totalPostings ?? 0 : null} />
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{st('src.metric.notComparable')} {st('src.scope.noCity')}</p>

      {/* Forecast changelog */}
      <ChangelogCard st={st} fmt={fmt} />

      {/* Skill keyword counts */}
      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{st('src.skills.title')}</CardTitle>
          <CardDescription>{st('src.skills.desc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {skillCounts.length === 0 ? (
            <p className="text-sm text-muted-foreground">{st('src.skills.empty')}</p>
          ) : (
            <ul className="flex flex-wrap gap-1.5">
              {skillCounts.map((s) => (
                <li key={s.skillSlug} className="rounded-full border bg-muted px-2.5 py-0.5 text-xs">
                  {skillName(t, s.skillSlug)} · <span className="font-semibold">{s.postings}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Approved catalogue */}
      <div className="mt-8 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <ScrollText className="h-5 w-5" aria-hidden />
            {st('src.catalogue.title')}
          </h2>
          <p className="text-sm text-muted-foreground">{st('src.catalogue.count', { n: APPROVED_SOURCES.length })}</p>
        </div>
        <div role="group" aria-label={st('src.filter.label')} className="flex flex-wrap gap-1">
          {(['all', ...SOURCE_GROUPS.filter((g) => g !== 'integrated')] as const).map((g) => (
            <Button key={g} size="sm" variant={group === g ? 'default' : 'outline'} aria-pressed={group === g} className="h-8 text-xs" onClick={() => setGroup(g)}>
              {g === 'all' ? st('src.filter.all') : st(`src.group.${g}`)}
            </Button>
          ))}
        </div>
      </div>
      {SOURCE_GROUPS.filter((g) => g !== 'integrated' && (group === 'all' || group === g)).map((g) => (
        <section key={g} className="mt-4" aria-labelledby={`grp-${g}`}>
          <h3 id={`grp-${g}`} className="text-sm font-semibold">{st(`src.group.${g}`)}</h3>
          <p className="text-xs text-muted-foreground">{st(`src.group.${g}.d`)}</p>
          <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {catalogue.filter((s) => s.group === g).map((s) => <CatalogueCard key={s.id} source={s} st={st} />)}
          </div>
        </section>
      ))}
    </div>
  );
}

function SourceMeta({ source, st }: { source: ApprovedSource; st: SourceT }) {
  return (
    <>
      <div className="mt-2 flex flex-wrap gap-1">
        {source.scopes.map((sc) => <Badge key={sc} variant="secondary" className="text-[10px]">{st(`src.scope.${sc}`)}</Badge>)}
        <Badge variant="outline" className="text-[10px]">{st(`src.type.${source.type}`)}</Badge>
      </div>
      <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-[11px]">
        <dt className="text-muted-foreground">{st('src.f.tier')}</dt><dd>{st(`src.tier.${source.tier}`)}</dd>
        <dt className="text-muted-foreground">{st('src.f.frequency')}</dt><dd>{source.updateFrequency ? st(source.updateFrequency) : st('src.notVerified')}</dd>
        <dt className="text-muted-foreground">{st('src.f.lastUpdated')}</dt><dd>{source.lastUpdated ?? st('src.notVerified')}</dd>
        <dt className="text-muted-foreground">{st('src.f.licence')}</dt><dd>{st(`src.licence.${source.licence}`)}</dd>
      </dl>
      <SourceCheck source={source} st={st} />
      <div className="mt-2 flex flex-wrap gap-3">
        <ExtLink href={source.url} label={st('src.link.official')} st={st} />
        {source.docsUrl && <ExtLink href={source.docsUrl} label={st('src.link.docs')} st={st} />}
      </div>
    </>
  );
}

/** What SkillCast confirmed on the publisher's own page, with a dated evidence link. */
function SourceCheck({ source, st }: { source: ApprovedSource; st: SourceT }) {
  const { fmt } = useSourceT();
  if (!source.check) {
    return (
      <p className="mt-2 flex items-start gap-1.5 rounded-md border border-dashed px-2 py-1.5 text-[11px] text-muted-foreground">
        <Info className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
        <span><span className="font-semibold">{st('src.f.check')}:</span> {st('src.check.none')}</span>
      </p>
    );
  }
  return (
    <div className="mt-2 rounded-md border border-emerald-500/40 bg-emerald-500/5 px-2 py-1.5 text-[11px]">
      <p className="flex items-start gap-1.5 font-semibold text-emerald-800 dark:text-emerald-300">
        <BadgeCheck className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
        <span>{st('src.check.on', { date: fmt(`${source.check.on}T12:00:00Z`, false) ?? source.check.on })}</span>
      </p>
      <p className="mt-0.5 text-foreground/90">{st(`src.check.${source.id}`)}</p>
      <div className="mt-1"><ExtLink href={source.check.url} label={st('src.check.evidence')} st={st} /></div>
    </div>
  );
}

/** Plain-language meaning of each status, so nobody has to guess. */
function StatusLegend({ st }: { st: SourceT }) {
  const rows: Array<[string, string]> = [
    ['periodic', 'src.legend.periodic'], ['cached', 'src.legend.cached'], ['unavailable', 'src.legend.unavailable'],
    ['demo', 'src.legend.demo'], ['reference', 'src.legend.reference'],
  ];
  return (
    <details className="group mt-4 rounded-lg border bg-muted/30 text-sm">
      <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 px-3 py-2 font-medium [&::-webkit-details-marker]:hidden">
        <Info className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden />
        <span className="min-w-0 flex-1">{st('src.legend.title')}</span>
        <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <dl className="grid gap-2 px-3 pb-3 sm:grid-cols-[auto_1fr] sm:items-start">
        {rows.map(([status, key]) => (
          <div key={status} className="contents">
            <dt><StatusBadge status={status} label={st(status === 'demo' ? 'src.mode.demo' : `src.status.${status}`)} /></dt>
            <dd className="text-xs text-muted-foreground">{st(key)}</dd>
          </div>
        ))}
        <dt className="flex items-center gap-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300"><BadgeCheck className="h-3.5 w-3.5" aria-hidden />{st('src.f.check')}</dt>
        <dd className="text-xs text-muted-foreground">{st('src.legend.checked')}</dd>
      </dl>
    </details>
  );
}

function CatalogueCard({ source, st }: { source: ApprovedSource; st: SourceT }) {
  return (
    <article className="flex flex-col rounded-lg border p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h4 className="min-w-0 text-sm font-semibold leading-snug">{source.name}</h4>
        <StatusBadge status={source.status} label={st(`src.status.${source.status}`)} />
      </div>
      <p className="text-[11px] text-muted-foreground">{source.publisher}</p>
      <p className="mt-1.5 text-xs">{st(`src.desc.${source.id}`)}</p>
      <SourceMeta source={source} st={st} />
    </article>
  );
}

function IntegratedCard({ source, state, st, fmt, postings }: {
  source: ApprovedSource; state?: FerganaSourceState; st: SourceT;
  fmt: (iso: string | null | undefined, withTime?: boolean) => string | null; postings: number | null;
}) {
  const status = state?.status ?? 'unavailable';
  return (
    <article className="flex flex-col rounded-lg border p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="min-w-0 text-sm font-semibold leading-snug">{source.name}</h3>
        <div className="flex flex-wrap gap-1">
          <StatusBadge status={status} label={st(`src.status.${status}`)} />
          <Badge variant="outline" className="text-[10px]">{st('src.notRealtime')}</Badge>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground">{source.publisher}</p>
      <p className="mt-1.5 text-xs">{st(`src.desc.${source.id}`)}</p>
      {status === 'unavailable' && <p className="mt-1.5 text-xs text-red-700 dark:text-red-300">{st('src.unavailable.generic')}</p>}
      <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-[11px]">
        <dt className="text-muted-foreground">{st('src.f.checked')}</dt><dd>{fmt(state?.checkedAt) ?? st('src.unknown')}</dd>
        <dt className="text-muted-foreground">{st('src.f.fetched')}</dt><dd>{fmt(state?.fetchedAt) ?? st('src.unknown')}</dd>
        <dt className="text-muted-foreground">{st('src.f.sourceUpdated')}</dt><dd>{fmt(state?.sourceUpdatedAt, false) ?? st('src.notVerified')}</dd>
        <dt className="text-muted-foreground">{st('src.f.nextCheck')}</dt><dd>{fmt(state?.nextCheckAt) ?? st('src.unknown')}</dd>
        {postings !== null && (<><dt className="text-muted-foreground">{st('src.f.postings')}</dt><dd>{postings}</dd></>)}
      </dl>
      <div className="mt-2">
        <p className="text-[11px] font-semibold text-muted-foreground">{st('src.integrated.data')}</p>
        {state?.observations?.length ? (
          <ul className="mt-1 space-y-1">
            {state.observations.map((o) => (
              <li key={o.id} className="text-xs">
                <span className="font-semibold">{o.value}{o.unit}</span>{' '}
                <span className="text-muted-foreground">{st(`src.metric.${o.id}`)} · {o.period}</span>
                {source.id === 'siat' && o.period.startsWith('2025') && (
                  <Badge variant="outline" className="ml-1 h-4 px-1 text-[9px]" title={st('src.metric.preliminary')}>{st('src.metric.prelimTag')}</Badge>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-xs text-muted-foreground">{source.id === 'remotive' ? st('src.skills.desc') : st('src.metric.none')}</p>
        )}
      </div>
      <SourceMeta source={source} st={st} />
    </article>
  );
}

/** Forecast changelog shared by Signal sources and My Forecast → Overview. */
export function ChangelogCard({ st, fmt, compact = false, onOpenSources }: {
  st: SourceT; fmt: (iso: string | null | undefined, withTime?: boolean) => string | null;
  compact?: boolean; onOpenSources?: () => void;
}) {
  const t = useT();
  const { data } = useSignals();
  const entries = (data?.changelog ?? []).slice(0, compact ? 3 : 10);
  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <ScrollText className="h-5 w-5" aria-hidden />
          {st('src.history.title')}
        </CardTitle>
        <CardDescription>{st('src.history.desc')} {st('src.honesty')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">{st('src.history.empty')}</p>
        ) : entries.map((entry) => {
          const n = entry.details?.postings ?? 0;
          const mode = entry.details?.mode;
          const sources = entry.details?.sources ?? [];
          const movers = entry.details?.movers ?? [];
          return (
            <div key={entry.id} className="rounded-lg border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold">{mode === 'demo' ? st('src.postings.demo') : st('evidence.history.summary', { n })}</p>
                <StatusBadge status={mode ?? 'demo'} label={st(`src.mode.${mode ?? 'demo'}`)} />
              </div>
              <p className="text-xs text-muted-foreground">{st('src.history.version')} {entry.version} · {fmt(entry.createdAt) ?? st('src.unknown')}</p>
              <div className="mt-2 text-xs">
                <span className="text-muted-foreground">{st('src.history.sources')}: </span>
                {sources.length === 0 ? st('src.history.legacy') : sources.map((s) => {
                  const def = sourceByIntegratedId(s.id);
                  return (
                    <span key={s.id} className="mr-2 inline-flex items-center gap-1">
                      {def?.name ?? s.id}
                      <StatusBadge status={s.status} label={st(`src.status.${s.status}`)} />
                      {s.period ? <span className="text-muted-foreground">({st('src.f.period')}: {s.period})</span> : null}
                    </span>
                  );
                })}
              </div>
              <p className="mt-2 text-xs font-semibold">{st('src.history.movers')}</p>
              {movers.length === 0 ? (
                <p className="text-xs text-muted-foreground">{st('src.history.noMovers')}</p>
              ) : (
                <div className="mt-1 overflow-x-auto rounded-md border">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50">
                      <tr>
                        <th scope="col" className="px-3 py-2 text-left">{st('src.history.skill')}</th>
                        <th scope="col" className="px-3 py-2 text-center">{st('src.history.previous')}</th>
                        <th scope="col" className="px-3 py-2 text-center">{st('src.history.current')}</th>
                        <th scope="col" className="px-3 py-2 text-center">{st('src.history.change')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movers.slice(0, compact ? 5 : 10).map((m) => (
                        <tr key={m.skill} className="border-t">
                          <td className="px-3 py-2">{skillName(t, m.skill)}</td>
                          <td className="px-3 py-2 text-center">{Math.round(m.momentum - m.delta)}</td>
                          <td className="px-3 py-2 text-center font-semibold">{m.momentum}</td>
                          <td className={`px-3 py-2 text-center ${m.delta > 0 ? 'text-emerald-600 dark:text-emerald-400' : m.delta < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-muted-foreground'}`}>
                            {m.delta > 0 ? `↑ +${m.delta}` : m.delta < 0 ? `↓ ${m.delta}` : '→ 0'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
        {onOpenSources && (
          <Button variant="outline" size="sm" className="gap-2" onClick={onOpenSources}>
            <Database className="h-4 w-4" aria-hidden /> {st('src.history.cta')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

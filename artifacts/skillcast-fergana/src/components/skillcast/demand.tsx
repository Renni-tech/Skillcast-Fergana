'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, Table2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Explainer } from './explainer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ROLES, ROLE_MAP } from '@/data/roles';
import { SKILL_MAP } from '@/data/skills';
import type { RoleMatch } from '@/lib/types';
import { useSkillCast } from '@/lib/store';
import { roleSignals, roleTitle, skillName, SourceChip, useSignals, useT } from './shared';

// ─── Demand tab: "Will this profession be in demand?" ──────────────────────
// Scenario-adjusted demand index + the momentum decomposition of the role's
// key skills (frequency / trend / research horizon). Everything estimated and
// labelled as such, with sources.

export function DemandTab({ matches }: { matches: RoleMatch[] }) {
  const t = useT();
  const { chosenRole } = useSkillCast();
  const { data, momentumMap } = useSignals();
  const [roleSlug, setRoleSlug] = useState(chosenRole ?? matches[0]?.roleSlug ?? 'ai-ops-specialist');

  const role = ROLE_MAP[roleSlug];
  const match = matches.find((m) => m.roleSlug === roleSlug);

  const skillRows = useMemo(() => {
    return role.skills
      .map((req) => {
        const snap = data?.snapshots.find((s) => s.skillSlug === req.skill);
        return {
          slug: req.skill,
          name: skillName(t, req.skill),
          weight: req.weight,
          momentum: snap?.momentum ?? SKILL_MAP[req.skill]?.seedMomentum ?? 50,
          freq: snap?.frequency ?? 0,
          trend: snap?.trend ?? 50,
          horizon: SKILL_MAP[req.skill]?.researchHorizon ?? 50,
        };
      })
      .sort((a, b) => b.momentum - a.momentum);
  }, [role, data, t]);

  const chartData = skillRows.slice(0, 6);
  const noSample = skillRows.every((r) => r.freq === 0);
  const level = (m: number) => (m >= 60 ? { label: t('Higher'), bar: 'bg-emerald-600', text: 'text-emerald-700 dark:text-emerald-400' }
    : m >= 45 ? { label: t('Moderate'), bar: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-400' }
      : { label: t('Lower'), bar: 'bg-rose-600', text: 'text-rose-700 dark:text-rose-400' });

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold">{t('demand.title')}</h2>
          <p className="max-w-2xl text-sm text-muted-foreground">{t('demand.desc')}</p>
        </div>
        <label className="grid gap-1 text-xs font-medium text-muted-foreground md:w-80">
          {t('demand.choose')}
          <Select value={roleSlug} onValueChange={setRoleSlug}>
            <SelectTrigger className="h-auto min-h-10 w-full whitespace-normal text-left text-sm text-foreground" aria-label={t('demand.choose')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((r) => (
                <SelectItem key={r.slug} value={r.slug}>
                  {roleTitle(t, r.slug)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
      </div>

      {/* Scenario comparison */}
      <div className="grid gap-4 sm:grid-cols-2">
        {([['scenario.moderate', role.demandModerate, 'border-l-teal-600', 'bg-teal-600'], ['scenario.accelerated', role.demandAccelerated, 'border-l-amber-500', 'bg-amber-500']] as const).map(([label, value, border, bar]) => (
          <Card key={label} className={`border-l-4 ${border}`}>
            <CardHeader className="pb-2">
              <CardDescription className="leading-snug">{t(label)}</CardDescription>
              <CardTitle className="text-4xl font-bold tabular-nums">
                {value}
                <span className="text-base font-normal text-muted-foreground">/100</span>
              </CardTitle>
              <p className="text-sm font-semibold">{t(value >= 70 ? 'demand.verdict.high' : value >= 50 ? 'demand.verdict.mid' : 'demand.verdict.low')}</p>
            </CardHeader>
            <CardContent>
              <div className="h-2 overflow-hidden rounded-full bg-muted" aria-hidden>
                <div className={`h-full rounded-full ${bar}`} style={{ width: `${value}%` }} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Explainer label={t('demand.how')}>{t('demand.how.body')}</Explainer>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="text-muted-foreground">{t('demand.estimate')}</Badge>
        {match && <Badge variant="outline">{t('match.score')}: {match.score}/100</Badge>}
      </div>

      {/* Skill momentum decomposition */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base leading-snug">{t('demand.momentum')} — {roleTitle(t, role.slug)}</CardTitle>
          <CardDescription>{roleSignals(t, role.slug)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-3">
            {chartData.map((row) => {
              const l = level(row.momentum);
              return (
                <li key={row.slug}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                    <span className="min-w-0 flex-1 text-sm font-medium leading-snug">{row.name}</span>
                    <span className={`shrink-0 text-sm font-semibold tabular-nums ${l.text}`}>{row.momentum}/100 · {l.label}</span>
                  </div>
                  <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-muted" aria-hidden>
                    <div className={`h-full rounded-full ${l.bar}`} style={{ width: `${Math.max(2, row.momentum)}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Secondary detail: closed by default. Cards on phones, a table from sm up. */}
          <details className="group rounded-lg border">
            <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 px-3 py-2 text-sm font-medium [&::-webkit-details-marker]:hidden">
              <Table2 className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              <span className="min-w-0 flex-1">{t('demand.details')}</span>
              <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <div className="space-y-3 px-3 pb-3">
              <p className="text-xs text-muted-foreground">{t('demand.cols.help')}</p>
              <ul className="space-y-2 sm:hidden">
                {skillRows.map((r) => (
                  <li key={r.slug} className="rounded-lg border p-3">
                    <p className="flex items-baseline justify-between gap-2 text-sm font-semibold">
                      <span className="min-w-0 leading-snug">{r.name}</span>
                      <span className="shrink-0 tabular-nums">{r.momentum}</span>
                    </p>
                    <dl className="mt-1.5 grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <dt>{t('demand.freq')}</dt><dd className="tabular-nums">{r.freq}%</dd>
                      <dt>{t('demand.trend')}</dt><dd className="tabular-nums">{r.trend}/100</dd>
                      <dt>{t('demand.horizon')}</dt><dd className="tabular-nums">{r.horizon}/100</dd>
                    </dl>
                  </li>
                ))}
              </ul>
              <div className="hidden overflow-x-auto rounded-lg border sm:block">
            <table className="w-full min-w-[34rem] text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left text-xs text-muted-foreground">
                  <th scope="col" className="px-3 py-2 font-medium">{t('inst.skill')}</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">{t('demand.freq')}</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">{t('demand.trend')}</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">{t('demand.horizon')}</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">{t('demand.momentum')}</th>
                </tr>
              </thead>
              <tbody>
                {skillRows.map((r) => (
                  <tr key={r.slug} className="border-t">
                    <th scope="row" className="px-3 py-2 text-left font-medium">{r.name}</th>
                    <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{r.freq}%</td>
                    <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{r.trend}/100</td>
                    <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{r.horizon}/100</td>
                    <td className="px-3 py-2 text-right font-semibold tabular-nums">{r.momentum}</td>
                  </tr>
                ))}
              </tbody>
            </table>
              </div>
            </div>
          </details>
          {noSample && <p className="text-xs text-muted-foreground">{t('demand.zeroNote')}</p>}

          <div className="flex flex-wrap gap-2">
            <SourceChip href="https://www.weforum.org/publications/the-future-of-jobs-report-2025/">
              {t('WEF Future of Jobs 2025 · baseline snapshot')}
            </SourceChip>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

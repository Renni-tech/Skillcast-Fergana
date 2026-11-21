'use client';

import { useMemo } from 'react';
import { Globe2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ROLE_MAP } from '@/data/roles';
import { SKILL_MAP } from '@/data/skills';
import type { RoleMatch } from '@/lib/types';
import { useSkillCast } from '@/lib/store';
import { roleSdgMechanism, roleTitle, SdgBadge, skillName, SourceChip, useT } from './shared';
import { pickCourses, rolePathway } from './pathway';
import { ChoosePathwayEmpty } from './explainer';

// ─── SDG tab: the ledger. Mechanisms, not decoration. ──────────────────────

export function SdgTab({ matches }: { matches: RoleMatch[] }) {
  const t = useT();
  const { chosenRole, profile, completedCourses, setDashTab } = useSkillCast();
  const role = chosenRole ? ROLE_MAP[chosenRole] : null;
  const match = matches.find((item) => item.roleSlug === chosenRole);
  const courseCount = match
    ? rolePathway(match, profile, completedCourses).filter((node) => completedCourses.includes(node.courseSlug)).length : 0;
  const milestoneCount = (profile.completedRoadmapTasks ?? []).filter((key) => key.startsWith(`${chosenRole}:`)).length;

  const ledger = useMemo(() => {
    if (!role) return null;
    const map = new Map<number, { goals: number; have: string[]; learning: string[] }>();
    for (const req of role.skills) {
      const def = SKILL_MAP[req.skill];
      if (!def) continue;
      const lvl = profile.skills[req.skill] ?? 0;
      const has = lvl >= req.minLevel;
      for (const g of def?.sdgTags ?? []) {
        const entry = map.get(g) ?? { goals: g, have: [], learning: [] };
        (has ? entry.have : entry.learning).push(req.skill);
        map.set(g, entry);
      }
    }
    // SDG 4 (Quality Education) is always part of a learning pathway.
    const goalSet = new Set<number>([4, ...role.sdgTags]);
    for (const g of map.keys()) goalSet.add(g);
    return { perGoal: map, all: [...goalSet].sort((a, b) => a - b) };
  }, [role, profile.skills]);

  const haveSet = new Set([...(ledger?.perGoal.values() ?? [])].flatMap((e) => e.have));
  const learnSet = new Set([...(ledger?.perGoal.values() ?? [])].flatMap((e) => e.learning));

  if (!role || !ledger) {
    return <ChoosePathwayEmpty onGo={() => setDashTab('matches')} />;
  }

  return (
    <div className="space-y-4">
      <Card className="border-l-4 border-l-emerald-600">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden />
            {t('sdg.title')}
          </CardTitle>
          <CardDescription>{t('sdg.desc', { n: ledger.all.length })}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <dl className="grid grid-cols-3 gap-2 text-center">
            {([[ledger.all.length, 'sdg.more'], [haveSet.size, 'sdg.have'], [learnSet.size, 'sdg.learning']] as const).map(([n, key]) => (
              <div key={key} className="flex flex-col-reverse rounded-xl border bg-muted/30 p-2.5">
                <dt className="text-[11px] leading-tight text-muted-foreground">{t(key)}</dt>
                <dd className="text-2xl font-bold tabular-nums">{n}</dd>
              </div>
            ))}
          </dl>
          <p className="text-sm font-medium">{t('sdg.summary', { have: haveSet.size, learn: learnSet.size })}</p>
          <p className="mb-2 rounded-md border border-[#C5192D]/40 bg-[#C5192D]/10 px-3 py-2 text-sm font-medium">{t('sdg.core4')}</p>
          <ul className="flex flex-wrap gap-1.5">
            {ledger.all.map((g) => (
              <li key={g} className={`inline-flex items-center gap-1.5 rounded-md border px-1.5 py-1 text-xs ${g === 4 ? 'border-[#C5192D]/50 font-semibold' : 'border-border'}`}>
                <SdgBadge goal={g} size="md" />
                {t(`sdg.name.${g}`)}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base leading-snug sm:text-lg">{t('sdg.whyRole', { role: roleTitle(t, role.slug) })}</CardTitle>
          <CardDescription>{t('flow.sdgProgress', { courses: courseCount, milestones: milestoneCount })}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-900 dark:bg-emerald-950/30">
            <ul className="mb-2 flex flex-wrap gap-1.5">
              {role.sdgTags.map((g) => (
                <li key={g} className="inline-flex items-center gap-1.5 text-xs font-medium">
                  <SdgBadge goal={g} />{t(`sdg.name.${g}`)}
                </li>
              ))}
            </ul>
            <p className="text-sm leading-relaxed">{roleSdgMechanism(t, role.slug)}</p>
          </div>

          {ledger.perGoal.size > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold">{t('sdg.linked')}</h3>
              <ul className="grid gap-3 md:grid-cols-2">
                {[...ledger.perGoal.entries()].map(([goal, entry]) => (
                  <li key={goal} className="rounded-lg border p-3">
                    <p className="flex items-start gap-2 text-sm font-semibold leading-snug">
                      <SdgBadge goal={goal} size="md" />
                      <span className="min-w-0">{t(`sdg.name.${goal}`)}</span>
                    </p>
                    {entry.have.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">✓ {t('sdg.have')}</p>
                        <ul className="mt-1 flex flex-wrap gap-1">
                          {entry.have.map((slug) => <li key={slug}><Badge variant="secondary">{skillName(t, slug)}</Badge></li>)}
                        </ul>
                      </div>
                    )}
                    {entry.learning.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-muted-foreground">→ {t('sdg.learning')}</p>
                        <ul className="mt-1 flex flex-wrap gap-1">
                          {entry.learning.map((slug) => <li key={slug}><Badge variant="outline">{skillName(t, slug)}</Badge></li>)}
                        </ul>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <SourceChip href="https://sdgs.un.org/goals">{t('UN SDG framework · targets 4.4 / 8.2 / 8.5')}</SourceChip>
            <SourceChip>{t('sdg.aggregate')}</SourceChip>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

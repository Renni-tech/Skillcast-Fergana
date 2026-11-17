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
import { pickCourses } from './pathway';

// ─── SDG tab: the ledger. Mechanisms, not decoration. ──────────────────────

export function SdgTab({ matches }: { matches: RoleMatch[] }) {
  const t = useT();
  const { chosenRole, profile, completedCourses } = useSkillCast();
  const role = chosenRole ? ROLE_MAP[chosenRole] : null;
  const match = matches.find((item) => item.roleSlug === chosenRole);
  const courseCount = match
    ? pickCourses(match.gap, profile.inclusion, profile.budget).filter((node) => completedCourses.includes(node.courseSlug)).length : 0;
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

  if (!role || !ledger) {
    return (
      <Card className="text-center">
        <CardContent className="py-12 text-muted-foreground">{t('sdg.notchosen')}</CardContent>
      </Card>
    );
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
        <CardContent>
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
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{roleTitle(t, role.slug)} — {t('sdg.why')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">{t('flow.sdgProgress', { courses: courseCount, milestones: milestoneCount })}</p>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-900 dark:bg-emerald-950/30">
            <div className="mb-1 flex items-center gap-1.5">
              {role.sdgTags.map((g) => (
                <SdgBadge key={g} goal={g} />
              ))}
            </div>
            <p className="text-sm">{roleSdgMechanism(t, role.slug)}</p>
          </div>

          {ledger.perGoal.size > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">{t('sdg.roleskills')}</p>
              <ul className="space-y-1.5">
                {[...ledger.perGoal.entries()].map(([goal, entry]) => (
                  <li key={goal} className="flex items-start gap-2 text-sm">
                    <SdgBadge goal={goal} />
                    <span>
                      <span className="font-medium">{t(`sdg.name.${goal}`)}</span>
                      {entry.have.length > 0 && (
                        <span className="text-muted-foreground"> — ✓ {entry.have.map((slug) => skillName(t, slug)).join(', ')}</span>
                      )}
                      {entry.learning.length > 0 && (
                        <span className="text-muted-foreground/80">
                          {entry.have.length > 0 ? '; ' : ' — '}
                          <span className="italic">{t('in your pathway:')}</span> {entry.learning.map((slug) => skillName(t, slug)).join(', ')}
                        </span>
                      )}
                    </span>
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

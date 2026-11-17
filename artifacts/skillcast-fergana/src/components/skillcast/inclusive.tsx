'use client';

import { Accessibility, BadgeCheck, Briefcase, ExternalLink, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { INCLUSIVE_ENTRIES, ROLE_WORK_OPTIONS, type InclusiveVerification, type WorkOption } from '@/data/inclusive';
import type { RoleMatch } from '@/lib/types';
import { useSkillCast } from '@/lib/store';
import { roleTitle, useT } from './shared';

// ─── Accessible and inclusive opportunities ────────────────────────────────
// Part of the main pathway journey, not a separate mode. Verification levels
// are always visible; the fictional example is labelled and has no link.

const WORK_LABEL: Record<WorkOption, string> = {
  'remote-hybrid': 'Remote or hybrid work',
  'flexible-hours': 'Flexible hours',
  'written-instructions': 'Written instructions',
  'assistive-technology': 'Assistive technology',
  'flexible-communication': 'Flexible communication',
  'quiet-workplace': 'Quiet workplace',
};

const VER_STYLE: Record<InclusiveVerification, string> = {
  approved: 'border-emerald-500/60 text-emerald-800 dark:text-emerald-300',
  official: 'border-sky-500/60 text-sky-800 dark:text-sky-300',
  curated: 'border-slate-400/70 text-slate-700 dark:text-slate-300',
  demo: 'border-amber-500/70 text-amber-800 dark:text-amber-300',
};

export function InclusiveOpportunities({ matches }: { matches: RoleMatch[] }) {
  const t = useT();
  const profile = useSkillCast((s) => s.profile);
  const prefs = new Set(profile.extended?.workPreferences ?? []);
  const needs = Object.entries(profile.inclusion ?? {}).filter(([k, v]) => v && k !== 'none').map(([k]) => k);
  // Saved or malformed matches can be null or point to deleted roles.
  const top = (Array.isArray(matches) ? matches : [])
    .filter((m): m is RoleMatch => Boolean(m && typeof m.roleSlug === 'string' && ROLE_WORK_OPTIONS[m.roleSlug]))
    .slice(0, 3);

  return (
    <section id="inclusive" aria-labelledby="inclusive-title" className="scroll-mt-24">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle id="inclusive-title" className="flex items-center gap-2 text-base sm:text-lg">
            <Accessibility className="h-5 w-5 shrink-0 text-blue-700 dark:text-blue-300" aria-hidden />
            {t('inc.title')}
          </CardTitle>
          <CardDescription>{t('inc.lede')}</CardDescription>
          {needs.length > 0 && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{t('inc.yourNeeds')}: </span>
              {needs.map((n) => t(`inclusion.${n}`).split(' — ')[0]).join(' · ')}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Work options in the learner's top pathways (indicative) */}
          {top.length > 0 && <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold"><Briefcase className="h-4 w-4 shrink-0" aria-hidden />{t('inc.work.title')}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{t('inc.work.lede')}</p>
            <ul className="mt-3 grid gap-3 md:grid-cols-3">
              {top.map((m) => {
                const options = ROLE_WORK_OPTIONS[m.roleSlug] ?? [];
                const matched = options.filter((o) => prefs.has(o));
                return (
                  <li key={m.roleSlug} className="flex flex-col rounded-lg border p-3">
                    <p className="text-sm font-semibold leading-snug">{roleTitle(t, m.roleSlug)}</p>
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {options.map((o) => (
                        <li key={o}>
                          <Badge variant="outline" className={prefs.has(o) ? 'border-blue-500 bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-200' : ''}>
                            {prefs.has(o) && <BadgeCheck className="h-3 w-3" aria-hidden />}
                            {t(WORK_LABEL[o])}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                    {matched.length > 0 && <p className="mt-2 text-xs font-medium text-blue-800 dark:text-blue-300">{t('inc.work.match')}: {matched.length}/{options.length}</p>}
                  </li>
                );
              })}
            </ul>
          </div>}

          {/* Rights, support, standards and training, each with its verification level */}
          <div>
            <h3 className="text-sm font-semibold">{t('inc.sources.title')}</h3>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {INCLUSIVE_ENTRIES.map((e) => (
                <li key={e.id} className={`flex flex-col rounded-lg border p-3 ${e.verification === 'demo' ? 'border-dashed' : ''}`}>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="secondary">{t(`inc.kind.${e.kind}`)}</Badge>
                    <Badge variant="outline">{t(`inc.scope.${e.scope}`)}</Badge>
                    <Badge variant="outline" className={VER_STYLE[e.verification]}>{t(`inc.ver.${e.verification}`)}</Badge>
                  </div>
                  <p className="mt-2 text-sm font-semibold leading-snug">{t(`inc.${e.id}.name`)}</p>
                  <p className="text-xs text-muted-foreground">{e.publisher}</p>
                  <p className="mt-1.5 flex-1 text-sm text-muted-foreground">{t(`inc.${e.id}.d`)}</p>
                  {e.url ? (
                    <a href={e.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex w-fit items-center gap-1 text-sm font-medium text-blue-700 hover:underline dark:text-blue-300">
                      {t('inc.open')} <ExternalLink className="h-3.5 w-3.5" aria-hidden /><span className="sr-only"> ({t('common.newTab')})</span>
                    </a>
                  ) : <p className="mt-2 text-xs italic text-muted-foreground">{t('inc.noLink')}</p>}
                </li>
              ))}
            </ul>
            <p className="mt-3 flex items-start gap-2 rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />{t('inc.noEmployers')}
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

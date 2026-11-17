'use client';

import { ExternalLink, GraduationCap, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { rankSources, type RankReason } from '@/lib/learning-rank';
import { useSkillCast } from '@/lib/store';
import { skillName, useT } from './shared';

// ─── Where to learn the learner's priority skills ──────────────────────────
// Ranked providers from src/data/learning-sources.ts with the reasons behind
// each rank. Providers only: no invented course, place or certificate.

const REASON_KEY: Record<RankReason, string> = {
  language: 'ls.why.language', access: 'ls.why.access', free: 'ls.why.free', local: 'ls.why.local', official: 'ls.why.official',
};

export function LearningSources({ skills }: { skills: string[] }) {
  const t = useT();
  const { lang, profile } = useSkillCast();
  const unique = [...new Set(skills)].slice(0, 4);
  if (!unique.length) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <GraduationCap className="h-5 w-5 shrink-0 text-teal-700 dark:text-teal-400" aria-hidden />
          {t('ls.title')}
        </CardTitle>
        <CardDescription>{t('ls.lede')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {unique.map((skill) => {
          const ranked = rankSources(skill, { lang, inclusion: profile.inclusion }).slice(0, 3);
          return (
            <section key={skill} aria-label={t('ls.for', { skill: skillName(t, skill) })}>
              <h3 className="text-sm font-semibold">{t('ls.for', { skill: skillName(t, skill) })}</h3>
              {ranked.length === 0 ? (
                <p className="mt-1 text-sm text-muted-foreground">{t('ls.none')}</p>
              ) : (
                <ol className="mt-2 grid gap-3 md:grid-cols-3">
                  {ranked.map(({ source, reasons }, i) => (
                    <li key={source.id} className={`flex flex-col rounded-lg border p-3 ${i === 0 ? 'border-teal-500/70 bg-teal-50/40 dark:bg-teal-950/20' : ''}`}>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {i === 0 && <Badge className="bg-teal-700 text-white dark:bg-teal-700"><Sparkles className="h-3 w-3" aria-hidden />1</Badge>}
                        <Badge variant="outline">{t(`ls.region.${source.region}`)}</Badge>
                        <Badge variant="secondary">{t(`ls.cost.${source.cost}`)}</Badge>
                      </div>
                      <p className="mt-2 text-sm font-semibold leading-snug">{t(`ls.${source.id}.name`)}</p>
                      <p className="text-xs text-muted-foreground">{source.provider}</p>
                      <p className="mt-1.5 flex-1 text-sm text-muted-foreground">{t(`ls.${source.id}.d`)}</p>
                      <p className="mt-2 text-xs text-muted-foreground">{t('ls.langs', { list: source.languages.map((l) => t(`ls.lang.${l}`)).join(', ') })}</p>
                      {reasons.length > 0 && (
                        <p className="mt-1 text-xs">
                          <span className="font-medium">{t('ls.why')}: </span>
                          {reasons.map((r) => t(REASON_KEY[r])).join(' · ')}
                        </p>
                      )}
                      <p className="mt-1 text-[11px] text-muted-foreground">{t(`ls.ver.${source.verification}`)}</p>
                      <a href={source.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex w-fit items-center gap-1 text-sm font-medium text-teal-700 hover:underline dark:text-teal-400">
                        {t('ls.open')} <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        <span className="sr-only"> {source.provider} ({t('common.newTab')})</span>
                      </a>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          );
        })}
        <p className="text-xs text-muted-foreground">{t('ls.note')}</p>
      </CardContent>
    </Card>
  );
}

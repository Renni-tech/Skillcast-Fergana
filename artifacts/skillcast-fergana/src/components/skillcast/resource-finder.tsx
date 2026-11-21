'use client';

import { useMemo, useState } from 'react';
import { ExternalLink, GraduationCap, Mail, MapPin, Phone, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RESOURCE_AREAS, RESOURCE_TOPICS, type LearningResource, type ResourceArea, type ResourceTopic } from '@/data/learning-resources';
import { homeArea, rankResources, type RankedResource } from '@/lib/resource-match';
import { useSkillCast } from '@/lib/store';
import { skillName, useT } from './shared';

// ─── Where to learn: places and online resources ───────────────────────────
// Ranked by lib/resource-match from the learner's pathway gaps, field and
// professions, location, format preference, languages and weekly hours.
// Addresses appear only with their source and how certain they are.

const name = (t: ReturnType<typeof useT>, r: LearningResource) => t(`${r.copy}.${r.id}.name`);
const desc = (t: ReturnType<typeof useT>, r: LearningResource) => t(`${r.copy}.${r.id}.d`);

export function ResourceFinder({ gaps }: { gaps: string[] }) {
  const t = useT();
  const { lang, profile, setProfile } = useSkillCast();
  const [area, setArea] = useState<ResourceArea | 'all'>('all');
  const [topic, setTopic] = useState<ResourceTopic | 'all'>('all');
  const [expanded, setExpanded] = useState(false);
  const format = profile.extended?.learningFormat ?? 'any';
  const ranked = useMemo(() => rankResources(profile, { lang, gaps, area, topic }), [profile, lang, gaps, area, topic]);
  const shown = expanded ? ranked.slice(0, 14) : ranked.slice(0, 6);
  const home = homeArea(profile);

  return (
    <Card id="where-to-learn">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <GraduationCap className="h-5 w-5 shrink-0 text-teal-700 dark:text-teal-400" aria-hidden />
          {t('lr.title')}
        </CardTitle>
        <CardDescription>{t('lr.lede', { area: t(`lr.area.${home}`) })}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-[auto_1fr_1fr] md:items-end">
          <fieldset>
            <legend className="mb-1.5 text-xs font-medium">{t('lr.format.label')}</legend>
            <div className="inline-flex flex-wrap gap-1 rounded-lg border p-1" role="radiogroup" aria-label={t('lr.format.label')}>
              {(['any', 'online', 'in-person'] as const).map((f) => (
                <button key={f} type="button" role="radio" aria-checked={format === f}
                  onClick={() => setProfile({ extended: { learningFormat: f } })}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium ${format === f ? 'bg-teal-700 text-white' : 'hover:bg-muted'}`}>
                  {t(`lr.format.${f}`)}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="grid gap-1.5 text-xs font-medium">
            {t('lr.area.label')}
            <Select value={area} onValueChange={(v) => setArea(v as ResourceArea | 'all')}>
              <SelectTrigger aria-label={t('lr.area.label')}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('lr.all')}</SelectItem>
                {RESOURCE_AREAS.map((a) => <SelectItem key={a} value={a}>{t(`lr.area.${a}`)}</SelectItem>)}
              </SelectContent>
            </Select>
          </label>
          <label className="grid gap-1.5 text-xs font-medium">
            {t('lr.topic.label')}
            <Select value={topic} onValueChange={(v) => setTopic(v as ResourceTopic | 'all')}>
              <SelectTrigger aria-label={t('lr.topic.label')}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('lr.all')}</SelectItem>
                {RESOURCE_TOPICS.map((tp) => <SelectItem key={tp} value={tp}>{t(`lr.topic.${tp}`)}</SelectItem>)}
              </SelectContent>
            </Select>
          </label>
        </div>

        <p className="text-xs text-muted-foreground" aria-live="polite">{t('lr.count', { n: ranked.length })}</p>
        {ranked.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">{t('lr.empty')}</p>
        ) : (
          <ol className="grid gap-3 md:grid-cols-2">
            {shown.map((item, i) => <ResourceCard key={item.resource.id} item={item} top={i === 0} />)}
          </ol>
        )}
        {ranked.length > 6 && (
          <Button variant="outline" size="sm" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}>
            {expanded ? t('lr.less') : t('lr.more')}
          </Button>
        )}
        <p className="text-xs text-muted-foreground">{t('lr.note')}</p>
      </CardContent>
    </Card>
  );
}

function ResourceCard({ item, top }: { item: RankedResource; top: boolean }) {
  const t = useT();
  const r = item.resource;
  const inPerson = r.format !== 'online';
  return (
    <li className={`flex min-w-0 flex-col rounded-lg border p-3 ${top ? 'border-teal-500/70 bg-teal-50/40 dark:bg-teal-950/20' : ''}`}>
      <div className="flex flex-wrap items-center gap-1.5">
        {top && <Badge className="bg-teal-700 text-white dark:bg-teal-700"><Sparkles className="h-3 w-3" aria-hidden />{t('ls.badge.top')}</Badge>}
        <Badge variant="outline">{t(`lr.area.${r.area}`)}</Badge>
        <Badge variant="outline">{t(`lr.format.${r.format}`)}</Badge>
        {r.cost ? <Badge variant="secondary">{t(`ls.cost.${r.cost}`)}</Badge> : null}
        {r.beginner && <Badge variant="outline" className="border-emerald-500/50 text-emerald-800 dark:text-emerald-300">{t('lr.beginner')}</Badge>}
      </div>
      <p className="mt-2 text-sm font-semibold leading-snug">{name(t, r)}</p>
      <p className="text-xs text-muted-foreground">{r.provider}{r.city ? ` · ${r.city}` : ''}</p>
      <p className="mt-1.5 text-sm text-muted-foreground">{desc(t, r)}</p>
      <p className="mt-2 flex flex-wrap gap-1">
        {r.topics.map((tp) => <span key={tp} className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">{t(`lr.topic.${tp}`)}</span>)}
      </p>
      {item.reasons.length > 0 && (
        <p className={`mt-2 text-xs ${top ? 'rounded-md bg-teal-100/60 px-2 py-1 dark:bg-teal-900/30' : ''}`}>
          <span className="font-medium">{t('lr.why')}: </span>
          {item.reasons.map((reason) => (reason === 'skill'
            ? t('lr.why.skill', { skills: item.skills.map((s) => skillName(t, s)).join(', ') })
            : t(`lr.why.${reason}`))).join(' · ')}
        </p>
      )}
      {inPerson && (
        <div className="mt-2 text-xs">
          {r.address ? (
            <p className="flex items-start gap-1.5">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-700 dark:text-teal-400" aria-hidden />
              <span>
                <span className="font-medium">{r.address.line}</span>
                <span className="block text-muted-foreground">
                  {t(`lr.addr.${r.address.confidence}`)} (<a href={r.address.source} target="_blank" rel="noopener noreferrer" className="underline">{t('lr.source')}</a>)
                </span>
              </span>
            </p>
          ) : (
            <p className="flex items-start gap-1.5 text-muted-foreground"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />{t('lr.addr.none')}</p>
          )}
        </div>
      )}
      {r.contact && (
        <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs">
          {r.contact.phone && <a href={`tel:${r.contact.phone.replace(/[^+\d]/g, '')}`} className="inline-flex items-center gap-1 text-teal-700 hover:underline dark:text-teal-400"><Phone className="h-3 w-3" aria-hidden /><span className="sr-only">{t('lr.call')}: </span>{r.contact.phone}</a>}
          {r.contact.email && <a href={`mailto:${r.contact.email}`} className="inline-flex items-center gap-1 text-teal-700 hover:underline dark:text-teal-400"><Mail className="h-3 w-3" aria-hidden /><span className="sr-only">{t('lr.email')}: </span>{r.contact.email}</a>}
        </p>
      )}
      {!r.cost && <p className="mt-1.5 text-[11px] text-muted-foreground">{t('lr.cost.unknown')}</p>}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
        <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-teal-700 hover:underline dark:text-teal-400">
          {t('lr.open')} <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="sr-only"> {name(t, r)} ({t('common.newTab')})</span>
        </a>
        {r.checked && (
          <span className="text-[11px] text-muted-foreground">
            {t('lr.checked', { date: r.checked })} · <a href={r.evidence} target="_blank" rel="noopener noreferrer" className="underline">{t('lr.source')}</a>
          </span>
        )}
      </div>
    </li>
  );
}

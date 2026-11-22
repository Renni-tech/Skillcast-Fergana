'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import { CalendarDays, Check, Clock, ExternalLink, Globe2, GraduationCap, Landmark, Languages, Mail, MapPin, Phone, Plus, Search, ShieldCheck, Sparkles, Wallet, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RESOURCE_AREAS, type ResourceArea } from '@/data/learning-resources';
import {
  CATALOG_MODES, CATALOG_TOPICS, CATALOG_VIEWS, DEFAULT_FILTER, entryDesc, entryDuration, entryName, entryNote,
  filterCatalog, sortCatalog, useCatalog, viewCounts, type CatalogEntry, type CatalogFilter, type CatalogMode, type CatalogTopic,
} from '@/lib/resource-catalog';
import { homeArea, rankResources, RANKABLE, type RankedResource } from '@/lib/resource-match';
import { useSkillCast } from '@/lib/store';
import type { Lang } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/dates';
import { skillName, useT } from './shared';

// ─── Where to learn: the full learning catalogue ───────────────────────────
// Every entry comes from lib/resource-catalog (researched JSON + older lists).
// Ranking from lib/resource-match puts the best fits for this learner first;
// filters and search never hide why a card is shown or what is unconfirmed.

const PAGE = 8;
type TFn = ReturnType<typeof useT>;

/** Text a search can match: names and descriptions in every language. */
function haystack(t: TFn, e: CatalogEntry): string {
  const names = e.text ? [...Object.values(e.text.name), ...Object.values(e.text.d)] : [t(`${e.copyKey}.name`), t(`${e.copyKey}.d`)];
  return [...names, e.provider, e.badge, e.city ?? '', e.area, ...e.topics, ...e.topics.map((tp) => t(`cat.topic.${tp}`)), ...e.skills.map((s) => skillName(t, s))].join(' ');
}

export function ResourceFinder({ gaps }: { gaps: string[] }) {
  const t = useT();
  const { lang, profile, catalogFocus, focusCatalog } = useSkillCast();
  const entries = useCatalog();
  const fromFocus = (f: { query: string; view: string; topic?: string }): CatalogFilter => ({
    ...DEFAULT_FILTER, query: f.query, view: (CATALOG_VIEWS as string[]).includes(f.view) ? f.view as CatalogFilter['view'] : 'all',
    topic: f.topic && (CATALOG_TOPICS as readonly string[]).includes(f.topic) ? f.topic as CatalogTopic : 'all',
  });
  const [filter, setFilter] = useState<CatalogFilter>(() => (catalogFocus ? fromFocus(catalogFocus) : DEFAULT_FILTER));
  // A "Find courses" link elsewhere hands over a search, once.
  useEffect(() => {
    if (catalogFocus === null) return;
    setFilter(fromFocus(catalogFocus));
    focusCatalog(null);
    const id = window.setTimeout(() => document.getElementById('where-to-learn')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
    return () => window.clearTimeout(id);
  }, [catalogFocus, focusCatalog]);
  const [shown, setShown] = useState(PAGE);
  const home = homeArea(profile);
  const searchId = useId();

  const ranking = useMemo(() => {
    const ranked = rankResources(profile, { lang, gaps }, RANKABLE);
    return { score: new Map(ranked.map((r) => [r.resource.id, r.score])), byId: new Map(ranked.map((r) => [r.resource.id, r])) };
  }, [profile, lang, gaps]);
  const results = useMemo(
    () => sortCatalog(filterCatalog(entries, filter, (e) => haystack(t, e)), home, ranking.score),
    [entries, filter, t, home, ranking],
  );
  const counts = useMemo(() => viewCounts(entries), [entries]);
  const patch = (p: Partial<CatalogFilter>) => { setFilter((f) => ({ ...f, ...p })); setShown(PAGE); };
  const filtered = JSON.stringify(filter) !== JSON.stringify(DEFAULT_FILTER);

  return (
    <Card id="where-to-learn" className="scroll-mt-24">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <GraduationCap className="h-5 w-5 shrink-0 text-teal-700 dark:text-teal-400" aria-hidden />
          {t('cat.title')}
        </CardTitle>
        <CardDescription>{t('cat.lede', { n: entries.length })}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div role="radiogroup" aria-label={t('cat.view.label')} className="flex flex-wrap gap-1.5">
          {CATALOG_VIEWS.map((v) => {
            const on = filter.view === v;
            return (
              <button key={v} type="button" role="radio" aria-checked={on} onClick={() => patch({ view: v })}
                className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors sm:min-h-9 ${on
                  ? 'border-teal-700 bg-teal-700 text-white dark:border-teal-500 dark:bg-teal-600'
                  : 'border-border bg-background hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-950/40'}`}>
                {t(`cat.view.${v}`)}
                <span className={`rounded-full px-1.5 text-xs ${on ? 'bg-white/20' : 'bg-muted text-muted-foreground'}`}>{counts[v]}</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 items-end gap-2 min-[440px]:grid-cols-3 sm:gap-3 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]">
          <label htmlFor={searchId} className="grid gap-1.5 text-xs font-medium min-[440px]:col-span-3 lg:col-span-1">
            {t('cat.search.label')}
            <span className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input id={searchId} type="search" value={filter.query} placeholder={t('cat.search.ph')}
                onChange={(e) => patch({ query: e.target.value })} className="h-11 pl-8 text-base sm:h-9 sm:text-sm" />
            </span>
          </label>
          <FilterSelect label={t('cat.topic.label')} value={filter.topic} onChange={(v) => patch({ topic: v as CatalogTopic | 'all' })}
            options={[...CATALOG_TOPICS].sort((a, b) => t(`cat.topic.${a}`).localeCompare(t(`cat.topic.${b}`), lang)).map((tp) => [tp, t(`cat.topic.${tp}`)])} allLabel={t('cat.all')} />
          <FilterSelect label={t('cat.mode.label')} value={filter.mode} onChange={(v) => patch({ mode: v as CatalogMode | 'all' })}
            options={CATALOG_MODES.map((m) => [m, t(`cat.mode.${m}`)])} allLabel={t('cat.all')} />
          <FilterSelect label={t('cat.area.label')} value={filter.area} onChange={(v) => patch({ area: v as ResourceArea | 'all' })}
            options={RESOURCE_AREAS.map((a) => [a, t(`lr.area.${a}`)])} allLabel={t('cat.all')} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm sm:min-h-0">
            <input type="checkbox" className="h-4 w-4 accent-teal-700" checked={filter.showClosed} onChange={(e) => patch({ showClosed: e.target.checked })} />
            {t('cat.closed.toggle')}
          </label>
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground" aria-live="polite">{t('cat.count', { n: results.length })}</p>
            {filtered && <Button variant="ghost" size="sm" className="min-h-11 sm:min-h-8" onClick={() => patch(DEFAULT_FILTER)}><X className="h-3.5 w-3.5" aria-hidden />{t('cat.reset')}</Button>}
          </div>
        </div>

        {results.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">{t('cat.empty')}</p>
        ) : (
          <ol className="grid gap-3 md:grid-cols-2">
            {results.slice(0, shown).map((e, i) => (
              <CatalogCard key={e.id} entry={e} lang={lang} rank={ranking.byId.get(e.id)} top={i === 0 && (ranking.score.get(e.id) ?? 0) > 0 && !filter.query} />
            ))}
          </ol>
        )}
        {results.length > PAGE && (
          <div className="flex flex-wrap gap-2">
            {shown < results.length && (
              <Button variant="outline" size="sm" className="min-h-11 sm:min-h-9" onClick={() => setShown((n) => n + PAGE * 2)}>
                {t('cat.more', { n: Math.min(PAGE * 2, results.length - shown) })}
              </Button>
            )}
            {shown > PAGE && <Button variant="ghost" size="sm" className="min-h-11 sm:min-h-9" onClick={() => setShown(PAGE)}>{t('cat.less')}</Button>}
          </div>
        )}
        <p className="text-xs text-muted-foreground">{t('lr.note')}</p>
      </CardContent>
    </Card>
  );
}

function FilterSelect({ label, value, onChange, options, allLabel }: {
  label: string; value: string; onChange: (v: string) => void; options: Array<[string, string]>; allLabel: string;
}) {
  return (
    <label className="grid min-w-0 gap-1.5 text-xs font-medium">
      {label}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger aria-label={label} className="h-11 min-w-0 sm:h-9"><SelectValue /></SelectTrigger>
        <SelectContent className="max-h-80">
          <SelectItem value="all">{allLabel}</SelectItem>
          {options.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
        </SelectContent>
      </Select>
    </label>
  );
}

const AVAIL_STYLE: Record<CatalogEntry['availability'], string> = {
  open: 'border-emerald-600 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200',
  ongoing: 'border-teal-600/60 text-teal-900 dark:text-teal-200',
  upcoming: 'border-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200',
  closed: 'border-slate-400 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  unknown: 'border-dashed border-slate-400 text-slate-700 dark:text-slate-300',
};

function fmtDate(lang: Lang, iso: string): string {
  return formatDate(lang, iso, { short: true });
}

function CatalogCard({ entry: e, lang, rank, top }: { entry: CatalogEntry; lang: Lang; rank?: RankedResource; top: boolean }) {
  const t = useT();
  const name = entryName(t, lang, e);
  const note = entryNote(lang, e);
  const duration = entryDuration(lang, e);
  const location = e.mode === 'online' ? t('cat.loc.online') : [e.city, t(`lr.area.${e.area}`)].filter(Boolean).join(' · ');
  const dates = e.dates ? [e.dates.start && fmtDate(lang, e.dates.start), e.dates.end && fmtDate(lang, e.dates.end)].filter(Boolean).join(' – ') : null;
  const langs = e.languages.map((l) => (['uz', 'ru', 'en'].includes(l) ? t(`cat.lang.${l}`) : l)).join(', ');
  const host = (() => { try { return new URL(e.url).hostname.replace(/^www\./, ''); } catch { return e.url; } })();

  return (
    <li className={`flex min-w-0 flex-col rounded-xl border bg-card p-3 sm:p-4 ${top ? 'border-teal-500/70 ring-1 ring-teal-500/30' : ''}`}>
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge className="max-w-full truncate bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">{e.badge}</Badge>
        <Badge variant="outline" className={AVAIL_STYLE[e.availability]}>{t(`cat.avail.${e.availability}`)}</Badge>
        {e.stateFunded && <Badge variant="outline" className="gap-1 border-sky-600/60 text-sky-900 dark:text-sky-200"><Landmark className="h-3 w-3" aria-hidden />{t('cat.state')}</Badge>}
        {top && <Badge className="gap-1 bg-teal-700 text-white dark:bg-teal-600"><Sparkles className="h-3 w-3" aria-hidden />{t('cat.forYou')}</Badge>}
      </div>
      <p className="mt-2 text-base font-semibold leading-snug">{name}</p>
      <p className="text-xs text-muted-foreground">
        {e.provider} · {t(`cat.cat.${e.category}`)} · {t(`cat.kind.${e.kind}`)}
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{entryDesc(t, lang, e)}</p>

      <dl className="mt-3 grid grid-cols-1 gap-x-3 gap-y-1.5 text-sm min-[420px]:grid-cols-2">
        <Field icon={Globe2} label={t('cat.f.mode')} value={t(`cat.mode.${e.mode}`)} />
        <Field icon={MapPin} label={t('cat.f.location')} value={location} />
        <Field icon={Wallet} label={t('cat.f.cost')} value={t(`cat.cost.${e.cost}`)} />
        <Field icon={Languages} label={t('cat.f.language')} value={langs} />
        {duration && <Field icon={Clock} label={t('cat.f.duration')} value={duration} />}
        {dates && <Field icon={CalendarDays} label={t('cat.f.dates')} value={dates} />}
      </dl>

      <p className="mt-2 flex flex-wrap gap-1">
        {e.topics.slice(0, 5).map((tp) => <span key={tp} className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">{t(`cat.topic.${tp}`)}</span>)}
      </p>

      {rank && rank.reasons.length > 0 && (
        <p className="mt-2 rounded-md bg-teal-50 px-2 py-1 text-xs text-teal-950 dark:bg-teal-950/40 dark:text-teal-100">
          <span className="font-medium">{t('lr.why')}: </span>
          {rank.reasons.map((reason) => (reason === 'skill'
            ? t('lr.why.skill', { skills: rank.skills.map((s) => skillName(t, s)).join(', ') })
            : t(`lr.why.${reason}`))).join(' · ')}
        </p>
      )}
      {note && <p className="mt-2 rounded-md border-l-2 border-amber-500 bg-amber-50/70 px-2 py-1 text-xs text-amber-950 dark:bg-amber-950/30 dark:text-amber-100">{note}</p>}

      {e.mode !== 'online' && e.address && (
        <p className="mt-2 flex items-start gap-1.5 text-xs">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-700 dark:text-teal-400" aria-hidden />
          <span>
            <span className="font-medium">{e.address.line}</span>
            <span className="block text-muted-foreground">
              {t(`lr.addr.${e.address.confidence}`)} (<a href={e.address.source} target="_blank" rel="noopener noreferrer" className="underline">{t('lr.source')}</a>)
            </span>
          </span>
        </p>
      )}
      {e.contact && (
        <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs">
          {e.contact.phone && <a href={`tel:${e.contact.phone.replace(/[^+\d]/g, '')}`} className="inline-flex items-center gap-1 underline"><Phone className="h-3 w-3" aria-hidden />{e.contact.phone}</a>}
          {e.contact.email && <a href={`mailto:${e.contact.email}`} className="inline-flex items-center gap-1 underline"><Mail className="h-3 w-3" aria-hidden />{e.contact.email}</a>}
        </p>
      )}

      <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${e.verification === 'verified' ? 'text-emerald-700 dark:text-emerald-400' : ''}`} aria-hidden />
        <span><span className="font-medium text-foreground">{t(`cat.verif.${e.verification}`)}.</span> {t(`cat.verif.${e.verification}.d`, { date: fmtDate(lang, e.checked) })}</span>
      </p>

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
        <a href={e.url} target="_blank" rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-1 rounded-md px-1 text-sm font-medium text-teal-800 underline-offset-2 hover:underline dark:text-teal-300 sm:min-h-8">
          {host} <ExternalLink className="h-3.5 w-3.5" aria-hidden /><span className="sr-only">({t('cat.open')})</span>
        </a>
        {e.evidence.filter((u) => u !== e.url).length > 0 && (
          <a href={e.evidence.find((u) => u !== e.url)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-xs text-muted-foreground underline sm:min-h-8">
            {t('cat.evidence')}{e.evidence.filter((u) => u !== e.url).length > 1 ? ` (+${e.evidence.filter((u) => u !== e.url).length - 1})` : ''}
          </a>
        )}
        <ConnectButton entryId={e.id} name={name} />
      </div>
    </li>
  );
}

function Field({ icon: Icon, label, value }: { icon: typeof Globe2; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-start gap-1.5">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
      <div className="min-w-0">
        <dt className="sr-only">{label}</dt>
        <dd className="break-words"><span className="text-muted-foreground">{label}: </span>{value}</dd>
      </div>
    </div>
  );
}

/** Adds a catalogue entry to one of the learner's own paths. */
export function ConnectButton({ entryId, name, className = '' }: { entryId: string; name: string; className?: string }) {
  const t = useT();
  const { learningPaths, addToPath, createPath, setActivePath } = useSkillCast();
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const inId = useId();
  const owner = learningPaths.find((p) => p.items.some((i) => i.entryId === entryId));
  const done = (path: string) => {
    setOpen(false); setNewName('');
    toast({ title: t('cat.connect.done', { path }) });
    requestAnimationFrame(() => document.getElementById('my-learning-paths')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };
  if (owner) {
    return (
      <Button variant="secondary" size="sm" className={`ml-auto min-h-11 gap-1 sm:min-h-8 ${className}`}
        onClick={() => { setActivePath(owner.id); document.getElementById('my-learning-paths')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
        <Check className="h-3.5 w-3.5" aria-hidden />{t('cat.connected', { path: owner.name })}
      </Button>
    );
  }
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="sm" className={`ml-auto min-h-11 gap-1 bg-teal-700 text-white hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 sm:min-h-8 ${className}`}>
          <Plus className="h-3.5 w-3.5" aria-hidden />{t('cat.connect')}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 space-y-3">
        <p className="text-sm font-medium">{t('cat.connect.choose')}</p>
        <p className="text-xs text-muted-foreground">{name}</p>
        {learningPaths.length > 0 && (
          <ul className="space-y-1">
            {learningPaths.map((p) => (
              <li key={p.id}>
                <Button variant="outline" size="sm" className="min-h-11 w-full justify-start sm:min-h-9"
                  onClick={() => { addToPath(p.id, entryId); setActivePath(p.id); done(p.name); }}>{p.name}</Button>
              </li>
            ))}
          </ul>
        )}
        <form className="space-y-2" onSubmit={(ev) => {
          ev.preventDefault();
          const label = newName.trim() || name.slice(0, 40);
          createPath(label, entryId); done(label);
        }}>
          <label htmlFor={inId} className="text-xs font-medium">{learningPaths.length ? t('cat.connect.new') : t('cat.connect.newName')}</label>
          <Input id={inId} value={newName} onChange={(ev) => setNewName(ev.target.value)} placeholder={t('lp.create.ph')} className="h-11 text-base sm:h-9 sm:text-sm" maxLength={60} />
          <Button type="submit" size="sm" className="min-h-11 w-full sm:min-h-9">{t('cat.connect.create')}</Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}

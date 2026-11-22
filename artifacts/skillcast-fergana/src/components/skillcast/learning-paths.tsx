'use client';

import { useId, useState } from 'react';
import { CheckCircle2, Circle, CircleDot, Compass, ExternalLink, Pencil, Plus, Route, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { CATALOG_MAP, entryName, useCatalog } from '@/lib/resource-catalog';
import { cycleStatus, pathProgress, type PathItemStatus } from '@/lib/learning-paths';
import { useSkillCast } from '@/lib/store';
import { useT } from './shared';

// ─── The learner's own learning paths ──────────────────────────────────────
// Any number of paths, each with its own steps (catalogue entries) and its
// own progress, saved in this browser. Marking a step is the learner's own
// record: SkillCast cannot see progress on a provider's site.

const STATUS_ICON: Record<PathItemStatus, typeof Circle> = { todo: Circle, doing: CircleDot, done: CheckCircle2 };
const STATUS_STYLE: Record<PathItemStatus, string> = {
  todo: 'border-border text-muted-foreground',
  doing: 'border-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200',
  done: 'border-emerald-600 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200',
};

const goToCatalogue = () => document.getElementById('where-to-learn')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

export function LearningPaths() {
  const t = useT();
  useCatalog(); // loads runtime extras so their names resolve
  const { lang, learningPaths, activePathId, setActivePath, createPath, renamePath, deletePath, removeFromPath, setPathItemStatus } = useSkillCast();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [renaming, setRenaming] = useState<string | null>(null);
  const [rename, setRename] = useState('');
  const createId = useId();
  const renameId = useId();
  const active = learningPaths.find((p) => p.id === activePathId) ?? learningPaths[0] ?? null;
  const progress = active ? pathProgress(active) : null;

  return (
    <Card id="my-learning-paths" className="scroll-mt-24">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Route className="h-5 w-5 shrink-0 text-teal-700 dark:text-teal-400" aria-hidden />{t('lp.title')}
        </CardTitle>
        <CardDescription>{t('lp.lede')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {learningPaths.length > 0 && (
          <div role="tablist" aria-label={t('lp.pathTabs')} className="flex flex-wrap gap-1.5">
            {learningPaths.map((p) => {
              const pr = pathProgress(p);
              const on = active?.id === p.id;
              return (
                <button key={p.id} role="tab" type="button" aria-selected={on} aria-controls={`lp-panel-${p.id}`} id={`lp-tab-${p.id}`}
                  onClick={() => setActivePath(p.id)}
                  className={`inline-flex min-h-11 max-w-full items-center gap-2 rounded-full border px-3 text-sm font-medium sm:min-h-9 ${on ? 'border-teal-700 bg-teal-700 text-white dark:border-teal-500 dark:bg-teal-600' : 'hover:border-teal-500'}`}>
                  <span className="truncate">{p.name}</span>
                  <span className={`rounded-full px-1.5 text-xs ${on ? 'bg-white/20' : 'bg-muted text-muted-foreground'}`}>{pr.done}/{pr.total}</span>
                </button>
              );
            })}
          </div>
        )}

        {!active ? (
          <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">{t('lp.none')}</p>
        ) : (
          <section role="tabpanel" id={`lp-panel-${active.id}`} aria-labelledby={`lp-tab-${active.id}`} className="space-y-3 rounded-xl border p-3 sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              {renaming === active.id ? (
                <form className="flex w-full flex-wrap items-end gap-2" onSubmit={(e) => { e.preventDefault(); renamePath(active.id, rename); setRenaming(null); }}>
                  <label htmlFor={renameId} className="sr-only">{t('lp.rename')}</label>
                  <Input id={renameId} value={rename} onChange={(e) => setRename(e.target.value)} maxLength={60} className="h-11 min-w-0 flex-1 text-base sm:h-9 sm:text-sm" autoFocus />
                  <Button type="submit" size="sm" className="min-h-11 sm:min-h-9">{t('lp.save')}</Button>
                  <Button type="button" variant="ghost" size="sm" className="min-h-11 sm:min-h-9" onClick={() => setRenaming(null)}>{t('lp.cancel')}</Button>
                </form>
              ) : (
                <>
                  <h3 className="min-w-0 break-words text-base font-semibold">{active.name}</h3>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="min-h-11 gap-1 sm:min-h-8" onClick={() => { setRenaming(active.id); setRename(active.name); }}>
                      <Pencil className="h-3.5 w-3.5" aria-hidden />{t('lp.rename')}
                    </Button>
                    <Button variant="ghost" size="sm" className="min-h-11 gap-1 text-red-700 hover:text-red-800 dark:text-red-400 sm:min-h-8"
                      onClick={() => { if (window.confirm(t('lp.delete.confirm', { path: active.name }))) deletePath(active.id); }}>
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />{t('lp.delete')}
                    </Button>
                  </div>
                </>
              )}
            </div>
            {progress && progress.total > 0 && (
              <div className="space-y-1">
                <Progress value={progress.pct} aria-label={t('lp.progress', { done: progress.done, total: progress.total })} className="h-2.5 [&>div]:bg-emerald-600" />
                <p className="text-xs text-muted-foreground">{t('lp.progress', { done: progress.done, total: progress.total })}</p>
              </div>
            )}
            {active.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('lp.emptyPath')}</p>
            ) : (
              <ol className="space-y-2">
                {active.items.map((item, i) => {
                  const entry = CATALOG_MAP[item.entryId];
                  const label = entry ? entryName(t, lang, entry) : item.entryId;
                  const Icon = STATUS_ICON[item.status];
                  const status = t(`lp.status.${item.status}`);
                  return (
                    <li key={item.entryId} className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-2 gap-y-1 rounded-lg border p-2 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold" aria-hidden>{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className={`break-words text-sm font-medium ${item.status === 'done' ? 'text-muted-foreground line-through decoration-emerald-600/60' : ''}`}>{label}</p>
                        {entry ? (
                          <a href={entry.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-8 items-center gap-1 text-xs text-teal-800 underline-offset-2 hover:underline dark:text-teal-300">
                            {entry.badge} <ExternalLink className="h-3 w-3" aria-hidden /><span className="sr-only">({t('cat.open')})</span>
                          </a>
                        ) : <p className="text-xs text-muted-foreground">{t('lp.unavailable')}</p>}
                      </div>
                      <div className="col-start-2 flex items-center justify-between gap-2 sm:col-start-3">
                      <button type="button" onClick={() => setPathItemStatus(active.id, item.entryId, cycleStatus(item.status))}
                        aria-label={t('lp.status.change', { name: label, status })}
                        className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3 text-xs font-medium sm:min-h-8 ${STATUS_STYLE[item.status]}`}>
                        <Icon className="h-3.5 w-3.5" aria-hidden />{status}
                      </button>
                      <Button variant="ghost" size="icon" className="h-11 w-11 shrink-0 sm:h-8 sm:w-8" aria-label={t('lp.remove', { name: label })}
                        onClick={() => removeFromPath(active.id, item.entryId)}>
                        <X className="h-4 w-4" aria-hidden />
                      </Button>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
            {progress && progress.total > 0 && progress.done === progress.total && (
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100" role="status">{t('lp.renew')}</p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" className="min-h-11 gap-1 bg-teal-700 text-white hover:bg-teal-800 dark:bg-teal-600 sm:min-h-9" onClick={goToCatalogue}>
                <Plus className="h-4 w-4" aria-hidden />{t('lp.add')}
              </Button>
            </div>
          </section>
        )}

        <div className="flex flex-wrap items-end gap-2">
          {creating ? (
            <form className="flex w-full flex-wrap items-end gap-2" onSubmit={(e) => { e.preventDefault(); if (name.trim()) { createPath(name); setName(''); setCreating(false); } }}>
              <label htmlFor={createId} className="grid min-w-0 flex-1 gap-1 text-xs font-medium">
                {t('cat.connect.newName')}
                <Input id={createId} value={name} onChange={(e) => setName(e.target.value)} placeholder={t('lp.create.ph')} maxLength={60} className="h-11 text-base sm:h-9 sm:text-sm" autoFocus />
              </label>
              <Button type="submit" size="sm" className="min-h-11 sm:min-h-9" disabled={!name.trim()}>{t('lp.create.go')}</Button>
              <Button type="button" variant="ghost" size="sm" className="min-h-11 sm:min-h-9" onClick={() => setCreating(false)}>{t('lp.cancel')}</Button>
            </form>
          ) : (
            <>
              <Button variant="outline" size="sm" className="min-h-11 gap-1 sm:min-h-9" onClick={() => setCreating(true)}>
                <Plus className="h-4 w-4" aria-hidden />{t('lp.create')}
              </Button>
              <Button variant="ghost" size="sm" className="min-h-11 gap-1 sm:min-h-9" onClick={goToCatalogue}>
                <Compass className="h-4 w-4" aria-hidden />{t('lp.explore')}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

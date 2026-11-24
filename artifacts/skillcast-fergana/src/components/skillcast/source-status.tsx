'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Clock, RefreshCw, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SIGNAL_SOURCE_IDS } from '@/lib/fergana-evidence';
import { useSourceT } from '@/lib/signal-source-i18n';
import { useSignals } from './shared';

// ─── Source status and "Refresh live sources" ──────────────────────────────
// Pressing the button asks the API to fetch every source whose minimum
// interval has passed (POST /api/fergana/signals). The panel then shows,
// per source category, what happened on this press, when it was last
// fetched and when it may be asked again. Wording separates three states:
// fetched from the sources, a saved copy, and starting estimates.

type Id = (typeof SIGNAL_SOURCE_IDS)[number];
const BADGE = {
  live: 'border-emerald-600/40 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
  fallback: 'border-amber-600/40 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200',
  error: 'border-red-600/40 bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300',
} as const;
const DOT = { live: 'bg-emerald-600', fallback: 'bg-amber-500', error: 'bg-red-600' } as const;

export function SourceStatusPanel({ compact = false }: { compact?: boolean }) {
  const { st, fmt, ago } = useSourceT();
  const { data, refreshing, refresh, lastRefresh } = useSignals();
  // Re-render every 30 s so "updated 2 min ago" stays true without new data.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const t = window.setInterval(() => setNow(Date.now()), 30000); return () => window.clearInterval(t); }, []);
  const prov = data?.provenance;
  const mode = prov?.mode ?? 'demo';
  const states = prov?.sources ?? [];
  const lastOk = states.map((s) => s.fetchedAt).filter((x): x is string => !!x).sort().at(-1) ?? null;
  const outcome = (id: Id) => (lastRefresh?.ok ? lastRefresh.results.find((r) => r.id === id) : undefined);
  const counts = lastRefresh?.ok
    ? {
        ok: lastRefresh.results.filter((r) => r.outcome === 'refreshed').length,
        wait: lastRefresh.results.filter((r) => r.outcome === 'rate-limited').length,
        fail: lastRefresh.results.filter((r) => r.outcome === 'failed').length,
      }
    : null;
  const stateKey = mode === 'demo' ? 'rs.state.demo' : mode === 'cached' ? 'rs.state.cached' : 'rs.state.fresh';
  const stateTone = mode === 'demo' ? 'border-slate-400/50 bg-slate-500/10 text-slate-800 dark:text-slate-200'
    : mode === 'cached' ? 'border-amber-500/50 bg-amber-500/10 text-amber-900 dark:text-amber-200'
      : 'border-emerald-500/50 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200';

  return (
    <section aria-labelledby="rs-title" className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h2 id="rs-title" className="text-base font-semibold">{st('rs.title')}</h2>
          <p className="flex flex-wrap items-center gap-2 text-sm">
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${stateTone}`}>{st(stateKey)}</span>
            <span className="text-muted-foreground">{st('rs.lastOk')}: <span className="font-medium text-foreground">{fmt(lastOk) ?? st('rs.never')}</span></span>
          </p>
        </div>
        <Button onClick={() => void refresh()} disabled={refreshing} className="min-h-11 gap-2 bg-teal-700 text-white hover:bg-teal-800 dark:bg-teal-700 dark:hover:bg-teal-800">
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} aria-hidden />
          {refreshing ? st('src.refreshing') : st('src.refresh')}
        </Button>
      </div>

      <p role="status" aria-live="polite" className="min-h-0 text-sm">
        {lastRefresh && !refreshing && (lastRefresh.ok && counts && lastRefresh.results.length
          ? <span className="rounded-md bg-teal-50 px-2 py-1 text-teal-900 dark:bg-teal-950/40 dark:text-teal-100">{st('rs.done', { time: fmt(lastRefresh.at) ?? '', ...counts })}</span>
          : <span className="rounded-md bg-red-50 px-2 py-1 text-red-800 dark:bg-red-950/40 dark:text-red-200">{st('rs.doneFail', { time: fmt(lastRefresh.at) ?? '' })}</span>)}
      </p>

      <ul className={`grid gap-2 sm:grid-cols-2 ${compact ? 'xl:grid-cols-3' : 'lg:grid-cols-3'}`} data-testid="signal-sources">
        {SIGNAL_SOURCE_IDS.filter((id) => !states.length || states.some((s) => s.id === id)).map((id) => {
          const state = states.find((s) => s.id === id);
          const res = outcome(id);
          const live = state?.state ?? 'error';
          const Icon = res?.outcome === 'failed' ? XCircle : res?.outcome === 'rate-limited' ? Clock : live === 'live' ? CheckCircle2 : live === 'fallback' ? Clock : XCircle;
          const tone = res?.outcome === 'failed' || live === 'error' ? 'text-red-700 dark:text-red-400'
            : res?.outcome === 'rate-limited' || live === 'fallback' ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400';
          const minutes = state?.refreshMinutes ?? (id === 'remotive' ? 360 : 15);
          return (
            <li key={id} data-source={id} data-state={live} className="flex min-w-0 flex-col gap-1.5 rounded-lg border p-3 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="min-w-0 flex-1 basis-40 font-medium leading-snug">{st(`rs.cat.${id}`)}</p>
                <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-bold tracking-wide ${BADGE[live]}`}>
                  <span className={`h-2 w-2 rounded-full ${DOT[live]} ${live === 'live' ? 'motion-safe:animate-pulse' : ''}`} aria-hidden />
                  {st(`rs.state.${live}`)}
                </span>
              </div>
              <p className="text-xs font-medium text-foreground" data-testid="source-age">
                {!state?.fetchedAt ? st('rs.noData')
                  : live === 'live' ? st('rs.updated', { ago: ago(state.fetchedAt, now) ?? '' })
                    : st('rs.lastGood', { ago: ago(state.fetchedAt, now) ?? '' })}
                <span className="font-normal text-muted-foreground"> · {fmt(state?.fetchedAt) ?? ''}</span>
              </p>
              {res && (
                <p className={`flex items-start gap-1.5 text-xs font-semibold ${tone}`}>
                  <Icon className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span>{st(`rs.out.${res.outcome}`, { time: fmt(res.nextAllowedAt) ?? '' })}</span>
                </p>
              )}
              <div className="flex flex-wrap gap-1">
                {(state?.scopes ?? []).map((scope) => (
                  <span key={scope} className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">{st(`rs.scope.${scope}`)}</span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {st('rs.records', { n: state?.recordCount ?? 0 })} · {minutes >= 60 ? st('rs.every.h', { n: Math.round(minutes / 60) }) : st('rs.every.min', { n: minutes })}
                {state?.sourceUpdatedAt ? ` · ${st('rs.published', { time: fmt(state.sourceUpdatedAt, false) ?? '' })}` : ''}
              </p>
              {state?.error && live !== 'live' && (
                <p className="break-words text-[11px] text-red-700 dark:text-red-400">{st('rs.err', { msg: state.error })}</p>
              )}
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-muted-foreground">{st('rs.auto')}</p>
      <p className="text-xs text-muted-foreground">{st('rs.honest')} {st('src.refreshLimited')}</p>
    </section>
  );
}

'use client';

import { CheckCircle2, Clock, RefreshCw, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSourceT } from '@/lib/signal-source-i18n';
import { useSignals } from './shared';

// ─── Source status and "Refresh live sources" ──────────────────────────────
// Pressing the button asks the API to fetch every source whose minimum
// interval has passed (POST /api/fergana/signals). The panel then shows,
// per source category, what happened on this press, when it was last
// fetched and when it may be asked again. Wording separates three states:
// fetched from the sources, a saved copy, and starting estimates.

const SOURCES = ['siat', 'worldbank', 'remotive'] as const;
type Id = (typeof SOURCES)[number];

export function SourceStatusPanel({ compact = false }: { compact?: boolean }) {
  const { st, fmt } = useSourceT();
  const { data, refreshing, refresh, lastRefresh } = useSignals();
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

      <ul className={`grid gap-2 ${compact ? 'md:grid-cols-3' : 'lg:grid-cols-3'}`}>
        {SOURCES.map((id) => {
          const state = states.find((s) => s.id === id);
          const res = outcome(id);
          const Icon = res?.outcome === 'failed' ? XCircle : res?.outcome === 'rate-limited' ? Clock : state?.status === 'periodic' ? CheckCircle2 : state ? Clock : XCircle;
          const tone = res?.outcome === 'failed' || !state || state.status === 'unavailable' ? 'text-red-700 dark:text-red-400'
            : res?.outcome === 'rate-limited' || state.status === 'cached' ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400';
          return (
            <li key={id} className="min-w-0 rounded-lg border p-3 text-sm">
              <p className="font-medium leading-snug">{st(`rs.cat.${id}`)}</p>
              <p className={`mt-1.5 flex items-start gap-1.5 font-semibold ${tone}`}>
                <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span>
                  {res
                    ? st(`rs.out.${res.outcome}`, { time: fmt(res.nextAllowedAt) ?? '' })
                    : st(`rs.st.${state?.status ?? 'unavailable'}`)}
                </span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {state?.fetchedAt ? st('rs.fetched', { time: fmt(state.fetchedAt) ?? '' }) : st('rs.never')}
                {state?.sourceUpdatedAt ? ` · ${st('rs.published', { time: fmt(state.sourceUpdatedAt, false) ?? '' })}` : ''}
              </p>
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-muted-foreground">{st('rs.honest')} {st('src.refreshLimited')}</p>
    </section>
  );
}

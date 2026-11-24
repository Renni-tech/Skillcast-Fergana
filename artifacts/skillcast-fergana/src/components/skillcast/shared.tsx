'use client';

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { makeT, SDG_COLORS as SDG_HEX } from '@/lib/i18n';
import { useSkillCast } from '@/lib/store';
import type { SignalsPayload } from '@/lib/types';
import { SKILL_MAP } from '@/data/skills';
import { cachedFerganaSignals, parseFerganaSignals } from '@/lib/fergana-evidence';

// The original SkillCast keeps /api/signals. Fergana uses only its approved feed.
const SIGNALS_CACHE_KEY = 'skillcast-fergana-approved-signals-v1';

interface SignalsCtx {
  data: SignalsPayload | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  momentumMap: Record<string, number>;
  /** Report from the last "Refresh live sources" press in this session. */
  lastRefresh: LastRefresh | null;
}
export type LastRefresh =
  | { ok: true; at: string; results: NonNullable<NonNullable<SignalsPayload['provenance']>['refresh']>['results'] }
  | { ok: false; at: string };

const Ctx = createContext<SignalsCtx>({
  data: null,
  loading: true,
  refreshing: false,
  error: null,
  refresh: async () => {},
  momentumMap: {},
  lastRefresh: null,
});

/** How often an open page asks for fresh signals (each source has its own server-side interval). */
export const SIGNALS_AUTO_REFRESH_MS = 10 * 60 * 1000;

export function SignalsProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SignalsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<LastRefresh | null>(null);

  // One request at a time: a background GET is skipped while another request
  // runs; a manual refresh pressed meanwhile runs right after it.
  const inFlight = useRef<Promise<void> | null>(null);
  const lastOkAt = useRef(0);

  const run = async (method: 'GET' | 'POST') => {
    try {
      const res = await fetch('/api/fergana/signals', { method, cache: 'no-store', signal: AbortSignal.timeout(30000) });
      if (!res.ok) throw new Error(`signals ${res.status}`);
      const json = parseFerganaSignals(await res.json());
      setData(json);
      setError(null);
      lastOkAt.current = Date.now();
      if (method === 'POST') setLastRefresh({ ok: true, at: new Date().toISOString(), results: json.provenance?.refresh?.results ?? [] });
      try { localStorage.setItem(SIGNALS_CACHE_KEY, JSON.stringify(json)); } catch { /* Source caching is optional; learner storage is unchanged. */ }
    } catch {
      let saved: SignalsPayload | null = null;
      try {
        const raw = localStorage.getItem(SIGNALS_CACHE_KEY);
        if (raw) saved = cachedFerganaSignals(parseFerganaSignals(JSON.parse(raw)));
      } catch { /* Corrupt source cache is discarded, never interpreted as live data. */ }
      // The API could not be reached: whatever is shown is a saved copy, never "live".
      setData((previous) => previous ? cachedFerganaSignals(previous) : saved);
      setError('evidence.error');
      if (method === 'POST') setLastRefresh({ ok: false, at: new Date().toISOString() });
    } finally {
      setLoading(false);
      if (method === 'POST') setRefreshing(false);
    }
  };

  const manual = useRef<Promise<void> | null>(null);
  const load = (method: 'GET' | 'POST'): Promise<void> => {
    if (method === 'GET') return inFlight.current ?? start('GET');
    // Repeated clicks join the refresh already running or queued.
    if (manual.current) return manual.current;
    setRefreshing(true);
    const p = (inFlight.current ? inFlight.current.then(() => start('POST')) : start('POST'))
      .finally(() => { manual.current = null; });
    manual.current = p;
    return p;
  };
  const start = (method: 'GET' | 'POST'): Promise<void> => {
    const p = run(method).finally(() => { inFlight.current = null; });
    inFlight.current = p;
    return p;
  };

  // Load on open, then refresh automatically while the page is visible. The
  // server decides per source whether a new check is due (provider limits).
  useEffect(() => {
    void load('GET');
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void load('GET');
    }, SIGNALS_AUTO_REFRESH_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible' && Date.now() - lastOkAt.current > SIGNALS_AUTO_REFRESH_MS) void load('GET');
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', onVisible); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const momentumMap: Record<string, number> = {};
  if (data) for (const s of data.snapshots) momentumMap[s.skillSlug] = s.momentum;

  return (
    <Ctx.Provider
      value={{ data, loading, refreshing, error, refresh: () => load('POST'), momentumMap, lastRefresh }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useSignals() {
  return useContext(Ctx);
}

// ─── Language helper hook ──────────────────────────────────────────────────

export function useT() {
  const lang = useSkillCast((s) => s.lang);
  return makeT(lang);
}

type Translate = ReturnType<typeof makeT>;

export const roleTitle = (t: Translate, slug: string) => t(`hr.role.${slug}.title`);
export const roleTagline = (t: Translate, slug: string) => t(`hr.role.${slug}.tagline`);
export const roleSignals = (t: Translate, slug: string) => t(`hr.role.${slug}.signals`);
export const roleSdgMechanism = (t: Translate, slug: string) => t(`hr.role.${slug}.sdgMechanism`);
// Saved profiles and CV extraction may contain skills outside the curated
// registry. Keep these user values visible without treating them as UI keys.
export const skillName = (t: Translate, slug: string) => SKILL_MAP[slug] ? t(`skill.${slug}`) : slug;
export const skillCategory = (t: Translate, category: string) =>
  Object.values(SKILL_MAP).some((skill) => skill.category === category) ? t(`skill.category.${category}`) : category;
export const roleCategory = (t: Translate, category: string) => t(`role.category.${category}`);
export const courseTitle = (t: Translate, slug: string) => t(`course.${slug}.title`);
export const courseProvider = (t: Translate, slug: string) => t(`course.${slug}.provider`);
export const courseOutcome = (t: Translate, slug: string) => t(`course.${slug}.outcome`);

// ─── Small shared UI atoms ─────────────────────────────────────────────────

// Official SDG colours stay; the number switches to dark text where white
// text would fall below WCAG AA contrast (e.g. the gold of SDG 12).
function relativeLuminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function sdgTextColor(hex: string) {
  return 1.05 / (relativeLuminance(hex) + 0.05) >= 4.5 ? '#ffffff' : '#111827';
}

export function SdgBadge({ goal, size = 'sm', label }: { goal: number; size?: 'sm' | 'md'; label?: string }) {
  const t = useT();
  const bg = SDG_HEX[goal] ?? '#555555';
  return (
    <span
      className={`inline-flex items-center rounded-md font-semibold ${
        size === 'sm' ? 'h-5 w-5 justify-center text-[10px]' : 'h-6 min-w-6 px-1.5 justify-center text-xs'
      }`}
      style={{ backgroundColor: bg, color: sdgTextColor(bg) }}
      title={label ?? t('SDG {goal}', { goal })}
      aria-label={label ?? t('Sustainable Development Goal {goal}', { goal })}
    >
      {goal}
    </span>
  );
}

export function MomentumPill({ momentum }: { momentum: number }) {
  const rising = momentum >= 60;
  const mid = momentum >= 45;
  return (
    <Badge
      variant="outline"
      className={
        rising
          ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
          : mid
            ? 'border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
            : 'border-rose-300 bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
      }
    >
      {momentum}
      <span className="ml-0.5 text-[10px]">/100</span>
    </Badge>
  );
}

export function TrendArrow({ delta }: { delta: number }) {
  if (Math.abs(delta) < 2) return <span className="text-muted-foreground">→</span>;
  return delta > 0 ? (
    <span className="font-semibold text-emerald-600 dark:text-emerald-400">↑ {Math.abs(delta)}</span>
  ) : (
    <span className="font-semibold text-rose-600 dark:text-rose-400">↓ {Math.abs(delta)}</span>
  );
}

export function SourceChip({ children, href }: { children: ReactNode; href?: string }) {
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex max-w-full items-center gap-1 rounded-lg border border-border bg-muted px-2 py-0.5 text-left text-[11px] leading-snug text-muted-foreground hover:text-foreground"
      >
        {children}
      </a>
    );
  }
  return (
    <span className="inline-flex max-w-full items-center gap-1 rounded-lg border border-border bg-muted px-2 py-0.5 text-left text-[11px] leading-snug text-muted-foreground">
      {children}
    </span>
  );
}

export function LevelDots({ level, max = 5, highlight = 0 }: { level: number; max?: number; highlight?: number }) {
  const t = useT();
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={t('Level {level} of {max}', { level, max })}>
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={`h-2 w-2 rounded-full ${
            i < level
              ? i < highlight
                ? 'bg-emerald-600'
                : 'bg-teal-600 dark:bg-teal-400'
              : 'bg-muted-foreground/25'
          }`}
        />
      ))}
    </span>
  );
}

export function LevelPicker({ level, onChange }: { level: number; onChange: (n: number) => void }) {
  const t = useT();
  return (
    <span className="inline-flex items-center gap-1" role="radiogroup" aria-label={t('Skill level 0 to 5')}>
      <button
        type="button"
        role="radio"
        aria-checked={level === 0}
        onClick={() => onChange(0)}
        className={`rounded px-1.5 py-0.5 text-xs font-medium ${
          level === 0 ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted'
        }`}
      >
        0
      </button>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={level === n}
          aria-label={t('Level {level}', { level: n })}
          onClick={() => onChange(n)}
          className={`h-4 w-4 rounded-full border transition-colors ${
            level >= n
              ? 'border-teal-600 bg-teal-600 dark:border-teal-400 dark:bg-teal-400'
              : 'border-muted-foreground/40 hover:border-teal-500'
          } ${level === n ? 'ring-2 ring-teal-300 dark:ring-teal-700' : ''}`}
        />
      ))}
      <span className="ml-1 w-3 text-xs text-muted-foreground" aria-hidden>{level}</span>
    </span>
  );
}

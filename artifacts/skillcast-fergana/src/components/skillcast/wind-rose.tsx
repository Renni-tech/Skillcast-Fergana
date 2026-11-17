'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Compass, Mic, Table2, TrendingUp, Trophy } from 'lucide-react';
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSkillCast } from '@/lib/store';
import { usePanels } from '@/lib/ui-panels';
import { computeWindRose, type WindRosePoint } from '@/lib/wind-rose';
import { useReducedMotion } from './a11y';
import { Explainer } from './explainer';
import { skillName, useSignals, useT } from './shared';

// ─── Wind Rose: the learner's career direction map ─────────────────────────
// Blue filled = you now; violet solid = market direction; amber dashed =
// pathway target. Line style + legend text + table, never colour alone.

const COLORS = { you: '#2563eb', market: '#7c3aed', target: '#d97706' };

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(800);
  useEffect(() => {
    if (!ref.current || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return { ref, width };
}

/** Wrap an axis label into at most three lines without cutting words. */
function wrapLabel(text: string, max: number, maxLines = 3): string[] {
  const lines: string[] = [''];
  for (const word of text.split(' ')) {
    const current = lines[lines.length - 1];
    if (!current || (current + ' ' + word).length <= max) lines[lines.length - 1] = current ? `${current} ${word}` : word;
    else if (lines.length < maxLines) lines.push(word);
    else { lines[maxLines - 1] = `${lines[maxLines - 1]}…`; break; }
  }
  return lines.map((l) => (l.length > max + 4 ? `${l.slice(0, max)}…` : l));
}

export function WindRose({ compact = false }: { compact?: boolean }) {
  const t = useT();
  const { profile, chosenRole, setDashTab, setView } = useSkillCast();
  const { momentumMap } = useSignals();
  const openVoice = usePanels((s) => s.openVoice);
  const reduceMotion = useReducedMotion();
  const [showTable, setShowTable] = useState(false);
  const { ref, width } = useWidth<HTMLDivElement>();
  const narrow = width < 560;

  const rose = useMemo(() => computeWindRose(profile, momentumMap, chosenRole, narrow ? 8 : 10), [profile, momentumMap, chosenRole, narrow]);
  const hasTarget = rose.points.some((p) => p.target !== null);
  const data = rose.points.map((p, i) => ({ ...p, n: i + 1, label: skillName(t, p.slug), targetValue: p.target ?? 0 }));

  const Tick = ({ x, y, payload, textAnchor }: { x: number; y: number; payload: { value: string; index: number }; textAnchor: 'start' | 'middle' | 'end' }) => {
    const point = data[payload.index];
    if (!point) return null;
    if (narrow) {
      return (
        <g transform={`translate(${x},${y})`}>
          <circle r={9} fill={point.gap >= 20 ? COLORS.target : 'var(--muted)'} />
          <text textAnchor="middle" dy={4} fontSize={10} fontWeight={700} fill={point.gap >= 20 ? '#fff' : 'var(--foreground)'}>{point.n}</text>
        </g>
      );
    }
    const lines = wrapLabel(point.label, 18);
    return (
      <text x={x} y={y} textAnchor={textAnchor} fontSize={11} fill="var(--muted-foreground)" fontWeight={point.inPathway ? 700 : 400}>
        {lines.map((line, i) => <tspan key={i} x={x} dy={i === 0 ? 4 - (lines.length - 1) * 6 : 13}>{line}</tspan>)}
      </text>
    );
  };

  const TipContent = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: (typeof data)[number] }> }) => {
    if (!active || !payload?.length) return null;
    const p = payload[0].payload;
    return (
      <div className="max-w-60 rounded-lg border bg-popover p-3 text-xs text-popover-foreground shadow-md">
        <p className="font-semibold">{p.label}</p>
        <p style={{ color: COLORS.you }}>{t('wr.you')}: {p.you}</p>
        <p style={{ color: COLORS.market }}>{t('wr.market')}: {p.market} <span className="text-muted-foreground">({t(p.tracked ? 'wr.tracked' : 'wr.baseline')})</span></p>
        {p.target !== null && <p style={{ color: COLORS.target }}>{t('wr.target')}: {p.target}</p>}
        {p.gap > 0 && <p className="mt-1 font-medium">{t('wr.gap', { n: p.gap })}</p>}
      </div>
    );
  };

  const goLearn = () => { setDashTab('pathway'); setView('dashboard'); };

  return (
    <Card className="overflow-hidden border-blue-200 shadow-sm dark:border-blue-900/60">
      <CardHeader className="gap-1 pb-2">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
              <Compass className="h-4 w-4 shrink-0" aria-hidden /> {t('wr.kicker')}
            </p>
            <CardTitle className="mt-1 text-lg leading-snug sm:text-xl">{t('wr.title')}</CardTitle>
            <CardDescription className="mt-1">{t('wr.lede')}</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="h-auto min-h-9 w-full gap-1.5 whitespace-normal text-left sm:w-auto sm:max-w-56" onClick={() => openVoice(t('va.ex.radar'))}>
            <Mic className="h-4 w-4 shrink-0" aria-hidden /> {t('wr.ask')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`grid gap-4 ${compact ? '' : 'lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]'}`}>
          <div className="min-w-0">
            <div
              ref={ref}
              className="h-[19rem] min-w-0 sm:h-[24rem]"
              role="img"
              aria-label={t('wr.aria', { n: data.length })}
            >
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={data} outerRadius={narrow ? '74%' : '68%'} margin={{ top: 16, right: 24, bottom: 16, left: 24 }}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="label" tick={Tick as never} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name={t('wr.market')} dataKey="market" stroke={COLORS.market} strokeWidth={2} fill={COLORS.market} fillOpacity={0.08} isAnimationActive={!reduceMotion} />
                  {hasTarget && <Radar name={t('wr.target')} dataKey="targetValue" stroke={COLORS.target} strokeWidth={2} strokeDasharray="6 4" fill="none" isAnimationActive={!reduceMotion} />}
                  <Radar name={t('wr.you')} dataKey="you" stroke={COLORS.you} strokeWidth={2} fill={COLORS.you} fillOpacity={0.35} isAnimationActive={!reduceMotion} />
                  <Tooltip content={TipContent as never} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            {/* Legend: colour + line style + words */}
            <ul className="mt-2 grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-3">
              <li className="flex items-start gap-2"><span aria-hidden className="mt-0.5 h-3 w-5 shrink-0 rounded-sm border-2" style={{ borderColor: COLORS.you, background: `${COLORS.you}59` }} />{t('wr.legend.you')}</li>
              <li className="flex items-start gap-2"><span aria-hidden className="mt-1.5 h-0 w-5 shrink-0 border-t-2" style={{ borderColor: COLORS.market }} />{t('wr.legend.market')}</li>
              {hasTarget && <li className="flex items-start gap-2"><span aria-hidden className="mt-1.5 h-0 w-5 shrink-0 border-t-2 border-dashed" style={{ borderColor: COLORS.target }} />{t('wr.legend.target')}</li>}
            </ul>
            {narrow && (
              <ol className="mt-3 grid gap-1 text-xs sm:grid-cols-2">
                {data.map((p) => (
                  <li key={p.slug} className="flex items-start gap-2">
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${p.gap >= 20 ? 'bg-amber-600 text-white' : 'bg-muted'}`}>{p.n}</span>
                    <span className="min-w-0">{p.label}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {/* What to do with it */}
          <div className="space-y-3">
            <section aria-labelledby="wr-prio" className="rounded-xl border border-amber-300/70 bg-amber-50/60 p-3 dark:border-amber-700/60 dark:bg-amber-950/20">
              <h3 id="wr-prio" className="flex items-center gap-2 text-sm font-semibold"><TrendingUp className="h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400" aria-hidden />{t('wr.priorities')}</h3>
              {rose.priorities.length ? (
                <ol className="mt-2 space-y-2">
                  {rose.priorities.map((p: WindRosePoint) => (
                    <li key={p.slug} className="rounded-lg bg-background/80 p-2.5">
                      <p className="text-sm font-medium leading-snug">{skillName(t, p.slug)}</p>
                      <p className="mt-0.5 flex flex-wrap gap-x-2 text-xs text-muted-foreground">
                        <span>{t('wr.gap', { n: p.gap })}</span>
                        {p.inPathway && <span className="font-medium text-amber-800 dark:text-amber-300">· {t('wr.inPathway')}</span>}
                      </p>
                    </li>
                  ))}
                </ol>
              ) : <p className="mt-2 text-xs text-muted-foreground">{t('wr.priorities.none')}</p>}
              {rose.priorities.length > 0 && (
                <Button size="sm" className="mt-3 h-auto min-h-9 w-full gap-1.5 whitespace-normal bg-amber-700 text-white hover:bg-amber-800" onClick={goLearn}>
                  {t('wr.find')} <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                </Button>
              )}
            </section>
            <section aria-labelledby="wr-str" className="rounded-xl border p-3">
              <h3 id="wr-str" className="flex items-center gap-2 text-sm font-semibold"><Trophy className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />{t('wr.strengths')}</h3>
              {rose.strengths.length ? (
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {rose.strengths.map((p) => <li key={p.slug}><Badge variant="secondary">{skillName(t, p.slug)}</Badge></li>)}
                </ul>
              ) : <p className="mt-2 text-xs text-muted-foreground">{t(Object.values(profile.skills ?? {}).some((v) => v > 0) ? 'wr.strengths.growing' : 'wr.strengths.none')}</p>}
            </section>
          </div>
        </div>

        <Explainer>{t('wr.how')}</Explainer>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">{t('wr.disclaimer')}</p>
          <Button variant="ghost" size="sm" className="gap-1.5" aria-expanded={showTable} aria-controls="wr-table" onClick={() => setShowTable((v) => !v)}>
            <Table2 className="h-4 w-4" aria-hidden /> {showTable ? t('wr.table.hide') : t('wr.table.show')}
          </Button>
        </div>
        {/* Same values as a table: visible on request, always available to screen readers */}
        <div id="wr-table" className={showTable ? 'overflow-x-auto rounded-lg border' : 'sr-only'}>
          <table className="w-full min-w-[28rem] text-sm">
            <caption className="sr-only">{t('wr.title')}</caption>
            <thead className="bg-muted/50 text-left">
              <tr>
                <th scope="col" className="px-3 py-2">{t('wr.col.skill')}</th>
                <th scope="col" className="px-3 py-2 text-right">{t('wr.you')}</th>
                <th scope="col" className="px-3 py-2 text-right">{t('wr.market')}</th>
                <th scope="col" className="px-3 py-2 text-right">{t('wr.target')}</th>
                <th scope="col" className="px-3 py-2 text-right">{t('wr.col.gap')}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.slug} className="border-t">
                  <th scope="row" className="px-3 py-2 text-left font-medium">{p.label}{!p.tracked && <span className="block text-xs font-normal text-muted-foreground">{t('wr.baseline')}</span>}</th>
                  <td className="px-3 py-2 text-right tabular-nums">{p.you}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{p.market}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{p.target ?? '—'}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{p.gap || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

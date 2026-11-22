'use client';

import type React from 'react';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Compass, Lightbulb, Mic, Table2, TrendingUp, Trophy, X } from 'lucide-react';
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSkillCast } from '@/lib/store';
import { WIND_ROSE_THEMES } from '@/lib/achievements';
import { usePanels } from '@/lib/ui-panels';
import { computeWindRose, type WindRosePoint } from '@/lib/wind-rose';
import { useReducedMotion } from './a11y';
import { Explainer } from './explainer';
import { GraphGuide } from './graph-guide';
import { roleTitle } from './shared';
import { skillName, useSignals, useT } from './shared';

// ─── Wind Rose: the learner's career direction map ─────────────────────────
// Filled area (colour chosen with badges) = you now; violet solid = market
// direction; teal dashed = pathway target. Line style + legend text + table, never colour alone.

const BASE_COLORS = { you: '#2563eb', market: '#7c3aed', target: 'var(--wr-target)' };

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
  const { profile, chosenRole, setDashTab, setView, windRoseTheme, seenTips, dismissTip, roseFocus, focusRose, roseThemeChange, setRoseThemeChange } = useSkillCast();
  const colourName = t(`wr.color.${windRoseTheme}`);
  // "You" colour follows the Wind Rose colour unlocked with badges.
  const COLORS = { ...BASE_COLORS, you: WIND_ROSE_THEMES[windRoseTheme]?.you ?? BASE_COLORS.you };
  const { momentumMap } = useSignals();
  const openVoice = usePanels((s) => s.openVoice);
  const reduceMotion = useReducedMotion();
  const [showTable, setShowTable] = useState(false);
  const [selected, setSelected] = useState<string | null>(roseFocus);
  // Opened from the Harada roadmap for one skill: show that spoke, once.
  useEffect(() => {
    if (!roseFocus) return;
    setSelected(roseFocus);
    focusRose(null);
    const id = window.setTimeout(() => document.getElementById('wind-rose')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
    return () => window.clearTimeout(id);
  }, [roseFocus, focusRose]);
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
          <circle r={9} fill={point.gap >= 20 ? '#b45309' : 'var(--muted)'} />
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
  // Interpretation, from the same deterministic points as the chart.
  const directions = [...rose.points].sort((a, b) => b.market - a.market).slice(0, 3);
  const aligned = rose.points.filter((p) => p.you >= p.market).length;
  const focus = rose.priorities[0];
  const picked = data.find((p) => p.slug === selected) ?? null;
  const marketWord = (m: number) => t(m >= 60 ? 'wr.detail.strong' : m >= 45 ? 'wr.detail.steady' : 'wr.detail.softer');

  return (
    <Card id="wind-rose" className="relative scroll-mt-20 overflow-hidden border-blue-300 shadow-md ring-1 ring-blue-500/10 dark:border-blue-800">
      <div aria-hidden className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-violet-600 to-amber-500" />
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
        {roseThemeChange && (
          <div role="status" className="flex flex-wrap items-center gap-3 rounded-xl border border-teal-500/60 bg-teal-50 px-3 py-2 text-sm text-teal-950 dark:bg-teal-950/40 dark:text-teal-50">
            <span className="flex items-center gap-1.5" aria-hidden>
              <span className="h-4 w-4 rounded-full" style={{ background: WIND_ROSE_THEMES[roseThemeChange.from].you }} />
              <ArrowRight className="h-3.5 w-3.5" />
              <span className="h-4 w-4 rounded-full ring-2 ring-white" style={{ background: WIND_ROSE_THEMES[roseThemeChange.to].you }} />
            </span>
            <p className="min-w-0 flex-1">{t('wr.colour.changed', { from: t(`wr.color.${roseThemeChange.from}`), to: t(`wr.color.${roseThemeChange.to}`) })}</p>
            <button type="button" onClick={() => setRoseThemeChange(null)} className="min-h-11 shrink-0 rounded px-2 text-xs font-semibold underline-offset-2 hover:underline sm:min-h-0">{t('wr.tip.ok')}</button>
          </div>
        )}
        <GraphGuide id="wr-guide" items={[
          { key: 'measures', text: t('wr.g.measures') },
          { key: 'colours', text: t('wr.g.colours', { color: colourName }), swatch: [{ color: COLORS.you, style: 'fill' }, { color: COLORS.market, style: 'solid' }, ...(hasTarget ? [{ color: COLORS.target, style: 'dashed' as const }] : [])] },
          { key: 'axes', text: t(narrow ? 'wr.g.axes.narrow' : 'wr.g.axes') },
          { key: 'you', text: t('wr.g.you') },
          { key: 'target', text: hasTarget && chosenRole ? t('wr.g.target', { role: roleTitle(t, chosenRole) }) : t('wr.g.target.none') },
          { key: 'todo', text: focus ? t('wr.g.todo', { skill: skillName(t, focus.slug) }) : t('wr.g.todo.none') },
        ]} />
        {!seenTips.includes('rose-tip') && (
          <div role="note" className="flex items-start gap-2 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-sm text-blue-950 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-100">
            <span aria-hidden className="mt-0.5 text-lg leading-none">👆</span>
            <p className="flex-1">{t('wr.tip')}</p>
            <button type="button" onClick={() => { dismissTip('rose-tip'); dismissTip('rose-read'); }} className="shrink-0 rounded px-2 py-0.5 text-xs font-semibold underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">{t('wr.tip.ok')}</button>
          </div>
        )}
        <div className={`grid gap-4 ${compact ? '' : 'lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]'}`}>
          <div className="min-w-0">
            <div
              ref={ref}
              key={roseThemeChange ? `pop-${roseThemeChange.to}` : 'rose'}
              style={{ '--wr-pop': COLORS.you } as React.CSSProperties}
              className={`h-[21rem] min-w-0 sm:h-[26rem] ${roseThemeChange ? 'wr-colour-pop' : ''}`}
              role="img"
              aria-label={t('wr.aria', { n: data.length })}
            >
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={data} outerRadius={narrow ? '74%' : '68%'} margin={{ top: 16, right: 24, bottom: 16, left: 24 }}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="label" tick={Tick as never} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name={t('wr.market')} dataKey="market" stroke={COLORS.market} strokeWidth={2} fill={COLORS.market} fillOpacity={0.08} isAnimationActive={!reduceMotion} />
                  {hasTarget && <Radar name={t('wr.target')} dataKey="targetValue" stroke={COLORS.target} strokeWidth={2.5} strokeDasharray="7 4" dot={{ r: 3, fill: COLORS.target, strokeWidth: 0 }} fill="none" isAnimationActive={!reduceMotion} />}
                  <Radar name={t('wr.you')} dataKey="you" stroke={COLORS.you} strokeWidth={2} fill={COLORS.you} fillOpacity={0.35} isAnimationActive={!reduceMotion} />
                  <Tooltip content={TipContent as never} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            {/* Legend: colour + line style + words */}
            <ul className="mt-2 grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-3">
              <li className="flex items-start gap-2"><span aria-hidden className="mt-0.5 h-3 w-5 shrink-0 rounded-sm border-2" style={{ borderColor: COLORS.you, background: `${COLORS.you}59` }} />{t('wr.legend.you2', { color: colourName })}</li>
              <li className="flex items-start gap-2"><span aria-hidden className="mt-1.5 h-0 w-5 shrink-0 border-t-2" style={{ borderColor: COLORS.market }} />{t('wr.legend.market')}</li>
              {hasTarget && <li className="flex items-start gap-2"><span aria-hidden className="mt-1.5 h-0 w-5 shrink-0 border-t-2 border-dashed" style={{ borderColor: COLORS.target }} />{t('wr.legend.target2')}</li>}
            </ul>
            <p className="mt-3 text-xs font-medium text-muted-foreground">{t('wr.select.hint')}</p>
            <ol className="mt-1.5 flex flex-wrap gap-1.5 text-xs">
              {data.map((p) => (
                <li key={p.slug}>
                  <button type="button" aria-pressed={selected === p.slug} onClick={() => { setSelected(selected === p.slug ? null : p.slug); dismissTip('rose-read'); dismissTip('rose-tip'); }}
                    className={`flex min-h-8 items-center gap-1.5 rounded-full border px-2 py-1 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${selected === p.slug ? 'border-blue-600 bg-blue-600 text-white' : 'hover:bg-muted'}`}>
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${selected === p.slug ? 'bg-white/20' : p.gap >= 20 ? 'bg-amber-600 text-white' : 'bg-muted'}`}>{p.n}</span>
                    <span className="min-w-0">{p.label}</span>
                  </button>
                </li>
              ))}
            </ol>
            {picked && (
              <section aria-live="polite" aria-label={t('wr.detail.title')} className="mt-3 rounded-xl border border-blue-300 bg-blue-50/60 p-3 dark:border-blue-800 dark:bg-blue-950/30">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold leading-snug">{picked.label}</h3>
                  <button type="button" onClick={() => setSelected(null)} aria-label={t('wr.detail.dismiss')} className="rounded p-1 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                </div>
                <dl className="mt-2 grid grid-cols-3 gap-2 text-center">
                  {([['wr.you', picked.you, COLORS.you], ['wr.market', picked.market, COLORS.market], ['wr.target', picked.target, COLORS.target]] as const).map(([key, value, color]) => (
                    <div key={key} className="rounded-lg bg-background p-2">
                      <dt className="text-[11px] leading-tight text-muted-foreground">{t(key)}</dt>
                      <dd className="text-xl font-bold tabular-nums" style={{ color }}>{value ?? '—'}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-2 text-xs text-muted-foreground">{marketWord(picked.market)}{!picked.tracked && ` · ${t('wr.baseline')}`}</p>
                <p className="mt-1 text-sm font-medium">
                  {picked.gap >= 20 ? t('wr.detail.gap', { n: picked.gap }) : picked.you >= 60 ? t('wr.detail.strength') : t('wr.detail.close')}
                </p>
              </section>
            )}
          </div>

          {/* What to do with it */}
          <div className="space-y-3">
            <section aria-labelledby="wr-meaning" className="rounded-xl border border-blue-200 bg-blue-50/50 p-3 dark:border-blue-900 dark:bg-blue-950/20">
              <h3 id="wr-meaning" className="flex items-center gap-2 text-sm font-semibold"><Lightbulb className="h-4 w-4 shrink-0 text-blue-700 dark:text-blue-300" aria-hidden />{t('wr.q.meaning')}</h3>
              <p className="mt-1.5 text-sm">{t('wr.meaning.aligned', { n: aligned, total: rose.points.length })}</p>
              {focus && <p className="mt-1 text-sm font-semibold">{t('wr.meaning.focus', { skill: skillName(t, focus.slug), n: focus.gap })}</p>}
            </section>
            <section aria-labelledby="wr-dir" className="rounded-xl border p-3">
              <h3 id="wr-dir" className="flex items-center gap-2 text-sm font-semibold"><Compass className="h-4 w-4 shrink-0 text-violet-600 dark:text-violet-400" aria-hidden />{t('wr.q.directions')}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">{t('wr.q.directions.d')}</p>
              <ol className="mt-2 space-y-1.5">
                {directions.map((p) => (
                  <li key={p.slug} className="flex items-center justify-between gap-2 text-sm">
                    <span className="min-w-0 leading-snug">{skillName(t, p.slug)}</span>
                    <span className="shrink-0 rounded-full bg-violet-600/10 px-2 py-0.5 text-xs font-semibold tabular-nums text-violet-800 dark:text-violet-300">{p.market}/100</span>
                  </li>
                ))}
              </ol>
            </section>
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

        <div className="grid gap-2 md:grid-cols-2">
          <Explainer>{t('wr.how')}</Explainer>
          <Explainer label={t('wr.q.why')}>{t('wr.why.body')}</Explainer>
        </div>

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

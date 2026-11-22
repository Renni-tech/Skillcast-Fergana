'use client';

import { ChevronDown, HelpCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { useT } from './shared';

// ─── "How to read this chart", in plain words ─────────────────────────────
// Placed at the top of important charts: what is measured, what the colours
// mean, what the axes or spokes are, your level, the target and what to do.
// Open by default on wide screens, one tap away on phones.

export interface GuideItem {
  key: 'measures' | 'colours' | 'axes' | 'you' | 'target' | 'todo';
  text: ReactNode;
  /** Colour sample shown before the text (with its line style). */
  swatch?: { color: string; style: 'fill' | 'solid' | 'dashed' }[];
}

export function GraphGuide({ items, id }: { items: GuideItem[]; id: string }) {
  const t = useT();
  return (
    <details id={id} open className="group rounded-xl border bg-muted/30 text-sm [&:not([open])]:bg-transparent">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 px-3 py-2 font-semibold [&::-webkit-details-marker]:hidden">
        <HelpCircle className="h-4 w-4 shrink-0 text-teal-700 dark:text-teal-400" aria-hidden />
        <span className="flex-1">{t('gg.title')}</span>
        <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <dl className="grid gap-x-4 gap-y-2 px-3 pb-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.key} className="min-w-0">
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t(`gg.${item.key}`)}</dt>
            <dd className="mt-0.5 flex items-start gap-2 leading-snug">
              {item.swatch && (
                <span className="mt-1 flex shrink-0 flex-col gap-1" aria-hidden>
                  {item.swatch.map((s, i) => (s.style === 'fill'
                    ? <span key={i} className="h-3 w-5 rounded-sm border-2" style={{ borderColor: s.color, background: `${s.color}59` }} />
                    : <span key={i} className={`mt-1 h-0 w-5 border-t-2 ${s.style === 'dashed' ? 'border-dashed' : ''}`} style={{ borderColor: s.color }} />))}
                </span>
              )}
              <span className="min-w-0">{item.text}</span>
            </dd>
          </div>
        ))}
      </dl>
    </details>
  );
}

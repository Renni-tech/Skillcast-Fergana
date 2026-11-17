'use client';

import type { ReactNode } from 'react';
import { ChevronDown, Info } from 'lucide-react';
import { useT } from './shared';

/**
 * Progressive disclosure: a one-line "What this means" toggle that reveals a
 * short explanation and, optionally, the next action. Native <details>, so it
 * works with keyboard and screen readers without extra scripting.
 */
export function Explainer({ children, next, label, className = '' }: {
  children: ReactNode;
  next?: ReactNode;
  label?: string;
  className?: string;
}) {
  const t = useT();
  return (
    <details className={`group rounded-lg border border-dashed border-border bg-muted/30 text-sm ${className}`}>
      <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-lg px-3 py-2 font-medium text-foreground marker:hidden [&::-webkit-details-marker]:hidden">
        <Info className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden />
        <span className="min-w-0 flex-1">{label ?? t('guide.what')}</span>
        <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <div className="space-y-2 px-3 pb-3 text-muted-foreground">
        <div>{children}</div>
        {next && (
          <p>
            <span className="font-semibold text-foreground">{t('guide.next')}: </span>
            {next}
          </p>
        )}
      </div>
    </details>
  );
}

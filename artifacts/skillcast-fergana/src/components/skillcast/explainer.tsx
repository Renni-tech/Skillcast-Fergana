'use client';

import type { ReactNode } from 'react';
import { ArrowRight, ChevronDown, Compass, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useT } from './shared';

/**
 * Progressive disclosure: a one-line "What this means" toggle that reveals a
 * short explanation and, optionally, the next action. Native <details>, so it
 * works with keyboard and screen readers without extra scripting.
 */
export function Explainer({ children, next, label, className = '', id }: {
  children: ReactNode;
  next?: ReactNode;
  label?: string;
  className?: string;
  id?: string;
}) {
  const t = useT();
  return (
    // Each <details> owns its open state; the click never reaches parent handlers.
    <details id={id} className={`group rounded-lg border border-dashed border-border bg-muted/30 text-sm ${className}`}>
      <summary onClick={(e) => e.stopPropagation()} className="flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-lg px-3 py-2 font-medium text-foreground marker:hidden [&::-webkit-details-marker]:hidden">
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

/**
 * Empty state for views that need a chosen pathway. Names the real tab (its
 * label in the current language) and offers a button straight to it.
 */
export function ChoosePathwayEmpty({ onGo }: { onGo: () => void }) {
  const t = useT();
  const tab = t('tab.matches');
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-muted/20 px-4 py-10 text-center">
      <Compass className="h-8 w-8 text-teal-600 dark:text-teal-400" aria-hidden />
      <h2 className="text-base font-semibold">{t('empty.choosePath.title')}</h2>
      <p className="max-w-md text-sm text-muted-foreground">{t('empty.choosePath', { tab })}</p>
      <Button onClick={onGo} className="h-auto min-h-10 whitespace-normal bg-teal-700 text-white hover:bg-teal-800 dark:bg-teal-700 dark:hover:bg-teal-800">
        {t('empty.go', { tab })} <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
      </Button>
    </div>
  );
}

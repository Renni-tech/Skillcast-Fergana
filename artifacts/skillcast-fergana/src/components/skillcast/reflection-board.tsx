'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Pin, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { formatDate } from '@/lib/dates';
import { useSkillCast } from '@/lib/store';
import { useReducedMotion } from './a11y';
import { useT } from './shared';

// ─── Weekly reflection board ───────────────────────────────────────────────
// The textarea holds a draft; "Pin this note" turns it into a sticky note on
// the board (newest top-left). With no saved notes, an example note sits in
// the first slot; it reacts while the learner types, then fades and shrinks
// away as their first real note slides into its place with a bouncing pin.
// Notes are saved in this browser only (the store's localStorage).

const TILTS = ['-1.5deg', '1.2deg', '-0.8deg', '1.8deg', '-1.2deg', '0.6deg'];
const NOTE_COLOURS = [
  'bg-amber-100 dark:bg-[#2a2618]', 'bg-teal-50 dark:bg-[#132a2a]', 'bg-rose-50 dark:bg-[#2a1820]',
  'bg-sky-50 dark:bg-[#15233a]', 'bg-lime-50 dark:bg-[#1e2a16]',
];

/** Week number counted from the first saved note. */
export function weekOf(createdAt: string, firstAt: string): number {
  const days = (new Date(createdAt).getTime() - new Date(firstAt).getTime()) / 86_400_000;
  return Math.max(1, Math.floor(days / 7) + 1);
}

export function ReflectionBoard() {
  const t = useT();
  const reduce = useReducedMotion();
  const { profile, setProfile, reflections, addReflection, deleteReflection, lang } = useSkillCast();
  const draft = profile.weeklyReflection ?? '';
  const inputId = useId();
  const [leaving, setLeaving] = useState(false);
  const [fresh, setFresh] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const showExample = reflections.length === 0 || leaving;
  const typing = draft.trim().length > 0;
  const firstAt = reflections.length ? reflections[reflections.length - 1].createdAt : new Date().toISOString();

  const save = () => {
    const text = draft.trim();
    if (!text) return;
    const first = reflections.length === 0;
    const commit = () => {
      const id = addReflection(text);
      setProfile({ weeklyReflection: '' });
      setFresh(id);
      setLeaving(false);
      timer.current = window.setTimeout(() => setFresh(null), 1200);
    };
    if (first && !reduce) {
      setLeaving(true);
      timer.current = window.setTimeout(commit, 320);
    } else commit();
  };

  return (
    <Card className="border-blue-100 bg-white dark:border-slate-700" id="weekly-reflection">
      <CardHeader>
        <CardTitle className="text-base text-slate-900">{t('Weekly reflection')}</CardTitle>
        <CardDescription>{t('Save a private note in this browser about what you learned and your next action.')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); save(); }}>
          <label htmlFor={inputId} className="sr-only">{t('refl.input')}</label>
          <Textarea id={inputId} value={draft} maxLength={1000} onChange={(event) => setProfile({ weeklyReflection: event.target.value })}
            onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); save(); } }}
            placeholder={t('What moved forward this week? What will you try next?')} className="min-h-28 border-blue-100 text-base dark:border-slate-700 sm:text-sm" />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-slate-500">{draft.length}/1000 · {t('refl.draft')}</p>
            <Button type="submit" disabled={!typing || leaving} className="min-h-11 gap-1.5 bg-amber-500 font-semibold text-slate-950 hover:bg-amber-400 sm:min-h-9">
              <Pin className="h-4 w-4" aria-hidden />{t('refl.save')}
            </Button>
          </div>
        </form>

        <ul className="grid grid-cols-1 gap-4 p-1 min-[480px]:grid-cols-2 lg:grid-cols-3" aria-label={t('refl.board')} aria-live="polite">
          {showExample && (
            <li data-example-note aria-label={t('refl.example.label')}
              className={`refl-note relative min-h-36 rounded-lg border-2 border-dashed border-[#FCD34D] bg-[#FFFBEB] p-4 pt-6 text-sm text-slate-800 opacity-85 shadow-sm dark:border-[rgba(245,158,11,0.35)] dark:bg-[#1E2436] dark:text-slate-200 ${leaving ? 'refl-leave' : typing ? 'refl-ready' : ''}`}
              style={{ '--tilt': '-2deg' } as React.CSSProperties}>
              <span className="refl-pin absolute left-1/2 top-[-10px] -translate-x-1/2" aria-hidden><PinHead muted /></span>
              <span className="mb-2 inline-block rounded-full bg-amber-200/80 px-2 py-0.5 text-[11px] font-bold text-amber-950 dark:bg-amber-500/20 dark:text-amber-200">{t('refl.example.pill')}</span>
              <p className="leading-relaxed">{t('refl.example.text')}</p>
            </li>
          )}
          {!leaving && reflections.map((note, i) => (
            <li key={note.id}
              className={`refl-note group relative min-h-36 rounded-lg p-4 pt-6 text-sm text-slate-800 shadow-md dark:text-slate-100 ${NOTE_COLOURS[i % NOTE_COLOURS.length]} ${fresh === note.id ? 'refl-enter' : ''}`}
              style={{ '--tilt': TILTS[i % TILTS.length] } as React.CSSProperties}>
              <span className={`absolute left-1/2 top-[-10px] -translate-x-1/2 ${fresh === note.id ? 'refl-pin-drop' : ''}`} aria-hidden><PinHead /></span>
              <p className="mb-2 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                <span className="rounded-full bg-white/70 px-2 py-0.5 text-slate-800 dark:bg-white/10 dark:text-slate-100">{t('refl.week', { n: weekOf(note.createdAt, firstAt) })}</span>
                {formatDate(lang, note.createdAt)}
              </p>
              <p className="whitespace-pre-wrap break-words leading-relaxed">{note.text}</p>
              <Button variant="ghost" size="icon" aria-label={t('refl.delete', { date: formatDate(lang, note.createdAt) })}
                onClick={() => { if (window.confirm(t('refl.delete.confirm'))) deleteReflection(note.id); }}
                className="absolute bottom-1 right-1 h-11 w-11 text-slate-500 opacity-70 hover:opacity-100 sm:h-8 sm:w-8">
                <Trash2 className="h-4 w-4" aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function PinHead({ muted = false }: { muted?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 drop-shadow" aria-hidden>
      <circle cx="12" cy="9" r="6.5" fill={muted ? '#FCD34D' : '#DC2626'} stroke={muted ? '#B45309' : '#7F1D1D'} strokeWidth="1.2" />
      <circle cx="10" cy="7" r="2" fill="#fff" opacity="0.6" />
      <path d="M12 15.5 V22" stroke="#475569" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

'use client';

// Searchable sector / occupation pickers (WAI-ARIA combobox + listbox).
// Mouse, touch and keyboard: ↑/↓ move, Enter selects, Esc closes, Home/End jump.
import { useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import {
  OCCUPATION_MAP, OTHER_OCCUPATION, SECTORS, SECTOR_MAP, searchOccupations, searchSectors,
  type Occupation, type Sector, type SectorId,
} from '@/data/occupations';
import { useSkillCast } from '@/lib/store';
import { useT } from './shared';

interface Option { id: string; label: string; hint?: string; group: string; related?: boolean }

function Combobox({ id, label, placeholder, value, valueLabel, options, query, setQuery, onSelect, onClear, emptyText }: {
  id: string; label: string; placeholder: string; value: string; valueLabel: string;
  options: Option[]; query: string; setQuery: (q: string) => void;
  onSelect: (o: Option) => void; onClear: () => void; emptyText: string;
}) {
  const t = useT();
  const listId = `${id}-list`;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const shown = open ? options : [];
  const pick = (o: Option) => { onSelect(o); setOpen(false); setQuery(''); };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive((a) => Math.min(options.length - 1, a + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
    else if (e.key === 'Home' && open) { e.preventDefault(); setActive(0); }
    else if (e.key === 'End' && open) { e.preventDefault(); setActive(options.length - 1); }
    else if (e.key === 'Enter' && open && options[active]) { e.preventDefault(); pick(options[active]); }
    else if (e.key === 'Escape') { setOpen(false); }
  };
  let lastGroup = '';
  return (
    <div className="relative">
      <label htmlFor={id} className="text-sm font-medium text-slate-800 dark:text-slate-200">{label}</label>
      <div className="relative mt-1.5">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
        <input
          ref={input} id={id} role="combobox" aria-expanded={open} aria-controls={listId} aria-autocomplete="list"
          aria-activedescendant={open && options[active] ? `${id}-opt-${active}` : undefined}
          value={open ? query : valueLabel} placeholder={placeholder}
          onFocus={() => { setOpen(true); setActive(0); }}
          onBlur={() => window.setTimeout(() => setOpen(false), 150)}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setActive(0); }}
          onKeyDown={onKey}
          className="h-11 w-full rounded-md border border-blue-100 bg-white pl-9 pr-16 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
        <span className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-0.5">
          {value && (
            <button type="button" aria-label={t('occ.clear')} onClick={() => { onClear(); input.current?.focus(); }}
              className="rounded p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-4 w-4" aria-hidden /></button>
          )}
          <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden />
        </span>
      </div>
      <ul id={listId} role="listbox" aria-label={label}
        className={`absolute z-40 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg ${open ? '' : 'hidden'}`}>
        {shown.length === 0 && open && <li className="px-3 py-2 text-sm text-muted-foreground" role="presentation">{emptyText}</li>}
        {shown.map((o, i) => {
          const header = o.group !== lastGroup ? o.group : null;
          lastGroup = o.group;
          return [
            header && <li key={`g-${o.group}-${i}`} role="presentation" className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{header}</li>,
            <li key={o.id} id={`${id}-opt-${i}`} role="option" aria-selected={o.id === value}
              onMouseDown={(e) => e.preventDefault()} onClick={() => pick(o)} onMouseEnter={() => setActive(i)}
              className={`flex cursor-pointer items-start gap-2 rounded-md px-2.5 py-2 text-sm ${i === active ? 'bg-blue-600 text-white' : ''}`}>
              <span className="min-w-0 flex-1">
                <span className="block font-medium leading-snug">{o.label}</span>
                {o.hint && <span className={`block text-xs ${i === active ? 'text-blue-100' : 'text-muted-foreground'}`}>{o.hint}</span>}
              </span>
              {o.id === value && <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />}
            </li>,
          ];
        })}
      </ul>
    </div>
  );
}

/** Field / industry (sector). Saves fieldId plus the display text in fieldOfWork. */
export function SectorPicker({ value, onChange }: { value: string; onChange: (id: string, label: string) => void }) {
  const t = useT();
  const lang = useSkillCast((s) => s.lang);
  const id = useId();
  const [query, setQuery] = useState('');
  const options = useMemo<Option[]>(() => (query ? searchSectors(query, lang).map((h) => h.item) : SECTORS)
    .map((sec: Sector) => ({ id: sec.id, label: sec.name[lang], group: t('occ.sectors') })), [query, lang, t]);
  const sec = SECTOR_MAP[value as SectorId];
  return (
    <Combobox id={`sector${id}`} label={t('occ.field.label')} placeholder={t('occ.field.ph')} value={value}
      valueLabel={sec ? sec.name[lang] : ''} options={options} query={query} setQuery={setQuery}
      onSelect={(o) => onChange(o.id, o.label)} onClear={() => onChange('', '')} emptyText={t('occ.none')} />
  );
}

/** Profession (current or target). 'other' keeps whatever the user typed. */
export function OccupationPicker({ label, value, customText, sector, allowOther = true, onChange }: {
  label: string; value: string; customText?: string; sector?: string; allowOther?: boolean;
  onChange: (id: string, label: string) => void;
}) {
  const t = useT();
  const lang = useSkillCast((s) => s.lang);
  const id = useId();
  const [query, setQuery] = useState('');
  const options = useMemo<Option[]>(() => {
    const preferred = (SECTOR_MAP[sector as SectorId] ? sector : null) as SectorId | null;
    const hits = searchOccupations(query, lang, query ? null : preferred, 60);
    const toOption = (occ: Occupation, related: boolean): Option => ({
      id: occ.id, label: occ.name[lang], related,
      hint: [SECTOR_MAP[occ.sector].name[lang], occ.isco ? `ISCO ${occ.isco}` : ''].filter(Boolean).join(' · '),
      group: related ? t('occ.related') : query ? t('occ.matches') : SECTOR_MAP[occ.sector].name[lang],
    });
    const list = hits.map((h) => toOption(h.item, h.score === 10));
    if (!query && !preferred) list.sort((a, b) => a.group.localeCompare(b.group, lang));
    if (allowOther) list.push({ id: OTHER_OCCUPATION, label: query ? t('occ.other.use', { text: query }) : t('occ.other'), group: t('occ.notListed') });
    return list;
  }, [query, lang, sector, allowOther, t]);
  const occ = OCCUPATION_MAP[value];
  const valueLabel = occ ? occ.name[lang] : value === OTHER_OCCUPATION ? (customText || t('occ.other')) : '';
  return (
    <Combobox id={`occ${id}`} label={label} placeholder={t('occ.ph')} value={value} valueLabel={valueLabel}
      options={options} query={query} setQuery={setQuery} emptyText={t('occ.none')}
      onSelect={(o) => onChange(o.id, o.id === OTHER_OCCUPATION ? (query || customText || '') : o.label)}
      onClear={() => onChange('', '')} />
  );
}

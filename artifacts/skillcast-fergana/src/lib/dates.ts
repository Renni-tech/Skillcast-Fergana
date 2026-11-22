// Dates in the learner's language. Browsers format Uzbek poorly ("2026 M11 20"),
// so Uzbek (Latin and Cyrillic) dates are built by hand: "20-noyabr, 2026".
import type { Lang } from './types';

const UZ_MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'];
const UZ_CYRL_MONTHS = ['январ', 'феврал', 'март', 'апрел', 'май', 'июн', 'июл', 'август', 'сентябр', 'октябр', 'ноябр', 'декабр'];

export function formatDate(lang: Lang | string, input: Date | string, opts: { time?: boolean; short?: boolean } = {}): string {
  const d = typeof input === 'string' ? new Date(input.length === 10 ? `${input}T12:00:00` : input) : input;
  if (Number.isNaN(d.getTime())) return String(input);
  const pad = (n: number) => String(n).padStart(2, '0');
  const time = opts.time ? `, ${pad(d.getHours())}:${pad(d.getMinutes())}` : '';
  if (lang === 'uz' || lang === 'uz-cyrl') {
    const months = lang === 'uz' ? UZ_MONTHS : UZ_CYRL_MONTHS;
    const m = opts.short ? months[d.getMonth()].slice(0, 3) : months[d.getMonth()];
    return `${d.getDate()}-${m}, ${d.getFullYear()}${time}`;
  }
  const locale = lang === 'ru' ? 'ru-RU' : 'en-GB';
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: opts.short ? 'short' : 'long', year: 'numeric', ...(opts.time ? { hour: '2-digit', minute: '2-digit' } : {}) }).format(d);
}

/** Drop-in for code that expects an Intl.DateTimeFormat-like object. */
export const dateFormatter = (lang: Lang | string, opts: { time?: boolean; short?: boolean } = {}) => ({ format: (d: Date) => formatDate(lang, d, opts) });

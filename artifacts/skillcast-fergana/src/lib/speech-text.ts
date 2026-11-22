// ─── Text cleaned for speaking ─────────────────────────────────────────────
// Voices should never read "asterisk asterisk", a raw URL or an emoji name.
// Percentages and common acronyms are spoken as words in the active language.
// Uzbek in Cyrillic script is converted to Latin first, because the Uzbek
// neural voices read Latin-script Uzbek.

import { uzCyrillicToLatin } from './voice-intents';

export type SpeechLang = 'uz' | 'uz-cyrl' | 'ru' | 'en';

const PERCENT: Record<'uz' | 'ru' | 'en', (n: string) => string> = {
  en: (n) => `${n} percent`,
  uz: (n) => `${n} foiz`,
  ru: (n) => `${n} ${percentRu(n)}`,
};

function percentRu(n: string): string {
  const whole = Math.floor(Math.abs(Number(n.replace(',', '.'))));
  if (n.includes('.') || n.includes(',')) return 'процента';
  const mod10 = whole % 10; const mod100 = whole % 100;
  if (mod10 === 1 && mod100 !== 11) return 'процент';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'процента';
  return 'процентов';
}

/** Acronyms read as words; anything not listed is left for the voice. */
const ACRONYMS: Record<'uz' | 'ru' | 'en', Record<string, string>> = {
  en: { AI: 'A.I.', SDG: 'Sustainable Development Goals', SDGs: 'Sustainable Development Goals', POC: 'proof of concept', IT: 'I.T.', CV: 'C.V.', UZS: 'Uzbek soums', ILO: 'I.L.O.', UNDP: 'U.N.D.P.', FAO: 'F.A.O.', CSP: 'C.S.P.' },
  uz: { AI: 'sun’iy intellekt', SDG: 'Barqaror rivojlanish maqsadlari', BRM: 'Barqaror rivojlanish maqsadlari', POC: 'sinov loyihasi', IT: 'ay-ti', CV: 'rezyume', UZS: 'so‘m', BMTTD: 'BMT Taraqqiyot Dasturi' },
  ru: { AI: 'искусственный интеллект', 'ИИ': 'искусственный интеллект', SDG: 'Цели устойчивого развития', 'ЦУР': 'Цели устойчивого развития', POC: 'пилотный проект', IT: 'ай-ти', CV: 'резюме', UZS: 'сумов', 'ПРООН': 'Программа развития ООН' },
};

const EMOJI = /[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u{FE0F}\u{200D}\u{20E3}]/gu;

export function normalizeForSpeech(input: string, lang: SpeechLang): string {
  const base: 'uz' | 'ru' | 'en' = lang === 'uz-cyrl' ? 'uz' : lang;
  let s = lang === 'uz-cyrl' || lang === 'uz' ? uzCyrillicToLatin(input) : input;
  s = s
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/https?:\/\/\S+|www\.\S+/gi, ' ')
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, ' ')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s*[-*+•]\s+/gm, '')
    .replace(/(\*\*|__|\*|_|~~|`)(.+?)\1/g, '$2')
    .replace(/[*_`#>|~]/g, ' ')
    .replace(EMOJI, ' ')
    .replace(/→|->|⇒/g, base === 'en' ? ' to ' : base === 'uz' ? ' dan ' : ' к ')
    .replace(/(\d)\s?[–—-]\s?(\d)/g, base === 'en' ? '$1 to $2' : base === 'uz' ? '$1 dan $2 gacha' : '$1–$2')
    .replace(/(\d+(?:[.,]\d+)?)\s?%/g, (_m, n: string) => PERCENT[base](n))
    .replace(/(\d+)\s?\/\s?(\d+)/g, base === 'en' ? '$1 of $2' : base === 'uz' ? '$2 dan $1' : '$1 из $2');
  for (const [abbr, words] of Object.entries(ACRONYMS[base])) {
    s = s.replace(new RegExp(`(^|[^\\p{L}])${abbr}(?=$|[^\\p{L}])`, 'gu'), `$1${words}`);
  }
  return s.replace(/\s+([,.;:!?])/g, '$1').replace(/\s{2,}/g, ' ').trim();
}

/** Splits long text into chunks the speech service accepts, at sentence ends. */
export function chunkForSpeech(text: string, max = 900): string[] {
  if (text.length <= max) return text ? [text] : [];
  const out: string[] = [];
  let cur = '';
  for (const sentence of text.split(/(?<=[.!?…])\s+/)) {
    if ((cur + ' ' + sentence).trim().length > max && cur) { out.push(cur.trim()); cur = ''; }
    cur += ` ${sentence}`;
    while (cur.length > max) { out.push(cur.slice(0, max).trim()); cur = cur.slice(max); }
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

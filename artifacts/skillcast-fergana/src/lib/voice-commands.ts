// ─── Hands-free commands ───────────────────────────────────────────────────
// Turns a spoken or typed sentence (English, Uzbek Latin/Cyrillic, Russian)
// into a UI action: switch tab, theme, accessibility settings, filter the
// course catalogue, save a weekly reflection by dictation, summarise the
// screen, or stop speaking. Returns null when the sentence is a question,
// so the assistant answers it instead.

import { uzCyrillicToLatin } from './voice-intents';

export type DashTab = 'overview' | 'matches' | 'radar' | 'pathway' | 'harada' | 'progress' | 'sdg' | 'demand';
export type CatalogViewCmd = 'all' | 'ai-digital' | 'practical' | 'free' | 'state' | 'upcoming';

export type Command =
  | { type: 'tab'; tab: DashTab }
  | { type: 'theme'; value: 'dark' | 'light' }
  | { type: 'a11y'; setting: 'highContrast' | 'reduceMotion' | 'readingSpacing' | 'largeText'; value: boolean }
  | { type: 'filter'; query: string; view: CatalogViewCmd; topic?: 'ai' }
  | { type: 'reflect'; text: string }
  | { type: 'summarize' }
  | { type: 'stop' };

// Only Uzbek Cyrillic (with ў қ ғ ҳ) is converted; Russian stays Cyrillic.
const toLatinIfUzbek = (s: string) => (/[ўқғҳ]/i.test(s) ? uzCyrillicToLatin(s) : s);
const norm = (s: string) => toLatinIfUzbek(s).toLowerCase().replace(/[‘’ʻʼ`´]/g, "'").replace(/\s+/g, ' ').trim();
// JavaScript's \b ignores Cyrillic letters; use a Unicode-aware boundary instead.
const UB = '(?:(?<!\\p{L})(?=\\p{L})|(?<=\\p{L})(?!\\p{L}))';
const U = (r: RegExp) => new RegExp(r.source.replace(/\\b/g, UB), 'u');
const any = (s: string, re: RegExp) => U(re).test(s);

const OFF = /\b(off|disable|turn off|stop|o'chir|o'chiring|o'chirish|выключ|отключ|убери)/;

const TAB_WORDS: Array<[DashTab, RegExp]> = [
  ['harada', /harada|хара/],
  ['sdg', /\bsdg|sustainable|barqaror|\bbrm\b|устойчив|\bцур\b/],
  ['demand', /demand|talab statistik|talab\b|спрос|востребован/],
  ['radar', /radar|wind rose|shamol gul|роз[аеуы] ветров|радар/],
  ['progress', /progress|yutuq|прогресс|успех/],
  ['pathway', /what to learn|nimani o'rgan|что изучать|where to learn|qayerda o'rgan|где учиться/],
  ['matches', /pathways?|career|kasb yo'l|yo'nalish|карьер|пут[иь]/],
  ['overview', /overview|umumiy|asosiy|обзор|главн/],
];
const OPEN = /\b(open|go to|show|switch to|take me|och|ochish|ochib|o't|ko'rsat|открой|открыть|перейди|покажи|включи|отобрази)\b/;

const VIEW_WORDS: Array<[CatalogViewCmd, RegExp]> = [
  ['upcoming', /upcoming|future programmes|kelgusi|kutilayotgan|предстоящ|будущ/],
  ['state', /state[- ]funded|government|davlat|государств/],
  ['free', /\bfree\b|bepul|бесплатн/],
  ['ai-digital', /\bai\b|artificial|digital|sun'iy|raqamli|\bии\b|искусствен|цифров/],
  ['practical', /practical|trade|crafts?|amaliy|hunar|ремесл|практич|рабоч/],
];
const COURSE = /\b(courses?|resources?|programmes?|programs?|classes|kurs|kurslar|kurslarini|kurslari|dastur|dasturlar|курс|курсы|курсов|программ)/;
const STOP_WORDS = new Set(['show', 'me', 'find', 'list', 'the', 'all', 'courses', 'course', 'resources', 'programs', 'programmes', 'for', 'in', 'on', 'about', 'please', 'some',
  'free', 'ai', 'state', 'funded', 'upcoming', 'practical', 'digital', 'and', 'of', 'a',
  "ko'rsat", "ko'rsating", 'kurslarini', 'kurslar', 'kurs', 'bepul', 'davlat', 'top', 'toping', 'menga', 'uchun', 'bo\'yicha', 'kurslari', 'dasturlar', 'amaliy',
  'покажи', 'найди', 'курсы', 'курсов', 'курс', 'по', 'бесплатные', 'бесплатно', 'мне', 'для', 'все', 'практические', 'программы']);

export function parseCommand(input: string): Command | null {
  const raw = input.trim();
  const s = norm(raw);
  if (!s) return null;

  // Dictated reflection: "save reflection: …", "eslatma: …", "заметка: …"
  const reflect = /^(?:save (?:a |my )?(?:weekly )?(?:reflection|note)|new (?:reflection|note)|reflection|eslatma(?:ni saqla)?|mulohaza(?:ni saqla)?|haftalik mulohaza|сохрани (?:заметку|рефлексию)|заметка|рефлексия)\s*[:,—-]?\s+(.{3,})$/i.exec(toLatinIfUzbek(raw));
  if (reflect) return { type: 'reflect', text: reflect[1].trim() };

  if (s.split(' ').length <= 3 && any(s, /^(stop|be quiet|silence|jim|to'xta|bas|стоп|хватит|замолчи|тихо)\b/)) return { type: 'stop' };

  if (any(s, /what('s| is) on (this |the )?screen|summari[sz]e|read (this|the) (screen|page)|ekranda nima|xulosa qil|qisqacha ayt|что на экране|кратко|перескажи|озвучь экран/)) return { type: 'summarize' };

  if (any(s, /dark (mode|theme)|night mode|tungi|qorong'i|тёмн|темн/)) return { type: 'theme', value: 'dark' };
  if (any(s, /light (mode|theme)|day mode|kunduzgi|yorug'|светл|дневн/)) return { type: 'theme', value: 'light' };

  const off = any(s, OFF);
  if (any(s, /high contrast|contrast|kontrast|контраст/)) return { type: 'a11y', setting: 'highContrast', value: !off };
  if (any(s, /(large|larger|bigger|big) (font|text|letters)|katta (shrift|harf|matn)|yirik|крупн|увелич\S* шрифт|больш\S* шрифт/)) return { type: 'a11y', setting: 'largeText', value: !off };
  if (any(s, /dyslexi|spacing|disleksiya|oraliq|дислекс|интервал/)) return { type: 'a11y', setting: 'readingSpacing', value: !off };
  if (any(s, /(reduce|less|no|fewer) (motion|animation)|animatsiya|harakat|анимац|движени/)) return { type: 'a11y', setting: 'reduceMotion', value: !(off && !/reduce|less|no|fewer|kamaytir|уменьш|меньше/.test(s)) };

  if (any(s, COURSE)) {
    const view = VIEW_WORDS.find(([, re]) => any(s, re))?.[0] ?? 'all';
    // "free AI courses": the free filter plus the AI topic.
    const aiToo = view !== 'ai-digital' && any(s, /\bai\b|sun'iy|\bии\b|искусствен/);
    const query = s.split(' ').filter((w) => !STOP_WORDS.has(w) && !any(w, COURSE) && !any(w, OPEN)).join(' ')
      .replace(/^(about|on|for|по) /, '').trim();
    const q = query.split(' ').filter((w) => !/^(ai|digital|raqamli|sun'iy|intellekt|ии|цифровые|искусственный|интеллект)$/.test(w)).join(' ');
    if (view !== 'all' || q || aiToo) return { type: 'filter', query: q, view, ...(aiToo ? { topic: 'ai' as const } : {}) };
  }

  const tab = TAB_WORDS.find(([, re]) => any(s, re))?.[0];
  if (tab && (any(s, OPEN) || s.split(' ').length <= 3)) return { type: 'tab', tab };
  return null;
}

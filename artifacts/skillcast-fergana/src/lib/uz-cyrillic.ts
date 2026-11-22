// ─── Uzbek Latin → Uzbek Cyrillic ──────────────────────────────────────────
// The Uzbek Cyrillic interface is produced from the reviewed Uzbek (Latin)
// copy with the official letter correspondences, not by machine translation:
//   o‘→ў  g‘→ғ  sh→ш  ch→ч  q→қ  h→ҳ  x→х  j→ж  y→й  yo→ё  yu→ю  ya→я  ye→е
//   e→э at the start of a word or after a vowel, otherwise е
//   ’ (tutuq belgisi) → ъ
// Russian loanwords that need ц, ь or ъ come from an exception list.
// Brand names, acronyms, URLs, e-mails, numbers and {placeholders} stay as
// they are. A native-speaker review is still recommended.

const SINGLE: Record<string, string> = {
  a: 'а', b: 'б', d: 'д', e: 'е', f: 'ф', g: 'г', h: 'ҳ', i: 'и', j: 'ж', k: 'к', l: 'л', m: 'м', n: 'н',
  o: 'о', p: 'п', q: 'қ', r: 'р', s: 'с', t: 'т', u: 'у', v: 'в', x: 'х', y: 'й', z: 'з', c: 'к', w: 'в',
};
const APOS = /[‘’ʻʼ'`]/;
const VOWELS = new Set(['a', 'e', 'i', 'o', 'u', 'ў']);

/** Whole words (lower case) and word beginnings for loanwords. */
const WORDS: Record<string, string> = {
  kompyuter: 'компьютер', kompyuterlar: 'компьютерлар', kompyuterlash: 'компьютерлаш', kompyuterni: 'компьютерни', kompyuterda: 'компьютерда',
  sentyabr: 'сентябр', oktyabr: 'октябр', noyabr: 'ноябр', dekabr: 'декабр', yanvar: 'январ', fevral: 'феврал',
  aprel: 'апрел', iyun: 'июн', iyul: 'июл', obyekt: 'объект', subyekt: 'субъект', proyekt: 'проект',
  aksiya: 'акция', funksiya: 'функция', funksiyalar: 'функциялар', stansiya: 'станция', seksiya: 'секция', reaksiya: 'реакция',
  kolleksiya: 'коллекция', kolleksiyasi: 'коллекцияси', kolleksiyani: 'коллекцияни', konsepsiya: 'концепция', korreksiya: 'коррекция',
  sertifikat: 'сертификат', fakultet: 'факультет', festival: 'фестивал', tsentr: 'центр', sement: 'цемент',
  oktabr: 'октябр', mart: 'март', may: 'май', avgust: 'август', ish: 'иш',
};
/** Endings: Latin "-tsiya" is Cyrillic "-ция" (integratsiya → интеграция). */
const ENDINGS: Array<[RegExp, string]> = [[/тсия/g, 'ция'], [/тсион/g, 'цион'], [/тсий/g, 'ций']];

/** Kept in Latin script inside Uzbek Cyrillic text. */
const KEEP = new Set([
  'skillcast', 'coursera', 'python', 'excel', 'google', 'microsoft', 'openai', 'chatgpt', 'linkedin', 'upwork', 'telegram', 'instagram', 'youtube',
  'kaggle', 'alison', 'domestika', 'freecodecamp', 'canva', 'cisco', 'netacad', 'figma', 'django', 'laravel', 'flutter', 'android', 'ios',
  'java', 'javascript', 'typescript', 'html', 'css', 'sql', 'power', 'bi', 'hyundai', 'textima', 'knauf', 'les', 'roches', 'seoultech',
  'edge', 'neural', 'svetlana', 'ava', 'andrew', 'world', 'bank', 'remotive', 'siat', 'helpdesk', 'no-code', 'mlops',
  'runpod', 'deeplearning', 'learnenglish', 'openwho', 'elearning', 'devops', 'genai', 'iot', 'aws', 'academy', 'udemy', 'edx', 'w3c', 'wai', 'qwasar', 'craft&culture', 'homo', 'faber', 'stanford', 'nobleprog',
]);

/** Acronyms that stay in Latin script; other capitalised words are transliterated. */
const ACRONYMS = new Set(['AI', 'IT', 'CV', 'HR', 'PDF', 'ESG', 'WEF', 'SQL', 'AWS', 'FAO', 'WHO', 'ZIP', 'CSV', 'TXT', 'HRIS', 'PII', 'RPA', 'EV', 'SEO',
  'CRM', 'CNC', 'KYC', 'QA', 'UX', 'UI', 'HSE', 'EN', 'UZ', 'RU', 'ESCO', 'WCAG', 'XMUM', 'LLM', 'ML', 'POC', 'BRM', 'SDG', 'SDGS', 'ID', 'ISCO', 'UNDP',
  'ILO', 'KOICA', 'INHA', 'PDP', 'UZS', 'ACCA', 'ACFP', 'ACDF', 'IELTS', 'TOPIK', 'EPS', 'GPS', 'API', 'URL', 'TVET', 'OECD', 'ADB', 'EU', 'UN', 'UNESCO',
  'UNICEF', 'ICT', 'STEM', 'MOOC', 'BI', 'CEFR', 'ISO', 'HTML', 'CSS', 'PHP', 'GIZ', 'USAID', 'IMF', 'LMS', 'GPT', 'TTS', 'CSP', 'PWA', 'JSON', 'MP3', 'E-9', 'B2B', 'KPI']);

function translitWord(word: string): string {
  const lower = word.toLowerCase();
  // Uzbek words written in capitals after a digraph: YuNESKO → ЮНЕСКО.
  if (/^(Yu|Ya|Yo|Ye|Sh|Ch)[A-Z]{2,}$/.test(word)) return translitWord(word.toUpperCase());
  // Brand with an Uzbek suffix: SkillCast’da → SkillCast’да.
  const suffixed = /^([A-Za-z]+)([‘’ʻʼ'])([a-z]+)$/.exec(word);
  if (suffixed && (KEEP.has(suffixed[1].toLowerCase()) || /[a-z][A-Z]/.test(suffixed[1]) || ACRONYMS.has(suffixed[1]))) {
    return `${suffixed[1]}${suffixed[2]}${translitWord(suffixed[3])}`;
  }
  // Acronyms (AI, BRM), mixed-case brands (SkillCast, RunPod), keep-list, anything with digits.
  if (KEEP.has(lower.replace(/[‘’ʻʼ']/g, '')) || ACRONYMS.has(word.toUpperCase()) && word === word.toUpperCase() || /[a-z][A-Z]/.test(word) || /\d/.test(word)) return word;
  const plain = lower.replace(/[‘’ʻʼ`]/g, "'");
  for (const [latin, cyr] of Object.entries(WORDS)) {
    if (plain === latin || (plain.startsWith(latin) && latin.length >= 6)) {
      const rest = plain.slice(latin.length);
      return matchCase(word, cyr + (rest ? translitWord(rest).toLowerCase() : ''));
    }
  }
  let out = '';
  const s = plain;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    const next = s[i + 1] ?? '';
    const prev = out[out.length - 1]?.toLowerCase() ?? '';
    if ((ch === 'o' || ch === 'g') && APOS.test(next)) { out += ch === 'o' ? 'ў' : 'ғ'; i++; continue; }
    if (ch === 's' && next === 'h') { out += 'ш'; i++; continue; }
    if (ch === 'c' && next === 'h') { out += 'ч'; i++; continue; }
    if (ch === 'y' && next === 'o' && !APOS.test(s[i + 2] ?? '')) { out += 'ё'; i++; continue; }
    if (ch === 'y' && next === 'u') { out += 'ю'; i++; continue; }
    if (ch === 'y' && next === 'a') { out += 'я'; i++; continue; }
    if (ch === 'y' && next === 'e') { out += 'е'; i++; continue; }
    if (ch === 'e') { out += i === 0 || VOWELS.has(latinOf(prev)) ? 'э' : 'е'; continue; }
    if (APOS.test(ch)) { out += i > 0 ? 'ъ' : ''; continue; }
    out += SINGLE[ch] ?? ch;
  }
  for (const [re, rep] of ENDINGS) out = out.replace(re, rep);
  return matchCase(word, out);
}

const BACK: Record<string, string> = { а: 'a', е: 'e', э: 'e', и: 'i', о: 'o', у: 'u', ў: 'ў', ё: 'o', ю: 'u', я: 'a' };
const latinOf = (c: string) => BACK[c] ?? c;

function matchCase(src: string, out: string): string {
  if (src.length > 1 && src === src.toUpperCase() && /[A-Z]/.test(src)) return out.toUpperCase();
  if (/^[A-Z]/.test(src)) return out.charAt(0).toUpperCase() + out.slice(1);
  return out;
}

// Tokens left untouched: URLs, e-mails, {placeholders}, HTML-like tags.
const PROTECT = /(https?:\/\/\S+|www\.\S+|[\w.+-]+@[\w-]+\.[\w.]+|\{[^}]+\}|<[^>]+>|[\w-]+\.(?:uz|com|org|net|ru|io|gov)\S*)/g;
// A word: Latin letters with Uzbek apostrophes inside (o‘zbek, ta’lim, g‘oya).
const WORD = /[A-Za-z]+(?:[‘’ʻʼ'`][A-Za-z]+)*[‘’ʻʼ'`]?/g;

export function latinToCyrillic(text: string): string {
  if (!text || !/[A-Za-z]/.test(text)) return text;
  return text.split(PROTECT).map((part, i) => (i % 2 === 1 ? part : part.replace(WORD, (w) => {
    // A trailing apostrophe after o/g belongs to the letter (o‘, g‘); otherwise drop quotes like ‘word’.
    if (/[‘’ʻʼ'`]$/.test(w) && !/[ogOG][‘’ʻʼ'`]$/.test(w)) return translitWord(w.slice(0, -1)) + w.slice(-1);
    return translitWord(w);
  }))).join('');
}

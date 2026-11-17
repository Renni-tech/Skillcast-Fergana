// ─── Voice assistant: intent parsing (Uzbek, Russian, English) ─────────────
// Deterministic keyword matching, no external service: the same text gives the
// same intent, and nothing is invented. Speech recognition (when the browser
// offers it) and typed input both go through parseIntent().

export type NavTarget = 'overview' | 'matches' | 'radar' | 'pathway' | 'harada' | 'progress' | 'sdg' | 'demand' | 'landing' | 'signals' | 'employer' | 'inclusive';

export type Intent =
  | { kind: 'help' }
  | { kind: 'navigate'; target: NavTarget }
  | { kind: 'explain-skill'; skill: string }
  | { kind: 'explain-radar' }
  | { kind: 'next-learning' }
  | { kind: 'careers' }
  | { kind: 'read' }
  | { kind: 'search'; query: string }
  | { kind: 'accessibility' }
  | { kind: 'unknown' };

/** Lowercase, unify apostrophes (o‘zbek / o'zbek / oʻzbek) and spacing. */
export function normalize(text: string): string {
  return text.toLowerCase().replace(/[‘’ʻʼ`´]/g, "'").replace(/ё/g, 'е').replace(/[?!.,;:«»"()]/g, ' ').replace(/\s+/g, ' ').trim();
}

const has = (text: string, words: string[]) => words.some((w) => text.includes(w));

const WORDS = {
  help: ['help', 'what can you do', 'yordam', 'nima qila olasan', 'nimalar qila olasiz', 'помощь', 'помоги', 'что ты умеешь', 'что вы умеете'],
  radar: ['wind rose', 'windrose', 'radar', 'shamol', 'роза ветров', 'радар', 'direction map', "yo'nalish xarita", 'карта направлен'],
  explain: ['what is', 'what does', 'what are', 'explain', 'meaning', 'mean', 'nima degani', 'nima', 'tushuntir', 'ma\'nosi', 'что такое', 'что значит', 'объясни', 'расскажи'],
  next: ['learn next', 'what should i learn', 'what to learn', 'next course', 'next step', "nima o'rgan", "keyingi qadam", "keyingi kurs", "o'rganishim kerak", 'что изучать', 'что мне изучать', 'чему учиться', 'следующий курс', 'следующий шаг', 'что дальше'],
  careers: ['career', 'job', 'profession', 'recommend', 'which role', 'kasb', 'karyera', 'ish ', 'ishlar', 'lavozim', "yo'nalish tavsiya", 'карьер', 'професси', 'работ', 'вакан', 'рекоменд'],
  read: ['read aloud', 'read my', 'read the', 'read recommendations', "o'qib ber", "ovoz chiqarib", 'прочитай', 'прочти', 'зачитай'],
  search: ['search', 'find', 'look for', 'qidir', 'top', 'izla', 'найди', 'найти', 'поиск', 'ищи'],
  accessibility: ['accessibility', 'accessible', 'larger', 'bigger', 'text size', 'contrast', 'imkoniyat', 'kattaroq', 'kattalashtir', 'kontrast', 'доступност', 'крупнее', 'увелич', 'контраст'],
  open: ['open', 'go to', 'show', 'take me', 'och', "ko'rsat", "o't", 'открой', 'перейди', 'покажи'],
};

const TARGETS: Array<[NavTarget, string[]]> = [
  ['inclusive', ['inclusive', 'disability', 'accessible job', 'inklyuziv', 'nogiron', 'imkoniyati cheklangan', 'инклюзив', 'инвалид', 'ограниченными возможност']],
  ['pathway', ['what to learn', 'courses', 'learning path', "nimani o'rganish", 'kurslar', "o'quv reja", 'что изучать', 'курсы', 'обучени']],
  ['matches', ['pathways', 'matches', "yo'nalishlar", 'mosliklar', 'траектори', 'подбор']],
  ['radar', ['radar', 'wind rose', 'shamol', 'радар', 'роза ветров']],
  ['harada', ['harada', 'roadmap', "yo'l xarita", 'харад', 'маршрут']],
  ['progress', ['progress', 'jarayon', 'прогресс']],
  ['sdg', ['sdg', 'brm', 'sustainable', 'barqaror', 'цур', 'устойчив']],
  ['demand', ['demand', 'talab', 'спрос']],
  ['signals', ['signal', 'sources', 'manba', 'источник']],
  ['employer', ['employer', 'ish beruvchi', 'работодат']],
  ['overview', ['overview', 'forecast', 'dashboard', 'umumiy', 'prognoz', 'обзор', 'прогноз']],
  ['landing', ['home', 'start page', 'bosh sahifa', 'главн']],
];

/** Index of skill names and aliases (all languages) → skill slug. */
export type SkillIndex = Array<{ term: string; slug: string }>;

export function buildSkillIndex(entries: Array<{ slug: string; names: string[]; aliases?: string[] }>): SkillIndex {
  const index: SkillIndex = [];
  for (const e of entries) {
    for (const term of [...e.names, ...(e.aliases ?? [])]) {
      const n = normalize(term);
      if (n.length >= 3) index.push({ term: n, slug: e.slug });
    }
  }
  // Distinctive single words (8+ letters) from names, e.g. "kiberxavfsizlik",
  // count only when they belong to exactly one skill.
  const owners = new Map<string, Set<string>>();
  for (const e of entries) for (const name of e.names) {
    for (const word of normalize(name).split(' ')) if (word.length >= 8) (owners.get(word) ?? owners.set(word, new Set()).get(word)!).add(e.slug);
  }
  for (const [word, slugs] of owners) if (slugs.size === 1) index.push({ term: word, slug: [...slugs][0] });
  return index.sort((a, b) => b.term.length - a.term.length); // longest match wins
}

export function findSkill(text: string, index: SkillIndex): string | null {
  const t = normalize(text);
  const hit = index.find(({ term }) => (term.length <= 4 ? new RegExp(`(^|\\s)${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s|$)`).test(t) : t.includes(term)));
  return hit?.slug ?? null;
}

function stripWords(text: string, words: string[]) {
  let out = ` ${text} `;
  for (const w of [...words].sort((a, b) => b.length - a.length)) out = out.split(w).join(' ');
  return out.replace(/\s+/g, ' ').trim();
}

export function parseIntent(raw: string, skills: SkillIndex): Intent {
  const text = normalize(raw);
  if (!text) return { kind: 'unknown' };
  if (has(text, WORDS.help)) return { kind: 'help' };
  if (has(text, WORDS.read)) return { kind: 'read' };
  if (has(text, WORDS.radar) && (has(text, WORDS.explain) || !has(text, WORDS.open))) return { kind: 'explain-radar' };
  if (has(text, WORDS.next)) return { kind: 'next-learning' };
  if (has(text, WORDS.search)) {
    const query = stripWords(text, [...WORDS.search, 'for', 'me', 'please', 'iltimos', 'мне', 'пожалуйста']);
    return query ? { kind: 'search', query } : { kind: 'help' };
  }
  const skill = findSkill(text, skills);
  if (skill && has(text, WORDS.explain)) return { kind: 'explain-skill', skill };
  // "accessible jobs" is about opportunities, not display settings.
  if (has(text, TARGETS[0][1]) || /accessible (job|work|course|stud)|qulay ish|доступн(ая|ые) работ/.test(text)) return { kind: 'navigate', target: 'inclusive' };
  if (has(text, WORDS.accessibility)) return { kind: 'accessibility' };
  for (const [target, words] of TARGETS) {
    if (has(text, words) && (has(text, WORDS.open) || text.split(' ').length <= 3)) return { kind: 'navigate', target };
  }
  if (has(text, WORDS.careers)) return { kind: 'careers' };
  if (skill) return { kind: 'explain-skill', skill };
  return { kind: 'unknown' };
}

/** Plain search over catalogue text; returns items whose text contains every query word. */
export function searchCatalogue<T>(query: string, items: Array<{ item: T; text: string }>, limit = 5): T[] {
  const words = normalize(query).split(' ').filter((w) => w.length >= 2);
  if (!words.length) return [];
  return items
    .map(({ item, text }) => {
      const n = normalize(text);
      const hits = words.filter((w) => n.includes(w)).length;
      return { item, hits };
    })
    .filter(({ hits }) => hits === words.length || (words.length > 2 && hits >= words.length - 1))
    .sort((a, b) => b.hits - a.hits)
    .slice(0, limit)
    .map(({ item }) => item);
}

'use client';

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Mic, MicOff, Send, Square, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { COURSES, COURSE_MAP } from '@/data/courses';
import { INCLUSIVE_ENTRIES } from '@/data/inclusive';
import { LEARNING_SOURCES } from '@/data/learning-sources';
import { ROLES, ROLE_MAP } from '@/data/roles';
import { SKILLS, SKILL_MAP } from '@/data/skills';
import { SKILL_COPY } from '@/lib/catalog-i18n';
import { matchAll } from '@/lib/matching';
import { useSkillCast } from '@/lib/store';
import type { Lang } from '@/lib/types';
import { usePanels } from '@/lib/ui-panels';
import { buildSkillIndex, parseIntent, searchCatalogue, type Intent, type NavTarget } from '@/lib/voice-intents';
import { computeWindRose } from '@/lib/wind-rose';
import { pickCourses } from './pathway';
import { courseProvider, courseTitle, roleTitle, skillCategory, skillName, useSignals, useT } from './shared';

// ─── Voice assistant ───────────────────────────────────────────────────────
// Browser-only: Web Speech API recognition where available (Chrome, Edge),
// typed input everywhere, and speechSynthesis for reading answers aloud when
// the device has a voice for the selected language. Answers come only from
// SkillCast data; nothing is fetched or invented.

const SPEECH_LANG: Record<Lang, string> = { uz: 'uz-UZ', ru: 'ru-RU', en: 'en-GB' };
const LANG_NAME_KEY: Record<Lang, string> = { uz: 'ls.lang.uz', ru: 'ls.lang.ru', en: 'ls.lang.en' };

type Recognition = {
  lang: string; interimResults: boolean; continuous: boolean; maxAlternatives: number;
  start: () => void; stop: () => void; abort: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};
type RecognitionCtor = new () => Recognition;

function recognitionCtor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const TAB_TARGETS: Partial<Record<NavTarget, string>> = {
  overview: 'overview', matches: 'matches', radar: 'radar', pathway: 'pathway', harada: 'harada', progress: 'progress', sdg: 'sdg', demand: 'demand', inclusive: 'matches',
};
const TARGET_LABEL: Record<NavTarget, string> = {
  overview: 'tab.overview', matches: 'tab.matches', radar: 'ov.radar.title', pathway: 'tab.learn', harada: 'tab.harada', progress: 'Progress',
  sdg: 'tab.sdg', demand: 'tab.demand', landing: 'nav.home', signals: 'nav.signals', employer: 'nav.employer', inclusive: 'inc.title',
};

interface Message { from: 'user' | 'assistant'; text: string }

export function VoiceLauncher() {
  const t = useT();
  const openVoice = usePanels((s) => s.openVoice);
  return (
    <Button
      onClick={() => openVoice()}
      className="fixed bottom-4 right-4 z-40 h-12 gap-2 rounded-full bg-blue-700 px-4 text-white shadow-lg hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500"
      aria-label={t('va.title')}
    >
      <Mic className="h-5 w-5 shrink-0" aria-hidden />
      <span className="hidden sm:inline">{t('va.title')}</span>
    </Button>
  );
}

export function VoiceAssistant() {
  const t = useT();
  const store = useSkillCast();
  const { lang, profile, chosenRole, completedCourses, learnerOnboarded, setDashTab, setView } = store;
  const { momentumMap } = useSignals();
  const { voiceOpen, setVoiceOpen, consumePrompt, setA11yOpen } = usePanels();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const [micNote, setMicNote] = useState<string | null>(null);
  const [speak, setSpeak] = useState(true);
  const [voiceNote, setVoiceNote] = useState<string | null>(null);
  const recognitionRef = useRef<Recognition | null>(null);
  const logRef = useRef<HTMLOListElement>(null);
  const [supported, setSupported] = useState({ mic: false, tts: false });

  useEffect(() => {
    setSupported({ mic: recognitionCtor() !== null, tts: typeof window !== 'undefined' && 'speechSynthesis' in window });
  }, []);

  const skillIndex = useMemo(() => buildSkillIndex(SKILLS.map((s) => ({
    slug: s.slug, names: [s.name, SKILL_COPY[s.slug]?.uz ?? '', SKILL_COPY[s.slug]?.ru ?? ''], aliases: s.aliases,
  }))), []);
  const matches = useMemo(() => matchAll(profile, momentumMap), [profile, momentumMap]);

  function voiceFor(l: Lang): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const prefix = SPEECH_LANG[l].slice(0, 2);
    return window.speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith(prefix)) ?? null;
  }

  function say(text: string) {
    if (!speak || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voice = voiceFor(lang);
    if (!voice) { setVoiceNote(t('va.noVoice', { lang: t(LANG_NAME_KEY[lang]) })); return; }
    setVoiceNote(null);
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.voice = voice;
    u.lang = voice.lang;
    window.speechSynthesis.speak(u);
  }

  function nextCourse() {
    const match = matches.find((m) => m.roleSlug === chosenRole);
    if (!match) return null;
    const node = pickCourses(match.gap, profile.inclusion, profile.budget).find((n) => !completedCourses.includes(n.courseSlug));
    return node ? COURSE_MAP[node.courseSlug] : null;
  }

  function go(target: NavTarget) {
    const tab = TAB_TARGETS[target];
    if (tab) {
      if (!learnerOnboarded) { setView('onboarding'); return; }
      setDashTab(tab);
      setView('dashboard');
      if (target === 'inclusive') setTimeout(() => document.getElementById('inclusive')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 350);
    } else setView(target as 'landing' | 'signals' | 'employer');
  }

  function answer(intent: Intent, raw: string): string {
    const list = (items: string[]) => items.join('; ');
    switch (intent.kind) {
      case 'help': return t('va.r.help');
      case 'navigate':
        go(intent.target);
        return t('va.r.nav', { section: t(TARGET_LABEL[intent.target]) });
      case 'accessibility':
        setVoiceOpen(false);
        setA11yOpen(true);
        return t('va.r.a11y');
      case 'explain-skill': {
        const def = SKILL_MAP[intent.skill];
        const tracked = intent.skill in momentumMap;
        return t('va.r.skill', {
          skill: skillName(t, intent.skill), category: skillCategory(t, def.category),
          market: Math.round(momentumMap[intent.skill] ?? def.seedMomentum),
          source: t(tracked ? 'wr.tracked' : 'wr.baseline'),
          level: profile.skills[intent.skill] ?? 0,
          roles: ROLES.filter((r) => r.skills.some((s) => s.skill === intent.skill)).length,
          courses: COURSES.filter((c) => c.skills.includes(intent.skill)).length,
        });
      }
      case 'next-learning': {
        const course = nextCourse();
        if (!course) { go('matches'); return t('va.r.next.none'); }
        go('pathway');
        return t('va.r.next', { course: courseTitle(t, course.slug), provider: courseProvider(t, course.slug), skills: course.skills.map((s) => skillName(t, s)).join(', ') });
      }
      case 'careers': {
        if (!matches.length) return t('va.r.careers.none');
        go('matches');
        return t('va.r.careers', { list: list(matches.slice(0, 3).map((m) => `${roleTitle(t, m.roleSlug)} (${m.score}%)`)) });
      }
      case 'explain-radar': {
        const rose = computeWindRose(profile, momentumMap, chosenRole);
        go('overview');
        return t('va.r.radar', { gaps: rose.priorities.length ? rose.priorities.map((p) => skillName(t, p.slug)).join(', ') : t('va.r.noGaps') });
      }
      case 'read': {
        const lead = matches.find((m) => m.roleSlug === chosenRole) ?? matches[0];
        const rose = computeWindRose(profile, momentumMap, chosenRole);
        const course = nextCourse();
        return t('va.r.read', {
          role: lead ? roleTitle(t, lead.roleSlug) : t('va.r.none'), fit: lead?.score ?? 0,
          gaps: rose.priorities.length ? rose.priorities.map((p) => skillName(t, p.slug)).join(', ') : t('va.r.noGaps'),
          course: course ? courseTitle(t, course.slug) : t('va.r.none'),
        });
      }
      case 'search': {
        const items = [
          ...ROLES.map((r) => ({ item: `${roleTitle(t, r.slug)} (${t('va.type.role')})`, text: `${r.title} ${roleTitle(t, r.slug)} ${r.category} ${r.skills.map((s) => `${SKILL_MAP[s.skill]?.name ?? ''} ${skillName(t, s.skill)}`).join(' ')} job work career profession ish kasb работа профессия` })),
          ...COURSES.map((c) => ({ item: `${courseTitle(t, c.slug)} — ${courseProvider(t, c.slug)} (${t('va.type.course')})`, text: `${c.title} ${courseTitle(t, c.slug)} ${c.provider} ${c.skills.map((s) => `${SKILL_MAP[s]?.name ?? ''} ${skillName(t, s)}`).join(' ')} course courses kurs курс курсы` })),
          ...LEARNING_SOURCES.map((s) => ({ item: `${t(`ls.${s.id}.name`)} — ${s.provider} (${t('va.type.source')})`, text: `${s.name} ${t(`ls.${s.id}.name`)} ${s.provider} ${t(`ls.${s.id}.d`)} ${s.skills.map((k) => `${SKILL_MAP[k]?.name ?? ''} ${skillName(t, k)} ${SKILL_MAP[k]?.aliases.join(' ') ?? ''}`).join(' ')} course courses learn study kurs o'qish курс курсы учеба` })),
          ...INCLUSIVE_ENTRIES.map((e) => ({ item: `${t(`inc.${e.id}.name`)} (${t('va.type.inclusive')})`, text: `${e.name} ${t(`inc.${e.id}.name`)} ${e.publisher} ${t(`inc.${e.id}.d`)} inclusive accessible disability inklyuziv nogiron инклюзив инвалид` })),
        ];
        const found = searchCatalogue(intent.query, items, 5);
        const jobs = /job|vacanc|vakans|ish o'rni|ваканс|работ/.test(raw.toLowerCase());
        if (!found.length) return t('va.r.search.none', { q: intent.query });
        return `${t('va.r.search', { list: list(found) })}${jobs ? ` ${t('va.r.search.jobs')}` : ''}`;
      }
      default: return t('va.r.unknown');
    }
  }

  function handle(text: string) {
    const clean = text.trim();
    if (!clean) return;
    const reply = answer(parseIntent(clean, skillIndex), clean);
    setMessages((m) => [...m, { from: 'user' as const, text: clean }, { from: 'assistant' as const, text: reply }].slice(-20));
    say(reply);
  }

  // Ask a pending question (e.g. from the Wind Rose button) when the panel opens.
  useEffect(() => {
    if (!voiceOpen) return;
    const prompt = consumePrompt();
    if (prompt) handle(prompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceOpen]);

  useEffect(() => { logRef.current?.lastElementChild?.scrollIntoView({ block: 'nearest' }); }, [messages]);

  // Stop listening and speaking when the panel closes.
  useEffect(() => {
    if (voiceOpen) return;
    recognitionRef.current?.abort();
    setListening(false);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
  }, [voiceOpen]);

  function toggleMic() {
    if (listening) { recognitionRef.current?.stop(); return; }
    const Ctor = recognitionCtor();
    if (!Ctor) { setMicNote(t('va.mic.unsupported')); return; }
    const rec = new Ctor();
    rec.lang = SPEECH_LANG[lang];
    rec.interimResults = false;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      const last = e.results[e.results.length - 1];
      if (last?.isFinal !== false && last?.[0]?.transcript) handle(last[0].transcript);
    };
    rec.onerror = (e) => setMicNote(e.error === 'not-allowed' || e.error === 'service-not-allowed' ? t('va.mic.denied') : t('va.mic.error'));
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    setMicNote(null);
    setListening(true);
    try { rec.start(); } catch { setListening(false); setMicNote(t('va.mic.error')); }
  }

  const submit = (e: FormEvent) => { e.preventDefault(); handle(input); setInput(''); };
  const examples = ['va.ex.next', 'va.ex.radar', 'va.ex.careers', 'va.ex.read', 'va.ex.search', 'va.ex.inclusive'];

  return (
    <Sheet open={voiceOpen} onOpenChange={setVoiceOpen}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle className="flex items-center gap-2"><Mic className="h-5 w-5" aria-hidden />{t('va.title')}</SheetTitle>
          <SheetDescription>{t('va.scope')}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div>
              <p className="text-sm font-medium">{t('va.examples')}</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {examples.map((k) => (
                  <li key={k}>
                    <button type="button" onClick={() => handle(t(k))} className="rounded-full border px-3 py-1.5 text-left text-xs hover:bg-muted">
                      {t(k)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <ol ref={logRef} className="space-y-2" aria-live="polite" aria-relevant="additions">
            {messages.map((m, i) => (
              <li key={i} className={`rounded-xl px-3 py-2 text-sm leading-relaxed ${m.from === 'user' ? 'ml-8 bg-blue-600 text-white' : 'mr-4 border bg-muted/50'}`}>
                <span className="sr-only">{m.from === 'user' ? t('va.you') : t('va.assistant')}: </span>
                {m.text}
              </li>
            ))}
          </ol>
        </div>

        <div className="space-y-3 border-t p-4">
          {(micNote || voiceNote) && <p role="status" className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">{micNote ?? voiceNote}</p>}
          <form onSubmit={submit} className="flex items-center gap-2">
            <Button
              type="button"
              size="icon"
              variant={listening ? 'destructive' : 'outline'}
              className="h-11 w-11 shrink-0"
              onClick={toggleMic}
              aria-pressed={listening}
              aria-label={listening ? t('va.mic.stop') : t('va.mic.start')}
              title={supported.mic ? undefined : t('va.mic.unsupported')}
            >
              {listening ? <MicOff className="h-5 w-5" aria-hidden /> : <Mic className="h-5 w-5" aria-hidden />}
            </Button>
            <label htmlFor="va-input" className="sr-only">{t('va.input')}</label>
            <Input id="va-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder={listening ? t('va.listening') : t('va.input')} className="h-11" autoComplete="off" />
            <Button type="submit" size="icon" className="h-11 w-11 shrink-0" aria-label={t('va.send')}><Send className="h-4 w-4" aria-hidden /></Button>
          </form>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <label className="flex items-center gap-2">
              <Switch checked={speak} onCheckedChange={setSpeak} disabled={!supported.tts} />
              <Volume2 className="h-4 w-4" aria-hidden /> {supported.tts ? t('va.speak') : t('va.noSpeech')}
            </label>
            {supported.tts && (
              <Button variant="ghost" size="sm" className="gap-1" onClick={() => window.speechSynthesis.cancel()}>
                <Square className="h-3.5 w-3.5" aria-hidden /> {t('va.stop')}
              </Button>
            )}
          </div>
          {!supported.mic && <p className="text-xs text-muted-foreground">{t('va.mic.unsupported')}</p>}
        </div>
      </SheetContent>
    </Sheet>
  );
}

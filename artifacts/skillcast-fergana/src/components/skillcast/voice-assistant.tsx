'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useTheme } from 'next-themes';
import { ArrowRight, ChevronDown, Loader2, Mic, MicOff, RotateCcw, Send, Settings2, Sparkles, Square, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { COURSES, COURSE_MAP } from '@/data/courses';
import { INCLUSIVE_ENTRIES } from '@/data/inclusive';
import { LEARNING_SOURCES } from '@/data/learning-sources';
import { ROLES } from '@/data/roles';
import { SKILLS, SKILL_MAP } from '@/data/skills';
import { ALL_BADGES } from '@/lib/achievements';
import { SKILL_COPY } from '@/lib/catalog-i18n';
import { makeT } from '@/lib/i18n';
import { matchAll } from '@/lib/matching';
import { PLAN_PACE_CAP, planningHours } from '@/lib/profile';
import { useSkillCast } from '@/lib/store';
import type { Lang, RoleMatch } from '@/lib/types';
import { usePanels } from '@/lib/ui-panels';
import { buildSkillIndex, parseIntent, searchCatalogue, uzCyrillicToLatin, type Intent, type NavTarget } from '@/lib/voice-intents';
import { computeWindRose } from '@/lib/wind-rose';
import { parseCommand, type Command } from '@/lib/voice-commands';
import { NEURAL_VOICES, deviceVoiceFor, speak as speakAloud, stopSpeaking } from '@/lib/tts-client';
import { readScreen } from '@/lib/screen-summary';
import { switchTheme } from './header';
import { rolePathway } from './pathway';
import { courseProvider, courseTitle, roleTitle, skillCategory, skillName, useSignals, useT } from './shared';

// ─── Career assistant ──────────────────────────────────────────────────────
// Answers come only from the learner's saved profile and SkillCast data, so
// the same question gives the same answer and nothing is invented. Voice:
// Web Speech API recognition where the browser offers it, typed input
// everywhere, and speechSynthesis for reading answers aloud. When the device
// has no voice for the selected language, the same answer can be read in
// another language that does have one. An optional "Explain in more detail"
// asks the /api/coach narrator, with its own loading, error and retry states.

type Translate = ReturnType<typeof makeT>;

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

/** What the conversation is about, so "why?" or "how do I learn it?" make sense. */
interface Ctx { last?: Intent['kind']; skill?: string; role?: string }
interface Action { label: string; target?: NavTarget; ai?: boolean }
interface Reply { text: string; actions: Action[]; follow: string[]; nav?: NavTarget; a11y?: boolean; ctx: Ctx }
interface Message {
  id: number; from: 'user' | 'assistant'; text: string;
  actions?: Action[]; follow?: string[]; intent?: Intent; ctx?: Ctx; raw?: string;
  status?: 'loading' | 'error'; note?: string; retry?: () => void;
}

let nextId = 1;

/** Plain-language, deterministic explanation of a match score (all languages). */
export function explainMatch(tt: Translate, match: RoleMatch): string {
  const pct = (label: string) => Math.round((match.factors.find((f) => f.label === label)?.value ?? 0) * 100);
  const have = match.matchingSkills.filter((s) => s.userLevel >= s.requiredLevel).slice(0, 2).map((s) => skillName(tt, s.skill));
  const gaps = match.gap.slice(0, 2).map((g) => skillName(tt, g.skill));
  return tt('va.r.why', {
    role: roleTitle(tt, match.roleSlug), fit: match.score,
    skills: pct('Skills'), interests: pct('Interests'), experience: pct('Experience'), prefs: pct('Work preferences'),
    have: have.length ? tt('va.r.why.have', { list: have.join(', ') }) : '',
    gaps: gaps.length ? gaps.join(', ') : tt('va.r.noGaps'),
  }).replace(/\s{2,}/g, ' ');
}

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
  const {
    lang, profile, chosenRole, completedCourses, learnerOnboarded, setDashTab, setView,
    skillUpdates, activeDays, badges, assistantSpeak, setAssistantSpeak, scenario,
    a11y, setA11y, voice, setVoice, focusCatalog, addReflection, learningPaths, dashTab, view,
  } = store;
  const { setTheme } = useTheme();
  const [engine, setEngine] = useState<'neural' | 'device' | 'none' | null>(null);
  // Whether the server's AI agent answered recently; after a failure, stop waiting on it this session.
  const agentUp = useRef<boolean | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const afterSpeech = useRef<(() => void) | null>(null);
  const { momentumMap } = useSignals();
  const { voiceOpen, setVoiceOpen, consumePrompt, setA11yOpen } = usePanels();

  const [messages, setMessages] = useState<Message[]>([]);
  const [ctx, setCtx] = useState<Ctx>({});
  const [input, setInput] = useState('');
  const [interim, setInterim] = useState('');
  const [listening, setListening] = useState(false);
  const [micNote, setMicNote] = useState<{ text: string; retry?: boolean; useRu?: boolean } | null>(null);
  const [recLang, setRecLang] = useState<string | null>(null);
  const [voiceNote, setVoiceNote] = useState<{ lang: Lang; msg: Message } | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const recognitionRef = useRef<Recognition | null>(null);
  const logRef = useRef<HTMLOListElement>(null);
  const [supported, setSupported] = useState({ mic: false, tts: false });

  useEffect(() => {
    const device = typeof window !== 'undefined' && 'speechSynthesis' in window;
    // Natural voices come from the server, so speaking works even without a device voice.
    setSupported({ mic: recognitionCtor() !== null, tts: typeof Audio !== 'undefined' || device });
    if (!device) return undefined;
    // Voices load asynchronously in Chrome; asking too early returns none.
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.addEventListener('voiceschanged', load);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load);
  }, []);

  // Recognition language follows the interface unless the user switched to a fallback.
  useEffect(() => { setRecLang(null); }, [lang]);

  const skillIndex = useMemo(() => buildSkillIndex(SKILLS.map((s) => ({
    slug: s.slug, names: [s.name, SKILL_COPY[s.slug]?.uz ?? '', SKILL_COPY[s.slug]?.ru ?? ''], aliases: s.aliases,
  }))), []);
  const matches = useMemo(() => matchAll(profile, momentumMap), [profile, momentumMap]);
  const leadMatch = (roleSlug?: string): RoleMatch | undefined =>
    matches.find((m) => m.roleSlug === (roleSlug ?? chosenRole)) ?? (chosenRole ? undefined : matches[0]);

  function voiceFor(l: Lang): SpeechSynthesisVoice | null {
    void voices; // re-evaluated when the device's voice list loads
    return deviceVoiceFor(l);
  }

  async function speakText(text: string, l: Lang): Promise<boolean> {
    const used = await speakAloud(text, {
      lang: l, voice: l === lang ? voice.name : 'auto', rate: voice.rate, pitch: voice.pitch,
      onStart: () => setSpeaking(true),
      onEnd: () => { setSpeaking(false); afterSpeech.current?.(); afterSpeech.current = null; },
    });
    setEngine(used);
    return used !== 'none';
  }

  function say(msg: Message) {
    if (!(assistantSpeak || a11y.narrate)) { afterSpeech.current?.(); afterSpeech.current = null; return; }
    void speakText(msg.text, lang).then((ok) => {
      if (ok) { setVoiceNote(null); return; }
      setVoiceNote({ lang, msg });
      afterSpeech.current?.(); afterSpeech.current = null;
    });
  }

  /** Same answer in another language, for devices without a voice for this one. */
  function readIn(l: Lang, msg: Message) {
    const tt = makeT(l);
    const text = msg.intent ? compute(msg.intent, msg.raw ?? '', msg.ctx ?? {}, tt).text : msg.text;
    void speakText(text, l);
  }

  function remaining(match: RoleMatch) {
    return rolePathway(match, profile, completedCourses).filter((n) => !completedCourses.includes(n.courseSlug));
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

  /** Builds the answer. No side effects, so it can be re-run in another language. */
  function compute(intent: Intent, raw: string, c: Ctx, tt: Translate): Reply {
    const list = (items: string[]) => items.join('; ');
    const base = { actions: [] as Action[], follow: [] as string[], ctx: { ...c, last: intent.kind } };
    const needsProfile = ['why-match', 'gaps', 'time', 'week-plan', 'next-learning', 'careers', 'status'].includes(intent.kind);
    if (needsProfile && !learnerOnboarded) return { ...base, text: tt('va.r.noProfile') };
    switch (intent.kind) {
      case 'help': return { ...base, text: tt('va.r.help'), follow: ['va.ex.next', 'va.f.why', 'va.f.status'] };
      case 'navigate':
        return { ...base, text: tt('va.r.nav', { section: tt(TARGET_LABEL[intent.target]) }), nav: intent.target };
      case 'accessibility':
        return { ...base, text: tt('va.r.a11y'), a11y: true };
      case 'explain-skill': {
        const def = SKILL_MAP[intent.skill];
        const tracked = intent.skill in momentumMap;
        return {
          ...base, ctx: { ...base.ctx, skill: intent.skill },
          text: tt('va.r.skill', {
            skill: skillName(tt, intent.skill), category: skillCategory(tt, def.category),
            market: Math.round(momentumMap[intent.skill] ?? def.seedMomentum),
            source: tt(tracked ? 'wr.tracked' : 'wr.baseline'),
            level: profile.skills[intent.skill] ?? 0,
            roles: ROLES.filter((r) => r.skills.some((s) => s.skill === intent.skill)).length,
            courses: COURSES.filter((cs) => cs.skills.includes(intent.skill)).length,
          }),
          follow: ['va.f.learn'],
        };
      }
      case 'learn-skill': {
        const skill = intent.skill ?? c.skill;
        if (!skill) return { ...base, text: tt('va.r.learn.which') };
        const courses = COURSES.filter((cs) => cs.skills.includes(skill))
          .sort((a, b) => Number(b.free) - Number(a.free) || a.totalHours - b.totalHours).slice(0, 3);
        const ctxOut = { ...base.ctx, skill };
        if (!courses.length) return { ...base, ctx: ctxOut, text: tt('va.r.learn.none', { skill: skillName(tt, skill) }), actions: [{ label: 'va.a.pathway', target: 'pathway' }] };
        return {
          ...base, ctx: ctxOut,
          text: tt('va.r.learn', {
            skill: skillName(tt, skill),
            list: list(courses.map((cs) => `${courseTitle(tt, cs.slug)} — ${courseProvider(tt, cs.slug)}, ${cs.totalHours} h${cs.free ? `, ${tt('va.r.free')}` : ''}`)),
          }),
          actions: [{ label: 'va.a.pathway', target: 'pathway' }],
        };
      }
      case 'next-learning': {
        const match = leadMatch();
        if (!chosenRole || !match) return { ...base, text: tt('va.r.next.none'), actions: [{ label: 'va.a.matches', target: 'matches' }] };
        const node = remaining(match)[0];
        if (!node) return { ...base, text: tt('va.r.next.done', { role: roleTitle(tt, match.roleSlug) }), actions: [{ label: 'va.a.harada', target: 'harada' }], follow: ['va.f.status'] };
        const course = COURSE_MAP[node.courseSlug];
        return {
          ...base, ctx: { ...base.ctx, role: match.roleSlug, skill: node.skill },
          text: tt('va.r.next', { course: courseTitle(tt, course.slug), provider: courseProvider(tt, course.slug), skills: course.skills.map((s) => skillName(tt, s)).join(', ') }),
          actions: [{ label: 'va.a.pathway', target: 'pathway' }], follow: ['va.f.time', 'va.f.week'],
        };
      }
      case 'careers': {
        if (!matches.length) return { ...base, text: tt('va.r.careers.none') };
        return {
          ...base, ctx: { ...base.ctx, role: matches[0].roleSlug },
          text: tt('va.r.careers', { list: list(matches.slice(0, 3).map((m) => `${roleTitle(tt, m.roleSlug)} (${m.score}%)`)) }),
          actions: [{ label: 'va.a.matches', target: 'matches' }], follow: ['va.f.why', 'va.f.gaps'],
        };
      }
      case 'why-match': {
        const match = leadMatch(c.role);
        if (!match) return { ...base, text: tt('va.r.careers.none') };
        return {
          ...base, ctx: { ...base.ctx, role: match.roleSlug },
          text: explainMatch(tt, match),
          actions: [{ label: 'va.a.ai', ai: true }, { label: 'va.a.matches', target: 'matches' }],
          follow: ['va.f.gaps', 'va.ex.next'],
        };
      }
      case 'gaps': {
        const match = leadMatch(c.role);
        if (!match) return { ...base, text: tt('va.r.careers.none') };
        const role = roleTitle(tt, match.roleSlug);
        const gaps = match.gap.slice(0, 3);
        return {
          ...base, ctx: { ...base.ctx, role: match.roleSlug, skill: gaps[0]?.skill ?? c.skill },
          text: gaps.length
            ? tt('va.r.gaps', { role, list: list(gaps.map((g) => tt('va.r.gaps.item', { skill: skillName(tt, g.skill), have: g.userLevel, need: g.minLevel }))) })
            : tt('va.r.gaps.none', { role }),
          actions: [{ label: 'va.a.radar', target: 'overview' }], follow: gaps.length ? ['va.f.learn', 'va.f.time'] : ['va.f.status'],
        };
      }
      case 'time': {
        const match = leadMatch(c.role);
        if (!chosenRole || !match) return { ...base, text: tt('va.r.next.none'), actions: [{ label: 'va.a.matches', target: 'matches' }] };
        const left = remaining(match);
        if (!left.length) return { ...base, text: tt('va.r.time.done'), follow: ['va.f.status'] };
        const hours = left.reduce((n, node) => n + (COURSE_MAP[node.courseSlug]?.totalHours ?? 0), 0);
        const pace = planningHours(profile.budget);
        const capped = profile.budget > PLAN_PACE_CAP ? ` ${tt('va.r.time.cap', { h: profile.budget, cap: PLAN_PACE_CAP })}` : '';
        return {
          ...base,
          text: `${tt('va.r.time', { n: left.length, hours, pace, weeks: Math.max(1, Math.ceil(hours / pace)) })}${capped}`,
          actions: [{ label: 'va.a.pathway', target: 'pathway' }], follow: ['va.f.week'],
        };
      }
      case 'week-plan': {
        const match = leadMatch(c.role);
        if (!chosenRole || !match) return { ...base, text: tt('va.r.next.none'), actions: [{ label: 'va.a.matches', target: 'matches' }] };
        const node = remaining(match)[0];
        if (!node) return { ...base, text: tt('va.r.next.done', { role: roleTitle(tt, match.roleSlug) }), actions: [{ label: 'va.a.harada', target: 'harada' }] };
        const tasks = profile.completedRoadmapTasks ?? [];
        const open = match.gap.slice(0, 5).find((g) => !tasks.includes(`${match.roleSlug}:${g.skill}`));
        const pace = planningHours(profile.budget);
        return {
          ...base, ctx: { ...base.ctx, role: match.roleSlug, skill: node.skill },
          text: tt('va.r.week', {
            h: pace, course: courseTitle(tt, node.courseSlug),
            weeks: Math.max(1, Math.ceil((COURSE_MAP[node.courseSlug]?.totalHours ?? 0) / pace)),
            milestone: open ? tt('va.r.week.milestone', { skill: skillName(tt, open.skill) }) : '',
          }),
          actions: [{ label: 'va.a.pathway', target: 'pathway' }, { label: 'va.a.harada', target: 'harada' }], follow: ['va.f.status'],
        };
      }
      case 'status': {
        const match = chosenRole ? leadMatch() : undefined;
        return {
          ...base,
          text: tt('va.r.status', {
            courses: completedCourses.length, levels: skillUpdates.length, days: activeDays.length,
            badges: Object.keys(badges).length, total: ALL_BADGES.length,
            fit: match ? tt('va.r.status.fit', { role: roleTitle(tt, match.roleSlug), n: Math.round(match.skillReadiness) }) : '',
          }).trim(),
          actions: [{ label: 'va.a.progress', target: 'progress' }], follow: ['va.ex.next', 'va.f.week'],
        };
      }
      case 'explain-radar': {
        const rose = computeWindRose(profile, momentumMap, chosenRole);
        return {
          ...base, ctx: { ...base.ctx, skill: rose.priorities[0]?.slug ?? c.skill },
          text: tt('va.r.radar', { gaps: rose.priorities.length ? rose.priorities.map((p) => skillName(tt, p.slug)).join(', ') : tt('va.r.noGaps') }),
          actions: [{ label: 'va.a.radar', target: 'overview' }], follow: ['va.f.learn', 'va.f.gaps'],
        };
      }
      case 'read': {
        const lead = leadMatch() ?? matches[0];
        const rose = computeWindRose(profile, momentumMap, chosenRole);
        const course = lead && chosenRole ? remaining(lead)[0] : undefined;
        return {
          ...base,
          text: tt('va.r.read', {
            role: lead ? roleTitle(tt, lead.roleSlug) : tt('va.r.none'), fit: lead?.score ?? 0,
            gaps: rose.priorities.length ? rose.priorities.map((p) => skillName(tt, p.slug)).join(', ') : tt('va.r.noGaps'),
            course: course ? courseTitle(tt, course.courseSlug) : tt('va.r.none'),
          }),
          follow: ['va.f.why', 'va.f.week'],
        };
      }
      case 'search': {
        const found = searchAll(intent.query, tt);
        const jobs = /job|vacanc|vakans|ish o'rni|ваканс|работ/.test(raw.toLowerCase());
        if (!found.length) return { ...base, text: tt('va.r.search.none', { q: intent.query }) };
        return { ...base, text: `${tt('va.r.search', { list: list(found) })}${jobs ? ` ${tt('va.r.search.jobs')}` : ''}` };
      }
      case 'more': {
        const next: Intent | null = c.last === 'learn-skill' ? { kind: 'next-learning' }
          : c.last === 'explain-skill' || c.last === 'explain-radar' ? { kind: 'learn-skill', skill: c.skill ?? null }
          : c.last === 'careers' || c.last === 'read' ? { kind: 'why-match' }
            : c.last === 'why-match' ? { kind: 'gaps' }
              : c.last === 'gaps' ? { kind: 'learn-skill', skill: c.skill ?? null }
                : c.last === 'next-learning' ? { kind: 'time' }
                  : c.last === 'time' ? { kind: 'week-plan' } : null;
        return next ? compute(next, raw, c, tt) : { ...base, text: tt('va.r.help'), follow: ['va.ex.next', 'va.f.why'] };
      }
      default: {
        // Last resort before "I didn't understand": look the words up in the catalogue.
        const found = searchAll(raw, tt);
        if (found.length) return { ...base, text: tt('va.r.found', { q: raw.trim(), list: list(found) }) };
        return { ...base, text: tt('va.r.unknown'), follow: ['va.ex.next', 'va.f.why', 'va.f.status'] };
      }
    }
  }

  function searchAll(query: string, tt: Translate) {
    const items = [
      ...ROLES.map((r) => ({ item: `${roleTitle(tt, r.slug)} (${tt('va.type.role')})`, text: `${r.title} ${roleTitle(t, r.slug)} ${r.category} ${r.skills.map((s) => `${SKILL_MAP[s.skill]?.name ?? ''} ${skillName(t, s.skill)}`).join(' ')} job work career profession ish kasb работа профессия` })),
      ...COURSES.map((cs) => ({ item: `${courseTitle(tt, cs.slug)} — ${courseProvider(tt, cs.slug)} (${tt('va.type.course')})`, text: `${cs.title} ${courseTitle(t, cs.slug)} ${cs.provider} ${cs.skills.map((s) => `${SKILL_MAP[s]?.name ?? ''} ${skillName(t, s)}`).join(' ')} course courses kurs курс курсы` })),
      ...LEARNING_SOURCES.map((s) => ({ item: `${tt(`ls.${s.id}.name`)} — ${s.provider} (${tt('va.type.source')})`, text: `${s.name} ${t(`ls.${s.id}.name`)} ${s.provider} ${t(`ls.${s.id}.d`)} ${s.skills.map((k) => `${SKILL_MAP[k]?.name ?? ''} ${skillName(t, k)} ${SKILL_MAP[k]?.aliases.join(' ') ?? ''}`).join(' ')} course courses learn study kurs o'qish курс курсы учеба` })),
      ...INCLUSIVE_ENTRIES.map((e) => ({ item: `${tt(`inc.${e.id}.name`)} (${tt('va.type.inclusive')})`, text: `${e.name} ${t(`inc.${e.id}.name`)} ${e.publisher} ${t(`inc.${e.id}.d`)} inclusive accessible disability inklyuziv nogiron инклюзив инвалид` })),
    ];
    return searchCatalogue(query, items, 5);
  }

  function push(...items: Omit<Message, 'id'>[]) {
    const added = items.map((m) => ({ ...m, id: nextId++ }));
    setMessages((prev) => [...prev, ...added].slice(-30));
    return added;
  }

  /** Runs a hands-free command and returns the spoken confirmation. */
  function runCommand(cmd: Command, tt: Translate): string {
    switch (cmd.type) {
      case 'tab': go(cmd.tab as NavTarget); return tt('va.cmd.tab', { tab: tt(TARGET_LABEL[cmd.tab as NavTarget]) });
      case 'theme': switchTheme(() => setTheme(cmd.value)); return tt(`va.cmd.theme.${cmd.value}`);
      case 'a11y': {
        if (cmd.setting === 'largeText') setA11y({ textScale: cmd.value ? 'larger' : 'normal' });
        else setA11y({ [cmd.setting]: cmd.value });
        return tt(cmd.value ? 'va.cmd.on' : 'va.cmd.off', { setting: tt(`va.set.${cmd.setting}`) });
      }
      case 'filter': {
        focusCatalog(cmd.query, cmd.view, cmd.topic);
        go('pathway');
        const what = [cmd.view !== 'all' ? tt(`cat.view.${cmd.view}`) : '', cmd.topic ? tt(`cat.topic.${cmd.topic}`) : '', cmd.query ? `“${cmd.query}”` : ''].filter(Boolean).join(' · ');
        return tt('va.cmd.filter', { what: what || tt('cat.view.all') });
      }
      case 'reflect': addReflection(cmd.text); return tt('va.cmd.reflect');
      case 'summarize': return screenSummary(tt);
      case 'stop': stopSpeaking(); setSpeaking(false); return tt('va.cmd.stop');
    }
  }

  function screenSummary(tt: Translate): string {
    const { place, items } = readScreen(a11y.simpleAudio ? 3 : 6);
    const parts = [tt('va.screen.place', { place: place || tt('va.r.none') })];
    parts.push(items.length ? tt('va.screen.items', { list: items.join('; ') }) : tt('va.screen.empty'));
    return parts.join(' ');
  }

  function agentContext() {
    const match = chosenRole ? leadMatch() : undefined;
    const next = match ? remaining(match)[0] : undefined;
    const { place, items } = readScreen(6);
    return {
      view, tab: dashTab,
      role: match ? roleTitle(t, match.roleSlug) : undefined,
      readiness: match ? Math.round(match.skillReadiness) : undefined,
      gaps: (match?.gap ?? []).slice(0, 5).map((g) => `${skillName(t, g.skill)} (${g.userLevel}/${g.minLevel})`),
      coursesDone: completedCourses.length,
      nextStep: next ? courseTitle(t, next.courseSlug) : undefined,
      paths: learningPaths.slice(0, 12).map((p) => ({ name: p.name, done: p.items.filter((i) => i.status === 'done').length, total: p.items.length })),
      screen: [place, ...items].join(' | ').slice(0, 1200),
    };
  }

  /** Open questions go to the server's AI agent; it may also propose safe UI actions. */
  async function askAgent(question: string, fallback: Reply) {
    const [loading] = push({ from: 'assistant', text: t('va.ai.thinking'), status: 'loading' });
    const replace = (patch: Partial<Message>) => setMessages((prev) => prev.map((m) => (m.id === loading.id ? { ...m, ...patch } : m)));
    try {
      const history = messages.filter((m) => !m.status).slice(-6).map((m) => ({ from: m.from, text: m.text.slice(0, 800) }));
      const res = await fetch('/api/assistant', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang, message: question, history, context: agentContext() }),
      });
      if (!res.ok) throw new Error(String(res.status));
      agentUp.current = true;
      const json = (await res.json()) as { reply: string; actions?: Command[] };
      const done = (json.actions ?? []).map((a) => runCommand(a as Command, t));
      const text = [json.reply, ...done].join(' ');
      replace({ text, status: undefined, note: t('va.ai.agentNote') });
      say({ id: loading.id, from: 'assistant', text });
    } catch {
      agentUp.current = false;
      // No AI model available: answer from SkillCast's own data instead.
      replace({ text: fallback.text, status: undefined, actions: fallback.actions, follow: fallback.follow });
      say({ id: loading.id, from: 'assistant', text: fallback.text });
    }
  }

  function handle(text: string) {
    const clean = (lang === 'uz' ? uzCyrillicToLatin(text) : text).trim();
    if (!clean) return;
    if (a11y.handsFree && supported.mic) afterSpeech.current = () => { if (usePanels.getState().voiceOpen) toggleMic(); };
    const cmd = parseCommand(clean);
    if (cmd) {
      const reply = runCommand(cmd, t);
      const [, answerMsg] = push({ from: 'user', text: clean }, { from: 'assistant', text: reply });
      if (cmd.type !== 'stop') say(answerMsg); else afterSpeech.current = null;
      return;
    }
    const intent = parseIntent(clean, skillIndex);
    const reply = compute(intent, clean, ctx, t);
    setCtx(reply.ctx);
    // Open questions go to the AI agent while it is available; known questions
    // keep their exact, data-based answers when it is not.
    const openQuestion = /\?\s*$/.test(clean) || clean.split(/\s+/).length >= 7;
    if (intent.kind === 'unknown' || (openQuestion && agentUp.current !== false && intent.kind !== 'navigate')) {
      push({ from: 'user', text: clean });
      void askAgent(clean, reply);
      return;
    }
    if (reply.nav) go(reply.nav);
    if (reply.a11y) { setVoiceOpen(false); setA11yOpen(true); }
    const [, answerMsg] = push(
      { from: 'user', text: clean },
      { from: 'assistant', text: reply.text, actions: reply.actions, follow: reply.follow, intent, ctx, raw: clean },
    );
    say(answerMsg);
  }

  async function explainWithAi(roleSlug?: string) {
    const match = leadMatch(roleSlug);
    if (!match) return;
    const [loading] = push({ from: 'assistant', text: t('va.ai.loading'), status: 'loading' });
    const replace = (patch: Partial<Message>) => setMessages((prev) => prev.map((m) => (m.id === loading.id ? { ...m, ...patch } : m)));
    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleSlug: match.roleSlug, score: match.score,
          factors: match.factors.map((f) => ({ label: f.label, value: f.value })),
          gap: match.gap.slice(0, 5).map((g) => ({ skill: g.skill, userLevel: g.userLevel, minLevel: g.minLevel, momentum: momentumMap[g.skill] ?? g.momentum })),
          scenario, lang,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const json = (await res.json()) as { narration?: string; fallback?: boolean };
      if (!json.narration) throw new Error('empty');
      // The server's no-LLM template is English only; elsewhere show the
      // same facts in the learner's language.
      const text = json.fallback && lang !== 'en' ? explainMatch(t, match) : json.narration;
      replace({ text, status: undefined, note: json.fallback ? t('va.ai.fallback') : t('va.ai.note') });
    } catch {
      replace({ text: t('va.ai.error'), status: 'error', retry: () => { setMessages((prev) => prev.filter((m) => m.id !== loading.id)); void explainWithAi(roleSlug); } });
    }
  }

  function runAction(a: Action, msg: Message) {
    if (a.ai) { void explainWithAi(msg.ctx?.role ?? ctx.role); return; }
    if (a.target) go(a.target);
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
    setInterim('');
    stopSpeaking();
    setSpeaking(false);
    afterSpeech.current = null;
  }, [voiceOpen]);

  // Space bar: talk, or stop speaking — when focus is not in a text field.
  const spaceKey = useCallback((e: KeyboardEvent) => {
    if (e.code !== 'Space' || e.repeat) return;
    const el = e.target as HTMLElement | null;
    if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(el.tagName) || el.getAttribute('role') === 'switch' || el.getAttribute('role') === 'radio')) return;
    e.preventDefault();
    if (speaking) { stopSpeaking(); setSpeaking(false); return; }
    toggleMic();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speaking, listening, lang, recLang]);
  useEffect(() => {
    if (!voiceOpen) return undefined;
    window.addEventListener('keydown', spaceKey);
    return () => window.removeEventListener('keydown', spaceKey);
  }, [voiceOpen, spaceKey]);

  function toggleMic(langOverride?: string) {
    if (listening) { recognitionRef.current?.stop(); return; }
    const Ctor = recognitionCtor();
    if (!Ctor) { setMicNote({ text: t('va.mic.unsupported') }); return; }
    const rec = new Ctor();
    const useLang = langOverride ?? recLang ?? SPEECH_LANG[lang];
    rec.lang = useLang;
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      const last = e.results[e.results.length - 1];
      const text = last?.[0]?.transcript ?? '';
      if (last?.isFinal === false) { setInterim(text); return; }
      setInterim('');
      if (text) handle(text);
    };
    rec.onerror = (e) => {
      setInterim('');
      if (e.error === 'aborted') return;
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') setMicNote({ text: t('va.mic.denied') });
      else if (e.error === 'no-speech') setMicNote({ text: t('va.mic.noSpeech'), retry: true });
      else if (e.error === 'network') setMicNote({ text: t('va.mic.network') });
      else if (e.error === 'language-not-supported') {
        setMicNote({ text: t('va.mic.lang', { lang: t(LANG_NAME_KEY[lang]) }), useRu: lang !== 'ru' });
      } else setMicNote({ text: t('va.mic.error'), retry: true });
    };
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    setMicNote(null);
    setListening(true);
    try { rec.start(); } catch { setListening(false); setMicNote({ text: t('va.mic.error'), retry: true }); }
  }

  const submit = (e: FormEvent) => { e.preventDefault(); handle(input); setInput(''); };
  // Suggestions follow the screen the learner is on; any other question can be typed or spoken.
  const TAB_EXAMPLES: Record<string, string[]> = {
    overview: ['va.f.why', 'va.f.status'], matches: ['va.f.why', 'va.f.gaps'], radar: ['va.ex.radar', 'va.f.gaps'],
    pathway: ['va.ex.freeAi', 'va.ex.tailoring'], harada: ['va.f.week', 'va.ex.next'], progress: ['va.ex.reflect', 'va.f.status'],
    sdg: ['va.ex.open', 'va.ex.next'], demand: ['va.ex.open', 'va.f.gaps'],
  };
  const examples = [...new Set(['va.ex.screen', 'va.ex.next', ...(TAB_EXAMPLES[dashTab] ?? []), 'va.ex.contrast', 'va.ex.inclusive'])].slice(0, 6);
  const lastAssistant = [...messages].reverse().find((m) => m.from === 'assistant' && !m.status);
  const altVoices = (['ru', 'en', 'uz'] as Lang[]).filter((l) => l !== lang && voiceFor(l));

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
            {messages.map((m) => (
              <li key={m.id} className={`rounded-xl px-3 py-2 text-sm leading-relaxed ${m.from === 'user' ? 'ml-8 bg-blue-600 text-white' : `mr-4 border ${m.status === 'error' ? 'border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100' : 'bg-muted/50'}`}`}>
                <span className="sr-only">{m.from === 'user' ? t('va.you') : t('va.assistant')}: </span>
                {m.status === 'loading' && <Loader2 className="mr-1.5 inline h-4 w-4 animate-spin align-[-3px]" aria-hidden />}
                {m.text}
                {m.note && <span className="mt-1 block text-xs text-muted-foreground">{m.note}</span>}
                {m.status === 'error' && m.retry && (
                  <Button size="sm" variant="outline" className="mt-2 h-7 gap-1 text-xs" onClick={m.retry}><RotateCcw className="h-3 w-3" aria-hidden />{t('va.retry')}</Button>
                )}
                {m.actions && m.actions.length > 0 && (
                  <span className="mt-2 flex flex-wrap gap-1.5">
                    {m.actions.map((a) => (
                      <Button key={a.label} size="sm" variant={a.ai ? 'outline' : 'secondary'} className="h-7 gap-1 text-xs" onClick={() => runAction(a, m)}>
                        {a.ai ? <Sparkles className="h-3 w-3" aria-hidden /> : <ArrowRight className="h-3 w-3" aria-hidden />}{t(a.label)}
                      </Button>
                    ))}
                  </span>
                )}
              </li>
            ))}
          </ol>
          {lastAssistant?.follow && lastAssistant.follow.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">{t('va.follow')}</p>
              <ul className="mt-1.5 flex flex-wrap gap-2">
                {lastAssistant.follow.map((k) => (
                  <li key={k}><button type="button" onClick={() => handle(t(k))} className="rounded-full border px-3 py-1.5 text-left text-xs hover:bg-muted">{t(k)}</button></li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-3 border-t p-4">
          {micNote && (
            <div role="status" className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              {micNote.text}
              {(micNote.retry || micNote.useRu) && (
                <span className="mt-1.5 flex flex-wrap gap-1.5">
                  {micNote.retry && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => toggleMic()}>{t('va.retry')}</Button>}
                  {micNote.useRu && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setRecLang('ru-RU'); toggleMic('ru-RU'); }}>{t('va.mic.useRu')}</Button>}
                </span>
              )}
            </div>
          )}
          {voiceNote && (
            <div role="status" className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              {t('va.noVoice', { lang: t(LANG_NAME_KEY[voiceNote.lang]) })}
              {altVoices.length > 0 && (
                <span className="mt-1.5 flex flex-wrap gap-1.5">
                  {altVoices.map((l) => (
                    <Button key={l} size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => readIn(l, voiceNote.msg)}>
                      <Volume2 className="h-3 w-3" aria-hidden />{t('va.voice.alt', { lang: t(LANG_NAME_KEY[l]) })}
                    </Button>
                  ))}
                </span>
              )}
            </div>
          )}
          {listening && interim && <p className="text-xs text-muted-foreground" aria-live="polite">{t('va.mic.heard', { text: interim })}</p>}
          <form onSubmit={submit} className="flex items-center gap-2">
            <Button
              type="button"
              size="icon"
              variant={listening ? 'destructive' : 'outline'}
              className="h-11 w-11 shrink-0"
              onClick={() => toggleMic()}
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
              <Switch checked={(assistantSpeak || a11y.narrate) && supported.tts} onCheckedChange={setAssistantSpeak} disabled={!supported.tts || a11y.narrate} />
              <Volume2 className="h-4 w-4" aria-hidden /> {supported.tts ? t('va.speak') : t('va.noSpeech')}
            </label>
            <div className="flex items-center gap-1">
              <Button variant={speaking ? 'destructive' : 'ghost'} size="sm" className="min-h-11 gap-1 sm:min-h-8" disabled={!speaking} onClick={() => { stopSpeaking(); setSpeaking(false); }}>
                <Square className="h-3.5 w-3.5" aria-hidden /> {t('va.stop')}
              </Button>
              <Button variant="ghost" size="sm" className="min-h-11 gap-1 sm:min-h-8" aria-expanded={showSettings} aria-controls="va-settings" onClick={() => setShowSettings(!showSettings)}>
                <Settings2 className="h-3.5 w-3.5" aria-hidden />{t('va.voice.title')}<ChevronDown className={`h-3.5 w-3.5 transition-transform ${showSettings ? 'rotate-180' : ''}`} aria-hidden />
              </Button>
            </div>
          </div>
          {showSettings && (
            <div id="va-settings" className="space-y-3 rounded-lg border p-3 text-sm">
              <label className="grid gap-1 text-xs font-medium">
                {t('va.voice.pick')}
                <select value={voice.name} onChange={(e) => setVoice({ name: e.target.value })} className="h-11 rounded-md border bg-background px-2 text-sm sm:h-9">
                  <option value="auto">{t('va.voice.auto')}</option>
                  {NEURAL_VOICES[lang === 'ru' || lang === 'en' ? lang : 'uz'].map((v) => <option key={v.id} value={v.id}>{v.label} · {t('va.voice.natural')}</option>)}
                  <option value="device">{t('va.voice.device')}</option>
                </select>
              </label>
              {([['rate', [0.85, 1, 1.2], 'va.speed'], ['pitch', [0.9, 1, 1.1], 'va.pitch']] as const).map(([key, values, label]) => (
                <fieldset key={key}>
                  <legend className="text-xs font-medium">{t(label)}</legend>
                  <div role="radiogroup" aria-label={t(label)} className="mt-1 grid grid-cols-3 gap-1">
                    {values.map((v, i) => (
                      <button key={v} type="button" role="radio" aria-checked={voice[key] === v} onClick={() => setVoice({ [key]: v })}
                        className={`min-h-11 rounded-md border px-2 text-xs sm:min-h-8 ${voice[key] === v ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
                        {t(`${label}.${i}`)}
                      </button>
                    ))}
                  </div>
                </fieldset>
              ))}
              <Button variant="outline" size="sm" className="min-h-11 w-full gap-1.5 sm:min-h-9" onClick={() => void speakText(t('va.voice.sample'), lang)}>
                <Volume2 className="h-4 w-4" aria-hidden />{t('va.voice.test')}
              </Button>
              <p className="text-xs text-muted-foreground">
                {engine === 'neural' ? t('va.engine.neural') : engine === 'device' ? t('va.engine.device') : engine === 'none' ? t('va.engine.none') : t('va.engine.info')}
              </p>
            </div>
          )}
          <p className="text-xs text-muted-foreground">{t('va.space')}</p>
          {!supported.mic && <p className="text-xs text-muted-foreground">{t('va.mic.unsupported')}</p>}
        </div>
      </SheetContent>
    </Sheet>
  );
}


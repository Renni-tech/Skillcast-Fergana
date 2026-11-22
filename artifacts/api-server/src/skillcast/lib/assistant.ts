// ─── Context-aware assistant agent ─────────────────────────────────────────
// The browser sends the learner's question plus a compact context (language,
// active tab, chosen pathway, readiness, top gaps, progress, learning paths,
// a summary of the screen). The LLM answers in the learner's language and
// may propose UI actions from a fixed allow-list; anything else is dropped.
// Without an LLM (no RUNPOD_API_KEY or an error) the route returns 503 and
// the browser answers with its deterministic assistant instead.

import { z } from 'zod';
import { runpodChat, RUNPOD_MODEL } from './runpod';

export const TABS = ['overview', 'matches', 'radar', 'pathway', 'harada', 'progress', 'sdg', 'demand'] as const;

export const AssistantBody = z.object({
  lang: z.enum(['uz', 'ru', 'en']),
  message: z.string().trim().min(1).max(600),
  history: z.array(z.object({ from: z.enum(['user', 'assistant']), text: z.string().max(800) })).max(8).default([]),
  context: z.object({
    view: z.string().max(40).optional(),
    tab: z.string().max(40).optional(),
    role: z.string().max(120).optional(),
    readiness: z.number().min(0).max(100).optional(),
    gaps: z.array(z.string().max(120)).max(8).default([]),
    coursesDone: z.number().int().min(0).max(500).default(0),
    nextStep: z.string().max(200).optional(),
    paths: z.array(z.object({ name: z.string().max(60), done: z.number(), total: z.number() })).max(12).default([]),
    screen: z.string().max(1200).optional(),
  }).default({ gaps: [], coursesDone: 0, paths: [] }),
});
export type AssistantRequest = z.infer<typeof AssistantBody>;

export const AssistantAction = z.discriminatedUnion('type', [
  z.object({ type: z.literal('tab'), tab: z.enum(TABS) }),
  z.object({ type: z.literal('theme'), value: z.enum(['dark', 'light']) }),
  z.object({ type: z.literal('a11y'), setting: z.enum(['highContrast', 'reduceMotion', 'readingSpacing', 'largeText']), value: z.boolean() }),
  z.object({ type: z.literal('filter'), query: z.string().max(60).default(''), view: z.enum(['all', 'ai-digital', 'practical', 'free', 'state', 'upcoming']).default('all') }),
  z.object({ type: z.literal('summarize') }),
]);
export type AssistantActionT = z.infer<typeof AssistantAction>;

const LANG_NAME = { uz: 'Uzbek (Latin script)', ru: 'Russian', en: 'English' } as const;

export function systemPrompt(lang: AssistantRequest['lang']): string {
  return [
    'You are the SkillCast Fergana learning companion for people in Uzbekistan, including learners with visual, motor or cognitive disabilities.',
    `Reply in ${LANG_NAME[lang]}, in 1-4 short, warm, plain sentences. No markdown, no lists, no URLs, no emojis.`,
    'Use only the facts in CONTEXT. Never invent courses, prices, dates, jobs, salaries or statistics. If you do not know, say so and suggest which tab to open.',
    'Forecasts are estimates; the learner decides.',
    'You may propose UI actions. Allowed: {"type":"tab","tab":one of overview|matches|radar|pathway|harada|progress|sdg|demand}, {"type":"theme","value":"dark"|"light"}, {"type":"a11y","setting":"highContrast"|"reduceMotion"|"readingSpacing"|"largeText","value":true|false}, {"type":"filter","query":"words","view":"all"|"ai-digital"|"practical"|"free"|"state"|"upcoming"}, {"type":"summarize"}.',
    'Tabs: overview=Overview, matches=Learning & career pathways, radar=Future Skills Radar / Wind Rose, pathway=What to learn and where (course catalogue), harada=Harada roadmap, progress=Progress and weekly reflection, sdg=Sustainable Development Goals impact, demand=Demand statistics.',
    'Return only a JSON object: {"reply": string, "actions": array}.',
  ].join('\n');
}

export function parseAgentOutput(raw: string): { reply: string; actions: AssistantActionT[] } | null {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    const json = JSON.parse(raw.slice(start, end + 1)) as { reply?: unknown; actions?: unknown };
    if (typeof json.reply !== 'string' || !json.reply.trim()) return null;
    const actions = Array.isArray(json.actions)
      ? json.actions.flatMap((a) => { const p = AssistantAction.safeParse(a); return p.success ? [p.data] : []; }).slice(0, 3)
      : [];
    return { reply: json.reply.trim().slice(0, 900), actions };
  } catch {
    return null;
  }
}

export async function askAgent(req: AssistantRequest, chat = runpodChat): Promise<{ reply: string; actions: AssistantActionT[]; model: string } | null> {
  const raw = await chat({
    messages: [
      { role: 'system', content: systemPrompt(req.lang) },
      { role: 'user', content: `CONTEXT: ${JSON.stringify(req.context)}` },
      ...req.history.map((h) => ({ role: h.from === 'user' ? 'user' as const : 'assistant' as const, content: h.text })),
      { role: 'user', content: req.message },
    ],
    maxTokens: 400,
    temperature: 0.4,
    responseFormat: { type: 'json_object' },
  });
  if (!raw) return null;
  const out = parseAgentOutput(raw);
  return out ? { ...out, model: RUNPOD_MODEL } : null;
}

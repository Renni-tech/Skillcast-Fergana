// ─── Neural text-to-speech for the assistant ───────────────────────────────
// Providers, tried in this order:
//   1. OpenAI TTS when OPENAI_API_KEY is set (multilingual voices).
//   2. Google Cloud TTS when GOOGLE_TTS_API_KEY is set (language voice).
//   3. Microsoft Edge neural voices via the free read-aloud service
//      (msedge-tts): uz-UZ-MadinaNeural / SardorNeural, ru-RU-SvetlanaNeural
//      / DmitryNeural, en-US-AvaNeural / AndrewNeural. No key needed, but the
//      server must reach speech.platform.bing.com.
// TTS_PROVIDER=off disables the route. When every provider fails the route
// answers 503 and the browser falls back to its own speechSynthesis.

import { createHash } from 'node:crypto';
import { z } from 'zod';

export const TTS_VOICES = {
  uz: ['uz-UZ-MadinaNeural', 'uz-UZ-SardorNeural'],
  ru: ['ru-RU-SvetlanaNeural', 'ru-RU-DmitryNeural'],
  en: ['en-US-AvaNeural', 'en-US-AndrewNeural'],
} as const;
const ALL_VOICES: string[] = Object.values(TTS_VOICES).flat();

export const TtsBody = z.object({
  text: z.string().trim().min(1).max(1500),
  lang: z.enum(['uz', 'ru', 'en']),
  voice: z.string().refine((v) => ALL_VOICES.includes(v), 'unknown voice').optional(),
  rate: z.number().min(0.5).max(1.5).default(1),
  pitch: z.number().min(0.8).max(1.2).default(1),
});
export type TtsRequest = z.infer<typeof TtsBody>;

export interface TtsResult { audio: Buffer; contentType: string; provider: string; voice: string }

/** Default voice for a language, or the requested one if it belongs to that language. */
export function pickVoice(lang: TtsRequest['lang'], voice?: string): string {
  const list = TTS_VOICES[lang] as readonly string[];
  return voice && list.includes(voice) ? voice : list[0];
}

const pct = (v: number) => `${v >= 1 ? '+' : ''}${Math.round((v - 1) * 100)}%`;

// Small in-memory cache: the same answer is often spoken twice.
const cache = new Map<string, TtsResult>();
const CACHE_MAX = 60;
const keyFor = (r: TtsRequest, voice: string) => createHash('sha1').update(`${voice}|${r.rate}|${r.pitch}|${r.text}`).digest('hex');

type Fetch = typeof fetch;

async function viaOpenAi(r: TtsRequest, f: Fetch): Promise<TtsResult | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  // OpenAI voices are multilingual; pick a warm female/male pair.
  const voice = r.voice?.includes('Sardor') || r.voice?.includes('Dmitry') || r.voice?.includes('Andrew') ? 'onyx' : 'nova';
  const res = await f('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: process.env.OPENAI_TTS_MODEL ?? 'tts-1', voice, input: r.text, speed: r.rate, response_format: 'mp3' }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`openai ${res.status}`);
  return { audio: Buffer.from(await res.arrayBuffer()), contentType: 'audio/mpeg', provider: 'openai', voice };
}

async function viaGoogle(r: TtsRequest, f: Fetch): Promise<TtsResult | null> {
  const key = process.env.GOOGLE_TTS_API_KEY;
  if (!key) return null;
  const languageCode = { uz: 'uz-UZ', ru: 'ru-RU', en: 'en-US' }[r.lang];
  const res = await f(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: { text: r.text },
      voice: { languageCode },
      audioConfig: { audioEncoding: 'MP3', speakingRate: r.rate, pitch: Math.round((r.pitch - 1) * 20) },
    }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`google ${res.status}`);
  const json = (await res.json()) as { audioContent?: string };
  if (!json.audioContent) throw new Error('google empty');
  return { audio: Buffer.from(json.audioContent, 'base64'), contentType: 'audio/mpeg', provider: 'google', voice: languageCode };
}

async function viaEdge(r: TtsRequest, voice: string): Promise<TtsResult> {
  const { MsEdgeTTS, OUTPUT_FORMAT } = await import('msedge-tts');
  const tts = new MsEdgeTTS();
  try {
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    const { audioStream } = tts.toStream(escapeXml(r.text), { rate: pct(r.rate), pitch: pct(r.pitch) });
    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('edge timeout')), 20_000);
      audioStream.on('data', (c: Buffer) => chunks.push(c));
      audioStream.on('end', () => { clearTimeout(timer); resolve(); });
      audioStream.on('error', (e: Error) => { clearTimeout(timer); reject(e); });
    });
    const audio = Buffer.concat(chunks);
    if (!audio.length) throw new Error('edge empty');
    return { audio, contentType: 'audio/mpeg', provider: 'edge', voice };
  } finally {
    tts.close();
  }
}

export function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

export async function synthesize(r: TtsRequest, deps: { fetch?: Fetch; edge?: typeof viaEdge } = {}): Promise<TtsResult> {
  if (process.env.TTS_PROVIDER === 'off') throw new Error('tts disabled');
  const voice = pickVoice(r.lang, r.voice);
  const key = keyFor(r, voice);
  const hit = cache.get(key);
  if (hit) return hit;
  const f = deps.fetch ?? fetch;
  const errors: string[] = [];
  const order = (process.env.TTS_PROVIDER ?? '').split(',').filter(Boolean);
  const providers: Array<[string, () => Promise<TtsResult | null>]> = [
    ['openai', () => viaOpenAi(r, f)],
    ['google', () => viaGoogle(r, f)],
    ['edge', () => (deps.edge ?? viaEdge)(r, voice)],
  ];
  const sorted = order.length ? providers.filter(([n]) => order.includes(n)) : providers;
  for (const [name, run] of sorted) {
    try {
      const out = await run();
      if (!out) continue;
      if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value as string);
      cache.set(key, out);
      return out;
    } catch (e) {
      errors.push(`${name}: ${(e as Error).message}`);
    }
  }
  throw new Error(errors.join('; ') || 'no tts provider');
}

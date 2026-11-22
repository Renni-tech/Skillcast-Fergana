// ─── Speaking answers aloud ────────────────────────────────────────────────
// First choice: natural neural voices from /api/tts (Edge neural voices such
// as uz-UZ-MadinaNeural, or OpenAI/Google when the server has keys). If the
// service is unreachable, fall back to the browser's own speechSynthesis,
// configured with the best voice it has for the language. Browsers rarely
// ship an Uzbek voice; then the caller is told so instead of reading Uzbek
// with a wrong-language voice.

import { chunkForSpeech, normalizeForSpeech, type SpeechLang } from './speech-text';

export const NEURAL_VOICES: Record<'uz' | 'ru' | 'en', Array<{ id: string; label: string }>> = {
  uz: [{ id: 'uz-UZ-MadinaNeural', label: 'Madina' }, { id: 'uz-UZ-SardorNeural', label: 'Sardor' }],
  ru: [{ id: 'ru-RU-SvetlanaNeural', label: 'Светлана' }, { id: 'ru-RU-DmitryNeural', label: 'Дмитрий' }],
  en: [{ id: 'en-US-AvaNeural', label: 'Ava' }, { id: 'en-US-AndrewNeural', label: 'Andrew' }],
};
const BCP47: Record<'uz' | 'ru' | 'en', string> = { uz: 'uz-UZ', ru: 'ru-RU', en: 'en-US' };

export type SpeakResult = 'neural' | 'device' | 'none';
export interface SpeakOptions {
  lang: SpeechLang;
  /** Neural voice id, 'auto', or 'device' to force the browser voice. */
  voice: string;
  rate: number;
  pitch: number;
  onStart?: () => void;
  onEnd?: () => void;
}

let audio: HTMLAudioElement | null = null;
let generation = 0;
// After a failed neural request, use the device voice for a minute before retrying.
let neuralDownUntil = 0;

export function stopSpeaking(): void {
  generation++;
  if (audio) { audio.pause(); audio.src = ''; audio = null; }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
}

export function deviceVoiceFor(lang: 'uz' | 'ru' | 'en'): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  const prefix = lang;
  const fits = voices.filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith(prefix));
  // Prefer the most natural-sounding ones browsers offer.
  const score = (v: SpeechSynthesisVoice) => (/(natural|neural|online|premium|enhanced)/i.test(v.name) ? 2 : 0) + (v.lang === BCP47[lang] ? 1 : 0);
  return fits.sort((a, b) => score(b) - score(a))[0] ?? null;
}

async function playNeural(chunks: string[], base: 'uz' | 'ru' | 'en', o: SpeakOptions, gen: number): Promise<boolean> {
  if (Date.now() < neuralDownUntil || o.voice === 'device') return false;
  const voice = o.voice !== 'auto' && NEURAL_VOICES[base].some((v) => v.id === o.voice) ? o.voice : undefined;
  let started = false;
  for (const text of chunks) {
    if (gen !== generation) return true;
    let blob: Blob;
    try {
      const res = await fetch('/api/tts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lang: base, voice, rate: o.rate, pitch: o.pitch }),
      });
      if (!res.ok) throw new Error(String(res.status));
      blob = await res.blob();
    } catch {
      if (!started) { neuralDownUntil = Date.now() + 60_000; return false; }
      break;
    }
    if (gen !== generation) return true;
    const url = URL.createObjectURL(blob);
    audio = new Audio(url);
    if (!started) { started = true; o.onStart?.(); }
    await new Promise<void>((resolve) => {
      const done = () => { URL.revokeObjectURL(url); resolve(); };
      audio!.onended = done; audio!.onerror = done;
      audio!.play().catch(done);
    });
  }
  if (gen === generation) o.onEnd?.();
  return true;
}

function playDevice(text: string, base: 'uz' | 'ru' | 'en', o: SpeakOptions): boolean {
  const voice = deviceVoiceFor(base);
  if (!voice) return false;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.voice = voice; u.lang = voice.lang; u.rate = o.rate; u.pitch = o.pitch;
  u.onstart = () => o.onStart?.();
  u.onend = () => o.onEnd?.();
  u.onerror = () => o.onEnd?.();
  window.speechSynthesis.speak(u);
  return true;
}

/** Speaks text; resolves with the engine used, or 'none' if nothing could speak this language. */
export async function speak(raw: string, o: SpeakOptions): Promise<SpeakResult> {
  stopSpeaking();
  const gen = generation;
  const base: 'uz' | 'ru' | 'en' = o.lang === 'uz-cyrl' ? 'uz' : o.lang;
  const text = normalizeForSpeech(raw, o.lang);
  if (!text) return 'none';
  if (await playNeural(chunkForSpeech(text), base, o, gen)) return 'neural';
  if (gen !== generation) return 'none';
  return playDevice(text, base, o) ? 'device' : 'none';
}

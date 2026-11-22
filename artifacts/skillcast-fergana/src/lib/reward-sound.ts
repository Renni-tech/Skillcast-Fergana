// ─── Reward sounds, made in the browser with Web Audio ─────────────────────
// No audio files: every sound is synthesised, short (under 1.6 s) and quiet.
// Sounds play only when the learner has turned on "Reward sound", or when
// they press "Test sound". Each badge set has its own signature.

export type SoundKind =
  | 'first-steps' | 'career-explorer' | 'curious-mind' | 'consistent-learner'
  | 'skill-builder' | 'knowledge-seeker' | 'goal-achiever' | 'future-ready'
  | 'theme' | 'locked';

let ctx: AudioContext | null = null;
function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  ctx ??= new Ctx();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

interface Note { f: number; at: number; dur: number; type?: OscillatorType; gain?: number; to?: number; vibrato?: number }

function tone(ac: AudioContext, out: AudioNode, n: Note) {
  const t0 = ac.currentTime + n.at;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = n.type ?? 'sine';
  osc.frequency.setValueAtTime(n.f, t0);
  if (n.to) osc.frequency.exponentialRampToValueAtTime(n.to, t0 + n.dur);
  if (n.vibrato) {
    const lfo = ac.createOscillator(); const depth = ac.createGain();
    lfo.frequency.value = n.vibrato; depth.gain.value = n.f * 0.02;
    lfo.connect(depth).connect(osc.frequency); lfo.start(t0); lfo.stop(t0 + n.dur + 0.05);
  }
  const peak = n.gain ?? 0.18;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + n.dur);
  osc.connect(g).connect(out);
  osc.start(t0); osc.stop(t0 + n.dur + 0.05);
}

/** Filtered noise: footsteps in sand, a page turn, an arrow’s whoosh. */
function noise(ac: AudioContext, out: AudioNode, at: number, dur: number, freq: number, q = 1, gain = 0.12, sweepTo?: number) {
  const len = Math.max(1, Math.floor(ac.sampleRate * dur));
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource(); src.buffer = buf;
  const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = q;
  const t0 = ac.currentTime + at;
  bp.frequency.setValueAtTime(freq, t0);
  if (sweepTo) bp.frequency.exponentialRampToValueAtTime(sweepTo, t0 + dur);
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + Math.min(0.03, dur / 3));
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(bp).connect(g).connect(out);
  src.start(t0); src.stop(t0 + dur + 0.02);
}

const SPARKLE = (at: number): Note[] => [2093, 2637, 3136].map((f, i) => ({ f, at: at + i * 0.06, dur: 0.25, type: 'triangle', gain: 0.05 }));

/** Plays the signature sound for a badge set (or a theme unlock). Safe to call anywhere. */
export function playChime(kind: SoundKind, volume = 1): void {
  const ac = audio();
  if (!ac) return;
  try {
    const out = ac.createGain();
    out.gain.value = 0.9 * volume;
    out.connect(ac.destination);
    switch (kind) {
      case 'first-steps': // two soft steps in sand, then a sparkle
        noise(ac, out, 0, 0.12, 900, 0.8, 0.15); tone(ac, out, { f: 196, at: 0, dur: 0.18, gain: 0.12 });
        noise(ac, out, 0.22, 0.12, 1100, 0.8, 0.15); tone(ac, out, { f: 247, at: 0.22, dur: 0.18, gain: 0.12 });
        SPARKLE(0.45).forEach((n) => tone(ac, out, n));
        break;
      case 'career-explorer': // compass needle ticks, then a rising arpeggio
        [0, 0.07, 0.14].forEach((at) => noise(ac, out, at, 0.03, 4000, 6, 0.08));
        [523, 659, 784, 1047].forEach((f, i) => tone(ac, out, { f, at: 0.22 + i * 0.09, dur: 0.35, type: 'triangle', gain: 0.12 }));
        break;
      case 'curious-mind': // the lamp’s genie: a shimmering glide upwards
        tone(ac, out, { f: 392, to: 1568, at: 0, dur: 0.9, vibrato: 7, gain: 0.1 });
        SPARKLE(0.5).forEach((n) => tone(ac, out, n)); SPARKLE(0.75).forEach((n) => tone(ac, out, { ...n, f: n.f * 1.25 }));
        break;
      case 'consistent-learner': // a pentatonic bell bloom, like opening petals
        [523, 587, 659, 784, 880].forEach((f, i) => tone(ac, out, { f, at: i * 0.07, dur: 1.1, gain: 0.07 }));
        tone(ac, out, { f: 1047, at: 0.35, dur: 1.2, gain: 0.05, type: 'triangle' });
        break;
      case 'skill-builder': // a bright metallic ping from the workshop
        tone(ac, out, { f: 1320, at: 0, dur: 0.6, type: 'square', gain: 0.04 });
        tone(ac, out, { f: 1980, at: 0, dur: 0.8, gain: 0.08 }); tone(ac, out, { f: 2970, at: 0.02, dur: 0.5, gain: 0.04 });
        tone(ac, out, { f: 660, at: 0.18, dur: 0.6, type: 'triangle', gain: 0.1 });
        break;
      case 'knowledge-seeker': // a page turns, then a warm chord
        noise(ac, out, 0, 0.25, 2500, 0.6, 0.1, 6000);
        [440, 554, 659].forEach((f) => tone(ac, out, { f, at: 0.22, dur: 0.9, type: 'triangle', gain: 0.08 }));
        break;
      case 'goal-achiever': // the arrow’s whoosh, then the carpet lifts
        noise(ac, out, 0, 0.35, 800, 1.2, 0.14, 4000);
        tone(ac, out, { f: 587, at: 0.32, dur: 0.7, vibrato: 9, gain: 0.1 });
        tone(ac, out, { f: 880, at: 0.42, dur: 0.8, vibrato: 9, gain: 0.08 });
        break;
      case 'future-ready': // the Humo bird: a fluttering trill and a golden halo
        for (let i = 0; i < 8; i++) tone(ac, out, { f: i % 2 ? 1760 : 1568, at: i * 0.045, dur: 0.08, gain: 0.06 });
        [523, 659, 784, 1047].forEach((f) => tone(ac, out, { f, at: 0.4, dur: 1.2, gain: 0.05 }));
        SPARKLE(0.9).forEach((n) => tone(ac, out, n));
        break;
      case 'theme':
        [784, 988, 1175, 1568].forEach((f, i) => tone(ac, out, { f, at: i * 0.08, dur: 0.5, type: 'triangle', gain: 0.1 }));
        SPARKLE(0.35).forEach((n) => tone(ac, out, n));
        break;
      case 'locked':
        tone(ac, out, { f: 220, at: 0, dur: 0.15, type: 'triangle', gain: 0.06 });
        break;
    }
  } catch { /* sound is optional */ }
}

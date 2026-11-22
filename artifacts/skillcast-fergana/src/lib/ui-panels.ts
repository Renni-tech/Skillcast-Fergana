import { create } from 'zustand';

// Session-only UI state for the accessibility panel and the voice assistant,
// so any component (e.g. the Wind Rose) can open them. Not persisted.
interface PanelsState {
  a11yOpen: boolean;
  voiceOpen: boolean;
  /** A question to ask as soon as the assistant opens (e.g. "explain my Wind Rose"). */
  voicePrompt: string | null;
  /** Answer the prompt with this intent instead of guessing it from the words. */
  voiceIntent: 'explain-radar' | null;
  /** How many spokes the Wind Rose is showing now, so explanations match the chart. */
  roseCount: number;
  setRoseCount: (n: number) => void;
  setA11yOpen: (open: boolean) => void;
  openVoice: (prompt?: string, intent?: 'explain-radar') => void;
  setVoiceOpen: (open: boolean) => void;
  consumePrompt: () => { prompt: string; intent: 'explain-radar' | null } | null;
}

export const usePanels = create<PanelsState>()((set, get) => ({
  a11yOpen: false,
  voiceOpen: false,
  voicePrompt: null,
  voiceIntent: null,
  roseCount: 10,
  setRoseCount: (roseCount) => { if (get().roseCount !== roseCount) set({ roseCount }); },
  setA11yOpen: (a11yOpen) => set({ a11yOpen }),
  openVoice: (prompt, intent) => set({ voiceOpen: true, a11yOpen: false, voicePrompt: prompt ?? null, voiceIntent: intent ?? null }),
  setVoiceOpen: (voiceOpen) => set({ voiceOpen }),
  consumePrompt: () => {
    const { voicePrompt: prompt, voiceIntent: intent } = get();
    if (!prompt) return null;
    set({ voicePrompt: null, voiceIntent: null });
    return { prompt, intent };
  },
}));

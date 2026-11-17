import { create } from 'zustand';

// Session-only UI state for the accessibility panel and the voice assistant,
// so any component (e.g. the Wind Rose) can open them. Not persisted.
interface PanelsState {
  a11yOpen: boolean;
  voiceOpen: boolean;
  /** A question to ask as soon as the assistant opens (e.g. "explain my Wind Rose"). */
  voicePrompt: string | null;
  setA11yOpen: (open: boolean) => void;
  openVoice: (prompt?: string) => void;
  setVoiceOpen: (open: boolean) => void;
  consumePrompt: () => string | null;
}

export const usePanels = create<PanelsState>()((set, get) => ({
  a11yOpen: false,
  voiceOpen: false,
  voicePrompt: null,
  setA11yOpen: (a11yOpen) => set({ a11yOpen }),
  openVoice: (prompt) => set({ voiceOpen: true, a11yOpen: false, voicePrompt: prompt ?? null }),
  setVoiceOpen: (voiceOpen) => set({ voiceOpen }),
  consumePrompt: () => {
    const prompt = get().voicePrompt;
    if (prompt) set({ voicePrompt: null });
    return prompt;
  },
}));

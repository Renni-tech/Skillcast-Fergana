import { describe, expect, test } from 'bun:test';
import { AssistantBody, askAgent, parseAgentOutput } from './assistant';
import { escapeXml, pickVoice, synthesize, TtsBody } from './tts';

describe('assistant agent', () => {
  test('keeps only allowed actions', () => {
    const out = parseAgentOutput('```json\n{"reply":"Opening it.","actions":[{"type":"tab","tab":"harada"},{"type":"tab","tab":"admin"},{"type":"run","cmd":"rm"},{"type":"theme","value":"dark"}]}\n```');
    expect(out?.reply).toBe('Opening it.');
    expect(out?.actions).toEqual([{ type: 'tab', tab: 'harada' }, { type: 'theme', value: 'dark' }]);
  });
  test('rejects output without a reply', () => {
    expect(parseAgentOutput('{"actions":[]}')).toBeNull();
    expect(parseAgentOutput('not json')).toBeNull();
  });
  test('no model → null so the browser falls back', async () => {
    const req = AssistantBody.parse({ lang: 'uz', message: 'Nima o‘rganay?' });
    expect(await askAgent(req, async () => null)).toBeNull();
  });
  test('passes context and language to the model', async () => {
    let seen = '';
    const req = AssistantBody.parse({ lang: 'ru', message: 'Что дальше?', context: { tab: 'pathway', gaps: ['Python'] } });
    const out = await askAgent(req, async (input) => { seen = JSON.stringify(input.messages); return '{"reply":"Начните с Python.","actions":[]}'; });
    expect(out?.reply).toBe('Начните с Python.');
    expect(seen).toContain('Russian');
    expect(seen).toContain('Python');
  });
});

describe('tts', () => {
  test('validates voice and limits', () => {
    expect(TtsBody.safeParse({ text: 'Salom', lang: 'uz', voice: 'uz-UZ-SardorNeural' }).success).toBe(true);
    expect(TtsBody.safeParse({ text: 'Salom', lang: 'uz', voice: 'evil' }).success).toBe(false);
    expect(TtsBody.safeParse({ text: 'x'.repeat(1600), lang: 'en' }).success).toBe(false);
    expect(pickVoice('uz')).toBe('uz-UZ-MadinaNeural');
    expect(pickVoice('ru', 'uz-UZ-SardorNeural')).toBe('ru-RU-SvetlanaNeural');
  });
  test('escapes SSML', () => {
    expect(escapeXml('a < b & "c"')).toBe('a &lt; b &amp; &quot;c&quot;');
  });
  test('falls through providers and reports failure', async () => {
    delete process.env.OPENAI_API_KEY; delete process.env.GOOGLE_TTS_API_KEY;
    const req = TtsBody.parse({ text: 'Hello', lang: 'en' });
    await expect(synthesize(req, { edge: async () => { throw new Error('offline'); } })).rejects.toThrow('edge: offline');
    const ok = await synthesize(TtsBody.parse({ text: 'Hello there', lang: 'en' }), { edge: async (_r, voice) => ({ audio: Buffer.from([1, 2, 3]), contentType: 'audio/mpeg', provider: 'edge', voice }) });
    expect(ok.voice).toBe('en-US-AvaNeural');
    expect(ok.audio.length).toBe(3);
  });
});

import { describe, expect, test } from 'bun:test';
import { chunkForSpeech, normalizeForSpeech } from '../src/lib/speech-text';
import { parseCommand } from '../src/lib/voice-commands';

describe('speech normaliser', () => {
  test('drops markdown, URLs and emojis', () => {
    expect(normalizeForSpeech('**Bold** ## step ✨ see https://aileaders.uz now 🎉', 'en')).toBe('Bold step see now');
    expect(normalizeForSpeech('[Coursera](https://coursera.org) `code`', 'en')).toBe('Coursera code');
  });
  test('percentages and acronyms in each language', () => {
    expect(normalizeForSpeech('AI readiness 85%', 'en')).toBe('A.I. readiness 85 percent');
    expect(normalizeForSpeech('AI tayyorlik 85%', 'uz')).toBe('sun’iy intellekt tayyorlik 85 foiz');
    expect(normalizeForSpeech('Готовность 21%, 3%, 11%', 'ru')).toBe('Готовность 21 процент, 3 процента, 11 процентов');
    expect(normalizeForSpeech('SDG 4', 'en')).toBe('Sustainable Development Goals 4');
    expect(normalizeForSpeech('BRM 8', 'uz')).toBe('Barqaror rivojlanish maqsadlari 8');
  });
  test('Uzbek Cyrillic is read through Latin for the Uzbek voice', () => {
    expect(normalizeForSpeech('Ўзбекча 50%', 'uz-cyrl')).toBe('O‘zbekcha 50 foiz');
  });
  test('splits long text at sentence ends', () => {
    const parts = chunkForSpeech('One. '.repeat(400), 900);
    expect(parts.length).toBeGreaterThan(1);
    expect(parts.every((p) => p.length <= 900)).toBe(true);
  });
});

describe('voice commands', () => {
  test('tabs in three languages', () => {
    expect(parseCommand('Open the Harada roadmap')).toEqual({ type: 'tab', tab: 'harada' });
    expect(parseCommand('Shamol gulini och')).toEqual({ type: 'tab', tab: 'radar' });
    expect(parseCommand('Открой статистику спроса')).toEqual({ type: 'tab', tab: 'demand' });
    expect(parseCommand('Barqaror rivojlanish maqsadlari')).toEqual({ type: 'tab', tab: 'sdg' });
  });
  test('theme and accessibility', () => {
    expect(parseCommand('dark mode')).toEqual({ type: 'theme', value: 'dark' });
    expect(parseCommand('Светлая тема')).toEqual({ type: 'theme', value: 'light' });
    expect(parseCommand('turn on high contrast')).toEqual({ type: 'a11y', setting: 'highContrast', value: true });
    expect(parseCommand('kontrastni o‘chir')).toEqual({ type: 'a11y', setting: 'highContrast', value: false });
    expect(parseCommand('katta shrift')).toEqual({ type: 'a11y', setting: 'largeText', value: true });
    expect(parseCommand('dyslexia spacing')).toEqual({ type: 'a11y', setting: 'readingSpacing', value: true });
    expect(parseCommand('reduce motion')).toEqual({ type: 'a11y', setting: 'reduceMotion', value: true });
  });
  test('course filters', () => {
    expect(parseCommand('show tailoring courses')).toEqual({ type: 'filter', query: 'tailoring', view: 'all' });
    expect(parseCommand('show free AI courses')).toEqual({ type: 'filter', query: '', view: 'free', topic: 'ai' });
    expect(parseCommand('bepul tikuvchilik kurslarini ko‘rsat')).toEqual({ type: 'filter', query: 'tikuvchilik', view: 'free' });
    expect(parseCommand('покажи курсы по вождению')).toEqual({ type: 'filter', query: 'вождению', view: 'all' });
  });
  test('dictation, summary, stop', () => {
    expect(parseCommand('Save reflection: I finished Excel basics')).toEqual({ type: 'reflect', text: 'I finished Excel basics' });
    expect(parseCommand('Eslatma: Python kursini boshladim')).toEqual({ type: 'reflect', text: 'Python kursini boshladim' });
    expect(parseCommand('What is on this screen?')).toEqual({ type: 'summarize' });
    expect(parseCommand('Что на экране')).toEqual({ type: 'summarize' });
    expect(parseCommand('stop')).toEqual({ type: 'stop' });
  });
  test('questions are left to the assistant', () => {
    expect(parseCommand('What should I learn next?')).toBeNull();
    expect(parseCommand('Why is my match 72?')).toBeNull();
  });
});

import './setup-storage';
import { describe, expect, test } from 'bun:test';
import { I18N_DICTS, LANGS, makeT } from '../src/lib/i18n';
import { SOURCE_COPY } from '../src/lib/signal-source-i18n';
import { FERGANA_UI_COPY } from '../src/lib/fergana-ui-i18n';
import { APPROVED_SOURCES } from '../src/data/approved-sources';

import { useSkillCast } from '../src/lib/store';

const LANG_CODES = ['uz', 'ru', 'en'] as const;

describe('localization: Uzbek, Russian and English only', () => {
  test('exactly three selectable languages, Uzbek first', () => {
    expect(LANGS.map((l) => l.code)).toEqual(['uz', 'ru', 'en']);
    expect(Object.keys(I18N_DICTS).sort()).toEqual(['en', 'ru', 'uz']);
  });

  test('a new visitor sees Uzbek', () => {
    useSkillCast.getState().resetDemo();
    const fresh = useSkillCast.persist.getOptions().merge!({}, useSkillCast.getState());
    expect(fresh.lang).toBe('uz');
    for (const legacy of ['ms', 'zh', 'bm', 'invalid']) {
      expect(useSkillCast.persist.getOptions().merge!({ lang: legacy }, useSkillCast.getState()).lang).toBe('uz');
    }
  });

  test('every key exists and is non-empty in all three dictionaries', () => {
    const en = Object.keys(I18N_DICTS.en).sort();
    for (const lang of LANG_CODES) {
      const keys = Object.keys(I18N_DICTS[lang]).sort();
      expect(keys).toEqual(en);
      expect(keys.filter((k) => !I18N_DICTS[lang][k]?.trim())).toEqual([]);
    }
    expect(en.length).toBeGreaterThan(1000);
  });

  test('signal-source and Fergana copy tables are complete', () => {
    for (const table of [SOURCE_COPY, FERGANA_UI_COPY]) {
      for (const [key, copy] of Object.entries(table)) {
        for (const lang of LANG_CODES) expect(copy[lang]?.trim(), `${key}.${lang}`).toBeTruthy();
      }
    }
  });

  test('every approved source and its labels are translated', () => {
    for (const s of APPROVED_SOURCES) {
      for (const key of [`src.desc.${s.id}`, `src.status.${s.status}`, `src.type.${s.type}`, `src.tier.${s.tier}`, ...s.scopes.map((x) => `src.scope.${x}`)]) {
        expect(SOURCE_COPY[key], key).toBeDefined();
      }
    }
  });

  test('no Malay or Chinese copy and no Malaysian identity remains', () => {
    const all = LANG_CODES.flatMap((lang) => Object.values(I18N_DICTS[lang])).join('\n');
    expect(all).not.toMatch(/[一-鿿]/);
    expect(all).not.toMatch(/Bahasa|Melayu|Sdn Bhd|HRD ?Corp|MyFutureJobs|Malaysia|Kuala Lumpur|Selangor/i);
  });

  test('Uzbek and Russian Aiversecity copy is not left in English', () => {
    for (const lang of ['uz', 'ru'] as const) {
      const lines = Object.values(I18N_DICTS[lang]).filter((v) => v.includes('Aiversecity'));
      expect(lines.length).toBeGreaterThan(0);
      for (const line of lines) expect(line).not.toMatch(/Future-Ready|Workforce|domain/);
    }
  });

  test('SDG names and chart labels change with the language', () => {
    const [uz, ru, en] = LANG_CODES.map((l) => makeT(l));
    expect(uz('sdg.name.4')).toBe('Sifatli ta’lim');
    expect(ru('sdg.name.4')).toBe('Качественное образование');
    expect(en('sdg.name.4')).toBe('Quality Education');
    expect(uz('SDG {goal}', { goal: 4 })).toBe('BRM 4');
    expect(ru('SDG {goal}', { goal: 4 })).toBe('ЦУР 4');
    expect([uz('radar.you'), ru('radar.you'), en('radar.you')]).toEqual(['Siz', 'Вы', 'You']);
    expect(new Set([uz('radar.market'), ru('radar.market'), en('radar.market')]).size).toBe(3);
  });
});

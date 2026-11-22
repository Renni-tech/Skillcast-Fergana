import { describe, expect, test } from 'bun:test';
import { latinToCyrillic as c } from '../src/lib/uz-cyrillic';

describe('Uzbek Latin → Cyrillic', () => {
  test('letters and digraphs', () => {
    expect(c('O‘zbekcha')).toBe('Ўзбекча');
    expect(c('Farg‘ona vodiysi')).toBe('Фарғона водийси');
    expect(c('Qishloq xo‘jaligi')).toBe('Қишлоқ хўжалиги');
    expect(c('shahar choyxona')).toBe('шаҳар чойхона');
    expect(c('yo‘l')).toBe('йўл');
    expect(c('yoshlar yangi yutuq yetakchi')).toBe('ёшлар янги ютуқ етакчи');
    expect(c('mehnat loyiha')).toBe('меҳнат лойиҳа');
  });
  test('e and the separator sign', () => {
    expect(c('eslatma')).toBe('эслатма');
    expect(c('poeziya')).toBe('поэзия');
    expect(c('ta’lim ma’lumot e’lon')).toBe('таълим маълумот эълон');
    expect(c('Barqaror rivojlanish maqsadlari (BRM)')).toBe('Барқарор ривожланиш мақсадлари (BRM)');
  });
  test('loanwords', () => {
    expect(c('kompyuter savodxonligi')).toBe('компьютер саводхонлиги');
    expect(c('20-noyabr')).toBe('20-ноябр');
    expect(c('integratsiya innovatsion')).toBe('интеграция инновацион');
    expect(c('ketsa aytsa')).toBe('кетса айтса');
  });
  test('protected text', () => {
    expect(c('SkillCast va Coursera')).toBe('SkillCast ва Coursera');
    expect(c('aileaders.uz saytida {n} ta kurs')).toBe('aileaders.uz сайтида {n} та курс');
    expect(c('AI va IT Park')).toBe('AI ва IT Парк');
    expect(c('https://gov.uz/oz sahifa')).toBe('https://gov.uz/oz саҳифа');
  });
  test('case', () => {
    expect(c('Shamol guli')).toBe('Шамол гули');
    expect(c('CHAQIRUV')).toBe('ЧАҚИРУВ');
  });
});

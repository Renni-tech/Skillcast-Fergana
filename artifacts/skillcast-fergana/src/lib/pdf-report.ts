// ─── PDF reports, built in the browser ─────────────────────────────────────
// jsPDF is loaded only when a report is requested. A subset of DejaVu Sans
// (Latin, Uzbek ‘ ’ ʻ ʼ and Cyrillic) is embedded so Uzbek and Russian
// render correctly. Nothing leaves the device: the file is downloaded or
// handed to the system share sheet.

import type { jsPDF as JsPDF } from 'jspdf';
import type { WindRose } from './wind-rose';

export type ReportKind = 'full' | 'windrose' | 'roadmap' | 'career' | 'progress';
type Translate = (key: string, vars?: Record<string, string | number>) => string;

export interface ReportData {
  kind: ReportKind;
  t: Translate;
  lang: 'uz' | 'ru' | 'en';
  /** Shown only if the learner typed it in the export dialog. */
  name?: string;
  date: Date;
  profileLine: string;
  career: Array<{ role: string; fit: number; factors: Array<[string, number]>; gaps: string[]; chosen: boolean }>;
  roadmap: { role: string | null; steps: Array<{ title: string; provider: string; hours: number; week: number; done: boolean; skill: string }>; weeks: number; pace: number };
  milestones: Array<{ skill: string; done: boolean }>;
  progress: { courses: number; levelUps: Array<{ skill: string; from: number; to: number }>; days: number; badges: string[]; badgeTotal: number; title: string };
  rose: WindRose;
  skillLabel: (slug: string) => string;
}

const PAGE = { w: 210, h: 297, m: 16 };
const INK = [17, 24, 39] as const, MUTED = [100, 116, 139] as const, TEAL = [15, 118, 110] as const;

let fontCache: { regular: string; bold: string } | null = null;
async function loadFonts(): Promise<{ regular: string; bold: string }> {
  if (fontCache) return fontCache;
  const base = (import.meta.env.BASE_URL ?? '/').replace(/\/?$/, '/');
  const get = async (file: string) => {
    const res = await fetch(`${base}fonts/${file}`);
    if (!res.ok) throw new Error(`font ${file}: ${res.status}`);
    const bytes = new Uint8Array(await res.arrayBuffer());
    let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  };
  fontCache = { regular: await get('DejaVuSans-subset.ttf'), bold: await get('DejaVuSans-Bold-subset.ttf') };
  return fontCache;
}

export async function buildReport(d: ReportData): Promise<Blob> {
  const [{ jsPDF }, fonts] = await Promise.all([import('jspdf'), loadFonts()]);
  const doc: JsPDF = new jsPDF({ unit: 'mm', format: 'a4' });
  doc.addFileToVFS('DejaVu.ttf', fonts.regular);
  doc.addFont('DejaVu.ttf', 'DejaVu', 'normal');
  doc.addFileToVFS('DejaVu-Bold.ttf', fonts.bold);
  doc.addFont('DejaVu-Bold.ttf', 'DejaVu', 'bold');
  const { t } = d;
  let y = PAGE.m;

  const color = (c: readonly number[]) => doc.setTextColor(c[0], c[1], c[2]);
  const ensure = (h: number) => { if (y + h > PAGE.h - PAGE.m - 8) { doc.addPage(); y = PAGE.m; } };
  const text = (s: string, size = 10, bold = false, c: readonly number[] = INK, indent = 0) => {
    doc.setFont('DejaVu', bold ? 'bold' : 'normal'); doc.setFontSize(size); color(c);
    const lines = doc.splitTextToSize(s, PAGE.w - PAGE.m * 2 - indent) as string[];
    const lh = size * 0.42;
    for (const line of lines) { ensure(lh); doc.text(line, PAGE.m + indent, y + lh * 0.8); y += lh; }
    y += 1;
  };
  const heading = (s: string) => {
    ensure(14); y += 3;
    doc.setDrawColor(TEAL[0], TEAL[1], TEAL[2]); doc.setLineWidth(0.6); doc.line(PAGE.m, y, PAGE.m + 12, y); y += 2;
    text(s, 13, true, TEAL);
  };
  const bullet = (s: string, mark = '•') => { text(`${mark} ${s}`, 10, false, INK, 2); };

  // Header
  doc.setFillColor(TEAL[0], TEAL[1], TEAL[2]); doc.rect(0, 0, PAGE.w, 4, 'F');
  y = PAGE.m;
  text('SkillCast Fergana', 10, true, TEAL);
  text(t(`pdf.title.${d.kind}`), 20, true);
  // Browsers format Uzbek dates inconsistently ("2026 M11 21"), so spell them out.
  const UZ_MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
  const dateStr = d.lang === 'uz'
    ? `${d.date.getFullYear()}-yil ${d.date.getDate()}-${UZ_MONTHS[d.date.getMonth()]}`
    : new Intl.DateTimeFormat(d.lang === 'ru' ? 'ru-RU' : 'en-GB', { dateStyle: 'long' }).format(d.date);
  text([d.name?.trim() ? t('pdf.for', { name: d.name.trim() }) : '', t('pdf.date', { date: dateStr })].filter(Boolean).join(' · '), 10, false, MUTED);
  text(d.profileLine, 10, false, MUTED);

  const show = (k: ReportKind) => d.kind === 'full' || d.kind === k;

  if (show('career')) {
    heading(t('pdf.sec.career'));
    if (!d.career.length) text(t('pdf.none'), 10, false, MUTED);
    for (const m of d.career) {
      text(`${m.role}${m.chosen ? ` (${t('pdf.chosen')})` : ''}: ${m.fit}%`, 11, true);
      text(m.factors.map(([label, v]) => `${label} ${v}%`).join(' · '), 9, false, MUTED, 2);
      if (m.gaps.length) text(`${t('pdf.gaps')}: ${m.gaps.join(', ')}`, 10, false, INK, 2);
    }
  }

  if (show('windrose')) {
    heading(t('pdf.sec.windrose'));
    text(t('pdf.rose.how'), 9, false, MUTED);
    drawRose(doc, d.rose, y + 2, [t('wr.you'), t('wr.market'), t('wr.target')]);
    y += 100;
    d.rose.points.forEach((p, i) => text(`${i + 1}. ${d.skillLabel(p.slug)}: ${t('pdf.rose.row', { you: p.you, market: p.market, target: p.target ?? '—' })}`, 9, false, INK, 2));
    if (d.rose.priorities.length) text(`${t('pdf.rose.next')}: ${d.rose.priorities.map((p) => d.skillLabel(p.slug)).join(', ')}`, 10, true);
  }

  if (show('roadmap')) {
    heading(t('pdf.sec.roadmap'));
    if (!d.roadmap.role) text(t('pdf.noRole'), 10, false, MUTED);
    else {
      text(d.roadmap.weeks > 0 ? t('pdf.road.goal', { role: d.roadmap.role, weeks: d.roadmap.weeks, pace: d.roadmap.pace }) : t('pdf.road.done', { role: d.roadmap.role }), 10);
      d.roadmap.steps.forEach((s, i) => bullet(`${i + 1}. ${s.title} — ${s.provider} · ${t('pdf.road.step', { week: s.week, hours: s.hours, skill: s.skill })}`, s.done ? '✓' : '○'));
      if (d.milestones.length) {
        text(t('pdf.milestones'), 11, true);
        d.milestones.forEach((m) => bullet(m.skill, m.done ? '✓' : '○'));
      }
    }
  }

  if (show('progress')) {
    heading(t('pdf.sec.progress'));
    const p = d.progress;
    text(t('pdf.prog.summary', { courses: p.courses, levels: p.levelUps.length, days: p.days, badges: p.badges.length, total: p.badgeTotal }), 10);
    text(`${t('ach.title')}: ${p.title}`, 10, true);
    if (p.levelUps.length) { text(t('pdf.prog.levels'), 11, true); p.levelUps.forEach((u) => bullet(`${u.skill}: ${u.from} → ${u.to}`)); }
    if (p.badges.length) { text(t('pdf.prog.badges'), 11, true); text(p.badges.join(' · '), 10, false, INK, 2); }
  }

  // Footer on every page
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont('DejaVu', 'normal'); doc.setFontSize(8); color(MUTED);
    const foot = doc.splitTextToSize(t('pdf.footer'), PAGE.w - PAGE.m * 2 - 20) as string[];
    doc.text(foot, PAGE.m, PAGE.h - 10);
    doc.text(`${i} / ${pages}`, PAGE.w - PAGE.m, PAGE.h - 10, { align: 'right' });
  }
  return doc.output('blob');
}

/** Vector Wind Rose: grid, your area (blue), market (violet), target (amber, dashed). */
function drawRose(doc: JsPDF, rose: WindRose, top: number, labels: [string, string, string]) {
  const n = rose.points.length;
  if (n < 3) return;
  const cx = PAGE.w / 2, cy = top + 44, R = 38;
  const at = (i: number, v: number) => {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
    return [cx + Math.cos(a) * R * (v / 100), cy + Math.sin(a) * R * (v / 100)] as const;
  };
  doc.setLineWidth(0.2); doc.setDrawColor(203, 213, 225);
  for (const ring of [25, 50, 75, 100]) doc.circle(cx, cy, (R * ring) / 100, 'S');
  for (let i = 0; i < n; i++) { const [x, y] = at(i, 100); doc.line(cx, cy, x, y); }
  const poly = (vals: number[], rgb: [number, number, number], fill: boolean, dash = false) => {
    const pts = vals.map((v, i) => at(i, v));
    doc.setDrawColor(...rgb); doc.setLineWidth(0.7);
    if (dash) doc.setLineDashPattern([1.5, 1.2], 0);
    if (fill) {
      doc.setFillColor(...rgb);
      const gs = (doc as unknown as { GState: new (o: object) => unknown }).GState;
      doc.setGState(new gs({ opacity: 0.25 }) as never);
      doc.lines(pts.slice(1).map((p, i) => [p[0] - pts[i][0], p[1] - pts[i][1]]), pts[0][0], pts[0][1], [1, 1], 'F', true);
      doc.setGState(new gs({ opacity: 1 }) as never);
    }
    for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; doc.line(a[0], a[1], b[0], b[1]); }
    doc.setLineDashPattern([], 0);
  };
  poly(rose.points.map((p) => p.market), [124, 58, 237], false);
  if (rose.points.some((p) => p.target !== null)) poly(rose.points.map((p) => p.target ?? 0), [217, 119, 6], false, true);
  poly(rose.points.map((p) => p.you), [37, 99, 235], true);
  doc.setFont('DejaVu', 'bold'); doc.setFontSize(8); doc.setTextColor(17, 24, 39);
  rose.points.forEach((_, i) => { const [x, y] = at(i, 112); doc.text(String(i + 1), x, y + 1, { align: 'center' }); });
  // Legend
  const ly = cy + R + 11;
  const items: Array<[string, [number, number, number]]> = [[`■ ${labels[0]}`, [37, 99, 235]], [`— ${labels[1]}`, [124, 58, 237]], [`- - ${labels[2]}`, [217, 119, 6]]];
  doc.setFont('DejaVu', 'normal');
  items.forEach(([mark, rgb], i) => { doc.setTextColor(...rgb); doc.text(mark, PAGE.m + 20 + i * 55, ly); });
}

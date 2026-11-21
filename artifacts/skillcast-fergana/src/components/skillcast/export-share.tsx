'use client';

import { useState } from 'react';
import { Check, Copy, Download, FileDown, Loader2, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { COURSE_MAP } from '@/data/courses';
import { ROLE_MAP } from '@/data/roles';
import { ALL_BADGES, parseBadge, titleFor } from '@/lib/achievements';
import { matchAll } from '@/lib/matching';
import { buildReport, type ReportData, type ReportKind } from '@/lib/pdf-report';
import { planningHours } from '@/lib/profile';
import { useSkillCast } from '@/lib/store';
import { computeWindRose } from '@/lib/wind-rose';
import { rolePathway } from './pathway';
import { courseProvider, courseTitle, roleTitle, skillName, useSignals, useT } from './shared';

// ─── Export and share ──────────────────────────────────────────────────────
// PDF reports built on the device, shared through the system share sheet
// where the browser supports files, otherwise downloaded. A plain-text
// summary can be copied. No links are created and nothing is uploaded.

const KINDS: ReportKind[] = ['full', 'windrose', 'roadmap', 'career', 'progress'];
const FACTOR_KEYS: Record<string, string> = { Skills: 'Skills', Interests: 'Interests', Experience: 'Experience', 'Work preferences': 'Work preferences' };

export function ExportShareButton() {
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} className="gap-1.5"><FileDown className="h-4 w-4" aria-hidden />{t('share.open')}</Button>
      {open && <ExportDialog onClose={() => setOpen(false)} />}
    </>
  );
}

function ExportDialog({ onClose }: { onClose: () => void }) {
  const t = useT();
  const st = useSkillCast();
  const { momentumMap } = useSignals();
  const [kind, setKind] = useState<ReportKind>('full');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<{ state: 'idle' | 'busy' | 'done' | 'error' | 'copied'; msg?: string }>({ state: 'idle' });
  const canShareFiles = typeof navigator !== 'undefined' && typeof navigator.canShare === 'function'
    && (() => { try { return navigator.canShare({ files: [new File([''], 'x.pdf', { type: 'application/pdf' })] }); } catch { return false; } })();

  function collect(): ReportData {
    const { profile, chosenRole, completedCourses, skillUpdates, badges, badgesSeen, activeDays, lang } = st;
    const matches = matchAll(profile, momentumMap);
    const chosen = matches.find((m) => m.roleSlug === chosenRole) ?? null;
    const top = [...(chosen ? [chosen] : []), ...matches.filter((m) => m !== chosen)].slice(0, 3);
    const nodes = chosen ? rolePathway(chosen, profile, completedCourses) : [];
    const pace = planningHours(profile.budget);
    const left = nodes.filter((n) => !completedCourses.includes(n.courseSlug)).reduce((h, n) => h + (COURSE_MAP[n.courseSlug]?.totalHours ?? 0), 0);
    const tasks = profile.completedRoadmapTasks ?? [];
    const earned = Object.keys(badges).filter((id) => badgesSeen.includes(id));
    const ext = profile.extended ?? {};
    return {
      kind, t, lang, name, date: new Date(),
      profileLine: [ext.profession, ext.fieldOfWork, ext.city, t('pdf.hours', { n: profile.budget })].filter(Boolean).join(' · '),
      career: top.map((m) => ({
        role: roleTitle(t, m.roleSlug), fit: m.score, chosen: m.roleSlug === chosenRole,
        factors: m.factors.map((f) => [t(FACTOR_KEYS[f.label] ?? f.label), Math.round(f.value * 100)] as [string, number]),
        gaps: m.gap.slice(0, 4).map((g) => `${skillName(t, g.skill)} (${g.userLevel}/${g.minLevel})`),
      })),
      roadmap: {
        role: chosen && ROLE_MAP[chosen.roleSlug] ? roleTitle(t, chosen.roleSlug) : null,
        steps: nodes.map((n) => ({ title: courseTitle(t, n.courseSlug), provider: courseProvider(t, n.courseSlug), hours: COURSE_MAP[n.courseSlug]?.totalHours ?? 0, week: n.startWeek, done: completedCourses.includes(n.courseSlug), skill: skillName(t, n.skill) })),
        weeks: Math.ceil(left / pace), pace,
      },
      milestones: chosen ? chosen.gap.slice(0, 5).map((g) => ({ skill: skillName(t, g.skill), done: tasks.includes(`${chosen.roleSlug}:${g.skill}`) })) : [],
      progress: {
        courses: completedCourses.length, days: activeDays.length, badgeTotal: ALL_BADGES.length,
        levelUps: skillUpdates.map((u) => ({ skill: skillName(t, u.skill), from: u.from, to: u.to })),
        badges: earned.map((id) => { const p = parseBadge(id)!; return `${t(`ach.cat.${p.cat}`)} (${t(`ach.tier.${p.tier}`)})`; }),
        title: t(`ach.titles.${titleFor(earned.length).current}`),
      },
      rose: computeWindRose(profile, momentumMap, chosenRole),
      skillLabel: (slug) => skillName(t, slug),
    };
  }

  const fileName = () => `skillcast-${kind}-${new Date().toISOString().slice(0, 10)}.pdf`;

  async function make(): Promise<Blob | null> {
    setStatus({ state: 'busy' });
    try { return await buildReport(collect()); } catch { setStatus({ state: 'error' }); return null; }
  }
  function download(blob: Blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = fileName(); document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
  async function onDownload() {
    const blob = await make();
    if (!blob) return;
    download(blob);
    setStatus({ state: 'done', msg: t('share.downloaded', { file: fileName() }) });
  }
  async function onShare() {
    const blob = await make();
    if (!blob) return;
    const file = new File([blob], fileName(), { type: 'application/pdf' });
    try {
      await navigator.share({ files: [file], title: t(`pdf.title.${kind}`) });
      setStatus({ state: 'done', msg: t('share.shared') });
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') { setStatus({ state: 'idle' }); return; }
      download(blob);
      setStatus({ state: 'done', msg: t('share.fallback') });
    }
  }
  async function onCopy() {
    const d = collect();
    const lines = [
      `SkillCast Fergana: ${t(`pdf.title.${kind}`)}`,
      d.career[0] ? `${d.career[0].role}: ${d.career[0].fit}%` : '',
      d.rose.priorities.length ? `${t('pdf.rose.next')}: ${d.rose.priorities.map((p) => d.skillLabel(p.slug)).join(', ')}` : '',
      d.roadmap.role ? t('pdf.road.goal', { role: d.roadmap.role, weeks: d.roadmap.weeks, pace: d.roadmap.pace }) : '',
      t('pdf.prog.summary', { courses: d.progress.courses, levels: d.progress.levelUps.length, days: d.progress.days, badges: d.progress.badges.length, total: d.progress.badgeTotal }),
    ].filter(Boolean);
    try { await navigator.clipboard.writeText(lines.join('\n')); setStatus({ state: 'copied' }); }
    catch { setStatus({ state: 'error', msg: t('share.copyFail') }); }
  }

  const busy = status.state === 'busy';
  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><FileDown className="h-5 w-5" aria-hidden />{t('share.title')}</DialogTitle>
          <DialogDescription>{t('share.lede')}</DialogDescription>
        </DialogHeader>
        <fieldset>
          <legend className="mb-2 text-sm font-medium">{t('share.kind')}</legend>
          <div className="grid gap-2" role="radiogroup" aria-label={t('share.kind')}>
            {KINDS.map((k) => (
              <button key={k} type="button" role="radio" aria-checked={kind === k} onClick={() => setKind(k)}
                className={`rounded-lg border px-3 py-2 text-left text-sm ${kind === k ? 'border-teal-600 bg-teal-50 ring-2 ring-teal-600/30 dark:bg-teal-950/30' : 'hover:bg-muted'}`}>
                <span className="block font-medium">{t(`pdf.title.${k}`)}</span>
                <span className="block text-xs text-muted-foreground">{t(`share.kind.${k}`)}</span>
              </button>
            ))}
          </div>
        </fieldset>
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">{t('share.name')}</span>
          <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} autoComplete="name" />
          <span className="text-xs text-muted-foreground">{t('share.name.hint')}</span>
        </label>
        <div className="flex flex-wrap gap-2">
          <Button onClick={onDownload} disabled={busy} className="gap-1.5">{busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Download className="h-4 w-4" aria-hidden />}{t('share.download')}</Button>
          {canShareFiles && <Button variant="outline" onClick={onShare} disabled={busy} className="gap-1.5"><Share2 className="h-4 w-4" aria-hidden />{t('share.share')}</Button>}
          <Button variant="outline" onClick={onCopy} disabled={busy} className="gap-1.5">{status.state === 'copied' ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}{t('share.copy')}</Button>
        </div>
        <p role="status" aria-live="polite" className="min-h-5 text-sm">
          {busy && t('share.busy')}
          {status.state === 'done' && status.msg}
          {status.state === 'copied' && t('share.copied')}
          {status.state === 'error' && (
            <span className="text-red-700 dark:text-red-400">{status.msg ?? t('share.error')} <Button size="sm" variant="link" className="h-auto p-0" onClick={onDownload}>{t('va.retry')}</Button></span>
          )}
        </p>
        {!canShareFiles && <p className="text-xs text-muted-foreground">{t('share.noShare')}</p>}
        <p className="text-xs text-muted-foreground">{t('share.privacy')}</p>
      </DialogContent>
    </Dialog>
  );
}

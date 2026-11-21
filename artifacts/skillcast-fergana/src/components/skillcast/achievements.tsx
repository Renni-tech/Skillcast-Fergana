'use client';

// Badge reward experience: a short reveal (silhouette → spin → burst → info →
// fly into the collection) shown once per newly earned badge, plus the
// collection where badges can be replayed. Badges come from lib/achievements
// and are saved locally in the store; nothing is sent anywhere.

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { create } from 'zustand';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
  BookOpen, Check, Compass, Flame, Footprints, Lock, Rocket, Sparkles, Target, TrendingUp, Trophy,
  Volume2, VolumeX, type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { COURSE_MAP } from '@/data/courses';
import {
  AI_SKILLS, ALL_BADGES, CATEGORIES, GREEN_SKILLS, TIERS, WIND_ROSE_THEMES, badgeId, badgeProgress, completedSets,
  eligibleBadges, frameFor, parseBadge, rewardsFor, sortBadges, titleFor,
  type CategoryId, type ProgressSnapshot, type Tier, type WindRoseTheme,
} from '@/lib/achievements';
import { matchAll } from '@/lib/matching';
import { useSkillCast } from '@/lib/store';
import { useReducedMotion } from './a11y';
import { rolePathway } from './pathway';
import { useSignals, useT } from './shared';

const ICONS: Record<string, LucideIcon> = {
  footprints: Footprints, compass: Compass, sparkles: Sparkles, flame: Flame,
  'trending-up': TrendingUp, book: BookOpen, target: Target, rocket: Rocket,
};
const iconFor = (cat: CategoryId) => ICONS[CATEGORIES.find((c) => c.id === cat)?.icon ?? 'sparkles'] ?? Sparkles;

const TIER_STYLE: Record<Tier, { face: string; rim: string; edge: string; glow: string; spark: string[] }> = {
  bronze: { face: 'radial-gradient(circle at 32% 28%, #ffd9b0, #d9874a 42%, #8a4316 100%)', rim: '#f6c79b', edge: '#6b3410', glow: '#f59e4c', spark: ['#ffd9b0', '#f59e4c', '#fde68a'] },
  silver: { face: 'radial-gradient(circle at 32% 28%, #ffffff, #c4cfdc 45%, #5b6b80 100%)', rim: '#eef2f7', edge: '#3f4b5b', glow: '#cbd5e1', spark: ['#ffffff', '#bae6fd', '#cbd5e1'] },
  gold: { face: 'radial-gradient(circle at 32% 28%, #fff7c2, #f5b301 45%, #9a5b00 100%)', rim: '#ffe58a', edge: '#7a4600', glow: '#fbbf24', spark: ['#fff7c2', '#fbbf24', '#fb923c'] },
};

// ─── UI state shared by header, pathway shelf and the host ────────────────
interface BadgeUi { collectionOpen: boolean; replay: string | null; setCollection: (open: boolean) => void; setReplay: (id: string | null) => void }
export const useBadgeUi = create<BadgeUi>((set) => ({
  collectionOpen: false, replay: null,
  setCollection: (open) => set({ collectionOpen: open }),
  setReplay: (id) => set({ replay: id }),
}));

// ─── Progress snapshot from local state ───────────────────────────────────
export function useProgressSnapshot(): ProgressSnapshot {
  const { profile, chosenRole, completedCourses, skillUpdates, activeDays, learnerOnboarded } = useSkillCast();
  const { momentumMap } = useSignals();
  return useMemo(() => {
    const match = chosenRole ? matchAll(profile, momentumMap).find((m) => m.roleSlug === chosenRole) ?? null : null;
    const nodes = match ? rolePathway(match, profile, completedCourses) : [];
    const taught = (set: Set<string>) => completedCourses.filter((slug) => COURSE_MAP[slug]?.skills.some((s) => set.has(s))).length;
    const tasks = profile.completedRoadmapTasks ?? [];
    const gaps = (match?.gap ?? []).slice(0, 5);
    return {
      onboarded: learnerOnboarded,
      ratedSkills: Object.values(profile.skills ?? {}).filter((v) => Number(v) > 0).length,
      chosenRole: !!match,
      readiness: match?.skillReadiness ?? 0,
      coursesDone: completedCourses.filter((slug) => COURSE_MAP[slug]).length,
      aiCoursesDone: taught(AI_SKILLS),
      greenCoursesDone: taught(GREEN_SKILLS),
      activeDays: activeDays.length,
      levelUps: skillUpdates.length,
      milestones: tasks.length,
      pathway: { done: nodes.filter((n) => completedCourses.includes(n.courseSlug)).length, total: nodes.length },
      roleMilestones: { done: gaps.filter((g) => tasks.includes(`${chosenRole}:${g.skill}`)).length, total: gaps.length },
    };
  }, [profile, chosenRole, completedCourses, skillUpdates, activeDays, learnerOnboarded, momentumMap]);
}

// ─── Medal ────────────────────────────────────────────────────────────────
export function Medal({ id, size = 128, locked = false, className = '' }: { id: string; size?: number; locked?: boolean; className?: string }) {
  const p = parseBadge(id);
  if (!p) return null;
  const Icon = iconFor(p.cat);
  const st = TIER_STYLE[p.tier];
  const face = (back: boolean) => (
    <span className={`bc-face flex items-center justify-center ${back ? 'bc-back' : ''}`}
      style={{ background: locked ? 'var(--muted)' : st.face, boxShadow: locked ? 'inset 0 0 0 2px var(--border)' : `inset 0 0 0 ${Math.max(2, size * 0.05)}px ${st.rim}, inset 0 -${size * 0.06}px ${size * 0.12}px rgb(0 0 0 / .25)` }}>
      <span className="flex items-center justify-center rounded-full"
        style={{ width: size * 0.62, height: size * 0.62, background: locked ? 'transparent' : 'rgb(0 0 0 / .16)', boxShadow: locked ? 'none' : `inset 0 0 0 ${Math.max(1, size * 0.02)}px rgb(255 255 255 / .45)` }}>
        {back ? <Trophy style={{ width: size * 0.3, height: size * 0.3 }} className="text-white/90" aria-hidden />
          : locked ? <Lock style={{ width: size * 0.28, height: size * 0.28 }} className="text-muted-foreground" aria-hidden />
            : <Icon style={{ width: size * 0.32, height: size * 0.32 }} className="text-white drop-shadow-[0_2px_2px_rgb(0_0_0_/_0.35)]" aria-hidden />}
      </span>
    </span>
  );
  return (
    <span className={`bc-coin inline-block shrink-0 ${className}`} style={{ width: size, height: size }} aria-hidden>
      {!locked && [1, 2, 3, 4].map((z) => (
        <span key={z} className="bc-face" style={{ background: st.edge, transform: `translateZ(-${z * size * 0.012}px)` }} />
      ))}
      {face(false)}
      {!locked && face(true)}
    </span>
  );
}

// ─── Sound (optional, off by default) ─────────────────────────────────────
function chime(tier: Tier) {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const notes = tier === 'gold' ? [523, 659, 784, 1047] : tier === 'silver' ? [523, 659, 784] : [440, 554, 659];
    notes.forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'triangle'; o.frequency.value = f;
      const t0 = ctx.currentTime + i * 0.09;
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(0.12, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.45);
      o.connect(g).connect(ctx.destination); o.start(t0); o.stop(t0 + 0.5);
    });
    window.setTimeout(() => void ctx.close(), 1500);
  } catch { /* sound is optional */ }
}

// ─── Reveal ───────────────────────────────────────────────────────────────
type Stage = 'silhouette' | 'spin' | 'burst' | 'info' | 'fly';
const TIMINGS: Record<'silhouette' | 'spin' | 'burst', number> = { silhouette: 900, spin: 1200, burst: 1000 };

function BadgeReveal({ id, remaining, replay, earnedBefore, onDone, onSkipAll }: {
  id: string; remaining: number; replay: boolean; earnedBefore: string[];
  onDone: () => void; onSkipAll: () => void;
}) {
  const t = useT();
  const reduce = useReducedMotion();
  const { badgeSound, setBadgeSound, lang } = useSkillCast();
  const [stage, setStage] = useState<Stage>(reduce ? 'info' : 'silhouette');
  const medalRef = useRef<HTMLDivElement>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);
  const p = parseBadge(id)!;
  const name = t(`ach.cat.${p.cat}`), tierName = t(`ach.tier.${p.tier}`);
  const rewards = useMemo(() => (replay ? {} : rewardsFor(id, earnedBefore)), [id, replay, earnedBefore]);

  useEffect(() => {
    if (stage === 'silhouette' || stage === 'spin' || stage === 'burst') {
      const next: Stage = stage === 'silhouette' ? 'spin' : stage === 'spin' ? 'burst' : 'info';
      if (stage === 'burst' && badgeSound) chime(p.tier);
      const timer = window.setTimeout(() => setStage(next), TIMINGS[stage]);
      return () => window.clearTimeout(timer);
    }
    if (stage === 'info') primaryRef.current?.focus();
    return undefined;
  }, [stage, badgeSound, p.tier]);

  const finish = useCallback(() => {
    if (stage === 'fly') return;
    const target = document.getElementById('badge-collection-target');
    const medal = medalRef.current;
    const tr = target?.getBoundingClientRect();
    if (reduce || !medal || !tr || tr.width === 0 || typeof medal.animate !== 'function') { onDone(); return; }
    setStage('fly');
    const mr = medal.getBoundingClientRect();
    const dx = tr.left + tr.width / 2 - (mr.left + mr.width / 2);
    const dy = tr.top + tr.height / 2 - (mr.top + mr.height / 2);
    const anim = medal.animate(
      [{ transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: `translate(${dx * 0.35}px, ${dy * 0.15 - 40}px) scale(.7)`, opacity: 1, offset: 0.35 },
        { transform: `translate(${dx}px, ${dy}px) scale(.12)`, opacity: 0.4 }],
      { duration: 750, easing: 'cubic-bezier(.45,0,.55,1)', fill: 'forwards' },
    );
    anim.onfinish = () => {
      window.dispatchEvent(new Event('skillcast:badge-landed'));
      onDone();
    };
  }, [stage, reduce, onDone]);

  const skipAnimation = () => setStage('info');
  const animating = stage === 'silhouette' || stage === 'spin' || stage === 'burst';
  const st = TIER_STYLE[p.tier];
  const particles = useMemo(() => Array.from({ length: 26 }, (_, i) => ({
    a: `${(360 / 26) * i + (i % 3) * 5}deg`, d: `${110 + (i * 37) % 90}px`, c: st.spark[i % st.spark.length], s: 6 + (i % 4) * 2, delay: (i % 5) * 25,
  })), [st]);
  const dateFmt = new Intl.DateTimeFormat(lang === 'uz' ? 'uz-Latn-UZ' : lang === 'ru' ? 'ru-RU' : 'en-GB', { dateStyle: 'medium' });
  const earnedAt = useSkillCast.getState().badges[id];

  return (
    <DialogPrimitive.Root open onOpenChange={(open) => { if (!open) onDone(); }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={`fixed inset-0 z-[70] bg-slate-950/80 backdrop-blur-sm transition-opacity duration-500 ${stage === 'fly' ? 'opacity-0' : 'opacity-100'}`} />
        <DialogPrimitive.Content
          aria-describedby="bc-desc"
          data-badge-reveal=""
          onOpenAutoFocus={(e) => e.preventDefault()}
          className={`fixed inset-0 z-[71] flex flex-col items-center justify-center overflow-y-auto px-4 py-6 text-white outline-none ${stage === 'fly' ? 'pointer-events-none' : ''}`}>
          <DialogPrimitive.Title className="sr-only">{t('ach.new')}: {name}, {tierName}</DialogPrimitive.Title>
          <p className="sr-only" aria-live="assertive">{t('ach.live', { name, tier: tierName })}</p>

          {animating && (
            <button type="button" onClick={skipAnimation} autoFocus
              className="absolute right-4 top-4 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
              {t('ach.skipAnim')}
            </button>
          )}

          <p className={`mb-4 text-xs font-bold uppercase tracking-[0.2em] text-amber-200 transition-opacity duration-500 ${stage === 'silhouette' ? 'opacity-60' : 'opacity-100'}`}>
            {t('ach.new')}
          </p>

          <div ref={medalRef} className={`bc-stage relative flex h-60 w-60 shrink-0 items-center justify-center bc-${stage === 'fly' ? 'info' : stage}`}>
            {(stage === 'silhouette' || stage === 'spin') && (
              <span className="bc-glow absolute inset-6 rounded-full blur-2xl" style={{ background: st.glow }} aria-hidden />
            )}
            {(stage === 'burst' || stage === 'info' || stage === 'fly') && !reduce && (
              <>
                <span className="bc-rays absolute -inset-10 rounded-full" aria-hidden />
                <span className="absolute inset-8 rounded-full opacity-60 blur-2xl" style={{ background: st.glow }} aria-hidden />
              </>
            )}
            {stage === 'burst' && particles.map((q, i) => (
              <span key={i} className="bc-particle" aria-hidden
                style={{ '--a': q.a, '--d': q.d, background: q.c, width: q.s, height: q.s, animationDelay: `${q.delay}ms`, boxShadow: `0 0 8px ${q.c}` } as CSSProperties} />
            ))}
            <Medal id={id} size={150} />
          </div>

          {(stage === 'info' || stage === 'fly') && (
            <div className={`mt-4 w-full max-w-md rounded-2xl border border-white/15 bg-slate-900/90 p-5 text-center shadow-2xl ${stage === 'fly' ? 'opacity-0 transition-opacity duration-300' : 'bc-pop'}`}>
              <span className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-900" style={{ background: st.rim }}>{tierName}</span>
              <p className="mt-2 text-2xl font-extrabold tracking-tight">{name}</p>
              <p id="bc-desc" className="mt-1 text-sm font-medium text-amber-100">{t(`ach.msg.${p.tier}`)}</p>
              <dl className="mt-4 space-y-3 text-left text-sm">
                <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t('ach.how')}</dt><dd className="mt-0.5 text-slate-100">{t(`ach.req.${p.cat}.${p.tier}`)}</dd></div>
                <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t('ach.why')}</dt><dd className="mt-0.5 text-slate-100">{t(`ach.why.${p.cat}`)}</dd></div>
              </dl>
              {(rewards.title || rewards.theme || rewards.set || rewards.milestone) && (
                <ul className="mt-4 space-y-1.5 rounded-xl bg-white/5 p-3 text-left text-sm" aria-label={t('ach.rewards')}>
                  {rewards.set && <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden />{t('ach.reward.set', { cat: t(`ach.cat.${rewards.set}`) })}</li>}
                  {rewards.title && <li className="flex gap-2"><Trophy className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden />{t('ach.reward.title', { title: t(`ach.titles.${rewards.title}`) })}</li>}
                  {rewards.theme && <li className="flex gap-2"><Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" aria-hidden />{t('ach.reward.theme', { theme: t(`ach.theme.${rewards.theme}`) })}</li>}
                  {rewards.milestone && <li className="flex gap-2"><Flame className="mt-0.5 h-4 w-4 shrink-0 text-orange-300" aria-hidden />{t('ach.reward.milestone', { pct: rewards.milestone })}</li>}
                </ul>
              )}
              {replay && earnedAt && <p className="mt-3 text-xs text-slate-400">{t('ach.earnedOn', { date: dateFmt.format(new Date(earnedAt)) })}</p>}
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                <Button ref={primaryRef} onClick={replay ? onDone : finish} className="min-w-40 bg-amber-400 font-bold text-slate-950 hover:bg-amber-300">
                  {replay ? t('ach.close') : t('ach.add')}
                </Button>
                {!replay && remaining > 0 && (
                  <Button variant="ghost" onClick={onSkipAll} className="text-slate-200 hover:bg-white/10 hover:text-white">{t('ach.skipAll', { n: remaining + 1 })}</Button>
                )}
                <Button variant="ghost" size="icon" aria-pressed={badgeSound} aria-label={t('ach.sound')}
                  onClick={() => setBadgeSound(!badgeSound)} className="text-slate-300 hover:bg-white/10 hover:text-white">
                  {badgeSound ? <Volume2 className="h-4 w-4" aria-hidden /> : <VolumeX className="h-4 w-4" aria-hidden />}
                </Button>
              </div>
              {!replay && remaining > 0 && <p className="mt-2 text-xs text-slate-400">{t('ach.queue', { n: remaining })}</p>}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

// ─── Host: awards newly met badges and plays reveals one at a time ────────
export function AchievementsHost() {
  const { view, userType, learnerOnboarded, badges, badgesSeen, awardBadges, markBadgesSeen } = useSkillCast();
  const snapshot = useProgressSnapshot();
  const { replay, setReplay, collectionOpen } = useBadgeUi();
  const active = userType === 'individual' && learnerOnboarded;

  const eligible = useMemo(() => (active ? eligibleBadges(snapshot) : []), [active, snapshot]);
  useEffect(() => {
    const fresh = eligible.filter((id) => !badges[id]);
    if (fresh.length) awardBadges(fresh);
  }, [eligible, badges, awardBadges]);

  const queue = useMemo(() => sortBadges(Object.keys(badges).filter((id) => !badgesSeen.includes(id))), [badges, badgesSeen]);
  // Wait for a calm moment: on the dashboard, with no other dialog open.
  const [calm, setCalm] = useState(false);
  useEffect(() => {
    if (!queue.length || view !== 'dashboard' || collectionOpen) { setCalm(false); return; }
    const check = () => setCalm(!document.querySelector('[role="alertdialog"], [role="dialog"]:not([data-badge-reveal])'));
    check();
    const timer = window.setInterval(check, 500);
    return () => window.clearInterval(timer);
  }, [queue.length, view, collectionOpen]);

  const current = calm ? queue[0] : undefined;
  const earnedBefore = useMemo(() => Object.keys(badges).filter((id) => badgesSeen.includes(id)), [badges, badgesSeen]);

  if (replay) {
    return <BadgeReveal key={`replay-${replay}`} id={replay} remaining={0} replay earnedBefore={[]} onDone={() => setReplay(null)} onSkipAll={() => setReplay(null)} />;
  }
  if (!current) return null;
  return (
    <BadgeReveal key={current} id={current} remaining={queue.length - 1} replay={false} earnedBefore={earnedBefore}
      onDone={() => markBadgesSeen([current])} onSkipAll={() => markBadgesSeen(queue)} />
  );
}

// ─── Header button (the collection the badges fly into) ───────────────────
export function CollectionButton({ landing }: { landing: boolean }) {
  const t = useT();
  const { userType, learnerOnboarded, badges, badgesSeen } = useSkillCast();
  const setCollection = useBadgeUi((s) => s.setCollection);
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    const on = () => setPulse((n) => n + 1);
    window.addEventListener('skillcast:badge-landed', on);
    return () => window.removeEventListener('skillcast:badge-landed', on);
  }, []);
  if (userType !== 'individual' || !learnerOnboarded) return null;
  const shown = Object.keys(badges).filter((id) => badgesSeen.includes(id)).length;
  return (
    <Button id="badge-collection-target" variant="ghost" size="sm" onClick={() => setCollection(true)}
      aria-label={`${t('ach.collection')}: ${t('ach.count', { n: shown, total: ALL_BADGES.length })}`}
      className={`h-8 gap-1 px-2 ${landing ? 'text-blue-100/75 hover:bg-white/10 hover:text-white' : ''}`}>
      <span key={pulse} className={pulse ? 'bc-landed inline-flex' : 'inline-flex'}><Trophy className="h-4 w-4 text-amber-500" aria-hidden /></span>
      <span className="text-xs font-bold tabular-nums">{shown}</span>
    </Button>
  );
}

// ─── Collection dialog ────────────────────────────────────────────────────
export function BadgeCollection() {
  const t = useT();
  const { badges, badgesSeen, badgeSound, setBadgeSound, windRoseTheme, setWindRoseTheme, lang } = useSkillCast();
  const { collectionOpen, setCollection, setReplay } = useBadgeUi();
  const snapshot = useProgressSnapshot();
  const earned = Object.keys(badges).filter((id) => badgesSeen.includes(id));
  const title = titleFor(earned.length);
  const frame = frameFor(earned);
  const sets = completedSets(earned);
  const dateFmt = new Intl.DateTimeFormat(lang === 'uz' ? 'uz-Latn-UZ' : lang === 'ru' ? 'ru-RU' : 'en-GB', { dateStyle: 'medium' });

  return (
    <Dialog open={collectionOpen} onOpenChange={setCollection}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-amber-500" aria-hidden />{t('ach.collection')}</DialogTitle>
          <DialogDescription>{t('ach.collection.d')}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-4 rounded-xl border bg-muted/40 p-3">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-background"
            style={{ boxShadow: frame ? `0 0 0 4px ${TIER_STYLE[frame].rim}, 0 0 0 6px ${TIER_STYLE[frame].edge}` : '0 0 0 2px var(--border)' }}>
            <Trophy className="h-7 w-7 text-amber-500" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">{t('ach.title')}</p>
            <p className="text-lg font-bold">{t(`ach.titles.${title.current}`)}</p>
            <p className="text-xs text-muted-foreground">
              {frame ? t(`ach.frame.${frame}`) : t('ach.frame.none')}
              {title.next && <> · {t('ach.nextTitle', { n: title.next.at - earned.length, title: t(`ach.titles.${title.next.id}`) })}</>}
            </p>
            <Progress className="mt-2" value={(earned.length / ALL_BADGES.length) * 100} aria-label={t('ach.count', { n: earned.length, total: ALL_BADGES.length })} />
            <p className="mt-1 text-xs font-semibold tabular-nums">{t('ach.count', { n: earned.length, total: ALL_BADGES.length })}</p>
          </div>
        </div>

        <ul className="space-y-2.5">
          {CATEGORIES.map((cat) => (
            <li key={cat.id} className="rounded-xl border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">{t(`ach.cat.${cat.id}`)}</p>
                {sets.includes(cat.id) && <span className="rounded-full bg-emerald-700 px-2 py-0.5 text-[11px] font-bold text-white">{t('ach.setDone')}</span>}
              </div>
              <p className="text-xs text-muted-foreground">{t(`ach.why.${cat.id}`)}</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {TIERS.map((tier) => {
                  const id = badgeId(cat.id, tier);
                  const has = earned.includes(id);
                  const prog = badgeProgress(id, snapshot);
                  const label = `${t(`ach.cat.${cat.id}`)}, ${t(`ach.tier.${tier}`)}`;
                  return (
                    <div key={tier} className="flex min-w-0 flex-col items-center gap-1 text-center">
                      {has ? (
                        <button type="button" onClick={() => { setCollection(false); setReplay(id); }}
                          className="rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 motion-safe:transition-transform motion-safe:hover:scale-105"
                          aria-label={t('ach.replay', { name: label })}>
                          <Medal id={id} size={52} />
                        </button>
                      ) : <Medal id={id} size={52} locked />}
                      <span className="text-[11px] font-semibold">{t(`ach.tier.${tier}`)}</span>
                      <span className="text-[11px] leading-snug text-muted-foreground">
                        {has ? t('ach.earnedOn', { date: dateFmt.format(new Date(badges[id])) }) : t(`ach.req.${cat.id}.${tier}`)}
                      </span>
                      {!has && prog.value >= prog.target && TIERS.indexOf(tier) > 0 ? (
                        <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">{t('ach.afterPrev', { tier: t(`ach.tier.${TIERS[TIERS.indexOf(tier) - 1]}`) })}</span>
                      ) : !has && prog.target > 1 && (
                        <span className="text-[11px] font-semibold tabular-nums text-muted-foreground">
                          <span className="sr-only">{t('ach.locked')}: </span>{Math.round(prog.value)} / {prog.target}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>

        <fieldset className="rounded-xl border p-3">
          <legend className="px-1 text-sm font-semibold">{t('ach.themes')}</legend>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(WIND_ROSE_THEMES) as WindRoseTheme[]).map((name) => {
              const open = WIND_ROSE_THEMES[name].unlock(earned);
              return (
                <button key={name} type="button" disabled={!open} aria-pressed={windRoseTheme === name} onClick={() => setWindRoseTheme(name)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs ${windRoseTheme === name ? 'border-primary ring-2 ring-primary/40' : ''} disabled:cursor-not-allowed disabled:opacity-60`}>
                  <span className="h-4 w-4 shrink-0 rounded-full" style={{ background: WIND_ROSE_THEMES[name].you }} aria-hidden />
                  <span>
                    <span className="block font-semibold">{t(`ach.theme.${name}`)}</span>
                    {!open && <span className="flex items-center gap-1 text-muted-foreground"><Lock className="h-3 w-3" aria-hidden />{t(`ach.theme.${name}.req`)}</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <label className="flex items-center justify-between gap-3 rounded-xl border p-3 text-sm">
          <span className="flex items-center gap-2">{badgeSound ? <Volume2 className="h-4 w-4" aria-hidden /> : <VolumeX className="h-4 w-4" aria-hidden />}{t('ach.sound')}</span>
          <Switch checked={badgeSound} onCheckedChange={setBadgeSound} aria-label={t('ach.sound')} />
        </label>
      </DialogContent>
    </Dialog>
  );
}

// ─── Compact summary for the pathway tab ──────────────────────────────────
export function BadgeSummary() {
  const t = useT();
  const { badges, badgesSeen } = useSkillCast();
  const setCollection = useBadgeUi((s) => s.setCollection);
  const snapshot = useProgressSnapshot();
  const earned = Object.keys(badges).filter((id) => badgesSeen.includes(id));
  // The locked badge closest to completion is the clearest next goal.
  const next = ALL_BADGES.filter((id) => !badges[id])
    .map((id) => ({ id, ...badgeProgress(id, snapshot) }))
    .sort((a, b) => b.value / b.target - a.value / a.target)[0];
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
      <ul className="flex flex-wrap gap-2" aria-label={t('ach.count', { n: earned.length, total: ALL_BADGES.length })}>
        {CATEGORIES.map((cat) => {
          const best = [...TIERS].reverse().find((tier) => earned.includes(badgeId(cat.id, tier)));
          return (
            <li key={cat.id} title={`${t(`ach.cat.${cat.id}`)}${best ? `, ${t(`ach.tier.${best}`)}` : ''}`}>
              <Medal id={badgeId(cat.id, best ?? 'bronze')} size={40} locked={!best} />
              <span className="sr-only">{t(`ach.cat.${cat.id}`)}: {best ? t(`ach.tier.${best}`) : t('ach.locked')}</span>
            </li>
          );
        })}
      </ul>
      <div className="flex flex-wrap items-center gap-2">
        {next && (
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{t('ach.next')}:</span> {t(`ach.cat.${parseBadge(next.id)!.cat}`)} ({t(`ach.tier.${parseBadge(next.id)!.tier}`)}) · {Math.round(next.value)} / {next.target}
          </p>
        )}
        <Button size="sm" variant="outline" onClick={() => setCollection(true)}><Trophy className="mr-1.5 h-4 w-4 text-amber-500" aria-hidden />{t('ach.open')}</Button>
      </div>
    </div>
  );
}

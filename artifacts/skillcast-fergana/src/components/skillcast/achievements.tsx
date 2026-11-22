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
import { dateFormatter } from '@/lib/dates';
import { pendingTheme, ThemeUnlockPrompt } from './theme-unlock';
import { ArtifactBadge } from './silk-artifacts';
import { playChime, type SoundKind } from '@/lib/reward-sound';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
interface BadgeUi {
  collectionOpen: boolean; replay: string | null; demo: string | null; nextPrompt: boolean;
  setCollection: (open: boolean) => void; setReplay: (id: string | null) => void;
  setDemo: (id: string | null) => void; setNextPrompt: (open: boolean) => void;
}
export const useBadgeUi = create<BadgeUi>((set) => ({
  collectionOpen: false, replay: null, demo: null, nextPrompt: false,
  setCollection: (open) => set({ collectionOpen: open }),
  setReplay: (id) => set({ replay: id }),
  setDemo: (id) => set({ demo: id }),
  setNextPrompt: (open) => set({ nextPrompt: open }),
}));

/** Picks a badge for the demo unlock: the locked one closest to completion, else any. */
export function demoBadge(earned: string[], snapshot: ProgressSnapshot): string {
  const locked = ALL_BADGES.filter((id) => !earned.includes(id))
    .map((id) => ({ id, ...badgeProgress(id, snapshot) }))
    .sort((a, b) => b.value / b.target - a.value / a.target);
  return locked[0]?.id ?? ALL_BADGES[Math.floor(Math.random() * ALL_BADGES.length)];
}

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

// ─── Reveal ───────────────────────────────────────────────────────────────
type Stage = 'silhouette' | 'spin' | 'burst' | 'info' | 'fly';
const TIMINGS: Record<'silhouette' | 'spin' | 'burst', number> = { silhouette: 900, spin: 1200, burst: 1000 };

function BadgeReveal({ id, remaining, replay, earnedBefore, onDone, onSkipAll, demo = false }: {
  id: string; remaining: number; replay: boolean; earnedBefore: string[];
  onDone: () => void; onSkipAll: () => void; demo?: boolean;
}) {
  const t = useT();
  const reduce = useReducedMotion();
  const { badgeSound, setBadgeSound, lang } = useSkillCast();
  const [stage, setStage] = useState<Stage>(reduce ? 'info' : 'silhouette');
  const medalRef = useRef<HTMLDivElement>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);
  const p = parseBadge(id)!;
  const name = t(`ach.cat.${p.cat}`), tierName = t(`ach.tier.${p.tier}`);
  const rewards = useMemo(() => (replay && !demo ? {} : rewardsFor(id, earnedBefore)), [id, replay, demo, earnedBefore]);

  useEffect(() => {
    if (stage === 'silhouette' || stage === 'spin' || stage === 'burst') {
      const next: Stage = stage === 'silhouette' ? 'spin' : stage === 'spin' ? 'burst' : 'info';
      // The demo was started by a click, so it always plays its sound.
      if (stage === 'burst' && (badgeSound || demo)) playChime(p.cat as SoundKind);
      const timer = window.setTimeout(() => setStage(next), TIMINGS[stage]);
      return () => window.clearTimeout(timer);
    }
    if (stage === 'info') primaryRef.current?.focus();
    return undefined;
  }, [stage, badgeSound, demo, p.cat]);

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
  const dateFmt = dateFormatter(lang);
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
          <DialogPrimitive.Title className="sr-only">{demo ? `${t('sb.demo.ribbon')}: ` : ''}{t('ach.new')}: {name}, {tierName}</DialogPrimitive.Title>
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
            <ArtifactBadge cat={p.cat} tier={p.tier} size={190} animate={stage === 'info' || stage === 'fly'} className={stage === 'silhouette' ? 'brightness-0' : ''} />
            {demo && <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 rotate-[-4deg] rounded-md border-2 border-dashed border-amber-300 bg-slate-950/90 px-2 py-0.5 text-xs font-black uppercase tracking-wider text-amber-300">{t('sb.demo.ribbon')}</span>}
          </div>

          {(stage === 'info' || stage === 'fly') && (
            <div className={`mt-4 w-full max-w-md rounded-2xl border border-white/15 bg-slate-900/90 p-5 text-center shadow-2xl ${stage === 'fly' ? 'opacity-0 transition-opacity duration-300' : 'bc-pop'}`}>
              <span className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-900" style={{ background: st.rim }}>{tierName}</span>
              <p className="mt-2 text-2xl font-extrabold tracking-tight">{t(`sb.art.${p.cat}.${p.tier}`)}</p>
              <p className="text-sm font-semibold text-teal-200">{name}</p>
              <p id="bc-desc" className="mt-1 text-sm font-medium text-amber-100">{demo ? t('sb.demo.d') : t(`ach.msg.${p.tier}`)}</p>
              <p className="mt-2 text-sm italic text-slate-200">{t(`sb.lore.${p.cat}.${p.tier}`)}</p>
              <dl className="mt-4 space-y-3 text-left text-sm">
                <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t('ach.how')}</dt><dd className="mt-0.5 text-slate-100">{t(`ach.req.${p.cat}.${p.tier}`)}</dd></div>
                <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t('ach.why')}</dt><dd className="mt-0.5 text-slate-100">{t(`ach.why.${p.cat}`)}</dd></div>
              </dl>
              {(rewards.title || rewards.theme || rewards.set || rewards.milestone) && (
                <>{demo && <p className="mt-4 text-left text-xs font-semibold text-amber-200">{t('sb.demo.rewards')}</p>}
                <ul className={`${demo ? 'mt-1 border border-dashed border-amber-300/50' : 'mt-4'} space-y-1.5 rounded-xl bg-white/5 p-3 text-left text-sm`} aria-label={t('ach.rewards')}>
                  {rewards.set && <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden />{t('ach.reward.set', { cat: t(`ach.cat.${rewards.set}`) })}</li>}
                  {rewards.title && <li className="flex gap-2"><Trophy className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden />{t('ach.reward.title', { title: t(`ach.titles.${rewards.title}`) })}</li>}
                  {rewards.theme && <li className="flex gap-2"><Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" aria-hidden />{t('ach.reward.theme', { theme: t(`ach.theme.${rewards.theme}`) })}</li>}
                  {rewards.milestone && <li className="flex gap-2"><Flame className="mt-0.5 h-4 w-4 shrink-0 text-orange-300" aria-hidden />{t('ach.reward.milestone', { pct: rewards.milestone })}</li>}
                </ul></>
              )}
              {replay && !demo && earnedAt && <p className="mt-3 text-xs text-slate-400">{t('ach.earnedOn', { date: dateFmt.format(new Date(earnedAt)) })}</p>}
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                <Button ref={primaryRef} onClick={replay || demo ? onDone : finish} className="min-h-11 min-w-40 bg-amber-400 font-bold text-slate-950 hover:bg-amber-300">
                  {demo ? t('sb.demo.done') : replay ? t('ach.close') : t('ach.add')}
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
  const { view, userType, learnerOnboarded, badges, badgesSeen, awardBadges, markBadgesSeen, themesAnnounced } = useSkillCast();
  const snapshot = useProgressSnapshot();
  const { replay, setReplay, collectionOpen, demo, setDemo, nextPrompt, setNextPrompt } = useBadgeUi();
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
  // A new Wind Rose colour is offered only after every badge reveal is done.
  const theme = active && !queue.length && view === 'dashboard' && !collectionOpen && !replay ? pendingTheme(earnedBefore, themesAnnounced) : null;
  const [themeOpen, setThemeOpen] = useState<string | null>(null);
  useEffect(() => {
    if (!theme) return;
    const id = window.setTimeout(() => {
      if (!document.querySelector('[role="alertdialog"], [role="dialog"]')) setThemeOpen(theme);
    }, 900);
    return () => window.clearTimeout(id);
  }, [theme]);

  if (demo) {
    return <BadgeReveal key={`demo-${demo}`} id={demo} remaining={0} replay demo earnedBefore={earnedBefore} onDone={() => setDemo(null)} onSkipAll={() => setDemo(null)} />;
  }
  if (replay) {
    return <BadgeReveal key={`replay-${replay}`} id={replay} remaining={0} replay earnedBefore={[]} onDone={() => setReplay(null)} onSkipAll={() => setReplay(null)} />;
  }
  if (!current) {
    // After the last reveal: a new colour (if any) is the next step; otherwise ask what to do next.
    if (themeOpen && theme === themeOpen) return <ThemeUnlockPrompt theme={theme} onClose={() => setThemeOpen(null)} />;
    return nextPrompt && !theme ? <NextStepPrompt onClose={() => setNextPrompt(false)} /> : null;
  }
  return (
    <BadgeReveal key={current} id={current} remaining={queue.length - 1} replay={false} earnedBefore={earnedBefore}
      onDone={() => { markBadgesSeen([current]); if (queue.length === 1) setNextPrompt(true); }}
      onSkipAll={() => { markBadgesSeen(queue); setNextPrompt(true); }} />
  );
}

/** Asked only once the badge celebration has fully finished. */
function NextStepPrompt({ onClose }: { onClose: () => void }) {
  const t = useT();
  const { setDashTab, setView } = useSkillCast();
  const setCollection = useBadgeUi((s) => s.setCollection);
  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-sm text-center" data-badge-next>
        <DialogHeader className="items-center">
          <TreasureChest className="h-12 w-12" open />
          <DialogTitle>{t('sb.next.title')}</DialogTitle>
          <DialogDescription>{t('sb.next.d')}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Button className="min-h-11 bg-amber-500 font-semibold text-slate-950 hover:bg-amber-400" onClick={() => { onClose(); setCollection(true); }}>{t('sb.next.collection')}</Button>
          <Button variant="outline" className="min-h-11" onClick={() => { onClose(); setView('dashboard'); setDashTab('pathway'); }}>{t('sb.next.learn')}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Header button (the collection the badges fly into) ───────────────────
/** Silk Road treasure chest, saffron gold with a teal gem. The lid opens on hover. */
export function TreasureChest({ className = 'h-[22px] w-[22px]', open = false }: { className?: string; open?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <defs>
        <linearGradient id="chest-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FBBF24" /><stop offset="1" stopColor="#D97706" /></linearGradient>
      </defs>
      <rect x="3" y="11" width="18" height="10" rx="1.6" fill="url(#chest-gold)" stroke="#92400E" strokeWidth="1.2" />
      <path d="M3 15h18" stroke="#92400E" strokeWidth="1" />
      <path d="M8 11v10M16 11v10" stroke="#B45309" strokeWidth="1" />
      <g className="chest-lid" style={open ? { transform: 'rotate(-22deg) translateY(-1px)' } : undefined}>
        <path d="M3 11 q0 -6 9 -6 q9 0 9 6 z" fill="#F59E0B" stroke="#92400E" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M7.5 6.5 q4.5 -2 9 0" fill="none" stroke="#FDE68A" strokeWidth="0.9" />
      </g>
      <path d="M12 12.2 l2.2 2.3 -2.2 2.3 -2.2 -2.3 z" fill="#10B981" stroke="#065F46" strokeWidth="0.7" />
      <path d="M11.4 13.4 l0.6 -0.6" stroke="#D1FAE5" strokeWidth="0.6" />
    </svg>
  );
}

export function CollectionButton({ landing }: { landing: boolean }) {
  const t = useT();
  const { userType, learnerOnboarded, badges, badgesSeen, badgesViewed } = useSkillCast();
  const setCollection = useBadgeUi((s) => s.setCollection);
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    const on = () => setPulse((n) => n + 1);
    window.addEventListener('skillcast:badge-landed', on);
    return () => window.removeEventListener('skillcast:badge-landed', on);
  }, []);
  if (userType !== 'individual' || !learnerOnboarded) return null;
  const earned = Object.keys(badges).filter((id) => badgesSeen.includes(id));
  const unviewed = earned.some((id) => !badgesViewed.includes(id));
  const label = `${t('sb.open')}: ${t('ach.count', { n: earned.length, total: ALL_BADGES.length })}${unviewed ? `. ${t('sb.new')}` : ''}`;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button id="badge-collection-target" type="button" onClick={() => setCollection(true)} aria-label={label}
          className={`chest-btn relative inline-flex h-9 min-w-11 items-center gap-1.5 overflow-visible rounded-full border px-2.5 text-xs font-bold tabular-nums transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 ${landing
            ? 'border-amber-400/40 bg-amber-400/10 text-amber-100 hover:bg-amber-400/20'
            : 'border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200 dark:hover:bg-amber-500/20'}`}>
          <span key={pulse} className={pulse ? 'bc-landed inline-flex' : 'inline-flex'}><TreasureChest /></span>
          <span>{earned.length}<span className="opacity-70">/{ALL_BADGES.length}</span></span>
          {unviewed && (
            <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5" aria-hidden>
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 motion-safe:animate-ping" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#10B981] ring-2 ring-background" />
            </span>
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent>{t('sb.open')}</TooltipContent>
    </Tooltip>
  );
}

// ─── Collection dialog: Silk Road & Childhood Treasures ───────────────────
export function BadgeCollection() {
  const t = useT();
  const { badges, badgesSeen, badgeSound, setBadgeSound, windRoseTheme, setWindRoseTheme, lang, markBadgesViewed } = useSkillCast();
  const { collectionOpen, setCollection, setDemo } = useBadgeUi();
  const snapshot = useProgressSnapshot();
  const earned = Object.keys(badges).filter((id) => badgesSeen.includes(id));
  const title = titleFor(earned.length);
  const frame = frameFor(earned);
  const sets = completedSets(earned);
  const dateFmt = dateFormatter(lang);
  // Opening the collection counts as having seen every earned treasure.
  useEffect(() => { if (collectionOpen) markBadgesViewed(earned); }, [collectionOpen, earned.length]); // eslint-disable-line react-hooks/exhaustive-deps
  const testCat = (parseBadge(earned[earned.length - 1] ?? '')?.cat ?? 'first-steps') as SoundKind;

  return (
    <Dialog open={collectionOpen} onOpenChange={setCollection}>
      <DialogContent data-silk-collection className="max-h-[92vh] overflow-y-auto border-amber-200 bg-[#FFFBEB] p-4 text-slate-900 dark:border-amber-500/30 dark:bg-[#0B1120] dark:text-slate-100 sm:max-w-3xl sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 pr-8 text-xl"><TreasureChest className="h-7 w-7" open />{t('sb.title')}</DialogTitle>
          <DialogDescription className="text-slate-700 dark:text-slate-300">{t('sb.lede')}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-amber-200 bg-white/70 p-3 dark:border-amber-500/20 dark:bg-white/5">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/10"
            style={{ boxShadow: frame ? `0 0 0 4px ${TIER_STYLE[frame].rim}, 0 0 0 6px ${TIER_STYLE[frame].edge}` : '0 0 0 2px var(--border)' }}>
            <TreasureChest className="h-8 w-8" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-600 dark:text-slate-400">{t('ach.title')}</p>
            <p className="text-lg font-bold">{t(`ach.titles.${title.current}`)}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {frame ? t(`ach.frame.${frame}`) : t('ach.frame.none')}
              {title.next && <> · {t('ach.nextTitle', { n: title.next.at - earned.length, title: t(`ach.titles.${title.next.id}`) })}</>}
            </p>
            <Progress className="mt-2 [&>div]:bg-amber-500" value={(earned.length / ALL_BADGES.length) * 100} aria-label={t('ach.count', { n: earned.length, total: ALL_BADGES.length })} />
            <p className="mt-1 text-xs font-semibold tabular-nums">{t('ach.count', { n: earned.length, total: ALL_BADGES.length })}</p>
          </div>
        </div>

        <ul className="space-y-3">
          {CATEGORIES.map((cat) => (
            <li key={cat.id} className="rounded-2xl border border-amber-200/80 bg-white/60 p-3 dark:border-slate-700 dark:bg-slate-900/60">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">{t(`ach.cat.${cat.id}`)}</p>
                {sets.includes(cat.id) && <span className="rounded-full bg-emerald-700 px-2 py-0.5 text-[11px] font-bold text-white">{t('ach.setDone')}</span>}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">{t(`sb.story.${cat.id}`)}</p>
              <div className="mt-2 grid grid-cols-1 gap-2 min-[420px]:grid-cols-3">
                {TIERS.map((tier) => {
                  const id = badgeId(cat.id, tier);
                  const has = earned.includes(id);
                  const prog = badgeProgress(id, snapshot);
                  return has ? (
                    <TreasureSlot key={tier} id={id} earnedAt={badges[id]} dateFmt={dateFmt} />
                  ) : (
                    <div key={tier} className="flex min-w-0 flex-row items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-100/70 p-2 text-left dark:border-slate-700 dark:bg-slate-950/60 min-[420px]:flex-col min-[420px]:text-center">
                      <button type="button" className="shrink-0 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500"
                        aria-label={`${t('sb.locked')}: ${t(`ach.tier.${tier}`)}. ${t(`sb.riddle.${cat.id}.${tier}`)}`}
                        onMouseEnter={() => badgeSound && playChime('locked', 0.5)}>
                        <ArtifactBadge cat={cat.id} tier={tier} size={64} locked />
                      </button>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t(`ach.tier.${tier}`)}</p>
                        <p className="text-sm italic leading-snug text-slate-700 dark:text-slate-300">“{t(`sb.riddle.${cat.id}.${tier}`)}”</p>
                        {!(prog.value >= prog.target && TIERS.indexOf(tier) > 0) && prog.target > 1 && (
                          <p className="mt-1 text-[11px] font-semibold tabular-nums text-amber-800 dark:text-amber-300">{Math.round(prog.value)} / {prog.target}</p>
                        )}
                        {prog.value >= prog.target && TIERS.indexOf(tier) > 0 && (
                          <p className="mt-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">{t('ach.afterPrev', { tier: t(`ach.tier.${TIERS[TIERS.indexOf(tier) - 1]}`) })}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>

        <fieldset className="rounded-xl border border-amber-200 p-3 dark:border-slate-700">
          <legend className="px-1 text-sm font-semibold">{t('ach.themes')}</legend>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(WIND_ROSE_THEMES) as WindRoseTheme[]).map((name) => {
              const open = WIND_ROSE_THEMES[name].unlock(earned);
              return (
                <button key={name} type="button" disabled={!open} aria-pressed={windRoseTheme === name} onClick={() => setWindRoseTheme(name)}
                  className={`flex min-h-11 items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs ${windRoseTheme === name ? 'border-amber-500 ring-2 ring-amber-500/40' : 'border-slate-300 dark:border-slate-700'} disabled:cursor-not-allowed disabled:opacity-60`}>
                  <span className="h-4 w-4 shrink-0 rounded-full" style={{ background: WIND_ROSE_THEMES[name].you }} aria-hidden />
                  <span>
                    <span className="block font-semibold">{t(`ach.theme.${name}`)}</span>
                    {!open && <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400"><Lock className="h-3 w-3" aria-hidden />{t(`ach.theme.${name}.req`)}</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 p-3 text-sm dark:border-slate-700">
          <label className="flex items-center gap-2">
            {badgeSound ? <Volume2 className="h-4 w-4" aria-hidden /> : <VolumeX className="h-4 w-4" aria-hidden />}{t('ach.sound')}
            <Switch checked={badgeSound} onCheckedChange={setBadgeSound} aria-label={t('ach.sound')} />
          </label>
          <Button variant="outline" size="sm" className="min-h-11 sm:min-h-9" onClick={() => playChime(testCat)}>
            <Volume2 className="mr-1.5 h-4 w-4" aria-hidden />{t('sb.test')}
          </Button>
        </div>

        <div className="rounded-xl border-2 border-dashed border-amber-400/70 bg-amber-100/50 p-3 dark:bg-amber-500/5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="min-w-0 basis-full text-xs text-slate-700 dark:text-slate-300 sm:flex-1 sm:basis-0">{t('sb.demo.d')}</p>
            <Button size="sm" data-demo-unlock className="min-h-11 bg-amber-500 font-semibold text-slate-950 hover:bg-amber-400 sm:min-h-9"
              onClick={() => { setCollection(false); setDemo(demoBadge(earned, snapshot)); }}>
              <Sparkles className="mr-1.5 h-4 w-4" aria-hidden />{t('sb.demo')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** An earned treasure: hover shimmers (and chimes if sound is on); click opens its lore. */
function TreasureSlot({ id, earnedAt, dateFmt }: { id: string; earnedAt: string; dateFmt: { format: (d: Date) => string } }) {
  const t = useT();
  const { badgeSound } = useSkillCast();
  const { setCollection, setReplay } = useBadgeUi();
  const p = parseBadge(id)!;
  const [spin, setSpin] = useState(0);
  const lastHover = useRef(0);
  const art = t(`sb.art.${p.cat}.${p.tier}`);
  const replay = () => { setSpin((n) => n + 1); if (badgeSound) playChime(p.cat as SoundKind); };
  return (
    <Popover onOpenChange={(open) => { if (open) replay(); }}>
      <PopoverTrigger asChild>
        <button type="button" aria-label={`${art} — ${t(`ach.cat.${p.cat}`)}, ${t(`ach.tier.${p.tier}`)}`}
          onMouseEnter={() => { const now = Date.now(); if (badgeSound && now - lastHover.current > 1500) { lastHover.current = now; playChime(p.cat as SoundKind, 0.35); } }}
          className="flex min-w-0 flex-row items-center gap-3 rounded-xl border border-amber-300/70 bg-gradient-to-b from-amber-50 to-white p-2 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500 dark:border-amber-500/30 dark:from-slate-800 dark:to-slate-900 min-[420px]:flex-col min-[420px]:text-center">
          <ArtifactBadge cat={p.cat} tier={p.tier} size={64} />
          <span className="min-w-0">
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300">{t(`ach.tier.${p.tier}`)}</span>
            <span className="block text-sm font-semibold leading-snug">{art}</span>
            <span className="block text-[11px] text-slate-600 dark:text-slate-400">{t('ach.earnedOn', { date: dateFmt.format(new Date(earnedAt)) })}</span>
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 border-amber-300 bg-[#FFFBEB] text-slate-900 dark:border-amber-500/40 dark:bg-[#0B1120] dark:text-slate-100" data-lore>
        <div className="flex items-center gap-3">
          <ArtifactBadge key={spin} cat={p.cat} tier={p.tier} size={84} className="motion-safe:animate-[bc-pop_.5s_ease-out]" />
          <div className="min-w-0">
            <p className="font-bold leading-snug">{art}</p>
            <p className="text-xs text-teal-800 dark:text-teal-300">{t(`ach.cat.${p.cat}`)} · {t(`ach.tier.${p.tier}`)}</p>
          </div>
        </div>
        <p className="mt-3 text-sm italic">{t(`sb.lore.${p.cat}.${p.tier}`)}</p>
        <dl className="mt-3 space-y-2 text-sm">
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('sb.story')}</dt><dd>{t(`sb.story.${p.cat}`)}</dd></div>
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('sb.earned')}</dt><dd>{dateFmt.format(new Date(earnedAt))}</dd></div>
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('sb.why')}</dt><dd>{t(`ach.req.${p.cat}.${p.tier}`)}</dd></div>
        </dl>
        {!badgeSound && <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">{t('sb.soundOff')}</p>}
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" variant="outline" className="min-h-11 sm:min-h-8" onClick={replay}>{t('sb.replay')}</Button>
          <Button size="sm" variant="ghost" className="min-h-11 sm:min-h-8" onClick={() => { setCollection(false); setReplay(id); }}>{t('sb.replayFull')}</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── Compact summary for the pathway tab ──────────────────────────────────
export function BadgeSummary() {
  const t = useT();
  const { badges, badgesSeen } = useSkillCast();
  const setCollection = useBadgeUi((s) => s.setCollection);
  const setDemo = useBadgeUi((s) => s.setDemo);
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
              <ArtifactBadge cat={cat.id} tier={best ?? 'bronze'} size={44} locked={!best} animate={false} />
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
        <Button size="sm" variant="outline" className="min-h-11 sm:min-h-9" onClick={() => setCollection(true)}><TreasureChest className="mr-1.5 h-5 w-5" />{t('ach.open')}</Button>
        <Button size="sm" variant="ghost" className="min-h-11 border border-dashed border-amber-400 sm:min-h-9" onClick={() => setDemo(demoBadge(earned, snapshot))}><Sparkles className="mr-1.5 h-4 w-4 text-amber-500" aria-hidden />{t('sb.demo')}</Button>
      </div>
    </div>
  );
}

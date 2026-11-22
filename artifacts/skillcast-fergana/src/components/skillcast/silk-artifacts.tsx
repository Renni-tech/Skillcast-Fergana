'use client';

import { useId, type ReactNode } from 'react';
import type { CategoryId, Tier } from '@/lib/achievements';

// ─── Silk Road & Childhood Treasures: badge artifacts ──────────────────────
// Every badge is a small multi-layer SVG artifact on an eight-point
// Samarkand star medallion. Tiers change the metal (bronze, silver, gold) and
// the object grows richer:
//   First Steps        boots (worn → embroidered → gold-trimmed)   bouncing step, sand sparkles
//   Career Explorer    compass → astrolabe → sextant               spinning needle, rotating rings
//   Curious Mind       magic lamp (plain → engraved → jewelled)    rising stars
//   Consistent Learner tulip bud → open tulip → pomegranate        petal-bloom pulse
//   Skill Builder      Rishtan bowl → jug → great plate (lagan)    glaze shine, turning wheel
//   Knowledge Seeker   scroll → open book → illuminated manuscript turning page, glowing letters
//   Goal Achiever      bow and arrow → arrow in target → flying carpet   levitation, swaying tassels
//   Future Ready       Humo bird (fledgling → soaring → crowned)  wing shimmer, golden halo
// Animations are CSS classes in globals.css (sa-*) and stop with reduced motion.

export const SET_ACCENT: Record<CategoryId, { from: string; to: string; ink: string }> = {
  'first-steps': { from: '#b45309', to: '#78350f', ink: '#fde68a' },
  'career-explorer': { from: '#1d4ed8', to: '#172554', ink: '#bfdbfe' },
  'curious-mind': { from: '#6d28d9', to: '#2e1065', ink: '#ddd6fe' },
  'consistent-learner': { from: '#be123c', to: '#4c0519', ink: '#fecdd3' },
  'skill-builder': { from: '#0e7490', to: '#083344', ink: '#a5f3fc' },
  'knowledge-seeker': { from: '#047857', to: '#022c22', ink: '#a7f3d0' },
  'goal-achiever': { from: '#c2410c', to: '#431407', ink: '#fed7aa' },
  'future-ready': { from: '#0d9488', to: '#042f2e', ink: '#99f6e4' },
};

const METAL: Record<Tier, [string, string, string]> = {
  bronze: ['#f6c79b', '#cd7f32', '#6b3410'],
  silver: ['#ffffff', '#c4cfdc', '#4b5a6e'],
  gold: ['#fff7c2', '#f5b301', '#8a5300'],
};

const STAR = 'M50 2 L61.5 22.3 L83.9 16.1 L77.7 38.5 L98 50 L77.7 61.5 L83.9 83.9 L61.5 77.7 L50 98 L38.5 77.7 L16.1 83.9 L22.3 61.5 L2 50 L22.3 38.5 L16.1 16.1 L38.5 22.3 Z';

function Boots({ tier, m }: { tier: Tier; m: string }) {
  return (
    <g>
      <g className="sa-sand">
        {[[30, 74], [70, 76], [50, 80], [40, 70], [62, 70]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={1.6} fill="#fde68a" style={{ animationDelay: `${i * 0.25}s` }} />)}
      </g>
      <g className="sa-bounce">
        <path d="M36 30 h12 v26 l12 6 q6 3 4 9 h-30 z" fill="#7c2d12" stroke="#2a0f05" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M36 66 h30 v4 h-30 z" fill="#3b1406" />
        {tier === 'bronze' && <path d="M38 40 h8 M38 46 h8" stroke="#c2410c" strokeWidth="1.2" strokeDasharray="2 1.5" />}
        {tier !== 'bronze' && <path d="M38 38 q5 -4 8 0 q-3 4 -8 0 M38 46 q5 -4 8 0 q-3 4 -8 0" fill="none" stroke={tier === 'gold' ? '#fde047' : '#2dd4bf'} strokeWidth="1.4" />}
        {tier === 'silver' && <circle cx="42" cy="56" r="2" fill="#2dd4bf" stroke="#e2e8f0" />}
        {tier === 'gold' && <>
          <path d="M36 30 h12" stroke="#fde047" strokeWidth="3" /><circle cx="42" cy="56" r="2" fill="#2dd4bf" stroke={m} />
          <g className="sa-wing"><path d="M36 40 q-14 -10 -18 -2 q6 0 8 4 q-6 0 -6 4 q8 -2 16 0 z" fill="#fde047" stroke="#8a5300" strokeWidth="1" /></g>
        </>}
      </g>
    </g>
  );
}

function Explorer({ tier, m }: { tier: Tier; m: string }) {
  if (tier === 'bronze') {
    return (
      <g>
        <circle cx="50" cy="50" r="22" fill="#1e293b" stroke={m} strokeWidth="3" />
        {[0, 90, 180, 270].map((a) => <path key={a} d="M50 31 l2 5 h-4 z" fill="#e2e8f0" transform={`rotate(${a} 50 50)`} />)}
        <g className="sa-needle"><path d="M50 34 L54 50 L50 66 L46 50 Z" fill="#ef4444" /><path d="M50 50 L54 50 L50 66 L46 50 Z" fill="#e2e8f0" /><circle cx="50" cy="50" r="2.4" fill={m} /></g>
      </g>
    );
  }
  if (tier === 'silver') {
    return (
      <g>
        <circle cx="50" cy="50" r="24" fill="#0f172a" stroke={m} strokeWidth="2.5" />
        <g className="sa-ring"><circle cx="50" cy="50" r="18" fill="none" stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="2 2.5" />
          <path d="M50 32 v36 M32 50 h36" stroke="#94a3b8" strokeWidth="0.8" /></g>
        <g className="sa-ring-rev"><ellipse cx="50" cy="50" rx="14" ry="7" fill="none" stroke="#fde68a" strokeWidth="1.2" /></g>
        <g className="sa-needle"><path d="M50 50 L66 44" stroke={m} strokeWidth="2.4" strokeLinecap="round" /></g>
        <circle cx="50" cy="26" r="3" fill="none" stroke={m} strokeWidth="2" />
      </g>
    );
  }
  return (
    <g>
      <path d="M28 70 A30 30 0 0 1 72 70" fill="none" stroke={m} strokeWidth="3" />
      {Array.from({ length: 9 }, (_, i) => <path key={i} d="M50 40 l0 -4" stroke="#fde68a" strokeWidth="1" transform={`rotate(${-60 + i * 15} 50 72)`} />)}
      <path d="M50 30 L30 70 M50 30 L70 70" stroke="#fde68a" strokeWidth="2.2" strokeLinecap="round" />
      <g className="sa-needle-sweep"><path d="M50 30 L62 66" stroke="#2dd4bf" strokeWidth="2.4" strokeLinecap="round" /></g>
      <circle cx="50" cy="30" r="4" fill={m} stroke="#422006" strokeWidth="1" />
      <rect x="56" y="40" width="10" height="6" rx="2" fill="#0f172a" stroke={m} />
    </g>
  );
}

function Lamp({ tier, m }: { tier: Tier; m: string }) {
  return (
    <g>
      {tier === 'silver' && <g className="sa-stars"><path d="M74 46 q4 -10 -4 -16 q8 -2 6 -10" fill="none" stroke="#5eead4" strokeWidth="3" strokeLinecap="round" opacity="0.7" /></g>}
      {tier === 'gold' && <path className="sa-letters" d="M46 30 L56 24 L50 18 M56 24 L62 32" fill="none" stroke="#fde68a" strokeWidth="0.8" opacity="0.8" />}
      <g className="sa-stars">
        {[[46, 30], [56, 24], [50, 18], [62, 32]].map(([x, y], i) => (
          <path key={i} d={`M${x} ${y - 3} l1 2 2 1 -2 1 -1 2 -1 -2 -2 -1 2 -1 z`} fill="#fde68a" style={{ animationDelay: `${i * 0.35}s` }} />
        ))}
      </g>
      <path d="M26 58 q4 -14 24 -14 q20 0 22 10 l10 -6 q2 0 1 3 l-10 10 q-2 8 -23 8 q-20 0 -24 -11 z" fill={m} stroke="#422006" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M40 44 q10 -8 20 0" fill="none" stroke="#422006" strokeWidth="1.5" />
      <path d="M24 56 q-6 0 -6 6 q0 6 8 5" fill="none" stroke={m} strokeWidth="3" />
      <rect x="40" y="68" width="22" height="5" rx="2" fill="#422006" />
      {tier !== 'bronze' && <path d="M34 58 q6 -4 12 0 q6 4 12 0" fill="none" stroke="#422006" strokeWidth="1" />}
      {tier === 'gold' && <><circle cx="50" cy="54" r="3" fill="#2dd4bf" stroke="#fff7c2" /><circle cx="38" cy="57" r="1.6" fill="#ef4444" /><circle cx="62" cy="57" r="1.6" fill="#ef4444" /></>}
    </g>
  );
}

function Bloom({ tier }: { tier: Tier }) {
  if (tier === 'gold') {
    return (
      <g className="sa-bloom">
        <path d="M44 30 l3 -6 3 5 3 -5 3 6" fill="#be123c" stroke="#4c0519" strokeWidth="1" />
        <circle cx="50" cy="52" r="20" fill="#e11d48" stroke="#4c0519" strokeWidth="1.5" />
        <path d="M36 46 q14 -10 28 0" fill="none" stroke="#fda4af" strokeWidth="1.4" opacity="0.8" />
        {[[44, 54], [50, 58], [56, 54], [47, 62], [53, 62]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.2" fill="#fecdd3" />)}
      </g>
    );
  }
  const open = tier === 'silver';
  return (
    <g>
      <path d="M50 74 V50" stroke="#15803d" strokeWidth="3" />
      <path d="M50 66 q-12 -2 -14 -12 q10 2 14 10" fill="#22c55e" />
      <path d="M50 60 q12 -2 14 -12 q-10 2 -14 10" fill="#16a34a" />
      <g className="sa-bloom">
        {open ? (
          <>
            <path d="M50 50 q-16 -4 -14 -22 q8 6 14 4 z" fill="#e11d48" />
            <path d="M50 50 q16 -4 14 -22 q-8 6 -14 4 z" fill="#be123c" />
            <path d="M50 50 q-6 -12 0 -26 q6 14 0 26 z" fill="#fb7185" />
          </>
        ) : (
          <path d="M50 52 q-10 -6 -8 -18 q4 4 8 2 q4 2 8 -2 q2 12 -8 18 z" fill="#e11d48" stroke="#4c0519" strokeWidth="1" />
        )}
      </g>
    </g>
  );
}

function Pottery({ tier, m }: { tier: Tier; m: string }) {
  const glaze = '#0ea5e9';
  if (tier === 'bronze') {
    return (
      <g className="sa-wheel">
        <path d="M24 46 h52 q-4 24 -26 24 q-22 0 -26 -24 z" fill={glaze} stroke="#083344" strokeWidth="1.5" />
        <path d="M30 52 q20 8 40 0" fill="none" stroke="#e0f2fe" strokeWidth="1.5" />
        <ellipse cx="50" cy="46" rx="26" ry="4" fill="#075985" />
        <rect className="sa-shine" x="30" y="48" width="6" height="16" fill="#fff" opacity="0.35" />
      </g>
    );
  }
  if (tier === 'silver') {
    return (
      <g>
        <path d="M40 30 h20 l-3 8 q14 8 10 22 q-4 14 -17 14 q-13 0 -17 -14 q-4 -14 10 -22 z" fill={glaze} stroke="#083344" strokeWidth="1.5" />
        <path d="M66 44 q10 0 8 12 q-2 6 -8 6" fill="none" stroke="#083344" strokeWidth="2.5" />
        <path d="M38 52 q12 6 24 0 M40 60 q10 4 20 0" fill="none" stroke="#e0f2fe" strokeWidth="1.3" />
        <rect className="sa-shine" x="40" y="40" width="5" height="26" fill="#fff" opacity="0.3" />
        <path d="M40 30 h20" stroke={m} strokeWidth="2" />
      </g>
    );
  }
  return (
    <g className="sa-wheel">
      <circle cx="50" cy="50" r="27" fill="#0c4a6e" stroke={m} strokeWidth="2.5" />
      <circle cx="50" cy="50" r="20" fill={glaze} />
      {Array.from({ length: 8 }, (_, i) => <path key={i} d="M50 32 q5 9 0 18 q-5 -9 0 -18" fill="#e0f2fe" transform={`rotate(${i * 45} 50 50)`} />)}
      <circle cx="50" cy="50" r="5" fill={m} />
      <rect className="sa-shine" x="34" y="30" width="5" height="40" fill="#fff" opacity="0.25" transform="rotate(20 50 50)" />
    </g>
  );
}

function Manuscript({ tier, m }: { tier: Tier; m: string }) {
  if (tier === 'bronze') {
    return (
      <g>
        <rect x="30" y="34" width="40" height="32" rx="3" fill="#fef3c7" stroke="#78350f" strokeWidth="1.5" />
        <rect x="26" y="30" width="6" height="40" rx="3" fill="#92400e" /><rect x="68" y="30" width="6" height="40" rx="3" fill="#92400e" />
        <g className="sa-letters">{[42, 48, 54, 60].map((y, i) => <path key={y} d={`M36 ${y} h${24 - i * 3}`} stroke="#78350f" strokeWidth="1.5" style={{ animationDelay: `${i * 0.3}s` }} />)}</g>
      </g>
    );
  }
  return (
    <g>
      <path d="M50 36 q-12 -6 -26 -2 v34 q14 -4 26 2 z" fill="#fef3c7" stroke="#78350f" strokeWidth="1.5" />
      <path d="M50 36 q12 -6 26 -2 v34 q-14 -4 -26 2 z" fill="#fffbeb" stroke="#78350f" strokeWidth="1.5" />
      <g className="sa-page"><path d="M50 36 q8 -5 18 -3 v28 q-10 -2 -18 3 z" fill="#fde68a" stroke="#78350f" strokeWidth="1" /></g>
      <g className="sa-letters">{[46, 52, 58].map((y, i) => <path key={y} d={`M29 ${y} q8 -2 16 0`} fill="none" stroke="#065f46" strokeWidth="1.3" style={{ animationDelay: `${i * 0.3}s` }} />)}</g>
      {tier === 'gold' && <><path d="M62 40 l1.6 3.4 3.6 .5 -2.6 2.5 .6 3.6 -3.2 -1.7 -3.2 1.7 .6 -3.6 -2.6 -2.5 3.6 -.5 z" fill={m} /><path d="M24 34 v34" stroke={m} strokeWidth="2" /></>}
    </g>
  );
}

function Quest({ tier, m }: { tier: Tier; m: string }) {
  if (tier === 'bronze') {
    return (
      <g>
        <path d="M34 24 q22 26 0 52" fill="none" stroke="#7c2d12" strokeWidth="4" strokeLinecap="round" />
        <path d="M34 24 L34 76" stroke="#fde68a" strokeWidth="1" />
        <g className="sa-arrow"><path d="M30 50 H74" stroke="#422006" strokeWidth="2.2" /><path d="M74 50 l-7 -4 v8 z" fill={m} /><path d="M30 50 l-5 -4 M30 50 l-5 4" stroke="#ef4444" strokeWidth="2" /></g>
      </g>
    );
  }
  if (tier === 'silver') {
    return (
      <g className="sa-arrow">
        <path d="M24 66 L74 34" stroke="#e2e8f0" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M74 34 l-9 1 5 7 z" fill="#2dd4bf" stroke="#0f172a" strokeWidth="0.8" />
        <path d="M30 62 q-10 -2 -12 -10 q8 2 14 6 z M27 64 q-6 6 -2 14 q4 -6 6 -12 z" fill="#f8fafc" stroke="#475569" strokeWidth="0.8" />
        <path d="M28 60 l-6 -3 M26 64 l-4 5" stroke="#78350f" strokeWidth="0.8" />
      </g>
    );
  }
  return (
    <g className="sa-levitate">
      <path d="M22 50 q28 -10 56 0 l-4 14 q-24 -8 -48 0 z" fill="#b91c1c" stroke="#450a0a" strokeWidth="1.5" />
      <path d="M28 52 q22 -7 44 0 l-2 7 q-20 -6 -40 0 z" fill="none" stroke={m} strokeWidth="1.3" />
      <path d="M44 52 l6 3 6 -3 -6 -3 z" fill="#2dd4bf" />
      {[24, 34, 66, 76].map((x, i) => <g key={x} className="sa-tassel" style={{ transformOrigin: `${x}px ${i < 2 ? 63 : 63}px`, animationDelay: `${i * 0.15}s` }}><path d={`M${x} 63 v8`} stroke={m} strokeWidth="1.5" /><circle cx={x} cy="72" r="1.8" fill={m} /></g>)}
    </g>
  );
}

function Humo({ tier, m }: { tier: Tier; m: string }) {
  if (tier === 'bronze') {
    return (
      <g className="sa-wing">
        <path d="M58 24 q-22 14 -16 46 q2 6 6 8 q-2 -24 10 -54 z" fill="#f59e0b" stroke="#78350f" strokeWidth="1.2" />
        <path d="M58 24 q-6 26 -10 54" stroke="#78350f" strokeWidth="1.2" fill="none" />
        {[34, 42, 50, 58].map((y) => <path key={y} d={`M${56 - (y - 24) / 6} ${y} l-8 4`} stroke="#fde68a" strokeWidth="0.8" />)}
        <circle cx="56" cy="28" r="2.4" fill="#2dd4bf" />
      </g>
    );
  }
  if (tier === 'silver') {
    return (
      <g>
        <g className="sa-wing">
          <path d="M50 64 q-24 -14 -26 -36 q14 8 26 26 z" fill="#e2e8f0" stroke="#334155" strokeWidth="1.2" />
          <path d="M50 64 q24 -14 26 -36 q-14 8 -26 26 z" fill="#cbd5e1" stroke="#334155" strokeWidth="1.2" />
        </g>
        <path d="M44 30 l6 -10 6 10 -6 34 z" fill="#2dd4bf" stroke="#134e4a" strokeWidth="1.2" />
        <circle cx="50" cy="40" r="3" fill={m} />
      </g>
    );
  }
  const big = true;
  return (
    <g>
      {tier === 'gold' && <circle className="sa-halo" cx="50" cy="44" r="26" fill="none" stroke={m} strokeWidth="2" strokeDasharray="3 3" />}
      <g className="sa-wing">
        <path d={big ? 'M50 50 q-26 -26 -32 -6 q14 -2 32 12' : 'M50 52 q-18 -16 -24 -2 q10 0 24 8'} fill="#14b8a6" stroke="#042f2e" strokeWidth="1.2" />
        <path d={big ? 'M50 50 q26 -26 32 -6 q-14 -2 -32 12' : 'M50 52 q18 -16 24 -2 q-10 0 -24 8'} fill="#0d9488" stroke="#042f2e" strokeWidth="1.2" />
      </g>
      <path d="M50 38 q6 8 0 26 q-6 -18 0 -26 z" fill={m} stroke="#422006" strokeWidth="1" />
      <circle cx="50" cy="38" r="4" fill={m} stroke="#422006" strokeWidth="1" />
      <path d="M53 37 l4 1 -4 1.5" fill="#f97316" />
      <path d="M46 64 q4 10 4 14 q0 -4 4 -14" fill="#fbbf24" stroke="#422006" strokeWidth="0.8" />
      {tier === 'gold' && <path d="M46 33 l1.5 -4 2.5 3 2.5 -3 1.5 4 z" fill="#fde047" stroke="#422006" strokeWidth="0.6" />}
    </g>
  );
}

const ART: Record<CategoryId, (p: { tier: Tier; m: string }) => ReactNode> = {
  'first-steps': Boots, 'career-explorer': Explorer, 'curious-mind': Lamp, 'consistent-learner': ({ tier }) => <Bloom tier={tier} />,
  'skill-builder': Pottery, 'knowledge-seeker': Manuscript, 'goal-achiever': Quest, 'future-ready': Humo,
};

/** Simplified dark shape for a locked badge: the outline of what is to come. */
function Silhouette({ cat }: { cat: CategoryId }) {
  const d: Record<CategoryId, string> = {
    'first-steps': 'M36 30 h12 v26 l12 6 q6 3 4 9 h-30 z',
    'career-explorer': 'M50 26 a24 24 0 1 0 0.1 0 z',
    'curious-mind': 'M26 58 q4 -14 24 -14 q20 0 22 10 l10 -6 q2 0 1 3 l-10 10 q-2 8 -23 8 q-20 0 -24 -11 z',
    'consistent-learner': 'M50 74 V50 M50 52 q-10 -6 -8 -18 q4 4 8 2 q4 2 8 -2 q2 12 -8 18 z',
    'skill-builder': 'M24 46 h52 q-4 24 -26 24 q-22 0 -26 -24 z',
    'knowledge-seeker': 'M50 36 q-12 -6 -26 -2 v34 q14 -4 26 2 q12 -6 26 -2 v-34 q-14 -4 -26 2 z',
    'goal-achiever': 'M22 50 q28 -10 56 0 l-4 14 q-24 -8 -48 0 z',
    'future-ready': 'M50 50 q-26 -26 -32 -6 q14 -2 32 12 q18 -14 32 -12 q-6 -20 -32 6 z',
  };
  return <path d={d[cat]} fill="#0b1120" stroke="#334155" strokeWidth="1.5" opacity="0.9" />;
}

export function ArtifactBadge({ cat, tier, size = 96, locked = false, animate = true, className = '' }: {
  cat: CategoryId; tier: Tier; size?: number; locked?: boolean; animate?: boolean; className?: string;
}) {
  const uid = useId().replace(/:/g, '');
  const [hi, mid, lo] = METAL[tier];
  const accent = SET_ACCENT[cat];
  const Art = ART[cat];
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden
      className={`sa-badge shrink-0 overflow-visible ${locked ? 'sa-locked' : ''} ${animate && !locked ? 'sa-animate' : ''} ${className}`}>
      <defs>
        <linearGradient id={`m${uid}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={hi} /><stop offset="0.5" stopColor={mid} /><stop offset="1" stopColor={lo} /></linearGradient>
        <radialGradient id={`a${uid}`} cx="0.35" cy="0.3" r="0.8"><stop offset="0" stopColor={accent.from} /><stop offset="1" stopColor={accent.to} /></radialGradient>
        <radialGradient id={`v${uid}`} cx="0.4" cy="0.35" r="0.8"><stop offset="0" stopColor="#334155" /><stop offset="1" stopColor="#0b1120" /></radialGradient>
      </defs>
      {locked ? (
        <>
          <path d={STAR} fill={`url(#v${uid})`} stroke="#475569" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="33" fill="#111827" stroke="#1f2937" strokeWidth="2" />
          <g opacity="0.55"><Silhouette cat={cat} /></g>
          <g className="sa-q"><circle cx="50" cy="50" r="13" fill="#0b1120" stroke="#f59e0b" strokeWidth="2" /><text x="50" y="56" textAnchor="middle" fontSize="18" fontWeight="800" fill="#fbbf24" fontFamily="Georgia, serif">?</text></g>
        </>
      ) : (
        <>
          <path d={STAR} fill={`url(#m${uid})`} stroke={lo} strokeWidth="1.5" />
          <path d={STAR} fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="0.8" transform="translate(50 50) scale(0.9) translate(-50 -50)" />
          <circle cx="50" cy="50" r="33" fill={`url(#a${uid})`} stroke={lo} strokeWidth="2" />
          <circle cx="50" cy="50" r="30" fill="none" stroke={accent.ink} strokeOpacity="0.35" strokeWidth="0.8" strokeDasharray="1.5 2.5" />
          <g transform="translate(50 50) scale(0.98) translate(-50 -50)"><Art tier={tier} m={mid} /></g>
          <path className="sa-glint" d="M20 30 L34 16" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0" />
        </>
      )}
    </svg>
  );
}

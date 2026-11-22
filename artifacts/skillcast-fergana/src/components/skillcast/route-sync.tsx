'use client';

// ─── Traceable navigation ─────────────────────────────────────────────────
// Each screen and dashboard tab gets its own address (#/forecast/radar), so
// the browser's Back and Forward buttons move between screens, a page can be
// bookmarked or sent to someone, and the tab title says where you are.
// Hash-based, so it works on any static host without server rewrites.

import { useEffect, useRef } from 'react';
import { useSkillCast, type View } from '@/lib/store';
import { useT } from './shared';

export const DASH_TABS = ['overview', 'matches', 'radar', 'pathway', 'harada', 'progress', 'sdg', 'demand'] as const;
const TAB_LABEL: Record<string, string> = {
  overview: 'tab.overview', matches: 'tab.matches', radar: 'ov.radar.title', pathway: 'tab.learn',
  harada: 'tab.harada', progress: 'Progress', sdg: 'tab.sdg', demand: 'tab.demand',
};
const VIEW_SLUG: Record<View, string> = {
  landing: '', onboarding: 'start', dashboard: 'forecast', employer: 'employer', institution: 'institution', signals: 'signals',
};
const SLUG_VIEW = Object.fromEntries(Object.entries(VIEW_SLUG).map(([v, s]) => [s, v])) as Record<string, View>;

export function hashFor(view: View, tab: string): string {
  if (view === 'landing') return '#/';
  if (view === 'dashboard') return `#/forecast/${(DASH_TABS as readonly string[]).includes(tab) ? tab : 'overview'}`;
  return `#/${VIEW_SLUG[view]}`;
}

export function parseHash(hash: string): { view: View; tab?: string } | null {
  const m = /^#\/?([a-z-]*)(?:\/([a-z-]+))?\/?$/.exec(hash || '');
  if (!m) return null;
  const view = SLUG_VIEW[m[1] ?? ''];
  if (!view) return null;
  const tab = view === 'dashboard' && m[2] && (DASH_TABS as readonly string[]).includes(m[2]) ? m[2] : undefined;
  return { view, tab };
}

export function RouteSync() {
  const t = useT();
  const { view, dashTab, learnerOnboarded, userType } = useSkillCast();
  const applying = useRef(false);
  const first = useRef(true);

  // Address → state: on load and on Back/Forward.
  useEffect(() => {
    const apply = () => {
      const route = parseHash(window.location.hash);
      if (!route) return;
      const st = useSkillCast.getState();
      // A learner without a profile is sent to onboarding instead of an empty forecast.
      const view = route.view === 'dashboard' && !(st.learnerOnboarded || st.userType === 'employer') ? 'onboarding' : route.view;
      applying.current = true;
      useSkillCast.setState({ view, ...(route.tab ? { dashTab: route.tab } : {}) });
    };
    apply();
    window.addEventListener('popstate', apply);
    return () => window.removeEventListener('popstate', apply);
  }, []);

  // State → address and tab title.
  useEffect(() => {
    const target = hashFor(view, dashTab);
    if (window.location.hash !== target) {
      // The first sync and changes caused by Back/Forward replace; user navigation adds history.
      if (first.current || applying.current) window.history.replaceState(null, '', target);
      else window.history.pushState(null, '', target);
    }
    first.current = false;
    applying.current = false;
    const where = view === 'dashboard' ? t(TAB_LABEL[dashTab] ?? 'tab.overview')
      : view === 'onboarding' ? t('nav.dashboard')
        : view === 'employer' ? t('nav.employer')
          : view === 'signals' ? t('nav.signals')
            : view === 'institution' ? t('nav.institution')
              : '';
    document.title = where ? `${where} · SkillCast Fergana` : 'SkillCast Fergana';
  }, [view, dashTab, t, learnerOnboarded, userType]);

  return null;
}

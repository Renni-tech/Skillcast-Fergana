'use client';

import { useMemo, useState } from 'react';
import { Bot, CircleCheck, Cpu, GitBranch, Sparkles, Sprout } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ROLE_MAP } from '@/data/roles';
import type { RoleMatch } from '@/lib/types';
import { useSkillCast } from '@/lib/store';
import { strategyPriority } from '@/lib/matching';
import { normalizeProfile } from '@/lib/profile';
import { roleSdgMechanism, roleTagline, roleTitle, skillCategory, skillName, SdgBadge, useSignals, useT } from './shared';

const FORKS = [
  {
    id: 'work-with-ai',
    labelKey: 'match.fork.work',
    descKey: 'match.fork.work.d',
    icon: Cpu,
  },
  {
    id: 'pivot',
    labelKey: 'match.fork.pivot',
    descKey: 'match.fork.pivot.d',
    icon: GitBranch,
  },
  {
    id: 'emerging',
    labelKey: 'match.fork.emerging',
    descKey: 'match.fork.emerging.d',
    icon: Sprout,
  },
] as const;

function recommendationReason(
  roleSlug: string,
  profile: ReturnType<typeof useSkillCast.getState>['profile'],
  t: ReturnType<typeof useT>,
): string {
  const role = ROLE_MAP[roleSlug];
  const details = profile.extended;
  const priority = strategyPriority(profile, roleSlug);

  switch (details?.careerStrategy) {
    case 'enhance':
      return priority === 0
        ? t('Prioritized because {category} aligns with your current profession or field.', { category: skillCategory(t, role.category) })
        : priority === 1
          ? t('Prioritized as a role that works with AI for your current-career strategy.')
          : t('Recommended by your profile compatibility as another career option.');

    case 'related-transition':
      return priority === 0
        ? t('This is the target role you selected during onboarding.')
        : priority === 1
          ? t('This role shares the {category} category with your selected target.', { category: skillCategory(t, role.category) })
          : priority === 2
            ? t('Included as a pivot pathway, ranked by your profile compatibility.')
            : t('Recommended by your profile compatibility.');

    case 'new-field':
      return priority < 2
        ? t('Prioritized because it aligns with your selected {field} field.', { field: details.newField ?? '' })
        : t('Recommended by your profile compatibility beyond your selected field.');

    case 'ai-skills':
      return priority === 0
        ? t('This role requires the AI skill you selected during onboarding.')
        : priority === 1
          ? t('Prioritized as an AI or governance career pathway.')
          : t('Recommended by your profile compatibility.');

    default:
      return t('Recommended from your skill readiness, interests, experience, and available work-preference data.');
  }
}

export function MatchesTab({ matches }: { matches: RoleMatch[] }) {
  const t = useT();
  const { chosenRole, profile, setUserType, setView } = useSkillCast();
  const safeProfile = normalizeProfile(profile);
  const validMatches = Array.isArray(matches) ? matches.filter(isRenderableMatch) : [];
  const strategy = safeProfile.extended?.careerStrategy;

  const defaultFork =
    strategy === 'enhance'
      ? 'work-with-ai'
      : strategy === 'related-transition'
        ? 'pivot'
        : strategy === 'new-field' || strategy === 'ai-skills'
          ? ROLE_MAP[validMatches[0]?.roleSlug ?? '']?.pathType ?? 'work-with-ai'
          : ROLE_MAP[chosenRole ?? '']?.pathType ?? 'work-with-ai';

  const [fork, setFork] =
    useState<(typeof FORKS)[number]['id']>(defaultFork);

  const forkMatches = useMemo(
    () =>
      validMatches
        .filter((match) => ROLE_MAP[match.roleSlug]?.pathType === fork)
        .slice(0, 6),
    [validMatches, fork],
  );
  const hasProfileSignals =
    Object.keys(safeProfile.skills).length > 0 ||
    safeProfile.interests.length > 0 ||
    Boolean(safeProfile.objective || safeProfile.extended?.profession || safeProfile.extended?.fieldOfWork);

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <h2 className="text-lg font-semibold">{t('Learning pathways for future roles')}</h2>

      <p className="text-sm text-muted-foreground">
        {t('match.guidance')}
      </p>

      {!hasProfileSignals && validMatches.length > 0 && (
        <Card className="border-blue-200 bg-blue-50/60 dark:bg-slate-900">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <p className="max-w-3xl text-sm text-muted-foreground">
              {t('Your profile is still empty. These are broad starting points; add skills and interests for more relevant learning pathways.')}
            </p>
            <Button variant="outline" onClick={() => { setUserType('individual'); setView('onboarding'); }}>
              {t('Complete learner profile')}
            </Button>
          </CardContent>
        </Card>
      )}

      {validMatches.length === 0 ? (
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <p className="text-sm text-muted-foreground">
              {t('No valid pathway matches are available yet. Complete your learner profile to get recommendations.')}
            </p>
            <Button variant="outline" onClick={() => { setUserType('individual'); setView('onboarding'); }}>
              {t('Complete learner profile')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div
            role="radiogroup"
            aria-label={t('Learning pathways for future roles')}
            className="grid gap-3 sm:grid-cols-3"
          >
            {FORKS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={fork === item.id}
                onClick={() => setFork(item.id)}
                className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                  fork === item.id
                    ? 'border-blue-500 dark:border-blue-500 bg-blue-50 ring-1 ring-blue-200 dark:ring-blue-800'
                    : 'border-blue-100 dark:border-slate-700 bg-white hover:border-blue-300 dark:hover:border-blue-700'
                }`}
              >
                <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" aria-hidden />
                <span>
                  <span className="block font-semibold">{t(item.labelKey)}</span>
                  <span className="block text-sm text-muted-foreground">{t(item.descKey)}</span>
                </span>
              </button>
            ))}
          </div>

          {forkMatches.length === 0 ? (
            <Card>
              <CardContent className="p-4 text-sm text-muted-foreground">
                {t('match.empty')}
              </CardContent>
            </Card>
          ) : (
            <div className="flex w-full min-w-0 flex-col gap-4">
              {forkMatches.map((match) => (
                <MatchCard key={match.roleSlug} match={match} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function isRenderableMatch(value: unknown): value is RoleMatch {
  if (typeof value !== 'object' || value === null) return false;
  const match = value as Partial<RoleMatch>;
  const demand = match.demand;
  return Boolean(
    typeof match.roleSlug === 'string' &&
    ROLE_MAP[match.roleSlug] &&
    typeof match.score === 'number' &&
    Number.isFinite(match.score) &&
    typeof match.skillReadiness === 'number' &&
    Number.isFinite(match.skillReadiness) &&
    Array.isArray(match.matchingSkills) &&
    Array.isArray(match.missingSkills) &&
    Array.isArray(match.gap) &&
    Array.isArray(match.factors) &&
    typeof demand === 'object' &&
    demand !== null &&
    Number.isFinite(demand.moderate) &&
    Number.isFinite(demand.accelerated),
  );
}

function MatchCard({ match }: { match: RoleMatch }) {
  const t = useT();
  const {
    lang,
    scenario,
    chosenRole,
    setChosenRole,
    setDashTab,
    profile,
  } = useSkillCast();
  const { momentumMap } = useSignals();

  const role = ROLE_MAP[match.roleSlug];
  const safeProfile = normalizeProfile(profile);
  const isChosen = chosenRole === match.roleSlug;

  const [coach, setCoach] = useState<string | null>(null);
  const [coachFallback, setCoachFallback] = useState(false);
  const [coachLoading, setCoachLoading] = useState(false);

  if (!role) return null;

  const demand =
    scenario === 'accelerated'
      ? match.demand.accelerated
      : match.demand.moderate;

  const currentSkills = match.matchingSkills;

  const exposure =
    role.automationExposure < 0.3
      ? t('Lower')
      : role.automationExposure < 0.6
        ? t('Moderate')
        : t('Higher');

  const openRoadmap = () => {
    setChosenRole(match.roleSlug);
    setDashTab('harada');
  };

  const askCoach = async () => {
    setCoachLoading(true);

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleSlug: match.roleSlug,
          score: match.score,
          factors: match.factors.map((factor) => ({
            label: factor.label,
            value: factor.value,
          })),
          gap: match.gap.slice(0, 5).map((gap) => ({
            skill: gap.skill,
            userLevel: gap.userLevel,
            minLevel: gap.minLevel,
            momentum: momentumMap[gap.skill] ?? gap.momentum,
          })),
          scenario,
          lang,
        }),
      });

      const json = (await res.json()) as {
        narration?: string;
        fallback?: boolean;
      };

      setCoach(json.narration ?? null);
      setCoachFallback(Boolean(json.fallback));
    } catch {
      setCoach(t('match.coach.fallback'));
      setCoachFallback(true);
    } finally {
      setCoachLoading(false);
    }
  };

  const pathLabel =
    role.pathType === 'work-with-ai'
      ? t('Work with AI')
      : role.pathType === 'pivot'
        ? t('Pivot to another career')
        : t('Emerging opportunities');

  const factorLabels: Record<string, string> = {
    Skills: t('Skills'),
    Interests: t('Interests'),
    Experience: t('Experience'),
    'Work preferences': t('Work preferences'),
  };

  return (
    <Card
      className={`w-full min-w-0 overflow-hidden rounded-2xl border bg-white shadow-sm ${
        isChosen
          ? 'border-blue-500 dark:border-blue-500 ring-1 ring-blue-200 dark:ring-blue-800'
          : 'border-blue-100 dark:border-slate-700'
      }`}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <CardTitle className="flex flex-wrap items-center gap-2 text-xl text-slate-900">
              {roleTitle(t, role.slug)}

              <Badge
                variant="outline"
                className="border-blue-200 bg-blue-50 text-blue-700"
              >
                {skillCategory(t, role.category)}
              </Badge>

              <Badge
                variant="outline"
                className="border-indigo-200 bg-indigo-50 text-indigo-700"
              >
                {pathLabel}
              </Badge>

              {role.entryLevel && (
                <Badge variant="secondary" className="text-[11px]">
                  {t('match.entrylevel')}
                </Badge>
              )}

              {isChosen && (
                <Badge className="gap-1 bg-blue-600 text-white">
                  <CircleCheck className="h-3 w-3" aria-hidden />
                  {t('match.chosen')}
                </Badge>
              )}
            </CardTitle>

            <CardDescription className="mt-2 max-w-3xl text-sm leading-relaxed">
              {roleTagline(t, role.slug)}
            </CardDescription>
          </div>

          <div className="flex flex-col items-center gap-1">
            <div
              className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-[1.75rem] border border-blue-200 bg-blue-50 text-blue-800 shadow-sm sm:h-28 sm:w-28"
              role="img"
              aria-label={`${t('match.score')} ${match.score}%`}
            >
              <span className="text-3xl font-bold leading-none tracking-tight sm:text-4xl">
                {match.score}%
              </span>
              <span className="mt-2 text-sm font-medium tracking-wide">
                {t('match')}
              </span>
            </div>

            <Button size="sm" variant="outline" onClick={openRoadmap}>
              {t('Explore Roadmap')}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <section
          aria-label={t('Current skill readiness')}
          className="rounded-xl border border-blue-100 dark:border-slate-700 bg-blue-50/70 p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {t('Current skill readiness')}
              </p>
              <p className="text-xs text-slate-600">
                {t('Skills needed for this learning pathway')}
              </p>
            </div>
            <span className="text-lg font-bold tabular-nums text-blue-700">
              {match.skillReadiness}%
            </span>
          </div>

          <Progress
            value={match.skillReadiness}
            className="mt-2 h-2.5"
            aria-label={`${t('Current skill readiness')} ${match.skillReadiness}%`}
          />

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {match.factors.map((factor) => (
              <div
                key={factor.label}
                className="rounded-lg border border-blue-100 dark:border-slate-700/80 bg-white/80 px-3 py-2 text-center"
              >
                <p className="text-[11px] text-slate-500">
                  {factorLabels[factor.label] ?? factor.label}
                </p>
                <p className="text-sm font-semibold tabular-nums text-slate-800">
                  {Math.round(factor.value * 100)}%
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-3 md:grid-cols-2">
          <section className="rounded-xl border border-blue-100 dark:border-slate-700 p-4">
            <h3 className="text-sm font-semibold text-slate-900">
              {t('Matching Skills')}
            </h3>

            {currentSkills.length ? (
              <ul className="mt-3 space-y-2">
                {currentSkills.map((item) => (
                  <li
                    key={item.skill}
                    className="flex items-center justify-between gap-3 rounded-lg bg-blue-50/70 px-3 py-2 text-sm"
                  >
                    <span className="font-medium text-slate-800">
                      {skillName(t, item.skill)}
                    </span>
                    <span className="shrink-0 text-xs text-slate-600">
                      {item.userLevel}/5 {t('harada.current')} · {item.requiredLevel} {t('harada.required')}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-600">
                {t('No mapped role skills selected yet.')}
              </p>
            )}
          </section>

          <section className="rounded-xl border border-indigo-100 p-4">
            <h3 className="text-sm font-semibold text-slate-900">
              {t('Skills to Build')}
            </h3>

            {match.missingSkills.length ? (
              <ul className="mt-3 space-y-2">
                {match.missingSkills.slice(0, 5).map((gap) => (
                  <li
                    key={gap.skill}
                    className="flex items-center justify-between gap-3 rounded-lg bg-indigo-50/60 px-3 py-2 text-sm"
                  >
                    <span className="font-medium text-slate-800">
                      {skillName(t, gap.skill)}
                    </span>
                    <span className="shrink-0 text-xs text-slate-600">
                      {gap.userLevel}/5 {t('harada.current')} · {gap.minLevel} {t('harada.required')}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-600">
                {t('Your current levels meet the mapped requirements for this role.')}
              </p>
            )}
          </section>
        </div>

        <section className="rounded-xl border border-blue-100 dark:border-slate-700 p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">
              {t('Learning outlook')}
          </h3>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-700">
                  {t('Market Outlook')}
                </span>
                <Badge
                  variant="outline"
                  className="border-blue-200 bg-white text-blue-700"
                >
                  {scenario === 'accelerated'
                    ? t('Fast adoption')
                    : t('Moderate adoption')}
                </Badge>
              </div>

              <p className="mt-2 text-xl font-bold text-blue-700">
                {demand}
                <span className="text-sm font-medium text-slate-500">
                  /100
                </span>
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-700">
                  {t('AI Task Exposure')}
                </span>
                <Badge
                  variant="outline"
                  className="border-indigo-200 bg-white text-indigo-700"
                >
                  {exposure}
                </Badge>
              </div>

              <p className="mt-2 text-xl font-bold text-indigo-700">
                {Math.round(role.automationExposure * 100)}%
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-blue-100 dark:border-slate-700 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900">
              {t('UN Sustainable Development Goals')}
            </h3>
            {role.sdgTags.map((goal) => (
              <SdgBadge key={goal} goal={goal} size="md" />
            ))}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {roleSdgMechanism(t, role.slug)}
          </p>
        </section>

        <div className="flex flex-col-reverse gap-3 border-t border-blue-50 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <details className="min-w-0 flex-1 rounded-lg">
            <summary className="cursor-pointer text-sm font-semibold text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
              {t('Why this match?')}
            </summary>

            <div className="mt-3 space-y-3 border-t border-blue-50 pt-3 text-sm text-slate-600">
              <p>
                {recommendationReason(role.slug, safeProfile, t)}
                {t('The compatibility score uses your saved profile and this role&apos;s requirements. Skill readiness is shown separately.')}
              </p>

              <p className="font-medium text-slate-700">
                {t('Score breakdown ·')} {t('match.formula')}
              </p>

              <ul className="grid gap-2 sm:grid-cols-2">
                {match.factors.map((factor) => (
                  <li
                    key={factor.label}
                    className="rounded-lg bg-blue-50/60 p-2"
                  >
                    <strong className="text-slate-800">
                      {factorLabels[factor.label] ?? factor.label} (
                      {Math.round(factor.weight * 100)}{t('% weight):')}
                    </strong>{' '}
                    {Math.round(factor.value * 100)}{t('% factor value')}
                    {factor.label === 'Skills'
                      ? ` · ${t('Required skill coverage: {current} of {total}; readiness {readiness}%.', { current: currentSkills.length, total: role.skills.length, readiness: match.skillReadiness })}`
                      : factor.label === 'Experience'
                        ? ` · ${t('{years} years recorded', { years: safeProfile.years })}`
                        : factor.label === 'Interests'
                          ? ` · ${safeProfile.interests.length ? t('Interests used: {interests}', { interests: safeProfile.interests.map((interest) => t(`interest.${interest}`)).join(', ') }) : t('No interests selected')}`
                          : ` · ${
                              safeProfile.extended?.workPreferences?.filter(
                                (preference) => preference !== 'none',
                              ).length
                                ? t('Saved preferences are not represented in the role data, so this factor stays neutral.')
                                : t('No additional preferences selected; this factor stays neutral.')
                            }`}
                  </li>
                ))}
              </ul>

              <p>
                {t('Market outlook values are estimates from existing SkillCast data. AI task exposure describes potential task change, not employment or replacement probability.')}
              </p>

              <Button
                size="sm"
                variant="outline"
                onClick={() => void askCoach()}
                disabled={coachLoading}
                className="gap-2"
              >
                <Bot className="h-4 w-4" aria-hidden />
                {coachLoading ? '…' : t('match.coach.title')}
              </Button>

              {coach && (
                <div className="rounded-lg border border-violet-200 bg-violet-50/60 p-3">
                  <p className="flex items-start gap-2">
                    <Sparkles
                      className="mt-0.5 h-4 w-4 shrink-0 text-violet-600"
                      aria-hidden
                    />
                    <span>{coach}</span>
                  </p>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    {coachFallback
                      ? t('match.coach.fallback')
                      : t('match.coach.disclosure')}
                  </p>
                </div>
              )}
            </div>
          </details>

          <Button
            size="sm"
            className="shrink-0 bg-green-600 text-white hover:bg-green-700"
            onClick={openRoadmap}
          >
            {isChosen ? t('View Roadmap') : t('Explore Roadmap')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
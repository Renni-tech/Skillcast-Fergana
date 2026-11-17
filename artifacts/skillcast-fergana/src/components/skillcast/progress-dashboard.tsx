'use client';

import { useMemo } from 'react';
import { Check, Clock3, ListChecks, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { COURSE_MAP } from '@/data/courses';
import { ROLE_MAP } from '@/data/roles';
import type { RoleMatch } from '@/lib/types';
import { useSkillCast } from '@/lib/store';
import { pickCourses } from './pathway';
import { HARADA_TASK_COUNT } from './harada';
import { courseProvider, courseTitle, roleTitle, skillName, useT } from './shared';

export function ProgressDashboard({ matches }: { matches: RoleMatch[] }) {
  const t = useT();
  const { profile, chosenRole, completedCourses, setProfile, setDashTab } = useSkillCast();
  const role = chosenRole ? ROLE_MAP[chosenRole] : null;
  const match = matches.find((item) => item.roleSlug === chosenRole) ?? null;
  const roadmap = useMemo(() => match ? pickCourses(match.gap, profile.inclusion, profile.budget) : [], [match, profile.inclusion, profile.budget]);
  const completedRoadmap = roadmap.filter((item) => completedCourses.includes(item.courseSlug));
  const completedHours = completedRoadmap.reduce((sum, item) => sum + (COURSE_MAP[item.courseSlug]?.totalHours ?? 0), 0);
  const tasks = profile.completedRoadmapTasks ?? [];
  const toggleTask = (id: string) => {
    const done = tasks.includes(id);
    const statuses = { ...profile.haradaTaskStatuses };
    for (let index = 0; index < HARADA_TASK_COUNT; index++) {
      statuses[`${id}:${index}`] = done ? 'not-started' : 'completed';
    }
    setProfile({
      completedRoadmapTasks: done ? tasks.filter((item) => item !== id) : [...tasks, id],
      haradaTaskStatuses: statuses,
    });
  };
  const gaps = (match?.gap ?? []).slice(0, 5);
  const completedMilestones = gaps.filter((gap) => tasks.includes(`${chosenRole}:${gap.skill}`)).length;
  const haradaEntries = Object.entries(profile.haradaTaskStatuses ?? {}).filter(([key]) => key.startsWith(`${chosenRole}:`));
  const haradaComplete = haradaEntries.filter(([, status]) => status === 'completed').length;
  const haradaInProgress = haradaEntries.filter(([, status]) => status === 'in-progress').length;

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{t('Progress Dashboard')}</h2>
          <p className="mt-1 text-sm text-slate-600">{t('Track learning, role skill milestones, and your next actions')}{role ? ` ${t('toward')} ${roleTitle(t, role.slug)}` : ''}.</p>
        </div>
        <Badge variant="outline" className="border-blue-200 text-blue-700"><Target className="mr-1 h-3.5 w-3.5" aria-hidden />{profile.budget} {t('hours/week goal')}</Badge>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-blue-100 dark:border-slate-700 bg-white"><CardHeader className="pb-2"><CardDescription>{t('Learning roadmap')}</CardDescription><CardTitle className="text-2xl text-slate-900">{completedRoadmap.length}/{roadmap.length}</CardTitle></CardHeader><CardContent><Progress value={roadmap.length ? completedRoadmap.length / roadmap.length * 100 : 0} aria-label={t('Course completion')}/><p className="mt-2 text-xs text-slate-500">{t('Curated course milestones completed')}</p></CardContent></Card>
        <Card className="border-blue-100 dark:border-slate-700 bg-white"><CardHeader className="pb-2"><CardDescription>{t('Learning time')}</CardDescription><CardTitle className="flex items-center gap-2 text-2xl text-slate-900"><Clock3 className="h-5 w-5 text-blue-600" aria-hidden />{completedHours} {t('course hours')}</CardTitle></CardHeader><CardContent><p className="text-xs text-slate-500">{t('Total estimated hours in courses you marked complete.')}</p></CardContent></Card>
        <Card className="border-blue-100 dark:border-slate-700 bg-white"><CardHeader className="pb-2"><CardDescription>{t('This week · self-reported')}</CardDescription><CardTitle className="text-base text-slate-900">{t('Hours learned')}</CardTitle></CardHeader><CardContent className="flex items-center gap-3"><Input type="number" min={0} max={168} value={profile.weeklyHoursCompleted ?? 0} onChange={(event) => setProfile({ weeklyHoursCompleted: Math.min(168, Math.max(0, Number(event.target.value) || 0)) })} className="h-10 max-w-28 border-blue-100 dark:border-slate-700" aria-label={t('Learning hours completed this week')}/><span className="text-sm text-slate-600">{t('of')} {profile.budget} {t('goal')}</span></CardContent></Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-blue-100 dark:border-slate-700 bg-white">
          <CardHeader><CardTitle className="flex items-center gap-2 text-base text-slate-900"><ListChecks className="h-5 w-5 text-blue-600" aria-hidden />{t('Role skill milestones')}</CardTitle><CardDescription>{t('Milestones are saved locally and shared with your Harada roadmap.')}</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            {!role || gaps.length === 0 ? <p className="text-sm text-slate-500">{t('Choose a career match to create skill milestones.')}</p> : <>
              <Progress value={gaps.length ? completedMilestones / gaps.length * 100 : 0} aria-label={t('Skill milestone completion')} />
              <ul className="space-y-2">{gaps.map((gap) => {
                const id = `${chosenRole}:${gap.skill}`;
                const done = tasks.includes(id);
                const name = skillName(t, gap.skill);
                return <li key={id} className="flex items-center gap-3 rounded-xl border border-blue-100 dark:border-slate-700 p-3"><button type="button" aria-pressed={done} onClick={() => toggleTask(id)} className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${done ? 'border-blue-600 bg-blue-600 text-white' : 'border-blue-200 text-transparent hover:border-blue-500 dark:border-blue-500'}`} aria-label={`${done ? t('Mark incomplete') : t('Mark complete')}: ${name}`}>{done && <Check className="h-4 w-4" aria-hidden />}</button><span className={`flex-1 text-sm ${done ? 'text-slate-500 line-through' : 'font-medium text-slate-800'}`}>{name}<span className="mt-0.5 block text-xs font-normal text-slate-500">{t('harada.current')} {gap.userLevel}/5 · {t('target')} {gap.minLevel}/5</span></span><Badge variant="outline" className="border-blue-100 dark:border-slate-700 text-blue-700">{done ? t('Complete') : t('Upcoming')}</Badge></li>;
              })}</ul>
            </>}
            <div className="rounded-xl border border-blue-100 dark:border-slate-700 bg-blue-50/60 p-3"><p className="text-sm font-semibold text-slate-800">{t('Harada Open Window tasks')}</p><p className="mt-1 text-xs text-slate-600">{haradaComplete} {t('completed ·')} {haradaInProgress} {t('in progress · saved locally for this career.')}</p><Button variant="link" onClick={() => setDashTab('harada')} className="h-auto p-0 pt-1 text-blue-700">{t('Continue roadmap')}</Button></div>
            <Button variant="outline" onClick={() => setDashTab('harada')} className="border-blue-200 text-blue-700">{t('Open Harada roadmap')}</Button>
          </CardContent>
        </Card>

        <Card className="border-blue-100 dark:border-slate-700 bg-white">
          <CardHeader><CardTitle className="text-base text-slate-900">{t('Course milestones')}</CardTitle><CardDescription>{t('Course completion and upcoming learning steps from your pathway.')}</CardDescription></CardHeader>
          <CardContent className="space-y-2">
            {!roadmap.length ? <p className="text-sm text-slate-500">{t('Choose a career match with mapped skill gaps to build a course pathway.')}</p> : roadmap.map((item) => {
              const course = COURSE_MAP[item.courseSlug];
              const done = completedCourses.includes(item.courseSlug);
              return <div key={item.courseSlug} className="flex items-start justify-between gap-3 rounded-xl border border-blue-100 dark:border-slate-700 p-3"><div><p className="text-sm font-medium text-slate-800">{courseTitle(t, item.courseSlug)}</p><p className="mt-1 text-xs text-slate-500">{course.totalHours} {t('hours')} · {t('estimated week')} {item.startWeek} · {courseProvider(t, item.courseSlug)}</p></div><Badge variant={done ? 'default' : 'outline'} className={done ? 'bg-blue-600' : 'border-blue-200 text-blue-700'}>{done ? t('Complete') : t('Upcoming')}</Badge></div>;
            })}
            <Button variant="outline" onClick={() => setDashTab('pathway')} className="mt-2 border-blue-200 text-blue-700">{t('Open learning pathway')}</Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-blue-100 dark:border-slate-700 bg-white">
        <CardHeader><CardTitle className="text-base text-slate-900">{t('Weekly reflection')}</CardTitle><CardDescription>{t('Save a private note in this browser about what you learned and your next action.')}</CardDescription></CardHeader>
        <CardContent><Textarea value={profile.weeklyReflection ?? ''} maxLength={1000} onChange={(event) => setProfile({ weeklyReflection: event.target.value })} placeholder={t('What moved forward this week? What will you try next?')} className="min-h-28 border-blue-100 dark:border-slate-700"/><p className="mt-1 text-right text-xs text-slate-500">{(profile.weeklyReflection ?? '').length}/1000</p></CardContent>
      </Card>
    </div>
  );
}

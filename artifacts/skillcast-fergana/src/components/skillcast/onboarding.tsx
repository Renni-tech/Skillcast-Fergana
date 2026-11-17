'use client';

import { useMemo, useRef, useState } from 'react';
import {
  ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Briefcase, Building2, CalendarClock, Check, ClipboardList,
  ClipboardCheck, FileArchive, Gauge, Globe, GraduationCap, LayoutTemplate, MapPin,
  Link as LinkIcon, ListChecks, Laptop, Rocket, ScanSearch, ShieldCheck, Sparkles, Target, Upload,
  User, Wallet, Clock3, Home, VolumeX, FileText, Accessibility, MessageSquareText, Radar, Search, Plus, X, SlidersHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ADJACENCY_MAP, SKILLS, SKILL_MAP } from '@/data/skills';
import { ROLES, ROLE_MAP } from '@/data/roles';
import { COURSES, COURSE_MAP } from '@/data/courses';
import { DEPT_TEMPLATES, INDUSTRIES } from '@/data/team';
import { FIELDS_OF_STUDY } from '@/data/institution';
import { INTERESTS, PERSONAS, useSkillCast } from '@/lib/store';
import { LANGS } from '@/lib/i18n';
import { matchAll } from '@/lib/matching';
import type { CareerStrategy, EmployerObjective, EmploymentStatus, IndividualProfileDetails } from '@/lib/types';
import { roleCategory, roleSdgMechanism, roleTagline, roleTitle, skillCategory, skillName, SdgBadge, useSignals, useT } from './shared';
import { CvStep } from './cv-step';
import { useReducedMotion } from './a11y';

// ─── Onboarding router: three tracks ────────────────────────────────────────

export function Onboarding() {
  const { userType } = useSkillCast();
  if (userType === 'employer') return <EmployerOnboarding />;
  if (userType === 'institution') return <InstitutionOnboarding />;
  if (userType === 'individual') return <IndividualOnboarding />;
  return <StepUserType />;
}

// ─── Step 1: choose the onboarding path ────────────────────────────────────

function StepUserType() {
  const t = useT();
  const { setUserType, setView } = useSkillCast();
  const paths = [
    { id: 'individual' as const, icon: User, title: t('hr.onboarding.path.individual'), desc: t('hr.onboarding.path.individual.description') },
    { id: 'employer' as const, icon: Building2, title: t('hr.onboarding.path.employer'), desc: t('hr.onboarding.path.employer.description') },
  ];
  return (
    <div className="skillcast-onboarding px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <Card className="border-blue-100 dark:border-slate-700 bg-white shadow-[0_16px_60px_rgba(39,70,130,.08)]">
          <CardHeader>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">{t('hr.onboarding.path.step')}</p>
            <CardTitle className="text-2xl text-slate-950">{t('hr.onboarding.path.title')}</CardTitle>
            <CardDescription>{t('hr.onboarding.path.description')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {paths.map((path) => (
              <button
                key={path.id}
                type="button"
                onClick={() => setUserType(path.id)}
                className="group min-h-48 rounded-2xl border border-blue-100 dark:border-slate-700 bg-gradient-to-br from-white dark:from-slate-900 to-blue-50/70 dark:to-slate-800 p-5 text-left transition-all hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg hover:shadow-blue-900/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <span className="flex items-center justify-between">
                  <path.icon className="h-8 w-8 text-blue-600" aria-hidden />
                  <ArrowRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-600" aria-hidden />
                </span>
                <span className="mt-7 block text-lg font-semibold text-slate-950">{path.title}</span>
                <span className="mt-2 block text-sm leading-6 text-slate-600">{path.desc}</span>
              </button>
            ))}
          </CardContent>
          <div className="px-6 pb-5">
            <Button variant="ghost" onClick={() => setView('landing')} className="text-slate-600 hover:bg-blue-50 hover:text-blue-800">
              <ArrowLeft className="mr-1 h-4 w-4" aria-hidden /> {t('hr.onboarding.back')}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function StepProgress({ step, total }: { step: number; total: number }) {
  const t = useT();
  return (
    <div aria-label={`${t('onb.step')} ${step} ${t('onb.of')} ${total}`}>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-600">{t('Your onboarding progress')}</span>
        <span className="font-semibold text-blue-700">{step} / {total}</span>
      </div>
      <div className="flex items-center gap-2" aria-hidden="true">
        {Array.from({ length: total }, (_, index) => (
          <span key={index} className={`h-2 flex-1 rounded-full ${index < step ? 'bg-blue-600' : 'bg-blue-100 dark:bg-slate-700'}`} />
        ))}
      </div>
    </div>
  );
}

// ─── Shared onboarding shell (progress + nav) ──────────────────────────────

function OnboardingShell({
  step, total, title, desc, icon: Icon, onBack, onNext, nextDisabled, children, finish, privacyNote, light = false, onSkip, nextLabel = 'Continue',
}: {
  step: number; total: number; title: string; desc?: string; icon: typeof User;
  onBack: () => void; onNext: () => void; nextDisabled: boolean; children: React.ReactNode;
  finish?: () => void; privacyNote?: boolean; light?: boolean; onSkip?: () => void; nextLabel?: string;
}) {
  const t = useT();
  const individualStepTitles = [
    'Choose Your Path', 'Your Profile', 'Interests & Learning Goals',
    'Future Skills Radar', 'Learning & Career Direction', 'Work Preferences',
  ];
  return (
    <div className={light ? 'skillcast-onboarding px-4 py-8 sm:py-12' : undefined}>
      <div className={`mx-auto pb-8 ${light ? 'max-w-6xl px-0 lg:grid lg:grid-cols-[250px_minmax(0,1fr)] lg:items-start lg:gap-7' : 'max-w-3xl px-4'}`}>
        {light ? (
          <>
            <aside className="mb-4 hidden rounded-2xl border border-blue-100 dark:border-slate-700 bg-white/90 p-4 shadow-sm lg:sticky lg:top-24 lg:col-start-1 lg:row-start-1 lg:block">
              <p className="px-2 pb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{t('Your progress')}</p>
              <ol aria-label={`${t('onb.step')} ${step} ${t('onb.of')} ${total}`} className="space-y-1">
                {individualStepTitles.map((label, index) => {
                  const number = index + 1;
                  const complete = number < step;
                  const active = number === step;
                  return (
                    <li key={label} aria-current={active ? 'step' : undefined} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm ${active ? 'bg-blue-50 font-semibold text-blue-800 ring-1 ring-blue-100 dark:ring-blue-900' : complete ? 'text-slate-700' : 'text-slate-400'}`}>
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${complete ? 'bg-blue-600 text-white' : active ? 'bg-blue-100 dark:bg-slate-700 text-blue-700' : 'bg-slate-100 text-slate-400'}`}>
                        {complete ? <Check className="h-4 w-4" aria-label={t('Completed')} /> : number}
                      </span>
                      <span>{t(label)}{[2, 3, 5].includes(index) ? ` (${t('flow.optional')})` : ''}</span>
                    </li>
                  );
                })}
              </ol>
            </aside>
            <div className="mb-4 lg:hidden">
              <StepProgress step={step} total={total} />
              <p className="mt-2 text-center text-xs font-medium text-slate-600">{t(individualStepTitles[step - 1])}</p>
            </div>
          </>
        ) : (
          <div className="mt-6 flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">
              {t('onb.step')} {step} {t('onb.of')} {total}
            </span>
            <Progress value={(step / total) * 100} className="h-1.5 flex-1" aria-label={`${t('onb.step')} ${step} ${t('onb.of')} ${total}`} />
          </div>
        )}

        <Card className={`mt-4 border-blue-100 dark:border-slate-700 bg-white shadow-[0_16px_60px_rgba(39,70,130,.08)] ${light ? 'lg:col-start-2 lg:row-start-1' : 'border-border bg-card shadow-none'}`}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${light ? 'text-slate-950' : ''}`}>
              <Icon className={`h-5 w-5 ${light ? 'text-blue-600' : 'text-teal-600 dark:text-teal-400'}`} aria-hidden /> {title}
            </CardTitle>
            {desc && <CardDescription className="leading-relaxed">{desc}</CardDescription>}
          </CardHeader>
          <CardContent className="space-y-6">{children}</CardContent>
        </Card>

        <div className={`mt-4 flex items-center justify-between ${light ? 'lg:col-start-2' : ''}`}>
          {onSkip && (
            <Button variant="ghost" onClick={onSkip} className="text-slate-600 hover:text-blue-800">
              {t('Skip for now')}
            </Button>
          )}
          <Button variant="ghost" onClick={onBack} className={light ? 'text-slate-600 hover:bg-blue-50 hover:text-blue-800' : ''}>
            <ArrowLeft className="mr-1 h-4 w-4" aria-hidden /> {t('common.back')}
          </Button>
          {step < total || !finish ? (
            <Button
              onClick={onNext}
              disabled={nextDisabled}
              className={`gap-1 ${light ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-900' : 'bg-teal-700 text-white hover:bg-teal-800 dark:bg-teal-700 dark:hover:bg-teal-800'}`}
            >
              {t(nextLabel)} <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          ) : (
            <Button onClick={finish} className={`gap-2 ${light ? 'bg-green-700 text-white hover:bg-green-800' : 'bg-teal-700 text-white hover:bg-teal-800 dark:bg-teal-700 dark:hover:bg-teal-800'}`}>
              <Rocket className="h-4 w-4" aria-hidden /> {t('onb.finish')}
            </Button>
          )}
        </div>
        {privacyNote && (
          <p className={`mt-2 text-xs text-muted-foreground ${light ? 'text-right lg:col-start-2' : 'text-right'}`}>
            <ShieldCheck className="mr-1 inline h-3 w-3" aria-hidden />
            {t('onb.privacy.browser')}
          </p>
        )}
      </div>
    </div>
  );
}

// ═══ Individual track (six-step profile and career plan) ═══════════════════

const INDIVIDUAL_STEPS = 6;
const EMPTY_DETAILS: IndividualProfileDetails = {
  employmentStatus: '', fieldOfWork: '', profession: '', specialization: '', educationLevel: '',
  country: '', city: '', languages: [], careerStrategy: '', strategyRole: '', focusSkill: '',
  newField: '', aiGoal: '', aiSkill: '', workPreferences: ['none'],
};
const COUNTRY_CITIES: Record<string, string[]> = {
  Australia: ['Adelaide', 'Brisbane', 'Canberra', 'Melbourne', 'Perth', 'Sydney'],
  India: ['Bengaluru', 'Chennai', 'Delhi', 'Hyderabad', 'Mumbai', 'Pune'],
  Indonesia: ['Bandung', 'Jakarta', 'Surabaya', 'Yogyakarta'],
  Uzbekistan: ['Andijan', 'Bukhara', 'Fergana', 'Namangan', 'Samarkand', 'Tashkent'],
  Philippines: ['Cebu City', 'Davao City', 'Manila', 'Quezon City'],
  Singapore: ['Singapore'],
  Thailand: ['Bangkok', 'Chiang Mai', 'Phuket'],
  'United Kingdom': ['Birmingham', 'Glasgow', 'Leeds', 'London', 'Manchester'],
  'United States': ['Austin', 'Boston', 'Chicago', 'Los Angeles', 'New York', 'Seattle'],
};
const LANGUAGE_OPTIONS = ['Uzbek', 'Russian', 'English', 'Tajik', 'Karakalpak', 'Kazakh', 'Arabic', 'Japanese', 'Other'];
const PROFICIENCY_OPTIONS = ['basic', 'intermediate', 'advanced', 'native'] as const;
const EDUCATION_OPTIONS = ['Secondary school', 'Certificate', 'Diploma', 'Bachelor\'s degree', 'Master\'s degree', 'Doctorate', 'Professional qualification'];
const STATUS_OPTIONS: Array<{ value: EmploymentStatus; label: string }> = [
  { value: 'student', label: 'Student' },
  { value: 'working', label: 'Working professional' },
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'career-changer', label: 'Career changer' },
];

function IndividualOnboarding() {
  const t = useT();
  const { profile, setProfile, setUserType, setScenario } = useSkillCast();
  const { momentumMap } = useSignals();
  const [step, setStep] = useState(2);
  const details = profile.extended ?? EMPTY_DETAILS;
  const patchDetails = (patch: Partial<IndividualProfileDetails>) => {
    setProfile({ extended: { ...EMPTY_DETAILS, ...details, ...patch } });
  };
  const yearsValid = Number.isInteger(profile.years) && profile.years >= 0 && profile.years <= 60;

  const canNext = useMemo(() => {
    switch (step) {
      case 2: return Boolean(details.employmentStatus && yearsValid);
      case 3: return profile.interests.length > 0 && profile.budget >= 1 && profile.budget <= 25;
      case 5:
        if (details.careerStrategy === 'enhance') return Boolean(details.strategyRole && details.focusSkill);
        if (details.careerStrategy === 'related-transition') return Boolean(details.strategyRole);
        if (details.careerStrategy === 'new-field') return Boolean(details.newField);
        if (details.careerStrategy === 'ai-skills') return Boolean(details.aiGoal?.trim() && details.aiSkill);
        return false;
      default: return true;
    }
  }, [step, profile, details, yearsValid]);

  const finish = () => {
    const current = useSkillCast.getState();
    const targetRole = details.strategyRole && ROLE_MAP[details.strategyRole]
      ? details.strategyRole
      : matchAll(current.profile, momentumMap)[0]?.roleSlug ?? null;
    useSkillCast.setState({ onboarded: true, learnerOnboarded: true, view: 'dashboard', dashTab: 'overview', chosenRole: targetRole });
  };
  const back = step === 2 ? () => setUserType(null) : () => setStep((s) => Math.max(2, s - 1));

  const titles = [
    'Choose Your Path',
    'Your Profile',
    'Interests & Learning Goals',
    'Future Skills Radar',
    'Learning & Career Direction',
    'Work Preferences',
  ];

  return (
    <OnboardingShell
      step={step}
      total={INDIVIDUAL_STEPS}
      title={t(titles[step - 1])}
      desc={step === 2 ? t('A few details help tailor your learning pathways and career outlook.') : undefined}
      icon={step === 2 ? User : step === 3 ? Target : step === 4 ? Radar : step === 5 ? Briefcase : SlidersHorizontal}
      onBack={back}
      onNext={() => setStep((s) => Math.min(INDIVIDUAL_STEPS, s + 1))}
      onSkip={step === 3 || step === 4 ? () => setStep((s) => Math.min(INDIVIDUAL_STEPS, s + 1)) : undefined}
      nextDisabled={!canNext}
      finish={finish}
      privacyNote={step === 2}
      light
    >
      {step === 2 && <ProfileStep details={details} patchDetails={patchDetails} />}
      {step === 3 && <InterestsGoalsStep />}
      {step === 4 && <FutureRadarStep details={details} onScenario={setScenario} />}
      {step === 5 && <CareerStrategyStep details={details} patchDetails={patchDetails} />}
      {step === 6 && <WorkPreferencesStep details={details} patchDetails={patchDetails} onSkip={finish} />}
    </OnboardingShell>
  );
}

const LIGHT_INPUT = 'mt-1.5';
const LIGHT_SELECT = 'mt-1.5 h-11 w-full rounded-xl';

function ProfileStep({
  details, patchDetails,
}: {
  details: IndividualProfileDetails;
  patchDetails: (patch: Partial<IndividualProfileDetails>) => void;
}) {
  const { profile, setProfile } = useSkillCast();
  const languages = details.languages ?? [];
  const [languageChoice, setLanguageChoice] = useState('');

  const setStatus = (status: EmploymentStatus) => {
    const persona = status === 'student' ? 'fresh-grad'
      : status === 'career-changer' ? 'switcher'
        : status ? 'working-adult' : null;
    patchDetails({ employmentStatus: status });
    setProfile({ persona });
  };

  const addLanguage = (language: string) => {
    if (!language || languages.some((item) => item.language === language)) return;
    patchDetails({ languages: [...languages, { language, proficiency: 'intermediate' }] });
  };

  const updateProficiency = (language: string, proficiency: typeof PROFICIENCY_OPTIONS[number]) => {
    patchDetails({ languages: languages.map((item) => item.language === language ? { ...item, proficiency } : item) });
  };

  const removeLanguage = (language: string) => patchDetails({ languages: languages.filter((item) => item.language !== language) });
  const t = useT();

  return (
    <div className="space-y-7">
      <section className="space-y-4">
        <div>
          <h3 className="mb-3 font-semibold text-slate-900">{t('Your Profile')}</h3>
          <Label htmlFor="employment-status" className="text-slate-800">{t('Employment status')} <span className="text-rose-600">*</span></Label>
          <Select value={details.employmentStatus || '__unset__'} onValueChange={(value) => { if (value !== '__unset__') setStatus(value as EmploymentStatus); }}>
            <SelectTrigger id="employment-status" className={LIGHT_SELECT}><SelectValue placeholder={t('Choose your current status')} /></SelectTrigger>
            <SelectContent><SelectItem value="__unset__" disabled>{t('Choose your current status')}</SelectItem>{STATUS_OPTIONS.map((item) => <SelectItem key={item.value} value={item.value}>{t(item.label)}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="field-work" className="text-slate-800">{t('flow.field')}</Label>
            <Input id="field-work" value={details.fieldOfWork ?? ''} onChange={(e) => patchDetails({ fieldOfWork: e.target.value })} placeholder={t('e.g. Healthcare, finance, technology')} className={LIGHT_INPUT} />
          </div>
          <div>
            <Label htmlFor="profession" className="text-slate-800">{t('Profession')}</Label>
            <Input id="profession" value={details.profession ?? ''} onChange={(e) => patchDetails({ profession: e.target.value })} placeholder={t('e.g. Operations analyst')} className={LIGHT_INPUT} />
          </div>
          <div>
            <Label htmlFor="specialization" className="text-slate-800">{t('Specialization')}</Label>
            <Input id="specialization" value={details.specialization ?? ''} onChange={(e) => patchDetails({ specialization: e.target.value })} placeholder={t('e.g. Supply chain planning')} className={LIGHT_INPUT} />
          </div>
          <div>
            <Label htmlFor="experience" className="text-slate-800">{t('Years of experience')} <span className="text-rose-600">*</span></Label>
            <Input id="experience" type="number" min={0} max={60} step={1} value={profile.years} onChange={(e) => setProfile({ years: e.target.value === '' ? 0 : Number(e.target.value) })} className={LIGHT_INPUT} />
          </div>
          <div>
            <Label htmlFor="education-level" className="text-slate-800">{t('Education level')}</Label>
            <Select value={details.educationLevel || '__unset__'} onValueChange={(value) => patchDetails({ educationLevel: value === '__unset__' ? '' : value })}>
              <SelectTrigger id="education-level" className={LIGHT_SELECT}><SelectValue placeholder={t('Select highest level')} /></SelectTrigger>
              <SelectContent><SelectItem value="__unset__">{t('Select highest level')}</SelectItem>{EDUCATION_OPTIONS.map((option) => <SelectItem key={option} value={option}>{t(option)}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <p className="text-xs text-slate-500">{t('Current status and years of experience are required. Other details, CV, and skills can be added to personalize your learning pathways.')}</p>
      </section>

      <section className="space-y-4 border-t border-blue-100 dark:border-slate-700 pt-6">
        <div>
          <h3 className="font-semibold text-slate-900">{t('Upload Your CV')}</h3>
          <p className="text-sm text-slate-500">{t('Raw CV stays in your browser; only text after PII scrubbing is sent for skill extraction. You can enter skills manually instead.')}</p>
        </div>
        <CvStep onDone={() => {}} showContinue={false} preserveProfile />
      </section>

      <section className="space-y-4 border-t border-blue-100 dark:border-slate-700 pt-6">
        <div>
          <h3 className="font-semibold text-slate-900">{t('Skills Assessment')}</h3>
          <p className="text-sm text-slate-600">{t('Choose skills and rate your current level. Add skills to personalize your matches; you can continue without them.')}</p>
        </div>
        <StepSkills />
      </section>

      <section className="space-y-3 border-t border-blue-100 dark:border-slate-700 pt-6">
        <div>
          <h3 className="font-semibold text-slate-900">{t('Languages')}</h3>
          <p className="text-sm text-slate-500">{t('Add any languages you use and select your proficiency.')}</p>
        </div>
        <Select value={languageChoice || '__unset__'} onValueChange={(value) => { if (value !== '__unset__') addLanguage(value); setLanguageChoice(''); }}>
        <SelectTrigger aria-label={t('Add a language')} className={LIGHT_SELECT}><SelectValue placeholder={t('Add a language…')} /></SelectTrigger>
          <SelectContent><SelectItem value="__unset__">{t('Add a language…')}</SelectItem>{LANGUAGE_OPTIONS.map((language) => <SelectItem key={language} value={language} disabled={languages.some((item) => item.language === language)}>{language === 'Other' ? t('Other') : language}</SelectItem>)}</SelectContent>
        </Select>
        <div className="space-y-2">
          {languages.map((item) => (
            <div key={item.language} className="flex flex-wrap items-center gap-2 rounded-xl border border-blue-100 dark:border-slate-700 bg-blue-50/50 p-3">
              <span className="min-w-28 flex-1 text-sm font-medium text-slate-800">{item.language}</span>
              <Select value={item.proficiency} onValueChange={(value) => updateProficiency(item.language, value as typeof PROFICIENCY_OPTIONS[number])}>
                <SelectTrigger aria-label={`${item.language} ${t('proficiency')}`} className="h-11 w-40 rounded-xl border-blue-100 dark:border-slate-700 bg-white text-sm text-slate-900 shadow-sm hover:border-blue-200 focus:ring-2 focus:ring-blue-100"><SelectValue /></SelectTrigger>
                <SelectContent>{PROFICIENCY_OPTIONS.map((level) => <SelectItem key={level} value={level}>{t(level[0].toUpperCase() + level.slice(1))}</SelectItem>)}</SelectContent>
              </Select>
              <Button type="button" variant="ghost" size="sm" onClick={() => removeLanguage(item.language)} className="text-slate-500">{t('Remove')}</Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function InterestsGoalsStep() {
  const { profile, setProfile } = useSkillCast();
  const t = useT();
  return (
    <div className="space-y-6">
      <StepInterests />
      <section className="border-t border-blue-100 dark:border-slate-700 pt-6">
        <Label htmlFor="career-goal" className="text-slate-800">{t('What learning or career outcome would you like to work toward?')}</Label>
        <Textarea id="career-goal" value={profile.objective} maxLength={500} onChange={(e) => setProfile({ objective: e.target.value.slice(0, 500) })} placeholder={t('Describe the skills, study goal, or future role you want to work toward…')} rows={4} className="mt-2 border-blue-100 dark:border-slate-700 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-200" />
        <p className="mt-1 text-right text-xs text-slate-500">{profile.objective.length} / 500</p>
      </section>
    </div>
  );
}

export function FutureRadarStep({ details, onScenario }: { details: IndividualProfileDetails; onScenario: (scenario: 'moderate' | 'accelerated') => void }) {
  const { profile, scenario } = useSkillCast();
  const { loading, data, momentumMap } = useSignals();
  const t = useT();
  const reduceMotion = useReducedMotion();
  const matches = useMemo(() => matchAll(profile, momentumMap), [profile, momentumMap]);
  const topRoles = matches.slice(0, 5).map((match) => ({ match, role: ROLE_MAP[match.roleSlug] })).filter((item) => item.role);
  const demandKey = scenario === 'moderate' ? 'demandModerate' : 'demandAccelerated';
  const marketDemand = topRoles.slice(0, 5).map(({ match, role }) => ({
    name: roleTitle(t, role.slug),
    demand: role[demandKey],
    score: match.score,
  }));
  const averageDemand = marketDemand.length
    ? Math.round(marketDemand.reduce((sum, item) => sum + item.demand, 0) / marketDemand.length)
    : 0;
  // The existing data contains scenario indices, not employment-by-year data.
  // This transparent demo interpolation turns the selected scenario index into a time-horizon illustration.
  const employmentOutlook = [
    { horizon: t('horizon.now'), outlook: 50 },
    { horizon: t('horizon.3to5'), outlook: Math.round((50 + averageDemand) / 2) },
    { horizon: t('horizon.5to10'), outlook: averageDemand },
  ];

  const exposureBase = topRoles.length
    ? topRoles.slice(0, 3).reduce((sum, item) => sum + item.role.automationExposure, 0) / Math.min(3, topRoles.length)
    : 0;
  const exposureIndex = Math.min(100, Math.round(exposureBase * 100 + (scenario === 'accelerated' ? 15 : 0)));
  const exposureRating = exposureIndex < 30 ? 'Lower' : exposureIndex < 55 ? 'Moderate' : 'Higher';
  const exposureSegments = exposureRating === 'Lower' ? 1 : exposureRating === 'Moderate' ? 2 : 3;

  const profileTerms = [details.fieldOfWork, details.profession, details.specialization, ...(profile.interests ?? [])]
    .filter(Boolean).flatMap((term) => String(term).toLowerCase().split(/[^a-z0-9]+/)).filter((term) => term.length > 2);
  const skillGaps = new Map<string, { role: string; priority: number }>();
  topRoles.slice(0, 4).forEach(({ match, role }) => {
    match.gap.forEach((gap) => {
      const current = skillGaps.get(gap.skill);
      const priority = gap.weight * (match.score / 100) * (0.5 + gap.momentum / 200);
      if (!current || priority > current.priority) skillGaps.set(gap.skill, { role: roleTitle(t, role.slug), priority });
    });
  });
  const skillRecommendations = SKILLS
    .map((skill) => {
      const currentLevel = profile.skills[skill.slug] ?? 0;
      const momentum = momentumMap[skill.slug] ?? skill.seedMomentum;
      const text = `${skill.name} ${skill.category} ${skill.aliases.join(' ')}`.toLowerCase();
      const matchedTerm = profileTerms.find((term) => text.includes(term));
      const gap = skillGaps.get(skill.slug);
      const relevance = (gap?.priority ?? 0) * 3 + (matchedTerm ? 1.5 : 0) + momentum / 200 - currentLevel * 0.12;
      const field = details.profession || details.fieldOfWork;
      const reason = gap
        ? t('reason.gap', { role: gap.role })
        : matchedTerm
          ? (field ? t('reason.related', { field }) : t('reason.related.generic'))
          : currentLevel > 0
            ? t('reason.builds', { n: currentLevel })
            : t('reason.explore', { category: skillCategory(t, skill.category) });
      return { skill, currentLevel, momentum, relevance, reason };
    })
    .filter((item) => item.currentLevel < 4)
    .sort((a, b) => b.relevance - a.relevance || b.momentum - a.momentum)
    .slice(0, 6);

  const tooltipStyle = { borderRadius: 12, borderColor: 'var(--border)', backgroundColor: 'var(--popover)', color: 'var(--popover-foreground)', fontSize: 12 };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 rounded-2xl border border-blue-100 dark:border-slate-700 bg-gradient-to-r from-blue-50 dark:from-slate-800 to-indigo-50 dark:to-slate-900 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">{t('Your Future Skills Radar')}</h3>
            <Badge className="border border-blue-200 bg-white dark:bg-slate-900 text-blue-700 dark:text-slate-200">{t('Illustrative demo')}</Badge>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-300">{t('Personalized from your profile, interests, skills, SkillCast pathways, and current signals.')}</p>
        </div>
        <div className="grid w-full shrink-0 grid-cols-2 gap-1 rounded-xl border border-blue-100 dark:border-slate-700 bg-white dark:bg-slate-900 p-1 sm:w-80" role="group" aria-label={t('AI adoption scenario')}>
          {(['moderate', 'accelerated'] as const).map((option) => (
            <button key={option} type="button" aria-pressed={scenario === option} onClick={() => onScenario(option)} className={`flex min-h-11 items-center justify-center rounded-lg px-3 py-2 text-center text-sm font-semibold leading-tight transition-colors ${scenario === option ? 'bg-blue-600 dark:bg-blue-600 text-white shadow-sm' : 'text-slate-700 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-slate-800'}`}>
              {option === 'moderate' ? t('Moderate adoption') : t('Fast adoption')}
            </button>
          ))}
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-blue-100 dark:border-slate-700 bg-white px-4 py-3">
        <Badge variant="outline" className="border-blue-200 text-blue-700">{t('Demo indices')}</Badge>
        <p className="text-xs leading-5 text-slate-600">{t('Sample estimates only: not verified market statistics, live job opportunities, or guaranteed forecasts.')} {loading ? t('Loading current SkillCast signals; curated skill values are used where needed.') : data?.live ? t('Current signals inform skill momentum only.') : t('Curated fallback signals inform skill momentum where live data is unavailable.')}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-blue-100 dark:border-slate-700 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-slate-900">{t('Market Demand')}</CardTitle>
            <CardDescription>{t('Scenario demand index for your highest-matching career pathways (0–100).')}</CardDescription>
          </CardHeader>
          <CardContent>
            {marketDemand.length ? <>
              <ul className="space-y-3" aria-label={t('Illustrative {scenario} demand index for top matching career pathways', { scenario: t(scenario === 'moderate' ? 'Moderate adoption' : 'Fast adoption') })}>
                {marketDemand.map((item) => (
                  <li key={item.name}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                      <span className="min-w-0 flex-1 text-sm font-medium leading-snug text-slate-900 dark:text-slate-100">{item.name}</span>
                      <span className="shrink-0 text-sm font-semibold tabular-nums text-blue-700 dark:text-blue-300">{item.demand}<span className="text-xs font-normal text-slate-500 dark:text-slate-400">/100</span></span>
                    </div>
                    <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-blue-100 dark:bg-slate-700" aria-hidden>
                      <div className="h-full rounded-full bg-blue-600 dark:bg-blue-500" style={{ width: `${Math.max(2, Math.min(100, item.demand))}%` }} />
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{t('md.index')}: {item.demand}/100 · {t('md.fit', { n: item.score })}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">{t('md.what')}</p>
            </> : <p className="py-12 text-center text-sm text-slate-500">{t('Complete your profile to see pathway demand estimates.')}</p>}
          </CardContent>
        </Card>

        <Card className="border-blue-100 dark:border-slate-700 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-slate-900">{t('Employment Outlook')}</CardTitle>
            <CardDescription>{t('Illustrative direction index across time horizons for the selected scenario.')}</CardDescription>
          </CardHeader>
          <CardContent>
            {marketDemand.length ? <div className="h-64 min-w-0 overflow-hidden" role="img" aria-label={t('Illustrative employment outlook index across time horizons under {scenario} adoption', { scenario: t(scenario === 'moderate' ? 'Moderate adoption' : 'Fast adoption') })}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={employmentOutlook} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="horizon" tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} interval={0} />
                  <YAxis domain={[0, 100]} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value}/100`, t('chart.outlook')]} />
                  <Bar dataKey="outlook" fill="#2563EB" radius={[6, 6, 0, 0]} maxBarSize={48} isAnimationActive={!reduceMotion} />
                </BarChart>
              </ResponsiveContainer>
            </div> : <p className="py-12 text-center text-sm text-slate-500">{t('Outlook will appear when matching pathways are available.')}</p>}
            <p className="mt-2 text-xs leading-5 text-slate-500">{t('Time-horizon points are a demo interpolation from a 50-point baseline to existing role scenario indices; they are not observed employment data.')}</p>
          </CardContent>
        </Card>

        <Card className="border-blue-100 dark:border-slate-700 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-slate-900">{t('AI Task Exposure')}</CardTitle>
            <CardDescription>{t('Qualitative indicator based on matched-role exposure fields and the selected scenario.')}</CardDescription>
          </CardHeader>
          <CardContent>
            {topRoles.length ? <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-2xl font-semibold text-blue-700">{t(exposureRating)}</span>
                <span className="text-xs text-slate-500">{t('Illustrative rating')}</span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2" role="img" aria-label={t('{rating} AI task exposure, shown on a three-level indicator', { rating: t(exposureRating) })}>
                {['Lower', 'Moderate', 'Higher'].map((label, index) => <div key={label} className={`h-3 rounded-full ${index < exposureSegments ? 'bg-blue-600' : 'bg-blue-100 dark:bg-slate-700'}`} />)}
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-slate-500"><span>{t('Lower')}</span><span>{t('Moderate')}</span><span>{t('Higher')}</span></div>
              <p className="mt-4 rounded-lg bg-blue-50 px-3 py-2 text-xs leading-5 text-slate-600">{t('Task exposure describes how work tasks may be affected by AI. It is')} <strong>{t('not')}</strong> {t('the probability that your job will be replaced.')}</p>
            </> : <p className="py-8 text-center text-sm text-slate-500">{t('Exposure insights will appear when matching pathways are available.')}</p>}
          </CardContent>
        </Card>

        <Card className="border-blue-100 dark:border-slate-700 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-slate-900">{t('Emerging Skills to Explore')}</CardTitle>
            <CardDescription>{t('Skill taxonomy recommendations informed by your pathway gaps, profile, and signal momentum.')}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading && <p className="mb-3 text-xs text-slate-500">{t('Refreshing signal context… using curated momentum values as needed.')}</p>}
            {skillRecommendations.length ? <ul className="space-y-3">
              {skillRecommendations.map(({ skill, currentLevel, momentum, reason }) => <li key={skill.slug} className="rounded-xl border border-blue-100 dark:border-slate-700 bg-white p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div><p className="text-sm font-semibold text-slate-900">{skillName(t, skill.slug)}</p><p className="text-xs text-slate-500">{skillCategory(t, skill.category)}</p></div>
                  <Badge variant="outline" className="border-blue-200 text-blue-700">{t('Momentum')} {momentum}/100</Badge>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-600">{reason}</p>
                {currentLevel > 0 && <p className="mt-1 text-[11px] text-slate-500">{t('Current proficiency:')} {currentLevel}/5</p>}
              </li>)}
            </ul> : <p className="rounded-xl border border-dashed border-blue-200 bg-blue-50/50 px-4 py-6 text-center text-sm text-slate-600">{t('Your profile currently covers the suggested skills. Continue refining your skill levels as your goals evolve.')}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const CAREER_STRATEGIES: Array<{ id: CareerStrategy; icon: typeof Target; title: string; desc: string }> = [
  { id: 'enhance', icon: ArrowUpRight, title: 'Keep My Career Relevant with AI', desc: 'Adapt to AI-driven changes, strengthen your skills, and stay competitive in your current profession.' },
  { id: 'related-transition', icon: Briefcase, title: 'Transition to a related role', desc: 'Apply your current strengths in a closely connected role.' },
  { id: 'new-field', icon: Globe, title: 'Move into a different field', desc: 'Explore opportunities and SDG connections in a new field.' },
  { id: 'ai-skills', icon: Sparkles, title: 'Develop AI-related skills', desc: 'Choose an AI skill and describe what you want to do with it.' },
];

function CareerStrategyStep({ details, patchDetails }: { details: IndividualProfileDetails; patchDetails: (patch: Partial<IndividualProfileDetails>) => void }) {
  const profile = useSkillCast((state) => state.profile);
  const { momentumMap } = useSignals();
  const t = useT();
  const [showAllFields, setShowAllFields] = useState(false);
  const profileMatches = useMemo(() => matchAll(profile, momentumMap), [profile, momentumMap]);
  const matchBySlug = new Map(profileMatches.map((match) => [match.roleSlug, match]));
  const professionText = `${details.profession ?? ''} ${details.fieldOfWork ?? ''} ${details.specialization ?? ''}`.toLowerCase();
  const profileWords = [details.profession, details.fieldOfWork, details.specialization, profile.objective, ...(profile.interests ?? [])]
    .filter(Boolean).flatMap((value) => String(value).toLowerCase().split(/[^a-z0-9]+/)).filter((word) => word.length > 2);
  const interestWords = (profile.interests ?? []).flatMap((interest) => interest.toLowerCase().split(/[^a-z0-9]+/)).filter((word) => word.length > 2);
  const textMatchesProfile = (text: string) => {
    const normalized = text.toLowerCase();
    return profileWords.some((word) => normalized.includes(word) || word.includes(normalized));
  };
  const hasPersonalData = Boolean(details.profession?.trim() || details.fieldOfWork?.trim() || Object.keys(profile.skills).length || profile.interests.length);
  const transferableForRole = (role: (typeof ROLES)[number]) => {
    const found = role.skills.flatMap((req) => {
      const own = Object.entries(ADJACENCY_MAP[req.skill] ?? {})
        .filter(([slug]) => (profile.skills[slug] ?? 0) > 0)
        .map(([slug, strength]) => ({ slug, strength, level: profile.skills[slug] ?? 0 }));
      if ((profile.skills[req.skill] ?? 0) > 0) own.push({ slug: req.skill, strength: 1, level: profile.skills[req.skill] });
      return own;
    });
    return [...new Map(found.map((item) => [item.slug, item])).values()].sort((a, b) => b.strength * b.level - a.strength * a.level);
  };
  const roleNeeds = (role: (typeof ROLES)[number]) => role.skills
    .map((req) => ({ req, skill: SKILL_MAP[req.skill], current: profile.skills[req.skill] ?? 0 }))
    .filter((item) => item.skill)
    .sort((a, b) => a.current / a.req.minLevel - b.current / b.req.minLevel);
  const relatedRoles = profileMatches.map((match) => {
    const role = ROLE_MAP[match.roleSlug];
    return { role, match, contextual: textMatchesProfile(`${role.title} ${role.category} ${role.tagline}`), transfer: transferableForRole(role), needs: roleNeeds(role) };
  }).sort((a, b) => Number(b.contextual) - Number(a.contextual) || b.match.score - a.match.score).slice(0, 4);
  const enhanceRoleOptions = relatedRoles.slice(0, 5);
  const enhanceRole = ROLE_MAP[details.strategyRole ?? ''] ?? enhanceRoleOptions[0]?.role ?? ROLES[0];
  const enhanceSkillOptions = roleNeeds(enhanceRole).slice(0, 5);

  const fieldDescriptions: Record<string, string> = {
    AI: 'Help teams use AI tools thoughtfully in everyday work.',
    AgriTech: 'Use practical technology to improve agriculture, food systems, and resource planning.',
    Business: 'Understand organizational needs, improve services, and support clear decisions.',
    Education: 'Support learning, training, and access to useful knowledge.',
    Governance: 'Support fair, accountable, and well-documented decisions.',
    'Green Energy': 'Help develop cleaner energy systems and use resources more efficiently.',
    Health: 'Help people access care and coordinate health services safely.',
    Marketing: 'Understand audiences and communicate useful products or services.',
    Operations: 'Keep processes running smoothly and improve how work gets done.',
    People: 'Support recruitment, workplace development, and healthy team practices.',
    Service: 'Help people solve problems and receive consistent support.',
    Sustainability: 'Understand environmental impact and plan responsible changes.',
    Technology: 'Build, maintain, or improve digital products and services.',
  };
  const categorySuggestions = [...new Set(ROLES.map((role) => role.category))].map((category) => {
    const roles = ROLES.filter((role) => role.category === category).map((role) => ({ role, match: matchBySlug.get(role.slug) }))
      .sort((a, b) => (b.match?.score ?? 0) - (a.match?.score ?? 0));
    const categoryText = `${category} ${roles.map(({ role }) => `${role.title} ${role.tagline}`).join(' ')}`.toLowerCase();
    const interestMatch = interestWords.some((word) => categoryText.includes(word));
    const score = roles.reduce((sum, item) => sum + (item.match?.score ?? 0), 0) / Math.max(1, roles.length) + (interestMatch ? 18 : 0);
    return { category, roles, interestMatch, score };
  }).sort((a, b) => b.score - a.score);
  const shownCategories = showAllFields ? categorySuggestions : categorySuggestions.slice(0, 4);
  const fieldRoles = details.newField ? categorySuggestions.find((item) => item.category === details.newField)?.roles ?? [] : [];
  const fieldNeeds = [...new Map(fieldRoles.flatMap(({ role }) => roleNeeds(role).filter(({ current, req }) => current < req.minLevel)
    .map(({ req, skill, current }) => [skill.slug, { skill, current, target: req.minLevel, weight: req.weight }] as const))).values()]
    .sort((a, b) => b.weight - a.weight).slice(0, 4);

  const taskExamples = professionText.includes('account') || professionText.includes('finance')
    ? ['Organize spreadsheet data and flag unusual entries', 'Summarize invoices or policy documents', 'Prepare a first draft of recurring reports']
    : professionText.includes('market') || professionText.includes('content')
      ? ['Draft alternate campaign copy for review', 'Summarize campaign results and audience feedback', 'Turn a brief into a first outline']
      : professionText.includes('human resource') || professionText.includes(' hr') || professionText.includes('people')
        ? ['Summarize hiring documents for human review', 'Draft interview questions from a role brief', 'Prepare a first version of internal communications']
        : details.employmentStatus === 'student'
          ? ['Organize research notes into themes', 'Summarize readings before checking the source', 'Plan study tasks and create practice questions']
          : ['Summarize long documents before review', 'Draft routine messages or reports for your review', 'Sort information into a useful first-pass structure'];

  const aiGuidance: Record<string, { plain: string; example: string; benefit: string; difficulty: string; start: string; next: string }> = {
    'prompt-engineering': { plain: 'Give an AI tool clear instructions, useful context, and a format to follow.', example: 'Ask it to summarize meeting notes into decisions, owners, and due dates, then check the result.', benefit: 'Get more useful first drafts and summaries from tools you already use.', difficulty: 'Beginner', start: 'Try a low-risk task and show the tool an example of the format you need.', next: 'Practice checking and refining the answer when it is incomplete.' },
    'ai-augmented-ops': { plain: 'Use everyday automation tools to handle repeatable steps in a work process.', example: 'Set a reminder when a form arrives, or draft a routine response for a person to approve.', benefit: 'Reduce repetitive coordination while keeping people in control of decisions.', difficulty: 'Beginner', start: 'Map one repetitive task and choose a safe step that could be assisted.', next: 'Learn to review, document, and improve a simple workflow.' },
    'responsible-ai': { plain: 'Check AI output for accuracy, privacy, fairness, and appropriate use.', example: 'Compare a generated summary with its source and remove personal details before sharing.', benefit: 'Use AI more confidently without treating its output as automatically correct.', difficulty: 'Beginner', start: 'Learn what information should stay private and how to check claims against a source.', next: 'Explore bias, consent, and workplace rules for AI tools.' },
    'data-analysis': { plain: 'Use AI-assisted spreadsheet and reporting tools to explore patterns in information.', example: 'Ask a spreadsheet assistant to explain a formula or summarize monthly figures, then validate it.', benefit: 'Make routine analysis easier while keeping interpretation and decisions with you.', difficulty: 'Beginner', start: 'Practice with a small, non-sensitive spreadsheet and ask for a plain-language summary.', next: 'Check calculations, charts, and conclusions against the source data.' },
    'ai-content-ops': { plain: 'Use AI to create and revise content drafts while you guide the message and check quality.', example: 'Turn a campaign brief into draft headlines, then edit them for audience and brand voice.', benefit: 'Speed up early drafts while your judgement shapes the final content.', difficulty: 'Beginner', start: 'Try a short draft using a public or fictional brief and compare it with your own.', next: 'Review accuracy, originality, tone, and audience fit.' },
    'privacy-compliance': { plain: 'Protect personal or confidential information when using digital tools.', example: 'Remove names and account details before using an approved tool to summarize a sample document.', benefit: 'Find safer ways to get help from AI without exposing sensitive information.', difficulty: 'Beginner', start: 'Review workplace data rules and practice only with non-sensitive examples.', next: 'Learn how privacy, consent, and retention rules apply to AI-assisted work.' },
    'critical-thinking': { plain: 'Ask good questions and judge whether an AI answer is relevant and well-supported.', example: 'Compare an AI-generated study summary with the original reading and note what is missing.', benefit: 'Catch weak or incomplete answers before they shape your work.', difficulty: 'Beginner', start: 'Practice checking one short answer against a trusted source.', next: 'Learn to compare sources and explain your reasoning.' },
    'digital-marketing': { plain: 'Understand how audiences respond to messages and campaign results.', example: 'Review AI-suggested campaign variations and compare them with audience feedback.', benefit: 'Keep campaigns useful and relevant while using AI for early drafts and analysis.', difficulty: 'Intermediate', start: 'Learn the basics of audience goals and campaign measures.', next: 'Practice reviewing AI-assisted drafts against real campaign objectives.' },
    'business-analysis': { plain: 'Break a work problem into steps and identify where assistance might help.', example: 'Map an approval process and identify one repetitive step for a safe automation pilot.', benefit: 'Choose practical improvements instead of adding AI where it does not help.', difficulty: 'Intermediate', start: 'Document a simple process and who depends on each step.', next: 'Learn to measure whether a change improves the process.' },
  };
  const aiSkillIds = professionText.includes('account') || professionText.includes('finance')
    ? ['data-analysis', 'ai-augmented-ops', 'responsible-ai', 'prompt-engineering', 'privacy-compliance']
    : professionText.includes('market') || professionText.includes('content')
      ? ['ai-content-ops', 'digital-marketing', 'data-analysis', 'prompt-engineering', 'responsible-ai']
      : professionText.includes('human resource') || professionText.includes(' hr') || professionText.includes('people')
        ? ['ai-augmented-ops', 'privacy-compliance', 'responsible-ai', 'prompt-engineering', 'business-analysis']
        : details.employmentStatus === 'student'
          ? ['prompt-engineering', 'responsible-ai', 'critical-thinking', 'data-analysis', 'ai-augmented-ops']
          : ['prompt-engineering', 'ai-augmented-ops', 'responsible-ai', 'data-analysis', 'privacy-compliance'];
  const aiRecommendations = aiSkillIds.flatMap((slug) => {
    const skill = SKILL_MAP[slug];
    const guidance = aiGuidance[slug];
    return skill && guidance ? [{ skill, guidance }] : [];
  });
  const generalAiSuggestions = !details.profession?.trim() && !details.fieldOfWork?.trim();

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-600">{t('Choose the direction that best fits your goals. Each path asks for the details needed to personalize your next steps.')}</p>
      <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label={t('Career strategy')}>
        {CAREER_STRATEGIES.map((item) => (
          <button key={item.id} type="button" role="radio" aria-checked={details.careerStrategy === item.id} onClick={() => patchDetails(details.careerStrategy === item.id ? { careerStrategy: item.id } : { careerStrategy: item.id, strategyRole: '', focusSkill: '', newField: '', aiGoal: '', aiSkill: '' })} className={`min-h-36 rounded-xl border p-5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${details.careerStrategy === item.id ? 'border-blue-500 dark:border-blue-500 bg-blue-50 ring-2 ring-blue-100 dark:ring-blue-900' : 'border-blue-100 dark:border-slate-700 bg-white hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/40'}`}>
            <item.icon className="h-5 w-5 text-blue-600" aria-hidden />
            <span className="mt-3 block font-semibold text-slate-900">{t(item.title)}</span>
            <span className="mt-1.5 block text-sm leading-5 text-slate-600">{t(item.desc)}</span>
          </button>
        ))}
      </div>

      {details.careerStrategy === 'enhance' && (
        <section className="space-y-4 rounded-2xl border border-blue-100 dark:border-slate-700 bg-blue-50/50 p-4 sm:p-5" aria-label={t('Keep your career relevant with AI guidance')}>
          <div><h3 className="font-semibold text-slate-900">{t('Keep your experience relevant as AI changes work')}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{t('AI may change how tasks are completed in')} {details.profession || t('your profession')}{t(', especially structured or repetitive work. Learning to guide these tools, check their output, and protect sensitive information can help you adapt while your expertise and judgment remain central. These practical suggestions use the current SkillCast skills taxonomy.')}</p></div>
          <div className="rounded-xl border border-blue-100 dark:border-slate-700 bg-white p-4"><h4 className="text-sm font-semibold text-slate-900">{t('Tasks AI may assist with')}</h4><ul className="mt-2 grid gap-1.5 text-sm text-slate-600 sm:grid-cols-3">{taskExamples.map((task) => <li key={task} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" aria-hidden />{task}</li>)}</ul><p className="mt-2 text-xs text-slate-500">{t('Examples only; suitability depends on the task, approved tools, and workplace rules. Review outputs before relying on them.')}</p></div>
          <div className="space-y-3">
            <div><h4 className="text-sm font-semibold text-slate-900">{t('Personalized AI skills worth learning')}</h4><p className="mt-1 text-xs text-slate-600">{t('Beginner-friendly ideas connected to')} {details.profession || details.fieldOfWork || (generalAiSuggestions ? t('general workplace tasks') : t('your profile'))}{t('. Open a suggestion to see a practical first step.')}</p></div>
            {generalAiSuggestions && <p className="rounded-lg border border-blue-100 dark:border-slate-700 bg-white px-3 py-2 text-xs text-slate-600">{t('General suggestions: add a profession or field in your profile for more tailored examples.')}</p>}
            <div className="grid gap-3 sm:grid-cols-2">{aiRecommendations.map(({ skill, guidance }) => <details key={skill.slug} className="group rounded-xl border border-blue-100 dark:border-slate-700 bg-white p-4">
              <summary className="cursor-pointer list-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><span className="flex items-start justify-between gap-3"><span><span className="block text-sm font-semibold text-slate-900">{skillName(t, skill.slug)}</span><span className="mt-1 block text-xs leading-5 text-slate-600">{t(guidance.plain)}</span></span><Badge variant="outline" className="shrink-0 border-blue-200 text-blue-700">{t(guidance.difficulty)}</Badge></span><span className="mt-2 block text-xs font-medium text-blue-700 group-open:hidden">{t('See a practical example and learning steps')}</span></summary>
              <div className="mt-3 space-y-2 border-t border-blue-50 pt-3 text-xs leading-5 text-slate-600"><p><strong className="text-slate-800">{t('Workplace example:')}</strong> {t(guidance.example)}</p><p><strong className="text-slate-800">{t('How it can help:')}</strong> {t(guidance.benefit)}</p><p><strong className="text-slate-800">{t('Start here:')}</strong> {t(guidance.start)}</p><p><strong className="text-slate-800">{t('Next:')}</strong> {t(guidance.next)}</p></div>
            </details>)}</div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-800">{t('Career goal / target role')} <span className="text-rose-600">*</span>
              <Select value={details.strategyRole || '__unset__'} onValueChange={(value) => patchDetails({ strategyRole: value === '__unset__' ? '' : value, focusSkill: '' })}><SelectTrigger className={LIGHT_SELECT}><SelectValue placeholder={t('Choose a target role')} /></SelectTrigger><SelectContent><SelectItem value="__unset__">{t('Choose a target role')}</SelectItem>{enhanceRoleOptions.map(({ role }) => <SelectItem key={role.slug} value={role.slug}>{roleTitle(t, role.slug)}</SelectItem>)}</SelectContent></Select>
            </label>
            <div><p className="text-sm font-medium text-slate-800">{t('Priority skill to strengthen')} <span className="text-rose-600">*</span></p>
              <Select value={details.focusSkill || '__unset__'} onValueChange={(value) => patchDetails({ focusSkill: value === '__unset__' ? '' : value })}><SelectTrigger className={LIGHT_SELECT}><SelectValue placeholder={t('Choose a skill')} /></SelectTrigger><SelectContent><SelectItem value="__unset__">{t('Choose a skill')}</SelectItem>{enhanceSkillOptions.map(({ skill }) => <SelectItem key={skill.slug} value={skill.slug}>{skillName(t, skill.slug)}</SelectItem>)}</SelectContent></Select>
            </div>
          </div>
          {!hasPersonalData && <p className="text-xs text-slate-500">{t('General suggestions shown because profile details are limited.')}</p>}
        </section>
      )}

      {details.careerStrategy === 'related-transition' && (
        <section className="space-y-4 rounded-2xl border border-blue-100 dark:border-slate-700 bg-blue-50/50 p-4 sm:p-5" aria-label={t('Related role recommendations')}>
          <div><h3 className="font-semibold text-slate-900">{t('Roles that connect with your experience')}</h3><p className="mt-1 text-sm text-slate-600">{t("Ranked using SkillCast's match formula, your skill levels, experience, and interests")}. {t('. These are pathways, not job openings.')}</p></div>
          <div className="grid gap-3 sm:grid-cols-2">{relatedRoles.map(({ role, match, contextual, transfer, needs }) => <button key={role.slug} type="button" aria-pressed={details.strategyRole === role.slug} onClick={() => patchDetails({ strategyRole: role.slug })} className={`rounded-xl border bg-white p-4 text-left transition hover:border-blue-300 dark:hover:border-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${details.strategyRole === role.slug ? 'border-blue-500 dark:border-blue-500 ring-2 ring-blue-100 dark:ring-blue-900' : 'border-blue-100 dark:border-slate-700'}`}>
            <span className="flex items-start justify-between gap-2"><span><span className="block font-semibold text-slate-900">{roleTitle(t, role.slug)}</span><span className="mt-1 block text-xs text-slate-500">{roleCategory(t, role.category)}</span></span>{details.strategyRole === role.slug && <Check className="h-4 w-4 text-blue-600" aria-hidden />}</span>
            <span className="mt-3 block text-sm leading-5 text-slate-600">{roleTagline(t, role.slug)}</span>
            <span className="mt-2 block text-xs font-medium text-blue-700">{t('SkillCast profile fit:')} {match.score}/100</span><span className="mt-1 block text-[11px] leading-4 text-slate-500">{t('Based on skill overlap, transferable skills, experience, and interests')}{contextual ? ` · ${t('profile wording also relates to this pathway')}` : ''}.</span>
            <span className="mt-3 grid gap-2 border-t border-blue-50 pt-3 text-xs text-slate-600 sm:grid-cols-2"><span><strong className="block text-slate-800">{t('Transferable skills')}</strong>{transfer.slice(0, 3).map((item) => skillName(t, item.slug)).join(', ') || t('No direct mapped overlap yet.')}</span><span><strong className="block text-slate-800">{t('Skills to develop')}</strong>{needs.filter((item) => item.current < item.req.minLevel).slice(0, 3).map((item) => skillName(t, item.skill.slug)).join(', ') || t('Current levels meet listed requirements.')}</span></span>
          </button>)}</div>
          {!hasPersonalData && <p className="text-xs text-slate-500">{t('General pathway suggestions shown because profile details are limited.')}</p>}
        </section>
      )}

      {details.careerStrategy === 'new-field' && (
        <section className="space-y-4 rounded-2xl border border-blue-100 dark:border-slate-700 bg-blue-50/50 p-4 sm:p-5" aria-label={t('Explore a different field')}>
          <div><h3 className="font-semibold text-slate-900">{t('Explore fields that fit your interests')}</h3><p className="mt-1 text-sm text-slate-600">{t('Choose a field to see example careers, everyday activities, entry skills, and mapped SDG connections.')}</p></div>
          <div className="grid gap-3 sm:grid-cols-2">{shownCategories.map(({ category, roles, interestMatch }) => {
            const examples = roles.slice(0, 2);
            const entryRoleSet = roles.some(({ role }) => role.entryLevel) ? roles.filter(({ role }) => role.entryLevel) : roles;
            const entrySkills = [...new Set(entryRoleSet.flatMap(({ role }) => role.skills.map((req) => req.skill)))].slice(0, 3);
            const selected = details.newField === category;
            return <div key={category} className={`rounded-xl border bg-white p-4 transition ${selected ? 'border-blue-500 dark:border-blue-500 ring-2 ring-blue-100 dark:ring-blue-900' : 'border-blue-100 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'}`}>
              <button type="button" aria-pressed={selected} onClick={() => patchDetails({ newField: category, strategyRole: '' })} className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><span className="flex items-center justify-between gap-2"><span className="font-semibold text-slate-900">{category}</span>{selected && <Check className="h-4 w-4 text-blue-600" aria-hidden />}</span><span className="mt-1.5 block text-sm leading-5 text-slate-600">{fieldDescriptions[category] ?? `Explore practical roles and skills in ${category.toLowerCase()}.`}</span>{interestMatch && <span className="mt-2 inline-block rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700">{t('Matches your interests')}</span>}</button>
              <p className="mt-3 text-xs text-slate-600"><strong className="text-slate-800">{t('Example careers:')}</strong> {examples.map(({ role }) => roleTitle(t, role.slug)).join('; ') || t('No mapped example yet.')}</p>
              <details className="mt-3 rounded-lg bg-blue-50/60 p-3 text-xs text-slate-600"><summary className="cursor-pointer font-semibold text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">{t('Activities, entry skills & SDGs')}</summary>
                {examples.length > 0 && <div className="mt-2 space-y-2">{examples.map(({ role }) => <div key={role.slug}><p><strong className="text-slate-800">{t('Typical activity ·')} {roleTitle(t, role.slug)}:</strong> {roleTagline(t, role.slug)}</p><p className="mt-1"><strong className="text-slate-800">{t('SDG connection:')}</strong> {roleSdgMechanism(t, role.slug)} <span className="inline-flex gap-1 align-middle">{role.sdgTags.map((goal) => <SdgBadge key={goal} goal={goal} />)}</span></p></div>)}</div>}
                <p className="mt-2"><strong className="text-slate-800">{t('Entry skills to explore:')}</strong> {entrySkills.map((slug) => skillName(t, slug)).join(', ') || t('Communication and problem-solving foundations.')}</p>
              </details>
            </div>;
          })}</div>
          {categorySuggestions.length > 4 && <Button type="button" variant="outline" onClick={() => setShowAllFields((shown) => !shown)} className="border-blue-200 text-blue-700 hover:bg-blue-50">{showAllFields ? 'Show fewer fields' : 'Show all fields'}</Button>}
          {!hasPersonalData && <p className="text-xs text-slate-500">{t('General field suggestions shown because profile details are limited.')}</p>}
          {details.newField && <div className="space-y-3 rounded-xl border border-blue-100 dark:border-slate-700 bg-white p-4"><h4 className="font-semibold text-slate-900">{details.newField}{t(': related roles and learning priorities')}</h4>
            {fieldRoles.length ? <div className="grid gap-3 sm:grid-cols-2">{fieldRoles.slice(0, 4).map(({ role, match }) => <div key={role.slug} className="rounded-lg border border-blue-50 p-3"><p className="text-sm font-medium text-slate-900">{roleTitle(t, role.slug)}</p><p className="mt-1 text-xs leading-5 text-slate-600">{roleTagline(t, role.slug)}</p><p className="mt-2 text-xs text-blue-700">{t('SkillCast profile match:')} {match?.score ?? '—'}/100</p><div className="mt-2 flex gap-1">{role.sdgTags.map((goal) => <SdgBadge key={goal} goal={goal} />)}</div></div>)}</div> : <p className="text-sm text-slate-600">{t('No current roles are mapped to this field.')}</p>}
            <div><p className="text-sm font-semibold text-slate-900">{t('Learning priorities')}</p>{fieldNeeds.length ? <ul className="mt-2 flex flex-wrap gap-2">{fieldNeeds.map(({ skill, current, target }) => <li key={skill.slug} className="rounded-full bg-blue-50 px-3 py-1.5 text-xs text-blue-800">{skillName(t, skill.slug)} · {current}/5 → {t('/5 → role level')} {target}</li>)}</ul> : <p className="mt-1 text-sm text-slate-600">{t('Your current levels cover the mapped skill requirements.')}</p>}</div>
          </div>}
        </section>
      )}

      {details.careerStrategy === 'ai-skills' && (
        <section className="space-y-4 rounded-2xl border border-blue-100 dark:border-slate-700 bg-blue-50/50 p-4 sm:p-5" aria-label={t('Practical AI skills recommendations')}>
          <div><h3 className="font-semibold text-slate-900">{t('Start with practical AI skills')}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{t("AI skills don't necessarily mean coding. They can help you work smarter, automate repetitive tasks, and adapt as your profession changes.")}</p>{generalAiSuggestions && <p className="mt-2 text-xs text-slate-500">{t('General beginner suggestions shown because profession details are limited.')}</p>}</div>
          <div className="grid gap-3 sm:grid-cols-2">{aiRecommendations.map(({ skill, guidance }) => <div key={skill.slug} className={`rounded-xl border bg-white p-4 transition ${details.aiSkill === skill.slug ? 'border-blue-500 dark:border-blue-500 ring-2 ring-blue-100 dark:ring-blue-900' : 'border-blue-100 dark:border-slate-700'}`}>
            <button type="button" aria-pressed={details.aiSkill === skill.slug} onClick={() => patchDetails({ aiSkill: skill.slug })} className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><span className="flex items-start justify-between gap-2"><span><span className="block text-sm font-semibold text-slate-900">{skillName(t, skill.slug)}</span><span className="mt-1 block text-xs text-slate-500">{t(guidance.difficulty)} · {skillCategory(t, skill.category)}</span></span>{details.aiSkill === skill.slug && <Check className="h-4 w-4 text-blue-600" aria-hidden />}</span><span className="mt-2 block text-sm leading-5 text-slate-600">{t(guidance.plain)}</span></button>
            <details className="mt-3 rounded-lg bg-blue-50/60 p-3 text-xs leading-5 text-slate-600"><summary className="cursor-pointer font-semibold text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">{t('Workplace example and learning steps')}</summary><p className="mt-2"><strong className="text-slate-800">{t('Example:')}</strong> {t(guidance.example)}</p><p className="mt-1"><strong className="text-slate-800">{t('How it can help:')}</strong> {t(guidance.benefit)}</p><p className="mt-1"><strong className="text-slate-800">{t('Start here:')}</strong> {t(guidance.start)}</p><p className="mt-1"><strong className="text-slate-800">{t('Learn next:')}</strong> {t(guidance.next)}</p></details>
          </div>)}</div>
          <label className="block text-sm font-medium text-slate-800">{t('What would you like to improve in your work or studies?')} <span className="text-rose-600">*</span>
            <Textarea value={details.aiGoal ?? ''} maxLength={300} onChange={(e) => patchDetails({ aiGoal: e.target.value.slice(0, 300) })} placeholder={t('For example: spend less time preparing reports, or organize research notes faster…')} rows={3} className="mt-1.5" />
          </label>
        </section>
      )}
    </div>
  );
}

const WORK_PREFERENCES: Array<{ value: string; label: string; description: string; icon: typeof Home }> = [
  { value: 'remote-hybrid', label: 'Remote or hybrid work', description: 'Work from home or split time between home and office.', icon: Home },
  { value: 'flexible-hours', label: 'Flexible hours', description: 'Adjust your working schedule when needed.', icon: Clock3 },
  { value: 'quiet-workplace', label: 'Quiet workplace', description: 'Work in an environment with fewer distractions.', icon: VolumeX },
  { value: 'written-instructions', label: 'Written instructions', description: 'Receive tasks and guidance in written form.', icon: FileText },
  { value: 'accessible-facilities', label: 'Accessible facilities', description: 'Workplaces designed for different mobility and accessibility needs.', icon: Accessibility },
  { value: 'assistive-technology', label: 'Assistive technology', description: 'Tools or software that make everyday tasks easier.', icon: Laptop },
  { value: 'flexible-communication', label: 'Flexible communication', description: 'Choose communication methods that work best for you.', icon: MessageSquareText },
  { value: 'none', label: 'No specific preferences', description: 'No additional workplace adjustments requested.', icon: Check },
];

function WorkPreferencesStep({ details, patchDetails, onSkip }: { details: IndividualProfileDetails; patchDetails: (patch: Partial<IndividualProfileDetails>) => void; onSkip: () => void }) {
  const { profile, setProfile } = useSkillCast();
  const t = useT();
  const selected = details.workPreferences ?? ['none'];
  const toggle = (value: string) => {
    const next = value === 'none'
      ? (selected.includes('none') ? [] : ['none'])
      : selected.includes(value) ? selected.filter((item) => item !== value) : [...selected.filter((item) => item !== 'none'), value];
    patchDetails({ workPreferences: next });
    setProfile({ inclusion: {
      ...profile.inclusion,
      dyslexia: next.includes('written-instructions'),
      visual: next.includes('assistive-technology'),
      hearing: next.includes('flexible-communication'),
      mobility: next.includes('accessible-facilities'),
      none: next.includes('none'),
    } });
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-600">{t('Optional: choose the work environment and support that helps you do your best work, or skip this step.')}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {WORK_PREFERENCES.map((item) => {
          const active = selected.includes(item.value);
          return <button key={item.value} type="button" aria-pressed={active} onClick={() => toggle(item.value)} className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${active ? 'border-blue-500 dark:border-blue-500 bg-blue-50 ring-1 ring-blue-100 dark:ring-blue-900' : 'border-blue-100 dark:border-slate-700 bg-white hover:border-blue-300 dark:hover:border-blue-700'}`}><item.icon className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" aria-hidden /><span className="flex-1"><span className="block text-sm font-medium text-slate-800">{t(item.label)}</span><span className="mt-1 block text-xs leading-5 text-slate-600">{t(item.description)}</span></span>{active && <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" aria-hidden />}</button>;
        })}
      </div>
      <p className="text-xs text-slate-500">{t('You can change these preferences later. This step is optional.')}</p>
    </div>
  );
}

// ═══ Employer track (4 steps) ═══════════════════════════════════════════════

function EmployerOnboarding() {
  const t = useT();
  const { employer, setEmployer, setUserType } = useSkillCast();
  const [step, setStep] = useState(1);

  const canNext = useMemo(() => {
    switch (step) {
      case 1: return employer.company.trim().length >= 2 && employer.industry !== '' && employer.teamSize >= 1;
      case 2:
        if (employer.intake === 'batch') return true;
        if (employer.intake === 'matrix') return employer.matrixUrl.trim().length >= 6;
        return employer.intake === 'template' && employer.template !== '';
      case 3: return employer.objective !== '';
      case 4: return employer.budgetPref !== '';
      default: return true;
    }
  }, [step, employer]);

  const finish = () => useSkillCast.setState({ onboarded: true, view: 'employer' });
  const back = step === 1 ? () => setUserType(null) : () => setStep((s) => Math.max(1, s - 1));

  const titles = [t('onb.emp.step1.q'), t('onb.emp.step2.q'), t('onb.emp.step3.q'), t('onb.emp.step4.q')];

  return (
    <OnboardingShell
      step={step}
      total={4}
      title={titles[step - 1]}
      desc={step === 2 ? t('onb.emp.step2.d') : undefined}
      icon={step === 1 ? Building2 : step === 2 ? FileArchive : step === 3 ? Target : CalendarClock}
      onBack={back}
      onNext={() => setStep((s) => Math.min(4, s + 1))}
      nextDisabled={!canNext}
      finish={finish}
      privacyNote={false}
      nextLabel={t('common.next')}
    >
      {step === 1 && <EmployerStepOrg />}
      {step === 2 && <EmployerStepIntake />}
      {step === 3 && <EmployerStepObjective />}
      {step === 4 && <EmployerStepParams />}
    </OnboardingShell>
  );
}

// Step 1: Organization details
function EmployerStepOrg() {
  const t = useT();
  const { employer, setEmployer } = useSkillCast();
  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="company">{t('onb.emp.company')}</Label>
        <Input
          id="company"
          value={employer.company}
          onChange={(e) => setEmployer({ company: e.target.value })}
          placeholder={t('onb.emp.company.ph')}
          className="mt-1.5"
        />
      </div>
      <div>
        <Label>{t('onb.emp.industry')}</Label>
        <div className="mt-2 grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4" role="radiogroup" aria-label={t('onb.emp.industry')}>
          {INDUSTRIES.map((ind) => (
            <button
              key={ind.id}
              type="button"
              role="radio"
              aria-checked={employer.industry === ind.id}
              onClick={() => setEmployer({ industry: ind.id })}
              className={`min-w-0 whitespace-normal break-words rounded-lg border px-3 py-2 text-sm transition-colors ${
                employer.industry === ind.id
                  ? 'border-blue-600 bg-blue-50 font-medium ring-1 ring-blue-200 dark:ring-blue-800'
                  : 'border-border hover:border-blue-400'
              }`}
            >
              {t(ind.labelKey)}
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label htmlFor="teamsize">{t('onb.emp.size')}</Label>
        <Input
          id="teamsize"
          type="number"
          min={1}
          max={5000}
          value={employer.teamSize}
          onChange={(e) => setEmployer({ teamSize: Math.max(1, Number(e.target.value) || 1) })}
          className="mt-1.5 max-w-32"
        />
        <p className="mt-1.5 text-xs text-muted-foreground">{t('onb.emp.size.hint')}</p>
      </div>
    </div>
  );
}

// Shared module-level intake option card (avoids components created during render)
function IntakeOption({
  selected, icon: Icon, title, desc, onSelect, children,
}: {
  selected: boolean; icon: typeof Upload; title: string; desc: string; onSelect: () => void; children?: React.ReactNode;
}) {
  return (
    <div
      className={`min-w-0 break-words rounded-xl border p-4 transition-colors ${
        selected
          ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-200 dark:ring-blue-800'
          : 'border-border'
      }`}
    >
      <button type="button" onClick={onSelect} className="flex w-full min-w-0 items-start gap-3 whitespace-normal text-left">
        <Icon className="mt-0.5 h-5 w-5 shrink-0 text-teal-600 dark:text-teal-400" aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 font-medium">
            {title}
            {selected && <Check className="h-4 w-4 text-blue-600" aria-hidden />}
          </span>
          <span className="mt-0.5 block text-sm text-muted-foreground">{desc}</span>
        </span>
      </button>
      {selected && children}
    </div>
  );
}

// Step 2: Team profile intake
function EmployerStepIntake() {
  const t = useT();
  const { employer, setEmployer } = useSkillCast();
  const fileRef = useRef<HTMLInputElement>(null);

  const sortedTemplates = useMemo(() => {
    return [...DEPT_TEMPLATES].sort((a, b) => {
      const aMatch = a.industry === employer.industry ? 0 : 1;
      const bMatch = b.industry === employer.industry ? 0 : 1;
      return aMatch - bMatch;
    });
  }, [employer.industry]);

  return (
    <div className="space-y-4">
      <IntakeOption
        selected={employer.intake === 'batch'}
        icon={Upload}
        title={t('onb.emp.intake.batch')}
        desc={t('onb.emp.intake.batch.d')}
        onSelect={() => setEmployer({ intake: 'batch' })}
      >
        <div className="mt-3 min-w-0 space-y-2 sm:pl-8">
          <input
            ref={fileRef}
            type="file"
            accept=".zip,.csv,.txt"
            className="hidden"
          />
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="h-auto min-h-9 max-w-full gap-2 whitespace-normal text-left">
            <ScanSearch className="h-4 w-4 shrink-0" aria-hidden /> {t('onb.emp.intake.batch.btn')}
          </Button>
          <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
            {t('onb.emp.intake.batch.notice')}
          </p>
          <p className="text-xs text-muted-foreground">{t('onb.emp.intake.batch.roster')}</p>
        </div>
      </IntakeOption>

      <IntakeOption
        selected={employer.intake === 'matrix'}
        icon={LinkIcon}
        title={t('onb.emp.intake.matrix')}
        desc={t('onb.emp.intake.matrix.d')}
        onSelect={() => setEmployer({ intake: 'matrix' })}
      >
        <div className="mt-3 min-w-0 sm:pl-8">
          <Input
            value={employer.matrixUrl}
            onChange={(e) => setEmployer({ matrixUrl: e.target.value })}
            placeholder="https://docs.google.com/…"
            aria-label={t('onb.emp.intake.matrix')}
          />
          <p className="mt-1.5 text-xs text-muted-foreground">{t('onb.emp.intake.matrix.note')}</p>
        </div>
      </IntakeOption>

      <IntakeOption
        selected={employer.intake === 'template'}
        icon={LayoutTemplate}
        title={t('onb.emp.intake.template')}
        desc={t('onb.emp.intake.template.d')}
        onSelect={() => setEmployer({ intake: 'template' })}
      >
        <div className="mt-3 grid min-w-0 gap-2 sm:grid-cols-2 sm:pl-8" role="radiogroup" aria-label={t('onb.emp.intake.template')}>
          {sortedTemplates.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              role="radio"
              aria-checked={employer.template === tpl.id}
              onClick={() => setEmployer({ template: tpl.id })}
              className={`flex min-w-0 flex-wrap items-center justify-between gap-2 whitespace-normal rounded-lg border px-3 py-2 text-sm transition-colors ${
                employer.template === tpl.id
                  ? 'border-blue-600 bg-blue-50 font-medium'
                  : 'border-border hover:border-blue-400'
              }`}
            >
              <span className="min-w-0">{t(tpl.labelKey)}</span>
              <span className="flex max-w-full flex-wrap items-center gap-1.5">
                {tpl.industry === employer.industry && <Badge variant="outline" className="max-w-full whitespace-normal text-[10px]">{t('onb.emp.match')}</Badge>}
                {tpl.totalStaff > tpl.shownMembers.length && (
                  <span className="text-[10px] text-muted-foreground">{tpl.shownMembers.length}/{tpl.totalStaff}</span>
                )}
              </span>
            </button>
          ))}
        </div>
      </IntakeOption>
    </div>
  );
}

// Step 3: Primary objective
const OBJECTIVES: Array<{ id: EmployerObjective; icon: typeof Target; labelKey: string; descKey: string }> = [
  { id: 'risk', icon: Gauge, labelKey: 'onb.emp.obj.risk', descKey: 'onb.emp.obj.risk.d' },
  { id: 'transition', icon: ListChecks, labelKey: 'onb.emp.obj.transition', descKey: 'onb.emp.obj.transition.d' },
  { id: 'budget', icon: Wallet, labelKey: 'onb.emp.obj.budget', descKey: 'onb.emp.obj.budget.d' },
];

function EmployerStepObjective() {
  const t = useT();
  const { employer, setEmployer } = useSkillCast();
  return (
    <div className="space-y-3" role="radiogroup" aria-label={t('onb.emp.step3.q')}>
      {OBJECTIVES.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={employer.objective === o.id}
          onClick={() => setEmployer({ objective: o.id })}
          className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
            employer.objective === o.id
              ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-200 dark:ring-blue-800'
              : 'border-border hover:border-teal-400'
          }`}
        >
          <o.icon className="mt-0.5 h-5 w-5 shrink-0 text-teal-600 dark:text-teal-400" aria-hidden />
          <span>
            <span className="flex items-center gap-2 font-medium">
              {t(o.labelKey)}
              {employer.objective === o.id && <Check className="h-4 w-4 text-blue-600" aria-hidden />}
            </span>
            <span className="mt-0.5 block text-sm text-muted-foreground">{t(o.descKey)}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

// Step 4: Timeline & budget
function EmployerStepParams() {
  const t = useT();
  const { employer, setEmployer } = useSkillCast();
  return (
    <div className="space-y-6">
      <div>
        <Label>{t('onb.emp.timeline')}</Label>
        <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label={t('onb.emp.timeline')}>
          {([3, 6, 12] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={employer.timelineMonths === m}
              onClick={() => setEmployer({ timelineMonths: m })}
              className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                employer.timelineMonths === m
                  ? 'border-blue-600 bg-blue-50 font-medium ring-1 ring-blue-200 dark:ring-blue-800'
                  : 'border-border hover:border-blue-400'
              }`}
            >
              {t(`onb.emp.months.${m}`)}
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label>{t('onb.emp.budget.pref')}</Label>
        <div className="mt-2 grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label={t('onb.emp.budget.pref')}>
          {(['free', 'paid'] as const).map((b) => (
            <button
              key={b}
              type="button"
              role="radio"
              aria-checked={employer.budgetPref === b}
              onClick={() => setEmployer({ budgetPref: b })}
              className={`rounded-xl border p-4 text-left text-sm transition-colors ${
                employer.budgetPref === b
                  ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-200 dark:ring-blue-800'
                  : 'border-border hover:border-teal-400'
              }`}
            >
              <span className="flex items-center gap-2 font-medium">
                {b === 'free' ? <BookOpen className="h-4 w-4 text-teal-600 dark:text-teal-400" aria-hidden /> : <Wallet className="h-4 w-4 text-teal-600 dark:text-teal-400" aria-hidden />}
                {t(`onb.emp.budget.${b}`)}
                {employer.budgetPref === b && <Check className="h-4 w-4 text-blue-600" aria-hidden />}
              </span>
              <span className="mt-1 block text-muted-foreground">{t(`onb.emp.budget.${b}.d`)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══ Institution track (4 steps) ════════════════════════════════════════════

function InstitutionOnboarding() {
  const t = useT();
  const { institution, setInstitution, setUserType } = useSkillCast();
  const [step, setStep] = useState(1);

  const canNext = useMemo(() => {
    switch (step) {
      case 1: return institution.name.trim().length >= 2 && institution.field !== '';
      case 2: return institution.intake !== '';
      case 3: return institution.focus !== '';
      default: return true;
    }
  }, [step, institution]);

  const finish = () => useSkillCast.setState({ onboarded: true, view: 'institution' });
  const back = step === 1 ? () => setUserType(null) : () => setStep((s) => Math.max(1, s - 1));

  const titles = [t('onb.inst.step1.q'), t('onb.inst.step2.q'), t('onb.inst.step3.q'), t('onb.inst.step4.q')];

  return (
    <OnboardingShell
      step={step}
      total={4}
      title={titles[step - 1]}
      desc={step === 1 ? t('onb.inst.step1.d') : undefined}
      icon={step === 1 ? GraduationCap : step === 2 ? ClipboardCheck : step === 3 ? Target : Globe}
      onBack={back}
      onNext={() => setStep((s) => Math.min(4, s + 1))}
      nextDisabled={!canNext}
      finish={finish}
    >
      {step === 1 && <InstitutionStepOrg />}
      {step === 2 && <InstitutionStepIntake />}
      {step === 3 && <InstitutionStepFocus />}
      {step === 4 && <InstitutionStepAccess />}
    </OnboardingShell>
  );
}

// Step 1: Institution & cohort profile
function InstitutionStepOrg() {
  const t = useT();
  const { institution, setInstitution } = useSkillCast();
  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="instname">{t('onb.inst.name')}</Label>
        <Input
          id="instname"
          value={institution.name}
          onChange={(e) => setInstitution({ name: e.target.value })}
          placeholder={t('onb.inst.name.ph')}
          className="mt-1.5"
        />
      </div>
      <div>
        <Label>{t('onb.inst.field')}</Label>
        <div className="mt-2 grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label={t('onb.inst.field')}>
          {FIELDS_OF_STUDY.map((f) => (
            <button
              key={f.id}
              type="button"
              role="radio"
              aria-checked={institution.field === f.id}
              onClick={() => setInstitution({ field: f.id })}
              className={`rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                institution.field === f.id
                  ? 'border-blue-600 bg-blue-50 font-medium ring-1 ring-blue-200 dark:ring-blue-800'
                  : 'border-border hover:border-blue-400'
              }`}
            >
              {t(f.labelKey)}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">{t('onb.inst.field.hint')}</p>
      </div>
    </div>
  );
}

// Step 2: Student skill intake
function InstitutionStepIntake() {
  const t = useT();
  const { institution, setInstitution } = useSkillCast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploaded, setUploaded] = useState(false);

  return (
    <div className="space-y-4">
      <IntakeOption
        selected={institution.intake === 'cv'}
        icon={Upload}
        title={t('onb.inst.intake.cv')}
        desc={t('onb.inst.intake.cv.d')}
        onSelect={() => setInstitution({ intake: 'cv' })}
      >
        <div className="mt-3 pl-8">
          <input
            ref={fileRef}
            type="file"
            multiple
            accept=".pdf,.txt,.md,.docx"
            className="hidden"
            onChange={() => setUploaded(true)}
          />
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="gap-2">
            <ScanSearch className="h-4 w-4" aria-hidden /> {t('onb.inst.intake.cv.btn')}
          </Button>
          {uploaded && (
            <p className="mt-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
              <ShieldCheck className="mr-1 inline h-4 w-4" aria-hidden /> {t('onb.inst.intake.cv.ok')}
            </p>
          )}
        </div>
      </IntakeOption>

      <IntakeOption
        selected={institution.intake === 'assessment'}
        icon={ClipboardCheck}
        title={t('onb.inst.intake.assessment')}
        desc={t('onb.inst.intake.assessment.d')}
        onSelect={() => setInstitution({ intake: 'assessment' })}
      >
        {institution.intake === 'assessment' && (
          <p className="mt-3 rounded-lg bg-muted px-3 py-2 pl-8 text-sm text-muted-foreground">
            {t('onb.inst.intake.assessment.note')}
          </p>
        )}
      </IntakeOption>
    </div>
  );
}

// Step 3: Advisory focus
const FOCUS_OPTIONS = [
  { id: 'entry', labelKey: 'onb.inst.focus.entry', descKey: 'onb.inst.focus.entry.d' },
  { id: 'gaps', labelKey: 'onb.inst.focus.gaps', descKey: 'onb.inst.focus.gaps.d' },
  { id: 'sdg', labelKey: 'onb.inst.focus.sdg', descKey: 'onb.inst.focus.sdg.d' },
] as const;

function InstitutionStepFocus() {
  const t = useT();
  const { institution, setInstitution } = useSkillCast();
  return (
    <div className="space-y-3" role="radiogroup" aria-label={t('onb.inst.step3.q')}>
      {FOCUS_OPTIONS.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={institution.focus === o.id}
          onClick={() => setInstitution({ focus: o.id })}
          className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
            institution.focus === o.id
                  ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-200 dark:ring-blue-800'
              : 'border-border hover:border-teal-400'
          }`}
        >
          <Target className="mt-0.5 h-5 w-5 shrink-0 text-teal-600 dark:text-teal-400" aria-hidden />
          <span>
            <span className="flex items-center gap-2 font-medium">
              {t(o.labelKey)}
              {institution.focus === o.id && <Check className="h-4 w-4 text-blue-600" aria-hidden />}
            </span>
            <span className="mt-0.5 block text-sm text-muted-foreground">{t(o.descKey)}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

// Step 4: Accessibility preferences
function InstitutionStepAccess() {
  const t = useT();
  const { institution, setInstitution, lang, setLang } = useSkillCast();
  return (
    <div className="space-y-6">
      <div>
        <Label>{t('onb.inst.lang.q')}</Label>
        <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label={t('onb.inst.lang.q')}>
          {LANGS.map(({ code, label }) => (
            <button
              key={code}
              type="button"
              role="radio"
              aria-checked={lang === code}
              onClick={() => setLang(code)}
              className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                lang === code
                  ? 'border-blue-600 bg-blue-50 font-medium ring-1 ring-blue-200 dark:ring-blue-800'
                  : 'border-border hover:border-blue-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">{t('onb.inst.lang.hint')}</p>
      </div>
      <div className="flex items-start justify-between gap-4 rounded-xl border p-4">
        <div>
          <Label htmlFor="lowbw">{t('onb.inst.lowbw')}</Label>
          <p className="mt-0.5 text-sm text-muted-foreground">{t('onb.inst.lowbw.d')}</p>
        </div>
        <Switch
          id="lowbw"
          checked={institution.lowBandwidth}
          onCheckedChange={(v) => setInstitution({ lowBandwidth: v })}
        />
      </div>
    </div>
  );
}

// ─── Individual steps (unchanged logic) ────────────────────────────────────

function StepPersona() {
  const t = useT();
  const { profile, setProfile } = useSkillCast();
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label={t('onb.persona.q')}>
        {PERSONAS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={profile.persona === p.id}
            onClick={() => setProfile({ persona: p.id })}
            className={`rounded-xl border p-4 text-left transition-colors ${
              profile.persona === p.id
                ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-200 dark:ring-blue-800'
                : 'border-border hover:border-teal-400'
            }`}
          >
            <span className="flex items-center justify-between">
              <span className="font-medium">{t(p.labelKey)}</span>
              {profile.persona === p.id && <Check className="h-4 w-4 text-blue-600" aria-hidden />}
            </span>
            <span className="mt-1 block text-sm text-muted-foreground">{t(p.descKey)}</span>
          </button>
        ))}
      </div>
      <div>
        <Label htmlFor="years">
          {t('onb.years')}: <span className="font-semibold text-foreground">{profile.years}</span>
        </Label>
        <Slider
          id="years"
          min={0}
          max={40}
          step={1}
          value={[profile.years]}
          onValueChange={([v]) => setProfile({ years: v })}
          className="mt-2"
        />
      </div>
    </div>
  );
}

function StepInterests() {
  const t = useT();
  const { profile, setProfile } = useSkillCast();
  const toggle = (i: string) => {
    const has = profile.interests.includes(i);
    setProfile({
      interests: has ? profile.interests.filter((x) => x !== i) : [...profile.interests, i],
    });
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {INTERESTS.map((i) => (
          <button
            key={i}
            type="button"
            aria-pressed={profile.interests.includes(i)}
            onClick={() => toggle(i)}
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
              profile.interests.includes(i)
              ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-border hover:border-blue-400'
            }`}
          >
            {t(`interest.${i}`)}
          </button>
        ))}
      </div>
      <div>
        <Label htmlFor="budget">
          {t('onb.budget.q')}{' '}
          <span className="font-semibold text-foreground">
            {profile.budget} {t('common.hrsweek')}
          </span>
        </Label>
        <Slider
          id="budget"
          min={1}
          max={25}
          step={1}
          value={[profile.budget]}
          onValueChange={([v]) => setProfile({ budget: v })}
          className="mt-2"
        />
        <p className="mt-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
          {t('onb.budget.hint')}
        </p>
      </div>
    </div>
  );
}

function StepSkills() {
  const t = useT();
  const { profile, setSkillLevel, completedCourses } = useSkillCast();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const entries = Object.entries(profile.skills).sort((a, b) => b[1] - a[1]);
  const selected = new Set(entries.map(([slug]) => slug));
  const normalizedQuery = query.trim().toLowerCase();
  const categories = useMemo(() => [...new Set(SKILLS.map((skill) => skill.category))], []);
  const courseCount = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const course of COURSES) for (const slug of course.skills) counts[slug] = (counts[slug] ?? 0) + 1;
    return counts;
  }, []);
  // Search the translated name and category too, so Uzbek and Russian queries work.
  const matchesQuery = (skill: (typeof SKILLS)[number]) => !normalizedQuery || [
    skill.name, skillName(t, skill.slug), skill.category, skillCategory(t, skill.category), ...skill.aliases,
  ].some((text) => text.toLowerCase().includes(normalizedQuery));
  const filtered = SKILLS.filter((skill) => !selected.has(skill.slug)
    && (category === 'all' || skill.category === category) && matchesQuery(skill));
  const limit = category === 'all' && !normalizedQuery ? 12 : filtered.length;
  const results = filtered.slice(0, limit);

  // Suggestions from the learner's background (field, profession, interests) and completed courses.
  const details = profile.extended ?? {};
  const backgroundTerms = [details.fieldOfWork, details.profession, details.specialization, ...(profile.interests ?? [])]
    .filter(Boolean).flatMap((term) => String(term).toLowerCase().split(/[^\p{L}\p{N}]+/u)).filter((term) => term.length > 2);
  const fromCourses = new Set(completedCourses.flatMap((slug) => COURSE_MAP[slug]?.skills ?? []));
  const suggested = SKILLS.filter((skill) => !selected.has(skill.slug) && (fromCourses.has(skill.slug) || backgroundTerms.some((term) =>
    skill.aliases.some((alias) => alias.includes(term)) || skill.name.toLowerCase().includes(term) || skill.category.toLowerCase().includes(term))))
    .slice(0, 8);

  return (
    <div className="space-y-7">
      <section aria-labelledby="your-skills-heading" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
          <h3 id="your-skills-heading" className="text-base font-semibold text-slate-900">{t('Your Skills')}</h3>
            <p className="mt-1 text-sm text-slate-500">{t('Set your current proficiency from 1 to 5.')}</p>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{entries.length} {t('selected')}</span>
        </div>
        {entries.length === 0 ? (
          <p className="rounded-xl border border-dashed border-blue-200 bg-blue-50/50 px-4 py-5 text-sm text-slate-600">{t('onb.skills.none')} {t('Search below to add your skills.')}</p>
        ) : null}
        <ul className="space-y-2">
        {entries.map(([slug, level]) => (
          <li key={slug} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-100 dark:border-slate-700 bg-white px-4 py-3 shadow-sm">
            <span className="min-w-0 flex-1 text-sm font-medium text-slate-900">{skillName(t, slug)}<span className="mt-0.5 block text-xs font-normal text-slate-500">{skillCategory(t, SKILL_MAP[slug]?.category ?? 'Skill')}</span></span>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <span className="sr-only">{skillName(t, slug)} {t('proficiency')}</span>
              <Select value={String(level)} onValueChange={(value) => setSkillLevel(slug, Number(value))}>
                <SelectTrigger className="h-11 w-44 rounded-xl border-blue-100 dark:border-slate-700 bg-white text-sm text-slate-900 shadow-sm hover:border-blue-200 focus:ring-2 focus:ring-blue-100"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">{t('0 · Remove')}</SelectItem>
                  <SelectItem value="1">{t('1 · Beginner')}</SelectItem>
                  <SelectItem value="2">{t('2 · Developing')}</SelectItem>
                  <SelectItem value="3">{t('3 · Intermediate')}</SelectItem>
                  <SelectItem value="4">{t('4 · Proficient')}</SelectItem>
                  <SelectItem value="5">{t('5 · Advanced')}</SelectItem>
                </SelectContent>
              </Select>
            </label>
            <button type="button" onClick={() => setSkillLevel(slug, 0)} aria-label={`${t('Remove')} ${skillName(t, slug)}`} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
              <X className="h-4 w-4" aria-hidden />
            </button>
          </li>
        ))}
        </ul>
      </section>

      <section aria-labelledby="find-skills-heading" className="space-y-3">
        <div>
          <h3 id="find-skills-heading" className="text-base font-semibold text-slate-900">{t('Find Skills to Add')}</h3>
          <p className="mt-1 text-sm text-slate-500">{t('Search the existing SkillCast skill taxonomy by name or category.')}</p>
        </div>
        <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-3 dark:border-slate-700 dark:bg-slate-900/40">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{t('skills.suggested')}</p>
          {suggested.length ? (
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {suggested.map((skill) => (
                <li key={skill.slug}>
                  <button type="button" onClick={() => setSkillLevel(skill.slug, 1)} aria-label={t('skills.add', { skill: skillName(t, skill.slug) })} className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-white px-2.5 py-1 text-xs text-blue-800 hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200">
                    <Plus className="h-3 w-3" aria-hidden />{skillName(t, skill.slug)}
                  </button>
                </li>
              ))}
            </ul>
          ) : <p className="mt-1 text-xs text-slate-500">{t('skills.suggested.none')}</p>}
        </div>
        <div role="group" aria-label={t('skills.browse')} className="flex flex-wrap gap-1.5">
          {['all', ...categories].map((cat) => (
            <button key={cat} type="button" aria-pressed={category === cat} onClick={() => setCategory(cat)} className={`rounded-full border px-3 py-1 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${category === cat ? 'border-blue-600 bg-blue-600 text-white' : 'border-blue-100 bg-white text-slate-700 hover:border-blue-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'}`}>
              {cat === 'all' ? t('skills.all') : skillCategory(t, cat)}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('Search skills or categories')} aria-label={t('Search skills or categories')} className="h-11 rounded-xl border-blue-100 dark:border-slate-700 bg-white pl-10 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-200" />
        </div>
        {results.length ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {results.map((skill) => (
              <li key={skill.slug}>
                <button type="button" onClick={() => setSkillLevel(skill.slug, 1)} className="group flex min-h-[76px] w-full items-center justify-between gap-3 rounded-xl border border-blue-100 dark:border-slate-700 bg-white px-4 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/60 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                  <span className="min-w-0"><span className="block truncate text-sm font-medium text-slate-900">{skillName(t, skill.slug)}</span><span className="mt-1 block text-xs text-slate-500">{skillCategory(t, skill.category)}{courseCount[skill.slug] ? ` · ${t('skills.taughtIn', { n: courseCount[skill.slug] })}` : ''}</span></span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700 transition group-hover:bg-blue-600 group-hover:text-white"><Plus className="h-4 w-4" aria-hidden /></span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl border border-dashed border-blue-200 bg-blue-50/50 px-4 py-6 text-center text-sm text-slate-600">{normalizedQuery ? t('No skills match your search. Try another skill name or category.') : t('All available skills have been added.')}</p>
        )}
        {results.length < filtered.length && <p className="text-xs text-slate-500">{t('Showing up to 12 matches. Refine your search to find more.')}</p>}
      </section>
    </div>
  );
}

function StepInclusion() {
  const t = useT();
  const { profile, setProfile } = useSkillCast();
  const incl = profile.inclusion;

  const toggle = (key: keyof typeof incl) => {
    const next = { ...incl, [key]: !incl[key] };
    if (key === 'none') {
      Object.assign(next, { dyslexia: false, visual: false, hearing: false, mobility: false, none: !incl.none });
    } else {
      next.none = false;
    }
    setProfile({ inclusion: next });
  };

  const needs: Array<{ key: 'dyslexia' | 'visual' | 'hearing' | 'mobility' | 'none'; label: string }> = [
    { key: 'dyslexia', label: t('inclusion.dyslexia') },
    { key: 'visual', label: t('inclusion.visual') },
    { key: 'hearing', label: t('inclusion.hearing') },
    { key: 'mobility', label: t('inclusion.mobility') },
    { key: 'none', label: t('inclusion.none') },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        {needs.map((n) => (
          <label
            key={n.key}
            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition-colors ${
              incl[n.key] ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-border'
            }`}
          >
            <input
              type="checkbox"
              checked={incl[n.key]}
              onChange={() => toggle(n.key)}
              className="mt-0.5 h-4 w-4 accent-blue-600"
            />
            <span>{n.label}</span>
          </label>
        ))}
      </div>
      <div className="space-y-2">
        <h3 className="font-semibold">{t('onb.objective.title')}</h3>
        <p className="text-sm text-muted-foreground">{t('onb.objective.desc')}</p>
        <Textarea
          value={profile.objective}
          onChange={(e) => setProfile({ objective: e.target.value })}
          placeholder={t('onb.objective.ph')}
          rows={2}
        />
        <Badge variant="outline" className="text-[11px] text-muted-foreground">
          {t('harada.method')}
        </Badge>
      </div>
    </div>
  );
}

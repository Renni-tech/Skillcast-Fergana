import type { Lang } from '@/lib/types';
import { COURSES } from '@/data/courses';
import { ROLES } from '@/data/roles';
import { SKILLS } from '@/data/skills';
import { ROLE_CATEGORY_COPY, ROLE_SDG_COPY, SKILL_CATEGORY_COPY, SKILL_COPY } from './catalog-i18n';
import { COURSE_COPY, COURSE_OUTCOME_COPY } from './course-i18n';
import { GUIDANCE_COPY } from './guidance-i18n';
import { HR_DICTIONARIES } from './hr-i18n';
import inlineCopy from './i18n-inline';
import uz from './i18n-uz';
import { LEARNER_FLOW_COPY } from './learner-flow-i18n';
import { FERGANA_UI_COPY } from './fergana-ui-i18n';
import { EXPERIENCE_COPY } from './experience-i18n';
import { QUALITY_COPY } from './quality-i18n';
import { RESOURCE_CATALOG_COPY, TOPIC_COPY } from './resource-catalog-i18n';

// ─── i18n: English · Uzbek · Russian ───────────────────────────────────────
// Interface-owned UI and HR registry labels are translated. Real third-party
// course/provider and report titles retain their source wording for traceability.

type Dict = Record<string, string>;

const en: Dict = {
  'emp.hr.team': 'Synthetic team',
  'emp.hr.top.skills': 'Top skills',
  'emp.hr.budget.scope': 'Catalogue hours for courses covering the top five team gaps, deduplicated by skill coverage. These are not total learner-hours, all individual course recommendations, or a cost forecast.',
  'onb.emp.step3.q': 'What is your workforce planning objective?',
  'onb.emp.step4.q': 'Set the planning timeline and training budget',
  'emp.context.title': 'Company and workforce context',
  'emp.context.industry': 'Industry',
  'emp.context.size': 'Configured company headcount · not assessed',
  'emp.context.location': 'Location',
  'emp.context.location.na': 'Not collected',
  'emp.context.profiles': 'Synthetic demo profiles',
  'emp.context.roles': 'Roles in the synthetic roster',
  'emp.context.departments': 'Departments in the synthetic roster',
  'emp.context.mix.note': 'Role and department lists describe only the displayed synthetic profiles, not the real company workforce.',
  'emp.hr.profiles': 'synthetic profiles',
  'emp.hr.disclosure': 'Synthetic planning demo only. No real employees have been assessed. Company headcount is a setup value, not the sample size. Individual demo rows are not anonymised real employee records.',
  'emp.hr.readiness': 'Synthetic target-role skill readiness',
  'emp.hr.readiness.note': 'Average weighted skill readiness for {role}, across {n} synthetic profiles. Uses the published matching engine; not an assessment of real employees.',
  'emp.hr.progress.label': 'Illustrative synthetic progress · not tracked',
  'emp.hr.demand.index': 'Illustrative demand index: {n}/100',
  'emp.hr.demand.note': 'Curated role-registry scenario indices, not measured vacancies or forecasts. Declining/rising labels describe the change from moderate to faster adoption. Vacancy-feed status and evidence are reported separately below.',
  'emp.hr.sample.note': '{n} synthetic profiles only; no unseen employees are aggregated',
  'emp.hr.target': 'Target role',
  'emp.hr.gap.count': 'synthetic profiles with a gap',
  'emp.hr.critical': 'Critical skills for the selected target role',
  'emp.hr.required': 'required level {n}/5',
  'emp.hr.training.note': 'Recommendations use each synthetic profile’s gaps for the selected role, prioritised by required-skill weight × momentum. Courses follow the existing registry order and are counted once per learner. Not every gap has a course.',
  'emp.hr.hours': 'Approximately {n} hours per learner',
  'emp.hr.learners': '{n}/{total} unique synthetic learners recommended',
  'emp.hr.covers': 'Closes selected-role gaps in: {skills}',
  'emp.hr.support': 'Suggested team support: protected learning time, peer practice, and manager check-ins. This is a proposed plan, not recorded attendance or completion.',
  'emp.reskill.progress': 'Illustrative reskilling progress',
  'emp.reskill.hours': '{completedHours} of {plannedHours} synthetic example hours · not tracked',
  'emp.scenarios.title': 'AI adoption planning scenarios',
  'emp.scenario.moderate': 'Moderate adoption',
  'emp.scenario.fast': 'Faster adoption',
  'emp.scenario.moderate.desc': 'Gradual rollout: pilot AI-supported tasks while building practical skills.',
  'emp.scenario.fast.desc': 'Broader, earlier rollout: parallel team training with role-specific support.',
  'emp.scenario.moderate.cadence': 'Suggested support: short weekly learning blocks with practice between sessions.',
  'emp.scenario.fast.cadence': 'Suggested support: more frequent protected learning blocks and team practice.',
  'emp.scenario.caveat': 'Illustrative planning scenarios, not predictions of layoffs, job availability, or individual performance.',
  'emp.outlook.risk.label': 'Illustrative declining demand',
  'emp.outlook.opportunity.label': 'Illustrative rising demand',
  'emp.training.title': 'Explainable training priorities',
  'emp.no.priority.gap': 'No registry course recommended for the current gaps.',
  'emp.sdg.title': 'Connections to UN Sustainable Development Goals',
  'emp.sdg.desc': 'Planning mechanisms, not evidence that a development outcome has been achieved.',
  'emp.sdg.4.title': 'SDG 4 · Quality education',
  'emp.sdg.4.desc': 'Target 4.4: practical technical and vocational skills through accessible lifelong learning.',
  'emp.sdg.8.title': 'SDG 8 · Decent work',
  'emp.sdg.8.desc': 'Targets 8.2 and 8.5: support productive, responsible transitions and decent work as tasks change.',
  'emp.sdg.9.title': 'SDG 9 · Industry, innovation and infrastructure',
  'emp.sdg.9.desc': 'Target 9.5: strengthen innovation capability through responsible technical skills and practice.',
  'onb.emp.intake.batch.notice': 'Selecting a file does not upload, read, import, or process its contents. This demo does not display filenames. The dashboard uses a fixed synthetic roster, not employees from your file.',
  'onb.emp.intake.batch.roster': 'Synthetic example profiles only · no real employee assessment.',
  'nav.home': 'Home',
  'nav.dashboard': 'My forecast',
  'nav.employer': 'Employer view',
  'nav.signals': 'Signal sources',
  'nav.reset': 'Reset demo',
  'nav.lang': 'Language',

  'landing.title': 'A learning forecast for your future skills',
  'landing.subtitle':
    'Build a learner profile, see which skills to strengthen next, and follow a practical learning path rooted in Fergana City and connected to opportunities across Uzbekistan and beyond.',
  'landing.cta': 'Build my learner profile',
  'landing.cta2': 'Employer view',
  'landing.badge': 'Proof of concept · synthetic demo profiles only',
  'landing.steps.title': 'From who you are today to where you can be',
  'landing.step1': 'Tell us about yourself',
  'landing.step1d': 'Raw CV stays in your browser; only text after in-browser PII scrubbing is sent for skill extraction. You can also use the short form.',
  'landing.step2': 'See the Future Skills Radar',
  'landing.step2d': 'Skill momentum computed from live job postings and cited research — source and date on every number.',
  'landing.step3': 'Get matched — with a choice',
  'landing.step3d': 'Explainable match scores and skills gaps. Fork: work WITH AI, or pivot to a new lane.',
  'landing.step4': 'Follow your pathway',
  'landing.step4d': 'A Duolingo-style plan with weekly milestones from real free courses — each step tagged to the SDGs.',
  'landing.sdg.title': 'Not decoration — a ledger',
  'landing.sdg.desc':
    'Every role and skill carries a mechanism: WHY it advances a specific SDG target (4.4, 8.2, 8.5 and friends). Your career choices show their own footprint.',
  'landing.privacy.title': 'Responsible data & AI',
  'landing.privacy.desc':
    'Deterministic scoring — the published formula computes every match; an LLM (self-hosted Qwen2.5 on RunPod) only narrates explanations and never invents jobs, courses or statistics. Demo uses synthetic profiles only, per competition rules.',

  'onb.step': 'Step',
  'onb.of': 'of',
  'onb.persona.q': 'Who are you today?',
  'persona.working-adult': 'Working adult',
  'persona.working-adult.d': 'Employed; want to stay ahead of AI',
  'persona.fresh-grad': 'Fresh graduate',
  'persona.fresh-grad.d': 'Deciding where to start',
  'persona.switcher': 'Career switcher',
  'persona.switcher.d': 'Moving to a new field',
  'persona.tvet-student': 'TVET student',
  'persona.tvet-student.d': 'In technical/vocational training',
  'onb.years': 'Years of work experience',
  'onb.interests.q': 'What interests you? (pick any)',
  'interest.technology': 'Technology',
  'interest.ai': 'AI & data',
  'interest.business': 'Business',
  'interest.people': 'People & HR',
  'interest.education': 'Education & training',
  'interest.service': 'Service & care',
  'interest.health': 'Health',
  'interest.green': 'Green energy',
  'interest.sustainability': 'Sustainability',
  'interest.creative': 'Creative & marketing',
  'onb.budget.q': 'How many hours a week can you spend learning?',
  'onb.budget.hint': 'This sets the timeline of your plan — e.g. "In 5 weeks with this course you will be able to…"',
  'onb.cv.title': 'Add your skills',
  'onb.cv.desc':
    'Paste or upload a CV — sensitive data (NRIC, phone, email, address, age, gender, religion, race) is stripped in your browser before anything is analysed. Or use the guided checklist.',
  'onb.cv.upload': 'Upload CV (.txt / .md)',
  'onb.cv.paste': 'Paste your CV text here…',
  'onb.cv.sample': 'Load synthetic sample CV',
  'onb.cv.useForm': 'Use the guided checklist instead',
  'onb.cv.backToCv': 'Use a CV instead',
  'onb.cv.analyse': 'Scrub & extract skills',
  'onb.cv.skip': 'Skip AI analysis',
  'onb.cv.extracting': 'Analysing with AI…',
  'onb.cv.aiExtract':
    'Skills extracted with AI assistance — self-hosted Qwen on RunPod (EU region). Confirm and adjust the levels below.',
  'onb.cv.deterministicExtract':
    'Skills extracted by transparent keyword matching (AI unavailable). Confirm and adjust the levels below.',
  'scrub.title': 'Privacy scrubber report',
  'scrub.stripped': 'items of personal data stripped in your browser',
  'scrub.none': 'No personal data detected.',
  'scrub.keep': 'Only extracted skill levels are kept. The CV text itself is discarded.',
  'scrub.preview': 'Scrubbed text (this is all the extractor sees)',
  'onb.skills.title': 'Confirm your skills',
  'onb.skills.desc':
    'Extracted transparently by keyword matching — no AI decides your level. Tap a skill to adjust (0–5).',
  'onb.skills.none': 'No skills detected — add them in the checklist.',
  'onb.skills.formTitle': 'Guided skills checklist',
  'onb.skills.formDesc': 'Tick what you have, then set your level.',
  'onb.inclusion.title': 'Learning needs (optional)',
  'onb.inclusion.desc':
    'Used only to reorder learning resources (e.g. captioned video or interactive practice instead of heavy text) — never for matching. A survey + registry of inclusive programmes powers this in production.',
  'inclusion.dyslexia': 'Dyslexia — prefer video / interactive over text-heavy formats',
  'inclusion.visual': 'Visual impairment — prefer screen-reader-friendly resources',
  'inclusion.hearing': 'Hearing impairment — prefer captioned / transcript content',
  'inclusion.mobility': 'Mobility considerations — flag hands-on / onsite programmes',
  'inclusion.none': 'None of these / prefer not to say',
  'onb.objective.title': 'Your Harada-style objective',
  'onb.objective.desc':
    'The Harada Method begins with a one-line objective you own. It anchors the skill map and the 1-year plan we generate.',
  'onb.objective.ph': 'e.g. Run my team\u2019s AI workflows end-to-end by next year',
  'onb.finish': 'Build my forecast',

  'dash.hello': 'Your learning and career outlook',
  'dash.scenario': 'Scenario',
  'scenario.moderate': 'Moderate disruption',
  'scenario.accelerated': 'Accelerated disruption',
  'scenario.note': 'Both AI adoption scenarios are estimates, not predictions. AI progress is unpredictable, so your plan shows both.',
  'tab.overview': 'Overview',
  'tab.matches': 'Matches',
  'tab.pathway': 'Pathway',
  'tab.harada': 'Skill matrix',
  'tab.sdg': 'SDG impact',
  'tab.demand': 'Demand stats',

  'ov.radar.title': 'Future Skills Radar',
  'ov.radar.desc': 'Momentum of your skills (teal) vs the market (grey). Source: live postings + cited research.',
  'ov.movers.title': 'Top movers (last refresh)',
  'ov.movers.none': 'No change detected in the last refresh.',
  'ov.refresh': 'Refresh signals',
  'ov.refreshing': 'Fetching live postings…',
  'ov.runinfo': '{n} postings analysed',
  'ov.live': 'LIVE',
  'ov.cached': 'CACHED SNAPSHOT',
  'ov.changelog.title': 'Forecast changelog',
  'ov.refreshed': 'Signal data refreshed — {n} postings from {m} sources. Your matches now reflect the latest trends ({k} skills moved).',
  'ov.refreshed.none': 'Signal data refreshed — {n} postings from {m} sources. No skill momentum changed in this run.',
  'ov.seechanges': 'See what changed',
  'ov.email.btn': 'Monthly email preview',
  'ov.weak': 'Your weaker market-facing skills',
  'ov.strong': 'Your strongest market-facing skills',
  'ov.radar.you': 'You',
  'ov.radar.market': 'Market',
  'ov.email.subject': 'Your monthly SkillCast: what changed',
  'ov.email.greeting': 'Hi there — here is your monthly forecast update.',
  'ov.email.changes': 'What changed in the market signals',
  'ov.email.next': 'Your next milestone',
  'ov.email.cta': 'Open my updated forecast',
  'ov.email.sim': 'Simulated preview — no real email is sent. Production sends a monthly follow-up when signals move.',

  'match.title': 'Future-role matches',
  'match.fork.work': 'Work WITH AI',
  'match.fork.work.d': 'Level up your current direction',
  'match.fork.pivot': 'Pivot to another career',
  'match.fork.pivot.d': 'Green, health, care, education',
  'match.fork.emerging': 'Emerging opportunities',
  'match.fork.emerging.d': 'Roles the AI wave creates',
  'match.score': 'Match score',
  'match.demand': 'Demand outlook',
  'match.gap': 'Skills gap',
  'match.why': 'Why this score',
  'match.formula': '45% skills + 25% interests + 20% experience + 10% work preferences',
  'match.choose': 'Follow this path',
  'match.chosen': 'Chosen path',
  'match.coach.title': 'AI career coach',
  'match.coach.disclosure': 'Narration: self-hosted Qwen2.5 on RunPod (EU region). It only explains deterministic scores — never changes them, never invents sources.',
  'match.coach.fallback': 'Narration unavailable — showing structured explanation (the deterministic core is unaffected).',

  // ── Theme + institution nav ──
  'nav.institution': 'Student advisory',
  'nav.theme': 'Theme',
  'nav.theme.dark': 'Dark',
  'nav.theme.light': 'Light',

  // ── Landing: entry tracks + fact-checked stats ──
  'landing.entry.title': 'Three ways in',
  'landing.entry.desc': 'One engine, three audiences — individuals, employers, and the TVET & university career centres advising them.',
  // ── Onboarding: user-type tracks ──
  'onb.ut.q': 'Who are you planning for today?',
  'onb.ut.d': 'Pick a track — each has its own guided setup.',
  'onb.ut.individual': 'Individual — my own career',
  'onb.ut.individual.d': 'Workers, students, and career switchers: build your personal AI-era forecast.',
  'onb.ut.individual.ex': 'e.g. a bank ops exec, a marketer, a TVET graduate',
  'onb.ut.employer': 'Employer / HR — my team',
  'onb.ut.employer.d': 'Organisations: find roles at risk, plan team reskilling, optimise training budgets.',
  'onb.ut.employer.ex': 'e.g. manufacturing, banking, logistics, public sector',
  'onb.ut.institution': 'Institution — my students',
  'onb.ut.institution.d': 'TVET & university career centres: advise cohorts, close syllabus gaps, align paths with the SDGs.',
  'onb.ut.institution.ex': 'e.g. XMUM, Politeknik, Kolej Komuniti',
  'onb.privacy.browser': 'The raw CV stays in your browser. Only text after in-browser PII scrubbing is sent for skill extraction.',

  // ── Employer onboarding ──
  'onb.emp.step1.q': 'What is your company name, industry, and team size?',
  'onb.emp.step2.q': "How would you like to input your team's current skill profile?",
  'onb.emp.step2.d': 'Everything runs in-browser on synthetic data in this POC — no real employee data is uploaded.',
  'onb.emp.company': 'Company name',
  'onb.emp.company.ph': 'e.g. Sri Modal Manufacturing Sdn Bhd (synthetic)',
  'onb.emp.industry': 'Industry',
  'onb.emp.size': 'Team size',
  'onb.emp.size.hint': 'Company headcount is a setup value only. The dashboard shows a separate fixed synthetic roster, not assessed employees.',
  'onb.emp.intake.batch': 'Choose a demo file (ZIP/CSV/TXT)',
  'onb.emp.intake.batch.d': 'File selection only. No content is read, uploaded, or imported.',
  'onb.emp.intake.batch.btn': 'Choose file · synthetic demo',
  'onb.emp.intake.batch.report': '{cvs} CVs parsed · {items} PII items stripped before analysis',
  'onb.emp.intake.matrix': 'Link company skills matrix',
  'onb.emp.intake.matrix.d': 'Connect an existing skills matrix (Sheets / HRIS export).',
  'onb.emp.intake.matrix.note': 'Simulated in the POC — a demo team is loaded; production uses a read-only, consented link.',
  'onb.emp.intake.template': 'Select a pre-built department template',
  'onb.emp.intake.template.d': 'Fastest: a synthetic department roster tuned to your industry.',
  'onb.emp.match': 'matches industry',
  'onb.emp.obj.risk': 'Identify roles at risk of AI disruption',
  'onb.emp.obj.risk.d': 'See which roles and staff are most exposed, with a ranked mitigation list.',
  'onb.emp.obj.transition': 'Transition existing staff into high-demand AI/Green tech roles',
  'onb.emp.obj.transition.d': 'Target roles, team-level gap plans, and a phased timeline.',
  'onb.emp.obj.budget': 'Compare free and paid training programmes',
  'onb.emp.obj.budget.d': 'Compare training options and confirm prices or funding directly with providers.',
  'onb.emp.timeline': 'Timeline',
  'onb.emp.months.3': '3 months',
  'onb.emp.months.6': '6 months',
  'onb.emp.months.12': '1 year',
  'onb.emp.budget.pref': 'Budget preference',
  'onb.emp.budget.free': 'Focus on free / open-source materials',
  'onb.emp.budget.free.d': 'freeCodeCamp, Microsoft Learn, AWS Skill Builder, audit tracks — zero cash outlay.',
  'onb.emp.budget.paid': 'Consider paid training programmes',
  'onb.emp.budget.paid.d': 'Review paid courses and certificates, and confirm current fees and any funding eligibility with each provider.',

  'industry.technology': 'Technology',
  'industry.manufacturing': 'Manufacturing',
  'industry.banking': 'Banking/Finance',
  'industry.logistics': 'Logistics',
  'industry.public': 'Public Sector',
  'industry.retail': 'Retail',
  'industry.healthcare': 'Healthcare',
  'industry.education': 'Education',

  'tpl.marketing': 'Marketing Team of 10',
  'tpl.production': 'Production Team of 40',
  'tpl.bankops': 'Banking Operations Team of 12',
  'tpl.it': 'IT & Digital Team of 8',
  'tpl.logistics': 'Fleet & Warehouse Team of 15',
  'tpl.public': 'Public Service Counter Team of 10',

  // ── Institution onboarding ──
  'onb.inst.step1.q': 'Which institution do you represent and what cohort are you advising?',
  'onb.inst.step1.d': 'Demo data is synthetic — no real student records in the POC.',
  'onb.inst.step2.q': 'How do you want to analyze student readiness?',
  'onb.inst.step3.q': 'What is the main outcome you want to deliver to your students?',
  'onb.inst.step4.q': 'Select preferred language and delivery options for your students',
  'onb.inst.name': 'Institution name',
  'onb.inst.name.ph': 'e.g. XMUM, Politeknik, Kolej Komuniti',
  'onb.inst.field': 'Field of study',
  'onb.inst.field.hint': 'Drives which entry-level roles and syllabus gaps the advisory view shows.',
  'onb.inst.intake.cv': 'Upload sample student CVs / syllabi',
  'onb.inst.intake.cv.d': 'Client-side extraction with the PII scrubber, same as individual CVs.',
  'onb.inst.intake.cv.btn': 'Upload samples (demo)',
  'onb.inst.intake.cv.ok': 'Sample received — a synthetic cohort is loaded for the demo.',
  'onb.inst.intake.assessment': 'Launch a quick 2-minute student assessment link',
  'onb.inst.intake.assessment.d': 'Distribute a link to the class; results feed the cohort dashboard.',
  'onb.inst.intake.assessment.note': 'A shareable assessment link is generated on your dashboard — simulated in the POC.',
  'onb.inst.focus.entry': 'Match students to entry-level roles emerging from AI trends',
  'onb.inst.focus.entry.d': 'Live market signals rank the roles each student is closest to.',
  'onb.inst.focus.gaps': 'Identify missing practical skills in current academic syllabi',
  'onb.inst.focus.gaps.d': 'Compare taught skills against what employers actually demand now.',
  'onb.inst.focus.sdg': 'Align graduate career paths with UN Sustainable Development Goals',
  'onb.inst.focus.sdg.d': 'Every role carries its SDG mechanism and citation.',
  'onb.inst.lang.q': 'Language for your students',
  'onb.inst.lang.hint': 'Applies to the whole app immediately.',
  'onb.inst.lowbw': 'Low-bandwidth view',
  'onb.inst.lowbw.d': 'Text-first tables instead of charts — lighter pages, cheaper data plans.',

  'lang.en': 'English',
  'lang.uz': 'Uzbek',
  'lang.ru': 'Русский',

  // ── Employer view additions ──
  'emp.demo.org': 'Demo Organisation Sdn Bhd',
  'emp.demo.industry': 'Cross-industry',
  'emp.demo.note': 'Showing a demo organisation — run the employer onboarding to personalise industry, team, objective, timeline and budget.',
  'emp.setup.cta': 'Run employer onboarding',
  'emp.shown': 'shown',
  'emp.aggregated': '{n} more staff aggregated (k ≥ 5)',
  'emp.obj.title': 'Primary objective',
  'emp.obj.risk.desc': 'Ranked by automation exposure with the staff whose current skills carry the lowest market momentum.',
  'emp.obj.transition.desc': 'Heatmap of team skills vs top market demand, with a target-role gap plan.',
  'emp.obj.budget.desc': 'The same plan separated into free and paid learning options.',
  'emp.atrisk': 'Roles at risk of AI disruption',
  'emp.atrisk.d': 'Automation-exposure parameters, cited per role (WEF / Stanford AI Index blend).',
  'emp.exposed.staff': 'Most exposed staff',
  'emp.exposed.staff.d': 'Lowest average momentum across their current skills.',
  'emp.timeline.plan': 'Transition plan',
  'emp.timeline.d': 'Phases derived from your chosen timeline — deterministic, adjustable.',
  'emp.phase1': 'Foundations',
  'emp.phase1.d': 'Free courses: AI literacy, data fundamentals. Weekly cadence from the same pathway engine individuals use.',
  'emp.phase2': 'Applied practice',
  'emp.phase2.d': 'Role-specific gap courses per team; project work on live tasks.',
  'emp.phase3': 'Certify & shadow',
  'emp.phase3.d': 'Professional certificates plus role shadowing; check progress again with the skills radar.',
  'emp.budget.split': 'Training-hours split · not a cost forecast',
  'emp.budget.free.first': 'Priority: free and open learning materials.',
  'emp.budget.paid.first': 'Priority: paid programmes when they fit the team plan. Confirm fees and terms with the provider.',
  'emp.free.mat': 'Free / open-source',
  'emp.paid.mat': 'Paid programmes',
  'emp.courses': 'courses',
  'emp.paid.note': 'Paid-course labels describe a cost category, not confirmed funding or reimbursement. Confirm current terms and prices with providers; this demo does not estimate costs.',
  'emp.intake.batch': 'Batch intake (12 CVs, synthetic)',
  'emp.intake.matrix': 'Linked skills matrix (demo team)',

  // ── Institution view ──
  'inst.demo.name': 'Demo Polytechnic',
  'inst.demo.note': 'Showing a demo cohort — run the institution onboarding to personalise institution, field of study, intake and focus.',
  'inst.setup.cta': 'Run institution onboarding',
  'inst.students': 'students',
  'inst.year': 'Year',
  'inst.synthetic': 'Synthetic cohort — no real student data.',
  'inst.readiness': 'Cohort readiness — top entry-level matches',
  'inst.readiness.d': 'Best entry-role match per student in {field}, from the same deterministic engine.',
  'inst.matchlist': 'Per-student best match',
  'inst.syllabus': 'Syllabus vs market',
  'inst.syllabus.d': "Skills the field's entry-level roles require, against current syllabus coverage (0–5).",
  'inst.skill': 'Skill',
  'inst.taught': 'Taught in syllabus',
  'inst.verdict': 'Verdict',
  'inst.gap': 'Gap — add to syllabus',
  'inst.covered': 'Covered',
  'inst.watch': 'Watch',
  'inst.gap.summary': '{n} practical-skills gaps with high market momentum — priority: {skills}.',
  'inst.sdg': 'Graduate paths & the SDGs',
  'inst.sdg.d': "How this field's emerging roles advance the goals — mechanism, not just a badge.",
  'inst.sdg.footnote': 'Mechanism ledger with citations on every role — targets 4.4, 8.2, 8.5, 8.6.',
  'inst.assess': '2-minute student assessment link',
  'inst.assess.d': 'Distribute to the class; readiness updates as students complete it.',
  'inst.copy': 'Copy link',
  'inst.copied': 'Copied',
  'inst.simulated': 'Simulated in POC',

  // ── Fields of study ──
  'field.cs': 'Computer Science',
  'field.mecheng': 'Mechanical Engineering',
  'field.business': 'Business Admin',
  'match.gapitem': '{skill}: level {cur} → needs {req}',
  'match.pathweeks': '≈ {n} weeks to close the gap at your learning budget',
  'match.entrylevel': 'Internship-friendly',
  'match.viewpath': 'View pathway',
  'match.guidance': 'Pick a direction, compare the roles, then choose one to build your roadmap.',
  'match.empty': 'No roles in this direction yet — try another path above.',

  'pw.title': 'Your reskilling pathway',
  'pw.subtitle': 'Ordered by gap priority · every resource is real and cited',
  'pw.weeks': 'Weeks',
  'pw.week': 'Week {n}',
  'pw.youll': 'You will be able to: {outcome}',
  'pw.locked': 'Locked',
  'pw.available': 'Up next',
  'pw.done': 'Done',
  'pw.mark': 'Mark done',
  'pw.progress': 'Pathway progress',
  'pw.badges': 'Badges',
  'pw.internship': 'Then: internship / on-the-job practice (entry-level-ready roles are flagged)',
  'pw.hours': '{n} hrs total',
  'pw.provider': 'Provider',
  'pw.paid': 'Paid course',
  'pw.free': 'Free',
  'pw.access.note': 'Reordered for your learning needs: {needs}',

  'harada.title': 'Harada-style skill map',
  'harada.desc': 'Your current level vs the required level for {role}. Red cells are the gap your roadmap attacks first.',
  'harada.current': 'Current',
  'harada.required': 'Required',
  'harada.objective': 'Objective (yours)',
  'harada.vision': '1-year vision (generated)',
  'harada.vision.text': 'Close the {top} gap, complete {n} courses (~{w} weeks at {b} hrs/week), and step into {role}.',
  'harada.method': 'Inspired by the Harada Method (self-management skill map + objective + timeline).',
  'harada.box.goal': 'Goal',
  'harada.goal.d': 'You chose this target role — the human decides, AI only plans around it.',
  'harada.box.why': 'Why',
  'harada.why.d': 'Your stated motivation and the SDG goals this role serves.',
  'harada.box.deadline': 'Deadline',
  'harada.deadline.d': 'Estimated from your time budget: {w} weeks at {b} hrs/week.',
  'harada.box.situation': 'Current situation',
  'harada.situation.d': 'Gaps between your level and the role requirement (public match formula).',
  'harada.box.plan': 'Action plan',
  'harada.plan.d': 'Next courses covering your priority gaps.',
  'harada.box.routine': 'Daily routine',
  'harada.routine.d': '≈{m} min/day of focused learning to keep the pace.',
  'harada.box.measure': 'Measure & verify',
  'harada.measure.d': '{done} of {total} courses completed — progress is tracked and a monthly check-in email keeps you honest.',
  'harada.box.share': 'Share',
  'harada.share.d': 'Send this plan to a TVET counsellor or mentor for accountability.',
  'harada.box.sdg': 'SDG impact',
  'harada.sdg.d': 'The UN goals your path contributes to — meaningful, not decorative.',
  'harada.ai.btn': 'Explain my plan (AI)',
  'harada.chosen': 'chosen role',
  'harada.share.btn': 'Copy plan for mentor',
  'harada.share.copied': 'Plan copied — paste it into your mentor chat.',
  'harada.weeks': 'weeks',
  'harada.min': 'min',
  'harada.day': 'day',
  'harada.hrs': 'hrs/week',
  'harada.courses': 'courses done',

  'sdg.title': 'Your SDG footprint',
  'sdg.desc': 'Your chosen path touches {n} goals. Each link is a mechanism, not a badge.',
  'sdg.why': 'Why',
  'sdg.notchosen': 'Choose a role in Matches to see its SDG ledger.',
  'sdg.roleskills': 'Skills in this path that feed the goals',
  'sdg.aggregate': 'Aggregated view (person · company · region) is a production roadmap item.',

  'demand.title': 'Will this profession be in demand?',
  'demand.desc': 'Demand index under both scenarios, and the momentum of the role\u2019s key skills from live postings. All values are estimates with visible sources.',
  'demand.freq': 'Posting frequency',
  'demand.trend': 'Trend (recent vs earlier)',
  'demand.horizon': 'Research horizon (cited)',
  'demand.momentum': 'Skill momentum',
  'demand.estimate': 'estimate · medium confidence',

  'emp.title': 'Workforce skills-gap heatmap',
  'emp.desc': 'Team-level view for HR & L&D planning. Synthetic demo team of 8 — production uses consented, aggregated profiles.',
  'emp.k': 'Guardrail: cells smaller than 5 people are aggregated before display (k-anonymity).',
  'emp.gaps': 'Top team gaps to close',
  'emp.intern': 'Internship pipeline',
  'emp.intern.d': 'Entry-level-ready roles where interns and TVET graduates become productive fastest.',
  'emp.plan': 'Suggested team plan',
  'emp.risk': 'Higher AI exposure',

  'sig.title': 'Signal sources',
  'sig.live': 'Live APIs',
  'sig.curated': 'Curated & cited',
  'sig.planned': 'Planned',
  'sig.fetched': 'Last fetched',
  'sig.postings': 'postings analysed',
  'sig.refresh': 'Refresh now',
  'sig.sample': 'Sample postings from the corpus',
  'sig.changelog': 'Forecast changelog',
  'sig.note': 'Live sources lean toward English-language remote postings. Local vacancy feeds are not integrated, so these signals are not an Uzbekistan labour-market forecast.',
  'sig.method': 'Methodology: momentum = 50% posting frequency + 30% recent-vs-earlier trend + 20% research horizon (cited).',
  'sig.demoBanner': '⚠ Demo data — showing a cached baseline snapshot from {date}. Live sources unreachable or database not initialised.',
  'sig.lowConfidence': 'low confidence · {n} postings',
  'sig.noEvidence': 'No example postings for this skill.',

  'common.source': 'Source',
  'common.date': 'Date',
  'common.back': 'Back',
  'common.next': 'Next',
  'common.close': 'Close',
  'common.level': 'Level',
  'common.hrsweek': 'hrs / week',
  'common.reset': 'Reset demo',
  'common.estimates': 'Estimates, not guarantees',
  'common.estimate': 'estimate',
  'footer.disclosure': 'AI disclosure: match scores & momentum are computed by a published deterministic formula. A self-hosted language model (Qwen2.5 on RunPod) is used only to narrate explanations. Demo profiles are synthetic, per competition rules. Data: public/open only.',
};

const ru: Dict = {
  'emp.hr.team': 'Синтетическая команда',
  'emp.hr.top.skills': 'Ведущие навыки',
  'emp.hr.budget.scope': 'Часы из каталога для курсов по пяти главным пробелам команды, без повторного покрытия навыков. Это не суммарные часы всех участников, не все личные рекомендации и не прогноз затрат.',
  'onb.emp.step3.q': 'Какова цель планирования развития команды?',
  'onb.emp.step4.q': 'Задайте сроки планирования и бюджет обучения',
  'emp.context.title': 'Компания и состав команды',
  'emp.context.industry': 'Отрасль',
  'emp.context.size': 'Заданная численность компании · без оценки',
  'emp.context.location': 'Местоположение',
  'emp.context.location.na': 'Не собирается',
  'emp.context.profiles': 'Синтетические демо-профили',
  'emp.context.roles': 'Роли в синтетической команде',
  'emp.context.departments': 'Отделы в синтетической команде',
  'emp.context.mix.note': 'Списки ролей и отделов описывают только показанные синтетические профили, а не реальных сотрудников компании.',
  'emp.hr.profiles': 'синтетических профилей',
  'emp.hr.disclosure': 'Только синтетическое демо для планирования. Реальные сотрудники не оценивались. Численность компании — настройка, а не размер выборки. Демо-строки не являются обезличенными записями реальных сотрудников.',
  'emp.hr.readiness': 'Готовность навыков к целевой роли · синтетика',
  'emp.hr.readiness.note': 'Средняя взвешенная готовность навыков к роли {role} по {n} синтетическим профилям. Используется опубликованный движок подбора; это не оценка реальных сотрудников.',
  'emp.hr.progress.label': 'Иллюстративный синтетический прогресс · не отслеживается',
  'emp.hr.demand.index': 'Иллюстративный индекс спроса: {n}/100',
  'emp.hr.demand.note': 'Сценарные индексы из курируемого справочника ролей, не измеренные вакансии и не прогнозы. Рост и снижение отражают переход от умеренного к ускоренному внедрению. Состояние источника вакансий и подтверждающие сведения показаны отдельно ниже.',
  'emp.hr.sample.note': 'Только {n} синтетических профилей; скрытые сотрудники не агрегируются',
  'emp.hr.target': 'Целевая роль',
  'emp.hr.gap.count': 'синтетических профилей с пробелом',
  'emp.hr.critical': 'Ключевые навыки для выбранной целевой роли',
  'emp.hr.required': 'требуемый уровень {n}/5',
  'emp.hr.training.note': 'Рекомендации основаны на пробелах каждого синтетического профиля для выбранной роли, с приоритетом по весу требуемого навыка × импульсу. Курсы следуют порядку справочника и считаются один раз на человека. Не для каждого пробела есть курс.',
  'emp.hr.hours': 'Примерно {n} ч на участника',
  'emp.hr.learners': 'Рекомендовано {n}/{total} уникальным синтетическим участникам',
  'emp.hr.covers': 'Устраняет пробелы выбранной роли: {skills}',
  'emp.hr.support': 'Предлагаемая поддержка: выделенное время на обучение, совместная практика и встречи с руководителем. Это план, а не учёт посещаемости или завершения.',
  'emp.reskill.progress': 'Иллюстративный прогресс переобучения',
  'emp.reskill.hours': '{completedHours} из {plannedHours} часов синтетического примера · не отслеживается',
  'emp.scenarios.title': 'Сценарии внедрения ИИ для планирования',
  'emp.scenario.moderate': 'Умеренное внедрение',
  'emp.scenario.fast': 'Ускоренное внедрение',
  'emp.scenario.moderate.desc': 'Постепенный запуск: пилотные задачи с поддержкой ИИ и развитие практических навыков.',
  'emp.scenario.fast.desc': 'Более широкий и ранний запуск: параллельное обучение команд с поддержкой по ролям.',
  'emp.scenario.moderate.cadence': 'Предлагаемая поддержка: короткие еженедельные занятия и практика между ними.',
  'emp.scenario.fast.cadence': 'Предлагаемая поддержка: более частые выделенные учебные блоки и командная практика.',
  'emp.scenario.caveat': 'Иллюстративные сценарии планирования, а не прогнозы увольнений, доступности работы или личной эффективности.',
  'emp.outlook.risk.label': 'Иллюстративное снижение спроса',
  'emp.outlook.opportunity.label': 'Иллюстративный рост спроса',
  'emp.training.title': 'Объяснимые приоритеты обучения',
  'emp.no.priority.gap': 'Для текущих пробелов не рекомендованы курсы из справочника.',
  'emp.sdg.title': 'Связь с Целями устойчивого развития ООН',
  'emp.sdg.desc': 'Механизмы планирования, а не свидетельство достигнутых результатов развития.',
  'emp.sdg.4.title': 'ЦУР 4 · Качественное образование',
  'emp.sdg.4.desc': 'Задача 4.4: практические технические и профессиональные навыки через доступное обучение в течение жизни.',
  'emp.sdg.8.title': 'ЦУР 8 · Достойная работа',
  'emp.sdg.8.desc': 'Задачи 8.2 и 8.5: поддержка продуктивных, ответственных переходов и достойного труда при изменении задач.',
  'emp.sdg.9.title': 'ЦУР 9 · Индустрия, инновации и инфраструктура',
  'emp.sdg.9.desc': 'Задача 9.5: развитие инновационного потенциала через ответственные технические навыки и практику.',
  'onb.emp.intake.batch.notice': 'Выбор файла не загружает, не читает, не импортирует и не обрабатывает его содержимое. Демо не показывает имена файлов. Панель использует фиксированную синтетическую команду, а не сотрудников из файла.',
  'onb.emp.intake.batch.roster': 'Только синтетические примеры профилей · реальные сотрудники не оценивались.',
  'nav.home': 'Главная',
  'nav.dashboard': 'Мой прогноз',
  'nav.employer': 'Для работодателей',
  'nav.signals': 'Источники сигналов',
  'nav.reset': 'Сбросить демо',
  'nav.lang': 'Язык',

  'landing.title': 'План обучения для навыков будущего',
  'landing.subtitle':
    'Создайте профиль учащегося, узнайте, какие навыки развивать дальше, и следуйте практическому учебному маршруту из Ферганы к возможностям по всему Узбекистану и за его пределами.',
  'landing.cta': 'Создать профиль учащегося',
  'landing.cta2': 'Взгляд работодателя',
  'landing.badge': 'Прототип · только синтетические демо-профили',
  'landing.steps.title': 'От того, кто вы сегодня, к тому, кем можете стать',
  'landing.step1': 'Расскажите о себе',
  'landing.step1d': 'Исходное резюме остаётся в браузере; для извлечения навыков отправляется только текст после очистки от персональных данных. Можно также заполнить короткую форму.',
  'landing.step2': 'Радар навыков будущего',
  'landing.step2d': 'Импульс навыков на основе живых вакансий и цитируемых исследований — источник и дата у каждой цифры.',
  'landing.step3': 'Подбор ролей — с выбором',
  'landing.step3d': 'Объяснимый балл и разрыв навыков. Развилка: работать ВМЕСТЕ с ИИ или сменить направление.',
  'landing.step4': 'Следуйте своему маршруту',
  'landing.step4d': 'План в стиле Duolingo с недельными вехами из реальных бесплатных курсов — каждый шаг отмечен ЦУР.',
  'landing.sdg.title': 'Не украшение, а реестр',
  'landing.sdg.desc':
    'У каждой роли и навыка есть механизм: ПОЧЕМУ он продвигает конкретную цель ЦУР (4.4, 8.2, 8.5 и др.). Ваши карьерные решения показывают собственный след.',
  'landing.privacy.title': 'Ответственные данные и ИИ',
  'landing.privacy.desc':
    'Детерминированный скоринг — опубликованная формула считает каждый матч; языковая модель (собственный Qwen2.5 на RunPod) лишь комментирует и никогда не выдумывает вакансии, курсы или статистику. Демо использует синтетические профили.',

  'onb.step': 'Шаг',
  'onb.of': 'из',
  'onb.persona.q': 'Кто вы сегодня?',
  'persona.working-adult': 'Работающий специалист',
  'persona.working-adult.d': 'В штате; хотите быть впереди ИИ',
  'persona.fresh-grad': 'Выпускник',
  'persona.fresh-grad.d': 'Выбираете, с чего начать',
  'persona.switcher': 'Смена карьеры',
  'persona.switcher.d': 'Переходите в новую сферу',
  'persona.tvet-student': 'Студент TVET',
  'persona.tvet-student.d': 'Техническое/профессиональное обучение',
  'onb.years': 'Лет опыта работы',
  'onb.interests.q': 'Что вам интересно?',
  'interest.technology': 'Технологии',
  'interest.ai': 'ИИ и данные',
  'interest.business': 'Бизнес',
  'interest.people': 'Люди и HR',
  'interest.education': 'Образование',
  'interest.service': 'Сервис и забота',
  'interest.health': 'Здоровье',
  'interest.green': 'Зелёная энергетика',
  'interest.sustainability': 'Устойчивое развитие',
  'interest.creative': 'Креатив и маркетинг',
  'onb.budget.q': 'Сколько часов в неделю вы можете учиться?',
  'onb.budget.hint': 'Это задаёт график плана — например, «через 5 недель вы сможете…»',
  'onb.cv.title': 'Добавьте навыки',
  'onb.cv.desc':
    'Вставьте или загрузите CV — чувствительные данные (NRIC, телефон, эл. почта, адрес, возраст, пол, религия, раса) удаляются в браузере до анализа. Или используйте чек-лист.',
  'onb.cv.upload': 'Загрузить CV (.txt / .md)',
  'onb.cv.paste': 'Вставьте текст CV…',
  'onb.cv.sample': 'Загрузить синтетический пример CV',
  'onb.cv.useForm': 'Использовать чек-лист',
  'onb.cv.backToCv': 'Использовать CV',
  'onb.cv.analyse': 'Очистить и извлечь навыки',
  'onb.cv.skip': 'Пропустить анализ ИИ',
  'onb.cv.extracting': 'Анализ с помощью ИИ…',
  'onb.cv.aiExtract':
    'Навыки извлечены с помощью ИИ — собственный Qwen на RunPod (регион ЕС). Подтвердите и отредактируйте уровни ниже.',
  'onb.cv.deterministicExtract':
    'Навыки извлечены прозрачным сопоставлением ключевых слов (ИИ недоступен). Подтвердите и отредактируйте уровни ниже.',
  'scrub.title': 'Отчёт очистки приватности',
  'scrub.stripped': 'элементов личных данных удалено в браузере',
  'scrub.none': 'Личные данные не обнаружены.',
  'scrub.keep': 'Сохраняются только извлечённые уровни навыков. Текст CV удаляется.',
  'scrub.preview': 'Очищенный текст (только это видит экстрактор)',
  'onb.skills.title': 'Подтвердите навыки',
  'onb.skills.desc': 'Прозрачное извлечение по ключевым словам — уровень определяете вы, не ИИ. Нажмите на навык (0–5).',
  'onb.skills.none': 'Навыки не найдены — добавьте их в чек-листе.',
  'onb.skills.formTitle': 'Чек-лист навыков',
  'onb.skills.formDesc': 'Отметьте, что у вас есть, и задайте уровень.',
  'onb.inclusion.title': 'Потребности обучения (опционально)',
  'onb.inclusion.desc': 'Используется только для порядка ресурсов (например, видео с субтитрами вместо текста) — никогда для подбора. В продакшне — опрос + база инклюзивных программ.',
  'inclusion.dyslexia': 'Дислексия — предпочитаю видео/интерактив вместо текста',
  'inclusion.visual': 'Нарушение зрения — ресурсы, совместимые со скринридером',
  'inclusion.hearing': 'Нарушение слуха — контент с субтитрами/расшифровкой',
  'inclusion.mobility': 'Особенности мобильности — отмечать очные программы',
  'inclusion.none': 'Ничего из этого / не хочу указывать',
  'onb.objective.title': 'Ваша цель в стиле Харады',
  'onb.objective.desc': 'Метод Харады начинается с одной строчки-цели, которая вам принадлежит. Она якорит карту навыков и годовой план.',
  'onb.objective.ph': 'напр., вести ИИ-процессы моей команды через год',
  'onb.finish': 'Построить прогноз',

  'dash.hello': 'Ваши учебные и карьерные перспективы',
  'dash.scenario': 'Сценарий',
  'scenario.moderate': 'Умеренный сценарий',
  'scenario.accelerated': 'Ускоренный сценарий',
  'scenario.note': 'Оба сценария внедрения ИИ — оценки, а не прогнозы. Развитие ИИ непредсказуемо, поэтому план показывает оба.',
  'tab.overview': 'Обзор',
  'tab.matches': 'Подбор',
  'tab.pathway': 'Маршрут',
  'tab.harada': 'Матрица навыков',
  'tab.sdg': 'Вклад в ЦУР',
  'tab.demand': 'Спрос',

  'ov.radar.title': 'Радар навыков будущего',
  'ov.radar.desc': 'Импульс ваших навыков (бирюзовый) против рынка (серый).',
  'ov.movers.title': 'Главные движения (последнее обновление)',
  'ov.movers.none': 'Изменений при последнем обновлении нет.',
  'ov.refresh': 'Обновить сигналы',
  'ov.refreshing': 'Загружаем живые вакансии…',
  'ov.runinfo': 'проанализировано вакансий: {n}',
  'ov.live': 'ЖИВЫЕ ДАННЫЕ',
  'ov.cached': 'СНАПШОТ',
  'ov.changelog.title': 'Журнал изменений прогноза',
  'ov.refreshed': 'Сигнальные данные обновлены — {n} вакансий из {m} источников. Ваши матчи теперь отражают свежие тренды ({k} навыков изменились).',
  'ov.refreshed.none': 'Сигнальные данные обновлены — {n} вакансий из {m} источников. Моментум навыков не изменился.',
  'ov.seechanges': 'Посмотреть изменения',
  'ov.email.btn': 'Превью месячного письма',
  'ov.weak': 'Ваши более слабые рыночные навыки',
  'ov.strong': 'Ваши самые сильные рыночные навыки',
  'ov.radar.you': 'Вы',
  'ov.radar.market': 'Рынок',
  'ov.email.subject': 'Ваш месячный SkillCast: что изменилось',
  'ov.email.greeting': 'Здравствуйте — вот обновление вашего прогноза.',
  'ov.email.changes': 'Что изменилось в сигналах рынка',
  'ov.email.next': 'Ваша следующая веха',
  'ov.email.cta': 'Открыть обновлённый прогноз',
  'ov.email.sim': 'Симуляция — реальное письмо не отправляется. В продакшне — месячное письмо при изменении сигналов.',

  'match.title': 'Подбор ролей будущего',
  'match.fork.work': 'Работать С ИИ',
  'match.fork.work.d': 'Усилить текущее направление',
  'match.fork.pivot': 'Перейти в другую профессию',
  'match.fork.pivot.d': 'Зелёная энергетика, здоровье, забота, образование',
  'match.fork.emerging': 'Новые возможности',
  'match.fork.emerging.d': 'Роли, которые создаёт волна ИИ',
  'match.score': 'Балл соответствия',
  'match.demand': 'Перспектива спроса',
  'match.gap': 'Разрыв навыков',
  'match.why': 'Почему такой балл',
  'match.formula': '45% навыки + 25% интересы + 20% опыт + 10% рабочие предпочтения',
  'match.choose': 'Выбрать этот путь',
  'match.chosen': 'Выбранный путь',
  'match.coach.title': 'ИИ-карьерный коуч',
  'match.coach.disclosure': 'Озвучка: собственный Qwen2.5 на RunPod (регион ЕС). Только комментирует детерминированные баллы — не меняет их и не выдумывает источники.',
  'match.coach.fallback': 'Озвучка недоступна — показываем структурированное объяснение (ядро не пострадало).',

  // ── Тема + навигация ──
  'nav.institution': 'Консультант студентов',
  'nav.theme': 'Тема',
  'nav.theme.dark': 'Тёмная',
  'nav.theme.light': 'Светлая',

  // ── Лендинг: треки + проверенные данные ──
  'landing.entry.title': 'Три входа',
  'landing.entry.desc': 'Один движок, три аудитории — работники, работодатели и центры карьеры TVET и университетов.',
  // ── Онбординг: выбор трека ──
  'onb.ut.q': 'Для кого вы планируете сегодня?',
  'onb.ut.d': 'Выберите трек — у каждого свой мастер настройки.',
  'onb.ut.individual': 'Человек — моя карьера',
  'onb.ut.individual.d': 'Работники, студенты и сменщики профессии: личный прогноз карьеры в эпоху ИИ.',
  'onb.ut.individual.ex': 'напр., операционный специалист банка, маркетолог, выпускник TVET',
  'onb.ut.employer': 'Работодатель / HR — моя команда',
  'onb.ut.employer.d': 'Организации: риски автоматизации, переквалификация команды, оптимизация бюджета.',
  'onb.ut.employer.ex': 'напр., производство, банк, логистика, госсектор',
  'onb.ut.institution': 'Учебное заведение — мои студенты',
  'onb.ut.institution.d': 'Центры карьеры TVET и вузов: консультирование групп, пробелы программ, ЦУР.',
  'onb.ut.institution.ex': 'напр., XMUM, Политехник, Комьюнити-колледж',
  'onb.privacy.browser': 'Исходное резюме остаётся в браузере. Для извлечения навыков отправляется только текст, очищенный от персональных данных в браузере.',

  // ── Онбординг работодателя ──
  'onb.emp.step1.q': 'Название компании, отрасль и размер команды?',
  'onb.emp.step2.q': 'Как загрузить текущий профиль навыков команды?',
  'onb.emp.step2.d': 'В POC всё выполняется в браузере на синтетических данных — реальные данные сотрудников не загружаются.',
  'onb.emp.company': 'Название компании',
  'onb.emp.company.ph': 'напр., Sri Modal Manufacturing Sdn Bhd (синтетика)',
  'onb.emp.industry': 'Отрасль',
  'onb.emp.size': 'Размер команды',
  'onb.emp.size.hint': 'Численность компании — только настройка. Панель показывает отдельную фиксированную синтетическую команду, а не оценённых сотрудников.',
  'onb.emp.intake.batch': 'Выбрать демо-файл (ZIP/CSV/TXT)',
  'onb.emp.intake.batch.d': 'Только выбор файла. Содержимое не читается, не загружается и не импортируется.',
  'onb.emp.intake.batch.btn': 'Выбрать файл · синтетическое демо',
  'onb.emp.intake.batch.report': 'Обработано резюме: {cvs} · удалено PII-элементов до анализа: {items}',
  'onb.emp.intake.matrix': 'Подключить матрицу навыков компании',
  'onb.emp.intake.matrix.d': 'Подключите существующую матрицу (Sheets / экспорт HRIS).',
  'onb.emp.intake.matrix.note': 'В POC имитируется — загружается демо-команда; в продакшене ссылка только для чтения с согласия.',
  'onb.emp.intake.template': 'Выбрать готовый шаблон отдела',
  'onb.emp.intake.template.d': 'Быстрее всего: синтетический состав отдела под вашу отрасль.',
  'onb.emp.match': 'совпадает с отраслью',
  'onb.emp.obj.risk': 'Выявить роли под риском ИИ-нарушений',
  'onb.emp.obj.risk.d': 'Самые уязвимые роли и сотрудники + ранжированный план снижения риска.',
  'onb.emp.obj.transition': 'Перевести сотрудников в востребованные ИИ/зелёные роли',
  'onb.emp.obj.transition.d': 'Целевые роли, планы пробелов команды и поэтапный график.',
  'onb.emp.obj.budget': 'Сравнить бесплатные и платные программы обучения',
  'onb.emp.obj.budget.d': 'Сравните варианты обучения и уточните стоимость и возможное финансирование у провайдеров.',
  'onb.emp.timeline': 'Срок',
  'onb.emp.months.3': '3 месяца',
  'onb.emp.months.6': '6 месяцев',
  'onb.emp.months.12': '1 год',
  'onb.emp.budget.pref': 'Предпочтение по бюджету',
  'onb.emp.budget.free': 'Бесплатные / открытые материалы',
  'onb.emp.budget.free.d': 'freeCodeCamp, Microsoft Learn, AWS Skill Builder, аудиторные треки — без затрат.',
  'onb.emp.budget.paid': 'Рассмотреть платные программы обучения',
  'onb.emp.budget.paid.d': 'Изучите платные курсы и сертификаты, а стоимость и условия возможного финансирования уточните у провайдера.',

  'industry.technology': 'Технологии',
  'industry.manufacturing': 'Производство',
  'industry.banking': 'Банки/Финансы',
  'industry.logistics': 'Логистика',
  'industry.public': 'Госсектор',
  'industry.retail': 'Ритейл',
  'industry.healthcare': 'Здравоохранение',
  'industry.education': 'Образование',

  'tpl.marketing': 'Маркетинг-команда из 10',
  'tpl.production': 'Производственная команда из 40',
  'tpl.bankops': 'Банковские операции, 12 человек',
  'tpl.it': 'IT и цифровая команда из 8',
  'tpl.logistics': 'Флот и склад, 15 человек',
  'tpl.public': 'Окно обслуживания, 10 человек',

  // ── Онбординг заведения ──
  'onb.inst.step1.q': 'Какое учреждение вы представляете и какую группу консультируете?',
  'onb.inst.step1.d': 'Демо-данные синтетические — в POC нет реальных записей студентов.',
  'onb.inst.step2.q': 'Как проанализировать готовность студентов?',
  'onb.inst.step3.q': 'Какой главный результат вы хотите дать студентам?',
  'onb.inst.step4.q': 'Выберите язык и формат доставки для студентов',
  'onb.inst.name': 'Название учреждения',
  'onb.inst.name.ph': 'напр., XMUM, Политехник, Комьюнити-колледж',
  'onb.inst.field': 'Направление обучения',
  'onb.inst.field.hint': 'Определяет, какие стартовые роли и пробелы программ показать.',
  'onb.inst.intake.cv': 'Загрузить образцы резюме / учебных программ',
  'onb.inst.intake.cv.d': 'Извлечение на стороне клиента со скраббером PII, как для резюме.',
  'onb.inst.intake.cv.btn': 'Загрузить образцы (демо)',
  'onb.inst.intake.cv.ok': 'Образцы получены — для демо загружена синтетическая группа.',
  'onb.inst.intake.assessment': 'Запустить 2-минутную ссылку-тест для студентов',
  'onb.inst.intake.assessment.d': 'Раздайте классу ссылку; результаты попадут в панель группы.',
  'onb.inst.intake.assessment.note': 'Ссылка генерируется на вашей панели — в POC имитируется.',
  'onb.inst.focus.entry': 'Матчинг студентов на стартовые роли из ИИ-трендов',
  'onb.inst.focus.entry.d': 'Живые рыночные сигналы ранжируют ближайшие роли каждого студента.',
  'onb.inst.focus.gaps': 'Найти недостающие практические навыки в учебной программе',
  'onb.inst.focus.gaps.d': 'Сравнить преподаваемые навыки с реальным спросом работодателей.',
  'onb.inst.focus.sdg': 'Согласовать карьерные пути с ЦУР ООН',
  'onb.inst.focus.sdg.d': 'У каждой роли — механизм влияния на ЦУР и ссылка.',
  'onb.inst.lang.q': 'Язык для студентов',
  'onb.inst.lang.hint': 'Применяется ко всему приложению сразу.',
  'onb.inst.lowbw': 'Режим низкой пропускной способности',
  'onb.inst.lowbw.d': 'Текстовые таблицы вместо графиков — страницы легче, трафик дешевле.',

  'lang.en': 'English',
  'lang.uz': 'Узбекский',
  'lang.ru': 'Русский',

  // ── Панель работодателя ──
  'emp.demo.org': 'Демо-организация Sdn Bhd',
  'emp.demo.industry': 'Кросс-отраслевая',
  'emp.demo.note': 'Показана демо-организация — пройдите онбординг работодателя, чтобы настроить отрасль, команду, цель, срок и бюджет.',
  'emp.setup.cta': 'Онбординг работодателя',
  'emp.shown': 'показано',
  'emp.aggregated': 'ещё {n} сотрудников агрегировано (k ≥ 5)',
  'emp.obj.title': 'Главная цель',
  'emp.obj.risk.desc': 'Ранжирование по подверженности автоматизации + сотрудники с самым низким импульсом навыков.',
  'emp.obj.transition.desc': 'Тепловая карта навыков против спроса рынка и план пробелов по целевой роли.',
  'emp.obj.budget.desc': 'Тот же план, разделённый на бесплатные и платные варианты обучения.',
  'emp.atrisk': 'Роли под риском ИИ-нарушений',
  'emp.atrisk.d': 'Параметры подверженности автоматизации со ссылками по каждой роли (WEF / Stanford AI Index).',
  'emp.exposed.staff': 'Самые уязвимые сотрудники',
  'emp.exposed.staff.d': 'Самый низкий средний импульс по текущим навыкам.',
  'emp.timeline.plan': 'План перехода',
  'emp.timeline.d': 'Фазы выводятся из выбранного срока — детерминированно и настраиваемо.',
  'emp.phase1': 'Основы',
  'emp.phase1.d': 'Бесплатные курсы: ИИ-грамотность, основы данных. Тот же движок маршрутов, что и у людей.',
  'emp.phase2': 'Прикладная практика',
  'emp.phase2.d': 'Курсы под пробелы каждой подкоманды; проекты на живых задачах.',
  'emp.phase3': 'Сертификация и стажировка',
  'emp.phase3.d': 'Профессиональные сертификаты и стажировка по роли; затем повторная проверка навыков.',
  'emp.budget.split': 'Распределение учебных часов · не прогноз расходов',
  'emp.budget.free.first': 'Приоритет: бесплатные и открытые учебные материалы.',
  'emp.budget.paid.first': 'Приоритет — платные программы, подходящие команде. Уточните стоимость и условия у провайдера.',
  'emp.free.mat': 'Бесплатно / открытые',
  'emp.paid.mat': 'Платные программы',
  'emp.courses': 'курсов',
  'emp.paid.note': 'Метка платного курса обозначает категорию стоимости, а не подтверждённое финансирование или возмещение. Уточняйте условия и цены у провайдера; демо не рассчитывает расходы.',
  'emp.intake.batch': 'Пакетная загрузка (12 резюме, синтетика)',
  'emp.intake.matrix': 'Подключённая матрица навыков (демо-команда)',

  // ── Панель заведения ──
  'inst.demo.name': 'Демо-политехник',
  'inst.demo.note': 'Показана демо-группа — пройдите онбординг заведения, чтобы настроить учреждение, направление, загрузку и фокус.',
  'inst.setup.cta': 'Онбординг заведения',
  'inst.students': 'студентов',
  'inst.year': 'Курс',
  'inst.synthetic': 'Синтетическая группа — без реальных данных студентов.',
  'inst.readiness': 'Готовность группы — топ стартовых ролей',
  'inst.readiness.d': 'Лучший матч стартовой роли каждого студента в {field} — тем же детерминированным движком.',
  'inst.matchlist': 'Лучший матч по студентам',
  'inst.syllabus': 'Программа против рынка',
  'inst.syllabus.d': 'Навыки, нужные стартовым ролям направления, против покрытия программой (0–5).',
  'inst.skill': 'Навык',
  'inst.taught': 'Преподаётся',
  'inst.verdict': 'Вердикт',
  'inst.gap': 'Пробел — добавить в программу',
  'inst.covered': 'Покрыто',
  'inst.watch': 'Наблюдать',
  'inst.gap.summary': '{n} пробелов практических навыков с высоким импульсом — приоритет: {skills}.',
  'inst.sdg': 'Пути выпускников и ЦУР',
  'inst.sdg.d': 'Как новые роли направления двигают цели — механизм, а не просто значок.',
  'inst.sdg.footnote': 'Реестр механизмов со ссылками у каждой роли — задачи 4.4, 8.2, 8.5, 8.6.',
  'inst.assess': 'Ссылка на 2-минутный тест',
  'inst.assess.d': 'Раздайте классу; готовность обновляется по мере прохождения.',
  'inst.copy': 'Скопировать',
  'inst.copied': 'Скопировано',
  'inst.simulated': 'Имитация в POC',

  // ── Fields of study ──
  'field.cs': 'Информатика',
  'field.mecheng': 'Машиностроение',
  'field.business': 'Бизнес-администрирование',
  'match.gapitem': '{skill}: уровень {cur} → нужен {req}',
  'match.pathweeks': '≈ {n} недель, чтобы закрыть разрыв при вашем темпе',
  'match.entrylevel': 'Подходит для стажировки',
  'match.viewpath': 'Смотреть маршрут',
  'match.guidance': 'Выберите направление, сравните роли, затем выберите одну для построения вашего маршрута.',
  'match.empty': 'В этом направлении пока нет ролей — попробуйте другое.',

  'pw.title': 'Ваш маршрут переобучения',
  'pw.subtitle': 'По приоритету разрывов · каждый ресурс реален и цитируем',
  'pw.weeks': 'недель',
  'pw.week': 'Неделя {n}',
  'pw.youll': 'Вы сможете: {outcome}',
  'pw.locked': 'Закрыто',
  'pw.available': 'Далее',
  'pw.done': 'Готово',
  'pw.mark': 'Отметить',
  'pw.progress': 'Прогресс маршрута',
  'pw.badges': 'Значки',
  'pw.internship': 'Затем: стажировка / практика (роли для входа отмечены)',
  'pw.hours': 'всего {n} ч',
  'pw.provider': 'Поставщик',
  'pw.paid': 'Платный курс',
  'pw.free': 'Бесплатно',
  'pw.access.note': 'Порядок адаптирован под ваши потребности: {needs}',

  'harada.title': 'Карта навыков в стиле Харады',
  'harada.desc': 'Текущий уровень против требуемого для «{role}». Красные ячейки — разрыв, который маршрут закрывает первым.',
  'harada.current': 'Сейчас',
  'harada.required': 'Нужно',
  'harada.objective': 'Цель (ваша)',
  'harada.vision': 'Годовое видение (сгенерировано)',
  'harada.vision.text': 'Закрыть разрыв «{top}», пройти {n} курсов (~{w} недель при {b} ч/нед) и войти в роль «{role}».',
  'harada.method': 'По мотивам метода Харады (карта навыков + цель + таймлайн).',
  'harada.box.goal': 'Цель',
  'harada.goal.d': 'Вы выбрали эту целевую роль — решает человек, ИИ только планирует вокруг неё.',
  'harada.box.why': 'Зачем',
  'harada.why.d': 'Ваша мотивация и цели ЦУР, которым служит роль.',
  'harada.box.deadline': 'Срок',
  'harada.deadline.d': 'Оценка по вашему бюджету времени: {w} недель при {b} ч/нед.',
  'harada.box.situation': 'Текущая ситуация',
  'harada.situation.d': 'Разрывы между вашим уровнем и требованиями роли (публичная формула).',
  'harada.box.plan': 'План действий',
  'harada.plan.d': 'Следующие курсы по вашим приоритетным разрывам.',
  'harada.box.routine': 'Ежедневная рутина',
  'harada.routine.d': '≈{m} мин/день фокусированного обучения для темпа.',
  'harada.box.measure': 'Контроль',
  'harada.measure.d': 'Пройдено {done} из {total} курсов — прогресс отслеживается, ежемесячное письмо держит в тонусе.',
  'harada.box.share': 'Поделиться',
  'harada.share.d': 'Отправьте план наставнику или консультанту TVET для подотчётности.',
  'harada.box.sdg': 'Вклад в ЦУР',
  'harada.sdg.d': 'Цели ООН, которым служит ваш путь, — осмысленно, не как декор.',
  'harada.ai.btn': 'Объяснить мой план (ИИ)',
  'harada.chosen': 'выбранная роль',
  'harada.share.btn': 'Скопировать план для наставника',
  'harada.share.copied': 'План скопирован — вставьте его в чат с наставником.',
  'harada.weeks': 'недель',
  'harada.min': 'мин',
  'harada.day': 'день',
  'harada.hrs': 'ч/нед',
  'harada.courses': 'курсов завершено',

  'sdg.title': 'Ваш след в ЦУР',
  'sdg.desc': 'Ваш путь затрагивает целей: {n}. Каждая связь — механизм, а не бейдж.',
  'sdg.why': 'Почему',
  'sdg.notchosen': 'Выберите роль в «Подборе», чтобы увидеть её реестр ЦУР.',
  'sdg.roleskills': 'Навыки этого пути, питающие цели',
  'sdg.aggregate': 'Агрегированный вид (человек · компания · регион) — задача продакшна.',

  'demand.title': 'Будет ли эта профессия востребована?',
  'demand.desc': 'Индекс спроса в обоих сценариях и импульс ключевых навыков роли по живым вакансиям.',
  'demand.freq': 'Частота в вакансиях',
  'demand.trend': 'Тренд (свежие vs ранние)',
  'demand.horizon': 'Исследовательский горизонт (цитируемый)',
  'demand.momentum': 'Импульс навыка',
  'demand.estimate': 'оценка · средняя уверенность',

  'emp.title': 'Тепловая карта разрывов навыков команды',
  'emp.desc': 'Командный вид для HR и L&D. Синтетическая демо-команда из 8 человек — в продакшне согласованые агрегированные профили.',
  'emp.k': 'Защита: ячейки меньше 5 человек агрегируются (k-анонимность).',
  'emp.gaps': 'Главные разрывы команды',
  'emp.intern': 'Стажировочный конвейер',
  'emp.intern.d': 'Роли начального уровня, где стажёры и выпускники TVET быстрее всего становятся продуктивными.',
  'emp.plan': 'Предлагаемый командный план',
  'emp.risk': 'Повышенная подверженность ИИ',

  'sig.title': 'Источники сигналов',
  'sig.live': 'Живые API',
  'sig.curated': 'Кураторские, цитируемые',
  'sig.planned': 'Запланировано',
  'sig.fetched': 'Последнее обновление',
  'sig.postings': 'вакансий проанализировано',
  'sig.refresh': 'Обновить сейчас',
  'sig.sample': 'Примеры вакансий из корпуса',
  'sig.changelog': 'Журнал изменений прогноза',
  'sig.note': 'Вакансии из текущих источников преимущественно удалённые и англоязычные. Локальные источники вакансий не подключены, поэтому эти сигналы не являются прогнозом рынка труда Узбекистана.',
  'sig.method': 'Методология: импульс = 50% частота в вакансиях + 30% тренд + 20% исследовательский горизонт.',
  'sig.demoBanner': '⚠ Демо-данные — показан кешированный базовый снимок от {date}. Живые источники недоступны или база данных не инициализирована.',
  'sig.lowConfidence': 'низкая уверенность · {n} вакансий',
  'sig.noEvidence': 'Нет примеров вакансий для этого навыка.',

  'common.source': 'Источник',
  'common.date': 'Дата',
  'common.back': 'Назад',
  'common.next': 'Далее',
  'common.close': 'Закрыть',
  'common.level': 'Уровень',
  'common.hrsweek': 'ч / нед',
  'common.reset': 'Сбросить демо',
  'common.estimates': 'Оценки, не гарантии',
  'common.estimate': 'оценка',
  'footer.disclosure': 'Раскрытие ИИ: баллы и импульс считает опубликованная детерминированная формула. Собственная языковая модель (Qwen2.5 на RunPod) лишь озвучивает пояснения. Демо-профили синтетические. Только открытые данные.',
};

const DICTS: Record<Lang, Dict> = {
  en: { ...en, ...HR_DICTIONARIES.en },
  uz: { ...uz, ...HR_DICTIONARIES.uz },
  ru: { ...ru, ...HR_DICTIONARIES.ru },
};

for (const skill of SKILLS) {
  const translation = SKILL_COPY[skill.slug];
  if (!translation) throw new Error(`Missing catalog translations for skill "${skill.slug}"`);
  const key = `skill.${skill.slug}`;
  DICTS.en[key] = skill.name;
  DICTS.uz[key] = translation.uz;
  DICTS.ru[key] = translation.ru;
}

for (const [category, translation] of Object.entries(SKILL_CATEGORY_COPY)) {
  const key = `skill.category.${category}`;
  DICTS.en[key] = category;
  DICTS.uz[key] = translation.uz;
  DICTS.ru[key] = translation.ru;
}

for (const [category, translation] of Object.entries(ROLE_CATEGORY_COPY)) {
  const key = `role.category.${category}`;
  DICTS.en[key] = category;
  DICTS.uz[key] = translation.uz;
  DICTS.ru[key] = translation.ru;
}

for (const role of ROLES) {
  const translation = ROLE_SDG_COPY[role.slug];
  if (!translation) throw new Error(`Missing catalog translations for role "${role.slug}"`);
  const key = `hr.role.${role.slug}.sdgMechanism`;
  DICTS.en[key] = role.sdgMechanism;
  DICTS.uz[key] = translation.uz;
  DICTS.ru[key] = translation.ru;
}

for (const course of COURSES) {
  const translation = COURSE_COPY[course.slug];
  const outcome = COURSE_OUTCOME_COPY[course.slug];
  if (!translation || !outcome) throw new Error(`Missing catalog translations for course "${course.slug}"`);
  const titleKey = `course.${course.slug}.title`;
  const providerKey = `course.${course.slug}.provider`;
  const outcomeKey = `course.${course.slug}.outcome`;
  DICTS.en[titleKey] = course.title;
  DICTS.uz[titleKey] = translation.titleUz;
  DICTS.ru[titleKey] = translation.titleRu;
  DICTS.en[providerKey] = course.provider;
  DICTS.uz[providerKey] = translation.providerUz;
  DICTS.ru[providerKey] = translation.providerRu;
  DICTS.en[outcomeKey] = course.outcome;
  DICTS.uz[outcomeKey] = outcome.uz;
  DICTS.ru[outcomeKey] = outcome.ru;
}

for (const [source, translation] of Object.entries(GUIDANCE_COPY)) {
  DICTS.en[source] = source;
  DICTS.uz[source] = translation.uz;
  DICTS.ru[source] = translation.ru;
}

for (const [source, translations] of Object.entries(inlineCopy)) {
  DICTS.en[source] = source;
  DICTS.uz[source] = translations.uz;
  DICTS.ru[source] = translations.ru;
}

for (const [key, copy] of Object.entries(LEARNER_FLOW_COPY)) {
  for (const lang of ['en', 'uz', 'ru'] as const) DICTS[lang][key] = copy[lang];
}

// Applied last: Fergana Smart Education wording wins in all three languages.
for (const [key, copy] of Object.entries(FERGANA_UI_COPY)) {
  for (const lang of ['en', 'uz', 'ru'] as const) DICTS[lang][key] = copy[lang];
}
for (const [key, copy] of Object.entries(EXPERIENCE_COPY)) {
  for (const lang of ['en', 'uz', 'ru'] as const) DICTS[lang][key] = copy[lang];
}
for (const [key, copy] of Object.entries(RESOURCE_CATALOG_COPY)) {
  for (const lang of ['en', 'uz', 'ru'] as const) DICTS[lang][key] = copy[lang];
}
for (const [topic, copy] of Object.entries(TOPIC_COPY)) {
  for (const lang of ['en', 'uz', 'ru'] as const) DICTS[lang][`cat.topic.${topic}`] = copy[lang];
}
for (const [key, copy] of Object.entries(QUALITY_COPY)) {
  for (const lang of ['en', 'uz', 'ru'] as const) DICTS[lang][key] = copy[lang];
}

// Uzbek abbreviates Sustainable Development Goals as BRM (Barqaror
// rivojlanish maqsadlari), never SDG. "SDG Academy" is a provider's name.
for (const key of Object.keys(DICTS.uz)) {
  DICTS.uz[key] = DICTS.uz[key].replace(/SDG(?! Academy)/g, 'BRM');
}

const referenceKeys = Object.keys(DICTS.en).sort();
for (const code of Object.keys(DICTS) as Lang[]) {
  const keys = Object.keys(DICTS[code]).sort();
  const missing = referenceKeys.filter((key) => !Object.hasOwn(DICTS[code], key));
  const extra = keys.filter((key) => !Object.hasOwn(DICTS.en, key));
  const empty = keys.filter((key) => !DICTS[code][key]?.trim());
  if (missing.length || extra.length || empty.length) {
    throw new Error(
      `Incomplete ${code} translations: ${missing.length} missing, ${extra.length} extra, ${empty.length} empty`,
    );
  }
}

/** Read-only view of the assembled dictionaries, for parity tests and audits. */
export const I18N_DICTS: Readonly<Record<Lang, Readonly<Dict>>> = DICTS;

// Exactly three languages; Uzbek is the default (see store.ts).
export const LANGS: Array<{ code: Lang; label: string; short: string }> = [
  { code: 'uz', label: 'O‘zbek', short: 'UZ' },
  { code: 'ru', label: 'Русский', short: 'RU' },
  { code: 'en', label: 'English', short: 'EN' },
];

export function makeT(lang: Lang) {
  const dict = DICTS[lang] ?? DICTS.en;
  return (key: string, vars?: Record<string, string | number>): string => {
    const value = dict[key];
    if (value === undefined) {
      throw new Error(`Missing ${lang} translation for "${key}"`);
    }
    let s = value;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        s = s.replaceAll(`{${k}}`, String(v));
      }
    }
    return s;
  };
}

// English SDG short titles for non-UI use. UI code uses t(`sdg.name.${n}`).
export const SDG_TITLES: Record<number, string> = {
  1: 'No Poverty',
  2: 'Zero Hunger',
  3: 'Good Health & Well-Being',
  4: 'Quality Education',
  5: 'Gender Equality',
  6: 'Clean Water & Sanitation',
  7: 'Affordable & Clean Energy',
  8: 'Decent Work & Economic Growth',
  9: 'Industry, Innovation & Infrastructure',
  10: 'Reduced Inequalities',
  11: 'Sustainable Cities & Communities',
  12: 'Responsible Consumption & Production',
  13: 'Climate Action',
  14: 'Life Below Water',
  15: 'Life on Land',
  16: 'Peace, Justice & Strong Institutions',
  17: 'Partnerships for the Goals',
};

export const SDG_COLORS: Record<number, string> = {
  1: '#E5243B', 2: '#DDA63A', 3: '#4C9F38', 4: '#C5192D', 5: '#FF3A21',
  6: '#26BDE2', 7: '#FCC30B', 8: '#A21942', 9: '#FD6925', 10: '#DD1367',
  11: '#FD9D24', 12: '#BF8B2E', 13: '#3F7E44', 14: '#0A97D9', 15: '#56C02B',
  16: '#00689D', 17: '#19486A',
};

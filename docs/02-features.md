# 2. Feature documentation

Status labels: ✅ Implemented · 🟡 Partial · 🧪 Demo / prototype · 📋 Planned.
Paths are relative to `artifacts/skillcast-fergana/` unless stated otherwise.

## 2.1 Screens and navigation

| Screen | Address | Component | Status |
| --- | --- | --- | --- |
| Landing | `#/` | `src/components/skillcast/landing.tsx` | ✅ |
| Onboarding (path choice, learner, employer, institution) | `#/start` | `onboarding.tsx` | ✅ |
| Learner dashboard, 8 tabs | `#/forecast/<tab>` | `dashboard.tsx` | ✅ |
| Employer / HR view | `#/employer` | `employer.tsx` | ✅ |
| Institution view | `#/institution` | `institution.tsx` | 🟡 no menu entry or path card; reachable by link only |
| Signal sources | `#/signals` | `signalsview.tsx` | ✅ |

Every screen and dashboard tab has its own URL hash (`src/components/skillcast/route-sync.tsx`). The browser's Back and
Forward buttons move between them, links can be shared, and the tab title names the current screen. A learner without
a profile who opens `#/forecast/...` is sent to onboarding instead of an empty dashboard.

Dashboard tabs: `overview`, `matches` (learning and career pathways), `radar` (Wind Rose + Future Skills Radar),
`pathway` (what to learn), `harada`, `progress`, `sdg`, `demand`.

## 2.2 Learner (employee / job seeker) experience

### Onboarding ✅
`src/components/skillcast/onboarding.tsx`, `occupation-picker.tsx`, `cv-step.tsx`

| Step | Collects | Required |
| --- | --- | --- |
| 1 Choose your path | Individual or Employer | yes |
| 2 Your profile | Employment status, field, current profession, specialisation, years of experience, education, country/city, languages; skills with levels 1–5 (form or CV) | status and years |
| 3 Interests & learning goals | Interests, weekly study hours (1–168) | optional |
| 4 Future Skills Radar | Scenario choice (moderate / fast AI adoption), shows demand indices | optional |
| 5 Learning & career direction | One of four strategies: enhance current role, related transition, new field, AI skills; plus the target | yes |
| 6 Work preferences | Remote/hybrid, flexible hours, quiet workplace, written instructions, accessible facilities, assistive technology, flexible communication | optional |

- **Field and profession autocomplete**: 17 sectors and 131 occupations (ISCO-08 codes plus local crafts such as suzani
  embroidery, silk weaving and Rishton pottery), searchable by partial words and aliases in Uzbek, Russian or English
  (`src/data/occupations.ts`). "Other / not listed" keeps the user's own wording. Current and target profession are
  stored separately and both feed matching.
- **Weekly study hours**: 1–168 a week. Plans are paced at no more than 40 h/week (`PLAN_PACE_CAP` in `src/lib/profile.ts`)
  and the UI says so when more is selected.
- **CV extraction** 🟡: upload `.txt`/`.md` or paste text. Personal details are scrubbed in the browser (`src/lib/cv.ts`);
  skills are proposed by the model via `POST /api/extract-cv` when `RUNPOD_API_KEY` is set, otherwise by a deterministic
  in-browser extractor. The user confirms every level. PDF/DOCX CVs are not supported.
- **Synthetic sample CV**: one click loads a fabricated CV (`src/data/sample-cv.ts`).

### Try Demo Profile ✅ (🧪 synthetic data)
`src/lib/demo-profile.ts`, `src/components/skillcast/demo-profile.tsx`

A "Try Demo Profile" button (top right of onboarding) loads *Malika*, a synthetic office administrator in Fergana moving
into AI-augmented business analysis. Her data runs through the real logic: course completions go through the
progression rule, the Harada roadmap uses its own task keys, and badges are awarded by the badge rules. She is
deliberately part-way: 69% readiness, 11 of 24 badges, half the pathway, two Harada milestones done, three in progress,
real gaps in data analysis and business analysis. A banner marks the data as synthetic on every screen. If a real profile
exists, the app asks first; the real data is stored aside (`skillcast-pre-demo` in `localStorage`) and restored by
"Leave demo".

### Career matching and explainable scores ✅
`src/lib/matching.ts`, `src/components/skillcast/matches.tsx`

16 future roles (`src/data/roles.ts`) in three strategies (*Work with AI* 5, *Pivot* 7, *Emerging* 4) across 13 categories.

```
match score = 0.45 × skill readiness + 0.25 × interest fit + 0.20 × experience fit + 0.10 × work-preference fit
```

Skill readiness is weighted readiness against each role's required proficiency. Each match shows matching skills, skills
to build, market outlook, AI task exposure, SDG tags and a "Why this match?" breakdown of the four factors. The optional
"Explain in more detail" calls `POST /api/coach` (RunPod narration) and falls back to a deterministic explanation in the
learner's language.

### Rising and declining skills: Skill Momentum Index ✅
`artifacts/api-server/src/skillcast/lib/momentum.ts`, `fergana-signals.ts`; UI in `demand.tsx`, `signalsview.tsx`

```
momentum = 0.50 × posting frequency + 0.30 × trend (recent vs earlier postings) + 0.20 × research horizon
```

The research horizon is a curated, cited prior (WEF Future of Jobs 2025, Stanford AI Index). Trend is the ratio of recent
to earlier postings, clamped to 0.25–4 and log-scaled around 50. "Top movers" lists skills whose momentum changed most
between refreshes. When no postings are available, the app shows a labelled demo baseline (each skill's `seedMomentum`).

### Wind Rose: the career direction map ✅
`src/lib/wind-rose.ts`, `src/components/skillcast/wind-rose.tsx`

A radar chart with up to 10 spokes (8 on narrow screens): pathway skills first, then rated skills, then the market's
strongest. Three layers: **your level** (filled area; self-rated level × 20), **market direction** (violet line; momentum),
**pathway target** (dashed teal line; role requirement × 20). Gap = the furthest line beyond your area.

- Tapping a number or label on the chart, or the chip list below it, opens a detail panel (you / market / target).
- "What this means for you", "Promising directions", "Improve next" (largest gaps, pathway skills first, with a
  "Find courses" button) and "Your strengths".
- Two independent explainers ("What this means", "Why am I seeing this?") and an accessible data table.
- Incomplete profiles get guidance ("rate a few skills" / "choose a pathway") instead of a market-only chart.
- Colour themes (classic, silk, saffron) unlock with badges.

### Future Skills Radar and Demand stats 🧪
`onboarding.tsx` (`FutureRadarStep`), `demand.tsx`

Scenario demand indices (0–100) for the best-matching pathways under moderate or fast AI adoption, plus an
employment-outlook chart over three horizons. **These are illustrative**: the time-horizon points are an interpolation from
a 50-point baseline to each role's scenario index, labelled "Illustrative demo" in the UI. They are not vacancy counts.

### AI task exposure 🧪
Each role carries a qualitative AI task-exposure level (lower / moderate / higher). The UI states explicitly that this
shows how tasks may change, not the probability of losing a job.

### Reskilling pathway and course recommendations ✅
`src/components/skillcast/pathway.tsx`, `src/data/courses.ts`, `src/lib/progression.ts`

- Gaps are linked to 23 real courses (Google, DeepLearning.AI, Microsoft Learn, Kaggle, freeCodeCamp, FAO, WHO OpenWHO,
  Cisco and others), ordered by gap priority, shown as a Duolingo-style path that unlocks step by step.
  Course choice prefers free courses and adapts to accessibility needs (captions, screen-reader friendly, video for
  dyslexia).
- **Skill progression**: marking a course done proposes +1 level for each skill it teaches, capped by course depth
  (beginner → 3, intermediate → 4, advanced → 5). The learner confirms; the fit score, Wind Rose and next steps update.
  Un-marking the course reverts exactly what it changed.
- **Where to learn** (`resource-finder.tsx`, `src/lib/resource-catalog.ts`): a researched catalogue of local and online
  places (52 entries in `src/data/catalog/resources.json`, 16 in the Fergana region and 36 national; local places in
  `src/data/learning-resources.ts`; 14 provider listings in `src/data/learning-sources.ts`). Ranking uses gaps, field,
  home area, online/in-person preference, language, cost and weekly hours, and each result says why it was suggested.
  Addresses appear only with their source and a confidence label. More entries can be added at runtime through
  `public/catalog/extra.json` (currently empty) without a rebuild.
- **Own learning paths** (`learning-paths.tsx`): learners can assemble named paths from the catalogue and track status.

### Harada Method roadmap ✅
`src/components/skillcast/harada.tsx`, `src/lib/harada.ts`

One goal (editable), up to 8 skill areas, 8 tasks each (map foundations, guided resource, core technique, apply to the
target career, work sample, quality and responsible use, feedback, revise and reflect) with estimated hours and a
status (not started / in progress / completed). Completing all 8 tasks of a skill records a **milestone**. Weekly hours
turn remaining hours into a week estimate. Each skill links to matching courses, local places and its Wind Rose spoke.

### Progress tracking ✅
`progress-dashboard.tsx`, `reflection-board.tsx`, `getting-started.tsx`

Hours learned, course milestones, role-skill milestones, Harada tasks, active study days, and a private weekly
reflection board (sticky notes, saved locally). A "Getting started" checklist guides first-time users through five steps.

### Badges and achievements ✅
`src/lib/achievements.ts`, `src/components/skillcast/achievements.tsx`, `silk-artifacts.tsx`

24 badges: 8 categories × Bronze/Silver/Gold (First Steps, Career Explorer, Curious Mind, Consistent Learner, Skill
Builder, Knowledge Seeker, Goal Achiever, Future Ready), presented as a "Silk Road & Childhood Treasures" collection.
Each is tied to observable progress (completed courses, confirmed level-ups, Harada milestones, study days, readiness).
Nothing is earned by clicking around.

- A new badge plays a reveal once (silhouette, spin, light burst, meaning, how it was earned) and flies into the chest in
  the header. Skip, "skip all", reduced motion and an optional sound (off by default) are supported.
- **Per-badge preview**: every badge, locked or earned, opens its own details (riddle, how to unlock, progress, lore,
  Silk Road story) with a link to where progress is made. Previewing never awards a badge.
- Rewards: titles (Newcomer → Future Maker), a collection frame, and Wind Rose colours.
- "Demo: unlock a test badge" plays the full animation for presentations, labelled "DEMO — not earned".

### Career assistant (voice and text) ✅ / 🟡
`src/components/skillcast/voice-assistant.tsx`, `src/lib/voice-intents.ts`, `voice-commands.ts`, `tts-client.ts`;
server: `artifacts/api-server/src/routes/assistant.ts`, `artifacts/api-server/src/skillcast/lib/assistant.ts`, `tts.ts`

- **Deterministic answers** from the saved profile and SkillCast data: what to learn next and why, what is missing and how
  long it takes, a plan for the week, progress so far, where to learn a skill, explaining the Wind Rose. Handles
  follow-ups ("why?", "how do I learn it?") and offers buttons that open the relevant tab.
- **Commands**: open a tab, switch theme, accessibility settings (high contrast, large text, reading spacing, reduced
  motion), filter the catalogue, summarise the screen, save a reflection, stop.
- **Open questions** go to `POST /api/assistant` (RunPod LLM with a compact, non-identifying context; may propose UI actions
  from an allow-list). Without the model it answers with the deterministic assistant. 🟡 needs `RUNPOD_*` keys.
- **"Explain with the voice assistant" on the Wind Rose** always uses the deterministic explanation built from the
  spokes currently on screen: scale meaning, aligned count, top gaps with numbers, strengths and the next course.
- **Speech output**: `POST /api/tts` tries OpenAI TTS, then Google Cloud TTS, then free Microsoft Edge neural voices
  (Uzbek Madina/Sardor, Russian Svetlana/Dmitry, English Ava/Andrew), then the browser's own voice. If no voice is
  available, the answer stays as text with a clear note. 🟡 Speech needs the API server to be deployed.
- **Speech input**: Web Speech API, with Uzbek Cyrillic-to-Latin normalisation and "listen in Russian instead" when Uzbek
  recognition is unavailable. Hands-free mode and narration are accessibility options.

### PDF reports and sharing ✅
`src/components/skillcast/export-share.tsx`, `src/lib/pdf-report.ts`

Five A4 reports (full, Wind Rose, learning roadmap, career and profile analysis, progress and achievements), generated
on the device in Uzbek, Russian or English with an embedded font subset and a vector Wind Rose. A name appears only if
typed in for that export. Sharing uses the system share sheet where supported, otherwise downloads. Nothing is uploaded.

### SDG impact tab ✅
`src/components/skillcast/sdgview.tsx`. Goals the chosen pathway touches, skills the learner already has and will learn for
each goal, and the written mechanism. In Uzbek the tab says BRM.

### Inclusive opportunities ✅ (🧪 partly examples)
`src/components/skillcast/inclusive.tsx`, `src/data/inclusive.ts`. 8 entries for jobs, training and support relevant to
people with disabilities; verified entries are kept separate from examples.

## 2.3 Employer / HR experience

### HR onboarding ✅
`onboarding.tsx` → `EmployerOnboarding` (4 steps)

| Step | Fields | Validation |
| --- | --- | --- |
| 1 Organisation | Company name, industry (8 options), team size | name ≥ 2 characters, industry chosen, size ≥ 1 |
| 2 Workforce intake | Demo file (ZIP/CSV/TXT), link to a skills matrix, or a pre-built department template (6 templates, e.g. "Production Team of 40") | an intake chosen; link ≥ 6 characters; template chosen |
| 3 Objective | Identify roles at risk of AI disruption / transition staff into AI & green roles / compare free and paid training | one chosen |
| 4 Parameters | Timeline (3, 6, 12 months), budget preference (free/open or paid) | budget chosen; "Build my forecast" stays disabled until then |

Data is saved in the browser store (`employer` in `src/lib/store.ts`) and immediately drives the HR dashboard. A saved
company shows "Edit company profile", which reopens onboarding pre-filled. **Not collected:** location and real employee
records. The dashboard says "Location: Not collected", and departments and roles come from the chosen template.

> A regression from commit `87861f6` (the shared onboarding frame translated an already-translated button label) crashed
> the whole HR onboarding. It was fixed in `eb5a16e` and is covered by tests in four languages.

### HR dashboard: workforce intelligence 🧪 (synthetic team)
`src/components/skillcast/employer.tsx`, `src/data/team.ts`

Without a saved company it shows a labelled demo organisation. With one, it shows that company's name, industry, size,
objective, timeline and budget, applied to a **synthetic roster** chosen by the intake. Sections:

- Company and workforce context; synthetic target-role skill readiness; illustrative reskilling progress
- AI adoption planning scenarios (moderate / faster), illustrative declining and rising demand
- Objective-specific sections: roles at risk of AI disruption, most exposed staff, top team gaps, suggested team plan
- Future-role matches, explainable training priorities, transition plan, training-hours split (not a cost forecast)
- SDG connections, internship pipeline
- **Advanced HR analytics** (`premium-preview.tsx`) 🧪: four locked previews (team skills heatmap, talent matcher,
  reskilling return forecast, skill-passport checks), each explaining what it would show and that it is not available.
  There is no payment flow.

Every figure is labelled as illustrative. No real employee is assessed.

## 2.4 Institution view 🟡
`institution.tsx`, `src/data/institution.ts`. Institution onboarding (organisation, intake, focus, access) and a view with
cohort readiness, per-student best match, syllabus vs market, graduate paths and SDGs, and a two-minute student
assessment link. Works, but has **no entry point in the menu or the path chooser**; open `#/institution` directly.

## 2.5 Career intelligence and job-market signals ✅
`src/components/skillcast/signalsview.tsx`, `source-status.tsx`, `hr-market-signals.tsx`; `src/data/approved-sources.ts`

- A five-step chain from source to recommendation (labour-market signals → future skills → your gaps → recommendations
  → roadmap).
- Live status of every retrieved source, with "Refresh signals" (`POST /api/fergana/signals`): each source shows LIVE, FALLBACK or ERROR, when it was last updated ("Updated 2 min ago" / "Last successful update: 18 min ago"), its scope, record count and check interval. The page also refreshes itself every 10 minutes while open.
- The approved catalogue: 26 sources (3 periodic, 3 needing an API key, 17 reference, 3 planned) with scope, data type,
  update frequency, licence, why it matters, and a dated SkillCast check (17 have one).
- A forecast changelog of what changed after each refresh. A monthly email digest is shown as a preview only 🧪.

Sources actually retrieved by the Fergana app: SIAT dataset 1311 (employment rate, Fergana region and national), the
World Bank labour-force participation indicator for Uzbekistan, and Remotive remote job postings (for momentum).

## 2.6 Languages, themes, accessibility and responsive design

| Area | Detail | Status |
| --- | --- | --- |
| Languages | Uzbek Latin (default for new visitors), Uzbek Cyrillic (generated from Uzbek Latin by `src/lib/uz-cyrillic.ts`), Russian, English. About 2,480 translation keys; a parity test requires every key in every language. | ✅ |
| Themes | Light is the default; dark is available from the header and remembered (`next-themes`, `theme` in `localStorage`). The landing hero has light and dark designs. | ✅ |
| Accessibility panel | Text size (normal/large/larger), high contrast, reduced motion, underlined links, reading spacing, narration, hands-free voice, simpler spoken summaries (`a11y.tsx`) | ✅ |
| Keyboard and screen readers | Skip link, visible focus, non-colour status cues, chart text alternatives and data tables | ✅ |
| Responsive design | Checked at 390 px and 1366 px (and previously 360/768/1280) with no horizontal overflow in all four languages and both themes | ✅ |
| Personality | Warm, lightly playful microcopy and a progress-aware greeting on the dashboard | ✅ |

## 2.7 What does not exist yet

To avoid confusion: there are **no user accounts, no login, no server-side profiles, no Telegram bot, no friends or
social features, no payments, no real employee data import, and no live vacancy matching for Uzbekistan.** These are
planned in [07-roadmap.md](07-roadmap.md), [08-telegram-ecosystem.md](08-telegram-ecosystem.md) and
[09-future-enhancements.md](09-future-enhancements.md).

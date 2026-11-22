# 9. Future enhancements: evaluation

> **Status: 📋 Planned / under evaluation.** None of these is implemented unless the "Today" line says so.
> Priorities follow the roadmap: **P0** foundations now, **P1** next stage, **P2** after that, **P3** long term.
> Sizes: S ≈ days, M ≈ 1–3 weeks, L ≈ 1–2 months for one or two developers.

## Summary

| # | Enhancement | Priority | Size | Key dependency |
| --- | --- | --- | --- | --- |
| 1 | Privacy dashboard and data export/deletion | P1 | M | Accounts |
| 2 | Mobile-first experience | P0–P1 | M | Bundle split |
| 3 | Multilingual AI support (EN, RU, UZ Latin, UZ Cyrillic) | P0 | S | Coach language fix |
| 4 | Telegram reminders and personalised reports | P1 | M | Accounts, bot |
| 5 | Better analytics and explainability | P1 | M | Event model |
| 6 | Regional and country-specific job-market intelligence | P1 | L | Data partnerships |
| 7 | Uzbekistan and Central Asia specialisation | P1–P3 | L | #6 |
| 8 | Verified learning resources and course integrations | P1 | M | Partner APIs |
| 9 | AI-powered CV analysis and career recommendations | P1 | M | PDF/DOCX parsing |
| 10 | Personalised career forecasts | P2 | M | #5, #6 |
| 11 | Skill assessment tests and practical challenges | P2 | L | Content |
| 12 | AI career coach with long-term context | P2 | L | Accounts, consent |
| 13 | Career Circle communities | P2 | L | Accounts |
| 14 | Team-based learning competitions | P2 | M | #13 |
| 15 | Portfolio and GitHub integration | P2 | M | Accounts |
| 16 | Internship and job opportunity matching | P2–P3 | L | #6, #11 |
| 17 | Employer recruitment and talent discovery | P3 | L | #11, #15, #16, consent |
| 18 | Workforce planning and organisational analytics | P3 | L | Real HR data import |

---

### 1. Privacy dashboard and account data export/deletion
- **Today:** no account; "Reset" in the header clears local data; the demo profile backs up and restores the learner's own data.
- **Purpose:** let people see, download and erase everything SkillCast holds about them, and withdraw each consent.
- **User value:** trust; control; a legal requirement once accounts exist.
- **Technical requirements:** `GET /api/me/export` (JSON of profile, events, consents, Circle shares), `DELETE /api/me`
  (soft delete then purge within 30 days), consent ledger, unlink Telegram, per-scope revocation; a privacy page in four
  languages.
- **Dependencies:** accounts (08 §4), data model (08 §5).
- **Priority:** P1, built together with accounts, not after them.

### 2. Mobile-first user experience
- **Today:** responsive layouts verified at 360–390 px; touch targets of 44 px in key places; 2.1 MB JavaScript bundle.
- **Purpose:** most learners will use phones on mobile data, and the Telegram Mini App is phone-first.
- **User value:** fast first load, thumb-friendly navigation, offline tolerance.
- **Technical requirements:** code-split PDF (jsPDF, html2canvas), charts and the assistant; a bottom tab bar on small
  screens; service worker / PWA caching of the shell and catalogue (the manifest already exists); a low-bandwidth mode.
- **Dependencies:** none for the split; Mini App adapter for Telegram specifics.
- **Priority:** P0 (bundle split) and P1 (navigation, PWA).

### 3. Multilingual AI support (English, Russian, Uzbek Latin, Uzbek Cyrillic)
- **Today:** the UI and deterministic assistant work in all four; `/api/assistant` and `/api/tts` accept `uz | ru | en`;
  **`/api/coach` rejects Uzbek** (known bug).
- **Purpose:** AI explanations in the learner's language, including the correct Uzbek script.
- **User value:** the default-language majority gets the same quality as English users.
- **Technical requirements:** fix the coach enum; map `uz-cyrl` → `uz` for the model and convert the answer with
  `latinToCyrillic`; per-language prompt tests; an evaluation set of 50 questions per language; fall back to deterministic
  text when the model's language is wrong.
- **Dependencies:** RunPod (or another model) quality in Uzbek; native reviewers.
- **Priority:** P0 for the fix, P1 for evaluation.

### 4. Telegram reminders and personalised reports
- **Today:** on-device PDF reports; no reminders.
- **Purpose:** keep learners going with gentle, opt-in nudges and a weekly summary where they already read messages.
- **User value:** habit building; less forgetting; a shareable weekly report.
- **Technical requirements:** bot, notification preferences and outbox, scheduler, templates in four languages, PDF sent
  through the bot. Details in 08 §9.3.
- **Dependencies:** accounts, unified progress events.
- **Priority:** P1.

### 5. Better analytics and explainability
- **Today:** every score has a "Why?" with the four factors; formulas are published; the Wind Rose has a data table.
- **Purpose:** show *what changed and why* over time, and make the market signals more inspectable.
- **User value:** learners see that effort moves the numbers; partners can audit the model.
- **Technical requirements:** readiness history per role; "this week your readiness rose 6 points because…" built from
  events; per-skill momentum history charts from the existing changelog; a public methodology page generated from the
  code constants; product analytics only with consent and aggregated.
- **Dependencies:** unified progress events (08 §9).
- **Priority:** P1.

### 6. Regional and country-specific job-market intelligence
- **Today:** SIAT regional employment rate, World Bank participation, and a global remote-jobs sample (Remotive) for momentum.
- **Purpose:** momentum that reflects Fergana and Uzbek employers, not only global remote postings.
- **User value:** recommendations that match local hiring.
- **Technical requirements:** access agreements for national vacancy data (ish.mehnat.uz and vacancy.gov.uz are
  catalogued as "reference" sources in `approved-sources.ts`, not retrieved), other boards where their terms allow;
  ILOSTAT and UNESCO UIS series (catalogued as "planned");
  per-region momentum with minimum-sample rules; source provenance in the UI as today.
- **Dependencies:** data partnerships and licences; a durable store for history.
- **Priority:** P1 (pilot data), then ongoing.

### 7. Uzbekistan and Central Asia specialisation
- **Today:** Fergana-first content, 131 occupations including local crafts, Uzbek in both scripts.
- **Purpose:** expand from Fergana to all 14 regions of Uzbekistan, then Central Asia.
- **User value:** relevant roles, courses and places wherever the learner lives.
- **Technical requirements:** region model in data files; local catalogues per region (the catalogue format already
  supports areas and runtime extras); Tajik and Kazakh dictionaries (the parity test makes gaps visible); regional sources.
- **Dependencies:** #6; local partners to verify catalogue entries.
- **Priority:** P1 for Uzbek regions, P3 for Central Asia.

### 8. Verified learning resources and course integrations
- **Today:** 23 curated courses and a researched catalogue with "checked" dates and confidence labels.
- **Purpose:** trustworthy, current courses, and completions that can update skills automatically with consent.
- **User value:** less searching; progress that counts without manual marking.
- **Technical requirements:** link checker job; provider APIs or LTI/xAPI where available; completion import with user
  confirmation (reuse `proposeUpdates`/`applyUpdates`); partner badges; a verification status per course.
- **Dependencies:** partner agreements (IT Park, universities, platforms); accounts for imports.
- **Priority:** P1.

### 9. AI-powered CV analysis and career recommendations
- **Today:** `.txt`/`.md` CVs, in-browser PII scrubbing, model or deterministic skill proposals, user confirmation.
- **Purpose:** accept real CVs and give richer, still-explainable recommendations.
- **User value:** faster onboarding; skills people forget to list.
- **Technical requirements:** in-browser PDF/DOCX text extraction (keep raw files local), better skill mapping
  (synonyms in three languages), evidence snippets for each proposed skill, confidence scores, bias checks.
- **Dependencies:** model quality in Uzbek/Russian; the scrubber's coverage of local ID formats.
- **Priority:** P1.

### 10. Personalised career forecasts
- **Today:** scenario indices (moderate/fast AI adoption) per role, labelled illustrative.
- **Purpose:** a personal forecast: "at 6 h/week you reach 80% readiness for X by March", with uncertainty.
- **User value:** realistic timelines and motivation.
- **Technical requirements:** readiness projection from planned hours and course lengths (deterministic), confidence bands,
  regional demand from #6, and clear labels that it is a plan, not a prediction of employment.
- **Dependencies:** #5, #6.
- **Priority:** P2.

### 11. Skill assessment tests and practical challenges
- **Today:** skills are self-rated, then raised only by confirmed course completions.
- **Purpose:** verify levels with short practical tasks.
- **User value:** credible levels for the Skill Passport and employers; feedback on real ability.
- **Technical requirements:** question and task bank per skill and level in four languages; auto-graded items; rubric
  review for practical tasks (optionally AI-assisted, human-checked); anti-cheating proportional to stakes; results as
  events with evidence.
- **Dependencies:** content creation and expert review.
- **Priority:** P2.

### 12. AI career coach with long-term user context
- **Today:** the assistant is stateless across sessions (only the current conversation and a compact context).
- **Purpose:** a coach that remembers goals, obstacles and past advice.
- **User value:** continuity, like a mentor.
- **Technical requirements:** explicit consent; a user-visible, editable "coach memory" (short facts, not transcripts);
  retrieval from the user's own events; the deterministic engine stays the source of numbers; memory deletion; red-team
  tests for harmful or manipulative advice.
- **Dependencies:** accounts, privacy dashboard, model hosting.
- **Priority:** P2.

### 13. Career Circle communities
- **Today:** none.
- **Purpose and design:** see 08 §8: opt-in connections, scoped sharing, groups, kudos, mutual-consent comparison.
- **Technical requirements:** circle tables, authorization on every read, moderation tools, notifications.
- **Dependencies:** accounts, unified progress, privacy dashboard.
- **Priority:** P2.

### 14. Team-based learning competitions
- **Today:** badges are individual.
- **Purpose:** friendly competitions within a Career Circle group, class or company.
- **User value:** motivation through teamwork rather than ranking individuals publicly.
- **Technical requirements:** challenge definitions (hours, courses, milestones), team scoring from events, fairness rules
  (normalise by team size and available hours), no public leaderboards of individuals by default, organiser tools.
- **Dependencies:** #13; for companies, #18.
- **Priority:** P2.

### 15. Portfolio and GitHub integration
- **Today:** Harada "work sample" tasks exist, but evidence is not stored.
- **Purpose:** attach evidence (projects, repositories, documents) to skills and milestones.
- **User value:** proof of skills for the Skill Passport and employers.
- **Technical requirements:** link GitHub via OAuth (read-only, public repos by default), file uploads with virus
  scanning and size limits, evidence-to-skill mapping, privacy scopes for sharing.
- **Dependencies:** accounts, storage, #1.
- **Priority:** P2.

### 16. Internship and job opportunity matching
- **Today:** an "internship pipeline" section in the HR view (synthetic); no real listings.
- **Purpose:** match learners to real internships and jobs in their region.
- **User value:** a direct path from learning to work.
- **Technical requirements:** opportunity ingestion (#6), the same match engine applied to postings, learner opt-in to be
  matched, explanations of fit and gaps, application tracking, anti-discrimination review.
- **Dependencies:** #6, #11, partner employers.
- **Priority:** P2–P3.

### 17. Employer recruitment and talent discovery
- **Today:** the HR "Talent matcher" is a locked preview with no data and no payment.
- **Purpose:** let employers find opted-in learners with verified skills (the earlier "B2B Talent Matcher" idea).
- **User value:** learners get seen; employers find candidates by skills, not CV keywords.
- **Technical requirements:** explicit learner opt-in per employer search, anonymised profiles until the learner accepts
  contact, verified skills only (#11, #15), audit logs, abuse prevention, billing.
- **Dependencies:** #11, #15, #16, consent framework, legal review.
- **Priority:** P3.

### 18. Workforce planning and organisational analytics
- **Today:** HR onboarding and a synthetic-team dashboard (readiness, AI exposure scenarios, training plan).
- **Purpose:** apply the same engine to a company's real, consented team data.
- **User value:** evidence-based reskilling budgets and transition plans.
- **Technical requirements:** organisation accounts and roles (HR admin, manager, employee), CSV/HRIS import with
  validation, employee consent and visibility rules (employees see their own data; managers see aggregates above a
  minimum group size), scenario planning over time, exports.
- **Dependencies:** accounts, #1, data-protection review, real customer pilots.
- **Priority:** P3.

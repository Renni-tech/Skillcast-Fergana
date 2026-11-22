# 1. Project overview

## What SkillCast Fergana is

SkillCast Fergana is a **learning forecast for the AI era**. It shows people in the Fergana region of Uzbekistan which
skills are rising, how well they fit future roles, and turns the gap into a personal, step-by-step learning plan built
from real courses and local places to learn.

It was built for the **Aiversecity Future-Ready Workforce** challenge (SDG "Survive AI" domain) as a working proof of
concept (POC). The interface labels itself "POC", and every illustrative number is marked as an estimate.

One engine serves three audiences:

| Audience | What they get | Status |
| --- | --- | --- |
| **Learners**: workers, teachers, students, job seekers, career changers | Profile → role matching → Wind Rose → Harada roadmap → course pathway → progress and badges | ✅ Implemented |
| **Employers / HR** | Team skill gaps, AI-exposure scenarios and an explainable training plan for a synthetic team | ✅ Implemented (synthetic team data, 🧪) |
| **Training institutions** | Cohort readiness and best-matching entry pathway per student | 🟡 Implemented, but only reachable by direct link (`#/institution`) |

## The problem

AI and the green transition are changing which tasks employers pay for faster than training systems can follow.
In the Fergana region this shows up in three ways:

1. **People cannot see the change.** Labour statistics are published yearly and nationally; job postings are scattered.
   A teacher in Margilan or an office administrator in Fergana City cannot easily tell which of their skills are rising
   or fading.
2. **Advice is generic.** "Learn AI" is not a plan. People need to know *which* skill, *how far* they are from a target
   role, *where* to learn it locally or online, and *how long* it will take at the hours they actually have.
3. **Trust is low.** Black-box "AI career scores" are hard to believe and impossible to check, and many learners are
   rightly wary of uploading CVs and personal data.

## How SkillCast responds

| Principle | How it shows up in the code |
| --- | --- |
| **Deterministic, explainable core** | Match scores, the Skill Momentum Index and the Wind Rose are fixed formulas in `artifacts/skillcast-fergana/src/lib/matching.ts`, `wind-rose.ts` and `artifacts/api-server/src/skillcast/lib/momentum.ts`. The same inputs always give the same result, and every score has a "Why?" explanation. |
| **AI only where it is safe** | A self-hosted model (Qwen2.5-7B-Instruct on RunPod) only proposes CV skills, narrates explanations and answers open questions. Every AI path has a deterministic fallback, and users confirm extracted skills. |
| **Honest data** | Signals come from official and open sources and carry their real status (periodic, cached, unavailable, demo baseline). Scenario indices are labelled as estimates, never job counts. |
| **Privacy by design** | No accounts. The profile lives in the browser's `localStorage`. CVs are scrubbed of personal details in the browser before any text is sent. |
| **Local and inclusive** | Uzbek (Latin and Cyrillic), Russian and English; local crafts such as suzani embroidery and Rishton pottery among 131 occupations; accessibility settings; a voice assistant; a dedicated route to inclusive opportunities. |

## Target users and use cases

| User | Typical situation | Use case in SkillCast |
| --- | --- | --- |
| Working adult | Office administrator at a textile exporter worried about automation | Rate skills, see the "AI-Augmented Business Analyst" match at 69%, follow a pathway that closes the data-analysis gap first |
| Student or recent graduate | Finishing a TVET or university programme | Compare entry-level pathways, see which skills employers ask for, find free courses with certificates |
| Career changer | Moving from craft or service work into digital work | Use "pivot" strategies, transferable-skill hints and realistic timelines at 5–10 hours a week |
| Person with a disability | Needs accessible formats and workplaces | Accessibility settings, voice assistant, inclusive-opportunity listings, work-preference matching |
| HR / employer | Plans reskilling for a team | Team gaps, AI-exposure scenarios, training priorities, transition plan, budget preference |
| Training institution | Aligns curricula with demand | Cohort readiness, syllabus vs market, per-student best match |

## Vision

**Every person in the Fergana Valley, and later all of Uzbekistan and Central Asia, can see where their work is heading and
has a concrete, affordable plan to get ready, in their own language, without giving up their privacy.**

## Objectives

1. Make skill demand visible at regional level, with sources and dates that anyone can check.
2. Turn every skill gap into an actionable plan of real courses and local places to learn.
3. Keep every score explainable and reproducible, so that learners, employers and institutions can trust and challenge it.
4. Keep learners' data under their control: local-first today, consented and minimal when accounts arrive.
5. Reach people where they are: low-bandwidth friendly, mobile-first, multilingual, and (next stage) on Telegram.

## Value proposition

| For | Value |
| --- | --- |
| Learners | A free, personal forecast and plan in minutes, explained in plain language, with no account and no data upload required. |
| Employers | A transparent way to prioritise team reskilling and to discuss AI exposure without treating it as a layoff prediction. |
| Training providers and institutions | Evidence of which skills to teach next, and a channel to learners who need exactly those courses. |
| Public sector and partners | A reusable, auditable engine that can grow into regional skill-gap analytics using anonymised, consented data. |

The README's proposed business model is free for learners, with revenue from employers (talent matching, team plans),
training providers (verified course placement) and public-sector licences (regional analytics). None of these paid
features exist yet; the HR "Premium analytics" panel is a locked preview with no payment flow.

## Connection to the UN Sustainable Development Goals

SDG 4 is the core of the product; every pathway is first a learning plan. The other goals come from the role data in
`artifacts/skillcast-fergana/src/data/roles.ts` (`sdgTags`), and each role carries a written mechanism
(`roleSdgMechanism`) explaining *how* it contributes, not just a badge.

| SDG | Why it is connected | Roles that carry it (of 16) |
| --- | --- | --- |
| **4 Quality Education** (core) | Every pathway is a learning plan with real courses; target 4.4 (skills for employment) | All pathways by design; tagged on HR & Talent Partner, Digital Skills Trainer |
| **8 Decent Work and Economic Growth** | Reskilling for productive, future-proof employment; targets 8.2 and 8.5 | 12 |
| **9 Industry, Innovation and Infrastructure** | AI, data, cybersecurity and agri-tech roles | 9 |
| **10 Reduced Inequalities** | Inclusive opportunities, accessibility, customer and care roles | 4 |
| **5 Gender Equality** | HR & Talent Development Partner | 1 |
| **13 Climate Action** | Solar technician, ESG data analyst | 2 |
| **7 Affordable and Clean Energy** | Solar & renewable energy technician | 1 |
| **12 Responsible Consumption and Production** | ESG analyst, smart agriculture | 2 |
| **2 Zero Hunger** | Smart agriculture technologist | 1 |
| **3 Good Health and Well-being** | Telehealth & digital care coordinator | 1 |
| **16 Peace, Justice and Strong Institutions** | Cybersecurity, responsible AI governance | 2 |
| **17 Partnerships for the Goals** | Shown in the SDG tab where skills link to partnerships; the delivery model depends on partners (training centres, employers, IT Park) | — |

In Uzbek the interface writes BRM (*Barqaror rivojlanish maqsadlari*) instead of SDG; see `src/lib/i18n.ts`.

## Team and history

The repository started as a team project (Raykhon / R-Xon, initial commit 15 November 2026), was migrated to a pnpm
monorepo on Replit (Replit Agent, 15–17 November), and has since been extended in AI-assisted commits on the
`fergana-sources-i18n` branch. `main` currently points to the same commit as `fergana-sources-i18n` (`eb5a16e`).
The original SkillCast app is preserved alongside, at `/skillcast/` (`artifacts/skillcast/`).

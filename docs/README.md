# SkillCast Fergana — Documentation

This folder documents SkillCast Fergana as it exists in the code today, and the plan for what comes next.
Every statement about current behaviour was checked against the source on the `fergana-sources-i18n` branch
(commit `eb5a16e`, 22 November 2026). Where something is a demo, a prototype or a plan, it is labelled as such.

| # | Document | For | What it covers |
| --- | --- | --- | --- |
| 1 | [Project overview](01-project-overview.md) | Everyone, judges, partners | Problem, users, vision, value proposition, UN SDGs |
| 2 | [Features](02-features.md) | Product, QA, judges | Every screen and feature, with its status and source files |
| 3 | [Technical architecture](03-architecture.md) | Developers | Packages, data flow, API reference, storage, AI and fallbacks, security |
| 4 | [Developer guide](04-developer-guide.md) | New contributors | Install, run, test, build, environment, troubleshooting, Git workflow |
| 5 | [Deployment guide](05-deployment.md) | Maintainers | Replit and Vercel, environment variables, API and voice hosting, verification |
| 6 | [Testing and QA](06-testing.md) | Developers, QA | Every test suite, how to run it, current results, gaps |
| 7 | [Product roadmap](07-roadmap.md) | Team, partners, investors | Done, needed now, planned, long term, priorities and dependencies |
| 8 | [Telegram ecosystem (proposal)](08-telegram-ecosystem.md) | Team, architects | Bot and Mini App, accounts and sync, location privacy, Career Circle, unified progress |
| 9 | [Future enhancements](09-future-enhancements.md) | Team, partners | 18 evaluated enhancements: purpose, value, requirements, dependencies, priority |

## Status labels used throughout

| Label | Meaning |
| --- | --- |
| ✅ **Implemented** | Works end to end in the current code and is covered by tests or a verified browser check. |
| 🟡 **Partial** | Works, but with a stated gap (for example, not reachable from the menu, or a fallback-only path). |
| 🧪 **Demo / prototype** | Deliberately illustrative: synthetic data, locked previews or labelled estimates. |
| 📋 **Planned** | Not in the code. Described so it can be built later. |

## Thirty-second summary

SkillCast Fergana is a browser-based career-forecasting and reskilling tool for the Fergana region of Uzbekistan.
A learner describes their work, skills and interests; deterministic, published formulas match them to 16 future roles,
draw their skill gaps on a "Wind Rose" chart, and turn the gaps into a step-by-step plan of real courses and a
Harada-style roadmap. Employers get the same engine applied to a synthetic team. It runs in Uzbek (Latin and Cyrillic),
Russian and English. There are no user accounts: personal data stays in the browser, and the optional AI model only
narrates results that the formulas have already computed.

The next stage proposed in these documents is accounts and a Telegram bot and Mini App, so that the same engine can reach
learners where they already are. See [08-telegram-ecosystem.md](08-telegram-ecosystem.md).

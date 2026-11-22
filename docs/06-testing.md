# 6. Testing and quality assurance

## 6.1 Test suites

| Suite | Location | Runner | Command |
| --- | --- | --- | --- |
| Voice assistant intents and speech text | `artifacts/skillcast-fergana/tests/voice.test.ts` | Bun | `pnpm --filter @workspace/skillcast-fergana test` (all frontend suites) |
| Uzbek Latin → Cyrillic | `tests/uz-cyrillic.test.ts` | Bun | 〃 |
| Learning catalogue (parsing, ranking honesty) | `tests/catalog.test.ts` | Bun | 〃 |
| Learner flow + HR onboarding (React server rendering of real components) | `tests/learner-flow.test.tsx` | Bun | 〃 |
| Translation parity (every key in en/uz/ru, Uzbek default, no stray copy) | `tests/i18n-parity.test.ts` | Bun | 〃 |
| Experience (Wind Rose, learning sources, inclusive data, intents) | `tests/experience.test.ts` | Bun | 〃 |
| Quality (source audit rules, hours, progression, occupations, badges) | `tests/quality.test.ts` | Bun | 〃 |
| Demo day (demo profile, badge rules, Wind Rose explanation, URL routes, demo backup/restore) | `tests/demo-day.test.ts` | Bun | 〃 |
| API SQLite store (incl. reading an old Prisma-made file) | `artifacts/api-server/src/skillcast/lib/db.test.ts` | Node test runner | `pnpm run test:api` |
| Fergana signals and assistant agent | `api-server/src/skillcast/lib/fergana-signals.test.ts`, `assistant.test.ts` | Bun | 〃 |
| `pnpm dev` helpers | `scripts/dev-lib.test.mjs` | Node test runner | `pnpm run test:dev` |
| Original SkillCast app | `artifacts/skillcast/tests/*` | Bun | `pnpm --filter @workspace/skillcast test` |
| Browser end-to-end | `artifacts/skillcast-fergana/tests/e2e-demo-day.mjs` | Playwright + Chrome | `pnpm --filter @workspace/skillcast-fergana e2e` |
| Older Chromium smoke test (Replit) | `tests/browser-learner-flow.mjs` | raw DevTools protocol | see file header; expects Replit's Chromium path |
| Type checks | all packages | `tsc` | `pnpm run typecheck` |

The frontend suites render real components with `react-dom/server` (see the store mock at the top of
`learner-flow.test.tsx`), so a crash in a component, such as a missing translation, fails the test.

## 6.2 Browser end-to-end check (`e2e-demo-day.mjs`)

Start the app (`pnpm dev`, or a production preview), then:

```bash
CHROME_PATH=/usr/bin/google-chrome node artifacts/skillcast-fergana/tests/e2e-demo-day.mjs
TEST_BASE_URL=http://127.0.0.1:4173/ node artifacts/skillcast-fergana/tests/e2e-demo-day.mjs   # production preview
```

It needs Playwright (`npm i -g playwright && npx playwright install chromium`, or `CHROME_PATH`). It checks, in order:

1. favicon is the Cloud & Sun SVG;
2. a first visit opens in light mode, with the light landing hero;
3. choosing dark mode is saved across reloads, and switching back works;
4. HR onboarding, new and existing profile, at 1366 px and 390 px: validation, Back/Next, the submit rule, saved fields,
   HR dashboard, reload, "Edit company profile", learner data untouched;
5. Try Demo Profile loads a part-way learner;
6. Wind Rose explainers open independently; chart taps open skill details; "Find courses" uses the target colour;
7. the voice assistant explains the displayed Wind Rose with numbers;
8. all 24 badge previews open their own badge without unlocking anything;
9. Back button between tabs; Leave demo;
10. no console errors and no failed non-API requests;
11. no horizontal overflow on landing, HR and all 8 dashboard tabs in en/ru/uz/uz-cyrl × 1366/390 px × light/dark.

Failed `/api/*` calls are reported as a `NOTE` rather than a failure, because the app has documented fallbacks when the
API is not deployed.

## 6.3 Current verified results

Run on 22 November 2026 against commit `eb5a16e` (Linux, Node 22.23, Bun 1.4.4, Chrome stable):

| Check | Result |
| --- | --- |
| `pnpm run typecheck` (all packages) | ✅ pass |
| Frontend suites | ✅ **134 / 134** (voice 9, uz-cyrillic 6, catalog 16, learner-flow 28, i18n parity 8, experience 25, quality 23, demo-day 19) |
| `pnpm run test:api` | ✅ **14 / 14** (SQLite 4; signals + assistant 10) |
| `pnpm run test:dev` | ✅ **5 / 5** |
| Original SkillCast | ✅ **47 / 47** |
| Production build (`skillcast-fergana`) | ✅ pass (chunk-size warning only) |
| Browser e2e on dev server | ✅ **30 / 30** |
| Browser e2e on production preview | ✅ **30 / 30** (`NOTE`: `/api/tts` unavailable in a static preview, as expected) |

Total automated unit and integration tests: **200 passing**. Earlier audits (documented in the previous README) also
recorded 0 axe WCAG 2.1 A/AA violations on 11 screens; that audit script is not in the repository and was not re-run.

## 6.4 Known issues and limitations

| # | Issue | Impact | Where |
| --- | --- | --- | --- |
| 1 | `/api/coach` rejects `lang: "uz"` (enum `en, ms, zh, ru`) | "Explain in more detail (AI)" fails with an error for Uzbek and Uzbek Cyrillic users | `lib/api-spec/openapi.yaml`, `api-server/src/routes/skillcast.ts` |
| 2 | OpenAPI spec lacks `/tts`, `/assistant` and `POST /fergana/signals` | Generated client and docs incomplete; these routes use hand-written Zod schemas | `lib/api-spec/openapi.yaml` |
| 3 | Fergana momentum uses a small global Remotive sample (16 postings in the latest local run, confidence "low") | Momentum is directional, not regional; labelled in the UI | `fergana-signals.ts` |
| 4 | Server skill list has 40 skills, frontend 50 | 10 skills always show the labelled baseline momentum | `api-server/src/skillcast/data/skills.ts` |
| 5 | Institution view has no entry point | Only reachable at `#/institution` | `header.tsx`, `onboarding.tsx` |
| 6 | No accounts or sync | Progress is lost if site data is cleared; no multi-device use | by design (POC) |
| 7 | CV upload accepts `.txt`/`.md` only | PDF/DOCX CVs must be pasted as text | `cv-step.tsx` |
| 8 | Main JS bundle ≈ 2.1 MB (630 kB gzip) | Slower first load on weak connections | code-splitting needed |
| 9 | In-memory per-process rate limiter, open CORS | Not ready for scale or accounts | `api-server/src/routes/assistant.ts`, `app.ts` |
| 10 | `lib/db` PostgreSQL scaffold unused | Confusing for new developers | `lib/db` |
| 11 | `.env.example` omits TTS variables | Developers miss optional speech configuration | `.env.example` |
| 12 | Uzbek/Russian copy added during demo polish was written by the development team, not native-reviewed | Possible awkward phrasing | `src/lib/polish-i18n.ts` |

## 6.5 Recommended additional testing

| Priority | Test | Why |
| --- | --- | --- |
| P0 | API contract test that calls `/api/coach` with every interface language | Would have caught issue 1 |
| P0 | Add the e2e script to CI (GitHub Actions with Playwright) on every PR | Today it runs manually |
| P1 | Accessibility: axe-core over all screens × 4 languages × 2 themes, committed as a script | Keep the 0-violation baseline |
| P1 | Visual regression screenshots for landing, Wind Rose, HR and badge dialogs | Theme and translation regressions are visual |
| P1 | Contract test that the OpenAPI spec covers every Express route | Prevent spec drift (issue 2) |
| P2 | Load test for `/api/tts` and `/api/assistant` behind the rate limiter | Before public launch |
| P2 | Native-speaker review of Uzbek (both scripts) and Russian copy | Quality of the default language |
| P2 | Real-device checks (Android Chrome, iOS Safari, Telegram in-app browser) | Speech APIs and the future Mini App differ by platform |

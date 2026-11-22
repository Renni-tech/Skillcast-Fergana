# Learning catalogue

`resources.json` holds the researched places to learn. The "Where to learn"
section, the roadmap suggestions and "Connect to my roadmap" all read it, so a
new entry needs no UI change. A deployed site can also gain entries without a
rebuild: put them in `public/catalog/extra.json` (same format); they are
loaded at runtime and checked against the same schema.

## Rules for an entry

- **Real providers only.** Never invent a provider, course, address, price,
  date, accreditation or number of learners.
- **Evidence:** at least one `https://` link that supports the entry. Prefer
  official pages (gov.uz, the provider's own site, UN agencies), then
  reputable news.
- **availability:** `open` (taking applications now), `ongoing` (running, no
  fixed intake), `upcoming` (announced for 2026–2027 or later), `closed`
  (finished) or `unknown` (not confirmed). Do not guess.
- **cost:** `free`, `freemium`, `grant` (voucher or state grant), `paid` or
  `unknown`. Use `unknown` when the price was not confirmed.
- **duration / dates:** only when a source states them. Dated figures say so
  in the text (e.g. "reported 2023").
- **verification:** `verified` (the offer itself was checked), `partial`
  (some details are third-party or dated) or `provider` (only the provider and
  its field are confirmed — the card tells learners to ask about courses).
- **address:** only with `confidence` (`official`, `directory`,
  `approximate`) and the `source` link.
- **category:** `ai-digital` or `practical`. The catalogue must not become an
  AI-only directory.
- **text:** name, description and an optional note in English, Uzbek (Latin)
  and Russian. Uzbek Cyrillic is converted from the Uzbek text.
- **skills:** SkillCast skill slugs from `src/data/skills.ts`.

`tests/catalog.test.ts` checks the schema, unique ids, evidence links, skill
slugs and that practical trades stay well covered.

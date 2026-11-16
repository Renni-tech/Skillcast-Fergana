---
name: Migration runtime requirements
description: Runtime incompatibility found while migrating the Vercel import
---

Keep this workspace on Node.js 24.

**Why:** The imported environment used Node 20, but the scaffold's Orval version uses `Map.groupBy` during Zod generation. Client generation appeared to work while validation generation failed at runtime. Node 24 resolved it.

**How to apply:** If API generation fails after a runtime change, check the actual Node version before changing or replacing the generated API tooling.

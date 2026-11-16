import { Router, type IRouter } from "express";
import { NarrateCareerBody, ExtractCvBody } from "@workspace/api-zod";
import { ROLE_MAP } from "@/data/roles";
import { SKILL_MAP } from "@/data/skills";
import { runpodChat, RUNPOD_MODEL } from "@/lib/runpod";
import {
  buildRun,
  ensureFreshRun,
  payloadFor,
  pruneOldRuns,
  writeChangelog,
} from "@/lib/signals-run";

const router: IRouter = Router();

router.get("/signals", async (req, res) => {
  try {
    const runId = await ensureFreshRun(false);
    res.json(await payloadFor(runId));
  } catch (error) {
    req.log.error({ err: error }, "Signal pipeline failed");
    res.status(500).json({ error: "signal pipeline failed" });
  }
});

router.post("/signals", async (req, res) => {
  try {
    const runId = await ensureFreshRun(true);
    res.json(await payloadFor(runId));
  } catch (error) {
    req.log.error({ err: error }, "Signal refresh failed");
    res.status(500).json({ error: "signal refresh failed" });
  }
});

router.get("/signals/cron", async (req, res) => {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    res.status(501).json({ error: "CRON_SECRET not configured" });
    return;
  }
  const authorization = req.header("authorization") ?? "";
  if (authorization !== `Bearer ${cronSecret}`) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const runId = await buildRun(true);
    await writeChangelog(runId);
    await pruneOldRuns();
    res.json({ ok: true, runId, live: true });
  } catch {
    try {
      const runId = await buildRun(false);
      await writeChangelog(runId);
      await pruneOldRuns();
      res.json({ ok: true, runId, live: false });
    } catch {
      res.status(500).json({ error: "signal ingest failed" });
    }
  }
});

const languageInstruction: Record<string, string> = {
  en: "Reply in English.",
  ms: "Reply in Bahasa Malaysia.",
  zh: "Reply in Simplified Chinese.",
  ru: "Reply in Russian.",
};

router.post("/coach", async (req, res) => {
  const parsed = NarrateCareerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid body", details: parsed.error.flatten() });
    return;
  }
  const input = parsed.data;
  const role = ROLE_MAP[input.roleSlug];
  if (!role) {
    res.status(400).json({ error: "unknown role" });
    return;
  }

  const topGap = input.gap[0];
  const facts = input.mode === "harada"
    ? {
        goal: role.title,
        why: role.tagline,
        sdgGoals: role.sdgTags,
        deadlineWeeks: input.pathwayWeeks ?? 0,
        budgetHrs: input.budget ?? 0,
        priorityGaps: input.gap.slice(0, 5).map((gap) =>
          `${SKILL_MAP[gap.skill]?.name ?? gap.skill}: level ${gap.userLevel}, needs ${gap.minLevel}, momentum ${gap.momentum}/100`,
        ),
        coursePlan: input.courses ?? [],
      }
    : {
        role: role.title,
        tagline: role.tagline,
        matchScore: input.score,
        factors: input.factors.map((factor) => `${factor.label}: ${Math.round(factor.value * 100)}%`),
        skillsGap: input.gap.slice(0, 5).map((gap) =>
          `${SKILL_MAP[gap.skill]?.name ?? gap.skill}: level ${gap.userLevel}, needs ${gap.minLevel}, momentum ${gap.momentum}/100`,
        ),
        demandOutlook: {
          moderate: role.demandModerate,
          accelerated: role.demandAccelerated,
          scenarioShown: input.scenario,
        },
        sdgGoals: role.sdgTags,
      };

  try {
    const narration = await runpodChat({
      messages: [
        {
          role: "system",
          content:
            (input.mode === "harada"
              ? "Explain this career learning plan in 3-4 warm, concrete sentences. Use only supplied facts, do not invent jobs, courses, durations, statistics, salaries, or sources, and remind users that predictions are estimates and the user decides. "
              : "Explain these deterministic career-match facts in 3-4 warm, concrete sentences. Use only supplied facts, do not invent jobs, courses, statistics, salaries, or sources, do not change the score, and remind users that predictions are estimates and the user decides. ") +
            (languageInstruction[input.lang] ?? "Reply in English."),
        },
        { role: "user", content: JSON.stringify(facts) },
      ],
      maxTokens: 350,
      temperature: 0.7,
    });
    if (!narration) throw new Error("empty narration");
    res.json({ narration, model: RUNPOD_MODEL, fallback: false });
  } catch {
    const strongest = [...input.factors].sort((a, b) => b.value - a.value)[0] ?? { label: "overall fit", value: input.score / 100 };
    const gapText = topGap
      ? ` The priority gap is ${SKILL_MAP[topGap.skill]?.name ?? topGap.skill} (level ${topGap.userLevel} of ${topGap.minLevel} needed).`
      : "";
    const narration = input.mode === "harada"
      ? `Plan: ${role.title}. Why: ${role.tagline}.${gapText} Timeline: ~${input.pathwayWeeks ?? 0} weeks at ${input.budget ?? 0} hrs/week. Courses: ${(input.courses ?? []).join(", ") || "none yet — pick them from the pathway tab."} SDG: ${role.sdgTags.join(", ")}.`
      : `Match ${input.score}/100, driven mainly by ${strongest.label.toLowerCase()} (${Math.round(strongest.value * 100)}%).${gapText} Under the ${input.scenario} scenario the demand outlook for ${role.title} is ${input.scenario === "accelerated" ? role.demandAccelerated : role.demandModerate}/100 (estimate).`;
    res.json({ narration, model: "deterministic template (LLM unavailable)", fallback: true });
  }
});

const extractionPrompt =
  'You extract structured career data from de-identified CV text. Return only a JSON object with keys "skills" (array of { "name": string, "level": integer 0-5 }), "roles" (string array), "yearsOfExperience" (integer), "education", "certifications", and "languages" (string arrays). No prose or markdown.';

function skillTokens(value: string) {
  return value.toLowerCase().replace(/&/g, " ").split(/[^a-z0-9]+/).filter(Boolean);
}

function mapExtractedSkills(value: unknown): Record<string, number> {
  if (!Array.isArray(value)) return {};
  const out: Record<string, number> = {};
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const candidate = item as { name?: unknown; level?: unknown };
    if (typeof candidate.name !== "string") continue;
    if (["prompt engineering", "prompt engineer", "prompt writing"].includes(candidate.name.trim().toLowerCase())) {
      const level = Math.round(Number(candidate.level));
      out["prompt-engineering"] = Number.isFinite(level) ? Math.min(5, Math.max(0, level)) : 0;
      continue;
    }
    const tokens = skillTokens(candidate.name);
    let winner: string | undefined;
    let best = 0;
    for (const [slug, skill] of Object.entries(SKILL_MAP)) {
      const skillWords = skillTokens(skill.name);
      const overlap = tokens.filter((token) => skillWords.includes(token)).length;
      const score = overlap === 0 ? 0 : overlap === Math.min(tokens.length, skillWords.length) ? 1 : overlap / Math.max(tokens.length, skillWords.length);
      if (score >= 0.5 && score > best) {
        winner = slug;
        best = score;
      }
    }
    if (winner) {
      const level = Math.round(Number(candidate.level));
      out[winner] = Number.isFinite(level) ? Math.min(5, Math.max(0, level)) : 0;
    }
  }
  return out;
}

function stringList(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string").slice(0, 10)
    : [];
}

router.post("/extract-cv", async (req, res) => {
  const parsed = ExtractCvBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid body: text (40-20000 characters) required" });
    return;
  }
  if (!process.env.RUNPOD_API_KEY) {
    res.json({
      ok: false,
      fallback: true,
      model: "deterministic extractor (RunPod API key not configured)",
      skills: {},
      years: 0,
      roles: [],
      education: [],
      certifications: [],
      languages: [],
    });
    return;
  }

  try {
    const content = await runpodChat({
      messages: [
        { role: "system", content: extractionPrompt },
        { role: "user", content: parsed.data.text },
      ],
      maxTokens: 600,
      temperature: 0,
      responseFormat: { type: "json_object" },
    });
    if (!content) throw new Error("empty extraction response");
    const output = JSON.parse(content) as Record<string, unknown>;
    const years = Math.round(Number(output.yearsOfExperience));
    res.json({
      ok: true,
      fallback: false,
      model: RUNPOD_MODEL,
      skills: mapExtractedSkills(output.skills),
      years: Number.isFinite(years) ? Math.min(50, Math.max(0, years)) : 0,
      roles: stringList(output.roles),
      education: stringList(output.education),
      certifications: stringList(output.certifications),
      languages: stringList(output.languages),
    });
  } catch {
    res.json({
      ok: false,
      fallback: true,
      model: "deterministic extractor (LLM unavailable)",
      skills: {},
      years: 0,
      roles: [],
      education: [],
      certifications: [],
      languages: [],
    });
  }
});

export default router;

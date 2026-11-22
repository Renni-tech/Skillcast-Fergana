import { Router, type IRouter } from "express";
import { AssistantBody, askAgent } from "@/lib/assistant";
import { TtsBody, synthesize } from "@/lib/tts";

const router: IRouter = Router();

// Tiny per-IP limiter: speech and LLM calls cost money or quota.
const hits = new Map<string, number[]>();
function limited(ip: string, max: number): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > max;
}

router.post("/tts", async (req, res) => {
  const parsed = TtsBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "invalid body" }); return; }
  if (limited(`tts:${req.ip}`, 40)) { res.status(429).json({ error: "too many requests", fallback: true }); return; }
  try {
    const out = await synthesize(parsed.data);
    res.setHeader("Content-Type", out.contentType);
    res.setHeader("Cache-Control", "private, max-age=3600");
    res.setHeader("X-TTS-Provider", out.provider);
    res.setHeader("X-TTS-Voice", out.voice);
    res.send(out.audio);
  } catch (e) {
    req.log?.warn({ err: (e as Error).message }, "tts unavailable");
    res.status(503).json({ error: "speech service unavailable", fallback: true });
  }
});

router.post("/assistant", async (req, res) => {
  const parsed = AssistantBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "invalid body" }); return; }
  if (limited(`ai:${req.ip}`, 20)) { res.status(429).json({ error: "too many requests", fallback: true }); return; }
  const out = await askAgent(parsed.data);
  if (!out) { res.status(503).json({ error: "assistant model unavailable", fallback: true }); return; }
  res.json(out);
});

export default router;

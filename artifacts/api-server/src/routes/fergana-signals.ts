import { Router, type IRouter } from 'express';
import { GetFerganaSignalsResponse } from '@workspace/api-zod';
import { ferganaSignals } from '../skillcast/lib/fergana-signals';

const router: IRouter = Router();
// On Vercel each serverless instance starts with an empty memory cache, so let
// the CDN keep a copy for an hour (stale up to a day while it revalidates).
// That bounds function runs, and the source checks they trigger, to a few per
// day; the per-source TTLs still apply inside each run. Elsewhere: no-store.
export const FERGANA_GET_CACHE = process.env.VERCEL
  ? 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400'
  : 'no-store';

router.route('/fergana/signals').get(async (req, res) => {
  try {
    res.set('Cache-Control', FERGANA_GET_CACHE).json(GetFerganaSignalsResponse.parse(await ferganaSignals.get()));
  } catch (error) {
    req.log.error({ err: error }, 'Fergana signal cache failed');
    res.status(503).json({ error: 'fergana_sources_unavailable' });
  }
}).post(async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store').json(GetFerganaSignalsResponse.parse(await ferganaSignals.refresh()));
  } catch (error) {
    req.log.error({ err: error }, 'Fergana source refresh failed');
    res.status(503).json({ error: 'fergana_sources_unavailable' });
  }
});
export default router;

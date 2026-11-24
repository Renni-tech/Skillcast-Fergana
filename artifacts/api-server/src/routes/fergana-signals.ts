import { Router, type IRouter } from 'express';
import { GetFerganaSignalsResponse } from '@workspace/api-zod';
import { ferganaSignals } from '../skillcast/lib/fergana-signals';

const router: IRouter = Router();
// On Vercel each serverless instance starts with an empty memory cache, so the
// CDN may serve a copy for up to 5 minutes (and briefly while revalidating).
// Freshness is still governed per source inside each run (15 min for most
// sources, 6 h for Remotive, as its API terms require), and every source in the
// response carries its own fetchedAt, so an older copy is never shown as new.
// Elsewhere: no-store.
export const FERGANA_GET_CACHE = process.env.VERCEL
  ? 'public, max-age=0, s-maxage=300, stale-while-revalidate=60'
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

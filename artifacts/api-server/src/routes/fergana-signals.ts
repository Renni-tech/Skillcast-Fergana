import { Router, type IRouter } from 'express';
import { GetFerganaSignalsResponse } from '@workspace/api-zod';
import { ferganaSignals } from '../skillcast/lib/fergana-signals';

const router: IRouter = Router();
router.route('/fergana/signals').get(async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store').json(GetFerganaSignalsResponse.parse(await ferganaSignals.get()));
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

import { Router, type IRouter } from "express";
import healthRouter from "./health";
import skillcastRouter from "./skillcast";
import ferganaSignalsRouter from "./fergana-signals";

const router: IRouter = Router();

router.use(healthRouter);
router.use(skillcastRouter);
router.use(ferganaSignalsRouter);

export default router;

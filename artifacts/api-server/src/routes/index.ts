import { Router, type IRouter } from "express";
import healthRouter from "./health";
import skillcastRouter from "./skillcast";
import ferganaSignalsRouter from "./fergana-signals";
import assistantRouter from "./assistant";

const router: IRouter = Router();

router.use(healthRouter);
router.use(skillcastRouter);
router.use(ferganaSignalsRouter);
router.use(assistantRouter);

export default router;

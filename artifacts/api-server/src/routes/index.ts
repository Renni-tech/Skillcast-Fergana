import { Router, type IRouter } from "express";
import healthRouter from "./health";
import skillcastRouter from "./skillcast";

const router: IRouter = Router();

router.use(healthRouter);
router.use(skillcastRouter);

export default router;

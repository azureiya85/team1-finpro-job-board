import { Router } from "express";
import {listPlans, createPlan,updatePlan,deletePlan,} from "../../controllers/plan.controller";
import { requireAuth } from "../../middleware/auth.middleware";

const router = Router();
// Note: Path will be mounted at /api/developer/subscription-plans

router.get("/", listPlans);
router.post("/", requireAuth, createPlan);
router.put("/:id", requireAuth, updatePlan);
router.delete("/:id", requireAuth, deletePlan);

export default router;

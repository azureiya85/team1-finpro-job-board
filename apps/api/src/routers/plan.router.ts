import { Router } from "express";
import {listPlans,createPlan,updatePlan,deletePlan,} from "../controllers/plan.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

// All endpoints now match RequestHandler signature
// Developer-only plan management (includes list)
router.get("/", requireAuth, listPlans);
router.post("/", requireAuth, createPlan);
router.put("/:id", requireAuth, updatePlan);
router.delete("/:id", requireAuth, deletePlan);

export default router;

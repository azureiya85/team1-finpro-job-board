import { Router } from "express";
import {listPlans,createPlan,updatePlan, deletePlan,} from "../controllers/plan.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

// Public: list all plans
router.get("/", listPlans);

// DEVELOPER only: create/update/delete
router.post("/", requireAuth, createPlan);
router.put("/:id", requireAuth, updatePlan);
router.delete("/:id", requireAuth, deletePlan);

export default router;

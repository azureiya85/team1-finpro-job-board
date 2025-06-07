import { Router } from "express";
import { PlanController } from "../controllers/plan.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

// Public: list all plans
router.get("/api/plan", PlanController.list);

// DEVELOPER only: create/update/delete
router.post("/api/plan", requireAuth, PlanController.create);
router.put("/api/plan/:id", requireAuth, PlanController.update);
router.delete("/api/plan/:id", requireAuth, PlanController.delete);

export default router;

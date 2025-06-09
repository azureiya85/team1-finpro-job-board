import { Router } from "express";
import { CvController } from "../controllers/cv.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

// POST /api/profile/cv-generator
router.post("/cv-generator", requireAuth, CvController.generateCV);

export default router;

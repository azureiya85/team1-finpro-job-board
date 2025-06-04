import { Router } from "express";
import { generateCV } from "../controllers/cv.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

// POST /api/profile/cv-generator
router.post("/cv-generator", requireAuth, generateCV);

export default router;

import { Router } from "express";
import { createSubscription,listSubscriptions,updateSubscription,cancelSubscription,} from "../controllers/subscription.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

// USER only:
router.post("/", requireAuth, createSubscription);
router.get("/", requireAuth, listSubscriptions);
router.put("/:id", requireAuth, updateSubscription);
router.delete("/:id", requireAuth, cancelSubscription);

export default router;

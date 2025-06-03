
import { Router } from "express";
import {listAllSubscriptions,approveSubscription,} from "../../controllers/subscription.controller";
import { requireAuth } from "../../middleware/auth.middleware";

const router = Router();
// Mounted at /api/developer/user-subscriptions

router.get("/", requireAuth, listAllSubscriptions);
router.patch("/:subscriptionId/approve", requireAuth, approveSubscription);

export default router;

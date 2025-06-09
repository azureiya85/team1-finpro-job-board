// src/routes/subscription.router.ts
import { Router } from "express";
import multer from "multer";
import { cloudinaryStorage } from "../utils/cloudinary";
import { requireAuth } from "../middleware/auth.middleware";
import {createSubscription,confirmSubscription,listSubscriptions,updateSubscription,cancelSubscription,listAllSubscriptions,approveSubscription,} from "../controllers/subscriptions.controller";

const router = Router();
const upload = multer({ storage: cloudinaryStorage });

// User subscriptions
router.post("/", requireAuth, upload.single("proof"), createSubscription);
router.get("/", requireAuth, listSubscriptions);
router.put("/:id", requireAuth, updateSubscription);
router.delete("/:id", requireAuth, cancelSubscription);

// Midtrans confirmation
router.patch("/confirm", requireAuth, confirmSubscription);

// Developer management
router.get("/all", requireAuth, listAllSubscriptions);
router.patch("/:subscriptionId/approve", requireAuth, approveSubscription);

export default router;

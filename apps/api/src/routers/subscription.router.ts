import { Router } from "express";

import {
  createSubscription,
  listSubscriptions,
  updateSubscription,
  cancelSubscription,
  confirmMidtransSubscription,
} from "../controllers/subscription.controller";
import { requireAuth } from "../middleware/auth.middleware";

// MULTER + Cloudinary
import multer from "multer";
import { cloudinaryStorage } from "../utils/cloudinary";

const router = Router();

// USER only:
// If paymentMethod === "BANK_TRANSFER", client must send a file named "proof"
const parser = multer({ storage: cloudinaryStorage });

router.post(
  "/",
  requireAuth,
  parser.single("proof"),
  createSubscription
);

router.get("/", requireAuth, listSubscriptions);
router.put("/:id", requireAuth, updateSubscription);
router.delete("/:id", requireAuth, cancelSubscription);

// Confirm Midtrans subscription once the user has paid/settled
router.patch("/confirm", requireAuth, confirmMidtransSubscription);

export default router;

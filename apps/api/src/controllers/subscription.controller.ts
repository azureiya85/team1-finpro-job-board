// src/controllers/subscription.controller.ts
import { RequestHandler } from "express";
import { SubscriptionService } from "../services/subscription.service";
import {createSubscriptionSchema,updateSubscriptionSchema,} from "../lib/validations/zodSubscriptionValidation";

/** POST /api/subscriptions */
export const createSubscription: RequestHandler = async (req, res) => {
  const userId = (req as any).userId as string;
  const file = (req as any).file as Express.Multer.File | undefined;
  let body;
  try {
    body = createSubscriptionSchema.parse(req.body);
  } catch {
    res.status(400).json({ message: "Invalid request body." });
    return;
  }

  try {
    if (body.paymentMethod === "MIDTRANS_BCA_VA" || body.paymentMethod === "MIDTRANS_QRIS") {
      const data = await SubscriptionService.createMidtransSubscription(
        userId,
        body.planId,
        body.paymentMethod
      );
      res.status(201).json(data);
    } else {
      const sub = await SubscriptionService.createManualSubscription(
        userId,
        body.planId,
        body.paymentMethod,
        file?.path
      );
      res.status(201).json(sub);
    }
  } catch (err: any) {
    console.error(err);
    res.status(err.status || 500).json({ message: err.message || "Internal server error" });
  }
};

/** PATCH /api/subscriptions/confirm */
export const confirmSubscription: RequestHandler = async (req, res) => {
  const userId = (req as any).userId as string;
  const { orderId, transactionId } = req.body;
  try {
    const updated = await SubscriptionService.confirmMidtrans(orderId, transactionId, userId);
    res.json(updated);
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

/** GET /api/subscriptions */
export const listSubscriptions: RequestHandler = async (req, res) => {
  try {
    const subs = await SubscriptionService.listForUser((req as any).userId);
    res.json(subs);
  } catch (err: any) {
    res.status(500).json({ message: "Could not list subscriptions" });
  }
};

/** PUT /api/subscriptions/:id */
export const updateSubscription: RequestHandler = async (req, res) => {
  const userId = (req as any).userId as string;
  let body;
  try {
    body = updateSubscriptionSchema.parse(req.body);
  } catch {
    res.status(400).json({ message: "Invalid request body." });
    return;
  }

  try {
    const updated = await SubscriptionService.updateSubscription(req.params.id, body.status, userId);
    res.json(updated);
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

/** DELETE /api/subscriptions/:id */
export const cancelSubscription: RequestHandler = async (req, res) => {
  try {
    await SubscriptionService.cancelSubscription(req.params.id, (req as any).userId);
    res.status(204).send();
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

/** GET /api/subscriptions/all */
export const listAllSubscriptions: RequestHandler = async (req, res) => {
  try {
    const subs = await SubscriptionService.listAll((req as any).userRole);
    res.json(subs);
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

/** PATCH /api/subscriptions/:subscriptionId/approve */
export const approveSubscription: RequestHandler = async (req, res) => {
  try {
    const sub = await SubscriptionService.approve(req.params.subscriptionId, (req as any).userRole);
    res.json(sub);
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

import { Request, Response } from "express";
import prisma from "../lib/prisma";
import {createSubscriptionSchema, updateSubscriptionSchema,} from "../lib/validations/zodSubscriptionValidation";
import { sendEmail } from "../utils/email";
import { scheduleReminder } from "./scheduler";
import { coreApi } from "../utils/midtrans";

// Now that we exported ChargeParams in our ambient declaration, this import works
import type { ChargeParams } from "midtrans-client";

/**
 * POST /api/subscription
 * Create a new subscription (USER only).
 * - If paymentMethod === "BANK_TRANSFER", multer has already uploaded `req.file` to CloudinaryStorage.
 * - If paymentMethod === "MIDTRANS_BCA_VA" or "MIDTRANS_QRIS", we call Midtrans Core API and return VA/QR info.
 *
 * (TypeScript note: we call res.status(...).json(...) and then `return;` so this function’s return type is Promise<void>.)
 */
export async function createSubscription(
  req: Request,
  res: Response
): Promise<void> {
  // @ts-ignore
  const userId: string = (req as any).userId;

  // multer has stored the uploaded file (if any) on req.file
  const file = (req as any).file as Express.Multer.File | undefined;

  // Validate incoming body (planId, paymentMethod)
  let data: { planId: string; paymentMethod: string };
  try {
    data = createSubscriptionSchema.parse(req.body);
  } catch {
    res.status(400).json({ message: "Invalid request body." });
    return;
  }

  const { planId, paymentMethod } = data;

  // 1) Find the chosen plan
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: planId },
  });
  if (!plan) {
    res.status(404).json({ message: "Plan not found" });
    return;
  }

  // 2) If using Midtrans BCA VA or QRIS: do NOT create a DB row yet.
  //    Instead, call Midtrans Core API and return VA/QR info.
  if (
    paymentMethod === "MIDTRANS_BCA_VA" ||
    paymentMethod === "MIDTRANS_QRIS"
  ) {
    try {
      // Build the Midtrans payload as ChargeParams
      const orderId = `SUB_${userId}_${Date.now()}`;

      const transactionPayload: ChargeParams = {
        payment_type:
          paymentMethod === "MIDTRANS_BCA_VA" ? "bank_transfer" : "qris",
        transaction_details: {
          order_id: orderId,
          gross_amount: plan.price,
        },
        // If BCA VA, include bank info. If QRIS, no extra field needed.
        ...(paymentMethod === "MIDTRANS_BCA_VA"
          ? {
              bank_transfer: {
                bank: "bca",
              },
            }
          : {}),
      };

      // Call Midtrans Core API
      const midtransResponse = await coreApi.charge(transactionPayload);

      // Respond with only the fields the frontend needs
      res.status(201).json({
        midtrans: {
          payment_type: midtransResponse.payment_type,
          bank: midtransResponse.va_numbers?.[0]?.bank || null,
          va_number: midtransResponse.va_numbers?.[0]?.va_number || null,
          qr_string: midtransResponse.qr_string || null,
          transaction_id: midtransResponse.transaction_id,
          order_id: midtransResponse.order_id,
        },
        planId,
        price: plan.price,
      });
      return;
    } catch (err: any) {
      console.error("Midtrans Core API error:", err);
      res
        .status(500)
        .json({ message: "Failed to create Midtrans transaction" });
      return;
    }
  }

  // 3) OTHERWISE: (paymentMethod === "BANK_TRANSFER" or manual)
  //    Create a subscription row with status = "PENDING" and store the Cloudinary URL.

  const now = new Date();
  const endDate = new Date(now.getTime() + plan.duration * 24 * 60 * 60 * 1000);

  let proofUrl: string | undefined;
  if (paymentMethod === "BANK_TRANSFER") {
    if (!file) {
      res
        .status(400)
        .json({ message: "Bank Transfer requires file upload (proof)" });
      return;
    }
    // multer + CloudinaryStorage sets `file.path` to the uploaded URL
    proofUrl = file.path;
  }

  // Create the subscription record in Prisma
  const sub = await prisma.subscription.create({
    data: {
      userId,
      planId,
      paymentMethod,
      paymentProofUrl: proofUrl,
      status: "PENDING",
      startDate: now,
      endDate,
    },
  });

  // Send a “pending approval” email to the user
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user && user.email) {
    await sendEmail(
      user.email,
      "Subscription Pending Approval",
      `<p>Your subscription for plan “${plan.name}” is pending. You’ll receive an email once it’s approved.</p>`
    );
  }

  res.status(201).json(sub);
  return;
}

/**
 * PATCH /api/subscription/confirm
 * (USER only) Once Midtrans confirms “settlement” or “capture”,
 * the frontend should call this with { orderId, transactionId }.
 * We then find the matching subscription (by a stored orderId) and activate it.
 *
 * For simplicity, this example assumes that you previously created a “reservation”
 * row with `midtransOrderId = orderId`. Adjust according to your schema.
 */
export async function confirmMidtransSubscription(
  req: Request,
  res: Response
): Promise<void> {
  // @ts-ignore
  const userId: string = (req as any).userId;
  const { orderId, transactionId } = req.body;

  // Find existing subscription by its stored `midtransOrderId`
  const existing = await prisma.subscription.findUnique({
    where: { midtransOrderId: orderId },
  });

  if (!existing) {
    res.status(404).json({ message: "Subscription not found." });
    return;
  }
  if (existing.userId !== userId) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  // Activate and set new dates
  const subPlan = await prisma.subscriptionPlan.findUnique({
    where: { id: existing.planId },
  });
  if (!subPlan) {
    res.status(404).json({ message: "Plan not found" });
    return;
  }

  const now = new Date();
  const newEndDate = new Date(
    now.getTime() + subPlan.duration * 24 * 60 * 60 * 1000
  );

  const updated = await prisma.subscription.update({
    where: { id: existing.id },
    data: {
      status: "ACTIVE",
      startDate: now,
      endDate: newEndDate,
      midtransTransactionId: transactionId, // assumes you have this column
    },
  });

  // Send “Activated” email + schedule H-1 reminder
  const user = await prisma.user.findUnique({
    where: { id: existing.userId },
  });
  if (user && user.email) {
    await sendEmail(
      user.email,
      "Subscription Activated",
      `<p>Your "${subPlan.name}" subscription is now active until ${updated.endDate.toDateString()}.</p>`
    );
    scheduleReminder({
      date: updated.endDate,
      to: user.email,
      subject: "Subscription Expiring Tomorrow",
      html: `<p>Your "${subPlan.name}" subscription expires tomorrow. Please renew to keep exclusive features.</p>`,
    });
  }

  res.json(updated);
  return;
}

/**
 * GET /api/subscription
 * List a user’s subscriptions (USER only).
 */
export async function listSubscriptions(
  req: Request,
  res: Response
): Promise<void> {
  // @ts-ignore
  const userId: string = (req as any).userId;
  const subs = await prisma.subscription.findMany({
    where: { userId },
    include: { plan: true },
  });
  res.json(subs);
  return;
}

/**
 * PUT /api/subscription/:id
 * (USER only) Update subscription’s status if needed (e.g., CANCEL).
 */
export async function updateSubscription(
  req: Request,
  res: Response
): Promise<void> {
  // @ts-ignore
  const userId: string = (req as any).userId;

  let data: { status: string };
  try {
    data = updateSubscriptionSchema.parse(req.body);
  } catch {
    res.status(400).json({ message: "Invalid request body." });
    return;
  }

  const subscription = await prisma.subscription.findUnique({
    where: { id: req.params.id },
  });
  if (!subscription) {
    res.status(404).json({ message: "Not found" });
    return;
  }
  if (subscription.userId !== userId) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  const updated = await prisma.subscription.update({
    where: { id: req.params.id },
    data: { status: data.status },
  });
  res.json(updated);
  return;
}

/**
 * DELETE /api/subscription/:id
 * (USER only) Cancel subscription => status = "CANCELLED".
 */
export async function cancelSubscription(
  req: Request,
  res: Response
): Promise<void> {
  // @ts-ignore
  const userId: string = (req as any).userId;

  const subscription = await prisma.subscription.findUnique({
    where: { id: req.params.id },
  });
  if (!subscription) {
    res.status(404).json({ message: "Not found" });
    return;
  }
  if (subscription.userId !== userId) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  await prisma.subscription.update({
    where: { id: req.params.id },
    data: { status: "CANCELLED" },
  });
  res.status(204).send();
  return;
}

/**
 * PATCH /api/developer/user-subscriptions/:subscriptionId/approve
 * (DEVELOPER only) Approve a manual payment => status = "ACTIVE".
 */
export async function approveSubscription(
  req: Request,
  res: Response
): Promise<void> {
  // @ts-ignore
  if ((req as any).userRole !== "DEVELOPER") {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  const sub = await prisma.subscription.update({
    where: { id: req.params.subscriptionId },
    data: { status: "ACTIVE" },
  });

  // Send “Activated” email + schedule H-1 reminder
  const user = await prisma.user.findUnique({
    where: { id: sub.userId },
  });
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: sub.planId },
  });
  if (user && user.email && plan) {
    await sendEmail(
      user.email,
      "Subscription Activated",
      `<p>Your "${plan.name}" subscription is now active until ${sub.endDate.toDateString()}.</p>`
    );
    scheduleReminder({
      date: sub.endDate,
      to: user.email,
      subject: "Subscription Expiring Tomorrow",
      html: `<p>Your "${plan.name}" subscription expires tomorrow. Please renew to keep exclusive features.</p>`,
    });
  }

  res.json(sub);
  return;
}

/**
 * GET /api/developer/user-subscriptions
 * (DEVELOPER only) List all user subscriptions (for approval).
 */
export async function listAllSubscriptions(
  req: Request,
  res: Response
): Promise<void> {
  // @ts-ignore
  if ((req as any).userRole !== "DEVELOPER") {
    res.status(403).json({ message: "Forbidden" });
    return;
  }
  const subs = await prisma.subscription.findMany({
    include: { user: true, plan: true },
  });
  res.json(subs);
  return;
}

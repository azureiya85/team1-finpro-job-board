// subscription.controller.ts
import { RequestHandler } from "express";
import prisma from "../lib/prisma";
import {
  createSubscriptionSchema,
  updateSubscriptionSchema,
} from "../lib/validations/zodSubscriptionValidation";
import { sendEmail } from "../utils/email";
import { scheduleReminder } from "./scheduler";

/**
 * POST /api/subscription
 * Create a new subscription (USER only). Status = PENDING initially.
 */
export const createSubscription: RequestHandler = async (req, res) => {
  // @ts-ignore: we attached userId in auth.middleware
  const userId = (req as any).userId;
  const data = createSubscriptionSchema.parse(req.body);

  // Calculate endDate = now + plan.duration days (lookup plan)
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: data.planId },
  });
  if (!plan) {
    res.status(404).json({ message: "Plan not found" });
    return;
  }

  const now = new Date();
  const endDate = new Date(now.getTime() + plan.duration * 24 * 60 * 60 * 1000);

  const sub = await prisma.subscription.create({
    data: {
      userId,
      planId: data.planId,
      paymentMethod: data.paymentMethod,
      status: "PENDING",
      startDate: now,
      endDate,
    },
  });

  // (Optional) Send confirmation email to user
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user && user.email) {
    await sendEmail(
      user.email,
      "Subscription Pending Approval",
      `<p>Your subscription for plan “${plan.name}” is pending. You’ll receive an email once approved.</p>`
    );
  }

  res.status(201).json(sub);
};

/**
 * GET /api/subscription
 * List a user’s subscriptions (USER only).
 */
export const listSubscriptions: RequestHandler = async (req, res) => {
  // @ts-ignore: we attached userId in auth.middleware
  const userId = (req as any).userId;

  const subs = await prisma.subscription.findMany({
    where: { userId },
    include: { plan: true },
  });

  res.json(subs);
};

/**
 * PUT /api/subscription/:id
 * (USER only) Update subscription status if needed (e.g., renew) or CANCEL.
 */
export const updateSubscription: RequestHandler = async (req, res) => {
  // @ts-ignore: we attached userId in auth.middleware
  const userId = (req as any).userId;
  const data = updateSubscriptionSchema.parse(req.body);

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
};

/**
 * DELETE /api/subscription/:id
 * (USER only) Cancel subscription ⇒ status = CANCELLED.
 */
export const cancelSubscription: RequestHandler = async (req, res) => {
  // @ts-ignore: we attached userId in auth.middleware
  const userId = (req as any).userId;

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
};

/**
 * PATCH /api/developer/user-subscriptions/:subscriptionId/approve
 * (DEVELOPER only) Approve a manual payment ⇒ status = ACTIVE.
 */
export const approveSubscription: RequestHandler = async (req, res) => {
  // @ts-ignore: we attached userRole in auth.middleware
  if ((req as any).userRole !== "DEVELOPER") {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  const sub = await prisma.subscription.update({
    where: { id: req.params.subscriptionId },
    data: { status: "ACTIVE" },
  });

  // Send “Activated” email + schedule H-1 reminder
  const user = await prisma.user.findUnique({ where: { id: sub.userId } });
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
};

/**
 * GET /api/developer/user-subscriptions
 * (DEVELOPER only) List all user subscriptions (for approval).
 */
export const listAllSubscriptions: RequestHandler = async (req, res) => {
  // @ts-ignore: we attached userRole in auth.middleware
  if ((req as any).userRole !== "DEVELOPER") {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  const subs = await prisma.subscription.findMany({
    include: { user: true, plan: true },
  });

  res.json(subs);
};


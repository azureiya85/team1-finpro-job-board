import prisma from "../lib/prisma";
import { createSubscriptionSchema, updateSubscriptionSchema } from "../lib/validations/zodSubscriptionValidation";
import { sendEmail } from "../utils/email";
import { scheduleReminder } from "../controllers/scheduler";
import { coreApi } from "../utils/midtrans";
import type { ChargeParams } from "midtrans-client";

export class SubscriptionService {
  static async createManualSubscription(userId: string, planId: string, paymentMethod: string, filePath?: string) {
    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan) throw { status: 404, message: "Plan not found" };

    // compute dates
    const now = new Date();
    const endDate = new Date(now.getTime() + plan.duration * 24 * 60 * 60 * 1000);

    // require proof for bank transfer
    let proofUrl: string | undefined;
    if (paymentMethod === "BANK_TRANSFER") {
      if (!filePath) throw { status: 400, message: "Bank Transfer requires file upload (proof)" };
      proofUrl = filePath;
    }

    // insert
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

    // email
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.email) {
      await sendEmail(
        user.email,
        "Subscription Pending Approval",
        `<p>Your subscription for plan “${plan.name}” is pending. You’ll receive an email once it’s approved.</p>`
      );
    }

    return sub;
  }

  static async createMidtransSubscription(userId: string, planId: string, paymentMethod: string) {
    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan) throw { status: 404, message: "Plan not found" };

    const orderId = `SUB_${userId}_${Date.now()}`;
    const payload: ChargeParams = {
      payment_type: paymentMethod === "MIDTRANS_BCA_VA" ? "bank_transfer" : "qris",
      transaction_details: { order_id: orderId, gross_amount: plan.price },
      ...(paymentMethod === "MIDTRANS_BCA_VA" && { bank_transfer: { bank: "bca" } }),
    };

    const resp = await coreApi.charge(payload);
    return {
      midtrans: {
        payment_type: resp.payment_type,
        bank: resp.va_numbers?.[0]?.bank || null,
        va_number: resp.va_numbers?.[0]?.va_number || null,
        qr_string: resp.qr_string || null,
        transaction_id: resp.transaction_id,
        order_id: resp.order_id,
      },
      planId,
      price: plan.price,
    };
  }

  static async confirmMidtrans(orderId: string, transactionId: string, userId: string) {
    const existing = await prisma.subscription.findUnique({ where: { midtransOrderId: orderId } });
    if (!existing) throw { status: 404, message: "Subscription not found." };
    if (existing.userId !== userId) throw { status: 403, message: "Forbidden" };

    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: existing.planId } });
    if (!plan) throw { status: 404, message: "Plan not found" };

    const now = new Date();
    const newEnd = new Date(now.getTime() + plan.duration * 24 * 60 * 60 * 1000);

    const updated = await prisma.subscription.update({
      where: { id: existing.id },
      data: {
        status: "ACTIVE",
        startDate: now,
        endDate: newEnd,
        midtransTransactionId: transactionId,
      },
    });

    // email + schedule
    const user = await prisma.user.findUnique({ where: { id: existing.userId } });
    if (user?.email) {
      await sendEmail(
        user.email,
        "Subscription Activated",
        `<p>Your "${plan.name}" subscription is now active until ${updated.endDate.toDateString()}.</p>`
      );
      scheduleReminder({
        date: updated.endDate,
        to: user.email,
        subject: "Subscription Expiring Tomorrow",
        html: `<p>Your "${plan.name}" subscription expires tomorrow. Please renew to keep exclusive features.</p>`,
      });
    }

    return updated;
  }

  static async listForUser(userId: string) {
    return prisma.subscription.findMany({ where: { userId }, include: { plan: true } });
  }

  static async updateSubscription(id: string, status: string, userId: string) {
    const sub = await prisma.subscription.findUnique({ where: { id } });
    if (!sub) throw { status: 404, message: "Not found" };
    if (sub.userId !== userId) throw { status: 403, message: "Forbidden" };
    return prisma.subscription.update({ where: { id }, data: { status } });
  }

  static async cancelSubscription(id: string, userId: string) {
    const sub = await prisma.subscription.findUnique({ where: { id } });
    if (!sub) throw { status: 404, message: "Not found" };
    if (sub.userId !== userId) throw { status: 403, message: "Forbidden" };
    await prisma.subscription.update({ where: { id }, data: { status: "CANCELLED" } });
  }

  static async listAll(userRole: string) {
    if (userRole !== "DEVELOPER") throw { status: 403, message: "Forbidden" };
    return prisma.subscription.findMany({ include: { user: true, plan: true } });
  }

  static async approve(id: string, userRole: string) {
    if (userRole !== "DEVELOPER") throw { status: 403, message: "Forbidden" };
    const sub = await prisma.subscription.update({ where: { id }, data: { status: "ACTIVE" } });
    const user = await prisma.user.findUnique({ where: { id: sub.userId } });
    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: sub.planId } });
    if (user?.email && plan) {
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
    return sub;
  }
}

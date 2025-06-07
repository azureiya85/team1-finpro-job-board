import prisma from "../lib/prisma";
import type { SubscriptionPlan } from "@prisma/client";

export class PlanService {
  /** List all plans (public). */
  static async listPlans(): Promise<SubscriptionPlan[]> {
    return prisma.subscriptionPlan.findMany();
  }

  /** Create a new plan (DEV only). */
  static async createPlan(
    userRole: string,
    data: {
      name: string;
      price: number;
      duration: number;
      description?: string;
    }
  ): Promise<SubscriptionPlan> {
    if (userRole !== "Developer") {
      const err = new Error("Forbidden");
      ;(err as any).status = 403;
      throw err;
    }
    return prisma.subscriptionPlan.create({ data });
  }

  /** Update an existing plan (DEV only). */
  static async updatePlan(
    userRole: string,
    planId: string,
    data: {
      name?: string;
      price?: number;
      duration?: number;
      description?: string;
    }
  ): Promise<SubscriptionPlan> {
    if (userRole !== "Developer") {
      const err = new Error("Forbidden");
      ;(err as any).status = 403;
      throw err;
    }
    return prisma.subscriptionPlan.update({
      where: { id: planId },
      data,
    });
  }

  /** Delete a plan (DEV only). */
  static async deletePlan(userRole: string, planId: string): Promise<void> {
    if (userRole !== "Developer") {
      const err = new Error("Forbidden");
      ;(err as any).status = 403;
      throw err;
    }
    await prisma.subscriptionPlan.delete({ where: { id: planId } });
  }
}

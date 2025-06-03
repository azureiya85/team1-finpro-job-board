// apps/api/src/controllers/plan.controller.ts
import { RequestHandler } from "express";
import prisma from "../lib/prisma";
import { createPlanSchema, updatePlanSchema } from "../lib/validations/zodPlanvalidation";

/**
 * GET /api/plan
 * List all subscription plans (public).
 */
export const listPlans: RequestHandler = async (req, res) => {
  const plans = await prisma.subscriptionPlan.findMany();
  res.json(plans);
};

/**
 * POST /api/plan
 * (DEVELOPER only) Create a new subscription plan.
 */
export const createPlan: RequestHandler = async (req, res) => {
  // @ts-ignore: userRole was injected by auth.middleware
  if ((req as any).userRole !== "DEVELOPER") {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  const data = createPlanSchema.parse(req.body);
  const plan = await prisma.subscriptionPlan.create({ data });

  res.status(201).json(plan);
};

/**
 * PUT /api/plan/:id
 * (DEVELOPER only) Update an existing plan.
 */
export const updatePlan: RequestHandler = async (req, res) => {
  // @ts-ignore
  if ((req as any).userRole !== "DEVELOPER") {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  const data = updatePlanSchema.parse(req.body);
  const updated = await prisma.subscriptionPlan.update({
    where: { id: req.params.id },
    data,
  });

  res.json(updated);
};

/**
 * DELETE /api/plan/:id
 * (DEVELOPER only) Delete a plan.
 */
export const deletePlan: RequestHandler = async (req, res) => {
  // @ts-ignore
  if ((req as any).userRole !== "DEVELOPER") {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  await prisma.subscriptionPlan.delete({ where: { id: req.params.id } });
  res.status(204).send();
};

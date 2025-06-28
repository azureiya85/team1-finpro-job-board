import { Request, Response, RequestHandler } from "express";
import { SubscriptionPlanService } from "../services/plan.service";
import { createPlanSchema, updatePlanSchema } from "../lib/validations/zodPlanValidation";

/** GET /api/developer/subscription-plans */
export const listPlans: RequestHandler = async (req, res) => {
  try {
    const plans = await SubscriptionPlanService.listPlans();
    res.json(plans);
  } catch (err) {
    console.error("Error listing plans:", err);
    res.status(500).json({ message: "Failed to fetch plans." });
  }
};

/** POST /api/developer/subscription-plans */
export const createPlan: RequestHandler = async (req, res) => {
  const userRole = (req as any).userRole as string;
  let data;
  try {
    data = createPlanSchema.parse(req.body);
  } catch {
    res.status(400).json({ message: "Invalid request body." });
    return;
  }

  try {
    const plan = await SubscriptionPlanService.createPlan(userRole, data);
    res.status(201).json(plan);
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message || "Failed to create plan." });
  }
};

/** PUT /api/developer/subscription-plans/:id */
export const updatePlan: RequestHandler = async (req, res) => {
  const userRole = (req as any).userRole as string;
  let data;
  try {
    data = updatePlanSchema.parse(req.body);
  } catch {
    res.status(400).json({ message: "Invalid request body." });
    return;
  }

  try {
    const updated = await SubscriptionPlanService.updatePlan(userRole, req.params.id, data);
    res.json(updated);
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message || "Failed to update plan." });
  }
};

/** DELETE /api/developer/subscription-plans/:id */
export const deletePlan: RequestHandler = async (req, res) => {
  const userRole = (req as any).userRole as string;
  try {
    await SubscriptionPlanService.deletePlan(userRole, req.params.id);
    res.status(204).send();
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message || "Failed to delete plan." });
  }
};

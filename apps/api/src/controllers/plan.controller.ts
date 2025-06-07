// src/controllers/plan.controller.ts
import { Request, Response } from "express";
import { PlanService } from "../services/plan.service";
import { createPlanSchema, updatePlanSchema } from "../lib/validations/zodPlanValidation";

export class PlanController {
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const plans = await PlanService.listPlans();
      res.json(plans);
      return;
    } catch (err: any) {
      console.error("Error listing plans:", err);
      res.status(500).json({ message: "Failed to list plans" });
      return;
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    const userRole = (req as any).userRole as string;
    let data: { name: string; price: number; duration: number; description?: string };

    try {
      data = createPlanSchema.parse(req.body);
    } catch {
      res.status(400).json({ message: "Invalid request body." });
      return;
    }

    try {
      const plan = await PlanService.createPlan(userRole, data);
      res.status(201).json(plan);
      return;
    } catch (err: any) {
      console.error("Error creating plan:", err);
      res.status(err.status || 500).json({ message: err.message || "Failed to create plan" });
      return;
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    const userRole = (req as any).userRole as string;
    let data: { name?: string; price?: number; duration?: number; description?: string };

    try {
      data = updatePlanSchema.parse(req.body);
    } catch {
      res.status(400).json({ message: "Invalid request body." });
      return;
    }

    try {
      const updated = await PlanService.updatePlan(userRole, req.params.id, data);
      res.json(updated);
      return;
    } catch (err: any) {
      console.error("Error updating plan:", err);
      res.status(err.status || 500).json({ message: err.message || "Failed to update plan" });
      return;
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    const userRole = (req as any).userRole as string;

    try {
      await PlanService.deletePlan(userRole, req.params.id);
      res.status(204).send();
      return;
    } catch (err: any) {
      console.error("Error deleting plan:", err);
      res.status(err.status || 500).json({ message: err.message || "Failed to delete plan" });
      return;
    }
  }
}

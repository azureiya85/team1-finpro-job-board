import { Request, Response } from "express";
import { SubscriptionService } from "../services/subscription.service";
import { createSubscriptionSchema, updateSubscriptionSchema } from "../lib/validations/zodSubscriptionValidation";

export class SubscriptionController {
  static async create(req: Request, res: Response) {
    const userId = (req as any).userId as string;
    const file = (req as any).file as Express.Multer.File | undefined;

    let body: { planId: string; paymentMethod: string };
    try {
      body = createSubscriptionSchema.parse(req.body);
    } catch {
      return res.status(400).json({ message: "Invalid request body." });
    }

    try {
      if (body.paymentMethod === "MIDTRANS_BCA_VA" || body.paymentMethod === "MIDTRANS_QRIS") {
        const data = await SubscriptionService.createMidtransSubscription(userId, body.planId, body.paymentMethod);
        return res.status(201).json(data);
      } else {
        const sub = await SubscriptionService.createManualSubscription(
          userId,
          body.planId,
          body.paymentMethod,
          file?.path
        );
        return res.status(201).json(sub);
      }
    } catch (err: any) {
      console.error(err);
      return res.status(err.status || 500).json({ message: err.message || "Internal server error" });
    }
  }

  static async confirm(req: Request, res: Response) {
    const userId = (req as any).userId as string;
    const { orderId, transactionId } = req.body;
    try {
      const updated = await SubscriptionService.confirmMidtrans(orderId, transactionId, userId);
      res.json(updated);
    } catch (err: any) {
      res.status(err.status || 500).json({ message: err.message });
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const subs = await SubscriptionService.listForUser((req as any).userId);
      res.json(subs);
    } catch (err: any) {
      res.status(500).json({ message: "Could not list subscriptions" });
    }
  }

  static async update(req: Request, res: Response) {
    const userId = (req as any).userId as string;
    let body: { status: string };
    try {
      body = updateSubscriptionSchema.parse(req.body);
    } catch {
      return res.status(400).json({ message: "Invalid request body." });
    }

    try {
      const updated = await SubscriptionService.updateSubscription(req.params.id, body.status, userId);
      res.json(updated);
    } catch (err: any) {
      res.status(err.status || 500).json({ message: err.message });
    }
  }

  static async cancel(req: Request, res: Response) {
    try {
      await SubscriptionService.cancelSubscription(req.params.id, (req as any).userId);
      res.status(204).send();
    } catch (err: any) {
      res.status(err.status || 500).json({ message: err.message });
    }
  }

  static async approve(req: Request, res: Response) {
    try {
      const sub = await SubscriptionService.approve(req.params.subscriptionId, (req as any).userRole);
      res.json(sub);
    } catch (err: any) {
      res.status(err.status || 500).json({ message: err.message });
    }
  }

  static async listAll(req: Request, res: Response) {
    try {
      const subs = await SubscriptionService.listAll((req as any).userRole);
      res.json(subs);
    } catch (err: any) {
      res.status(err.status || 500).json({ message: err.message });
    }
  }
}

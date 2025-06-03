import { z } from "zod";

export const createSubscriptionSchema = z.object({
  planId: z.string().cuid(),
  paymentMethod: z.enum([
    "BANK_TRANSFER",
    "CREDIT_CARD",
    "E_WALLET",
    "PAYMENT_GATEWAY",
  ]),
  // For manual upload, later we’ll accept a multipart form to handle proof,
  // but here we simply store the paymentMethod. Status starts as PENDING.
});

export const updateSubscriptionSchema = z.object({
  status: z.enum(["ACTIVE", "EXPIRED", "CANCELLED", "PENDING"]),
  // Developer might update paymentStatus separately; for now, only status
});

import { z } from "zod";

export const createPlanSchema = z.object({
  name: z.string().min(1),
  price: z.number().int().min(0),
  duration: z.number().int().min(1),          // e.g. 30 days
  features: z.array(z.string()).min(1),
});

export const updatePlanSchema = createPlanSchema.partial();

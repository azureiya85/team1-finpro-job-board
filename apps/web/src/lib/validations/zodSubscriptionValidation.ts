import { z } from 'zod';
import { PaymentMethod } from '@prisma/client'; 

export const SubscriptionPlanFeatureSchema = z.object({
  cvGenerator: z.boolean().default(false),
  skillAssessmentLimit: z.union([z.number().int().min(0), z.literal('unlimited')]).default(0),
  priorityReview: z.boolean().default(false),
});

export const CreateSubscriptionPlanSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  price: z.number().int().positive("Price must be a positive integer"),
  duration: z.number().int().positive("Duration must be in positive days").default(30),
  description: z.string().optional(),
  features: SubscriptionPlanFeatureSchema,
});

export type CreateSubscriptionPlanInput = z.infer<typeof CreateSubscriptionPlanSchema>;

export const UpdateSubscriptionPlanSchema = CreateSubscriptionPlanSchema.partial();
export type UpdateSubscriptionPlanInput = z.infer<typeof UpdateSubscriptionPlanSchema>;

// Legacy feature conversion helper (for backward compatibility)
export const convertLegacyFeatures = (features: unknown): z.infer<typeof SubscriptionPlanFeatureSchema> => {
  if (Array.isArray(features)) {
    return {
      cvGenerator: features.includes('CV Generator') || features.includes('cvGenerator'),
      skillAssessmentLimit: features.includes('Unlimited Skill Assessments') ? 'unlimited' : 
                           features.includes('Limited Skill Assessments') ? 5 : 0,
      priorityReview: features.includes('Priority CV Review') || features.includes('priorityReview'),
    };
  } else if (typeof features === 'object' && features !== null) {
    const result = SubscriptionPlanFeatureSchema.safeParse(features);
    if (result.success) {
      return result.data;
    }
    const f = features as Partial<z.infer<typeof SubscriptionPlanFeatureSchema>>;
    return {
      cvGenerator: f.cvGenerator || false,
      skillAssessmentLimit: f.skillAssessmentLimit || 0,
      priorityReview: f.priorityReview || false,
    };
  }
  
  // Default features
  return {
    cvGenerator: false,
    skillAssessmentLimit: 0,
    priorityReview: false,
  };
};

export const SubscriptionCheckoutSchema = z.object({
  planId: z.string().min(1, { message: "Plan ID is required" }), 
  paymentMethod: z.nativeEnum(PaymentMethod),
});
export type SubscriptionCheckoutInput = z.infer<typeof SubscriptionCheckoutSchema>;

export const UploadPaymentProofSchema = z.object({
  subscriptionId: z.string().cuid("Invalid subscription ID"),
  paymentProofUrl: z.string().url("Invalid payment proof URL"), 
});
export type UploadPaymentProofInput = z.infer<typeof UploadPaymentProofSchema>;

export const MidtransNotificationSchema = z.object({
  transaction_status: z.string(),
  order_id: z.string(), 
  fraud_status: z.string().optional(),
  transaction_id: z.string().optional(),
  status_code: z.string(),
  gross_amount: z.string(), 
  payment_type: z.string().optional(),
  signature_key: z.string().optional(), 
});
export type MidtransNotificationInput = z.infer<typeof MidtransNotificationSchema>;
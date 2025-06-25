import prisma from '@/lib/prisma';
import { SubscriptionStatus } from '@prisma/client';

export interface UserSubscriptionDetails {
  isActive: boolean;
  planName: string | null;
  subscriptionId: string | null;
  limit: number | 'unlimited';
  assessmentsTaken: number;
  endDate: Date | null;
}

export async function getUserSubscriptionDetails(userId: string): Promise<UserSubscriptionDetails> {
  const activeSubscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: SubscriptionStatus.ACTIVE,
      endDate: { gt: new Date() },
    },
    include: {
      plan: true, // Include the plan details to get features
    },
  });

  if (!activeSubscription) {
    return {
      isActive: false,
      planName: null,
      subscriptionId: null,
      limit: 0,
      assessmentsTaken: 0,
      endDate: null,
    };
  }

  // Count assessments taken *during this specific subscription period*
  const assessmentsTakenCount = await prisma.userSkillAssessment.count({
    where: {
      userId,
      subscriptionId: activeSubscription.id,
    },
  });

  const features = activeSubscription.plan.features as { skillAssessmentLimit?: number | 'unlimited' };
  const limit = features.skillAssessmentLimit ?? 0;

  return {
    isActive: true,
    planName: activeSubscription.plan.name,
    subscriptionId: activeSubscription.id,
    limit: limit,
    assessmentsTaken: assessmentsTakenCount,
    endDate: activeSubscription.endDate,
  };
}
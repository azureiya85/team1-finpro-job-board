import prisma from '@/lib/prisma';
import { SubscriptionStatus, PaymentStatus } from '@prisma/client';
import { addDays, subDays } from 'date-fns';

export type SubscriptionWithUserAndPlan = {
  id: string;
  status: SubscriptionStatus;
  endDate: Date;
  user: {
    id: string;
    email: string;
    name: string | null;
    firstName: string | null;
  };
  plan: {
    name: string;
    price: number;
  };
};


// Get all expired subscriptions that are still marked as active 
export const getExpiredSubscriptions = async (now: Date): Promise<SubscriptionWithUserAndPlan[]> => {
  return await prisma.subscription.findMany({
    where: {
      status: SubscriptionStatus.ACTIVE,
      endDate: { lt: now },
    },
    include: {
      user: {
        select: { id: true, email: true, name: true, firstName: true }
      },
      plan: {
        select: { name: true, price: true }
      }
    }
  });
};


// Get subscriptions expiring on a specific date 
export const getSubscriptionsExpiringOnDate = async (
  targetDate: Date,
  now: Date
): Promise<SubscriptionWithUserAndPlan[]> => {
  return await prisma.subscription.findMany({
    where: {
      status: SubscriptionStatus.ACTIVE,
      endDate: {
        gte: targetDate,
        lt: addDays(targetDate, 1),
      },
      OR: [
        { lastExpiryNotificationSent: null },
        { lastExpiryNotificationSent: { lt: subDays(now, 2) } }
      ]
    },
    include: {
      user: {
        select: { id: true, email: true, name: true, firstName: true }
      },
      plan: {
        select: { name: true, price: true }
      }
    }
  });
};


// Get subscriptions expiring in 3 days 
export const getSubscriptionsExpiringIn3Days = async (
  targetDate: Date,
  now: Date
): Promise<SubscriptionWithUserAndPlan[]> => {
  return await prisma.subscription.findMany({
    where: {
      status: SubscriptionStatus.ACTIVE,
      endDate: {
        gte: targetDate,
        lt: addDays(targetDate, 1),
      },
      OR: [
        { lastExpiryNotificationSent: null },
        { lastExpiryNotificationSent: { lt: subDays(now, 4) } }
      ]
    },
    include: {
      user: {
        select: { id: true, email: true, name: true, firstName: true }
      },
      plan: {
        select: { name: true, price: true }
      }
    }
  });
};


// Get subscriptions expiring in 7 days 
export const getSubscriptionsExpiringIn7Days = async (
  targetDate: Date,
  now: Date
): Promise<SubscriptionWithUserAndPlan[]> => {
  return await prisma.subscription.findMany({
    where: {
      status: SubscriptionStatus.ACTIVE,
      endDate: {
        gte: targetDate,
        lt: addDays(targetDate, 1),
      },
      OR: [
        { lastExpiryNotificationSent: null },
        { lastExpiryNotificationSent: { lt: subDays(now, 8) } }
      ]
    },
    include: {
      user: {
        select: { id: true, email: true, name: true, firstName: true }
      },
      plan: {
        select: { name: true, price: true }
      }
    }
  });
};


 // Mark subscription as expired 
export const markSubscriptionAsExpired = async (subscriptionId: string, now: Date): Promise<void> => {
  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: { 
      status: SubscriptionStatus.EXPIRED, 
      updatedAt: now 
    }
  });
};


// Update subscription notification timestamp 
export const updateSubscriptionNotificationTimestamp = async (
  subscriptionId: string, 
  now: Date
): Promise<void> => {
  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      lastExpiryNotificationSent: now,
      updatedAt: now,
    }
  });
};


// Clean up old cancelled subscriptions 
export const cleanupOldCancelledSubscriptions = async (now: Date): Promise<number> => {
  const result = await prisma.subscription.deleteMany({
    where: {
      status: { in: [SubscriptionStatus.CANCELLED] },
      paymentStatus: PaymentStatus.FAILED,
      updatedAt: { lt: subDays(now, 90) }
    }
  });
  
  return result.count;
};


// Cancel overdue pending subscriptions 
export const cancelOverduePendingSubscriptions = async (now: Date): Promise<number> => {
  const result = await prisma.subscription.updateMany({
    where: {
      status: SubscriptionStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      createdAt: { lt: subDays(now, 7) }
    },
    data: {
      status: SubscriptionStatus.CANCELLED,
      paymentStatus: PaymentStatus.FAILED,
      updatedAt: now,
    }
  });
  
  return result.count;
};
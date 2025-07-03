import prisma from '@/lib/prisma';
import { SubscriptionStatus, PaymentStatus } from '@prisma/client';
import { addDays, subDays } from 'date-fns';

export interface SubscriptionStatistics {
  activeSubscriptions: number;
  expiredToday: number;
  expiringTomorrow: number;
  expiringIn3Days: number;
  expiringIn7Days: number;
  pendingSubscriptions: number;
  overduePendingSubscriptions: number;
}

 // Get comprehensive subscription statistics for monitoring 
export async function getSubscriptionStatistics(): Promise<SubscriptionStatistics> {
  const now = new Date();
  const tomorrow = addDays(now, 1);
  const threeDaysFromNow = addDays(now, 3);
  const sevenDaysFromNow = addDays(now, 7);

  const [
    activeSubscriptions,
    expiredToday,
    expiringTomorrow,
    expiringIn3Days,
    expiringIn7Days,
    pendingSubscriptions,
    overduePending
  ] = await Promise.all([
    prisma.subscription.count({
      where: { status: SubscriptionStatus.ACTIVE, endDate: { gt: now } }
    }),
    prisma.subscription.count({
      where: { 
        status: SubscriptionStatus.EXPIRED, 
        endDate: { gte: subDays(now, 1), lt: now } 
      }
    }),
    prisma.subscription.count({
      where: { 
        status: SubscriptionStatus.ACTIVE, 
        endDate: { gte: tomorrow, lt: addDays(tomorrow, 1) } 
      }
    }),
    prisma.subscription.count({
      where: { 
        status: SubscriptionStatus.ACTIVE, 
        endDate: { gte: threeDaysFromNow, lt: addDays(threeDaysFromNow, 1) } 
      }
    }),
    prisma.subscription.count({
      where: { 
        status: SubscriptionStatus.ACTIVE, 
        endDate: { gte: sevenDaysFromNow, lt: addDays(sevenDaysFromNow, 1) } 
      }
    }),
    prisma.subscription.count({
      where: { status: SubscriptionStatus.PENDING }
    }),
    prisma.subscription.count({
      where: {
        status: SubscriptionStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        createdAt: { lt: subDays(now, 7) }
      }
    })
  ]);

  return {
    activeSubscriptions,
    expiredToday,
    expiringTomorrow,
    expiringIn3Days,
    expiringIn7Days,
    pendingSubscriptions,
    overduePendingSubscriptions: overduePending,
  };
}
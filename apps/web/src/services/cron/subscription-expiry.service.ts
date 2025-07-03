import { addDays } from 'date-fns';
import {
  getExpiredSubscriptions,
  getSubscriptionsExpiringOnDate,
  getSubscriptionsExpiringIn3Days,
  getSubscriptionsExpiringIn7Days,
  markSubscriptionAsExpired,
  updateSubscriptionNotificationTimestamp,
  cleanupOldCancelledSubscriptions,
  cancelOverduePendingSubscriptions
} from '@/services/cron/subscription-queries.service';
import { sendSubscriptionExpiredNotification, sendSubscriptionExpiringNotification } from '@/services/cron/email-helper.service';
import { createExpiredSubscriptionNotification, createExpiringSubscriptionNotification } from '@/services/cron/subscription-notifier.service';

export interface SubscriptionExpiryResult {
  expiredSubscriptions: number;
  h1ExpiryNotifications: number;
  h3ExpiryNotifications: number;
  h7ExpiryNotifications: number;
  overdueSubscriptionsCancelled: number;
  oldSubscriptionsCleanedUp: number;
  errors: number;
  processedAt: string;
}


// Main subscription expiry handling function
export async function handleSubscriptionExpiry(): Promise<SubscriptionExpiryResult> {
  const now = new Date();
  const tomorrow = addDays(now, 1);
  const threeDaysFromNow = addDays(now, 3);
  const sevenDaysFromNow = addDays(now, 7);
  
  console.log(`Processing subscription expiry at ${now.toISOString()}`);

  let expiredCount = 0;
  let h1NotificationCount = 0;
  let h3NotificationCount = 0;
  let h7NotificationCount = 0;
  let errorCount = 0;
  let cleanupCount = 0;

  try {
    // 1. Handle expired subscriptions
    const expiredSubscriptions = await getExpiredSubscriptions(now);
    console.log(`Found ${expiredSubscriptions.length} expired subscriptions`);

    for (const subscription of expiredSubscriptions) {
      try {
        await markSubscriptionAsExpired(subscription.id, now);
        await sendSubscriptionExpiredNotification(subscription.user, subscription.plan.name, subscription.endDate);
        await createExpiredSubscriptionNotification(subscription.user.id, subscription.plan.name);
        
        expiredCount++;
        console.log(`Marked subscription ${subscription.id} as expired for user ${subscription.user.email}`);
      } catch (error) {
        console.error(`Error processing expired subscription ${subscription.id}:`, error);
        errorCount++;
      }
    }

    // 2. Handle H-1 expiry notifications
    const expiringTomorrowSubscriptions = await getSubscriptionsExpiringOnDate(tomorrow, now);
    console.log(`Found ${expiringTomorrowSubscriptions.length} subscriptions expiring tomorrow`);

    for (const subscription of expiringTomorrowSubscriptions) {
      try {
        await sendSubscriptionExpiringNotification(subscription.user, subscription.plan.name, subscription.endDate, 'H-1');
        await createExpiringSubscriptionNotification(subscription.user.id, subscription.plan.name, 1);
        await updateSubscriptionNotificationTimestamp(subscription.id, now);
        
        h1NotificationCount++;
        console.log(`Sent H-1 expiry notification for subscription ${subscription.id}`);
      } catch (error) {
        console.error(`Error sending H-1 notification for subscription ${subscription.id}:`, error);
        errorCount++;
      }
    }

    // 3. Handle H-3 expiry notifications
    const expiringIn3DaysSubscriptions = await getSubscriptionsExpiringIn3Days(threeDaysFromNow, now);
    console.log(`Found ${expiringIn3DaysSubscriptions.length} subscriptions expiring in 3 days`);

    for (const subscription of expiringIn3DaysSubscriptions) {
      try {
        await sendSubscriptionExpiringNotification(subscription.user, subscription.plan.name, subscription.endDate, 'H-3');
        await createExpiringSubscriptionNotification(subscription.user.id, subscription.plan.name, 3);
        await updateSubscriptionNotificationTimestamp(subscription.id, now);
        
        h3NotificationCount++;
        console.log(`Sent H-3 expiry notification for subscription ${subscription.id}`);
      } catch (error) {
        console.error(`Error sending H-3 notification for subscription ${subscription.id}:`, error);
        errorCount++;
      }
    }

    // 4. Handle H-7 expiry notifications
    const expiringIn7DaysSubscriptions = await getSubscriptionsExpiringIn7Days(sevenDaysFromNow, now);
    console.log(`Found ${expiringIn7DaysSubscriptions.length} subscriptions expiring in 7 days`);

    for (const subscription of expiringIn7DaysSubscriptions) {
      try {
        await sendSubscriptionExpiringNotification(subscription.user, subscription.plan.name, subscription.endDate, 'H-7');
        await createExpiringSubscriptionNotification(subscription.user.id, subscription.plan.name, 7);
        await updateSubscriptionNotificationTimestamp(subscription.id, now);
        
        h7NotificationCount++;
        console.log(`Sent H-7 expiry notification for subscription ${subscription.id}`);
      } catch (error) {
        console.error(`Error sending H-7 notification for subscription ${subscription.id}:`, error);
        errorCount++;
      }
    }

    // 5. Cleanup and maintenance
    cleanupCount = await cleanupOldCancelledSubscriptions(now);
    console.log(`Cleaned up ${cleanupCount} old cancelled subscriptions`);

    const overdueSubscriptionsCancelled = await cancelOverduePendingSubscriptions(now);
    console.log(`Marked ${overdueSubscriptionsCancelled} overdue pending subscriptions as cancelled`);

    const summary: SubscriptionExpiryResult = {
      expiredSubscriptions: expiredCount,
      h1ExpiryNotifications: h1NotificationCount,
      h3ExpiryNotifications: h3NotificationCount,
      h7ExpiryNotifications: h7NotificationCount,
      overdueSubscriptionsCancelled,
      oldSubscriptionsCleanedUp: cleanupCount,
      errors: errorCount,
      processedAt: now.toISOString(),
    };

    console.log('Subscription expiry handling completed:', summary);
    return summary;

  } catch (error) {
    console.error('Critical error in subscription expiry handling:', error);
    throw error;
  }
}
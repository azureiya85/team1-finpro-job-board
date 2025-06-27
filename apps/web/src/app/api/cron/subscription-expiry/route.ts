import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { SubscriptionStatus, PaymentStatus } from '@prisma/client';
import { addDays, subDays } from 'date-fns';
import { emailService } from '@/services/email.service';

// Helper function to safely send emails without breaking the main flow
const sendEmailSafely = async (
  emailPromise: Promise<{ success: boolean; messageId: string; }>, 
  errorContext: string,
  userEmail: string
): Promise<void> => {
  try {
    const result = await emailPromise;
    console.log(`${errorContext} sent successfully to ${userEmail}:`, result.messageId);
  } catch (error) {
    console.error(`Failed to send ${errorContext} to ${userEmail}:`, error);
  }
};

// POST - Handle subscription expiry (called by cron)
export async function POST(request: NextRequest) {
  // Verify cron authorization
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('Starting subscription expiry cron job...');

  try {
    const result = await handleSubscriptionExpiry();
    
    // Log the results for monitoring
    console.log('Subscription expiry cron job completed:', result);
    
    return NextResponse.json({
      success: true,
      message: 'Subscription expiry handling completed successfully',
      ...result
    });
  } catch (error) {
    console.error('Error in subscription expiry cron job:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to handle subscription expiry',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Main expiry handling function
async function handleSubscriptionExpiry() {
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
    // 1. Handle expired subscriptions (past end date)
    const expiredSubscriptions = await prisma.subscription.findMany({
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

    console.log(`Found ${expiredSubscriptions.length} expired subscriptions`);

    for (const subscription of expiredSubscriptions) {
      try {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { 
            status: SubscriptionStatus.EXPIRED, 
            updatedAt: now 
          }
        });

        const firstName = subscription.user.firstName || subscription.user.name || 'User';
        
        // Send expiry notification email
        await sendEmailSafely(
          emailService.sendSubscriptionExpiredEmail(
            subscription.user.email,
            firstName,
            subscription.plan.name,
            subscription.endDate
          ),
          'subscription expired email',
          subscription.user.email
        );

        // Create in-app notification
        await prisma.notification.create({
          data: {
            userId: subscription.user.id,
            type: 'SUBSCRIPTION_ENDED',
            message: `Your ${subscription.plan.name} subscription has expired. Renew now to continue accessing premium features.`,
            link: `/dashboard/subscription`,
          },
        });

        expiredCount++;
        console.log(`Marked subscription ${subscription.id} as expired for user ${subscription.user.email}`);
      } catch (error) {
        console.error(`Error processing expired subscription ${subscription.id}:`, error);
        errorCount++;
      }
    }

    // 2. Send H-1 expiry notifications (expires tomorrow)
    const expiringTomorrowSubscriptions = await prisma.subscription.findMany({
      where: {
        status: SubscriptionStatus.ACTIVE,
        endDate: {
          gte: tomorrow,
          lt: addDays(tomorrow, 1),
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

    console.log(`Found ${expiringTomorrowSubscriptions.length} subscriptions expiring tomorrow`);

    for (const subscription of expiringTomorrowSubscriptions) {
      try {
        const firstName = subscription.user.firstName || subscription.user.name || 'User';
        
        await sendEmailSafely(
          emailService.sendSubscriptionExpiring(
            subscription.user.email,
            firstName,
            subscription.plan.name,
            subscription.endDate
          ),
          'H-1 expiry reminder email',
          subscription.user.email
        );

        await prisma.notification.create({
          data: {
            userId: subscription.user.id,
            type: 'SUBSCRIPTION_EXPIRING',
            message: `Your ${subscription.plan.name} subscription expires tomorrow. Renew now to avoid service interruption.`,
            link: `/dashboard/subscription`,
          },
        });

        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            lastExpiryNotificationSent: now,
            updatedAt: now,
          }
        });

        h1NotificationCount++;
        console.log(`Sent H-1 expiry notification for subscription ${subscription.id}`);
      } catch (error) {
        console.error(`Error sending H-1 notification for subscription ${subscription.id}:`, error);
        errorCount++;
      }
    }

    // 3. Send H-3 expiry notifications (expires in 3 days)
    const expiringIn3DaysSubscriptions = await prisma.subscription.findMany({
      where: {
        status: SubscriptionStatus.ACTIVE,
        endDate: {
          gte: threeDaysFromNow,
          lt: addDays(threeDaysFromNow, 1),
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

    console.log(`Found ${expiringIn3DaysSubscriptions.length} subscriptions expiring in 3 days`);

    for (const subscription of expiringIn3DaysSubscriptions) {
      try {
        const firstName = subscription.user.firstName || subscription.user.name || 'User';
        
        await sendEmailSafely(
          emailService.sendSubscriptionExpiring(
            subscription.user.email,
            firstName,
            subscription.plan.name,
            subscription.endDate
          ),
          'H-3 expiry reminder email',
          subscription.user.email
        );

        await prisma.notification.create({
          data: {
            userId: subscription.user.id,
            type: 'SUBSCRIPTION_EXPIRING',
            message: `Your ${subscription.plan.name} subscription expires in 3 days. Renew now to ensure uninterrupted service.`,
            link: `/dashboard/subscription`,
          },
        });

        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            lastExpiryNotificationSent: now,
            updatedAt: now,
          }
        });

        h3NotificationCount++;
        console.log(`Sent H-3 expiry notification for subscription ${subscription.id}`);
      } catch (error) {
        console.error(`Error sending H-3 notification for subscription ${subscription.id}:`, error);
        errorCount++;
      }
    }

    // 4. Send H-7 expiry notifications (expires in 7 days)
    const expiringIn7DaysSubscriptions = await prisma.subscription.findMany({
      where: {
        status: SubscriptionStatus.ACTIVE,
        endDate: {
          gte: sevenDaysFromNow,
          lt: addDays(sevenDaysFromNow, 1),
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

    console.log(`Found ${expiringIn7DaysSubscriptions.length} subscriptions expiring in 7 days`);

    for (const subscription of expiringIn7DaysSubscriptions) {
      try {
        const firstName = subscription.user.firstName || subscription.user.name || 'User';
        
        await sendEmailSafely(
          emailService.sendSubscriptionExpiring(
            subscription.user.email,
            firstName,
            subscription.plan.name,
            subscription.endDate
          ),
          'H-7 expiry reminder email',
          subscription.user.email
        );

        await prisma.notification.create({
          data: {
            userId: subscription.user.id,
            type: 'SUBSCRIPTION_EXPIRING',
            message: `Your ${subscription.plan.name} subscription expires in 7 days. Renew now to continue enjoying premium features.`,
            link: `/dashboard/subscription`,
          },
        });

        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            lastExpiryNotificationSent: now,
            updatedAt: now,
          }
        });

        h7NotificationCount++;
        console.log(`Sent H-7 expiry notification for subscription ${subscription.id}`);
      } catch (error) {
        console.error(`Error sending H-7 notification for subscription ${subscription.id}:`, error);
        errorCount++;
      }
    }

    // 5. Clean up old cancelled/failed subscriptions (older than 90 days)
    const oldCancelledSubscriptions = await prisma.subscription.deleteMany({
      where: {
        status: { in: [SubscriptionStatus.CANCELLED] },
        paymentStatus: PaymentStatus.FAILED,
        updatedAt: { lt: subDays(now, 90) }
      }
    });

    cleanupCount = oldCancelledSubscriptions.count;
    console.log(`Cleaned up ${cleanupCount} old cancelled subscriptions`);

    // 6. Handle overdue pending subscriptions (pending for more than 7 days)
    const overduePendingSubscriptions = await prisma.subscription.updateMany({
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

    console.log(`Marked ${overduePendingSubscriptions.count} overdue pending subscriptions as cancelled`);

    const summary = {
      expiredSubscriptions: expiredCount,
      h1ExpiryNotifications: h1NotificationCount,
      h3ExpiryNotifications: h3NotificationCount,
      h7ExpiryNotifications: h7NotificationCount,
      overdueSubscriptionsCancelled: overduePendingSubscriptions.count,
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

// GET - Get subscription expiry statistics (for monitoring/debugging)
export async function GET() {
  try {
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

    return NextResponse.json({
      statistics: {
        activeSubscriptions,
        expiredToday,
        expiringTomorrow,
        expiringIn3Days,
        expiringIn7Days,
        pendingSubscriptions,
        overduePendingSubscriptions: overduePending,
      },
      lastCheck: now.toISOString(),
    });

  } catch (error) {
    console.error('Error fetching subscription statistics:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch subscription statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
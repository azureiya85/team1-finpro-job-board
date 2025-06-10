import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { SubscriptionStatus, PaymentStatus } from '@prisma/client';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const subscriptionId = params.id;
  const userId = session.user.id;

  try {
    // Find the subscription
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true },
    });

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // Verify ownership
    if (subscription.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden: You do not own this subscription' }, { status: 403 });
    }

    // Check if already cancelled
    if (subscription.status === SubscriptionStatus.CANCELLED) {
      return NextResponse.json({ error: 'Subscription is already cancelled' }, { status: 400 });
    }

    // Check if it's a completed subscription (might need different handling)
    if (subscription.status === SubscriptionStatus.ACTIVE && subscription.paymentStatus === PaymentStatus.COMPLETED) {
      // For active subscriptions, you might want to:
      // 1. Cancel immediately
      // 2. Cancel at end of billing period
      // 3. Issue refunds
      
      // Option 1: Immediate cancellation (simplest)
      const cancelledSubscription = await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: SubscriptionStatus.CANCELLED,
          updatedAt: new Date(),
          // Optional: Set cancellation date
          // cancelledAt: new Date(),
        },
      });

      return NextResponse.json({
        message: 'Subscription cancelled successfully',
        subscription: cancelledSubscription,
      });
    }

    // For pending subscriptions, just cancel them
    if (subscription.status === SubscriptionStatus.PENDING) {
      const cancelledSubscription = await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: SubscriptionStatus.CANCELLED,
          paymentStatus: PaymentStatus.FAILED, // Or keep as PENDING?
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        message: 'Pending subscription cancelled successfully',
        subscription: cancelledSubscription,
      });
    }

    // Handle other statuses if needed
    return NextResponse.json({ error: 'Cannot cancel subscription in current state' }, { status: 400 });

  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json({ 
      error: 'Failed to cancel subscription',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
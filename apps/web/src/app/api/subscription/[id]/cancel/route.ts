import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { SubscriptionStatus, PaymentStatus, RefundStatus } from '@prisma/client';
import { 
  calculateRefund, 
  canCancelSubscription, 
  generateCancellationMessage} from '@/lib/utils';
import { SubscriptionUpdateData } from '@/types/subscription';

interface CancellationRequest {
  reason?: string;
  immediateCancel?: boolean;
}

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
    // Parse request body for cancellation options
    const body: CancellationRequest = await request.json().catch(() => ({}));
    const { reason, immediateCancel = true } = body;

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

    // Check if subscription can be cancelled
    const cancellationCheck = canCancelSubscription(subscription);
    if (!cancellationCheck.canCancel) {
      return NextResponse.json({ error: cancellationCheck.reason }, { status: 400 });
    }

    const now = new Date();
    const updateData: SubscriptionUpdateData = {
      status: SubscriptionStatus.CANCELLED,
      cancelledAt: now,
      updatedAt: now,
    };

    // Add cancellation reason if provided
    if (reason) {
      updateData.cancellationReason = reason;
    }

    // Handle different subscription states
    if (subscription.status === SubscriptionStatus.ACTIVE && 
        subscription.paymentStatus === PaymentStatus.COMPLETED) {
      
      // Calculate refund using utility function
      const refundCalculation = calculateRefund(subscription, now);
      
      if (immediateCancel) {
        // Immediate cancellation - set end date to now
        updateData.endDate = now;
        
        // Add refund information 
        if (refundCalculation.refundAmount > 0) {
          updateData.refundAmount = refundCalculation.refundAmount;
          updateData.refundStatus = RefundStatus.PENDING;
        }
      } else {
        // Cancel at end of current period - don't update end date
        updateData.autoRenew = false;
      }

      const cancelledSubscription = await prisma.subscription.update({
        where: { id: subscriptionId },
        data: updateData,
        include: { plan: true },
      });

      // Generate cancellation message using utility
      const message = generateCancellationMessage(subscription, refundCalculation, immediateCancel);

      // Create notification for subscription cancellation
      await prisma.notification.create({
        data: {
          userId: userId,
          type: 'SUBSCRIPTION_ENDED', 
          message,
          link: `/dashboard/subscription`,
        },
      });

      return NextResponse.json({
        message: immediateCancel 
          ? 'Subscription cancelled successfully'
          : 'Subscription will be cancelled at the end of current period',
        subscription: cancelledSubscription,
        refundAmount: refundCalculation.refundAmount > 0 ? refundCalculation.refundAmount : null,
        refundStatus: refundCalculation.refundAmount > 0 ? 'pending' : null,
      });
    }

    if (subscription.status === SubscriptionStatus.PENDING) {
      updateData.paymentStatus = PaymentStatus.FAILED;

      const cancelledSubscription = await prisma.subscription.update({
        where: { id: subscriptionId },
        data: updateData,
        include: { plan: true },
      });

      // Create notification
      await prisma.notification.create({
        data: {
          userId: userId,
          type: 'SUBSCRIPTION_ENDED',
          message: `Your pending ${subscription.plan.name} subscription has been cancelled.`,
          link: `/dashboard/subscription`,
        },
      });

      return NextResponse.json({
        message: 'Pending subscription cancelled successfully',
        subscription: cancelledSubscription,
      });
    }

    if (subscription.status === SubscriptionStatus.EXPIRED) {
      return NextResponse.json({ error: 'Cannot cancel an already expired subscription' }, { status: 400 });
    }

    // Handle other statuses
    return NextResponse.json({ error: 'Cannot cancel subscription in current state' }, { status: 400 });

  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json({ 
      error: 'Failed to cancel subscription',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET method to retrieve cancellation options/info
export async function GET(
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
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true },
    });

    if (!subscription || subscription.userId !== userId) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // Check if subscription can be cancelled
    const cancellationCheck = canCancelSubscription(subscription);
    if (!cancellationCheck.canCancel) {
      return NextResponse.json({ error: cancellationCheck.reason }, { status: 400 });
    }

    // Calculate potential refund using utility function
    const refundCalculation = calculateRefund(subscription);

    return NextResponse.json({
      subscription,
      cancellationInfo: {
        canCancel: true,
        daysUsed: refundCalculation.daysUsed,
        daysRemaining: refundCalculation.daysRemaining,
        potentialRefund: refundCalculation.refundAmount > 0 ? refundCalculation.refundAmount : null,
        immediateEndDate: new Date(),
        scheduledEndDate: subscription.endDate,
      },
    });

  } catch (error) {
    console.error('Error fetching cancellation info:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch cancellation information',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
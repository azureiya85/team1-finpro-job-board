import { NextResponse } from 'next/server';
import  prisma  from '@/lib/prisma';
import { auth } from '@/auth';
import { UserRole, SubscriptionStatus, PaymentStatus, PaymentMethod } from '@prisma/client';
import { addDays } from 'date-fns';

interface RouteContext {
  params: {
    subscriptionId: string;
  };
}

export async function PUT(request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user || (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.Developer)) {
    return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
  }

  const { subscriptionId } = params;

  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true, user: { select: { email: true, name: true }} },
    });

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    if (subscription.paymentMethod !== PaymentMethod.BANK_TRANSFER) {
        return NextResponse.json({ error: 'This action is only for Bank Transfer payments.' }, { status: 400 });
    }
    if (subscription.status === SubscriptionStatus.ACTIVE && subscription.paymentStatus === PaymentStatus.COMPLETED) {
        return NextResponse.json({ error: 'Subscription is already active and paid.' }, { status: 400 });
    }
    if (!subscription.paymentProof) {
        return NextResponse.json({ error: 'Payment proof has not been uploaded by the user.' }, { status: 400 });
    }


    const now = new Date();
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: SubscriptionStatus.ACTIVE,
        paymentStatus: PaymentStatus.COMPLETED,
        startDate: now, // Payment confirmed, subscription starts now
        endDate: addDays(now, subscription.plan.duration),
        updatedAt: now,
      },
    });

    // TODO: Send email notification to user about subscription activation
    // e.g., sendSubscriptionActivationEmail(subscription.user.email, subscription.plan.name);
    console.log(`Subscription ${subscriptionId} for user ${subscription.user.email} approved and activated.`);

    return NextResponse.json({ message: 'Subscription approved and activated successfully.', subscription: updatedSubscription });
  } catch (error) {
    console.error(`Error approving subscription ${subscriptionId}:`, error);
    return NextResponse.json({ error: 'Failed to approve subscription' }, { status: 500 });
  }
}
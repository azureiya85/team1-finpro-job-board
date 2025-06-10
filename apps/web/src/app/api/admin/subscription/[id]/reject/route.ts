import { NextResponse } from 'next/server';
import  prisma  from '@/lib/prisma';
import { auth } from '@/auth';
import { UserRole, SubscriptionStatus, PaymentStatus, PaymentMethod } from '@prisma/client';

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
  let rejectionReason: string | undefined;

  try {
    const body = await request.json().catch(() => ({})); // TODO: Optional body for rejection reason
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    rejectionReason = body.reason;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
  }


  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { user: { select: { email: true, name: true }} },
    });

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }
     if (subscription.paymentMethod !== PaymentMethod.BANK_TRANSFER) {
        return NextResponse.json({ error: 'This action is only for Bank Transfer payments.' }, { status: 400 });
    }
    if (subscription.status === SubscriptionStatus.ACTIVE && subscription.paymentStatus === PaymentStatus.COMPLETED) {
        return NextResponse.json({ error: 'Cannot reject an already active and paid subscription.' }, { status: 400 });
    }
    // Allow rejecting even if no proof, or if proof is invalid.

    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: SubscriptionStatus.CANCELLED, 
        paymentStatus: PaymentStatus.FAILED, 
        updatedAt: new Date(),
      },
    });

    // TODO: Send email notification to user about subscription rejection
    // e.g., sendSubscriptionRejectionEmail(subscription.user.email, rejectionReason);
    console.log(`Subscription ${subscriptionId} for user ${subscription.user.email} rejected.`);

    return NextResponse.json({ message: 'Subscription payment rejected successfully.', subscription: updatedSubscription });
  } catch (error) {
    console.error(`Error rejecting subscription ${subscriptionId}:`, error);
    return NextResponse.json({ error: 'Failed to reject subscription' }, { status: 500 });
  }
}
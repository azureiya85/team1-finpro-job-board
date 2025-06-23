import { NextResponse } from 'next/server';
import  prisma  from '@/lib/prisma';
import { auth } from '@/auth';
import { UserRole, SubscriptionStatus, PaymentStatus } from '@prisma/client';

interface RouteContext {
  params: {
    id: string; 
  };
}

export async function PUT(request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user || (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.Developer)) {
    return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
  }

  const { id: subscriptionId } = params; // Extract id and rename to subscriptionId
  let rejectionReason: string | undefined;

  try {
    const body = await request.json().catch(() => ({})); // Optional body for rejection reason
    rejectionReason = body.reason;
  } catch {
    // Ignore parsing errors
  }

  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { user: { select: { email: true, name: true }} },
    });

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    if (subscription.status === SubscriptionStatus.ACTIVE && subscription.paymentStatus === PaymentStatus.COMPLETED) {
        return NextResponse.json({ error: 'Cannot reject an already active and paid subscription.' }, { status: 400 });
    }

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
    console.log(`Subscription ${subscriptionId} for user ${subscription.user.email} rejected.`, rejectionReason ? `Reason: ${rejectionReason}` : '');

    return NextResponse.json({ message: 'Subscription payment rejected successfully.', subscription: updatedSubscription });
  } catch (error) {
    console.error(`Error rejecting subscription ${subscriptionId}:`, error);
    return NextResponse.json({ error: 'Failed to reject subscription' }, { status: 500 });
  }
}
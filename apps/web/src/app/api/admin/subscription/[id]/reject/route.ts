import { NextResponse } from 'next/server';
import  prisma  from '@/lib/prisma';
import { auth } from '@/auth';
import { UserRole, SubscriptionStatus, PaymentStatus } from '@prisma/client';
import { emailService } from '@/services/email.service';

interface RouteContext {
  params: {
    id: string; 
  };
}

// Helper function to safely send emails without breaking the main flow
const sendEmailSafely = async (
  emailPromise: Promise<{ success: boolean; messageId: string; }>, 
  errorContext: string
): Promise<void> => {
  try {
    const result = await emailPromise;
    console.log(`${errorContext} sent successfully:`, result.messageId);
  } catch (error) {
    console.error(`Failed to send ${errorContext}:`, error);
  }
};

export async function PUT(request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user || (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.Developer)) {
    return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
  }

  const { id: subscriptionId } = params; // Extract id and rename to subscriptionId
  let rejectionReason: string | undefined;

  try {
    const body = await request.json().catch(() => ({})); 
    rejectionReason = body.reason;
  } catch {
    // Ignore if body is not valid JSON or doesn't exist
  }

  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { 
        plan: true, 
        user: { 
          select: { 
            email: true, 
            name: true,
            firstName: true 
          } 
        } 
      },
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

    // Send email notification to user about subscription rejection
    const firstName = subscription.user.firstName || subscription.user.name || 'User';
    await sendEmailSafely(
      emailService.sendSubscriptionRejectionEmail(
        subscription.user.email,
        firstName,
        subscription.plan.name,
        rejectionReason
      ),
      'subscription rejection email'
    );
    
    console.log(`Subscription ${subscriptionId} for user ${subscription.user.email} rejected.`, rejectionReason ? `Reason: ${rejectionReason}` : '');

    return NextResponse.json({ 
      message: 'Subscription payment rejected successfully.', 
      subscription: updatedSubscription 
    });
  } catch (error) {
    console.error(`Error rejecting subscription ${subscriptionId}:`, error);
    return NextResponse.json({ error: 'Failed to reject subscription' }, { status: 500 });
  }
}
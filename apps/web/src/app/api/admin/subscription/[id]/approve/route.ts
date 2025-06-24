import { NextResponse } from 'next/server';
import  prisma  from '@/lib/prisma';
import { auth } from '@/auth';
import { UserRole, SubscriptionStatus, PaymentStatus, PaymentMethod } from '@prisma/client';
import { addDays } from 'date-fns';
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
        return NextResponse.json({ error: 'Subscription is already active and paid.' }, { status: 400 });
    }

    // Check payment proof requirement based on payment method
    if (subscription.paymentMethod === PaymentMethod.BANK_TRANSFER && !subscription.paymentProof) {
        return NextResponse.json({ error: 'Payment proof is required for Bank Transfer payments.' }, { status: 400 });
    }

    const now = new Date();
    const endDate = addDays(now, subscription.plan.duration);
    
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: SubscriptionStatus.ACTIVE,
        paymentStatus: PaymentStatus.COMPLETED,
        startDate: now, // Payment confirmed, subscription starts now
        endDate: endDate,
        updatedAt: now,
      },
    });

    // Send email notification to user about subscription activation
    const firstName = subscription.user.firstName || subscription.user.name || 'User';
    await sendEmailSafely(
      emailService.sendSubscriptionActivationEmail(
        subscription.user.email, 
        firstName, 
        subscription.plan.name,
        now,
        endDate
      ),
      'subscription activation email'
    );

    console.log(`Subscription ${subscriptionId} for user ${subscription.user.email} approved and activated.`);

    return NextResponse.json({ 
      message: 'Subscription approved and activated successfully.', 
      subscription: updatedSubscription 
    });
  } catch (error) {
    console.error(`Error approving subscription ${subscriptionId}:`, error);
    return NextResponse.json({ error: 'Failed to approve subscription' }, { status: 500 });
  }
}
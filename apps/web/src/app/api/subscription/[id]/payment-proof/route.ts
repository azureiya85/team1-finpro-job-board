import { NextResponse } from 'next/server';
import  prisma  from '@/lib/prisma';
import { auth } from '@/auth';
import { UploadPaymentProofSchema, UploadPaymentProofInput } from '@/lib/validations/zodSubscriptionValidation';
import { PaymentStatus, SubscriptionStatus, PaymentMethod } from '@prisma/client';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let rawBody;
  try {
    rawBody = await request.json();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const validation = UploadPaymentProofSchema.safeParse(rawBody);
  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid input', details: validation.error.formErrors }, { status: 400 });
  }

  const { subscriptionId, paymentProofUrl }: UploadPaymentProofInput = validation.data;
  const userId = session.user.id;

  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    if (subscription.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden: You do not own this subscription' }, { status: 403 });
    }

    if (subscription.paymentMethod !== PaymentMethod.BANK_TRANSFER) {
        return NextResponse.json({ error: 'Payment proof is only for Bank Transfer method.' }, { status: 400 });
    }
    
    if (subscription.status !== SubscriptionStatus.PENDING || subscription.paymentStatus !== PaymentStatus.PENDING) {
        return NextResponse.json({ error: 'Payment proof can only be uploaded for pending bank transfer subscriptions.' }, { status: 400 });
    }

    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        paymentProof: paymentProofUrl,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ message: 'Payment proof uploaded successfully. Awaiting admin approval.', subscription: updatedSubscription });
  } catch (error) {
    console.error('Error uploading payment proof:', error);
    return NextResponse.json({ error: 'Failed to upload payment proof' }, { status: 500 });
  }
}
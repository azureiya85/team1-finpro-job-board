import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { snap } from '@/lib/midtrans';
import { SubscriptionStatus, PaymentStatus, PaymentMethod } from '@prisma/client';
import { addDays } from 'date-fns';
import { MidtransTransactionParameters } from '@/types/subscription';

interface MidtransTransactionResponse {
  token: string;
  redirect_url: string;
  qr_code?: string;
  qr_string?: string;
  va_numbers?: Array<{
    va_number: string;
    bank: string;
  }>;
}

interface RenewalRequest {
  paymentMethod: PaymentMethod;
}

// POST - Renew subscription
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

  let requestBody: RenewalRequest;
  try {
    requestBody = await request.json();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { paymentMethod } = requestBody;

  if (!paymentMethod || !Object.values(PaymentMethod).includes(paymentMethod)) {
    return NextResponse.json({ error: 'Valid payment method is required' }, { status: 400 });
  }

  try {
    // Find the subscription to renew
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

    // Check if subscription can be renewed
    const now = new Date();
    const canRenew = 
      subscription.status === SubscriptionStatus.EXPIRED ||
      subscription.status === SubscriptionStatus.CANCELLED ||
      (subscription.status === SubscriptionStatus.ACTIVE && subscription.endDate <= addDays(now, 7)); // Allow renewal 7 days before expiry

    if (!canRenew) {
      return NextResponse.json({ 
        error: 'Subscription cannot be renewed at this time. Active subscriptions can only be renewed 7 days before expiry.' 
      }, { status: 400 });
    }

    // Check for existing pending renewal
    const existingPendingRenewal = await prisma.subscription.findFirst({
      where: {
        userId,
        planId: subscription.planId,
        status: SubscriptionStatus.PENDING,
        createdAt: { gt: subscription.createdAt }, // Created after original subscription
      }
    });

    if (existingPendingRenewal) {
      return NextResponse.json({ 
        error: 'You already have a pending renewal for this subscription plan.' 
      }, { status: 409 });
    }

    // Create new subscription for renewal
    const renewalStartDate = subscription.status === SubscriptionStatus.ACTIVE && subscription.endDate > now 
      ? subscription.endDate 
      : now;

    const renewalData = {
      userId,
      planId: subscription.planId,
      startDate: renewalStartDate,
      endDate: addDays(renewalStartDate, subscription.plan.duration),
      status: SubscriptionStatus.PENDING,
      paymentMethod,
      paymentStatus: PaymentStatus.PENDING,
      isRenewal: true, 
      originalSubscriptionId: subscriptionId, 
    };

    const renewalSubscription = await prisma.subscription.create({ data: renewalData });

    // Handle payment processing
    const midtransPaymentMethods = new Set<PaymentMethod>([
      PaymentMethod.PAYMENT_GATEWAY,
      PaymentMethod.MIDTRANS_BCA_VA,
      PaymentMethod.MIDTRANS_QRIS,
      PaymentMethod.CREDIT_CARD,
      PaymentMethod.E_WALLET,
    ]);

    if (midtransPaymentMethods.has(paymentMethod)) {
      const parameter: MidtransTransactionParameters = {
        transaction_details: {
          order_id: renewalSubscription.id,
          gross_amount: subscription.plan.price,
        },
        customer_details: {
          first_name: session.user.name?.split(' ')[0] || 'User',
          last_name: session.user.name?.split(' ').slice(1).join(' ') || '',
          email: session.user.email || '',
        },
        item_details: [{
          id: subscription.plan.id,
          price: subscription.plan.price,
          quantity: 1,
          name: `${subscription.plan.name} - Renewal`,
          merchant_name: "WorkVault"
        }],
        callbacks: {
          finish: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?status=success&order_id=${renewalSubscription.id}&type=renewal`,
          error: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?status=error&order_id=${renewalSubscription.id}&type=renewal`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?status=pending&order_id=${renewalSubscription.id}&type=renewal`,
        },
      };

      // Set payment method specific options
      if (paymentMethod === PaymentMethod.MIDTRANS_BCA_VA) {
        parameter.enabled_payments = ["bca_va"];
      } else if (paymentMethod === PaymentMethod.MIDTRANS_QRIS) {
        parameter.enabled_payments = ["gopay", "shopeepay", "qris"];
      } else if (paymentMethod === PaymentMethod.CREDIT_CARD) {
        parameter.enabled_payments = ["credit_card"];
      }

      try {
        const transaction = await snap.createTransaction(parameter) as MidtransTransactionResponse;
        
        return NextResponse.json({
          message: 'Subscription renewal initiated successfully.',
          renewalSubscriptionId: renewalSubscription.id,
          originalSubscriptionId: subscriptionId,
          midtrans: {
            token: transaction.token,
            redirect_url: transaction.redirect_url,
            order_id: renewalSubscription.id,
            payment_type: paymentMethod,
            qr_string: transaction.qr_code || transaction.qr_string || null,
            va_number: transaction.va_numbers?.[0]?.va_number ?? null,
            bank: transaction.va_numbers?.[0]?.bank ?? null
          }
        });
      } catch (midtransError) {
        await prisma.subscription.delete({ where: { id: renewalSubscription.id } });
        return NextResponse.json({
          error: 'Failed to create payment transaction for renewal',
          details: midtransError instanceof Error ? midtransError.message : 'Unknown Midtrans error'
        }, { status: 502 });
      }

    } else if (paymentMethod === PaymentMethod.BANK_TRANSFER) {
      return NextResponse.json({
        message: 'Subscription renewal pending. Please complete the bank transfer and upload proof.',
        renewalSubscriptionId: renewalSubscription.id,
        originalSubscriptionId: subscriptionId,
        paymentDetails: {
          bankName: process.env.BANK_NAME || "Bank Central Asia (BCA)",
          accountNumber: process.env.BANK_ACCOUNT_NUMBER || "1234567890",
          accountHolder: process.env.BANK_ACCOUNT_HOLDER || "PT WorkVault Global",
          amount: subscription.plan.price,
          uniqueCode: renewalSubscription.id.slice(-5).toUpperCase(),
          instructions: `Please transfer IDR ${subscription.plan.price} to the account above for subscription renewal. Include the unique code ${renewalSubscription.id.slice(-5).toUpperCase()} in your transfer description.`
        }
      });
    } else {
      // Clean up invalid renewal subscription
      await prisma.subscription.delete({ where: { id: renewalSubscription.id } });
      return NextResponse.json({ error: 'Unsupported payment method for renewal' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error processing subscription renewal:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const statusCode = errorMessage.includes("Midtrans API error") ? 502 : 500;
    return NextResponse.json({
      error: 'Failed to process subscription renewal',
      details: errorMessage
    }, { status: statusCode });
  }
}

// GET - Check renewal eligibility
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

    const now = new Date();
    const daysUntilExpiry = Math.ceil((subscription.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    const canRenew = 
      subscription.status === SubscriptionStatus.EXPIRED ||
      subscription.status === SubscriptionStatus.CANCELLED ||
      (subscription.status === SubscriptionStatus.ACTIVE && daysUntilExpiry <= 7);

    const eligibilityReason = !canRenew 
      ? 'Active subscriptions can only be renewed 7 days before expiry'
      : null;

    // Check for existing pending renewal
    const existingPendingRenewal = await prisma.subscription.findFirst({
      where: {
        userId,
        planId: subscription.planId,
        status: SubscriptionStatus.PENDING,
        createdAt: { gt: subscription.createdAt },
      }
    });

    return NextResponse.json({
      subscription,
      renewalEligibility: {
        canRenew: canRenew && !existingPendingRenewal,
        reason: existingPendingRenewal 
          ? 'You already have a pending renewal for this subscription'
          : eligibilityReason,
        daysUntilExpiry,
        hasExistingPendingRenewal: !!existingPendingRenewal,
        existingPendingRenewalId: existingPendingRenewal?.id || null,
      }
    });

  } catch (error) {
    console.error('Error checking renewal eligibility:', error);
    return NextResponse.json({ 
      error: 'Failed to check renewal eligibility',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
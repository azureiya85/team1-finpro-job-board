import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { snap } from '@/lib/midtrans';
import { SubscriptionCheckoutSchema, SubscriptionCheckoutInput } from '@/lib/validations/zodSubscriptionValidation';
import { PaymentMethod, PaymentStatus, SubscriptionStatus } from '@prisma/client';
import { addDays } from 'date-fns';

// GET user's subscriptions
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // First try to get active subscription
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
        endDate: {
          gt: new Date(), // Ensure it's not expired
        },
      },
      include: {
        plan: true, // Include plan details
      },
      orderBy: {
        createdAt: 'desc', // Get the latest active one if multiple somehow exist
      }
    });

    if (activeSubscription) {
      return NextResponse.json(activeSubscription);
    }

    // Find the latest pending or expired if no active one
    const latestSubscription = await prisma.subscription.findFirst({
      where: { userId },
      include: { plan: true },
      orderBy: { createdAt: 'desc' }
    });
    
    if (latestSubscription) {
      return NextResponse.json(latestSubscription); 
    }

    return NextResponse.json({ message: "No subscription found for this user." }, { status: 404 });

  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return NextResponse.json({ error: 'Failed to fetch user subscription' }, { status: 500 });
  }
}

// POST new subscription (create + checkout)
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch (error) {
    console.error('JSON parsing error:', error);
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  
  const validation = SubscriptionCheckoutSchema.safeParse(rawBody);
  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid input', details: validation.error.formErrors }, { status: 400 });
  }

  const { planId, paymentMethod }: SubscriptionCheckoutInput = validation.data;
  const userId = session.user.id;

  try {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json({ error: 'Subscription plan not found' }, { status: 404 });
    }

    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PENDING] },
        endDate: { gt: new Date() } // Check if it's not already expired
      }
    });

    if (existingSubscription && existingSubscription.planId === planId && existingSubscription.status === SubscriptionStatus.PENDING) {
      return NextResponse.json({ error: 'You already have a pending subscription for this plan. Please complete or cancel it.' }, { status: 409 });
    }
    if (existingSubscription && existingSubscription.status === SubscriptionStatus.ACTIVE) {
      return NextResponse.json({ error: 'You already have an active subscription.' }, { status: 409 });
    }

    // Create a new subscription record with PENDING status
    const newSubscription = await prisma.subscription.create({
      data: {
        userId,
        planId,
        startDate: new Date(), 
        endDate: addDays(new Date(), plan.duration), 
        status: SubscriptionStatus.PENDING,
        paymentMethod,
        paymentStatus: PaymentStatus.PENDING,
      },
    });

    if (paymentMethod === PaymentMethod.PAYMENT_GATEWAY) {
      const parameter = {
        transaction_details: {
          order_id: newSubscription.id, 
          gross_amount: plan.price,
        },
        customer_details: {
          first_name: session.user.name?.split(' ')[0] || 'User',
          last_name: session.user.name?.split(' ').slice(1).join(' ') || '',
          email: session.user.email || '',
        },
        item_details: [{
          id: plan.id,
          price: plan.price,
          quantity: 1,
          name: plan.name,
          merchant_name: "WorkVault" 
        }],
        callbacks: {
          finish: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?status=success&order_id=${newSubscription.id}`, 
          error: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?status=error&order_id=${newSubscription.id}`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?status=pending&order_id=${newSubscription.id}`,
        },
      };

      try {
        const transaction = await snap.createTransaction(parameter);
        
        return NextResponse.json({ 
          message: 'Checkout initiated with Payment Gateway.',
          subscriptionId: newSubscription.id,
          midtransToken: transaction.token,
          midtransRedirectUrl: transaction.redirect_url, 
        });
      } catch (midtransError) {
        console.error('Midtrans transaction error:', midtransError);
        // Rollback the subscription if Midtrans fails
        await prisma.subscription.delete({ where: { id: newSubscription.id } });
        return NextResponse.json({ 
          error: 'Failed to create payment transaction', 
          details: midtransError instanceof Error ? midtransError.message : 'Unknown Midtrans error'
        }, { status: 502 });
      }

    } else if (paymentMethod === PaymentMethod.BANK_TRANSFER) {
      return NextResponse.json({
        message: 'Subscription pending. Please complete the bank transfer and upload proof.',
        subscriptionId: newSubscription.id,
        paymentDetails: { 
          bankName: "Bank Central Asia (BCA)",
          accountNumber: "1234567890",
          accountHolder: "PT WorkVault Global",
          amount: plan.price,
          uniqueCode: newSubscription.id.slice(-5).toUpperCase(), 
          instructions: `Please transfer IDR ${plan.price} to the account above. Include the unique code ${newSubscription.id.slice(-5).toUpperCase()} in your transfer description.`
        }
      });
    } else {
      await prisma.subscription.delete({ where: {id: newSubscription.id}}); // Rollback
      return NextResponse.json({ error: 'Unsupported payment method selected' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error during subscription checkout:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    let statusCode = 500;
    
    if (errorMessage.includes("Midtrans API error")) {
      statusCode = 502; // Bad Gateway if Midtrans fails
    }

    return NextResponse.json({ 
      error: 'Failed to initiate subscription checkout', 
      details: errorMessage 
    }, { status: statusCode });
  }
}
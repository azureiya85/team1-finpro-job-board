import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { snap } from '@/lib/midtrans';
import { SubscriptionCheckoutSchema, SubscriptionCheckoutInput } from '@/lib/validations/zodSubscriptionValidation';
import { PaymentMethod, PaymentStatus, SubscriptionStatus } from '@prisma/client';
import { addDays } from 'date-fns';
import { MidtransTransactionParameters } from '@/types/subscription';

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
  console.log('=== POST /api/subscription started ===');
  
  const session = await auth();
  console.log('Session check:', { hasSession: !!session, userId: session?.user?.id });
  
  if (!session?.user?.id) {
    console.log('Unauthorized: No session or user ID');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  let validatedData: SubscriptionCheckoutInput;
  let paymentProofFile: File | null = null;

  const contentType = request.headers.get('content-type');
  console.log('Content-Type received:', contentType);

  // Log all headers for debugging
  console.log('Request headers:', Object.fromEntries(request.headers.entries()));

  if (contentType?.includes('multipart/form-data')) {
    console.log('Processing multipart/form-data request');
    
    try {
      const formData = await request.formData();
      
      // Log all form data entries
      console.log('FormData entries:');
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: File(name=${value.name}, size=${value.size}, type=${value.type})`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }
      
      const planId = formData.get('planId') as string;
      const paymentMethodString = formData.get('paymentMethod') as string;
      const proof = formData.get('proof');

      console.log('Extracted from FormData:', { 
        planId, 
        planIdType: typeof planId,
        planIdLength: planId?.length,
        paymentMethodString,
        paymentMethodType: typeof paymentMethodString,
        hasProof: !!proof 
      });

      // Validate planId format (CUID should be 25 characters starting with 'c')
      if (planId) {
        console.log('PlanId validation:', {
          length: planId.length,
          startsWithC: planId.startsWith('c'),
          isCuidFormat: /^c[a-z0-9]{24}$/.test(planId)
        });
      }

      // Validate PaymentMethod enum
      const validPaymentMethods = Object.values(PaymentMethod);
      console.log('Payment method validation:', {
        received: paymentMethodString,
        validOptions: validPaymentMethods,
        isValid: validPaymentMethods.includes(paymentMethodString as PaymentMethod)
      });

      if (proof instanceof File) {
        paymentProofFile = proof;
      }
      
      const dataToValidate = {
        planId,
        paymentMethod: paymentMethodString as PaymentMethod, 
      };

      console.log('Data being validated:', dataToValidate);

      const validation = SubscriptionCheckoutSchema.safeParse(dataToValidate);
      
      if (!validation.success) {
        console.error('=== VALIDATION FAILED ===');
        console.error('Validation errors:', JSON.stringify(validation.error.issues, null, 2));
        console.error('Data that failed validation:', dataToValidate);
        
        return NextResponse.json({ 
          error: 'Invalid form data input', 
          details: validation.error.issues,
          received: dataToValidate,
          validPaymentMethods: Object.values(PaymentMethod)
        }, { status: 400 });
      }
      
      console.log('FormData validation successful:', validation.data);
      validatedData = validation.data;

    } catch (error) {
      console.error('FormData parsing error:', error);
      return NextResponse.json({ 
        error: 'Invalid FormData',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 400 });
    }
    
  } else if (contentType?.includes('application/json')) {
    console.log('Processing application/json request');
    
    try {
      const rawBody = await request.json();
      console.log('Raw JSON body:', rawBody);
      console.log('JSON body type check:', {
        planId: { value: rawBody.planId, type: typeof rawBody.planId },
        paymentMethod: { value: rawBody.paymentMethod, type: typeof rawBody.paymentMethod }
      });
      
      // Validate planId format if present
      if (rawBody.planId) {
        console.log('PlanId validation:', {
          length: rawBody.planId.length,
          startsWithC: rawBody.planId.startsWith('c'),
          isCuidFormat: /^c[a-z0-9]{24}$/.test(rawBody.planId)
        });
      }

      // Validate PaymentMethod enum
      const validPaymentMethods = Object.values(PaymentMethod);
      console.log('Payment method validation:', {
        received: rawBody.paymentMethod,
        validOptions: validPaymentMethods,
        isValid: validPaymentMethods.includes(rawBody.paymentMethod)
      });
      
      const validation = SubscriptionCheckoutSchema.safeParse(rawBody);
      
      if (!validation.success) {
        console.error('=== VALIDATION FAILED ===');
        console.error('Validation errors:', JSON.stringify(validation.error.issues, null, 2));
        console.error('Data that failed validation:', rawBody);
        
        return NextResponse.json({ 
          error: 'Invalid JSON input', 
          details: validation.error.issues,
          received: rawBody,
          validPaymentMethods: Object.values(PaymentMethod)
        }, { status: 400 });
      }
      
      console.log('JSON validation successful:', validation.data);
      validatedData = validation.data;
      
    } catch (error) {
      console.error('JSON parsing error:', error);
      return NextResponse.json({ 
        error: 'Invalid JSON body',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 400 });
    }
    
  } else {
    console.log('Unsupported content type:', contentType);
    return NextResponse.json({ error: 'Unsupported Content-Type' }, { status: 415 });
  }

  const { planId, paymentMethod } = validatedData;
  console.log('Final validated data:', { planId, paymentMethod });

  try {
    console.log('Looking up subscription plan:', planId);
    
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      console.log('Subscription plan not found for ID:', planId);
      
      // Debug: List all available plans
      const allPlans = await prisma.subscriptionPlan.findMany({
        select: { id: true, name: true }
      });
      console.log('Available plans:', allPlans);
      
      return NextResponse.json({ 
        error: 'Subscription plan not found',
        planId,
        availablePlans: allPlans
      }, { status: 404 });
    }

    console.log('Found plan:', { id: plan.id, name: plan.name, price: plan.price });

    console.log('Checking for existing subscriptions for user:', userId);
    
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PENDING] },
        endDate: { gt: new Date() } 
      }
    });

    if (existingSubscription) {
      console.log('Found existing subscription:', {
        id: existingSubscription.id,
        status: existingSubscription.status,
        planId: existingSubscription.planId
      });
    }
  
    if (existingSubscription && existingSubscription.planId === planId && existingSubscription.status === SubscriptionStatus.PENDING) {
      return NextResponse.json({ error: 'You already have a pending subscription for this plan. Please complete or cancel it.' }, { status: 409 });
    }
    if (existingSubscription && existingSubscription.status === SubscriptionStatus.ACTIVE) {
      return NextResponse.json({ error: 'You already have an active subscription.' }, { status: 409 });
    }

    console.log('Creating new subscription...');

    const paymentProofUrl: string | undefined = undefined; 
    if (paymentMethod === PaymentMethod.BANK_TRANSFER && paymentProofFile) {
      console.warn("Bank Transfer proof file received, but file upload to storage not implemented in this example.");
    }

    const subscriptionData = {
      userId,
      planId,
      startDate: new Date(),
      endDate: addDays(new Date(), plan.duration),
      status: SubscriptionStatus.PENDING,
      paymentMethod,
      paymentStatus: PaymentStatus.PENDING,
      paymentProof: paymentProofUrl, 
    };
    
    console.log('Creating subscription with data:', subscriptionData);

    const newSubscription = await prisma.subscription.create({
      data: subscriptionData,
    });

    console.log('New subscription created:', {
      id: newSubscription.id,
      status: newSubscription.status,
      paymentMethod: newSubscription.paymentMethod
    });

      const midtransPaymentMethodsSet = new Set<PaymentMethod>([ 
      PaymentMethod.PAYMENT_GATEWAY,
      PaymentMethod.MIDTRANS_BCA_VA,
      PaymentMethod.MIDTRANS_QRIS,
      PaymentMethod.CREDIT_CARD,
      PaymentMethod.E_WALLET,
    ]);

    if (midtransPaymentMethodsSet.has(paymentMethod)) {
      console.log('Processing Midtrans payment for method:', paymentMethod);
      
      const parameter: MidtransTransactionParameters = {
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

      if (paymentMethod === PaymentMethod.MIDTRANS_BCA_VA) {
        parameter.enabled_payments = ["bca_va"];
      } else if (paymentMethod === PaymentMethod.MIDTRANS_QRIS) {
        parameter.enabled_payments = ["gopay", "shopeepay", "qris"];
      } else if (paymentMethod === PaymentMethod.CREDIT_CARD) {
        parameter.enabled_payments = ["credit_card"];
      }
      console.log('Midtrans parameter:', JSON.stringify(parameter, null, 2));

      try {
        const transaction = await snap.createTransaction(parameter);
        console.log('Midtrans transaction created successfully');
        
        return NextResponse.json({
          message: 'Checkout initiated with Payment Gateway.',
          subscriptionId: newSubscription.id,
          midtransToken: transaction.token,
          midtransRedirectUrl: transaction.redirect_url,
        });
      } catch (midtransError) {
        console.error('Midtrans transaction error:', midtransError);
        await prisma.subscription.delete({ where: { id: newSubscription.id } });
        return NextResponse.json({
          error: 'Failed to create payment transaction',
          details: midtransError instanceof Error ? midtransError.message : 'Unknown Midtrans error'
        }, { status: 502 });
      }

    } else if (paymentMethod === PaymentMethod.BANK_TRANSFER) {
      console.log('Processing bank transfer payment');
      
      return NextResponse.json({
        message: paymentProofFile ? 'Subscription pending, proof received (awaiting verification).' : 'Subscription pending. Please complete the bank transfer and upload proof.',
        subscriptionId: newSubscription.id,
        paymentDetails: {
          bankName: process.env.BANK_NAME || "Bank Central Asia (BCA)",
          accountNumber: process.env.BANK_ACCOUNT_NUMBER || "1234567890",
          accountHolder: process.env.BANK_ACCOUNT_HOLDER || "PT WorkVault Global",
          amount: plan.price,
          uniqueCode: newSubscription.id.slice(-5).toUpperCase(),
          instructions: `Please transfer IDR ${plan.price} to the account above. Include the unique code ${newSubscription.id.slice(-5).toUpperCase()} in your transfer description.`
        }
      });
    } else {
      console.log('Unsupported payment method, deleting subscription:', paymentMethod);
      await prisma.subscription.delete({ where: { id: newSubscription.id }});
      return NextResponse.json({ error: 'Unsupported payment method selected (this should not happen)' }, { status: 400 });
    }

  } catch (error) {
    console.error('=== DATABASE OR PROCESSING ERROR ===');
    console.error('Error during subscription checkout:', error);
    
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    let statusCode = 500;
    
    if (errorMessage.includes("Midtrans API error")) {
      statusCode = 502;
    }

    return NextResponse.json({ 
      error: 'Failed to initiate subscription checkout', 
      details: errorMessage 
    }, { status: statusCode });
  }
}
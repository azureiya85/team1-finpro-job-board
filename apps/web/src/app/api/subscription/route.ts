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
   const activeSubscription = await prisma.subscription.findFirst({
     where: {
       userId,
       status: SubscriptionStatus.ACTIVE,
       endDate: { gt: new Date() },
     },
     include: { plan: true },
     orderBy: { createdAt: 'desc' }
   });


   if (activeSubscription) {
     return NextResponse.json(activeSubscription);
   }


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


 const userId = session.user.id;
 let validatedData: SubscriptionCheckoutInput;
 let paymentProofFile: File | null = null;
 const contentType = request.headers.get('content-type');


 if (contentType?.includes('multipart/form-data')) {
   try {
     const formData = await request.formData();
     const planId = formData.get('planId') as string;
     const paymentMethodString = formData.get('paymentMethod') as string;
     const proof = formData.get('proof');
     if (proof instanceof File) paymentProofFile = proof;


     const validation = SubscriptionCheckoutSchema.safeParse({
       planId,
       paymentMethod: paymentMethodString as PaymentMethod,
     });


     if (!validation.success) {
       return NextResponse.json({ error: 'Invalid form data input' }, { status: 400 });
     }


     validatedData = validation.data;
   } catch (error) {
     return NextResponse.json({ error: 'Invalid FormData' }, { status: 400 });
   }


 } else if (contentType?.includes('application/json')) {
   try {
     const rawBody = await request.json();
     const validation = SubscriptionCheckoutSchema.safeParse(rawBody);
     if (!validation.success) {
       return NextResponse.json({ error: 'Invalid JSON input' }, { status: 400 });
     }
     validatedData = validation.data;
   } catch (error) {
     return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
   }
 } else {
   return NextResponse.json({ error: 'Unsupported Content-Type' }, { status: 415 });
 }


 const { planId, paymentMethod } = validatedData;


 try {
   const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
   if (!plan) {
     return NextResponse.json({ error: 'Subscription plan not found' }, { status: 404 });
   }


   const existingSubscription = await prisma.subscription.findFirst({
     where: {
       userId,
       status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PENDING] },
       endDate: { gt: new Date() }
     }
   });


   if (existingSubscription && existingSubscription.planId === planId && existingSubscription.status === SubscriptionStatus.PENDING) {
     return NextResponse.json({ error: 'You already have a pending subscription for this plan.' }, { status: 409 });
   }


   if (existingSubscription && existingSubscription.status === SubscriptionStatus.ACTIVE) {
     return NextResponse.json({ error: 'You already have an active subscription.' }, { status: 409 });
   }


   const subscriptionData = {
     userId,
     planId,
     startDate: new Date(),
     endDate: addDays(new Date(), plan.duration),
     status: SubscriptionStatus.PENDING,
     paymentMethod,
     paymentStatus: PaymentStatus.PENDING,
     paymentProof: undefined,
   };


   const newSubscription = await prisma.subscription.create({ data: subscriptionData });


   const midtransPaymentMethodsSet = new Set<PaymentMethod>([
     PaymentMethod.PAYMENT_GATEWAY,
     PaymentMethod.MIDTRANS_BCA_VA,
     PaymentMethod.MIDTRANS_QRIS,
     PaymentMethod.CREDIT_CARD,
     PaymentMethod.E_WALLET,
   ]);


   if (midtransPaymentMethodsSet.has(paymentMethod)) {
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


     try {
       const transaction = await snap.createTransaction(parameter);
       return NextResponse.json({
         message: 'Checkout initiated with Payment Gateway.',
         subscriptionId: newSubscription.id,
         midtrans: {
           token: transaction.token,
           redirect_url: transaction.redirect_url,
           order_id: newSubscription.id,
           payment_type: paymentMethod,
           qr_string: (transaction as any).qr_code || (transaction as any).qr_string || null,
           va_number: (transaction as any).va_numbers?.[0]?.va_number ?? null,
           bank: (transaction as any).va_numbers?.[0]?.bank ?? null
         }
       });
     } catch (midtransError) {
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
         bankName: process.env.BANK_NAME || "Bank Central Asia (BCA)",
         accountNumber: process.env.BANK_ACCOUNT_NUMBER || "1234567890",
         accountHolder: process.env.BANK_ACCOUNT_HOLDER || "PT WorkVault Global",
         amount: plan.price,
         uniqueCode: newSubscription.id.slice(-5).toUpperCase(),
         instructions: `Please transfer IDR ${plan.price} to the account above. Include the unique code ${newSubscription.id.slice(-5).toUpperCase()} in your transfer description.`
       }
     });
   } else {
     await prisma.subscription.delete({ where: { id: newSubscription.id } });
     return NextResponse.json({ error: 'Unsupported payment method selected' }, { status: 400 });
   }


 } catch (error) {
   const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
   const statusCode = errorMessage.includes("Midtrans API error") ? 502 : 500;
   return NextResponse.json({
     error: 'Failed to initiate subscription checkout',
     details: errorMessage
   }, { status: statusCode });
 }
}

import { NextResponse } from 'next/server';
import  prisma  from '@/lib/prisma'; 
import { coreApi, verifyMidtransSignature } from '@/lib/midtrans';
import { MidtransNotificationSchema, MidtransNotificationInput } from '@/lib/validations/zodSubscriptionValidation'; 
import { SubscriptionStatus, PaymentStatus, Prisma } from '@prisma/client'; 
import { addDays } from 'date-fns';

export async function POST(request: Request) {
  let notificationJson: MidtransNotificationInput;
  try {
    const rawBody = await request.json();
    const validation = MidtransNotificationSchema.safeParse(rawBody);
    if (!validation.success) {
      console.warn('Midtrans Webhook: Invalid notification format', validation.error.formErrors);
      return NextResponse.json({ error: 'Invalid notification format' }, { status: 400 });
    }
    notificationJson = validation.data;
  } catch (error) {
    console.error('Midtrans Webhook: Error parsing JSON', error);
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const {
    order_id: subscriptionId,
    transaction_status,
    transaction_id,
    fraud_status,
    status_code, 
    gross_amount,
    signature_key
  } = notificationJson;

  console.log(`Midtrans Webhook: Received notification for order_id: ${subscriptionId}, status: ${transaction_status}, transaction_id: ${transaction_id}`);

  // 1. Verify signature using the status_code from the notification
  const serverKey = process.env.MIDTRANS_SERVER_KEY!;
  if (!verifyMidtransSignature(subscriptionId, status_code, gross_amount, serverKey, signature_key)) {
    console.warn(`Midtrans Webhook: Signature verification failed for order_id: ${subscriptionId}`);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
  }
  console.log(`Midtrans Webhook: Signature verified for order_id: ${subscriptionId}`);

  // 2. Initialize authoritative values from the notification
  let authoritativeTransactionStatus = transaction_status;
  let authoritativeFraudStatus = fraud_status;
  let authoritativeTransactionId = transaction_id;

  try {
    const midtransStatusResponse = await coreApi.transaction.status(subscriptionId);
    console.log("Midtrans API Status Response:", midtransStatusResponse);
    if (midtransStatusResponse.transaction_id && midtransStatusResponse.transaction_id !== authoritativeTransactionId) {
        console.warn(`Midtrans Webhook: Discrepancy in transaction_id for order_id: ${subscriptionId}. Notification: ${authoritativeTransactionId}, API: ${midtransStatusResponse.transaction_id}. Using API's.`);
        authoritativeTransactionId = midtransStatusResponse.transaction_id;
    }
    if (midtransStatusResponse.transaction_status && midtransStatusResponse.transaction_status !== authoritativeTransactionStatus) {
        console.warn(`Midtrans Webhook: Discrepancy in transaction_status for order_id: ${subscriptionId}. Notification: ${authoritativeTransactionStatus}, API: ${midtransStatusResponse.transaction_status}. Using API's.`);
        authoritativeTransactionStatus = midtransStatusResponse.transaction_status;
    }
    if (midtransStatusResponse.fraud_status && midtransStatusResponse.fraud_status !== authoritativeFraudStatus) {
        console.warn(`Midtrans Webhook: Discrepancy in fraud_status for order_id: ${subscriptionId}. Notification: ${authoritativeFraudStatus}, API: ${midtransStatusResponse.fraud_status}. Using API's.`);
        authoritativeFraudStatus = midtransStatusResponse.fraud_status;
    }

    console.log(`Midtrans Webhook: Authoritative status for order_id: ${subscriptionId} is transaction_status: ${authoritativeTransactionStatus}, fraud_status: ${authoritativeFraudStatus}, transaction_id: ${authoritativeTransactionId}`);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Midtrans Webhook: Failed to get transaction status from Midtrans API for order_id: ${subscriptionId}`, errorMessage);
    console.warn(`Midtrans Webhook: Proceeding with potentially unverified notification data for order_id: ${subscriptionId} due to API status check failure.`);
  }


  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true, user: { select: { email: true, name: true }} },
    });

    if (!subscription) {
      console.warn(`Midtrans Webhook: Subscription with ID ${subscriptionId} not found.`);
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    if ((authoritativeTransactionStatus === 'capture' || authoritativeTransactionStatus === 'settlement') &&
        subscription.status === SubscriptionStatus.ACTIVE &&
        subscription.paymentStatus === PaymentStatus.COMPLETED) {
        console.log(`Midtrans Webhook: Subscription ${subscriptionId} is already active and paid. No update needed for status: ${authoritativeTransactionStatus}.`);
        return NextResponse.json({ message: 'Webhook received. No update needed for already completed subscription.' }, { status: 200 });
    }

    const expectedAmount = subscription.plan.price;
    if (parseFloat(gross_amount) !== expectedAmount) {
        console.warn(`Midtrans Webhook: Amount mismatch for order_id ${subscriptionId}. Expected: ${expectedAmount}, Notification Got: ${gross_amount}.`);
    }

    let updatedData: Prisma.SubscriptionUpdateInput = {
      updatedAt: new Date(),
      transactionId: authoritativeTransactionId || subscription.transactionId,
    };

    if (authoritativeTransactionStatus === 'capture' || authoritativeTransactionStatus === 'settlement') {
      if (authoritativeFraudStatus === 'accept' || authoritativeFraudStatus === 'challenge' || !authoritativeFraudStatus) {
        const now = new Date();
        updatedData = {
          ...updatedData,
          status: SubscriptionStatus.ACTIVE,
          paymentStatus: PaymentStatus.COMPLETED,
          startDate: subscription.status !== SubscriptionStatus.ACTIVE ? now : subscription.startDate,
          endDate: subscription.status !== SubscriptionStatus.ACTIVE ? addDays(now, subscription.plan.duration) : subscription.endDate,
        };
        console.log(`Subscription ${subscriptionId} for user ${subscription.user.email} activated via Midtrans.`);
        // TODO: Send email
      } else if (authoritativeFraudStatus === 'deny') {
        updatedData = {
          ...updatedData,
          status: SubscriptionStatus.CANCELLED,
          paymentStatus: PaymentStatus.FAILED,
        };
        console.log(`Subscription ${subscriptionId} for user ${subscription.user.email} denied due to fraud status via Midtrans.`);
        // TODO: Send email
      }
    } else if (authoritativeTransactionStatus === 'pending') {
      updatedData = {
        ...updatedData,
        status: SubscriptionStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
      };
    } else if (authoritativeTransactionStatus === 'cancel' || authoritativeTransactionStatus === 'expire' || authoritativeTransactionStatus === 'deny') {
      updatedData = {
        ...updatedData,
        status: SubscriptionStatus.CANCELLED,
        paymentStatus: PaymentStatus.FAILED,
      };
      console.log(`Subscription ${subscriptionId} for user ${subscription.user.email} ${authoritativeTransactionStatus} via Midtrans.`);
      // TODO: Send email
    } else {
        console.log(`Midtrans Webhook: Unhandled authoritative_transaction_status: ${authoritativeTransactionStatus} for order_id: ${subscriptionId}`);
    }

    if (Object.keys(updatedData).length > 2 || (updatedData.transactionId && updatedData.transactionId !== subscription.transactionId) ) {
        await prisma.subscription.update({
            where: { id: subscriptionId },
            data: updatedData,
        });
        console.log(`Midtrans Webhook: Subscription ${subscriptionId} updated in DB.`);
    } else {
        console.log(`Midtrans Webhook: No significant data changes to update for subscription ${subscriptionId}.`);
    }

    return NextResponse.json({ message: 'Webhook received successfully' }, { status: 200 });
  } catch (error) { 
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during subscription processing';
    console.error(`Midtrans Webhook: Error processing notification for ${subscriptionId}:`, errorMessage, error); // Log full error object too
    return NextResponse.json({ error: 'Internal server error while processing webhook' }, { status: 500 });
  }
}
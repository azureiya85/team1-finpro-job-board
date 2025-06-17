import midtransClient from 'midtrans-client';

if (!process.env.MIDTRANS_SERVER_KEY) {
  throw new Error('MIDTRANS_SERVER_KEY is not defined in environment variables');
}
if (!process.env.MIDTRANS_CLIENT_KEY) {
  throw new Error('MIDTRANS_CLIENT_KEY is not defined in environment variables');
}
if (!process.env.NEXT_PUBLIC_APP_URL) {
    throw new Error('NEXT_PUBLIC_APP_URL is not defined for Midtrans callbacks');
}

export const snap = new midtransClient.Snap({
  isProduction: process.env.NODE_ENV === 'production',
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
});

export const coreApi = new midtransClient.CoreApi({
    isProduction: process.env.NODE_ENV === 'production',
    serverKey: process.env.MIDTRANS_SERVER_KEY!,
    clientKey: process.env.MIDTRANS_CLIENT_KEY!,
});

import crypto from 'crypto';
export function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string,
  signatureKeyFromMidtrans?: string
): boolean {
  if (!signatureKeyFromMidtrans) return false; 
  const dataString = orderId + statusCode + grossAmount + serverKey;
  const generatedSignature = crypto.createHash('sha512').update(dataString).digest('hex');
  return generatedSignature === signatureKeyFromMidtrans;
}
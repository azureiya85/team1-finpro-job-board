interface MidtransSnap {
 pay(token: string, options?: {
   onSuccess?: (result: any) => void;
   onPending?: (result: any) => void;
   onError?: (result: any) => void;
   onClose?: () => void;
 }): void;
}

interface Window {
 snap: MidtransSnap;
}

declare module 'midtrans-client' {
 export interface TransactionDetails {
   order_id: string;
   gross_amount: number;
 }


 export interface CustomerDetails {
   first_name?: string;
   last_name?: string;
   email?: string;
   phone?: string;
 }


 export interface ItemDetails {
   id: string;
   price: number;
   quantity: number;
   name: string;
   merchant_name?: string;
 }


 export interface Callbacks {
   finish?: string;
   error?: string;
   pending?: string;
 }


 export interface SnapParameter {
   transaction_details: TransactionDetails;
   customer_details?: CustomerDetails;
   item_details?: ItemDetails[];
   callbacks?: Callbacks;
   enabled_payments?: string[];
 }


 export interface SnapTransaction {
   token: string;
   redirect_url: string;
 }


 export interface SnapConfig {
   isProduction: boolean;
   serverKey: string;
   clientKey: string;
 }


 export interface CoreApiConfig {
   isProduction: boolean;
   serverKey: string;
   clientKey: string;
 }


 export interface TransactionStatusResponse {
   status_code: string;
   status_message: string;
   payment_type: string;
   transaction_id: string;
   transaction_status: string;
   fraud_status: string;
   order_id: string;
   gross_amount: string;
   payment_method?: string;
   signature_key?: string;
 }


 export class Snap {
   constructor(config: SnapConfig);
   createTransaction(parameter: SnapParameter): Promise<SnapTransaction>;
 }


 export class CoreApi {
   constructor(config: CoreApiConfig);
   transaction: {
     status(orderId: string): Promise<TransactionStatusResponse>;
   };
 }


 const midtransClient: {
   Snap: typeof Snap;
   CoreApi: typeof CoreApi;
 };


 export default midtransClient;
}

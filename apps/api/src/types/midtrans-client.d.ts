declare module "midtrans-client" {
  /** 
   * Configuration object passed into `new CoreApi(...)`
   */
  export interface CoreApiConfig {
    isProduction: boolean;
    serverKey: string;
    clientKey?: string;
  }

  /**
   * A minimal interface for the payload we send to `coreApi.charge()`.
   * Requires `payment_type` and `transaction_details`. Any other keys
   * (e.g. `bank_transfer` or QRIS-specific fields) are allowed via index signature.
   */
  export interface ChargeParams {
    payment_type: string;
    transaction_details: {
      order_id: string;
      gross_amount: number;
    };
    [key: string]: any;
  }

  /** 
   * The Midtrans CoreApi class. We only type `charge(...)` here 
   * since that’s all we currently invoke.
   */
  export class CoreApi {
    constructor(config: CoreApiConfig);
    charge(params: ChargeParams): Promise<any>;
    // If you later need other methods, you can add them here
  }

  /**
   * The default export from the npm package. It contains CoreApi as a property.
   */
  const midtransClient: {
    CoreApi: typeof CoreApi;
    // (Add other exports like SnapApi if you need them)
  };

  export default midtransClient;
}

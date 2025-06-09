import midtransClient from "midtrans-client";

// We will read these from environment variables:
const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
const clientKey = process.env.MIDTRANS_CLIENT_KEY || "";

/**
 * An instance of Midtrans Core API.
 * Make sure to set NODE_ENV to 'production' or 'development' as needed.
 */
export const coreApi = new midtransClient.CoreApi({
  isProduction: false,       // sandbox mode
  serverKey,
  clientKey,
});

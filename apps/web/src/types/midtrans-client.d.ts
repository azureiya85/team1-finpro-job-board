declare module 'midtrans-client' {
  import {
    Snap,
    CoreApi,
    SnapConfig,
    CoreApiConfig,
  } from './midtrans';

  const midtransClient: {
    Snap: new (config: SnapConfig) => Snap;
    CoreApi: new (config: CoreApiConfig) => CoreApi;
  };

  export = midtransClient;
}
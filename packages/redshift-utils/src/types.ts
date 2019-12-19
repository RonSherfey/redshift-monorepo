export enum AssetError {
  INVALID_MARKET = 'InvalidMarket',
  INVALID_TICKER = 'InvalidTicker',
  INVALID_MARKET_OR_TICKER = 'InvalidMarketOrTicker',
}

export interface EthereumTx {
  nonce?: string | number;
  chainId?: string | number;
  from?: string;
  to?: string;
  data?: string;
  value?: string | number;
  gas?: string | number;
  gasPrice?: string | number;
}

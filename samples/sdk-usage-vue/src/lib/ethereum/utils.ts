import { OnChainTicker } from '@radar/redshift.js';

/**
 * Get the chain id for the provided ticker
 * @param ticker The ticker symbol
 */
export function getEthChainIdForTicker(ticker: OnChainTicker) {
  switch (ticker) {
    case OnChainTicker.KETH:
      return '42';
    case OnChainTicker.ETH:
      return '1';
  }
}

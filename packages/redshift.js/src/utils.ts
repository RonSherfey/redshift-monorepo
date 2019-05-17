import { Network, OnChainTicker } from '@radar/redshift-types';
import { decode } from 'bech32';

export const utils = {
  /**
   * Determine if the passed network is valid
   */
  isValidNetwork(n: Network): boolean {
    return !!Network[(n || '').toUpperCase()];
  },

  /**
   * Determine if the passed onchain-ticker is valid
   * @param ticker The on-chain ticker
   */
  isValidOnchainTicker(ticker: OnChainTicker) {
    return (ticker && !!OnChainTicker[ticker.toUpperCase()]) || false;
  },

  /**
   * Determine if the passed uuid is valid
   * @param uuid The UUID to test
   */
  isValidUUID(uuid: string) {
    if (
      new RegExp(
        /^[0-9a-f]{8}-?[0-9a-f]{4}-?[1-5][0-9a-f]{3}-?[89ab][0-9a-f]{3}-?[0-9a-f]{12}$/i,
      ).test(uuid) // Valid UUID
    ) {
      return true;
    }
    return false;
  },

  /**
   * Determine if the passed string is valid bech32
   */
  isValidBech32(s: string): boolean {
    try {
      decode(s, 1023);
      return true;
    } catch (error) {
      return false;
    }
  },
};

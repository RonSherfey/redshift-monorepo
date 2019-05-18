import { Market, Network, OnChainTicker } from '@radar/redshift-types';
import { decode as base58Decode } from 'base58check';
import { decode as bech32Decode } from 'bech32';

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
   * Determine if the passed market is valid
   * @param ticker The market
   */
  isValidMarket(market: Market) {
    return (market && !!Market[market.toUpperCase()]) || false;
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
   * Determine if the passed string is valid base58
   * @param s The string to validate
   */
  isValidBase58(s: string): boolean {
    try {
      base58Decode(s);
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Determine if the passed string is valid bech32
   * @param s The string to validate
   */
  isValidBech32(s: string): boolean {
    try {
      bech32Decode(s, 1023);
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Determine if the passed address is valid
   * @param address The address to validate
   */
  isValidUtxoAddress(address: string) {
    if (this.isValidBase58(address) || this.isValidBech32(address)) {
      return true;
    }
    return false;
  },

  /**
   * Determine if the passed string is a valid hex
   * @param s The string to validate
   */
  isValidHex(s: string) {
    if (
      new RegExp(/^(0x)?[a-f0-9]+$/i).test(s) // Valid hex
    ) {
      return true;
    }
    return false;
  },
};

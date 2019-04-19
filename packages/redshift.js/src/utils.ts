import { Network } from '@radar/redshift-types';
import { decode } from 'bech32';

export const utils = {
  /**
   * Determine if the passed network is valid
   */
  isValidNetwork(n: Network): boolean {
    return !!Network[(n || '').toUpperCase()];
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

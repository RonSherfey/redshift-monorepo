import { Market, Network, OnChainTicker, Subnet } from '@radar/redshift-types';
import { decode as base58Decode } from 'base58check';
import { decode as bech32Decode } from 'bech32';

export const validator = {
  /**
   * Determine if the passed network is valid
   */
  isValidNetwork(n: Network): boolean {
    return !!Network[(n || '').toUpperCase()];
  },

  /**
   * Determine if the passed on-chain ticker is valid
   * @param ticker The on-chain ticker
   */
  isValidOnchainTicker(ticker: OnChainTicker) {
    return !!ticker && !!OnChainTicker[ticker.toUpperCase()];
  },

  /**
   * Determine if the passed market is valid
   * @param ticker The market
   */
  isValidMarket(market: Market) {
    return !!market && !!Market[market.toUpperCase()];
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
   * Determine if the passed string is valid base58check
   * @param s The string to validate
   */
  isValidBase58Check(s: string): boolean {
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
   * Determine if the passed string is valid base58check or bech32
   * This is used as simple address validation
   * @param s The string to validate
   */
  isValidBase58CheckOrBech32(s: string) {
    if (this.isValidBase58Check(s) || this.isValidBech32(s)) {
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
  /**
   * Determine if the passed network and subnet are valid
   * @param network The chain network
   * @param subnet The chain subnet
   */
  isValidNetworkAndSubnet(network: Network, subnet: Subnet) {
    switch (network) {
      case Network.BITCOIN:
        switch (subnet) {
          case Subnet.SIMNET:
          case Subnet.TESTNET:
          case Subnet.MAINNET:
            return true;
        }
        break;
      case Network.ETHEREUM:
        switch (subnet) {
          case Subnet.GANACHE_SIMNET:
          case Subnet.KOVAN_TESTNET:
          case Subnet.MAINNET:
            return true;
        }
        break;
    }
    return false;
  },
};

import {
  BitcoinSubnet,
  MainnetOnChainTicker,
  Market,
  Network,
  OffChainTicker,
  OnChainTicker,
  Subnet,
} from '@radar/redshift-types';
import { decode as base58Decode } from 'base58check';
import { decode as bech32Decode, fromWords } from 'bech32';
import { isString } from 'util';

export const validator = {
  /**
   * Determine if the passed network is valid
   * @param n The network
   */
  isValidNetwork(n: unknown): n is Network {
    if (isString(n)) {
      return !!Network[(n || '').toUpperCase()];
    }
    return false;
  },

  /**
   * Determine if the passed on-chain ticker is valid
   * @param ticker The on-chain ticker
   */
  isValidOnchainTicker(ticker: unknown): ticker is OnChainTicker {
    if (isString(ticker)) {
      return !!ticker && !!OnChainTicker[ticker.toUpperCase()];
    }
    return false;
  },

  /**
   * Determine if the passed mainnet on-chain ticker is valid
   * @param ticker The mainnet on-chain ticker
   */
  isValidMainnetOnchainTicker(ticker: unknown): ticker is MainnetOnChainTicker {
    if (isString(ticker)) {
      return !!ticker && !!MainnetOnChainTicker[ticker.toUpperCase()];
    }
    return false;
  },

  /**
   * Determine if the passed market is valid
   * @param ticker The market
   */
  isValidMarket(market: unknown): market is Market {
    if (isString(market)) {
      return !!market && !!Market[market.toUpperCase()];
    }
    return false;
  },

  /**
   * Determine if the passed uuid is valid
   * @param uuid The UUID to test
   */
  isValidUUID(uuid: string): boolean {
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
      bech32Decode(s, 3000);
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
  isValidBase58CheckOrBech32(s: string): boolean {
    if (this.isValidBase58Check(s) || this.isValidBech32(s)) {
      return true;
    }
    return false;
  },

  /**
   * Determine if the passed bitcoin address is a valid P2PKH or P2WPKH address.
   * If a subnet is passed, this method will validate that the address is valid
   * for the subnet.
   * @param address The address to validate
   * @param subnet The optional subnet to validate against
   */
  isValidPublicKeyHashBitcoinAddress(
    address: string,
    subnet?: BitcoinSubnet,
  ): boolean {
    if (this.isValidBech32(address)) {
      const { prefix, words } = bech32Decode(address, 3000);
      const subnetPrefixes = {
        bc: BitcoinSubnet.MAINNET,
        tb: BitcoinSubnet.TESTNET,
        sb: BitcoinSubnet.SIMNET,
      };
      const data = fromWords(words.slice(1));
      if (data.length !== 20) {
        return false;
      }
      const addressSubnet = subnetPrefixes[prefix];
      if (!addressSubnet) {
        return false;
      }
      if (subnet) {
        return subnet === addressSubnet;
      }
      return true;
    }

    if (this.isValidBase58Check(address)) {
      const { prefix, data } = base58Decode(address);
      const { length } = data;
      if (length !== 20) {
        return false;
      }
      const subnetPrefixes = {
        0x00: BitcoinSubnet.MAINNET,
        0x6f: BitcoinSubnet.TESTNET,
      };
      const addressSubnet = subnetPrefixes[prefix[0]];
      if (!addressSubnet) {
        return false;
      }
      if (subnet) {
        return subnet === addressSubnet;
      }
      return true;
    }
    return false;
  },

  /**
   * Determine if the passed string is a valid hex
   * @param s The string to validate
   */
  isValidHex(s: string): boolean {
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
  isValidNetworkAndSubnet(network: unknown, subnet: unknown): boolean {
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

  /**
   * Validate a WIF private key. Return true if valid
   * @param key The private key
   */
  isValidWifPrivateKey(key: string): boolean {
    // Regex - Contains only base58 characters with length of 52
    if (!!key && new RegExp(/^[a-km-zA-HJ-NP-Z1-9]{52}$/i).test(key)) {
      return true;
    }
    return false;
  },

  /**
   * Determine if the invoice is for same L2 network that was specified in the market
   * @param market The market
   * @param invoice The invoice
   */
  isCorrectMarketForInvoice(market: Market, invoice: string): boolean {
    const offchainTicker = market.split('_')[1];
    switch (offchainTicker) {
      case OffChainTicker.LSBTC:
        return invoice.startsWith('lnsb');
      case OffChainTicker.LTBTC:
        return invoice.startsWith('lntb');
      case OffChainTicker.LBTC:
        return invoice.startsWith('lnbc');
      case OffChainTicker.LSLTC:
        return invoice.startsWith('lnsltc');
      case OffChainTicker.LTLTC:
        return invoice.startsWith('lntltc');
      case OffChainTicker.LLTC:
        return invoice.startsWith('lnltc');
      default:
        return false;
    }
  },
};

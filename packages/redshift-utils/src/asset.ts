import {
  BitcoinSubnet,
  EthereumSubnet,
  LitecoinSubnet,
  Market,
  Network,
  NetworkError,
  OnChainTicker,
  StellarSubnet,
  Subnet,
} from '@radar/redshift-types';
import { AssetError } from './types';
import { validator } from './validator';

export const asset = {
  /**
   * Get the on-chain ticker for the provided market
   * @param market The market
   */
  getOnchainTicker(market: Market): OnChainTicker {
    if (!validator.isValidMarket(market)) {
      throw new Error(AssetError.INVALID_MARKET);
    }
    return OnChainTicker[market.split('_')[0]];
  },

  /**
   * Get the network and subnet for the passed on-chain asset
   * @param value The on-chain ticker or market
   */
  getNetworkDetails(
    value: OnChainTicker | Market,
  ): { network: Network; subnet: Subnet } | undefined {
    let ticker = value;
    if (validator.isValidMarket(value)) {
      ticker = asset.getOnchainTicker(value);
    }
    switch (ticker) {
      case OnChainTicker.SBTC:
        return {
          network: Network.BITCOIN,
          subnet: Subnet.SIMNET,
        };
      case OnChainTicker.TBTC:
        return {
          network: Network.BITCOIN,
          subnet: Subnet.TESTNET,
        };
      case OnChainTicker.BTC:
        return {
          network: Network.BITCOIN,
          subnet: Subnet.MAINNET,
        };
      case OnChainTicker.SLTC:
        return {
          network: Network.LITECOIN,
          subnet: Subnet.SIMNET,
        };
      case OnChainTicker.TLTC:
        return {
          network: Network.LITECOIN,
          subnet: Subnet.TESTNET,
        };
      case OnChainTicker.LTC:
        return {
          network: Network.LITECOIN,
          subnet: Subnet.MAINNET,
        };
      case OnChainTicker.SXLM:
        return {
          network: Network.STELLAR,
          subnet: Subnet.SIMNET,
        };
      case OnChainTicker.TXLM:
        return {
          network: Network.STELLAR,
          subnet: Subnet.TESTNET,
        };
      case OnChainTicker.XLM:
        return {
          network: Network.STELLAR,
          subnet: Subnet.MAINNET,
        };
      case OnChainTicker.SETH:
      case OnChainTicker.SDAI:
      case OnChainTicker.SUSDC:
        return {
          network: Network.ETHEREUM,
          subnet: Subnet.GANACHE_SIMNET,
        };
      case OnChainTicker.KETH:
      case OnChainTicker.KDAI:
      case OnChainTicker.KUSDC:
        return {
          network: Network.ETHEREUM,
          subnet: Subnet.KOVAN_TESTNET,
        };
      case OnChainTicker.ETH:
      case OnChainTicker.DAI:
      case OnChainTicker.USDC:
        return {
          network: Network.ETHEREUM,
          subnet: Subnet.MAINNET,
        };
      default:
        throw new Error(AssetError.INVALID_MARKET_OR_TICKER);
    }
  },

  /**
   * Get the mainnet ticker for the passed asset
   * @param ticker The testnet or mainnet ticker
   */
  getMainnetTicker(ticker: OnChainTicker) {
    if (/BTC/.test(ticker)) {
      return OnChainTicker.BTC;
    }
    if (/ETH/.test(ticker)) {
      return OnChainTicker.ETH;
    }
    if (/LTC/.test(ticker)) {
      return OnChainTicker.LTC;
    }
    if (/ETH/.test(ticker)) {
      return OnChainTicker.ETH;
    }
    if (/DAI/.test(ticker)) {
      return OnChainTicker.DAI;
    }
    if (/USDC/.test(ticker)) {
      return OnChainTicker.USDC;
    }
    if (/XLM/.test(ticker)) {
      return OnChainTicker.XLM;
    }
    if (/DCR/.test(ticker)) {
      return OnChainTicker.DCR;
    }
    throw new Error(AssetError.INVALID_TICKER);
  },

  /**
   * Get the subnets for a specific network
   * @param network The network
   */
  getSubnetForNetwork(network: Network) {
    switch (network) {
      case Network.BITCOIN:
        return BitcoinSubnet;
      case Network.ETHEREUM:
        return EthereumSubnet;
      case Network.LITECOIN:
        return LitecoinSubnet;
      case Network.STELLAR:
        return StellarSubnet;
      default:
        throw new Error(NetworkError.INVALID_NETWORK);
    }
  },
};

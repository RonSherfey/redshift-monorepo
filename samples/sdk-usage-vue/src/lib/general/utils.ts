import {
  ApiError,
  Market,
  Network,
  OnChainTicker,
  Subnet,
  validator,
} from '@radar/redshift.js';
import BigNumber from 'bignumber.js';

/**
 * A baseUnit is defined as the smallest denomination of a token. An amount expressed in baseUnits
 * is the amount expressed in the smallest denomination.
 * E.g: 1 unit of a token with 18 decimal places is expressed in baseUnits as 1000000000000000000
 * @param unitAmount The amount of units that you would like converted to baseUnits.
 * @param decimals The number of decimal places the unit amount has.
 */
export function toBaseUnitAmount(
  unitAmount: BigNumber | string | number,
  decimals: number,
): BigNumber {
  const baseUnitAmount = new BigNumber(unitAmount).times(
    new BigNumber(10).pow(decimals),
  );
  if (baseUnitAmount.decimalPlaces() !== 0) {
    throw new Error(
      `Invalid unit amount: ${unitAmount.toString()} - Too many decimal places`,
    );
  }
  return baseUnitAmount;
}

/**
 * A unit amount is defined as the amount of a token above the specified decimal places (integer part).
 * E.g: If a currency has 18 decimal places, 1e18 is equivalent to 1 unit.
 * @param baseUnits The amount in baseUnits that you would like converted to units.
 * @param decimals The number of decimal places the unit amount has.
 */
export function toUnitAmount(
  baseUnits: BigNumber | string | number,
  decimals: number,
): BigNumber {
  return new BigNumber(baseUnits).div(new BigNumber(10).pow(decimals));
}

/**
 * Get the on-chain ticker for the provided market
 * TODO: Move to @radar/redshift-utils
 * @param market The market
 */
export function getOnchainTicker(market: Market) {
  if (!validator.isValidMarket(market)) {
    throw new Error(ApiError.INVALID_MARKET);
  }
  return OnChainTicker[market.split('_')[0]];
}

/**
 * Get the network and subnet for the passed on-chain asset.
 * Extract the on-chain asset from the market if necessary.
 * TODO: Move to @radar/redshift-utils
 * @param value The on-chain ticker or market
 */
export function getNetworkDetails(
  value: OnChainTicker | Market,
): { network: Network; subnet: Subnet } | undefined {
  let ticker = value;
  try {
    // Get the on-chain asset from the market if necessary
    ticker = getOnchainTicker(value as Market);
  } catch (error) {}

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
      return {
        network: Network.ETHEREUM,
        subnet: Subnet.GANACHE_SIMNET,
      };
    case OnChainTicker.KETH:
    case OnChainTicker.KDAI:
      return {
        network: Network.ETHEREUM,
        subnet: Subnet.KOVAN_TESTNET,
      };
    case OnChainTicker.ETH:
    case OnChainTicker.DAI:
      return {
        network: Network.ETHEREUM,
        subnet: Subnet.MAINNET,
      };
  }
}

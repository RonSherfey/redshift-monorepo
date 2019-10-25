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

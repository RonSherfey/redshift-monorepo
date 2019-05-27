import BigNumber from 'bignumber.js';

/**
 * Convert wei to ether
 * @param weiAmount The wei amount to convert
 */
export function weiToEther(weiAmount: BigNumber | string | number): number {
  return new BigNumber(weiAmount).dividedBy(1e18).toNumber();
}

/**
 * Convert ether to wei
 * @param etherAmount The ether amount to convert
 */
export function etherToWei(etherAmount: BigNumber | string | number): number {
  return new BigNumber(etherAmount).times(1e18).toNumber();
}

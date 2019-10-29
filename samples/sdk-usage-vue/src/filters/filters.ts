import {
  errorToHumanReadable,
  onchainTickerToName,
  stateToHumanReadable,
  toUnitAmount,
} from '@/lib/general';
import { OnChainTicker } from '@radar/redshift.js';
import Vue from 'vue';

/**
 * Get the asset name from the on-chain ticker
 */
Vue.filter('onchainTickerToName', (t: OnChainTicker) => {
  if (!OnChainTicker[t]) return t;
  return onchainTickerToName[t];
});

/**
 * Convert the passed error to a human readable string
 */
Vue.filter('errorToHumanReadable', (e: string) => {
  if (errorToHumanReadable[e]) {
    return errorToHumanReadable[e];
  }
  return 'An unknown error occurred';
});

/**
 * Convert the passed swap state to a human readable string
 */
Vue.filter('stateToHumanReadable', (s: string) => {
  if (stateToHumanReadable[s]) {
    return stateToHumanReadable[s];
  }
  return 'Unknown state';
});

/**
 * Convert satoshis to bitcoin
 */
Vue.filter('toBitcoin', (sats: string | number) => {
  try {
    return toUnitAmount(sats, 8).toString();
  } catch (error) {
    return sats;
  }
});

/**
 * Convert satoshis to bitcoin
 */
Vue.filter('toBitcoin', (sats: string | number) => {
  try {
    return toUnitAmount(sats, 8).toString();
  } catch (error) {
    return sats;
  }
});

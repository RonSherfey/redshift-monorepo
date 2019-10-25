import { RedshiftApiUrl, RedshiftClient } from '@radar/redshift.js';

/**
 * The REDSHIFT API client instance
 */
export const redshift = new RedshiftClient(RedshiftApiUrl.TESTNET);

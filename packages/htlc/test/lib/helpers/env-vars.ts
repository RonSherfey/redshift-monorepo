import { Network, Subnet } from '@radartech/redshift-types';
import { getRpcConnectionConfig } from '.';

export function getRpcWebSocketUrl(network: Network, subnet: Subnet): string {
  const { host, port, path } = getRpcConnectionConfig(network, subnet);
  if (path) {
    return `wss://${host}:${port}/${path}`;
  }
  return `ws://${host}:${port}`;
}

export function getTestingMnemonic() {
  return process.env.REDSHIFT_TESTING_MNEMONIC as string;
}

import {
  Network,
  NetworkError,
  Subnet,
  SubnetMap,
} from '@radar/redshift-types';
import { asset } from '@radar/redshift-utils';

export abstract class BaseHtlc<N extends Network> {
  protected _network: N;
  protected _subnet: SubnetMap[N];

  /**
   * Create a new HTLC instance
   * @param network The on-chain network
   * @param subnet The on-chain subnet
   */
  constructor(network: N, subnet: SubnetMap[N]) {
    if (!Network[network.toUpperCase()]) {
      throw new Error(NetworkError.INVALID_NETWORK);
    }

    if (asset.getSubnetForNetwork(network)[subnet as Subnet]) {
      throw new Error(NetworkError.INVALID_SUBNET);
    }

    this._network = network;
    this._subnet = subnet;
  }

  public abstract fund(...args: unknown[]): unknown;

  public abstract claim(...args: unknown[]): unknown;

  public abstract refund(...args: unknown[]): unknown;
}

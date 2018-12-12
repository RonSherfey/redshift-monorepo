import { ConditionalSubnet, Network } from '../../types';

export abstract class Htlc<N extends Network> {
  protected _network: N;
  protected _subnet: ConditionalSubnet<N>;

  /**
   * Create a new HTLC instance
   * @param network The on-chain network
   * @param subnet The on-chain subnet
   */
  constructor(network: N, subnet: ConditionalSubnet<N>) {
    this._network = network;
    this._subnet = subnet;
  }

  public abstract fund(...args: unknown[]): unknown;

  public abstract claim(...args: unknown[]): unknown;

  public abstract refund(...args: unknown[]): unknown;
}

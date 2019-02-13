import { BlockResult, Network, Subnet } from '@radar/redshift-types';
import { postRpcCall } from './rpc-call';

export class UtxoRpcClient {
  private _network: Network;
  private _subnet: Subnet;

  /**
   * Instantiate a new rpc client
   * @param network The rpc client network
   * @param subnet The rpc client subnet
   */
  constructor(network: Network, subnet: Subnet) {
    this._network = network;
    this._subnet = subnet;
  }

  /**
   * Fetch current chain block height
   * @return <Result Object>
   */
  public async getBlockCount(): Promise<number> {
    return (await postRpcCall(this._network, this._subnet, 'getblockcount', []))
      .result;
  }

  /**
   * Get the header hash of a block at the given height
   * @param height - A block height
   * @return <Result Object>
   */
  public async getBlockHash(height: number): Promise<string> {
    return (await postRpcCall(this._network, this._subnet, 'getblockhash', [
      height,
    ])).result;
  }

  /**
   * Fetch current chain tip block hash
   * @return <Result Object>
   */
  public async getBestBlockHash(): Promise<string> {
    return (await postRpcCall(
      this._network,
      this._subnet,
      'getbestblockhash',
      [],
    )).result;
  }

  /**
   * Fetch full block data
   * @param hash - Block hash to return data for
   * @param returnDecoded - If true return human readable output, else hex data
   * @return <Result Object>
   */
  async getBlockByHash(
    hash: string,
    returnDecoded: boolean = true,
  ): Promise<BlockResult | string> {
    return (await postRpcCall(this._network, this._subnet, 'getblock', [
      hash,
      returnDecoded,
    ])).result;
  }

  /**
   * Get details about a transaction output
   * @param txId - The tx id of the transaction containing the output to get
   * @param vout - The output index number
   * @return <Result Object>
   */
  async getTxOutput(txId: string, vout: number): Promise<any> {
    return (await postRpcCall(this._network, this._subnet, 'gettxout', [
      txId,
      vout,
    ])).result;
  }

  /**
   * Fetch raw transaction data
   * @param hash - The tx hash to return data for
   * @param returnDecoded - If true return human readable output, else hex data
   * @return <Result Object>
   */
  public async getTransactionByHash(
    hash: string,
    returnDecoded: boolean = true,
  ): Promise<string | any> {
    return (await postRpcCall(
      this._network,
      this._subnet,
      'getrawtransaction',
      [hash, returnDecoded ? 1 : 0],
    )).result;
  }

  /**
   * Broadcast transaction
   * @param txHex - Hex string representation of the transaction
   * @return <Result Object>
   */
  public async sendRawTransaction(txHex: string): Promise<any> {
    return (await postRpcCall(
      this._network,
      this._subnet,
      'sendrawtransaction',
      [txHex],
    )).result;
  }
}

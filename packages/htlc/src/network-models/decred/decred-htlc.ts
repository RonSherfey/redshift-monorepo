import explorers from 'bitcore-explorers';
import bitcore, { PublicKey } from 'bitcore-lib';
import {
  Decred,
  DecredSubnet,
  Network,
  NetworkError,
  SubnetMap,
} from '../../types/index';
import { BaseHtlc } from '../shared/index';

export class DecredHtlc<N extends Network> extends BaseHtlc<N> {
  private _insight: explorers.Insight;
  private _serverPrivateKey: bitcore.PrivateKey;
  public network: bitcore.Networks.Network;
  public timelock: number;
  public serverAddress: bitcore.Address;
  public script: bitcore.Script;

  /**
   * Create a new Stellar HTLC instance
   * @param network
   * @param subnet
   * @param options
   */
  constructor(network: N, subnet: SubnetMap[N], options: Decred.Options) {
    super(network, subnet);
    const {
      url,
      passphrase,
      allowHttp = false,
    } = this.getServerDetailsForSubnet(subnet, options.server);
    this.network = passphrase;
    this._insight = new explorers.Insight(url, this.network);
    this.timelock = Math.floor(Date.now() / 1000) + 1; // @TODO change to block number
    this.script = new bitcore.Script();
    this._serverPrivateKey = new bitcore.PrivateKey(options.secret);
    const serverPublicKey = new bitcore.PublicKey(this._serverPrivateKey);
    this.serverAddress = serverPublicKey.toAddress(passphrase);
  }

  /**
   * Connect to mainnet, testnet or local
   * @param subnet
   */
  private getServerDetailsForSubnet(
    subnet: SubnetMap[N],
    serverOptions?: Decred.ServerOptions,
  ) {
    switch (subnet) {
      case DecredSubnet.DECRED:
        return {
          url: 'https://mainnet.decred.org/',
          passphrase: bitcore.Networks.dcrdlivenet,
          allowHttp: false,
        };
      case DecredSubnet.DCRTESTNET:
        return {
          url: 'https://testnet.decred.org',
          passphrase: bitcore.Networks.dcrdtestnet,
          allowHttp: false,
        };
      default:
        throw new Error(NetworkError.INVALID_SUBNET);
    }
  }

  public fund(hash: string, clientAddress: string): bitcore.Address {
    this.script = new bitcore.Script()
      .add('OP_IF')
      .add(192) // dered op code number for SHA256
      .add(new Buffer(hash, 'hex')) // hash of preimage
      .add('OP_EQUALVERIFY')
      .add(
        bitcore.Script.buildPublicKeyHashOut(
          bitcore.Address.fromString(this.serverAddress.toString()), // send DCR here
        ),
      )
      .add('OP_ELSE')
      .add(bitcore.crypto.BN.fromNumber(this.timelock).toScriptNumBuffer())
      .add('OP_CHECKLOCKTIMEVERIFY')
      .add('OP_DROP')
      .add(
        bitcore.Script.buildPublicKeyHashOut(
          bitcore.Address.fromString(clientAddress.toString()),
        ),
      )
      .add('OP_ENDIF');

    return bitcore.Address.payingTo(this.script);
  }
  public async claim() {}
  public async refund() {}

  public broadcast(transaction: string) {
    return new Promise((resolve, reject) => {
      this._insight.broadcast(
        transaction,
        (err: any, transactionHash: string) => {
          if (err) reject(err);
          resolve(transactionHash);
        },
      );
    });
  }

  public getUnspentUtxos(address: string) {
    return new Promise((resolve, reject) => {
      this._insight.getUnspentUtxos(address, (err: any, utxos: any) => {
        if (err) reject(err);
        resolve(utxos);
      });
    });
  }
}

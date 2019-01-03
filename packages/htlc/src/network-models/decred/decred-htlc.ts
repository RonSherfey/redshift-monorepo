import explorers from 'bitcore-explorers';
import bitcore from 'bitcore-lib';
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
  public timelock: number;
  public serverAddress: bitcore.PublicKey;

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
    // https://github.com/bitpay/bitcore-explorers
    this._insight = new explorers.Insight(url, passphrase);
    this._serverPrivateKey = new bitcore.PrivateKey(options.secret);
    const serverPublicKey = new bitcore.PublicKey(this._serverPrivateKey);
    this.serverAddress = serverPublicKey.toAddress(passphrase);
    this.timelock = Math.floor(Date.now() / 1000) + 1; // @TODO change to block number
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

  public async fund(hash: string, clientAddress: string) {
    const script = new bitcore.Script()
      .add('OP_IF')
      .add('OP_SHA2')
      .add(new Buffer(hash, 'hex')) // hash of preimage
      .add('OP_EQUALVERIFY')
      .add(
        bitcore.Script.buildPublicKeyHashOut(
          bitcore.Address.fromString(this.serverAddress.toString()),
        ),
      ) // send DCR here
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

    console.log('\n\nfund', bitcore.Address.payingTo(script));
  }
  public async claim() {}
  public async refund() {}
}

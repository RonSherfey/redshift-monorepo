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
  // private _server: stellarSdk.Server;
  // private _serverKeyPair: stellarSdk.Keypair;
  // public escrowKeyPair: stellarSdk.Keypair;

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
          passphrase: bitcore.Networks.dcrtestnet,
          allowHttp: false,
        };
      default:
        throw new Error(NetworkError.INVALID_SUBNET);
    }
  }

  public async claim() {}
  public async fund() {}
  public async refund() {}
}

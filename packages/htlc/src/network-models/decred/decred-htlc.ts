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
  public network: bitcore.Networks.Network;
  public timelock: number;
  public serverAddress: bitcore.Address;
  public script: bitcore.Script;
  public serverPublicKey: bitcore.PublicKey;

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
    this.serverPublicKey = new bitcore.PublicKey(this._serverPrivateKey);
    this.serverAddress = this.serverPublicKey.toAddress(passphrase);
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

  public async claim(preimage: string) {
    // get info from fund address
    const fundUtxos = await this.getUnspentUtxos(
      'TcdqHYDvn2H7BinUTH4hfh9QLZ5VnNbrbNE' ||
        bitcore.Address.payingTo(this.script).toString(),
    );
    const fundBalance = fundUtxos.reduce((prev: number, curr: any) => {
      return curr.atoms + prev;
    }, 0);

    // https://bitcore.io/api/lib/transaction
    const transaction = new bitcore.Transaction(this.network)
      .from(
        await this.getUnspentUtxos(
          bitcore.Address.payingTo(this.script).toString(),
        ),
      )
      .to(this.serverAddress, fundBalance - 10000) // @TODO dynamic fees
      .lockUntilDate(Math.floor(Date.now() / 1000)); // CLTV

    // the CLTV opcode requires that the input's sequence number not be finalized
    transaction.inputs[0].sequenceNumber = 0;

    // https://bitcore.io/api/lib/transaction#Signing.sighash
    const signature = bitcore.Transaction.Sighash.sign(
      transaction,
      this._serverPrivateKey,
      1, // bitcore.crypto.Signature.SIGHASH_ALL,
      0, // the input index for the signature
      this.script,
    );

    const unlockScript = bitcore.Script.empty()
      .add(signature.toTxFormat())
      .add(new Buffer(this.serverPublicKey.toString(), 'hex'))
      .add(new Buffer(preimage, 'hex'))
      .add('OP_TRUE') // choose the time-delayed refund code path
      .add(this.script.toBuffer());

    // setup the scriptSig of the spending transaction to spend the p2sh-cltv-p2pkh
    transaction.inputs[0].setScript(unlockScript);

    return transaction;
  }

  public async refund() {}

  public broadcast(transaction: string): Promise<string> {
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

  public getUnspentUtxos(
    address: string,
  ): Promise<bitcore.Transaction.UnspentOutput[]> {
    return new Promise((resolve, reject) => {
      this._insight.getUnspentUtxos(address, (err: any, utxos: any) => {
        if (err) reject(err);
        resolve(utxos);
      });
    });
  }
}

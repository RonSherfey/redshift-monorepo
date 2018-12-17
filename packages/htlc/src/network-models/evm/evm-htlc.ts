import Web3 from 'web3';
import { TransactionReceipt } from 'web3/types';
import {
  EthereumSubnet,
  EVM,
  Network,
  PartialTxParams,
  SubnetMap,
  UnsignedTx,
} from '../../types';
import { addHexPrefix } from '../../utils';
import { BaseHtlc } from '../shared';
import { getContractAddressesForSubnetOrThrow } from './contract-addresses';
import { abi } from './contract-artifacts/EtherSwap.json';
import { EtherSwapContract } from './contract-types';

export class EvmHtlc<N extends Network> extends BaseHtlc<N> {
  private _contract: EtherSwapContract;
  private _web3Instance: Web3;

  /**
   * Get the Ether Swap Contract Instance
   */
  get contract(): EtherSwapContract {
    return this._contract;
  }

  /**
   * Create a new Ethereum HTLC instance
   * @param network The chain network
   * @param subnet The chain subnet
   * @param web3 The web3 instance used for contract calls
   */
  constructor(network: N, subnet: SubnetMap[N], options: EVM.Options) {
    super(network, subnet);
    const { etherSwap } = getContractAddressesForSubnetOrThrow(
      subnet as EthereumSubnet,
    );
    this._contract = new options.web3.eth.Contract(
      abi,
      etherSwap,
    ) as EtherSwapContract;
    this._web3Instance = options.web3;
  }

  /**
   * Generate, and optionally send, the swap funding transaction
   * @param amount The fund amount in ether
   * @param bolt11Invoice The bolt11 encoded payment invoice
   * @param paymentHash The hash of the payment secret
   * @param shouldSend Whether or not the transaction should be broadcast
   * @param txParams The optional transaction params
   */
  public async fund(
    amount: string,
    bolt11Invoice: string,
    paymentHash: string,
    shouldSend: boolean = true,
    txParams?: PartialTxParams,
  ): Promise<UnsignedTx | TransactionReceipt> {
    const methodArgs = this.contract.methods
      .fund(Web3.utils.sha3(bolt11Invoice), addHexPrefix(paymentHash))
      .encodeABI();
    const unsignedTx = {
      to: this.contract.options.address,
      data: methodArgs,
      value: Web3.utils.toWei(amount, 'ether'),
      ...txParams,
    };

    if (!shouldSend) {
      return unsignedTx;
    }
    return this._web3Instance.eth.sendTransaction(unsignedTx);
  }

  /**
   * Generate, and optionally send, the transaction to claim the on-chain ETH
   * @param bolt11Invoice The bolt11 encoded payment invoice
   * @param paymentSecret The payment secret
   * @param shouldSend Whether or not the transaction should be broadcast
   * @param txParams The optional transaction params
   */
  public async claim(
    bolt11Invoice: string,
    paymentSecret: string,
    shouldSend: boolean = true,
    txParams?: PartialTxParams,
  ): Promise<UnsignedTx | TransactionReceipt> {
    const methodArgs = this.contract.methods
      .claim(Web3.utils.sha3(bolt11Invoice), addHexPrefix(paymentSecret))
      .encodeABI();
    const unsignedTx = {
      to: this.contract.options.address,
      data: methodArgs,
      ...txParams,
    };

    if (!shouldSend) {
      return unsignedTx;
    }
    return this._web3Instance.eth.sendTransaction(unsignedTx);
  }

  /**
   * Generate, and optionally send, the transaction to refund the on-chain ETH to the funder
   * @param bolt11Invoice The bolt11 encoded payment invoice
   * @param shouldSend Whether or not the transaction should be broadcast
   * @param txParams The optional transaction params
   */
  public async refund(
    bolt11Invoice: string,
    shouldSend: boolean = true,
    txParams?: PartialTxParams,
  ): Promise<UnsignedTx | TransactionReceipt> {
    const unsignedTx = {
      to: this.contract.options.address,
      data: this.contract.methods
        .refund(Web3.utils.sha3(bolt11Invoice))
        .encodeABI(),
      ...txParams,
    };

    if (!shouldSend) {
      return unsignedTx;
    }
    return this._web3Instance.eth.sendTransaction(unsignedTx);
  }
}

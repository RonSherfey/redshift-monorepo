import {
  EthereumSubnet,
  EvmUnsignedTx,
  Network,
  NetworkError,
  PartialEvmTxParams,
  SubnetMap,
} from '@radar/redshift-types';
import { format } from '@radar/redshift-utils';
import Big from 'big.js';
import abi from 'ethereumjs-abi';
import uuidToHex from 'uuid-to-hex';
import { EVM, Provider } from '../../types';
import { BaseHtlc } from '../shared';
import { getContractAddressesForSubnetOrThrow } from './contract-addresses';

export class EvmHtlc<
  N extends Network,
  C extends EVM.Config = EVM.Config
> extends BaseHtlc<N> {
  private _assetType: EVM.AssetType;
  private _provider: Provider | undefined;
  private _swapContractAddress: string;
  private _tokenContractAddress: string;
  private _orderUUID: string;

  /**
   * Create a new Ethereum HTLC instance
   * @param network The chain network
   * @param subnet The chain subnet
   * @param config The htlc config
   */
  constructor(network: N, subnet: SubnetMap[N], config: C) {
    super(network, subnet);
    this._assetType = config.assetType;
    this._orderUUID = this.formatOrderUUID(config.orderUUID);
    this._provider = config.provider;
    this._tokenContractAddress = (config as EVM.ERC20Config).tokenContractAddress;
    this._swapContractAddress = this.getSwapContractAddress(subnet, config);
  }

  /**
   * Generate, and optionally send, the swap funding transaction
   * @param amount The fund amount in ether or token base units
   * @param paymentHash The hash of the payment secret
   * @param shouldBroadcast Whether or not the transaction should be broadcast (Default: true)
   * @param txParams The optional transaction params
   */
  public async fund(
    amount: string,
    paymentHash: string,
    shouldBroadcast: boolean = true,
    txParams?: PartialEvmTxParams,
  ) {
    const unsignedTx = this.createFundTxForAssetType(
      amount,
      paymentHash,
      txParams,
    );

    if (!shouldBroadcast || !this._provider) {
      return unsignedTx;
    }
    return this._provider.send('eth_sendTransaction', unsignedTx);
  }

  /**
   * Generate, and optionally send, the transaction to claim the on-chain asset
   * @param paymentSecret The payment secret
   * @param shouldBroadcast Whether or not the transaction should be broadcast
   * @param txParams The optional transaction params
   */
  public async claim(
    paymentSecret: string,
    shouldBroadcast: boolean = true,
    txParams?: PartialEvmTxParams,
  ) {
    const unsignedTx = this.createClaimTxForAssetType(paymentSecret, txParams);

    if (!shouldBroadcast || !this._provider) {
      return unsignedTx;
    }
    return this._provider.send('eth_sendTransaction', unsignedTx);
  }

  /**
   * Generate, and optionally send, the transaction to refund the on-chain asset to the funder
   * @param shouldBroadcast Whether or not the transaction should be broadcast
   * @param txParams The optional transaction params
   */
  public async refund(
    shouldBroadcast: boolean = true,
    txParams?: PartialEvmTxParams,
  ) {
    const unsignedTx = this.createRefundTxForAssetType(txParams);

    if (!shouldBroadcast || !this._provider) {
      return unsignedTx;
    }
    return this._provider.send('eth_sendTransaction', unsignedTx);
  }

  /**
   * Convert the passed order UUID to valid hex with a prefix
   * @param uuid The UUID to format
   */
  private formatOrderUUID(uuid: string) {
    if (format.isHex(uuid)) {
      return format.addHexPrefix(uuid);
    }
    return uuidToHex(uuid, true);
  }

  /**
   * Get the swap contract address for the active subnet and asset
   * @param subnet The Ethereum subnet
   * @param config The Ethereum htlc config
   */
  private getSwapContractAddress(subnet: SubnetMap[N], config: EVM.Config) {
    const { erc20Swap, etherSwap } = getContractAddressesForSubnetOrThrow(
      subnet as EthereumSubnet,
    );
    switch (config.assetType) {
      case EVM.AssetType.ERC20:
        return erc20Swap;
      case EVM.AssetType.ETHER:
        return etherSwap;
      default:
        throw new Error(NetworkError.INVALID_ASSET);
    }
  }

  /**
   * Create a fund transaction for the provided asset type
   * @param amount The fund amount in ether or token base units
   * @param paymentHash The hash of the payment secret
   * @param txParams The optional transaction params
   */
  private createFundTxForAssetType(
    amount: string,
    paymentHash: string,
    txParams?: PartialEvmTxParams,
  ): EvmUnsignedTx {
    switch (this._assetType) {
      case EVM.AssetType.ERC20:
        const erc20MethodArgs = abi
          .simpleEncode(
            'fund(bytes16,bytes32,address,uint)',
            this._orderUUID,
            format.addHexPrefix(paymentHash),
            this._tokenContractAddress,
            amount,
          )
          .toString('hex');
        return {
          to: this._swapContractAddress,
          data: format.addHexPrefix(erc20MethodArgs),
          ...txParams,
        };
      case EVM.AssetType.ETHER:
        const etherMethodArgs = abi
          .simpleEncode(
            'fund(bytes16,bytes32)',
            this._orderUUID,
            format.addHexPrefix(paymentHash),
          )
          .toString('hex');
        return {
          to: this._swapContractAddress,
          data: format.addHexPrefix(etherMethodArgs),
          value: new Big(amount).times(1e18).toString(), // Ether to Wei
          ...txParams,
        };
    }
  }

  /**
   * Create a claim transaction for the provided asset type
   * @param paymentSecret The payment secret
   * @param txParams The optional transaction params
   */
  private createClaimTxForAssetType(
    paymentSecret: string,
    txParams?: PartialEvmTxParams,
  ): EvmUnsignedTx {
    switch (this._assetType) {
      case EVM.AssetType.ERC20:
        const erc20MethodArgs = abi
          .simpleEncode(
            'claim(bytes16,address,bytes32)',
            this._orderUUID,
            this._tokenContractAddress,
            format.addHexPrefix(paymentSecret),
          )
          .toString('hex');
        return {
          to: this._swapContractAddress,
          data: format.addHexPrefix(erc20MethodArgs),
          ...txParams,
        };
      case EVM.AssetType.ETHER:
        const etherMethodArgs = abi
          .simpleEncode(
            'claim(bytes16,bytes32)',
            this._orderUUID,
            format.addHexPrefix(paymentSecret),
          )
          .toString('hex');
        return {
          to: this._swapContractAddress,
          data: format.addHexPrefix(etherMethodArgs),
          ...txParams,
        };
    }
  }

  /**
   * Create a refund transaction for the provided asset type
   * @param txParams The optional transaction params
   */
  private createRefundTxForAssetType(
    txParams?: PartialEvmTxParams,
  ): EvmUnsignedTx {
    switch (this._assetType) {
      case EVM.AssetType.ERC20:
        const erc20MethodArgs = abi
          .simpleEncode(
            'refund(bytes16,address)',
            this._orderUUID,
            this._tokenContractAddress,
          )
          .toString('hex');
        return {
          to: this._swapContractAddress,
          data: format.addHexPrefix(erc20MethodArgs),
          ...txParams,
        };
      case EVM.AssetType.ETHER:
        const etherMethodArgs = abi
          .simpleEncode('refund(bytes16)', this._orderUUID)
          .toString('hex');
        return {
          to: this._swapContractAddress,
          data: format.addHexPrefix(etherMethodArgs),
          ...txParams,
        };
    }
  }
}

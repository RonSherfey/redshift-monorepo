import { Interface } from '@ethersproject/abi';
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
import uuidToHex from 'uuid-to-hex';
import { JsonRpcPayload } from 'web3-core-helpers';
import { ERC20SwapABI, EtherSwapABI } from '.';
import { EIP1193Provider, EVM, LegacyProvider, Provider } from '../../types';
import { BaseHtlc } from '../shared';
import { getContractAddressesForSubnetOrThrow } from './contract-addresses';

export class EvmHtlc<
  N extends Network,
  C extends EVM.Config = EVM.Config
> extends BaseHtlc<N> {
  private readonly _contract: Interface;
  private readonly _assetType: EVM.AssetType;
  private readonly _provider: Provider | undefined;
  private readonly _swapContractAddress: string;
  private readonly _tokenContractAddress: string;
  private readonly _orderUUID: string;
  private readonly _sendTransactionJsonRpcPayload: JsonRpcPayload = {
    params: [],
    jsonrpc: '2.0',
    method: 'eth_sendTransaction',
  };

  /**
   * Create a new Ethereum HTLC instance
   * @param network The chain network
   * @param subnet The chain subnet
   * @param config The htlc config
   */
  constructor(network: N, subnet: SubnetMap[N], config: C) {
    super(network, subnet);
    this._contract = this.getContractInterfaceForAssetType(config.assetType);
    this._assetType = config.assetType;
    this._orderUUID = this.formatOrderUUID(config.orderUUID);
    this._provider = config.provider;
    this._tokenContractAddress = (config as EVM.ERC20Config).tokenContractAddress;
    this._swapContractAddress = this.getSwapContractAddress(subnet, config);
  }

  /**
   * Generate, and optionally send, the swap funding transaction
   * @param details The fund amount in ether or token base units and the hash of the payment secret
   * @param shouldBroadcast Whether or not the transaction should be broadcast (Default: true)
   * @param txParams The optional transaction params
   */
  public async fund(
    details: EVM.FundDetails,
    shouldBroadcast: boolean = true,
    txParams?: PartialEvmTxParams,
  ) {
    const unsignedTx = this.createFundTxForAssetType(details, txParams);

    if (!shouldBroadcast || !this._provider) {
      return unsignedTx;
    }
    return this.send(unsignedTx);
  }

  /**
   * Generate, and optionally send, the swap funding transaction with admin refund functionality enabled
   * @param details The fund amount in ether or token base units, hash of the payment secret, and refund hash
   * @param shouldBroadcast Whether or not the transaction should be broadcast (Default: true)
   * @param txParams The optional transaction params
   */
  public async fundWithAdminRefundEnabled(
    details: EVM.FundDetailsWithAdminRefundEnabled,
    shouldBroadcast: boolean = true,
    txParams?: PartialEvmTxParams,
  ) {
    const unsignedTx = this.createFundTxWithAdminRefundEnabled(
      details,
      txParams,
    );

    if (!shouldBroadcast || !this._provider) {
      return unsignedTx;
    }
    return this.send(unsignedTx);
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
    const callData = this._contract.encodeFunctionData(
      this._contract.getFunction('claim'),
      [[this._orderUUID, format.addHexPrefix(paymentSecret)]],
    );
    const unsignedTx = {
      to: this._swapContractAddress,
      data: format.addHexPrefix(callData),
      ...txParams,
    };

    if (!shouldBroadcast || !this._provider) {
      return unsignedTx;
    }
    return this.send(unsignedTx);
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
    const callData = this._contract.encodeFunctionData(
      this._contract.getFunction('refund'),
      [this._orderUUID],
    );
    const unsignedTx = {
      to: this._swapContractAddress,
      data: format.addHexPrefix(callData),
      ...txParams,
    };

    if (!shouldBroadcast || !this._provider) {
      return unsignedTx;
    }
    return this.send(unsignedTx);
  }

  /**
   * Generate, and optionally send, the transaction to execute an admin refund of the on-chain asset
   * to the funder. This method can be used to unlock funds irrespective of the refund timelock. It
   * is entirely at the discretion of the counterparty (claimer) as to whether the refund preimage
   * will be provided to the funder.
   * @param refundPreimage The refund secret used to unlock funds irrespective of the refund timelock
   * @param shouldBroadcast Whether or not the transaction should be broadcast
   * @param txParams The optional transaction params
   */
  public async adminRefund(
    refundPreimage: string,
    shouldBroadcast: boolean = true,
    txParams?: PartialEvmTxParams,
  ) {
    const callData = this._contract.encodeFunctionData(
      this._contract.getFunction('adminRefund'),
      [[this._orderUUID, format.addHexPrefix(refundPreimage)]],
    );
    const unsignedTx = {
      to: this._swapContractAddress,
      data: format.addHexPrefix(callData),
      ...txParams,
    };

    if (!shouldBroadcast || !this._provider) {
      return unsignedTx;
    }
    return this.send(unsignedTx);
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
   * @param details The fund amount in ether or token base units and the hash of the payment secret
   * @param txParams The optional transaction params
   */
  private createFundTxForAssetType(
    details: EVM.FundDetails,
    txParams?: PartialEvmTxParams,
  ): EvmUnsignedTx {
    switch (this._assetType) {
      case EVM.AssetType.ERC20:
        const erc20CallData = this._contract.encodeFunctionData(
          this._contract.getFunction('fund'),
          [
            [
              this._orderUUID,
              format.addHexPrefix(details.paymentHash),
              this._tokenContractAddress,
              details.amount,
            ],
          ],
        );
        return {
          to: this._swapContractAddress,
          data: format.addHexPrefix(erc20CallData),
          ...txParams,
        };
      case EVM.AssetType.ETHER:
        const etherCallData = this._contract.encodeFunctionData(
          this._contract.getFunction('fund'),
          [[this._orderUUID, format.addHexPrefix(details.paymentHash)]],
        );
        return {
          to: this._swapContractAddress,
          data: format.addHexPrefix(etherCallData),
          value: new Big(details.amount).times(1e18).toString(), // Ether to Wei
          ...txParams,
        };
    }
  }

  /**
   * Create a fund transaction with admin refund functionality enabled for the provided asset type
   * @param details The fund amount in ether or token base units and the hash of the payment secret
   * @param txParams The optional transaction params
   */
  private createFundTxWithAdminRefundEnabled(
    details: EVM.FundDetailsWithAdminRefundEnabled,
    txParams?: PartialEvmTxParams,
  ): EvmUnsignedTx {
    switch (this._assetType) {
      case EVM.AssetType.ERC20:
        const erc20CallData = this._contract.encodeFunctionData(
          this._contract.getFunction('fundWithAdminRefundEnabled'),
          [
            [
              this._orderUUID,
              format.addHexPrefix(details.paymentHash),
              this._tokenContractAddress,
              details.amount,
              format.addHexPrefix(details.refundHash),
            ],
          ],
        );
        return {
          to: this._swapContractAddress,
          data: format.addHexPrefix(erc20CallData),
          ...txParams,
        };
      case EVM.AssetType.ETHER:
        const etherCallData = this._contract.encodeFunctionData(
          this._contract.getFunction('fundWithAdminRefundEnabled'),
          [
            [
              this._orderUUID,
              format.addHexPrefix(details.paymentHash),
              format.addHexPrefix(details.refundHash),
            ],
          ],
        );
        return {
          to: this._swapContractAddress,
          data: format.addHexPrefix(etherCallData),
          value: new Big(details.amount).times(1e18).toString(), // Ether to Wei
          ...txParams,
        };
    }
  }

  /**
   * Get the contract interface for the active asset type
   * @param type The asset type
   */
  private getContractInterfaceForAssetType(type: EVM.AssetType) {
    switch (type) {
      case EVM.AssetType.ERC20:
        return new Interface(ERC20SwapABI);
      case EVM.AssetType.ETHER:
        return new Interface(EtherSwapABI);
      default:
        throw new Error(NetworkError.INVALID_ASSET);
    }
  }

  /**
   * Return if a provider is EIP1193 compliant
   * @param provider The web3 provider
   */
  private isEIP1193Provider(
    provider: Provider | undefined,
  ): provider is EIP1193Provider {
    return provider
      ? provider.send.constructor.name === 'AsyncFunction'
      : false;
  }

  /**
   * Return if a provider is legacy
   * @param provider The web3 provider
   */
  private isLegacyProvider(
    provider: Provider | undefined,
  ): provider is LegacyProvider {
    return provider ? provider.send.constructor.name === 'Function' : false;
  }

  /**
   * Send an unsigned transaction using a supported provider
   * @param unsignedTx The unsigned evm transaction
   */
  private async send(unsignedTx: EvmUnsignedTx) {
    const provider = this._provider;
    if (this.isEIP1193Provider(provider)) {
      return provider.send('eth_sendTransaction', unsignedTx);
    }
    if (this.isLegacyProvider(provider)) {
      return new Promise(resolve => {
        provider.send(
          {
            ...this._sendTransactionJsonRpcPayload,
            params: [unsignedTx],
          },
          (error, result) => resolve(result ? result.result : error),
        );
      });
    }
    throw new Error('Missing or Invalid Provider');
  }
}

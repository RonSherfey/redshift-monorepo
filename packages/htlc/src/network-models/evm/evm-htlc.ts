import {
  ERC20SwapContract,
  EthereumSubnet,
  EtherSwapContract,
  EVM,
  Network,
  NetworkError,
  PartialTxParams,
  SubnetMap,
  SwapContract,
  UnsignedTx,
} from '@radartech/redshift-types';
import Web3 from 'web3';
import { TransactionReceipt } from 'web3/types';
import { addHexPrefix } from '../../utils';
import { BaseHtlc } from '../shared';
import { getContractAddressesForSubnetOrThrow } from './contract-addresses';
import { abi as erc20Abi } from './contract-artifacts/ERC20Swap.json';
import { abi as etherAbi } from './contract-artifacts/EtherSwap.json';

export class EvmHtlc<
  N extends Network,
  O extends EVM.Options = EVM.Options
> extends BaseHtlc<N> {
  private _contract: SwapContract<O>;
  private _assetType: EVM.AssetType;
  private _web3Instance: Web3;
  private _tokenContractAddress: string;
  private _invoiceHash: string;

  /**
   * Get the Swap Contract Instance
   */
  get contract(): SwapContract<O> {
    return this._contract;
  }

  /**
   * Create a new Ethereum HTLC instance
   * @param network The chain network
   * @param subnet The chain subnet
   * @param options The htlc options
   */
  constructor(network: N, subnet: SubnetMap[N], options: O) {
    super(network, subnet);
    this._assetType = options.assetType;
    this._web3Instance = options.web3;
    this._invoiceHash = Web3.utils.sha3(options.invoice);
    this._tokenContractAddress = (options as EVM.ERC20Options).tokenContractAddress;
    this._contract = this.createAssetSwapContractInstance(subnet, options);
  }

  /**
   * Generate, and optionally send, the swap funding transaction
   * @param amount The fund amount in ether
   * @param paymentHash The hash of the payment secret
   * @param shouldBroadcast Whether or not the transaction should be broadcast
   * @param txParams The optional transaction params
   */
  public async fund(
    amount: string,
    paymentHash: string,
    shouldBroadcast: boolean = true,
    txParams?: PartialTxParams,
  ): Promise<UnsignedTx | TransactionReceipt> {
    const unsignedTx = this.createFundTxForAssetType(
      amount,
      paymentHash,
      txParams,
    );

    if (!shouldBroadcast) {
      return unsignedTx;
    }
    return this._web3Instance.eth.sendTransaction(unsignedTx);
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
    txParams?: PartialTxParams,
  ): Promise<UnsignedTx | TransactionReceipt> {
    const unsignedTx = this.createClaimTxForAssetType(paymentSecret, txParams);

    if (!shouldBroadcast) {
      return unsignedTx;
    }
    return this._web3Instance.eth.sendTransaction(unsignedTx);
  }

  /**
   * Generate, and optionally send, the transaction to refund the on-chain asset to the funder
   * @param shouldBroadcast Whether or not the transaction should be broadcast
   * @param txParams The optional transaction params
   */
  public async refund(
    shouldBroadcast: boolean = true,
    txParams?: PartialTxParams,
  ): Promise<UnsignedTx | TransactionReceipt> {
    const unsignedTx = this.createRefundTxForAssetType(txParams);

    if (!shouldBroadcast) {
      return unsignedTx;
    }
    return this._web3Instance.eth.sendTransaction(unsignedTx);
  }

  /**
   * Instantiate the correct contract for the provided subnet and asset
   * @param subnet The Ethereum subnet
   * @param options The Ethereum htlc options
   */
  private createAssetSwapContractInstance(
    subnet: SubnetMap[N],
    options: EVM.Options,
  ) {
    const { erc20Swap, etherSwap } = getContractAddressesForSubnetOrThrow(
      subnet as EthereumSubnet,
    );
    switch (options.assetType) {
      case EVM.AssetType.ERC20:
        return new options.web3.eth.Contract(
          erc20Abi,
          erc20Swap,
        ) as SwapContract<O>;
      case EVM.AssetType.ETHER:
        return new options.web3.eth.Contract(
          etherAbi,
          etherSwap,
        ) as SwapContract<O>;
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
    txParams?: PartialTxParams,
  ) {
    switch (this._assetType) {
      case EVM.AssetType.ERC20:
        const erc20Contract = this.contract as ERC20SwapContract;
        const erc20MethodArgs = erc20Contract.methods
          .fund(
            this._invoiceHash,
            addHexPrefix(paymentHash),
            this._tokenContractAddress,
            amount,
          )
          .encodeABI();
        return {
          to: this.contract.options.address,
          data: erc20MethodArgs,
          ...txParams,
        };
      case EVM.AssetType.ETHER:
        const etherContract = this.contract as EtherSwapContract;
        const etherMethodArgs = etherContract.methods
          .fund(this._invoiceHash, addHexPrefix(paymentHash))
          .encodeABI();
        return {
          to: this.contract.options.address,
          data: etherMethodArgs,
          value: Web3.utils.toWei(amount, 'ether'),
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
    txParams?: PartialTxParams,
  ) {
    switch (this._assetType) {
      case EVM.AssetType.ERC20:
        const erc20Contract = this.contract as ERC20SwapContract;
        const erc20MethodArgs = erc20Contract.methods
          .claim(
            this._tokenContractAddress,
            this._invoiceHash,
            addHexPrefix(paymentSecret),
          )
          .encodeABI();
        return {
          to: this.contract.options.address,
          data: erc20MethodArgs,
          ...txParams,
        };
      case EVM.AssetType.ETHER:
        const etherContract = this.contract as EtherSwapContract;
        const etherMethodArgs = etherContract.methods
          .claim(this._invoiceHash, addHexPrefix(paymentSecret))
          .encodeABI();
        return {
          to: this.contract.options.address,
          data: etherMethodArgs,
          ...txParams,
        };
    }
  }

  /**
   * Create a refund transaction for the provided asset type
   * @param txParams The optional transaction params
   */
  private createRefundTxForAssetType(txParams?: PartialTxParams) {
    switch (this._assetType) {
      case EVM.AssetType.ERC20:
        const erc20Contract = this.contract as ERC20SwapContract;
        const erc20MethodArgs = erc20Contract.methods
          .refund(this._tokenContractAddress, this._invoiceHash)
          .encodeABI();
        return {
          to: this.contract.options.address,
          data: erc20MethodArgs,
          ...txParams,
        };
      case EVM.AssetType.ETHER:
        const etherContract = this.contract as EtherSwapContract;
        const etherMethodArgs = etherContract.methods
          .refund(this._invoiceHash)
          .encodeABI();
        return {
          to: this.contract.options.address,
          data: etherMethodArgs,
          ...txParams,
        };
    }
  }
}

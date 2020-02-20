import { Network, SubnetMap } from '@radar/redshift-types';

export namespace UTXO {
  export type Config = string | RedeemScriptArgs;
  export interface DetailsBase<N extends Network> {
    network: N;
    subnet: SubnetMap[N];
    paymentHashRipemd160: string; // ripemd-160 hash of the payment hash hex string
    refundHashRipemd160?: string; // ripemd-160 hash of the refund hash hex string
    claimerPublicKey: string; // claim public key hex string
    timelockType: LockType; // timelock type (absolute or relative)
    timelockValue: number; // timelock value (block height or block buffer)
    p2shOutputScript: string; // pay to script hash output hex string
    p2shAddress: string; // pay to script hash base58 address
    p2shP2wshAddress: string; // nested pay to witness script address
    p2shP2wshOutputScript: string; // p2sh nested output script hex string
    p2wshAddress: string; // pay to witness script hash address
    p2wshOutputScript: string; // witness output script hex string
    refundP2wpkhAddress: string; // refund p2wpkh address
    refundP2pkhAddress: string; // refund p2pkh address
    redeemScript: string; // redeem script hex string
  }

  export interface DetailsPublicKey<N extends Network> extends DetailsBase<N> {
    refundPublicKey: string; // refund pubkey string
  }

  export interface DetailsPublicKeyHash<N extends Network>
    extends DetailsBase<N> {
    refundPublicKeyHash: string; // refund pubkey hash string
  }

  export type Details<N extends Network> =
    | DetailsPublicKey<N>
    | DetailsPublicKeyHash<N>;

  export interface RedeemScriptArgs {
    claimerPublicKey: string;
    paymentHash: string;
    refundHash?: string;
    refundPublicKey?: string; // refund pubkey string
    refundAddress?: string;
    timelock: TimeLock;
  }

  export type TimeLock = AbsoluteTimeLock | RelativeTimeLock;

  export enum LockType {
    RELATIVE = 'relative',
    ABSOLUTE = 'absolute',
  }

  export interface AbsoluteTimeLock {
    type: LockType.ABSOLUTE;
    blockHeight: number;
  }

  export interface RelativeTimeLock {
    type: LockType.RELATIVE;
    blockBuffer: number;
  }
}

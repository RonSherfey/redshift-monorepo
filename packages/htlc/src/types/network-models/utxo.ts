import { Network, SubnetMap } from '@radar/redshift-types';

export namespace UTXO {
  export type Config = string | RedeemScriptArgs;

  export interface Details<N extends Network> {
    network: N;
    subnet: SubnetMap[N];
    paymentHash: string; // payment hash hex string
    claimerPublicKey: string; // claim public key hex string
    refundPublicKeyHash: string; // refund pubkey hash string
    timelockBlockHeight?: number; // locked until block height number
    nSequence?: number; // number of blocks to lock transaction for after confirmation (relative timelock)
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

  export interface RedeemScriptArgs {
    claimerPublicKey: string;
    paymentHash: string;
    refundAddress: string;
    timelockBlockHeight?: number;
    nSequence?: number;
  }
}

import { Network, SubnetMap } from '@radar/redshift-types';

export namespace UTXO {
  export type Options = string | RedeemScriptArgs;

  export interface Details<N extends Network> {
    network: N;
    subnet: SubnetMap[N];
    payment_hash: string; // payment hash hex string
    destination_public_key: string; // claim public key hex string
    refund_public_key_hash: string; // refund pubkey hash string
    timelock_block_height: number; // locked until block height number
    p2sh_output_script: string; // pay to script hash output hex string
    p2sh_address: string; // pay to script hash base58 address
    p2sh_p2wsh_address: string; // nested pay to witness script address
    p2sh_p2wsh_output_script: string; // p2sh nested output script hex string
    p2wsh_address: string; // pay to witness script hash address
    p2wsh_output_script: string; // witness output script hex string
    refund_p2wpkh_address: string; // refund p2wpkh address
    refund_p2pkh_address: string; // refund p2pkh address
    redeem_script: string; // redeem script hex string
  }

  export interface RedeemScriptArgs {
    destinationPublicKey: string;
    paymentHash: string;
    refundPublicKeyHash: string;
    timelockBlockHeight: number;
  }
}

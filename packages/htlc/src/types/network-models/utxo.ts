import { BIP32 } from 'bip32';
import { Network, Subnet } from '..';
import { SubnetMap } from '../common';

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

/**
 * Bitcoin block result
 */
export interface BlockResult {
  hash: string;
  confirmations: number;
  size: number;
  weight: number;
  height: number;
  version: number;
  versionHex: string;
  merkleroot: string;
  tx: string[];
  time: number;
  mediantime: number;
  nonce: number;
  bits: string;
  difficulty: number;
  chainwork: string;
  nTx: number;
  previousblockhash: string;
}

export interface TxOutput {
  tx_id: string; // tx id for this output
  index: number; // vout index of this output
  tokens: number; // amount of tokens in this output
  address?: string; // output address
  script?: Buffer;
}

export interface KeyPair {
  network: Network;
  subnet: Subnet;
  public_key: string;
  public_key_hash: string;
  private_key: string;
  p2wpkh_address: string;
  p2pkh_address: string;
  index: number;
  key_pair: BIP32;
}

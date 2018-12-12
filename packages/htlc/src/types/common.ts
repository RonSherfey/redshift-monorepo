import { Network, Subnet } from './constants';

export interface UnsignedTx {
  to: string;
  data: string;
  value?: string | number;
}

export interface SwapDetails {
  payment_hash: string; // payment hash hex string
  network: Network;
  subnet: Subnet;
}

export interface UtxoSwapDetails extends SwapDetails {
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

export interface EthereumSwapDetails extends SwapDetails {
  unsigned_funding_tx: UnsignedTx;
}

export interface PartialTxParams {
  nonce?: string | number;
  from?: string;
  gas?: string | number;
  gasPrice?: string | number;
}

export interface RedeemScriptArgs {
  recipientPublicKey: string;
  paymentHash: string;
  refundPublicKeyHash: string;
  timelockBlockHeight: number;
}

/**
 * Redeem Script or args to create new htlc
 */
export type UtxoHtlcOptions = string | RedeemScriptArgs;

export interface TxOutput {
  tx_id: string; // tx id for this output
  address: string; // output address
  script: Buffer;
  tokens: number; // amount of tokens in this output
  index: number; // vout index of this output
}

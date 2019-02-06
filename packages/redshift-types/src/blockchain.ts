import { BIP32 } from 'bip32';
import { Network, Subnet } from './constants';

/**
 * Bitcoin block
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

/**
 * Bitcoin TXO
 */
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

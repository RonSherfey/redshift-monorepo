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
  txId: string; // tx id for this output
  index: number; // vout index of this output
  tokens: number; // amount of tokens in this output
  address?: string; // output address
  script?: Buffer;
  redeemScript?: Buffer;
  witnessScript?: Buffer;
}

export interface FundTxOutput extends TxOutput {
  txHex: string; // The hex encoded tx
}

export interface KeyPair {
  network: Network;
  subnet: Subnet;
  publicKey: string;
  publicKeyHash: string;
  privateKey: string;
  p2wpkhAddress: string;
  p2pkhAddress: string;
  index: number;
  keyPair: BIP32;
}

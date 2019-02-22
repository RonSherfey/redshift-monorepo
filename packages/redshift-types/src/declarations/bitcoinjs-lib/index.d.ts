import { BIP32 } from 'bip32';

declare module 'bitcoinjs-lib' {
  export const bip32: typeof BIP32; // Missing in @types/bitcoinjs-lib
  export interface Block {
    transactions: Transaction[];
    prevHash: Buffer;
  }
}

import bip39 from 'bip39';
import { UtxoRpcClient } from '.';
import { toReversedByteOrderBuffer } from '../../../src/networks/utxo/utils';
import {
  bip32,
  ECPair,
  networks,
  payments,
  TransactionBuilder,
} from '../../../src/overrides/bitcoinjs-lib';
import { KeyPair, Network, Subnet, TxOutput } from '../../../src/types';

/**
 * Generate a key pair from a mnemonic and an index
 * @param network The network
 * @param subnet The network subnet
 * @param mnemonic The mnemonic used to derive the seed
 * @param index The index used to derive the path
 */
export function getKeyPairFromMnemonic(
  network: Network,
  subnet: Subnet,
  mnemonic: string,
  index: number = 0,
): KeyPair {
  if (!bip39.validateMnemonic(mnemonic)) {
    throw new Error('Invalid Mnemonic');
  }
  const seed = bip39.mnemonicToSeed(mnemonic);
  const networkPayload = networks[subnet];
  const root = bip32.fromSeed(seed, networkPayload);
  const keyPair = root.derivePath(`m/0'/0/${index}`);
  const { publicKey } = keyPair;

  return {
    network,
    subnet,
    index,
    public_key_hash: keyPair.identifier.toString('hex'),
    p2wpkh_address: payments.p2wpkh({
      pubkey: publicKey,
      network: networkPayload,
    }).address,
    p2pkh_address: payments.p2pkh({
      pubkey: publicKey,
      network: networkPayload,
    }).address,
    private_key: keyPair.toWIF(),
    public_key: publicKey.toString('hex'),
    key_pair: keyPair,
  };
}

/**
 * Generate the funding transaction and return the raw tx hex
 * @param utxos The unspent funding tx outputs
 * @param amount The funding amount in satoshis
 * @param recipientAddress The recipient of the transaction
 * @param privateKey The private key WIF string used to sign
 * @param shouldSend Whether or not to broadcast the transaction (Default: true)
 */
export async function sendCoins(
  network: Network,
  subnet: Subnet,
  utxos: TxOutput[],
  amount: number,
  recipientAddress: string,
  privateKey: string,
  shouldSend: boolean = true,
): Promise<string | any> {
  const tx = new TransactionBuilder();

  // Add the inputs being spent to the transaction
  utxos.forEach(utxo => {
    tx.addInput(toReversedByteOrderBuffer(utxo.tx_id), utxo.index, 0);
  });

  // Add output containing the p2sh address
  tx.addOutput(recipientAddress, amount);

  // The signing key
  const signingKey = ECPair.fromWIF(privateKey, networks[subnet]);

  // Sign the inputs
  utxos.forEach((_output, i) => {
    tx.sign(i, signingKey);
  });
  const txHex = tx.build().toHex();

  if (!shouldSend) {
    return txHex;
  }
  return new UtxoRpcClient(network, subnet).sendRawTransaction(txHex);
}

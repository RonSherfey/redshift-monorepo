import { SwapError } from '@radar/redshift-types';
import bip65 from 'bip65';
import { address, opcodes, script } from 'bitcoinjs-lib';
import varuint from 'varuint-bitcoin';
import { UTXO } from '../../../types';

/**
 * Convert an iterable of script elements to a hex string
 * @param scriptElements An iterable representation of a script
 * @throws On invalid script
 * @return Hex representation of the scriptElements
 */
function convertScriptElementsToHex(scriptElements: any): string {
  return scriptElements
    .map((element: any) => {
      if (Buffer.isBuffer(element)) {
        return Buffer.concat([varuint.encode(element.length), element]);
      }
      return Buffer.from(element.toString(16), 'hex');
    })
    .reduce((element: any, script: any) => Buffer.concat([element, script]))
    .toString('hex');
}

/**
 * Convert a p2pkh or p2wpkh address to a public key hash
 * @param addr The p2pkh or p2wpkh address
 */
function addressToPublicKeyHash(addr: string): string {
  let publicKeyHash;
  try {
    const details = address.fromBase58Check(addr);
    if (details) {
      publicKeyHash = details.hash;
    }
  } catch (err) {}

  try {
    const details = address.fromBech32(addr);
    if (details) {
      publicKeyHash = details.data;
    }
  } catch (err) {}

  if (!publicKeyHash) {
    throw new Error(SwapError.INVALID_REFUND_ADDRESS);
  }
  return publicKeyHash.toString('hex');
}

/**
 * Generate a swap redeem script for a public key hash refund path.
 * Check if the sha256 of the top item of the stack is the payment hash.
 * If true, push the remote pubkey on the stack.
 * If false, check the lock time, pubkey hash, and push the local pubkey.
 * Check remote or local pubkey signed the transaction.
 * @param claimerPublicKey The public key of the claimer used in the hashlock
 * @param paymentHash Lightning invoice payment hash
 * @param refundAddress Refund p2pkh or p2wpkh address
 * @param timelockBlockHeight Block height at which the swap expires
 * @return The hex representation of the redeem script
 */
export function createSwapRedeemScript(
  scriptArgs: UTXO.RedeemScriptArgs,
): string {
  const refundPublicKeyHash = addressToPublicKeyHash(scriptArgs.refundAddress);
  const [
    claimerPublicKeyBuffer,
    paymentHashBuffer,
    refundPublicKeyHashBuffer,
  ] = [
    scriptArgs.claimerPublicKey,
    scriptArgs.paymentHash,
    refundPublicKeyHash,
  ].map(i => Buffer.from(i, 'hex'));
  const cltvBuffer = script.number.encode(
    bip65.encode({ blocks: scriptArgs.timelockBlockHeight }),
  );

  const swapScript = [
    opcodes.OP_DUP,
    opcodes.OP_SHA256,
    paymentHashBuffer,
    opcodes.OP_EQUAL,
    opcodes.OP_IF,
    opcodes.OP_DROP,
    claimerPublicKeyBuffer,
    opcodes.OP_ELSE,
    cltvBuffer,
    opcodes.OP_CHECKLOCKTIMEVERIFY,
    opcodes.OP_DROP,
    opcodes.OP_DUP,
    opcodes.OP_HASH160,
    refundPublicKeyHashBuffer,
    opcodes.OP_EQUALVERIFY,
    opcodes.OP_ENDIF,
    opcodes.OP_CHECKSIG,
  ];
  return convertScriptElementsToHex(swapScript);
}

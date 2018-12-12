import bip65 from 'bip65';
import varuint from 'varuint-bitcoin';
import { opcodes, script } from '../../../overrides/bitcoinjs-lib';
import { RedeemScriptArgs } from '../../../types';

/**
 *
 * Convert an iterable of script elements to a hex string
 *
 * @param {String} scriptElements - an iterable representation of a script
 * @throws {Error} on invalid script
 * @return {String} hex representation of the scriptElements
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
 *
 * Generate a swap redeem script for a public key hash refund path.
 *
 * Check if the sha256 of the top item of the stack is the payment hash
 * if true push the remote pubkey on the stack
 * if false check the lock time, pubkey hash, and push the local pubkey
 * Check remote or local pubkey signed the transaction
 *
 * @param {String} recipientPublicKey - destination address for the hashlock
 * @param {String} paymentHash - lightning invoice payment hash
 * @param {String} refundPublicKeyHash - refund key hash for the CLTV op
 * @param {Number} timelockBlockHeight - block height at which the swap expires
 * @return {String} the hex representation of the redeem script
 */
export function createSwapRedeemScript(scriptArgs: RedeemScriptArgs): string {
  const [
    recipientPublicKeyBuffer,
    paymentHashBuffer,
    refundPublicKeyHashBuffer,
  ] = [
    scriptArgs.recipientPublicKey,
    scriptArgs.paymentHash,
    scriptArgs.refundPublicKeyHash,
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
    recipientPublicKeyBuffer,
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

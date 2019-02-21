import {
  DecompiledOpCode,
  Network,
  SubnetMap,
  SwapError,
} from '@radar/redshift-types';
import { crypto, payments, script } from 'bitcoinjs-lib';
import { UTXO } from '../../../types';
import { getBitcoinJSNetwork } from './bitcoinjs-lib';

/**
 *
 * Decompiles a redeem script and constructs a SwapDetails object
 * @param {Subnet} subnet - the network subnet the redeem script will execute on
 * @param {String} redeemScriptHex - the hex representation of the redeem script
 * @throws {Error} if the redeemScriptHex is of unknown length or contains unexpected OPs
 * @return {SwapDetails}
 */
export function getSwapRedeemScriptDetails<N extends Network>(
  network: N,
  subnet: SubnetMap[N],
  redeemScriptHex: string,
): UTXO.Details<N> {
  const networkPayload = getBitcoinJSNetwork(network, subnet);
  const redeemScriptBuffer = Buffer.from(redeemScriptHex, 'hex');
  const scriptAssembly = script
    .toASM(script.decompile(redeemScriptBuffer))
    .split(' ');

  let destinationPublicKey;
  let paymentHash;
  let cltv;
  let refundPublicKeyHash;

  switch (scriptAssembly.length) {
    case 12:
      {
        // public key redeem swap script
        const [
          OP_SHA256,
          decompiledPaymentHash,
          OP_EQUAL,
          OP_IF,
          decompiledDestinationPublicKey,
          OP_ELSE,
          decompiledCltv,
          OP_CHECKLOCKTIMEVERIFY,
          OP_DROP,
          decompiledRefundPublicKey,
          OP_ENDIF,
          OP_CHECKSIG,
        ] = scriptAssembly;

        if (OP_SHA256 !== DecompiledOpCode.OP_SHA256) {
          throw new Error(SwapError.EXPECTED_OP_SHA256);
        }

        if (OP_EQUAL !== DecompiledOpCode.OP_EQUAL) {
          throw new Error(SwapError.EXPECTED_OP_EQUAL);
        }

        if (OP_IF !== DecompiledOpCode.OP_IF) {
          throw new Error(SwapError.EXPECTED_OP_IF);
        }

        if (OP_ELSE !== DecompiledOpCode.OP_ELSE) {
          throw new Error(SwapError.EXPECTED_OP_ELSE);
        }

        if (
          OP_CHECKLOCKTIMEVERIFY !== DecompiledOpCode.OP_CHECKLOCKTIMEVERIFY
        ) {
          throw new Error(SwapError.EXPECTED_OP_CHECKLOCKTIMEVERIFY);
        }

        if (OP_DROP !== DecompiledOpCode.OP_DROP) {
          throw new Error(SwapError.EXPECTED_OP_DROP);
        }

        if (OP_ENDIF !== DecompiledOpCode.OP_ENDIF) {
          throw new Error(SwapError.EXPECTED_OP_ENDIF);
        }

        if (OP_CHECKSIG !== DecompiledOpCode.OP_CHECKSIG) {
          throw new Error(SwapError.EXPECTED_OP_CHECKSIG);
        }

        if (
          !decompiledDestinationPublicKey ||
          decompiledDestinationPublicKey.length !== 66
        ) {
          throw new Error(SwapError.EXPECTED_VALID_DESTINATION_PUBKEY);
        }

        if (
          !decompiledRefundPublicKey ||
          decompiledRefundPublicKey.length !== 66
        ) {
          throw new Error(SwapError.EXPECTED_VALID_REFUND_PUBKEY);
        }

        destinationPublicKey = decompiledDestinationPublicKey;
        refundPublicKeyHash = crypto
          .hash160(Buffer.from(decompiledRefundPublicKey, 'hex'))
          .toString('hex');
        cltv = decompiledCltv;
        paymentHash = decompiledPaymentHash;
      }
      break;

    case 17:
      {
        // public key hash redeem swap script
        const [
          OP_DUP,
          OP_SHA256,
          decompiledPaymentHash,
          OP_EQUAL,
          OP_IF,
          OP_DROP,
          decompiledDestinationPublicKey,
          OP_ELSE,
          decompiledCltv,
          OP_CHECKLOCKTIMEVERIFY,
          OP_DROP2,
          OP_DUP2,
          OP_HASH160,
          decompiledRefundPublicKeyHash,
          OP_EQUALVERIFY,
          OP_ENDIF,
          OP_CHECKSIG,
        ] = scriptAssembly;

        if (OP_DUP !== DecompiledOpCode.OP_DUP) {
          throw new Error(SwapError.EXPECTED_OP_DUP);
        }

        if (OP_SHA256 !== DecompiledOpCode.OP_SHA256) {
          throw new Error(SwapError.EXPECTED_OP_SHA256);
        }

        if (OP_EQUAL !== DecompiledOpCode.OP_EQUAL) {
          throw new Error(SwapError.EXPECTED_OP_EQUAL);
        }

        if (OP_IF !== DecompiledOpCode.OP_IF) {
          throw new Error(SwapError.EXPECTED_OP_IF);
        }

        if (OP_DROP !== DecompiledOpCode.OP_DROP) {
          throw new Error(SwapError.EXPECTED_OP_DROP);
        }

        if (OP_ELSE !== DecompiledOpCode.OP_ELSE) {
          throw new Error(SwapError.EXPECTED_OP_ELSE);
        }

        if (
          OP_CHECKLOCKTIMEVERIFY !== DecompiledOpCode.OP_CHECKLOCKTIMEVERIFY
        ) {
          throw new Error(SwapError.EXPECTED_OP_CHECKLOCKTIMEVERIFY);
        }

        if (OP_DROP2 !== DecompiledOpCode.OP_DROP) {
          throw new Error(SwapError.EXPECTED_OP_DROP);
        }

        if (OP_DUP2 !== DecompiledOpCode.OP_DUP) {
          throw new Error(SwapError.EXPECTED_OP_DUP);
        }

        if (OP_HASH160 !== DecompiledOpCode.OP_HASH160) {
          throw new Error(SwapError.EXPECTED_OP_HASH160);
        }

        if (OP_EQUALVERIFY !== DecompiledOpCode.OP_EQUALVERIFY) {
          throw new Error(SwapError.EXPECTED_OP_EQUALVERIFY);
        }

        if (OP_ENDIF !== DecompiledOpCode.OP_ENDIF) {
          throw new Error(SwapError.EXPECTED_OP_ENDIF);
        }

        if (OP_CHECKSIG !== DecompiledOpCode.OP_CHECKSIG) {
          throw new Error(SwapError.EXPECTED_OP_CHECKSIG);
        }

        if (
          !decompiledDestinationPublicKey ||
          decompiledDestinationPublicKey.length !== 66
        ) {
          throw new Error(SwapError.EXPECTED_VALID_DESTINATION_PUBKEY);
        }

        if (
          !decompiledRefundPublicKeyHash ||
          decompiledRefundPublicKeyHash.length !== 40
        ) {
          throw new Error(SwapError.EXPECTED_VALID_REFUND_PUBKEY);
        }

        destinationPublicKey = decompiledDestinationPublicKey;
        refundPublicKeyHash = decompiledRefundPublicKeyHash;
        cltv = decompiledCltv;
        paymentHash = decompiledPaymentHash;
      }
      break;

    default:
      throw new Error(SwapError.INVALID_REDEEM_SCRIPT_LENGTH);
  }

  // TODO add support for non-segwit chains
  const p2shResult = payments.p2sh({
    network: networkPayload,
    redeem: { output: redeemScriptBuffer },
  });
  const p2shOutput = p2shResult.output;
  const p2shAddress = p2shResult.address;

  const p2wshResult = payments.p2wsh({
    network: networkPayload,
    redeem: { output: redeemScriptBuffer },
  });
  const p2wshOutput = p2wshResult.output;
  const p2wshAddress = p2wshResult.address;

  const p2shWrappedWitnessResult = payments.p2sh({
    network: networkPayload,
    redeem: { output: p2wshOutput },
  });
  const p2shWrappedWitnessOutput = p2shWrappedWitnessResult.output;
  const p2shWrappedWitnessAddress = p2shWrappedWitnessResult.address;

  const refundPublicKeyHashBuffer = Buffer.from(refundPublicKeyHash, 'hex');
  const p2pkhRefundAddress = payments.p2pkh({
    network: networkPayload,
    hash: refundPublicKeyHashBuffer,
  }).address;
  const p2wpkhRefundAddress = payments.p2wpkh({
    network: networkPayload,
    hash: refundPublicKeyHashBuffer,
  }).address;

  const timelockBlockHeight = Buffer.from(cltv, 'hex').readUIntLE(
    0,
    cltv.length / 2,
  );

  return {
    network,
    subnet,
    destination_public_key: destinationPublicKey,
    payment_hash: paymentHash,
    refund_public_key_hash: refundPublicKeyHash,
    timelock_block_height: timelockBlockHeight,
    p2sh_output_script: p2shOutput.toString('hex'),
    p2sh_address: p2shAddress,
    p2sh_p2wsh_address: p2shWrappedWitnessAddress,
    p2sh_p2wsh_output_script: p2shWrappedWitnessOutput.toString('hex'),
    p2wsh_address: p2wshAddress,
    p2wsh_output_script: p2wshOutput.toString('hex'),
    refund_p2wpkh_address: p2wpkhRefundAddress,
    refund_p2pkh_address: p2pkhRefundAddress,
    redeem_script: redeemScriptHex,
  };
}

import {
  DecompiledOpCode,
  Network,
  SubnetMap,
  SwapError,
} from '@radar/redshift-types';
import { crypto, payments, script } from 'bitcoinjs-lib';
import { UTXO } from '../../../types';
import { getBitcoinJSNetwork } from './bitcoinjs-lib';
import { makeHexEven } from './format-utils';

/**
 * Build the timelock object using the decompiled timelock opcode and value
 * @param timelockOpcode The timelock opcode
 * @param timelockValue The timelock value
 */
function getTimeLockObjectFromDecompiledOpcode(
  timelockOpcode: DecompiledOpCode,
  timelockValue: string,
): UTXO.TimeLock {
  switch (timelockOpcode) {
    case DecompiledOpCode.OP_CHECKSEQUENCEVERIFY: {
      let sanitizedTimeLockValue = timelockValue;
      if (timelockValue.startsWith('OP_')) {
        // If the timelock is less than 17, the decode script thinks its an opcode.
        // We must strip the OP_ prefix and manually convert to hex.
        // https://github.com/bitcoinjs/bitcoinjs-lib/issues/1485
        sanitizedTimeLockValue = Number(timelockValue.slice(3)).toString(16);
      }
      sanitizedTimeLockValue = makeHexEven(sanitizedTimeLockValue);
      return {
        type: UTXO.LockType.RELATIVE,
        blockBuffer: Buffer.from(sanitizedTimeLockValue, 'hex').readUIntLE(
          0,
          sanitizedTimeLockValue.length / 2,
        ),
      };
    }
    case DecompiledOpCode.OP_CHECKLOCKTIMEVERIFY: {
      const sanitizedTimeLockValue = makeHexEven(timelockValue);
      return {
        type: UTXO.LockType.ABSOLUTE,
        blockHeight: Buffer.from(sanitizedTimeLockValue, 'hex').readUIntLE(
          0,
          sanitizedTimeLockValue.length / 2,
        ),
      };
    }
    default:
      throw new Error(SwapError.INVALID_TIMELOCK_METHOD);
  }
}

/**
 * Get the timelock value for the active lock type
 * @param timelock The timelock object
 */
function getTimelockValue(timelock: UTXO.TimeLock) {
  switch (timelock.type) {
    case UTXO.LockType.ABSOLUTE:
      return timelock.blockHeight;
    case UTXO.LockType.RELATIVE:
      return timelock.blockBuffer;
  }
}

/**
 * Decompiles a redeem script and constructs a Details object
 * @param subnet The network subnet the redeem script will execute on
 * @param redeemScriptHex The hex representation of the redeem script
 * @throws If the redeemScriptHex is of unknown length or contains unexpected OPs
 */
export function getSwapRedeemScriptDetails<N extends Network>(
  network: N,
  subnet: SubnetMap[N],
  redeemScriptHex: string,
): UTXO.Details<N> {
  const networkPayload = getBitcoinJSNetwork(network, subnet);
  const redeemScriptBuffer = Buffer.from(redeemScriptHex, 'hex');
  const scriptAssembly = script
    .toASM(script.decompile(redeemScriptBuffer) || new Buffer(''))
    .split(' ');

  let claimerPublicKey: string;
  let paymentHashRipemd160: string;
  let timelock: UTXO.TimeLock;
  let refundPublicKeyHash: string;

  switch (scriptAssembly.length) {
    case 12:
      {
        // public key redeem swap script
        const [
          OP_HASH160,
          decompiledPaymentHashRipemd160,
          OP_EQUAL,
          OP_IF,
          decompiledClaimerPublicKey,
          OP_ELSE,
          decompiledTimeLockValue,
          OP_TIMELOCKMETHOD, // should be either OP_CHECKSEQUENCEVERIFY or OP_CHECKLOCKTIMEVERIFY
          OP_DROP,
          decompiledRefundPublicKey,
          OP_ENDIF,
          OP_CHECKSIG,
        ] = scriptAssembly;

        if (OP_HASH160 !== DecompiledOpCode.OP_HASH160) {
          throw new Error(SwapError.EXPECTED_OP_HASH160);
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
          OP_TIMELOCKMETHOD !== DecompiledOpCode.OP_CHECKSEQUENCEVERIFY &&
          OP_TIMELOCKMETHOD !== DecompiledOpCode.OP_CHECKLOCKTIMEVERIFY
        ) {
          throw new Error(SwapError.EXPECTED_OP_TIMELOCKMETHOD);
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
          !decompiledClaimerPublicKey ||
          decompiledClaimerPublicKey.length !== 66
        ) {
          throw new Error(SwapError.EXPECTED_VALID_CLAIMER_PUBKEY);
        }

        if (
          !decompiledRefundPublicKey ||
          decompiledRefundPublicKey.length !== 66
        ) {
          throw new Error(SwapError.EXPECTED_VALID_REFUND_PUBKEY);
        }

        claimerPublicKey = decompiledClaimerPublicKey;
        refundPublicKeyHash = crypto
          .hash160(Buffer.from(decompiledRefundPublicKey, 'hex'))
          .toString('hex');
        paymentHashRipemd160 = decompiledPaymentHashRipemd160;

        timelock = getTimeLockObjectFromDecompiledOpcode(
          OP_TIMELOCKMETHOD,
          decompiledTimeLockValue,
        );
      }
      break;

    case 17:
      {
        // public key hash redeem swap script
        const [
          OP_DUP,
          OP_HASH160,
          decompiledPaymentHashRipemd160,
          OP_EQUAL,
          OP_IF,
          OP_DROP,
          decompiledClaimerPublicKey,
          OP_ELSE,
          decompiledTimeLockValue,
          OP_TIMELOCKMETHOD,
          OP_DROP2,
          OP_DUP2,
          OP_HASH1602,
          decompiledRefundPublicKeyHash,
          OP_EQUALVERIFY,
          OP_ENDIF,
          OP_CHECKSIG,
        ] = scriptAssembly;

        if (OP_DUP !== DecompiledOpCode.OP_DUP) {
          throw new Error(SwapError.EXPECTED_OP_DUP);
        }

        if (OP_HASH160 !== DecompiledOpCode.OP_HASH160) {
          throw new Error(SwapError.EXPECTED_OP_HASH160);
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
          OP_TIMELOCKMETHOD !== DecompiledOpCode.OP_CHECKSEQUENCEVERIFY &&
          OP_TIMELOCKMETHOD !== DecompiledOpCode.OP_CHECKLOCKTIMEVERIFY
        ) {
          throw new Error(SwapError.EXPECTED_OP_TIMELOCKMETHOD);
        }

        if (OP_DROP2 !== DecompiledOpCode.OP_DROP) {
          throw new Error(SwapError.EXPECTED_OP_DROP);
        }

        if (OP_DUP2 !== DecompiledOpCode.OP_DUP) {
          throw new Error(SwapError.EXPECTED_OP_DUP);
        }

        if (OP_HASH1602 !== DecompiledOpCode.OP_HASH160) {
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
          !decompiledClaimerPublicKey ||
          decompiledClaimerPublicKey.length !== 66
        ) {
          throw new Error(SwapError.EXPECTED_VALID_CLAIMER_PUBKEY);
        }

        if (
          !decompiledRefundPublicKeyHash ||
          decompiledRefundPublicKeyHash.length !== 40
        ) {
          throw new Error(SwapError.EXPECTED_VALID_REFUND_PUBKEY);
        }

        claimerPublicKey = decompiledClaimerPublicKey;
        refundPublicKeyHash = decompiledRefundPublicKeyHash;
        paymentHashRipemd160 = decompiledPaymentHashRipemd160;

        timelock = getTimeLockObjectFromDecompiledOpcode(
          OP_TIMELOCKMETHOD,
          decompiledTimeLockValue,
        );
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

  return {
    network,
    subnet,
    claimerPublicKey,
    paymentHashRipemd160,
    refundPublicKeyHash,
    timelockType: timelock.type,
    timelockValue: getTimelockValue(timelock),
    p2shAddress: p2shAddress || '',
    p2wshAddress: p2wshAddress || '',
    p2shP2wshAddress: p2shWrappedWitnessAddress || '',
    p2shOutputScript: (p2shOutput || '').toString('hex'),
    p2shP2wshOutputScript: (p2shWrappedWitnessOutput || '').toString('hex'),
    p2wshOutputScript: (p2wshOutput || '').toString('hex'),
    refundP2wpkhAddress: p2wpkhRefundAddress || '',
    refundP2pkhAddress: p2pkhRefundAddress || '',
    redeemScript: redeemScriptHex || '',
  };
}

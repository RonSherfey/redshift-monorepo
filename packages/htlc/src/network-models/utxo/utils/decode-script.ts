import {
  DecompiledOpCode,
  Network,
  SubnetMap,
  SwapError,
} from '@radar/redshift-types';
import Ajv from 'ajv';
import { payments, script } from 'bitcoinjs-lib';
// @ts-ignore
import {
  uTXOAdminRefundPubKeyHashRedeemScriptSchema,
  uTXOAdminRefundPubKeyRedeemScriptSchema,
  uTXOPubKeyHashRedeemScriptSchema,
  uTXOPubKeyRedeemScriptSchema,
} from '../../../schemas';
import { UTXO } from '../../../types';
import { getBitcoinJSNetwork } from './bitcoinjs-lib';
import { makeHexEven } from './format-utils';

const ajv = new Ajv({ allErrors: true, schemaId: 'auto' });
require('ajv-errors')(ajv);
/**
 * Build the timelock object using the decompiled timelock opcode and value
 * @param timelockValue The timelock value
 * @param timelockOpcode The timelock opcode
 */
function getTimeLockObjectFromDecompiledOpcode(
  timelockValue: string,
  timelockOpcode: string,
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
 * Note: All scripts lock to a refund public key hash, which allows users
 * to provide a refund address, rather than public key, for UX purposes
 * @param network The network the redeem script will execute on
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
  let refundHashRipemd160: string | undefined;
  let timelock: UTXO.TimeLock;
  let refundPublicKeyHash: string | undefined;
  let refundPublicKey: string | undefined;

  // Admin refund disabled
  switch (scriptAssembly.length) {
    case 14:
      {
        // adminRefund disabled, refundPublicKey
        const valid = ajv.validate(
          uTXOPubKeyRedeemScriptSchema,
          scriptAssembly,
        );
        if (!valid && ajv.errors) {
          throw new Error(ajv.errors && ajv.errors[0].message);
        }

        claimerPublicKey = scriptAssembly[6];
        refundPublicKey = scriptAssembly[11];
        paymentHashRipemd160 = scriptAssembly[2];

        timelock = getTimeLockObjectFromDecompiledOpcode(
          scriptAssembly[8],
          scriptAssembly[9],
        );
      }
      break;
    case 17:
      {
        // adminRefund disabled, refundPublicKeyHash
        const valid = ajv.validate(
          uTXOPubKeyHashRedeemScriptSchema,
          scriptAssembly,
        );
        if (!valid && ajv.errors) {
          throw new Error(ajv.errors && ajv.errors[0].message);
        }

        claimerPublicKey = scriptAssembly[6];
        refundPublicKeyHash = scriptAssembly[13];
        paymentHashRipemd160 = scriptAssembly[2];

        timelock = getTimeLockObjectFromDecompiledOpcode(
          scriptAssembly[8],
          scriptAssembly[9],
        );
      }
      break;
    case 20:
      {
        // adminRefund, publicKey
        const valid = ajv.validate(
          uTXOAdminRefundPubKeyRedeemScriptSchema,
          scriptAssembly,
        );
        if (!valid && ajv.errors) {
          throw new Error(ajv.errors && ajv.errors[0].message);
        }

        paymentHashRipemd160 = scriptAssembly[2];
        claimerPublicKey = scriptAssembly[6];
        refundHashRipemd160 = scriptAssembly[10];
        refundPublicKey = scriptAssembly[17];

        timelock = getTimeLockObjectFromDecompiledOpcode(
          scriptAssembly[13],
          scriptAssembly[14],
        );
      }
      break;
    case 23:
      {
        // adminRefund enabled, publicKeyHash
        const valid = ajv.validate(
          uTXOAdminRefundPubKeyHashRedeemScriptSchema,
          scriptAssembly,
        );
        if (!valid && ajv.errors) {
          throw new Error(ajv.errors && ajv.errors[0].message);
        }

        paymentHashRipemd160 = scriptAssembly[2];
        claimerPublicKey = scriptAssembly[6];
        refundHashRipemd160 = scriptAssembly[10];
        refundPublicKeyHash = scriptAssembly[19];

        timelock = getTimeLockObjectFromDecompiledOpcode(
          scriptAssembly[13],
          scriptAssembly[14],
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

  let refundPublicKeyHashBuffer: Buffer | undefined;
  if (refundPublicKeyHash) {
    refundPublicKeyHashBuffer = Buffer.from(refundPublicKeyHash, 'hex');
  } else if (refundPublicKey) {
    refundPublicKeyHashBuffer = payments.p2pkh({
      pubkey: Buffer.from(refundPublicKey, 'hex'),
      network: networkPayload,
    }).hash;
  }
  const p2pkhRefundAddress = payments.p2pkh({
    network: networkPayload,
    hash: refundPublicKeyHashBuffer,
  }).address;
  const p2wpkhRefundAddress = payments.p2wpkh({
    network: networkPayload,
    hash: refundPublicKeyHashBuffer,
  }).address;

  const decodedScript = {
    network,
    subnet,
    claimerPublicKey,
    paymentHashRipemd160,
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
  } as UTXO.Details<N>;

  if (refundHashRipemd160) {
    decodedScript.refundHashRipemd160 = refundHashRipemd160;
  }

  if (refundPublicKeyHash) {
    (decodedScript as UTXO.DetailsPublicKeyHash<
      N
    >).refundPublicKeyHash = refundPublicKeyHash;
  }

  if (refundPublicKey) {
    (decodedScript as UTXO.DetailsPublicKey<
      N
    >).refundPublicKey = refundPublicKey;
  }

  return decodedScript;
}

import { BitcoinSubnet, Network } from '@radar/redshift-types';
import { format } from '@radar/redshift-utils';
import { crypto } from 'bitcoinjs-lib';
import uuidv4 from 'uuid/v4';
import { UTXO } from '../../../src';
import { getTestingMnemonic } from './env-vars';
import { getKeyPairFromMnemonic } from './wallet';

/**
 * Generate a random hex string
 */
function generateRandomHexString() {
  return Math.random()
    .toString(16)
    .replace('0.', '')
    .substring(1);
}

/**
 * SHA256 hash a hex string and return the hashed string value
 * @param str The hex string to hash
 */
function sha256Hash(str: string) {
  return crypto.sha256(Buffer.from(str, 'hex')).toString('hex');
}

/**
 * Generate random invoice, secret, and hash values for testing
 * @param prefixHex Whether or not the hex secret & hash should be prefixed
 */
function generateRandomIdSecretAndHashValues(prefixHex: boolean) {
  const orderUUID = uuidv4();
  let paymentSecret = sha256Hash(generateRandomHexString());
  let paymentHash = sha256Hash(paymentSecret);
  let refundSecret = sha256Hash(generateRandomHexString());
  let refundHash = sha256Hash(paymentSecret);

  if (prefixHex) {
    paymentSecret = format.addHexPrefix(paymentSecret);
    paymentHash = format.addHexPrefix(paymentHash);
    refundSecret = format.addHexPrefix(paymentSecret);
    refundHash = format.addHexPrefix(paymentHash);
  }
  return {
    orderUUID,
    paymentSecret,
    paymentHash,
    refundSecret,
    refundHash,
    amount: Math.random()
      .toFixed(2)
      .toString(),
  };
}

/**
 * Network specific data and configuration
 */
const networkSpecificConfigs = {
  bitcoin: {
    unit: {
      valid: {
        absoluteTimeLock: {
          redeemScript:
            '76a914c15949a2e2a414b5c641f32c4c2ee07be644e165876375210398c9a44bed9f59c6041a574602aab0af6a08f3f0fb847fd9a167f7afd71b8d256776a9145c86f3f039e4b4f0bd46780dcc73e45db4040683876402e10bb1687576a9143f1857b3db895b4d481a46e5a0129cb2b04781c88868ac',
          htlc: {
            args: {
              claimerPublicKey:
                '0398c9a44bed9f59c6041a574602aab0af6a08f3f0fb847fd9a167f7afd71b8d25',
              paymentHash:
                'e0531eaf4c51c77afc74a0ae13ebe7b1832c4a1c864abde6ca3e2eb280aa413d',
              refundHash:
                'd114f92c11e639d7f715c5ab314ae9614d5daa12754a0f07e5c6b55421237c67',
              refundAddress: 'ST3cmHBZSa5KsDrbgFMmDaj78DhDa9US3J',
              timelock: {
                type: UTXO.LockType.ABSOLUTE as UTXO.LockType.ABSOLUTE, // cast to narrow type
                blockHeight: 3041,
              },
            },
            details: {
              network: 'bitcoin',
              subnet: 'simnet',
              claimerPublicKey:
                '0398c9a44bed9f59c6041a574602aab0af6a08f3f0fb847fd9a167f7afd71b8d25',
              paymentHashRipemd160: 'c15949a2e2a414b5c641f32c4c2ee07be644e165',
              refundHashRipemd160: '5c86f3f039e4b4f0bd46780dcc73e45db4040683',
              refundPublicKeyHash: '3f1857b3db895b4d481a46e5a0129cb2b04781c8',
              timelockType: UTXO.LockType.ABSOLUTE,
              timelockValue: 3041,
              p2shOutputScript:
                'a9146770d4a681e134dce5b39dc2b319bc2af25fbc8e87',
              p2shAddress: 'rf18sjADU2pGHQkgq2t5anbuF38eSDXDcx',
              p2shP2wshAddress: 'rax5LMmSgk3rYih3ycv8s9zFeoMgzunwmp',
              p2shP2wshOutputScript:
                'a9143afc1fb7da97e69395f4e18f695138760f642ccb87',
              p2wshAddress:
                'sb1qj9jxecc09z2jlauqyrlswntnddrsvpym8r6tyc3nfxjtl28gfm3qc4e4w7',
              p2wshOutputScript:
                '002091646ce30f28952ff78020ff074d736b4706049b38f4b2623349a4bfa8e84ee2',
              refundP2wpkhAddress: 'sb1q8uv90v7m39d56jq6gmj6qy5uk2cy0qwgfu40g6',
              refundP2pkhAddress: 'ST3cmHBZSa5KsDrbgFMmDaj78DhDa9US3J',
              redeemScript:
                '76a914c15949a2e2a414b5c641f32c4c2ee07be644e165876375210398c9a44bed9f59c6041a574602aab0af6a08f3f0fb847fd9a167f7afd71b8d256776a9145c86f3f039e4b4f0bd46780dcc73e45db4040683876402e10bb1687576a9143f1857b3db895b4d481a46e5a0129cb2b04781c88868ac',
            },
          },
        },
        relativeTimeLock: {
          redeemScript:
            '76a914c15949a2e2a414b5c641f32c4c2ee07be644e165876375210398c9a44bed9f59c6041a574602aab0af6a08f3f0fb847fd9a167f7afd71b8d256776a9145c86f3f039e4b4f0bd46780dcc73e45db404068387640114b2687576a9143f1857b3db895b4d481a46e5a0129cb2b04781c88868ac',
          htlc: {
            args: {
              claimerPublicKey:
                '0398c9a44bed9f59c6041a574602aab0af6a08f3f0fb847fd9a167f7afd71b8d25',
              paymentHash:
                'e0531eaf4c51c77afc74a0ae13ebe7b1832c4a1c864abde6ca3e2eb280aa413d',
              refundAddress: 'ST3cmHBZSa5KsDrbgFMmDaj78DhDa9US3J',
              refundHash:
                'd114f92c11e639d7f715c5ab314ae9614d5daa12754a0f07e5c6b55421237c67',
              timelock: {
                type: UTXO.LockType.RELATIVE as UTXO.LockType.RELATIVE, // cast to narrow type
                blockBuffer: 20,
              },
            },
            details: {
              network: 'bitcoin',
              subnet: 'simnet',
              claimerPublicKey:
                '0398c9a44bed9f59c6041a574602aab0af6a08f3f0fb847fd9a167f7afd71b8d25',
              paymentHashRipemd160: 'c15949a2e2a414b5c641f32c4c2ee07be644e165',
              refundHashRipemd160: '5c86f3f039e4b4f0bd46780dcc73e45db4040683',
              refundPublicKeyHash: '3f1857b3db895b4d481a46e5a0129cb2b04781c8',
              timelockType: UTXO.LockType.RELATIVE,
              timelockValue: 20,
              p2shOutputScript:
                'a9147c0c4664f688d45745a85408588336af26d4b98d87',
              p2shAddress: 'rgt6c2NaCBuFjGZSg46J7FxKJRzvRifWwa',
              p2shP2wshAddress: 'riNBRspCJXF4jSpEExTgdnrX4zCcmY2HCJ',
              p2shP2wshOutputScript:
                'a9148c54134fa9798c9a6dee7b1d45d6a5fb63ca37f887',
              p2wshAddress:
                'sb1q6202tcsvefl7qc7p5xlesgu43e72f6frn4s68ejw0tjz4u5cu2kq8vs8fv',
              p2wshOutputScript:
                '0020d29ea5e20cca7fe063c1a1bf9823958e7ca4e9239d61a3e64e7ae42af298e2ac',
              refundP2wpkhAddress: 'sb1q8uv90v7m39d56jq6gmj6qy5uk2cy0qwgfu40g6',
              refundP2pkhAddress: 'ST3cmHBZSa5KsDrbgFMmDaj78DhDa9US3J',
              redeemScript:
                '76a914c15949a2e2a414b5c641f32c4c2ee07be644e165876375210398c9a44bed9f59c6041a574602aab0af6a08f3f0fb847fd9a167f7afd71b8d256776a9145c86f3f039e4b4f0bd46780dcc73e45db404068387640114b2687576a9143f1857b3db895b4d481a46e5a0129cb2b04781c88868ac',
            },
          },
        },
      },
      invalid: {
        redeemScript: 'not_a_redeem_script',
      },
    },
    integration: {
      funder: getKeyPairFromMnemonic(
        Network.BITCOIN,
        BitcoinSubnet.SIMNET,
        getTestingMnemonic(),
        0,
      ),
      claimer: getKeyPairFromMnemonic(
        Network.BITCOIN,
        BitcoinSubnet.SIMNET,
        getTestingMnemonic(),
        1,
      ),
      refunder: getKeyPairFromMnemonic(
        Network.BITCOIN,
        BitcoinSubnet.SIMNET,
        getTestingMnemonic(),
        2,
      ),
    },
  },
  ethereum: {
    accounts: [
      '0x5409ED021D9299bf6814279A6A1411A7e866A631',
      '0x6Ecbe1DB9EF729CBe972C83Fb886247691Fb6beb',
      '0xE36Ea790bc9d7AB70C55260C66D52b1eca985f84',
      '0xE834EC434DABA538cd1b9Fe1582052B880BD7e63',
      '0x78dc5D2D739606d31509C31d654056A45185ECb6',
      '0xA8dDa8d7F5310E4A9E24F8eBA77E091Ac264f872',
      '0x06cEf8E666768cC40Cc78CF93d9611019dDcB628',
      '0x4404ac8bd8F9618D27Ad2f1485AA1B2cFD82482D',
      '0x7457d5E02197480Db681D3fdF256c7acA21bDc12',
      '0x91c987bf62D25945dB517BDAa840A6c661374402',
    ],
  },
};

/**
 * Shared configuration
 */
const sharedConfig = {
  random: {
    args: (prefixHex: boolean = false) =>
      generateRandomIdSecretAndHashValues(prefixHex),
  },
  pattern: {
    hex: /^(0x)?[0-9a-fA-F]+$/,
    hex256Bit: /^(0x)?[0-9a-fA-F]{64}$/,
    isoDateTime: /^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?(Z)?$/,
  },
};

/**
 * The configuration for the active network
 */
export const config = {
  ...sharedConfig,
  ...networkSpecificConfigs,
};

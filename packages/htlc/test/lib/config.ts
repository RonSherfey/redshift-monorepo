/**
 * Network specific data and configuration
 */
const networkSpecificConfigs = {
  bitcoin: {
    valid: {
      redeemScript:
        '76a820e0531eaf4c51c77afc74a0ae13ebe7b1832c4a1c864abde6ca3e2eb280aa413d876375210398c9a44bed9f59c6041a574602aab0af6a08f3f0fb847fd9a167f7afd71b8d256702e10bb17576a9143f1857b3db895b4d481a46e5a0129cb2b04781c88868ac',
      htlc: {
        args: {
          recipientPublicKey:
            '0398c9a44bed9f59c6041a574602aab0af6a08f3f0fb847fd9a167f7afd71b8d25',
          paymentHash:
            'e0531eaf4c51c77afc74a0ae13ebe7b1832c4a1c864abde6ca3e2eb280aa413d',
          refundPublicKeyHash: '3f1857b3db895b4d481a46e5a0129cb2b04781c8',
          timelockBlockHeight: 3041,
        },
        details: {
          network: 'bitcoin',
          subnet: 'simnet',
          destination_public_key:
            '0398c9a44bed9f59c6041a574602aab0af6a08f3f0fb847fd9a167f7afd71b8d25',
          payment_hash:
            'e0531eaf4c51c77afc74a0ae13ebe7b1832c4a1c864abde6ca3e2eb280aa413d',
          refund_public_key_hash: '3f1857b3db895b4d481a46e5a0129cb2b04781c8',
          timelock_block_height: 3041,
          p2sh_output_script: 'a9145a53e89d2db880a0dcaa627693b021344d15fdcf87',
          p2sh_address: '2N1UqKd8fmTk8DkDuKZDP9QuJnV2zv2fgTS',
          p2sh_p2wsh_address: '2Mst61eNNcE9uN2Nq1pp6puXy9xfPhJVyt2',
          p2sh_p2wsh_output_script:
            'a91406f8bb6bbc7e0932d010e2242ba7f1c37208682587',
          p2wsh_address:
            'bcrt1qg69sz0pa3xj5sfftq0lrtt6c3pl9ry0vd547he6j3sn55x6kujls8rphxm',
          p2wsh_output_script:
            '0020468b013c3d89a548252b03fe35af58887e5191ec6d2bebe7528c274a1b56e4bf',
          refund_p2wpkh_address: 'bcrt1q8uv90v7m39d56jq6gmj6qy5uk2cy0qwgwj88lv',
          refund_p2pkh_address: 'mmGa2VVPXEKP82YkrPM4VbnsLS4VjRwDCf',
          redeem_script:
            '76a820e0531eaf4c51c77afc74a0ae13ebe7b1832c4a1c864abde6ca3e2eb280aa413d876375210398c9a44bed9f59c6041a574602aab0af6a08f3f0fb847fd9a167f7afd71b8d256702e10bb17576a9143f1857b3db895b4d481a46e5a0129cb2b04781c88868ac',
        },
      },
    },
    invalid: {},
  },
};

/**
 * Shared configuration
 */
const sharedConfig = {
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

import { Network, UserSwapState } from '@radar/redshift-types';

export const fixtures = {
  valid: {
    network: Network.ETHEREUM,
    invoice:
      'lntb10m1pwt5decpp5r0j4ksda7h4chpjppzg3ysk6mufq90wpnpx6auhlrpxaqrm7nrvsdqs23jhxarfdenjqw3fcqzysxqyz5vqzya5x9kdf4z078qteypj30m3l8d8de5vsmfk4qsyy8q2fmgwll69eenlwvd42xl8eq83azck2d499k4hlznhxp92jqzu7dhve53a9ycpru9g7t',
    markets: {
      response: [
        {
          onchainTicker: 'TBTC',
          offchainTicker: 'LTBTC',
          market: 'TBTC_LTBTC',
        },
        {
          onchainTicker: 'KETH',
          offchainTicker: 'LTBTC',
          market: 'KETH_LTBTC',
        },
      ],
    },
    order: {
      response: {
        createdAt: '2019-04-20T03:35:11.732Z',
        network: 'ethereum',
        subnet: 'kovan_testnet',
        state: 0,
        swapAddress: 'mtsxo64p26giz7jmyhjzu8j5mn3ff99xxzmavgxhat',
        amount: '0.382400000000000000',
        amountPaid: '0.000000000000000000',
        paymentHash:
          'nm3vt84gvge42571ry8aycpgrd0ajihzv780rnemdow905k7wo5hhkijvvykvlay',
      },
    },
    orderState: {
      response: UserSwapState.Complete,
    },
  },
  invalid: {
    network: 'invalid_network' as Network,
    invoice:
      'lntb10m1pwt5decpp5r0j4ksda7h4chpjppzg3ysk6mufq90wpnpx6auhlrpxaqrm7nrvsdqs23jhxarfdenjqw3fcqzysxqyz5vqzya5x9kdf4z078qteypj30m3l8d8de5vsmfk4qsyy8q2fgwll69eenlwvd42xl8eq83azck2d499k4hlznhxp92jqzu7dhve53a9ycpru9g7t', // The above invoice with a single character missing
  },
};

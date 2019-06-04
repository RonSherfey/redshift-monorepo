import {
  Market,
  Network,
  OnChainTicker,
  UserSwapState,
} from '@radar/redshift-types';

export const fixtures = {
  valid: {
    network: Network.ETHEREUM,
    market: Market.BTC_LBTC,
    onchainTicker: OnChainTicker.ETH,
    hex: '0xdeadbeef',
    bitcoinAddress: 'mjaGqWTjd9HVSE4zgx9MGRs5GtmnM6HKTW',
    invoice:
      'lntb10m1pwt5decpp5r0j4ksda7h4chpjppzg3ysk6mufq90wpnpx6auhlrpxaqrm7nrvsdqs23jhxarfdenjqw3fcqzysxqyz5vqzya5x9kdf4z078qteypj30m3l8d8de5vsmfk4qsyy8q2fmgwll69eenlwvd42xl8eq83azck2d499k4hlznhxp92jqzu7dhve53a9ycpru9g7t',
    orderId: '0553bb1a-7832-11e9-8f9e-2a86e4085a59',
    expiryTimestampMs: 3559665352525,
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
    orders: {
      response: [
        {
          network: 'ethereum',
          subnet: 'ganache_simnet',
          onchainTicker: 'SETH',
          swapAddress: '0xf0398fad8c2aa38c476b010c269158d442730e98',
          amount: '0.4622',
          invoice:
            'r73ygxmrjzqy3rwath708inoxzjnuvs006hi8rkwh0nc8xgtvg20win812va3s1mgflcj2tnzp51mafns3t287r2jimnja9u0qfjmws3sqx06v84dq1y38gghscg48ntk3465ns9bd6x30wbvce8q9drcp5zadtrckluzohb587qxr8o5fk5vg66b9rmmi5gxsrvqesc',
          invoiceHash:
            '187b17a06c4ebb8eaf37131090606db1660175bf10c9e42049ec4f0d1341c75f',
          paymentHash:
            '7b753c32512b2238188935f4cc3ce015ebd5c8cd49cb29bffcb2e8566c084ef7',
        },
        {
          network: 'ethereum',
          subnet: 'ganache_simnet',
          onchainTicker: 'SETH',
          swapAddress: '0xf0398fad8c2aa38c476b010c269158d442730e98',
          amount: '0.11270000000000001',
          invoice:
            '9h56wu4dzaddlq4ocfsl52hgpyzwiptyg5tzh50lqu6gownabihifszjgklbgqjdhqltfwmghekk3kn0ax7xvnqhsgrrnumzjl324omu1162nzjsht8l6ul9bsqr9523otwn692o848np9p5an0afujexkgrtfnffkawha3enrmudc6j5rkbj344rhh4ipjkcj9rgdoi',
          invoiceHash:
            '187b17a06c4ebb8eaf37131090606db1660175bf10c9e42049ec4f0d1341c75f',
          paymentHash:
            '20d6898399496004464d7a9d38195bbb88106ca3648bcce0f0a070842c817784',
        },
      ],
    },
    order: {
      response: {
        network: 'ethereum',
        subnet: 'ganache_simnet',
        onchainTicker: 'SETH',
        swapAddress: '0xf0398fad8c2aa38c476b010c269158d442730e98',
        amount: '0.4788',
        invoice:
          '0feo0ux5qkyyn3qhruzow7jwp87qooi9kb9kqy54ruzzr2uioiakuvi8l9a5yev0z93x45c7nuqs3j5e4gpbk7ryc85ifasp9csy6eez4jtze63os2knr820pt1r8e0evjn9scg26k40h24v83xzf4iw7m2w6qkne5dawwu94wdrcsddahflzzt6ius868wv1a7k4suk',
        invoiceHash:
          '187b17a06c4ebb8eaf37131090606db1660175bf10c9e42049ec4f0d1341c75f',
        paymentHash:
          '05755962133b03473c9bce1bfcfdf9e30d12319f24ee6d00e95d0f5f86652e05',
      },
    },
    orderState: {
      response: UserSwapState.COMPLETE,
    },
    orderRefund: {
      response: {
        to: '0xf0398fad8c2aa38c476b010c269158d442730e98',
        data:
          '0xdfdecfaf0a822aebdb2d48a3a571d42f124d1d9600000000000000000000000000000000',
      },
    },
  },
  invalid: {
    network: 'invalid_network' as Network,
    market: 'invalid_market' as Market,
    onchainTicker: 'invalid_ticker' as OnChainTicker,
    hex: 'invalid_hex',
    bitcoinAddress: 'mjaGqWTjd9HVSE4zgx9MGRs5GtmnM6HKT', // The above bitcoin address with a single character missing
    invoice:
      'lntb10m1pwt5decpp5r0j4ksda7h4chpjppzg3ysk6mufq90wpnpx6auhlrpxaqrm7nrvsdqs23jhxarfdenjqw3fcqzysxqyz5vqzya5x9kdf4z078qteypj30m3l8d8de5vsmfk4qsyy8q2fgwll69eenlwvd42xl8eq83azck2d499k4hlznhxp92jqzu7dhve53a9ycpru9g7t', // The above invoice with a single character missing
    orderId: '0553bb1a-7832-11e9-8f9e-2a86e4085a5', // The above order id with a single character missing
  },
};

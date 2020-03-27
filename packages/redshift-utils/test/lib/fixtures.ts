import {
  BitcoinSubnet,
  MainnetOnChainTicker,
  Market,
  Network,
  OnChainTicker,
} from '@radar/redshift-types';

export const fixtures = {
  valid: {
    network: Network.BITCOIN,
    subnet: BitcoinSubnet.MAINNET,
    onchainTicker: OnChainTicker.BTC,
    mainnetOnchainTicker: OnChainTicker.BTC,
    market: Market.BTC_LBTC,
    uuid: 'e267ab5c-2b5f-4df7-af5d-e856a47ccf03',
    base58Check: '17VZNX1SN5NtKa8UQFxwQbFeFc3iqRYhem',
    bech32: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
    hex: '0xdeadbeef',
    invoice:
      'lnbc10n1p08u0s2pp56url0nlzawtw3k4zt2mfavxq96ssfnqwn6wh3n4dnckn8rpw6lvsdqqcqzpgsp5dz3z2kvetwyd94054ncrcwl5kgvfpwq9erz6kpjrsyp6ggmtngws9qy9qsqp5w75tnvufxycmcncedsye2crr3szrtwel75wszsvmd2sr8y3s892tpdju8l30h6404yqzlhpvcrf04elyh2zndmz8h4nac53zzhmncqhpn3ff',
  },
  invalid: {
    network: 'invalid_network' as Network,
    subnet: 'invalid_subnet' as BitcoinSubnet,
    onchainTicker: 'invalid_onchain_ticker' as OnChainTicker,
    mainnetOnchainTicker: 'invalid_mainnet_onchain_ticker' as MainnetOnChainTicker,
    market: 'invalid_market' as Market,
    uuid: 'invalid_uuid',
    base58Check: 'invalid_base58',
    bech32: 'invalid_bech32',
    hex: 'invalid_hex',
    invoice: 'invalid_invoice',
  },
};

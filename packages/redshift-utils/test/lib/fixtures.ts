import { Market, Network, OnChainTicker, Subnet } from '@radar/redshift-types';

export const fixtures = {
  valid: {
    network: Network.BITCOIN,
    subnet: Subnet.SIMNET,
    onchainTicker: OnChainTicker.BTC,
    market: Market.BTC_LBTC,
    uuid: 'e267ab5c-2b5f-4df7-af5d-e856a47ccf03',
    base58Check: 'mnw8qunbNGDKgPounQ6ZtZwQUsgVPe4fjn',
    bech32: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
    hex: '0xdeadbeef',
  },
  invalid: {
    network: 'invalid_network' as Network,
    subnet: 'invalid_subnet' as Subnet,
    onchainTicker: 'invalid_onchain_ticker' as OnChainTicker,
    market: 'invalid_market' as Market,
    uuid: 'invalid_uuid',
    base58Check: 'invalid_base58',
    bech32: 'invalid_bech32',
    hex: 'invalid_hex',
  },
};

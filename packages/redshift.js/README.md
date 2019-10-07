# @radar/redshift.js
**The official REDSHIFT Javascript SDK**

## About

This package acts as a wrapper for the REDSHIFT WS & HTTP client, types, and utility packages.
For more detailed documentation, follow the links to child packages in the [Usage](#usage) section.

## Installation

### npm

```
npm install @radar/redshift.js
```

### yarn

```
yarn add @radar/redshift.js
```

## Usage

[Types](../redshift-types)

[Utilities](../redshift-utils)

[HTTP Client](../redshift-api-client#usage---http-client)

[WebSocket Client](../redshift-api-client#usage---websocket-client)

## Examples

**Request Quote for Bitcoin Swap**

```typescript
import { Market, WebSocketClient } from '@radar/redshift.js';

const client = new WebSocketClient();
await client.connect();
const quote = await client.requestQuote({
      market: Market.BTC_LBTC,
      invoice: 'BOLT-compatible-invoice',
      refundAddress: 'P2(W)PKH-address',
});
```

**Request Quote for Ether Swap**

```typescript
import { Market, WebSocketClient } from '@radar/redshift.js';

const client = new WebSocketClient();
await client.connect();
const quote = await client.requestQuote({
      market: Market.ETH_LBTC,
      invoice: 'BOLT-compatible-invoice',
});
```

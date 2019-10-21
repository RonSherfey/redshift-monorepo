# @radar/redshift-api-client
**REDSHIFT HTTP & WebSocket Client Library**

## Installation

### npm

```
npm install @radar/redshift-api-client
```

### yarn

```
yarn add @radar/redshift-api-client
```

## Usage - REDSHIFT Client

The REDSHIFT client acts as a wrapper for the HTTP & WebSocket clients.

### Import
```typescript
import { RedshiftClient } from '@radar/redshift-api-client';
```

### Instantiation

**Mainnet**

By default, the REDSHIFT client targets mainnet

```typescript
const client = new RedshiftClient();
```

If you prefer to be explicit, you can pass `RedshiftApiUrl.MAINNET` into the constructor

```typescript
const client = new RedshiftClient(RedshiftApiUrl.MAINNET);
```

**Testnet**

```typescript
const client = new RedshiftClient(RedshiftApiUrl.TESTNET);
```

### Client Access

The `http` and `ws` getters can be used to access the HTTP & WebSocket client methods.

**`http` - Get Markets Example**

Get the active markets

```typescript
const markets = await client.http.getMarkets();
```

**`ws` - Connect Example**

Establish a connection to the REDSHIFT WebSocket API

```typescript
await client.ws.connect();
```


## Usage - HTTP Client

The HTTP client can be used to interact with the REDSHIFT HTTP endpoints.

### Import
```typescript
import { HttpClient } from '@radar/redshift-api-client';
```

### Instantiation

**Mainnet**

By default, the HTTP client targets mainnet

```typescript
const client = new HttpClient();
```

If you prefer to be explicit, you can pass `RedshiftApiUrl.MAINNET` into the constructor

```typescript
const client = new HttpClient(RedshiftApiUrl.MAINNET);
```

**Testnet**

```typescript
const client = new HttpClient(RedshiftApiUrl.TESTNET);
```

### Methods

**Get Markets**

Get the active markets

```typescript
const markets = await client.getMarkets();
```

**Get Orders**

Get all swap orders for a specific invoice

```typescript
const orders = await client.getOrders(invoice);

// Or filter by the on-chain asset used to fund the swap
const orders = await client.getOrders(invoice, OnChainTicker.ETH);
```

**Get Order**

Get a single swap order

```typescript
const order = await client.getOrder(orderId);
```

**Get Order State**

Get the state of a single order

```typescript
const state = await client.getOrderState(orderId);
```

**Get Order Fund Details**

Get the fund details for an order

```typescript
const state = await client.getOrderFundDetails(orderId);
```

**Get Order Transactions**

Get the transactions relating to an order

```typescript
const state = await client.getOrderTransactions(orderId);
```

**Get Order Refund Details**

Get the refund details for a single order

```typescript
const details = await client.getOrderRefundDetails(orderId);
```

## Usage - WebSocket Client

The WebSocket client can be used to interact with the REDSHIFT WebSocket endpoints. Many WebSocket interactions are promisified to provide a better developer experience.

### Import
```typescript
import { WebSocketClient } from '@radar/redshift-api-client';
```

### Instantiation

**Mainnet**

By default, the WebSocket client targets mainnet

```typescript
const client = new WebSocketClient();
```

If you prefer to be explicit, you can pass `RedshiftApiUrl.MAINNET` into the constructor

```typescript
const client = new WebSocketClient(RedshiftApiUrl.MAINNET);
```

**Testnet**

```typescript
const client = new WebSocketClient(RedshiftApiUrl.TESTNET);
```

### Methods

**Connect**

Establish a connection to the REDSHIFT WebSocket API

```typescript
await client.connect();
```

**Disconnect**

Disconnect from the REDSHIFT WebSocket API

```typescript
client.disconnect();
```

**Request Quote**

Request a quote for the provided invoice and selected on-chain asset

```typescript
await client.requestQuote(quoteRequest);
```

**Subscribe to Order State**

Subscribe to order state updates for the provided order id

```typescript
await client.subscribeToOrderState(orderId);
```

**On Order State Changed**

Execute the callback function when an order state update is received

```typescript
client.onOrderStateChanged(stateUpdate => {
  console.log(stateUpdate);
});
```

**Unsubscribe from Order State**

Unsubscribe from order state updates for the provided order id

```typescript
await client.unsubscribeFromOrderState(orderId);
```

**Subscribe to Block Height**

Subscribe to block height updates for the provided network and subnet

```typescript
await client.subscribeToBlockHeight(network, subnet);
```

**On Block Height Changed**

Execute the callback function when a block height update is received

```typescript
client.onBlockHeightChanged(blockHeightUpdate => {
  console.log(blockHeightUpdate);
});
```

**Unsubscribe from Block Height**

Unsubscribe from block height updates for the provided network and subnet

```typescript
await client.unsubscribeFromBlockHeight(network, subnet);
```

**Request Refund Details**

Request refund details for a specific swap order

```typescript
const details = await client.requestRefundDetails(orderId);
```

**Broadcast Transaction**

Broadcast signed transaction hex to your network of choice

```typescript
const { txId } = await client.broadcastTransaction(txRequest);
```

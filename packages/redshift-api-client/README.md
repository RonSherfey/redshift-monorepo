# @radar/redshift-api-client
**Redshift HTTP & WebSocket Client Library**

## Installation

### npm

```
npm install @radar/redshift-api-client
```

### yarn

```
yarn add @radar/redshift-api-client
```

## Usage - HTTP Client

### Import
```typescript
import { HttpClient } from '@radar/redshift-api-client';
```

### Instantiation
```typescript
const client = new HttpClient();
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

### Import
```typescript
import { WebSocketClient } from '@radar/redshift-api-client';
```

### Instantiation
```typescript
const client = new WebSocketClient();
```

### Methods

**Connect**

Establish a connection to the Redshift WebSocket API

```typescript
await client.connect();
```

**Disconnect**

Disconnect from the Redshift WebSocket API

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

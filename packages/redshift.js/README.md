# @radar/redshift.js
The official Redshift Javascript SDK

## Installation

### npm

```
npm install @radar/redshift.js
```

### yarn

```
yarn add @radar/redshift.js
```

## Usage - HTTP Client

### Import
```typescript
import { HttpClient } from '@radar/redshift.js';
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

**Get Order Refund Details**

Get the refund details for a single order

```typescript
const details = await client.getOrderRefundDetails(orderId);
```

## Usage - WebSocket Client

### Import
```typescript
import { WebSocketClient } from '@radar/redshift.js';
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

Listen for order state changes and execute the callback function when one is received

```typescript
client.onOrderStateChanged(newState => {
  console.log(newState);
});
```

**Unsubscribe from Order State**

Unsubscribe from order state updates for the provided order id

```typescript
await client.unsubscribeFromOrderState(orderId);
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

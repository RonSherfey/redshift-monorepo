# Ether Swap Tutorial

In this tutorial, we'll integrate the [REDSHIFT Javascript SDK](../packages/redshift.js) into a Vue frontend that can be used to execute a Kovan Testnet Ether (kETH) <-> Lightning Testnet Bitcoin (ltBTC) submarine swap.

<img width="500" src="https://user-images.githubusercontent.com/20102664/67451454-b4b74d00-f5dd-11e9-8422-73b98efac27d.gif" />

## Prerequisites

### Install MetaMask

MetaMask is an Ethereum wallet and web3 provider running inside a browser extension. Install [MetaMask](https://metamask.io) if not already installed. You can request testnet ether from https://faucet.kovan.network if you do not have any.

### Clone this repository

```sh
git clone https://github.com/RadarTech/redshift-monorepo.git
```

### Navigate to the sample project directory

```sh
cd redshift-monorepo/samples/sdk-usage-vue
```

### Install dependencies

```sh
yarn
```

### Run the application

```sh
yarn start
```

## Facilitating a Swap

### Overview

In this scenario, a user arrives at the app with a Lightning invoice that they would like REDSHIFT to pay in exchange for ETH. The exchange is atomic and completely trustless. The user will send their ETH to the [swap contract](https://kovan.etherscan.io/address/0xd4589fb5b5abb44e1a8cb95cff0ca9e0e78d9d5d#code), which can only be claimed by REDSHIFT once the invoice has been paid. If REDSHIFT fails to pay the invoice, the user can reclaim their funds from the contract after a couple hours.

### Fetch Initial Information

We'll begin by taking a look at the [Start](../samples/sdk-usage-vue/src/components/pages/start/start.ts) page.

<img width="340" src="https://user-images.githubusercontent.com/20102664/67511735-c12abc80-f654-11e9-8bbf-1ee0e3bdb96d.png" />

First, we must fetch two important pieces of information from REDSHIFT: The active markets and market requirements.

The markets are rather self-explanatory. They tell us which markets REDSHIFT is currently servicing.

The market requirements can help inform us if the invoice will be rejected by REDSHIFT without making a round-trip to the server. This call is optional as the server will return the same validation error, but we can offer a better user experience by performing this check on the client-side. The market requirements include the minimum time until invoice expiration, minimum invoice amount, and maximum invoice amount that will be accepted by REDSHIFT.

In our app, we make both calls at the same time as the page is created:

```typescript
async created() {
  [this.markets, this.requirements] = await Promise.all([
    redshift.http.getMarkets(),
    redshift.http.getMarketRequirements(),
  ]);
}
```

### Gathering & Validating User Input

Now that we have the markets and market requirements, we'll collect information from the user required to perform the swap.

At a minimum, we require the invoice that REDSHIFT will pay. If your application only supports one on-chain payment asset, ETH for example, then you will not need to collect the payment asset from the user.

We also support bitcoin payments in our app, so the user is required to select a payment asset.

To provide a better user experience, we'll validate the invoice on the client-side. To do so, we use [bolt11-decoder](https://github.com/RadarTech/bolt11-decoder), a lighter version of [bolt11](https://github.com/bitcoinjs/bolt11), to decode the invoice.

If the invoice does not decode successfully, then it is invalid:

```typescript
/**
 * Validate the passed invoice. If valid, return the decoded invoice
 * @param invoice The bolt11 invoice
 */
isValidInvoice(invoice: string) {
  try {
    const decodedInvoice = decode(invoice);
    return {
      decodedInvoice,
      isValid: true,
    };
  } catch (error) {
    return {
      isValid: false,
    };
  }
}
```

Once the user has input a valid invoice and selected a market, we have enough information to check if the market requirements have been met.

We'll perform this check when the user clicks `Pay Invoice`. Alternatively, you could run this validation when the input or select change event fires.

You can see this call in action inside the `initiateSwap` method:

```typescript
// Ensure the invoice meets the market requirements
const decodedInvoice = decode(data.invoice);
const invoiceMeetsRequirements = this.marketRequirementsSatisfied(
  decodedInvoice,
  data.market,
);
if (!invoiceMeetsRequirements) return;
```

If the invoice does not meet the market requirements, the error is set on the input and code execution is stopped.

<img width="340" src="https://user-images.githubusercontent.com/20102664/67514803-b6732600-f65a-11e9-9155-0123d67b155e.png" />

### Requesting a Quote

Once we've validated the information provided by the user, we're ready to request a quote from REDSHIFT.

This is a simple process that involves two steps; establish a WebSocket connection and request the quote:

```typescript
// Establish a WebSocket connection
await redshift.ws.connect();

// Request the quote
const quote = await redshift.ws.requestQuote({
  invoice: data.invoice,
  market: data.market,
});
```

The quote response will look like this:

```json
{ 
   "orderId":"56f970d4-24cc-4112-8e1a-4bef7becbee2",
   "expiryTimestampMs":1571943386485,
   "amount":"0.005068660000000000",
   "details":{ 
      "unsignedFundingTx":{ 
         "to":"0xd4589fB5b5ABB44e1A8cb95CfF0Ca9E0e78D9D5d",
         "data":"0x3fdcdd1e56f970d424cc41128e1a4bef7becbee20000000000000000000000000000000009495061c40a27c05ca574ff5c4d61869e4a936a003b13f8050d5aeba0ecfc7d",
         "value":"5068660000000000"
      }
   }
}
```

| Quote Field         | Description                                                                                                                                                                                                                                                                                                                                                                                                                        |
|---------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `orderId`           | A unique identifier for your order. This is required to execute a refund transaction in the event REDSHIFT fails to pay the invoice.                                                                                                                                                                                                                                                                                               |
| `expiryTimestampMs` |  The timestamp in milliseconds that the quote will expire if the user does not take action. We use this value to implement the quote expiration timer in the app. The action required to stop the quote expiration timer varies based on the payment asset. For Bitcoin, the timer will stop once a funding transaction is seen in the mempool. For Ethereum assets, the timer will stop when a funding transaction confirms. |
| `amount`            | The amount the user must pay denominated in the payment asset that they selected (tBTC or kETH in this sample).                                                                                                                                                                                                                                                                                                                    |
| `details`           | Quote details that are specific to the chosen market.                                                                                                                                                                                                                                                                                                                                                                              |
| `unsignedFundingTx` | The unsigned Ethereum funding transaction. When using metamask, this object can be passed directly into `web3.sendTransaction` to initiate payment.                                                                                                                                                                                                                                                                                |

## Payment

We now have everything that we need to request payment from the user. Move to the [Payment](../samples/sdk-usage-vue/src/components/pages/payment/payment.ts) page for this part of the tutorial.

<img width="340" src="https://user-images.githubusercontent.com/20102664/67523287-9e57d280-f66b-11e9-9f8c-2a6c1fa6ee01.png" />

To provide a good UX, we'll subscribe to order state updates and present them to the user.

You can subscribe to state updates using the following method:

```typescript
await redshift.ws.subscribeToOrderState(this.orderId);
```

Once subscribed, we must attach an event handler that gets fired when the order state changes. In this sample, we'll feed the state update event to a method called `handleStateChange` that will update the state for display, increase the progress bar completion percentage, and populate the payment proof once complete:


```typescript
redshift.ws.onOrderStateChanged(this.handleStateChange);
```

As you may have gathered from the above description, not all state updates share the same schema. There are three types of state updates.

| Update Type               | Description                                                                                                                                                                                                                                                                                                                                                      |
|---------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `GeneralStateUpdate`      | This is the most basic state update, which contains the `orderId` and `state`. General state updates are returned when the update did not involve a transaction confirmation or invoice payment. Both `TxConfirmedStateUpdate` and `SwapCompleteStateUpdate` extend this type.                                                                                   |
| `TxConfirmedStateUpdate`  | In addition to the `orderId` and `state` fields, this update type returns a `transactionId`. This type is used when notifying the subscriber of a partial fund, fund, or refund transaction confirmation.                                                                                                                                                        |
| `SwapCompleteStateUpdate` | In addition to the `orderId` and `state` fields, this update type returns a `preimage`. This type is used when notifying the subscriber of an invoice payment. The `preimage` is the proof of payment.                                                                                                                                                           |


Now that our state update listener is hooked up, we're ready to accept payment from the user.

In this example, all MetaMask interactions are handled through the [metamask object](../samples/sdk-usage-vue/src/lib/ethereum/metamask.ts). We'll skip over many of the actions required to connect and communicate with MetaMask as they are not specific to REDSHIFT.

When the user clicks the `Send Payment` button, we need to pass the unsigned funding transaction to MetaMask using the `sendTransaction` RPC call. This will pop up the MetaMask window so the user can sign the transaction.

In this example, we use the MetaMask provider to make the RPC call directly:

```typescript
/**
 * Call eth_sendTransaction. Display an error message if
 * an error is thrown.
 * @param address The active address
 */
async sendTransaction(address: string) {
  try {
    const { data, to, value } = this.tx; // Tx values from REDSHIFT
    await metamask.sendTransaction({
      data,
      to,
      value: value ? decToHex(value as string) : undefined,
      from: address,
    });
  } catch (error) {
    this.metamaskError = error.message;
  }
}
```

Note that this code can be simplified by using a library like web3 or ethers.js.

Once signed, MetaMask will broadcast the transaction automatically. The order state update listener will take over from here. Upon invoice payment, the progress bar will be set to 100%, the proof of payment will be populated, and the `Start Another Swap` button will be visible.

## Facilitating a Refund

**NOTE: In a real application, the refund details should be provided to the user as a file download before they're allowed to fund the swap. This sample only demos the refund flow when navigating directly from a failed swap.**

If REDSHIFT fails to pay the invoice, the user must be able to reclaim the funds that they sent to the swap contract.

Open the [Refund](../samples/sdk-usage-vue/src/components/pages/refund/refund.ts) page to view the sample refund flow.

In this example, the user is responsible for refund transaction submission. This is not strictly required. Any address is capable of signing and broadcasting the refund transaction. Regardless of who broadcasts this transaction, the funds will always be returned to the address that initially funded the swap. This could be used to submit the refund transaction on behalf of the user when the timelock expires, which offers a better UX.

We cannot allow the user to broadcast the refund transaction immediately following invoice payment failure. Any refund transaction mined before the block timelock is met will fail. The ether swap timelock is currently set to 480 blocks, which means that the user must wait roughly 2 hours before refund transaction submission.

To begin the process, we'll fetch the refund details using the order id of the failed swap:

```typescript
this.refund.details = await redshift.ws.requestRefundDetails(this.orderId);
```

The ether refund details contain the following information:


| Refund Field              | Description                                                                                                                                                                                                                                                                                      |
|---------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `market`                  | The market of the order, which contains the on-chain and off-chain asset tickers. `ETH_LBTC`, for example.                                                                                                                                                                                         |
| `state`                   | The active order state. REDSHIFT will return refund details regardless of the order state. This field can be used in client-side validations to prevent the user from submitting a refund transaction for an order that's already complete or refunded.                                             |
| `blocksRemaining`         | The number of blocks remaining until the timelock expires and the refund transaction can be submitted.                                                                                                                                                                                            |
| `refundableAtBlockHeight` | The block height at which the timelock expires and the refund transaction can be submitted.                                                                                                                                                                                                      |
| `refundableBalance`       | The balance that is available for refund. Note that this field will not be decreased once the refund is complete.                                                                                                                                                                    |
| `details`                 | This field contains the network-specific details that are necessary to submit the refund transaction. In this case, it contains two properties: `to` and `data`. These can be passed into `sendTransaction` in the same way as the funding details to sign and broadcast the refund transaction. |

If `blocksRemaining` is greater than 0 then we know that the refund transaction cannot be submitted yet. Instead, we'll display a block countdown to timelock expiration.

<img width="340" src="https://user-images.githubusercontent.com/20102664/67877659-97afdc00-faff-11e9-8040-a983f38fc30a.png" />

To accomplish this, we'll subscribe to the Ethereum block height using the REDSHIFT WebSocket API and update the UI when a new block is mined:

```typescript
if (this.blocksUntilRefundable > 0) {
  const { network, subnet } = getNetworkDetails(this.refund.details.market);

  await redshift.ws.subscribeToBlockHeight(network, subnet);
  redshift.ws.onBlockHeightChanged(update =>
    this.handleBlockHeightChange(update, network, subnet),
  );
}
```

Once `blocksUntilRefundable` is less than or equal to 0, we can enable the `Get Refund` button and allow the user to submit the refund transaction.

<img width="340" src="https://user-images.githubusercontent.com/20102664/67881219-b87b3000-fb05-11e9-924f-0f9fb7248e80.png" />

From here, we use the same approach as the funding transaction. The refund transaction details are passed to the `sendTransaction` RPC call and the progess bar is updated using the order state subscription. Upon refund confirmation, the progress bar will be set to 100% and the Start Another Swap button will be visible.

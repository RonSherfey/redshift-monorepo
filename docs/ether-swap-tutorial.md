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

## Performing a Swap

### Overview

In this scenario, a user arrives at the app with a Lightning invoice that they would like REDSHIFT to pay in exchange for ETH. The exchange is atomic and completely trustless. The user will send their ETH to the [swap contract](https://kovan.etherscan.io/address/0xd4589fb5b5abb44e1a8cb95cff0ca9e0e78d9d5d#code), which can only be claimed by REDSHIFT once the invoice has been paid. If REDSHIFT fails to pay the invoice, the user can reclaim their funds from the contract after a couple hours.

### Fetch Initial Information

We'll begin by taking a look at the [Start](../samples/sdk-usage-vue/src/components/pages/start/start.ts) page.

<img width="340" src="https://user-images.githubusercontent.com/20102664/67511735-c12abc80-f654-11e9-8bbf-1ee0e3bdb96d.png" />

First, we must fetch two important pieces of information from REDSHIFT: The active markets and market requirements.

The markets are rather self-explanatory. They tell us which markets REDSHIFT is currently servicing.

The market requirements help us determine if an invoice will fail validations without making a round-trip to the server. This call is optional as the server will return the same validation error, but we can offer a better user experience by performing this check on the client-side. The market requirements include the minimum time until invoice expiration, minimum invoice amount, and maximum invoice amount that will be accepted by REDSHIFT.

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

Now that we have the markets and market requirements, we'll need to collect the information required to perform the swap from the user.

At a minimum, we require the invoice that REDSHIFT will pay. If your application only supports one on-chain payment asset, ETH for example, then you will not need to collect the payment asset from the user.

We also support bitcoin payments in our app, so we'll require the user to select the asset that they will use to pay.

To provide a better use experience, we'll validate the invoice on the client-side. To do so, we use [bolt11-decoder](https://github.com/RadarTech/bolt11-decoder), a lighter version of [bolt11](https://github.com/bitcoinjs/bolt11), to decode the invoice.

If it does not decode successfully, then the invoice is invalid:

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

We'll perform this check when the user clicks `Pay Invoice`. Alternatively, it could be ran when the input or select change event fires.

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

<img width="340" src="https://user-images.githubusercontent.com/20102664/67514647-5aa89d00-f65a-11e9-8b64-781956482890.png" />

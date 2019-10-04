# <img width="160" src="https://user-images.githubusercontent.com/20102664/66014847-9f8f4880-e48d-11e9-94ac-1def62896ad5.png" />

**Your bridge to the Lightning Network**

## About

REDSHIFT enables wallet-to-wallet cross-blockchain trading and payments for the Lightning Network. This is accomplished through the use of [submarine swaps](https://wiki.ion.radar.tech/tech/research/submarine-swap), and more specifically, [HTLCs](https://wiki.ion.radar.tech/tech/bitcoin/hltc).

This repository is a monorepo, which includes the HTLC logic that powers REDSHIFT, an SDK that can be used to integrate submarine swaps into your application, and other helpful utilities.

### Supported On-Chain Assets

| Asset | Testnet | Mainnet |
| ----------- | ----------- | ----------- |
| BTC | :heavy_check_mark: | :heavy_check_mark: |
| ETH | :heavy_check_mark: | :heavy_check_mark: |

### Supported Swap Types

The initial release of REDSHIFT supports unidirectional swaps as detailed below:

1. The user provides a Lightning invoice to REDSHIFT
2. REDSHIFT returns a quote to the user, which contains the information necessary to fund the on-chain escrow (HTLC)
3. The user sends funds to the escrow
4. Once the the user's payment confirms, REDSHIFT pays the invoice, and sweeps the on-chain funds from the escrow

This type of swap can be used to top up your Lightning balance, make off-chain purchases with on-chain funds, or simply swap assets.

### Demo

Follow the below links to view REDSHIFT in action:

* [Testnet](https://widget.redshift.radar.tech)
* [Mainnet](https://ion.radar.tech/redshift)

## Packages

| Package | Version | Description |
| ----------- | ----------- | ----------- |
| [@radar/htlc](/packages/htlc) | ![npm (scoped)](https://img.shields.io/npm/v/@radar/htlc.svg) | A library used to construct and interact with HTLCs across multiple networks & network models |
| [@radar/redshift-api-client](/packages/redshift-api-client) | ![npm (scoped)](https://img.shields.io/npm/v/@radar/redshift-api-client.svg) | Redshift HTTP & WebSocket Client Library |
| [@radar/redshift-utils](/packages/redshift-utils) | ![npm (scoped)](https://img.shields.io/npm/v/@radar/redshift-utils.svg) | Utilities used across Redshift codebases |
| [@radar/redshift-types](/packages/redshift-types) | ![npm (scoped)](https://img.shields.io/npm/v/@radar/redshift-types.svg) | Common types used across Redshift codebases |
| [@radar/redshift.js](/packages/redshift.js) | ![npm (scoped)](https://img.shields.io/npm/v/@radar/redshift.js.svg) | The Redshift Javascript SDK |

## Setup

### Install dependencies
```sh
yarn
```

### Build all packages
```sh
yarn build
```

### Start simnet services for tests 
```sh
docker-compose up -d
```

### Run tests
```sh
yarn test
```

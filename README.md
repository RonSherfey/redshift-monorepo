# <img width="160" src="https://user-images.githubusercontent.com/20102664/66014847-9f8f4880-e48d-11e9-94ac-1def62896ad5.png" />

**Your bridge to the Lightning Network**

## About

[REDSHIFT](https://ion.radar.tech/redshift) enables wallet-to-wallet cross-blockchain trading and payments for the Lightning Network. This is accomplished through the use of [submarine swaps](https://wiki.ion.radar.tech/tech/research/submarine-swap), and more specifically, [HTLCs](https://wiki.ion.radar.tech/tech/bitcoin/hltc).

This repository is a monorepo, which includes the [HTLC](/packages/htlc) logic that powers REDSHIFT, an [SDK](/packages/redshift.js) that can be used to integrate submarine swaps into your application, and other helpful [utilities](/packages/redshift-utils).

### Supported On-Chain Assets

| Asset | Testnet | Mainnet |
| ----------- | ----------- | ----------- |
| BTC | :heavy_check_mark: | :heavy_check_mark: |
| ETH | :heavy_check_mark: | :heavy_check_mark: |

### Supported Swap Types

The initial release of REDSHIFT supports unidirectional swaps as detailed below:

1. A user comes to REDSHIFT with a Lightning invoice that they would like REDSHIFT to pay. They have on-chain bitcoin or ether.
2. The user makes a request to REDSHIFT that contains the invoice and on-chain asset ticker that they will use to pay.
3. REDSHIFT returns a quote to the user, which contains the information required to send the escrow payment.
4. The user sends the escrow payment in the amount specified by REDSHIFT.
4. Once the payment confirms, REDSHIFT pays the invoice and uses the [preimage](https://wiki.ion.radar.tech/tech/bitcoin/pre-image) to sweep the funds from the escrow.

In the event that REDSHIFT is unable to pay the invoice, REDSHIFT will not have access to the funds in the escrow. The user will be able to execute a refund transaction after the timelock has expired to recoup their funds.

This type of swap can be used to top up your Lightning balance, make off-chain purchases with on-chain funds, or simply swap assets.

### Live Demo

Follow the below links to try REDSHIFT:

* [Testnet](https://widget.redshift.radar.tech)
* [Mainnet](https://ion.radar.tech/redshift)

## Packages

| Package | Version | Description |
| ----------- | ----------- | ----------- |
| [@radar/htlc](/packages/htlc) | ![npm (scoped)](https://img.shields.io/npm/v/@radar/htlc.svg) | A library used to construct and interact with HTLCs across multiple networks & network models |
| [@radar/redshift-api-client](/packages/redshift-api-client) | ![npm (scoped)](https://img.shields.io/npm/v/@radar/redshift-api-client.svg) | REDSHIFT HTTP & WebSocket Client Library |
| [@radar/redshift-utils](/packages/redshift-utils) | ![npm (scoped)](https://img.shields.io/npm/v/@radar/redshift-utils.svg) | Utilities used across REDSHIFT codebases |
| [@radar/redshift-types](/packages/redshift-types) | ![npm (scoped)](https://img.shields.io/npm/v/@radar/redshift-types.svg) | Common types used across REDSHIFT codebases |
| [@radar/redshift.js](/packages/redshift.js) | ![npm (scoped)](https://img.shields.io/npm/v/@radar/redshift.js.svg) | The REDSHIFT Javascript SDK |

## Setup

### Install dependencies
```sh
yarn
```

### Build all packages
```sh
yarn build
```

### Start simnet services & deploy contracts for tests
```sh
scripts/simnet-setup.sh
```

### Run tests
```sh
yarn test
```

**Note:** All tests in all packages will run if you execute `yarn test` from the `redshift-monorepo` folder.
If you would like to run tests specific to one package, `cd` into the target package directory before running `yarn test`.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

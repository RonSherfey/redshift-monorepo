# Redshift Monorepo

Your bridge to the Lightning Network

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

### Build container services for tests
```sh
docker-compose up
```

### Run tests
```sh
yarn test
```

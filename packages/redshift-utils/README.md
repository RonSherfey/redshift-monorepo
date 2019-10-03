# @radar/redshift-utils
**Utilities used across Redshift codebases**

## Installation

### npm

```
npm install @radar/redshift-utils
```

### yarn

```
yarn add @radar/redshift-utils
```

## Usage - Validator

### Import
```typescript
import { validator } from '@radar/redshift-utils';
```

### Methods

**Validate Network**

Determine if the passed network is valid

```typescript
const isValid = await validator.isValidNetwork(network);
```

**Validate On-Chain Ticker**

Determine if the passed on-chain ticker is valid

```typescript
const isValid = await validator.isValidOnchainTicker(ticker);
```

**Validate Market**

Determine if the passed market is valid

```typescript
const isValid = await validator.isValidMarket(market);
```

**Validate UUID**

Determine if the passed UUID is valid

```typescript
const isValid = await validator.isValidUUID(uuid);
```

**Validate Base58Check**

Determine if the passed string is valid base58check

```typescript
const isValid = await validator.isValidBase58Check(s);
```

**Validate Bech32**

Determine if the passed string is valid bech32

```typescript
const isValid = await validator.isValidBech32(s);
```

**Validate Base58Check or Bech32**

Determine if the passed string is valid base58check or bech32

```typescript
const isValid = await validator.isValidBase58CheckOrBech32(s);
```

**Validate Hex**

Determine if the passed string is a valid hex

```typescript
const isValid = await validator.isValidHex(s);
```

**Validate Network & Subnet**

Determine if the passed network and subnet are valid

```typescript
const isValid = await validator.isValidNetworkAndSubnet(network, subnet);
```
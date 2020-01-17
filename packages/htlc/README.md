# @radar/htlc
**A library used to construct and interact with HTLCs across multiple networks & network models**

## Installation

### npm

```
npm install @radar/htlc
```

### yarn

```
yarn add @radar/htlc
```

## Usage - Bitcoin

### Construct a new Bitcoin HTLC with an absolute timelock:

```typescript
import { HTLC, UTXO } from '@radar/htlc';

const htlc = HTLC.construct(Network.BITCOIN, BitcoinSubnet.SIMNET, {
  paymentHash: 'fba6da3ff596b9c6fabe67d4f728474697640ef6edd9e361c2a46be345112839',
  claimerPublicKey: '0286ab3b59ce3862515b01c8a282edb6011b4eb50c608ab298bfd70f6033f7bc65',
  refundAddress: 'sb1qxnqqm56ta40p3uhtsmtdxglhwuxjk3tul94mq0',
  timelock: {
    type: UTXO.LockType.ABSOLUTE,
    blockHeight: 597732,
  },
});
```

### Construct a new Bitcoin HTLC with a relative timelock:

```typescript
import { HTLC, UTXO } from '@radar/htlc';

const htlc = HTLC.construct(Network.BITCOIN, BitcoinSubnet.SIMNET, {
  paymentHash: 'fba6da3ff596b9c6fabe67d4f728474697640ef6edd9e361c2a46be345112839',
  claimerPublicKey: '0286ab3b59ce3862515b01c8a282edb6011b4eb50c608ab298bfd70f6033f7bc65',
  refundAddress: 'sb1qxnqqm56ta40p3uhtsmtdxglhwuxjk3tul94mq0',
  timelock: {
    type: UTXO.LockType.RELATIVE,
    blockBuffer: 50,
  },
});
```

### Construct a Bitcoin HTLC from an existing redeem script:

```typescript
import { HTLC } from '@radar/htlc';

const htlc = HTLC.construct(
  Network.BITCOIN,
  BitcoinSubnet.SIMNET,
  '76a914c15949a2e2a414b5c641f32c4c2ee07be644e165876375210398c9a44bed9f59c6041a574602aab0af6a08f3f0fb847fd9a167f7afd71b8d25670114b27576a9143f1857b3db895b4d481a46e5a0129cb2b04781c88868ac',
);
```

### Interact with the Bitcoin HTLC

Get the HTLC details:
```typescript
const { details } = htlc;
```

Get the redeem script:
```typescript
const { redeemScript } = htlc;
```

Generate the fund transaction. You can now broadcast it using `sendrawtransaction`:
```typescript
const fundTxHex = htlc.fund(utxos, fundingAmount, privateKey);
```

Generate the claim transaction. You can now broadcast it using `sendrawtransaction`:
```typescript
const claimTxHex = htlc.claim(
  utxos,
  destinationAddress,
  currentBlockHeight,
  feeTokensPerVirtualByte,
  paymentSecret,
  privateKey,
);
```

Generate the refund transaction. You can now broadcast it using `sendrawtransaction`:
```typescript
const refundTxHex = htlc.refund(
  utxos,
  destinationAddress,
  currentBlockHeight,
  feeTokensPerVirtualByte,
  privateKey,
);
```

For working examples, view the [Absolute](./test/integration/networks/bitcoin/bitcoin-bip65.test.ts) or
[Relative](./test/integration/networks/bitcoin/bitcoin-bip68.test.ts) Timelock Bitcoin HTLC tests.

## Usage - Ethereum

### Construct an Ethereum HTLC:

#### Asset: Ether

```typescript
import { HTLC } from '@radar/htlc';

const htlc = HTLC.construct(Network.ETHEREUM, EthereumSubnet.GANACHE_SIMNET, {
  orderUUID,
  provider: web3.currentProvider,
  assetType: EVM.AssetType.ETHER,
});
```

#### Asset: ERC20

```typescript
import { HTLC } from '@radar/htlc';

const htlc = HTLC.construct(Network.ETHEREUM, EthereumSubnet.GANACHE_SIMNET, {
  orderUUID,
  provider: web3.currentProvider,
  tokenContractAddress,
  assetType: EVM.AssetType.ERC20,
});
```

### Interact with the Ethereum HTLC

Get the deployed HTLC contract instance:
```typescript
const { contract } = htlc;
```

Generate, sign, and broadcast the fund transaction using the passed provider:
```typescript
const txReceipt = await htlc.fund(details);
```

Generate, and optionally send, the swap funding transaction with admin refund functionality enabled:
```typescript
const txReceipt = await htlc.fundWithAdminRefundEnabled(details);
```

Generate and broadcast the claim transaction using the passed provider:
```typescript
const txReceipt = await htlc.claim(paymentSecret);
```

Generate and broadcast the admin refund transaction using the passed provider:
```typescript
const txReceipt = await htlc.adminRefund(refundPreimage);
```

Generate and broadcast the refund transaction using the passed provider:
```typescript
const txReceipt = await htlc.refund();
```

Want to pass in additional tx params? Pass all desired tx params as the last argument:
```typescript
const txReceipt = await htlc.refund(true, {
  gas: 200000,
});
```

Don't want to sign and broadcast the transaction? Set `shouldBroadcast` to false to return the unsigned transaction. You can now broadcast it using `eth_sendTransaction`:
```typescript
const unsignedTx = await htlc.refund(false);
```

For working examples, view the [Ether](./test/integration/networks/ethereum/ether.test.ts) or
[ERC20](./test/integration/networks/ethereum/erc20.test.ts) Ethereum HTLC tests.

## Usage - Stellar

### Construct a Stellar HTLC:

```typescript
import { HTLC } from '@radar/htlc';

const htlc = HTLC.construct(Network.STELLAR, StellarSubnet.TESTNET, {
  secret: 'SCHMRGINH4CDPUPKBEQZTFZHNRSZKC3NYEFMSUYNDKA4OQK3ZA7JT7C6',
});
```

### Interact with the Stellar HTLC

Build, sign, and broadcast a transaction (envelope) to create an escrow account (escrowPubKey):
```typescript
await htlc.create();
```

Build the `fundEnvelope` and `refundEnvelope` for the user:
```typescript
const fundEnvelope = await htlc.fund(
  userPubKey,
  fundAmount,
  paymentHash,
);

const refundEnvelope = await htlc.refund(
  userPubKey,
  timelockInSeconds,
);
```

Once the user funds, pay the invoice to get the payment secret. Use the payment secret to claim the funds.
Once broadcast, the escrow account gets merged into the server account. Swap Complete.
``` typescript
await htlc.claim(paymentSecret);
```

For a working example, view the [Stellar](./test/integration/networks/stellar/stellar.test.ts) HTLC tests.

## Testing

### Build container services for tests
```sh
docker-compose up -d
```

### Run tests:
```
yarn test
```

## Additional Information

### Subnet Naming

Subnets should be named `SIMNET`, `TESTNET`, or `MAINNET` if there is only one instance of the subnet type. If there are two or more instances of a single subnet type (multiple testnets, etc.) then the naming convention should be `SUBNETNAME_SUBNETTYPE`. e.g. `KOVAN_TESTNET`.

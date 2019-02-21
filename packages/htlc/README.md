## @radar-redshift/htlc

A small library used to construct and interact with HTLCs across multiple networks & network models.

## Bitcoin

### Construct a new Bitcoin HTLC:

```typescript
import { HTLC } from '@radar-redshift/htlc';

const htlc = HTLC.construct(Network.BITCOIN, BitcoinSubnet.SIMNET, {
  paymentHash: 'fba6da3ff596b9c6fabe67d4f728474697640ef6edd9e361c2a46be345112839',
  destinationPublicKey: '0286ab3b59ce3862515b01c8a282edb6011b4eb50c608ab298bfd70f6033f7bc65',
  refundPublicKeyHash: '34c00dd34bed5e18f2eb86d6d323f7770d2b457c',
  timelockBlockHeight: 800,
});
```

### Construct a Bitcoin HTLC from an existing redeem script:

```typescript
import { HTLC } from '@radar-redshift/htlc';

const htlc = HTLC.construct(
  Network.BITCOIN,
  BitcoinSubnet.SIMNET,
  '76a820fba6da3ff596b9c6fabe67d4f728474697640ef6edd9e361c2a46be345112839876375210286ab3b59ce3862515b01c8a282edb6011b4eb50c608ab298bfd70f6033f7bc6567022003b17576a91434c00dd34bed5e18f2eb86d6d323f7770d2b457c8868ac',
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

## Ethereum

### Construct an Ethereum HTLC:

#### Asset: Ether

```typescript
import { HTLC } from '@radar-redshift/htlc';

const htlc = HTLC.construct(Network.ETHEREUM, EthereumSubnet.GANACHE_SIMNET, {
  invoice,
  web3,
  assetType: EVM.AssetType.ETHER,
});
```

#### Asset: ERC20

```typescript
import { HTLC } from '@radar-redshift/htlc';

const htlc = HTLC.construct(Network.ETHEREUM, EthereumSubnet.GANACHE_SIMNET, {
  invoice,
  web3,
  tokenContractAddress,
  assetType: EVM.AssetType.ERC20,
});
```

### Interact with the Ethereum HTLC

Get the deployed HTLC contract instance:
```typescript
const { contract } = htlc;
```

Generate, sign, and broadcast the fund transaction using the provided `web3` instance:
```typescript
const txReceipt = await htlc.fund(amount, paymentHash);
```

Generate and broadcast the claim transaction using the provided `web3` instance:
```typescript
const txReceipt = await htlc.claim(paymentSecret);
```

Generate and broadcast the refund transaction using the provided `web3` instance:
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

## Stellar

### Construct a Stellar HTLC:

```typescript
import { HTLC } from '@radar-redshift/htlc';

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

## Testing

### Build container services for tests
```sh
docker-compose up
```

### Run tests:
```
yarn test
```

## Additional Information

### Subnet Naming

Subnets should be named `SIMNET`, `TESTNET`, or `MAINNET` if there is only one instance of the subnet type. If there are two or more instances of a single subnet type (multiple testnets, etc.) then the naming convention should be `SUBNETNAME_SUBNETTYPE`. e.g. `KOVAN_TESTNET`.

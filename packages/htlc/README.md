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

Get the redeem script
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
  privateKey,
  paymentSecret,
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
  publicKey,
);
```

## Ethereum

### Construct an Ethereum HTLC:

```typescript
import { HTLC } from '@radar-redshift/htlc';

const htlc = HTLC.construct(Network.ETHEREUM, EthereumSubnet.GANACHE, {
  web3,
});
```

### Interact with the Ethereum HTLC

Get the deployed HTLC contract instance:
```typescript
const { contract } = htlc;
```

Generate, sign, and broadcast the fund transaction using the provided `web3` instance:
```typescript
const txReceipt = await htlc.fund(amount, invoice, paymentHash);
```

Generate and broadcast the claim transaction using the provided `web3` instance:
```typescript
const txReceipt = await htlc.claim(invoice, paymentSecret);
```

Generate and broadcast the refund transaction using the provided `web3` instance:
```typescript
const txReceipt = await htlc.refund(invoice);
```

Want to pass in additional tx params? Pass all desired tx params as the last argument:
```typescript
const txReceipt = await htlc.refund(invoice, true, {
  gas: 200000,
});
```

Don't want to sign and broadcast the transaction? Set `shouldSend` to false to return the unsigned transaction. You can now broadcast it using `eth_sendTransaction`:
```typescript
const unsignedTx = await htlc.refund(invoice, false);
```

## Stellar

### Construct an Stellar HTLC:

```typescript
import { HTLC } from '@radar-redshift/htlc';
import stellarSdk from 'stellar-sdk';

const secret = 'SCHMRGINH4CDPUPKBEQZTFZHNRSZKC3NYEFMSUYNDKA4OQK3ZA7JT7C6'
const htlc = new StellarHtlc(secret, Network.STELLAR, StellarSubnet.XLMTESTNET);

```

Sever builds & signs a transaction (envelope) to create an escrow account (escrowPubKey):
```typescript
const createEnvelope = await htlc.create();

await htlc.broadcast(createEnvelope)
```

When escrow account is created, server builds `fundEnvelope` and `refundEnvelope` for user:
```typescript
const fundEnvelope = await htlc.fund(
  userPubKey,
  3, // tell user to fund 3 XLM
  hashX, // hash from ln invoice
);

const refundEnvelope = await htlc.refund(
  userPubKey,
  3600, // timelock in seconds (1hr)
);
```

User recieves the `escrowPubKey`, `fundEnvelope`, and `refundEnvelope`. If user agrees to the fund amount (3 XLM), then user will sign the fund envelope and broadcast:
```typescript
const secret = 'GDGFK52PNXSKD7BKE5GQJQJ7THDACI5ECDWWEIC6GR5KKBDY7SGPRV6'
const userWallet = new StellarHtlc(secret, Network.STELLAR, StellarSubnet.XLMTESTNET);

const signedFundEnvelope = userWallet.sign(fundEnvelope);

await userWallet.broadcast(signedFundEnvelope);

// once broadcasted, the escrow account becomes a 2/3 multisig
```

When escrow account is funded, server pays ln invoice to get preimage. Server uses preimage to claim XLM funds.
``` typescript
// get preimage from paying ln invoice
const claimEnvelope = await htlc.claim(preimage);

await htlc.broadcast(claimEnvelope);

// once broadcasted, escrow account gets merged into server account aka swap complete
```

If server is does not pay invoice, user can broadcast refundEnvelope after timelock (1 hr)
``` typescript
const signedRefundEnvelope = userWallet.sign(refundEnvelope);

await userWallet.broadcast(signedRefundEnvelope);

// once broadcasted, XLM is returned back to user
```

## Testing

Run tests:
```
yarn test
```

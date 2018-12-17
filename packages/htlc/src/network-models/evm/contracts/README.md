# Ethereum Swap Contracts

Simple Ethereum HTLCs

## Testing

### Writing Tests

Run `yarn generate` to compile contracts and generate typescript typings before writing tests. This will enable autocompletion of contract methods & parameter type checking.

### Running Tests
```
yarn test
```

### Running Lint
```
yarn lint
```

## Deployment

### Kovan

You can deploy to Kovan by calling `truffle migrate --network kovan`. This will use the funds stored at the seed phrase to deploy the Migration and Swap contracts.

The contracts have been deployed to Kovan at the following addresses:

Migration Contract: [0x2c15a3ffb6371b067bee85c7581c6cfa0df2e92f](https://kovan.etherscan.io/address/0x2c15a3ffb6371b067bee85c7581c6cfa0df2e92f)

Ether Swap Contract: [0x5aeb1ce106a82ebb205707053eab17a3b88be8fc](https://kovan.etherscan.io/address/0x5aeb1ce106a82ebb205707053eab17a3b88be8fc)

ERC20 Swap Contract: [0x7915411b93c4db6272a66fc3b67965b0de29cb70](https://kovan.etherscan.io/address/0x7915411b93c4db6272a66fc3b67965b0de29cb70)

## ERC20 swap example:

- Address 0xca3 is the owner of the swap contract
- Address 0x147 is the user with the erc20 token
- Address 0x692 is the swap contract
- Address 0x0fd is the token contract

![](https://i.imgur.com/TddPD7O.png)

0. User (0x147) with erc20 tokens `approve` the swap contract (0x692) with 11 tokens

1. User (0x147) creates an lnd invoice then `fund`s the swap contract (0x692). The token is locked until the lnd invoice is paid.

2. When the owner (0xca3) pays the lnd invoice, they should recieve the preimage (0x5d6). The preimage is used to `claim` the token from the swap contract. Claiming will send the token to the owner.

3. Owner (0xca3) checks balance.

![](https://i.imgur.com/5uYK82e.png)

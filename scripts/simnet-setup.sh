#!/usr/bin/env bash
set -e

# Start containers
docker-compose up -d test-btcd test-btcctl test-ganache test-stellar

# Deploy ethereum swap contracts
cd packages/htlc/src/network-models/evm/contracts
yarn && yarn deploy && yarn trim-artifacts

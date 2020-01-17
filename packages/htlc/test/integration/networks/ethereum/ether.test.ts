import { EthereumSubnet, Network } from '@radar/redshift-types';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract/types';
import {
  EtherSwapABI,
  EVM,
  EvmHtlc,
  getContractAddressesForSubnetOrThrow,
  HTLC,
} from '../../../../src';
import { config, expect, getRpcUrl } from '../../../lib/helpers';
import { transactionResponseSchema } from '../../../lib/schemas';

describe('EVM HTLC - Ethereum Network - Ether Asset', () => {
  const { etherSwap } = getContractAddressesForSubnetOrThrow(
    EthereumSubnet.GANACHE_SIMNET,
  );
  let web3: Web3;
  let htlc: EvmHtlc<Network.ETHEREUM>;
  let etherSwapContract: Contract;
  let args: {
    orderUUID: string;
    paymentSecret: string;
    paymentHash: string;
    refundSecret: string;
    refundHash: string;
    amount: string;
  };
  before(() => {
    web3 = new Web3(getRpcUrl(Network.ETHEREUM, EthereumSubnet.GANACHE_SIMNET));
    etherSwapContract = new web3.eth.Contract(EtherSwapABI, etherSwap);
  });

  beforeEach(() => {
    args = config.random.args(true);
    htlc = HTLC.construct(Network.ETHEREUM, EthereumSubnet.GANACHE_SIMNET, {
      orderUUID: args.orderUUID,
      provider: web3.currentProvider,
      assetType: EVM.AssetType.ETHER,
    });
  });

  describe('Fund', () => {
    it('should build a fund transaction and return the unsigned transaction when the shouldBroadcast flag is set to false', async () => {
      const unsignedFundingTx = await htlc.fund(
        {
          amount: args.amount,
          paymentHash: args.paymentHash,
        },
        false,
      );
      const fundTxResult = await web3.eth.sendTransaction({
        ...unsignedFundingTx,
        from: config.ethereum.accounts[0],
        gas: 200000,
      });
      expect(fundTxResult).to.be.jsonSchema(transactionResponseSchema);
    });

    it('should build and send a fund transaction when the shouldBroadcast flag is set to true', async () => {
      const fundTxResult = await htlc.fund(
        {
          amount: args.amount,
          paymentHash: args.paymentHash,
        },
        true,
        {
          from: config.ethereum.accounts[0],
          gas: 200000,
        },
      );
      expect(fundTxResult).to.match(config.pattern.hex256Bit);
    });
  });

  describe('Claim', () => {
    beforeEach(async () => {
      // Fund the swap
      await htlc.fund(
        {
          amount: args.amount,
          paymentHash: args.paymentHash,
        },
        true,
        {
          from: config.ethereum.accounts[0],
          gas: 200000,
        },
      );
    });

    it('should build a claim transaction and return the unsigned transaction when the shouldBroadcast flag is set to false', async () => {
      const unsignedClaimTx = await htlc.claim(args.paymentSecret, false);
      const claimTxResult = await web3.eth.sendTransaction({
        ...unsignedClaimTx,
        from: config.ethereum.accounts[1],
        gas: 200000,
      });
      expect(claimTxResult).to.be.jsonSchema(transactionResponseSchema);
    });

    it('should build and send a claim transaction when the shouldBroadcast flag is set to true', async () => {
      const claimTxResult = await htlc.claim(args.paymentSecret, true, {
        from: config.ethereum.accounts[0],
        gas: 200000,
      });
      expect(claimTxResult).to.match(config.pattern.hex256Bit);
    });
  });

  describe('Refund', () => {
    before(async () => {
      // Set refund delay to something small
      await etherSwapContract.methods.setRefundDelay(0).send({
        from: config.ethereum.accounts[0],
        gas: 150000,
      });
    });

    after(async () => {
      // Reset refund delay
      await etherSwapContract.methods.setRefundDelay(4 * 60 * 4).send({
        from: config.ethereum.accounts[0],
        gas: 150000,
      });
    });

    beforeEach(async () => {
      // Fund the swap
      await htlc.fund(
        {
          amount: args.amount,
          paymentHash: args.paymentHash,
        },
        true,
        {
          from: config.ethereum.accounts[0],
          gas: 200000,
        },
      );
    });

    it('should build a refund transaction and return the unsigned transaction when the shouldBroadcast flag is set to false', async () => {
      const unsignedRefundTx = await htlc.refund(false);
      const refundTxResult = await web3.eth.sendTransaction({
        ...unsignedRefundTx,
        from: config.ethereum.accounts[0],
        gas: 200000,
      });
      expect(refundTxResult).to.be.jsonSchema(transactionResponseSchema);
    });

    it('should build and send a refund transaction when the shouldBroadcast flag is set to true', async () => {
      const refundTxResult = await htlc.refund(true, {
        from: config.ethereum.accounts[0],
        gas: 200000,
      });
      expect(refundTxResult).to.match(config.pattern.hex256Bit);
    });
  });

  describe('AdminRefund', () => {
    beforeEach(async () => {
      // Fund the swap
      await htlc.fundWithAdminRefundEnabled(
        {
          amount: args.amount,
          paymentHash: args.paymentHash,
          refundHash: args.refundHash,
        },
        true,
        {
          from: config.ethereum.accounts[0],
          gas: 200000,
        },
      );
    });

    it('should build an admin refund transaction and return the unsigned transaction when the shouldBroadcast flag is set to false', async () => {
      const unsignedRefundTx = await htlc.adminRefund(args.refundSecret, false);
      const refundTxResult = await web3.eth.sendTransaction({
        ...unsignedRefundTx,
        from: config.ethereum.accounts[0],
        gas: 200000,
      });
      expect(refundTxResult).to.be.jsonSchema(transactionResponseSchema);
    });

    it('should build and send an admin refund transaction when the shouldBroadcast flag is set to true', async () => {
      const refundTxResult = await htlc.adminRefund(args.refundSecret, true, {
        from: config.ethereum.accounts[0],
        gas: 200000,
      });
      expect(refundTxResult).to.match(config.pattern.hex256Bit);
    });
  });
});

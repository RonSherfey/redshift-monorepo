import {
  BitcoinSubnet,
  BlockResult,
  Network,
  TxOutput,
} from '@radar/redshift-types';
import { expect } from 'chai';
import { HTLC, UTXO, UtxoHtlc } from '../../../../src';
import { config, toSatoshi, UtxoRpcClient } from '../../../lib/helpers';
import { mineBlocks } from '../../../lib/helpers/btccli';

const { funder, claimer, refunder } = config.bitcoin.integration;
const feeTokensPerVirtualByte = 1;
let htlc: UtxoHtlc<Network.BITCOIN>;
let rpcClient: UtxoRpcClient;
let coinbaseUtxos: TxOutput[];
let fundingUtxos: TxOutput[];
let htlcArgs: UTXO.RedeemScriptArgs;
let paymentSecret: string;

/**
 * Create an HTLC, fund it, and set the values necessary to take action on the swap.
 */
function setupTestSuite(refundAddress: string = refunder.p2pkh_address) {
  before(async () => {
    await setCoinbaseUtxos();

    // Set the HTLC arguments being used
    const random = config.random.args(false);
    htlcArgs = {
      refundAddress,
      paymentHash: random.paymentHash,
      destinationPublicKey: claimer.public_key,
      timelockBlockHeight: await rpcClient.getBlockCount(),
    };
    paymentSecret = random.paymentSecret;

    // Create a new htlc
    htlc = HTLC.construct(Network.BITCOIN, BitcoinSubnet.SIMNET, htlcArgs);

    // Generate & broadcast the funding transaction
    const fundSatoshiAmount = toSatoshi(0.01);
    const fundTxHex = htlc.fund(
      coinbaseUtxos,
      fundSatoshiAmount,
      funder.private_key,
    );
    const fundingTxId = await rpcClient.sendRawTransaction(fundTxHex);

    // Set claimable/refundable outputs
    const p2shOutput = (await rpcClient.getTransactionByHash(fundingTxId))
      .vout[0];
    fundingUtxos = [
      {
        tx_id: fundingTxId,
        index: 0,
        tokens: toSatoshi(p2shOutput.value),
      },
    ];

    // Mine the funding transaction
    await mineBlocks();
  });
}

/**
 * Set the utxos that we will spend in the funding transaction
 */
async function setCoinbaseUtxos() {
  // Get spendable outputs for initial fund (generated coins can't be spent for 100 blocks)
  const coinbaseBlockNumber = (await rpcClient.getBlockCount()) - 100;
  const coinbaseBlockHash = await rpcClient.getBlockHash(coinbaseBlockNumber);
  const coinbaseBlock = (await rpcClient.getBlockByHash(
    coinbaseBlockHash,
  )) as BlockResult;
  const coinbaseTxId = coinbaseBlock.tx[0];
  const coinbaseUtxo = await rpcClient.getTxOutput(coinbaseTxId, 0);
  coinbaseUtxos = [
    {
      tx_id: coinbaseTxId,
      index: 0,
      tokens: toSatoshi(coinbaseUtxo.value),
    },
  ];
}

describe('UTXO HTLC - Bitcoin Network', () => {
  before(async () => {
    // Mine 400 blocks ahead of the coinbase transaction. Segwit activates around 300.
    await mineBlocks(400);

    // Instantiate a new rpc client
    rpcClient = new UtxoRpcClient(Network.BITCOIN, BitcoinSubnet.SIMNET);
  });

  describe('Fund', () => {
    setupTestSuite();

    it('should build a valid fund transaction and return a tx id when broadcast', async () => {
      expect(fundingUtxos[0].tx_id).to.be.a('string');
    });

    it('should have the correct funding values when mined', async () => {
      const bestBlockHash = await rpcClient.getBestBlockHash();
      const block = (await rpcClient.getBlockByHash(
        bestBlockHash,
      )) as BlockResult;
      const fundingTx = await rpcClient.getTransactionByHash(
        fundingUtxos[0].tx_id,
      );
      expect(block.tx.length).to.equal(2); // Coinbase & Funding Txs
      expect(fundingTx.vout[0].value).to.equal(0.01); // Funding Ouput
      expect(fundingTx.vout[1].value)
        .to.be.above(49.98)
        .and.below(50); // Change Output
    });
  });

  describe('Claim', () => {
    setupTestSuite();

    let claimTxId: string;
    it('should build a valid claim transaction given valid parameters', async () => {
      const currentBlockHeight = await rpcClient.getBlockCount();
      const claimTxHex = htlc.claim(
        fundingUtxos,
        claimer.p2pkh_address,
        currentBlockHeight,
        feeTokensPerVirtualByte,
        paymentSecret,
        claimer.private_key,
      );
      claimTxId = await rpcClient.sendRawTransaction(claimTxHex);
      expect(claimTxId).to.be.a('string');
    });

    it('should have the correct claim values when mined', async () => {
      const bestBlockHash = await rpcClient.getBestBlockHash();
      const block = (await rpcClient.getBlockByHash(
        bestBlockHash,
      )) as BlockResult;
      const claimTx = await rpcClient.getTransactionByHash(claimTxId);
      expect(block.tx.length).to.equal(2); // Coinbase & Claim Txs
      expect(claimTx.vout[0].value)
        .to.be.above(0.009)
        .and.below(0.01); // Claim Output less tx fee
    });
  });

  describe('Refund', () => {
    describe('P2PKH Address Refund', () => {
      setupTestSuite();

      let refundTxId: string;
      it('should build a valid refund transaction given valid parameters', async () => {
        const currentBlockHeight = await rpcClient.getBlockCount();
        const refundTxHex = htlc.refund(
          fundingUtxos,
          refunder.p2pkh_address,
          currentBlockHeight,
          feeTokensPerVirtualByte,
          refunder.private_key,
        );
        refundTxId = await rpcClient.sendRawTransaction(refundTxHex);
        expect(refundTxId).to.be.a('string');
      });

      it('should have the correct refund values when mined', async () => {
        const refundTx = await rpcClient.getTransactionByHash(refundTxId);
        expect(refundTx.vout[0].value)
          .to.be.above(0.009)
          .and.below(0.01); // Refund Output less tx fee
      });
    });

    describe('P2WPKH Address Refund', () => {
      setupTestSuite(refunder.p2wpkh_address);

      let refundTxId: string;
      it('should build a valid refund transaction given valid parameters', async () => {
        const currentBlockHeight = await rpcClient.getBlockCount();
        const refundTxHex = htlc.refund(
          fundingUtxos,
          refunder.p2pkh_address,
          currentBlockHeight,
          feeTokensPerVirtualByte,
          refunder.private_key,
        );
        refundTxId = await rpcClient.sendRawTransaction(refundTxHex);
        expect(refundTxId).to.be.a('string');
      });

      it('should have the correct refund values when mined', async () => {
        const refundTx = await rpcClient.getTransactionByHash(refundTxId);
        expect(refundTx.vout[0].value)
          .to.be.above(0.009)
          .and.below(0.01); // Refund Output less tx fee
      });
    });
  });
});

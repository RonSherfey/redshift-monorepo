import explorers from 'bitcore-explorers';
import bitcore from 'bitcore-lib';
import { DecredHtlc, HTLC } from '../../../../src';
import {
  BlockResult,
  DecredSubnet,
  Network,
  TxOutput,
} from '../../../../src/types';
import { expect, UtxoRpcClient } from '../../../lib/helpers';
import { mineBlocks } from '../../../lib/helpers/btccli';

let coinbaseUtxos: any;
const network = bitcore.Networks.dcrdtestnet;
const insight = new explorers.Insight('https://testnet.decred.org', network);

const rpcClient = new UtxoRpcClient(Network.DECRED, DecredSubnet.DCRSIMNET);

describe('Decred HTLC - Decred Network', () => {
  // parsed from ln invoice
  const preimage =
    'c104ac676ab0b9005222043de34195f6666d92382e1e161eac7c9358f6eddeb0';
  // sha256(preimage) === hash
  const hash =
    '685db6a78d5af37aae9cb7531ffc034444a562c774e54a73201cc17d7388fcbd';
  // client private key
  const clientPrivateKey = new bitcore.PrivateKey(
    'f91b705c29978d7f5472201129f3edac61da67e4e2ec9dde1f6b989582321dbf',
    network,
  );
  const clientPublicKey = new bitcore.PublicKey(clientPrivateKey);
  const clientAddress = clientPublicKey.toAddress(network).toString();

  it('should create htlc address', async () => {
    const htlc: DecredHtlc<Network.DECRED> = HTLC.construct(
      Network.DECRED,
      DecredSubnet.DCRTESTNET,
      {
        secret:
          '9cf492dcd4a1724470181fcfeff833710eec58fd6a4e926a8b760266dfde9659',
      },
    );
    // use a hard coded timelock to get expected fundAddress
    htlc.timelock = 1545950303;
    const fundAddress = htlc.fund(hash, clientAddress);
    expect(bitcore.Address.isValid(htlc.serverAddress)).to.equal(true);
    expect(fundAddress.toString()).to.equal(
      'TcsX4QyWV9GsWSHAWkJSJ6aUm1BxBB2tHxg',
    );
    expect(bitcore.Address.isValid(fundAddress)).to.equal(true);
  });

  it('should should create fund address then client funds', async () => {
    const htlc: DecredHtlc<Network.DECRED> = HTLC.construct(
      Network.DECRED,
      DecredSubnet.DCRTESTNET,
      {
        secret:
          '9cf492dcd4a1724470181fcfeff833710eec58fd6a4e926a8b760266dfde9659',
      },
    );

    // create fundAddress for client
    const fundAddress = htlc.fund(hash, clientAddress);

    // client creates transaction
    const spendTx = new bitcore.Transaction(network)
      .from(await getUnspentUtxos(clientAddress))
      .to(fundAddress, 1 * 100000000) // 100000000 atoms == 1 DCR
      .change(clientAddress)
      .sign(clientPrivateKey);

    // client broadcasts transaction
    await broadcastTransaction(spendTx.toString());

    // check balance of fundAddress
    const fundAddressUtxos = await getUnspentUtxos(fundAddress.toString());
    const fundAddressBalance = fundAddressUtxos.reduce((prev, curr) => {
      return curr.atoms + prev;
    }, 0);
    expect(fundAddressBalance).to.equal(1 * 100000000);
  });

  it('should claim', async () => {
    const htlc: DecredHtlc<Network.DECRED> = HTLC.construct(
      Network.DECRED,
      DecredSubnet.DCRTESTNET,
      {
        secret:
          '9cf492dcd4a1724470181fcfeff833710eec58fd6a4e926a8b760266dfde9659',
      },
    );

    // get balance before claim
    const preServerUtxos = await getUnspentUtxos(htlc.serverAddress.toString());
    const preClaimServerBalance = preServerUtxos.reduce((prev, curr) => {
      return curr.atoms + prev;
    }, 0);

    // create fundAddress for client
    const fundAddress = htlc.fund(hash, clientAddress);

    // client creates transaction
    const spendTx = new bitcore.Transaction(network)
      .from(await getUnspentUtxos(clientAddress))
      .to(fundAddress, 1 * 100000000) // 100000000 atoms == 1 DCR
      .change(clientAddress)
      .sign(clientPrivateKey);

    // client broadcasts transaction
    await broadcastTransaction(spendTx.toString());

    // wait for confirmation

    // server gets preimage from paying lnd invoice to create transaction
    const claimTransaction = await htlc.claim(preimage);

    // broadcast claim transaction
    await htlc.broadcast(claimTransaction.toString());

    // get server balance after claim
    const postServerUtxos = await getUnspentUtxos(
      htlc.serverAddress.toString(),
    );
    const postClaimServerBalance = postServerUtxos.reduce((prev, curr) => {
      return curr.atoms + prev;
    }, 0);

    // server recieves DCR
    expect(postClaimServerBalance).to.be.greaterThan(preClaimServerBalance);
  });

  it('should refund', async () => {
    const htlc: DecredHtlc<Network.DECRED> = HTLC.construct(
      Network.DECRED,
      DecredSubnet.DCRTESTNET,
      {
        secret:
          '9cf492dcd4a1724470181fcfeff833710eec58fd6a4e926a8b760266dfde9659',
      },
    );

    // set timelock to the past
    htlc.timelock = 1547143831;

    // create fundAddress for client
    const fundAddress = htlc.fund(hash, clientAddress);

    // client creates transaction
    const spendTx = new bitcore.Transaction(network)
      .from(await getUnspentUtxos(clientAddress))
      .to(fundAddress, 1 * 100000000) // 100000000 atoms == 1 DCR
      .change(clientAddress)
      .sign(clientPrivateKey);

    // client broadcasts transaction
    await broadcastTransaction(spendTx.toString());

    // wait for confirmation

    // get client balance before refund
    const preClientRefundUtxo = await getUnspentUtxos(clientAddress);
    const preClientRefundBalance = preClientRefundUtxo.reduce((prev, curr) => {
      return curr.atoms + prev;
    }, 0);

    // get info from fund address
    const fundUtxos = await getUnspentUtxos(fundAddress.toString());
    const fundBalance = fundUtxos.reduce((prev, curr) => {
      return curr.atoms + prev;
    }, 0);

    // client gets script to refund
    const script = htlc.script;

    // client builds refund transaction
    const transaction = new bitcore.Transaction(network)
      .from(await getUnspentUtxos(fundAddress.toString()))
      .to(clientAddress, fundBalance - 10000) // 10000 is the fee
      .lockUntilDate(Math.floor(Date.now() / 1000)); // CLTV

    // client signs refund transaction
    const signature = bitcore.Transaction.Sighash.sign(
      transaction,
      clientPrivateKey,
      1,
      0,
      script,
    );

    // setup the scriptSig of the spending transaction to spend the p2sh-cltv-p2pkh
    transaction.inputs[0].setScript(
      bitcore.Script.empty()
        .add(signature.toTxFormat())
        .add(new Buffer(clientPublicKey.toString(), 'hex'))
        .add('OP_FALSE') // choose the time-delayed refund code path
        .add(script.toBuffer()),
    );

    // broadcast transaction
    await broadcastTransaction(transaction.toString());

    // client should be refunded
    const postClientRefundUtxo = await getUnspentUtxos(clientAddress);
    const postClientRefundBalance = postClientRefundUtxo.reduce(
      (prev, curr) => {
        return curr.atoms + prev;
      },
      0,
    );
    expect(postClientRefundBalance).to.be.greaterThan(preClientRefundBalance);
  });

  it('should not claim with wrong preimage', async () => {
    const htlc: DecredHtlc<Network.DECRED> = HTLC.construct(
      Network.DECRED,
      DecredSubnet.DCRTESTNET,
      {
        secret:
          '9cf492dcd4a1724470181fcfeff833710eec58fd6a4e926a8b760266dfde9659',
      },
    );

    // get balance before claim
    const preServerUtxos = await getUnspentUtxos(htlc.serverAddress.toString());
    const preClaimServerBalance = preServerUtxos.reduce((prev, curr) => {
      return curr.atoms + prev;
    }, 0);

    // create fundAddress for client
    const fundAddress = htlc.fund(hash, clientAddress);

    // client creates transaction
    const spendTx = new bitcore.Transaction(network)
      .from(await getUnspentUtxos(clientAddress))
      .to(fundAddress, 1 * 100000000) // 100000000 atoms == 1 DCR
      .change(clientAddress)
      .sign(clientPrivateKey);

    // client broadcasts transaction
    await broadcastTransaction(spendTx.toString());

    // claim with wrong preimage
    const wrongPreimage = 'wrong-preimage';

    // server gets preimage from paying lnd invoice to create transaction
    const claimTransaction = await htlc.claim(wrongPreimage);

    try {
      // broadcast claim transaction
      await htlc.broadcast(claimTransaction.toString());
    } catch (e) {
      expect(e.indexOf('failed to validate input')).to.be.greaterThan(0);
    }

    // get server balance after claim
    const postServerUtxos = await getUnspentUtxos(
      htlc.serverAddress.toString(),
    );
    const postClaimServerBalance = postServerUtxos.reduce((prev, curr) => {
      return curr.atoms + prev;
    }, 0);

    // server balance should be the same
    expect(postClaimServerBalance).to.be.equal(preClaimServerBalance);
    // fund address should still have a balance
    const postClaimUtxos = await getUnspentUtxos(fundAddress.toString());
    const postClaimBalance = postClaimUtxos.reduce((prev, curr) => {
      return curr.atoms + prev;
    }, 0);
    expect(postClaimBalance).to.be.greaterThan(0);
  });

  it('should not refund before timelock', async () => {
    const htlc: DecredHtlc<Network.DECRED> = HTLC.construct(
      Network.DECRED,
      DecredSubnet.DCRTESTNET,
      {
        secret:
          '9cf492dcd4a1724470181fcfeff833710eec58fd6a4e926a8b760266dfde9659',
      },
    );

    // create fundAddress for client
    const fundAddress = htlc.fund(hash, clientAddress);

    // client creates transaction
    const spendTx = new bitcore.Transaction(network)
      .from(await getUnspentUtxos(clientAddress))
      .to(fundAddress, 1 * 100000000) // 100000000 atoms == 1 DCR
      .change(clientAddress)
      .sign(clientPrivateKey);

    // client broadcasts transaction
    await broadcastTransaction(spendTx.toString());

    // get client balance before refund
    const preClientRefundUtxo = await getUnspentUtxos(clientAddress);
    const preClientRefundBalance = preClientRefundUtxo.reduce((prev, curr) => {
      return curr.atoms + prev;
    }, 0);

    // get info from fund address
    const fundUtxos = await getUnspentUtxos(fundAddress.toString());
    const fundBalance = fundUtxos.reduce((prev, curr) => {
      return curr.atoms + prev;
    }, 0);

    // client gets script to refund
    const script = htlc.script;

    // client builds refund transaction
    const transaction = new bitcore.Transaction(network)
      .from(await getUnspentUtxos(fundAddress.toString()))
      .to(clientAddress, fundBalance - 10000) // 10000 fee
      .lockUntilDate(Math.floor(Date.now() / 1000)); // CLTV

    // client signs refund transaction
    const signature = bitcore.Transaction.Sighash.sign(
      transaction,
      clientPrivateKey,
      1,
      0,
      script,
    );

    // setup the scriptSig of the spending transaction to spend the p2sh-cltv-p2pkh
    transaction.inputs[0].setScript(
      bitcore.Script.empty()
        .add(signature.toTxFormat())
        .add(new Buffer(clientPublicKey.toString(), 'hex'))
        .add('OP_FALSE') // choose the time-delayed refund code path
        .add(script.toBuffer()),
    );

    // broadcast transaction
    try {
      await broadcastTransaction(transaction.toString());
    } catch (e) {
      expect(e.indexOf('locktime requirement not satisfied')).to.be.greaterThan(
        0,
      );
    }

    // client should be refunded
    const postClientRefundUtxo = await getUnspentUtxos(clientAddress);
    const postClientRefundBalance = postClientRefundUtxo.reduce(
      (prev, curr) => {
        return curr.atoms + prev;
      },
      0,
    );
    expect(postClientRefundBalance).to.be.greaterThan(preClientRefundBalance);
  });
});

// https://testnet.decred.org/api/tx/02bffb107bda73628882775d0e42f86039ede7c5a322e84128f2b9b2a4354788?indent=true
function getUnspentUtxos(
  address: string,
): Promise<bitcore.Transaction.UnspentOutput[]> {
  return new Promise((res, rej) => {
    insight.getUnspentUtxos(
      address,
      (err: any, utxos: bitcore.Transaction.UnspentOutput[]) => {
        if (err) rej(err);
        res(utxos);
      },
    );
  });
}

function broadcastTransaction(transaction: string) {
  return new Promise((res, rej) => {
    insight.broadcast(transaction, (err: any, txId: string) => {
      if (err) rej(err);
      res(txId);
    });
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
      tokens: coinbaseUtxo.value,
    },
  ];
}

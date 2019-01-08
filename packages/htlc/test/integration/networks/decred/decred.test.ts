import explorers from 'bitcore-explorers';
import bitcore from 'bitcore-lib';
import { DecredHtlc, HTLC } from '../../../../src';
import { DecredSubnet, Network } from '../../../../src/types';
import { expect } from '../../../lib/helpers';

const network = bitcore.Networks.dcrdtestnet;
const insight = new explorers.Insight('https://testnet.decred.org', network);

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
  const clientAddress = 'TsRDtJmAbavWHUEaDcCjG7YwDRJThhAnafp';

  // it('should fund htlc address and timelock', async () => {
  //   const htlc: DecredHtlc<Network.DECRED> = HTLC.construct(
  //     Network.DECRED,
  //     DecredSubnet.DCRTESTNET,
  //     {
  //       secret:
  //         '9cf492dcd4a1724470181fcfeff833710eec58fd6a4e926a8b760266dfde9659',
  //     },
  //   );
  //   // use a hard coded timelock to get expected fundAddress
  //   htlc.timelock = 1545950303;
  //   const fundAddress = htlc.fund(hash, clientAddress);
  //   expect(bitcore.Address.isValid(htlc.serverAddress)).to.equal(true);
  //   expect(fundAddress.toString()).to.equal(
  //     'TcsX4QyWV9GsWSHAWkJSJ6aUm1BxBB2tHxg',
  //   );
  //   expect(bitcore.Address.isValid(fundAddress)).to.equal(true);
  // });

  // it('should should create fund address then client funds', async () => {
  //   const htlc: DecredHtlc<Network.DECRED> = HTLC.construct(
  //     Network.DECRED,
  //     DecredSubnet.DCRTESTNET,
  //     {
  //       secret:
  //         '9cf492dcd4a1724470181fcfeff833710eec58fd6a4e926a8b760266dfde9659',
  //     },
  //   );

  //   // create fundAddress for client
  //   const fundAddress = htlc.fund(hash, clientAddress);

  //   // client creates transaction
  //   const spendTx = new bitcore.Transaction(network)
  //     .from(await getUnspentUtxos(clientAddress))
  //     .to(fundAddress, 1 * 100000000) // 100000000 atoms == 1 DCR
  //     .change(clientAddress)
  //     .sign(clientPrivateKey);

  //   // client broadcasts transaction
  //   await broadcastTransaction(spendTx.toString());

  //   await delay(1000);

  //   // check balance of fundAddress
  //   const fundAddressUtxos = await getUnspentUtxos(fundAddress.toString());
  //   const fundAddressBalance = fundAddressUtxos.reduce((prev, curr) => {
  //     return curr.atoms + prev;
  //   }, 0);
  //   expect(fundAddressBalance).to.equal(1 * 100000000);
  // });

  it('should claim', async () => {
    const htlc: DecredHtlc<Network.DECRED> = HTLC.construct(
      Network.DECRED,
      DecredSubnet.DCRTESTNET,
      {
        secret:
          '9cf492dcd4a1724470181fcfeff833710eec58fd6a4e926a8b760266dfde9659',
      },
    );
    htlc.timelock = 1545950303;
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

    // server gets preimage from paying lnd invoice
    const claimTransaction = await htlc.claim(preimage);
    const claimTxHash = await htlc.broadcast(claimTransaction.toString());
    console.log({ claimTxHash });
  });
});

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

function delay(ms: number) {
  return new Promise(res => {
    setTimeout(() => {
      res(true);
    }, ms);
  });
}

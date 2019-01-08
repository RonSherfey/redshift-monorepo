import explorers from 'bitcore-explorers';
import bitcore from 'bitcore-lib';
import { DecredHtlc, HTLC } from '../../../../src';
import { DecredSubnet, Network } from '../../../../src/types';
import { expect } from '../../../lib/helpers';

const network = bitcore.Networks.dcrdtestnet;
const insight = new explorers.Insight('https://testnet.decred.org', network);

describe('Decred HTLC - Decred Network', () => {
  const hash =
    '685db6a78d5af37aae9cb7531ffc034444a562c774e54a73201cc17d7388fcbd';
  const clientAddess = 'TsRDtJmAbavWHUEaDcCjG7YwDRJThhAnafp';

  it('should fund htlc address and timelock', async () => {
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
    const fundAddress = htlc.fund(hash, clientAddess);
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
    const fundAddress = htlc.fund(hash, clientAddess);
    // client send DCR to fundAddress
    const clientPrivateKey = new bitcore.PrivateKey(
      'f91b705c29978d7f5472201129f3edac61da67e4e2ec9dde1f6b989582321dbf',
      network,
    );
    const clientAddress = 'TsRDtJmAbavWHUEaDcCjG7YwDRJThhAnafp';

    // client creates transaction
    const transaction = new bitcore.Transaction(network)
      .from(await getUnspentUtxos(clientAddess))
      .to(fundAddress, 1 * 100000000) // 100000000 atoms == 1 DCR
      .change(clientAddress)
      .sign(clientPrivateKey);
    console.log(transaction);
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

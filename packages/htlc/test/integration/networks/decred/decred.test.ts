import explorers from 'bitcore-explorers';
import bitcore from 'bitcore-lib';
import { DecredHtlc, HTLC } from '../../../../src';
import { DecredSubnet, Network } from '../../../../src/types';
import { expect } from '../../../lib/helpers';

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

  it('should broadcast a transaction', async () => {
    // client creates a transaction
    const network = bitcore.Networks.dcrdtestnet;
    const insight = new explorers.Insight(
      'https://testnet.decred.org',
      network,
    ); // https://mainnet.decred.org/
    const clientPrivateKey = new bitcore.PrivateKey(
      'f91b705c29978d7f5472201129f3edac61da67e4e2ec9dde1f6b989582321dbf',
      network,
    );
    const clientPublicKey = 'TsRDtJmAbavWHUEaDcCjG7YwDRJThhAnafpA'; // derived from clientPrivateKey
    insight.getUnspentUtxos(clientPublicKey, (err: any, utxos: any) => {
      console.log('asdfasdfasdfasdf', utxos);
    });
  });
});

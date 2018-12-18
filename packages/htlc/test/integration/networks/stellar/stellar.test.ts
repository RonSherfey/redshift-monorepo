import axios from 'axios';
import stellarSdk from 'stellar-sdk';
import { HTLC, StellarHtlc } from '../../../../src';
import { Network, StellarSubnet } from '../../../../src/types';
import { expect } from '../../../lib/helpers';

describe('Stellar HTLC - Stellar Network', () => {
  const htlc: StellarHtlc<Network.STELLAR> = HTLC.construct(
    Network.STELLAR,
    StellarSubnet.XLMTESTNET,
    {},
  );

  const serverPubKey =
    'GARV5U3B37X4T4TEDCEH6U5DFJRYAOWIXUHE3CZIC66JEH77VPJEGCFC';
  const serverSecret =
    'SC6SMTLVBRXXOZBGZ46AFZWGU2RAFGHKJ6MBILYXHQCNNO2QOEIG627Y';

  const userPubKey = 'GCTUDMHRAL4RVCUY2F3CBM4SCUAVTEBRMMJB3NJ42N735HKFBNO3DLVS';
  const userSecret = 'SAQJXDFJKR3GPZE4VYKJBWYYPFF2IZ7SNHUIKDCFHBGUVAZUY56YYFNA';

  const preimage = 'abc';
  const hashX =
    '087d80f7f182dd44f184aa86ca34488853ebcc04f0c60d5294919a466b463831';

  describe('Create', () => {
    it('should create and broadcast a transaction envelope', async () => {
      const keyPair = stellarSdk.Keypair.fromSecret(serverSecret);
      // create envelope to broadcast
      const { createEnvelope } = await htlc.create(keyPair);
      // broadcast envelope
      const txResp = await htlc.broadcast(createEnvelope);
      expect(typeof txResp.hash).to.equal('string');
    });
  });

  describe('Fund', () => {
    it('should create escrow account, create fund envelope then broadcast', async () => {
      const serverKeyPair = stellarSdk.Keypair.fromSecret(serverSecret);
      // server creates envelope to broadcast
      const { createEnvelope, escrowPubKey } = await htlc.create(serverKeyPair);
      // broadcast envelope
      await htlc.broadcast(createEnvelope);
      // create fund envelope, sends to user
      const fundEnvelope = await htlc.fund(
        serverKeyPair,
        userPubKey,
        escrowPubKey,
        3,
        hashX,
      );
      // user signs fund envelope
      const userKeyPair = stellarSdk.Keypair.fromSecret(userSecret);
      const signedFundEnvelope = htlc.sign(userKeyPair, fundEnvelope);
      // broadcast funded envelope
      const fundedTxResp = await htlc.broadcast(signedFundEnvelope);
      // get transaction operation
      const operations = await axios.get(
        `${fundedTxResp._links.transaction.href}/operations`,
      );
      expect(operations.data._embedded.records.length).to.equal(4);
      expect(operations.data._embedded.records[0].to).to.equal(escrowPubKey);
      expect(operations.data._embedded.records[0].from).to.equal(userPubKey);
      expect(operations.data._embedded.records[0].amount).to.equal('3.0000000');
    });
  });

  describe('Claim', () => {
    it('should create escrow account, fund and claim', async () => {
      // get initial server account balance
      const preClaimServerBalance = await htlc
        .accountInfo(serverPubKey)
        .then(resp => Number(resp.balances[0].balance));
      const serverKeyPair = stellarSdk.Keypair.fromSecret(serverSecret);
      // server creates envelope to broadcast
      const { createEnvelope, escrowPubKey } = await htlc.create(serverKeyPair);
      // broadcast envelope
      await htlc.broadcast(createEnvelope);
      // create fund envelope, sends to user
      const fundEnvelope = await htlc.fund(
        serverKeyPair,
        userPubKey,
        escrowPubKey,
        3,
        hashX,
      );
      // user signs fund envelope
      const userKeyPair = stellarSdk.Keypair.fromSecret(userSecret);
      const signedFundEnvelope = htlc.sign(userKeyPair, fundEnvelope);
      // broadcast funded envelope
      await htlc.broadcast(signedFundEnvelope);
      // server pays invoice and gets preimage
      const claimEnvelope = await htlc.claim(
        serverKeyPair,
        escrowPubKey,
        preimage,
      );
      // broadcast claim Envelope
      await htlc.broadcast(claimEnvelope);
      // get balance after claiming
      const postClaimServerBalance = await htlc
        .accountInfo(serverPubKey)
        .then(resp => Number(resp.balances[0].balance));
      // server should recieve XLM
      expect(postClaimServerBalance).to.be.above(preClaimServerBalance);
    });
  });
});

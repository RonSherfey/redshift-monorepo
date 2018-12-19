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
    'GDDUGE5U7HOA75I33BYGQDU6FIRCRMVM6HD7WIMV2ROZ4AJZBEHYPGLT';
  const serverSecret =
    'SDQDRU35373DU24DH736GUQ4TVWHVIPDEZM5Q2VHF6NE6JTJGXRWM5TZ';

  const userPubKey = 'GBPWIW4WNBGSR2N3QFGKKELSOVGJY265IAV34TP64VCQPVYJTKH7TEFS';
  const userSecret = 'SDGQ5H6JY4A5ZI7NSENSPIXDZIBEOKCEOB4XW4HUNMC6A26QVOWOULYA';

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

  describe('Refund', () => {
    it('should create escrow account, fund and refund', async () => {
      // get initial server account balance
      const preClaimServerBalance = await htlc
        .accountInfo(serverPubKey)
        .then(resp => Number(resp.balances[0].balance));
      const preClaimUserBalance = await htlc
        .accountInfo(userPubKey)
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
        999, // big baller
        hashX,
      );
      // create refund envelope in case shit goes wrong
      const refundEnvelope = await htlc.refund(
        serverKeyPair,
        userPubKey,
        escrowPubKey,
        1,
      );
      // user signs fund envelope
      const userKeyPair = stellarSdk.Keypair.fromSecret(userSecret);
      const signedFundEnvelope = htlc.sign(userKeyPair, fundEnvelope);
      // broadcast funded envelope
      await htlc.broadcast(signedFundEnvelope);
      // shit went wrong... signing refund
      const signedRefundEnvelope = htlc.sign(userKeyPair, refundEnvelope);
      // broadcast refund
      await htlc.broadcast(signedRefundEnvelope);
      // get balance after refund
      const postClaimServerBalance = await htlc
        .accountInfo(serverPubKey)
        .then(resp => Number(resp.balances[0].balance));
      const postClaimUserBalance = await htlc
        .accountInfo(userPubKey)
        .then(resp => Number(resp.balances[0].balance));
      // funds should be returned
      expect(Math.round(preClaimServerBalance)).to.equal(
        Math.round(postClaimServerBalance),
      );
      expect(Math.round(preClaimUserBalance)).to.equal(
        Math.round(postClaimUserBalance),
      );
    });
  });

  describe('Claim with wrong hash', () => {
    it('should create escrow account, fund and claim with wrong preimage', async () => {
      // get initial server account balance
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
      // server pays does not pay and tries a different preimage
      const claimEnvelope = await htlc.claim(
        serverKeyPair,
        escrowPubKey,
        'this-is-an-incorrect-preimage',
      );
      // broadcast claim Envelope
      try {
        await htlc.broadcast(claimEnvelope);
      } catch (err) {
        expect(err).to.not.be.undefined;
      }
      // escrow account should still exist with a balance
      const postClaimEscrowBalance = await htlc
        .accountInfo(escrowPubKey)
        .then(resp => Number(resp.balances[0].balance));
      expect(postClaimEscrowBalance).to.be.greaterThan(0);
    });
  });

  describe('Refund before timelock', () => {
    it('should create escrow account, fund and refund before timelock', async () => {
      // get initial server account balance
      const preClaimServerBalance = await htlc
        .accountInfo(serverPubKey)
        .then(resp => Number(resp.balances[0].balance));
      const preClaimUserBalance = await htlc
        .accountInfo(userPubKey)
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
      // create refund envelope in case shit goes wrong
      const refundEnvelope = await htlc.refund(
        serverKeyPair,
        userPubKey,
        escrowPubKey,
        3600, // 1 hr timelock
      );
      // user signs fund envelope
      const userKeyPair = stellarSdk.Keypair.fromSecret(userSecret);
      const signedFundEnvelope = htlc.sign(userKeyPair, fundEnvelope);
      // broadcast funded envelope
      await htlc.broadcast(signedFundEnvelope);
      // shit went wrong... signing refund
      const signedRefundEnvelope = htlc.sign(userKeyPair, refundEnvelope);
      // broadcast refund
      try {
        await htlc.broadcast(signedRefundEnvelope);
      } catch (err) {
        expect(err).to.not.be.undefined;
      }
      // escrow account should still exist with a balance
      const postClaimEscrowBalance = await htlc
        .accountInfo(escrowPubKey)
        .then(resp => Number(resp.balances[0].balance));
      expect(postClaimEscrowBalance).to.be.greaterThan(0);
    });
  });

  describe('Claim with different keypair', () => {
    it('should create escrow account, fund and claim with different keypair', async () => {
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
      // server pays invoice and gets preimage but signs with wrong keypair
      const wrongServerKeyPair = stellarSdk.Keypair.fromSecret(
        'SBRNVXKBUC6H7MGJLZTWKWDOFYLBGGHSLG3XKOVY6UIZJQMJFHRFRQLE',
      );
      const claimEnvelope = await htlc.claim(
        wrongServerKeyPair,
        escrowPubKey,
        preimage,
      );
      // broadcast claim with wrong keypair
      try {
        await htlc.broadcast(claimEnvelope);
      } catch (err) {
        expect(err).to.not.be.undefined;
      }
      // escrow account should still exist with a balance
      const postClaimEscrowBalance = await htlc
        .accountInfo(escrowPubKey)
        .then(resp => Number(resp.balances[0].balance));
      expect(postClaimEscrowBalance).to.be.greaterThan(0);
    });
  });
});

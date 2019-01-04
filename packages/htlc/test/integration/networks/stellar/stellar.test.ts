import axios from 'axios';
import stellarSdk from 'stellar-sdk';
import { HTLC, StellarHtlc } from '../../../../src';
import { Network, StellarSubnet } from '../../../../src/types';
import { expect } from '../../../lib/helpers';

describe('Stellar HTLC - Stellar Network', () => {
  const serverPubKey =
    'GAJCCCRIRXAYEU2ATNQAFYH4E2HKLN2LCKM2VPXCTJKIBVTRSOLEGCJZ';
  const serverSecret =
    'SDJCZISO5M5XAUV6Y7MZJNN3JZ5BWPXDHV4GXP3MYNACVDNQRQSERXBC';

  const userPubKey = 'GCP6IHMHWRCF5TQ4ZP6TVIRNDZD56W42F42VHYWMVDGDAND75YGAHHBQ';
  const userSecret = 'SCEDMZ7DUEOUGRQWEXHXEXISQ2NAWI5IDXRHYWT2FHTYLIQOSUK5FX2E';

  const preimage = 'abc';
  const hashX =
    '087d80f7f182dd44f184aa86ca34488853ebcc04f0c60d5294919a466b463831';

  // https://github.com/zulucrypto/docker-stellar-integration-test-network
  stellarSdk.Network.use(
    new stellarSdk.Network('Integration Test Network ; zulucrypto'),
  );
  const server = new stellarSdk.Server('http://localhost:8000', {
    allowHttp: true,
  });
  const userKeyPair = stellarSdk.Keypair.fromSecret(userSecret);

  describe('Create', () => {
    it('should create and broadcast a transaction envelope', async () => {
      const htlc: StellarHtlc<Network.STELLAR> = HTLC.construct(
        Network.STELLAR,
        StellarSubnet.ZULUCRYPTO,
        { secret: serverSecret },
      );
      // create envelope to broadcast
      const createEnvelope = await htlc.create();
      // broadcast envelope
      const txResp = await htlc.broadcast(createEnvelope);
      expect(typeof txResp.hash).to.equal('string');
    });
  });

  describe('Fund', () => {
    it('should create escrow account, create fund envelope then broadcast', async () => {
      const htlc: StellarHtlc<Network.STELLAR> = HTLC.construct(
        Network.STELLAR,
        StellarSubnet.ZULUCRYPTO,
        { secret: serverSecret },
      );
      // server creates envelope to broadcast
      const createEnvelope = await htlc.create();
      // broadcast envelope
      await htlc.broadcast(createEnvelope);
      // create fund envelope, sends to user
      const fundEnvelope = await htlc.fund(userPubKey, 3, hashX);

      // user signs fund envelope
      const txFromEnvelope = new stellarSdk.Transaction(fundEnvelope);
      txFromEnvelope.sign(userKeyPair);
      const fundedTxResp = await server.submitTransaction(txFromEnvelope);

      await delay(500);
      // get transaction operation
      const operations = await axios.get(
        `${fundedTxResp._links.transaction.href}/operations`,
      );
      expect(operations.data._embedded.records.length).to.equal(4);
      expect(operations.data._embedded.records[0].to).to.equal(
        htlc.escrowKeyPair.publicKey(),
      );
      expect(operations.data._embedded.records[0].from).to.equal(userPubKey);
      expect(operations.data._embedded.records[0].amount).to.equal('3.0000000');
    });
  });

  describe('Claim', () => {
    it('should create escrow account, fund and claim', async () => {
      const htlc: StellarHtlc<Network.STELLAR> = HTLC.construct(
        Network.STELLAR,
        StellarSubnet.ZULUCRYPTO,
        { secret: serverSecret },
      );
      // get initial server account balance
      const preClaimServerBalance = await htlc
        .accountInfo(serverPubKey)
        .then(resp => Number(resp.balances[0].balance));
      // server creates envelope to broadcast
      const createEnvelope = await htlc.create();
      // broadcast envelope
      await htlc.broadcast(createEnvelope);
      // create fund envelope, sends to user
      const fundEnvelope = await htlc.fund(userPubKey, 3, hashX);

      // user signs fund envelope
      const txFromEnvelope = new stellarSdk.Transaction(fundEnvelope);
      txFromEnvelope.sign(userKeyPair);
      await server.submitTransaction(txFromEnvelope);

      // server pays invoice and gets preimage
      const claimEnvelope = await htlc.claim(preimage);
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
      const htlc: StellarHtlc<Network.STELLAR> = HTLC.construct(
        Network.STELLAR,
        StellarSubnet.ZULUCRYPTO,
        { secret: serverSecret },
      );
      // get initial server account balance
      const preClaimServerBalance = await htlc
        .accountInfo(serverPubKey)
        .then(resp => Number(resp.balances[0].balance));
      const preClaimUserBalance = await htlc
        .accountInfo(userPubKey)
        .then(resp => Number(resp.balances[0].balance));
      // server creates envelope to broadcast
      const createEnvelope = await htlc.create();
      // broadcast envelope
      await htlc.broadcast(createEnvelope);
      // create fund envelope, sends to user
      const fundEnvelope = await htlc.fund(
        userPubKey,
        999, // big baller
        hashX,
      );
      // create refund envelope in case shit goes wrong
      const refundEnvelope = await htlc.refund(userPubKey, 1);

      // user signs fund envelope
      const txFromFundEnvelope = new stellarSdk.Transaction(fundEnvelope);
      txFromFundEnvelope.sign(userKeyPair);
      await server.submitTransaction(txFromFundEnvelope);

      // ... shit went wrong

      // user signs refund envelope
      const txFromRefundEnvelope = new stellarSdk.Transaction(refundEnvelope);
      txFromRefundEnvelope.sign(userKeyPair);
      await server.submitTransaction(txFromRefundEnvelope);

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

  describe('Claim with wrong preimage', () => {
    it('should create escrow account, fund and claim with wrong preimage', async () => {
      const htlc: StellarHtlc<Network.STELLAR> = HTLC.construct(
        Network.STELLAR,
        StellarSubnet.ZULUCRYPTO,
        { secret: serverSecret },
      );
      // server creates envelope to broadcast
      const createEnvelope = await htlc.create();
      // broadcast envelope
      await htlc.broadcast(createEnvelope);
      // create fund envelope, sends to user
      const fundEnvelope = await htlc.fund(userPubKey, 3, hashX);

      // user signs fund envelope
      const txFromEnvelope = new stellarSdk.Transaction(fundEnvelope);
      txFromEnvelope.sign(userKeyPair);
      await server.submitTransaction(txFromEnvelope);

      // server uses a incorrect preimage
      const claimEnvelope = await htlc.claim('this-is-an-incorrect-preimage');
      // broadcast claim Envelope
      try {
        await htlc.broadcast(claimEnvelope);
      } catch (err) {
        expect(err).to.not.be.undefined;
      }
      // escrow account should still exist with a balance
      const postClaimEscrowBalance = await htlc
        .accountInfo(htlc.escrowKeyPair.publicKey())
        .then(resp => Number(resp.balances[0].balance));
      expect(postClaimEscrowBalance).to.be.greaterThan(0);
    });
  });

  describe('Claim with different keypair', () => {
    it('should create escrow account, fund and claim with different keypair', async () => {
      const htlc: StellarHtlc<Network.STELLAR> = HTLC.construct(
        Network.STELLAR,
        StellarSubnet.ZULUCRYPTO,
        { secret: serverSecret },
      );
      // server creates envelope to broadcast
      const createEnvelope = await htlc.create();
      // broadcast envelope
      await htlc.broadcast(createEnvelope);
      // create fund envelope, sends to user
      const fundEnvelope = await htlc.fund(userPubKey, 3, hashX);

      // user signs fund envelope
      const txFromEnvelope = new stellarSdk.Transaction(fundEnvelope);
      txFromEnvelope.sign(userKeyPair);
      await server.submitTransaction(txFromEnvelope);

      // server pays invoice and gets preimage but signs with wrong keypair
      const wrongServerWallet: StellarHtlc<Network.STELLAR> = HTLC.construct(
        Network.STELLAR,
        StellarSubnet.ZULUCRYPTO,
        { secret: 'SBRNVXKBUC6H7MGJLZTWKWDOFYLBGGHSLG3XKOVY6UIZJQMJFHRFRQLE' },
      );
      wrongServerWallet.escrowKeyPair = htlc.escrowKeyPair;
      const claimEnvelope = await wrongServerWallet.claim(preimage);
      // broadcast claim with wrong keypair
      try {
        await wrongServerWallet.broadcast(claimEnvelope);
      } catch (err) {
        // unable to broadcast because server signed with wrong keypair
        expect(err).to.not.be.undefined;
      }
      // escrow account should still exist with a balance
      const postClaimEscrowBalance = await htlc
        .accountInfo(htlc.escrowKeyPair.publicKey())
        .then(resp => Number(resp.balances[0].balance));
      expect(postClaimEscrowBalance).to.be.greaterThan(0);
    });
  });

  describe('Refund before timelock', () => {
    it('should create escrow account, fund and refund before timelock', async () => {
      const htlc: StellarHtlc<Network.STELLAR> = HTLC.construct(
        Network.STELLAR,
        StellarSubnet.ZULUCRYPTO,
        { secret: serverSecret },
      );
      // server creates envelope to broadcast
      const createEnvelope = await htlc.create();
      // broadcast envelope
      await htlc.broadcast(createEnvelope);
      // create fund envelope, sends to user
      const fundEnvelope = await htlc.fund(userPubKey, 3, hashX);
      // create refund envelope in case shit goes wrong
      const refundEnvelope = await htlc.refund(userPubKey, 3600); // 1hr timelock

      // user signs fund envelope
      const txFromFundEnvelope = new stellarSdk.Transaction(fundEnvelope);
      txFromFundEnvelope.sign(userKeyPair);
      await server.submitTransaction(txFromFundEnvelope);
      // shit went wrong... signing refund
      const txFromRefundEnvelope = new stellarSdk.Transaction(refundEnvelope);
      txFromRefundEnvelope.sign(userKeyPair);

      // broadcast refund
      try {
        await server.submitTransaction(txFromRefundEnvelope);
      } catch (err) {
        // unable to broadcast because of timelock is set to 1 hr
        expect(err).to.not.be.undefined;
      }
      // escrow account should still exist with a balance
      const postClaimEscrowBalance = await htlc
        .accountInfo(htlc.escrowKeyPair.publicKey())
        .then(resp => Number(resp.balances[0].balance));
      expect(postClaimEscrowBalance).to.be.greaterThan(0);
    });
  });

  describe('AccountInfo Invalid', () => {
    it('should throw error if pub key is not vaid', async () => {
      try {
        const htlc: StellarHtlc<Network.STELLAR> = HTLC.construct(
          Network.STELLAR,
          StellarSubnet.ZULUCRYPTO,
          { secret: serverSecret },
        );
        await htlc.accountInfo('invalid-pub-key');
      } catch (err) {
        expect(err).to.not.be.undefined;
      }
    });
  });
});

function delay(milliseconds: number) {
  return new Promise(res => {
    setTimeout(() => {
      res(true);
    }, milliseconds);
  });
}

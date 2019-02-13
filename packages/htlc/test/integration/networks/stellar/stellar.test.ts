import { Network, StellarSubnet } from '@radar/redshift-types';
import axios from 'axios';
import {
  Keypair,
  Network as StellarNetwork,
  Server,
  Transaction,
} from 'stellar-sdk';
import { HTLC, StellarHtlc } from '../../../../src';
import { expect } from '../../../lib/helpers';

describe('Stellar HTLC - Stellar Network', () => {
  const serverPubKey =
    'GAJCCCRIRXAYEU2ATNQAFYH4E2HKLN2LCKM2VPXCTJKIBVTRSOLEGCJZ';
  const serverSecret =
    'SDJCZISO5M5XAUV6Y7MZJNN3JZ5BWPXDHV4GXP3MYNACVDNQRQSERXBC';
  const userPubKey = 'GCP6IHMHWRCF5TQ4ZP6TVIRNDZD56W42F42VHYWMVDGDAND75YGAHHBQ';
  const userSecret = 'SCEDMZ7DUEOUGRQWEXHXEXISQ2NAWI5IDXRHYWT2FHTYLIQOSUK5FX2E';
  const paymentSecret = 'abc';
  const hashX =
    '087d80f7f182dd44f184aa86ca34488853ebcc04f0c60d5294919a466b463831';

  let server: Server;
  let userKeyPair: Keypair;
  before(() => {
    StellarNetwork.use(
      new StellarNetwork('Integration Test Network ; zulucrypto'),
    );
    server = new Server('http://localhost:8000', {
      allowHttp: true,
    });
    userKeyPair = Keypair.fromSecret(userSecret);
  });

  let htlc: StellarHtlc<Network.STELLAR>;
  beforeEach(() => {
    htlc = HTLC.construct(Network.STELLAR, StellarSubnet.ZULUCRYPTO_SIMNET, {
      secret: serverSecret,
    });
  });

  describe('Create', () => {
    it('should create and broadcast a transaction envelope', async () => {
      const txResponse = await htlc.create();
      expect(txResponse.hash).to.be.a('string');
    });
  });

  describe('Fund', () => {
    it('should create escrow account, create fund envelope then broadcast', async () => {
      await htlc.create();

      // Create fund envelope, send to user
      const fundEnvelope = await htlc.fund(userPubKey, 3, hashX);

      // User signs fund envelope
      const txFromEnvelope = new Transaction(fundEnvelope);
      txFromEnvelope.sign(userKeyPair);
      const fundedTxResp = await server.submitTransaction(txFromEnvelope);

      await delay(500);

      // Get transaction operation
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
      // Get initial server account balance
      const preClaimServerBalance = (await htlc.accountInfo(serverPubKey))
        .balances[0].balance;

      // Server creates and broadcasts envelope
      await htlc.create();

      // Create fund envelope, sends to user
      const fundEnvelope = await htlc.fund(userPubKey, 3, hashX);

      // User signs fund envelope
      const txFromEnvelope = new Transaction(fundEnvelope);
      txFromEnvelope.sign(userKeyPair);
      await server.submitTransaction(txFromEnvelope);

      // Server pays invoice, gets preimage, and broadcasts the claim envelope
      await htlc.claim(paymentSecret);

      // Get balance after claiming
      const postClaimServerBalance = (await htlc.accountInfo(serverPubKey))
        .balances[0].balance;

      // Server should recieve XLM
      expect(Number(postClaimServerBalance)).to.be.above(
        Number(preClaimServerBalance),
      );
    });
  });

  describe('Refund', () => {
    it('should create escrow account, fund and refund', async () => {
      // Get initial server account balance
      const preClaimServerBalance = (await htlc.accountInfo(serverPubKey))
        .balances[0].balance;
      const preClaimUserBalance = (await htlc.accountInfo(userPubKey))
        .balances[0].balance;

      // Server creates and broadcasts envelope
      await htlc.create();

      // Create fund envelope, sends to user
      const fundEnvelope = await htlc.fund(userPubKey, 999, hashX);

      // Create refund envelope in case something goes wrong
      const refundEnvelope = await htlc.refund(userPubKey, 1);

      // User signs fund envelope
      const txFromFundEnvelope = new Transaction(fundEnvelope);
      txFromFundEnvelope.sign(userKeyPair);
      await server.submitTransaction(txFromFundEnvelope);

      // Something goes wrong

      // User signs refund envelope
      const txFromRefundEnvelope = new Transaction(refundEnvelope);
      txFromRefundEnvelope.sign(userKeyPair);
      await server.submitTransaction(txFromRefundEnvelope);

      // Get balance after refund
      const postClaimServerBalance = (await htlc.accountInfo(serverPubKey))
        .balances[0].balance;
      const postClaimUserBalance = (await htlc.accountInfo(userPubKey))
        .balances[0].balance;

      // Funds should be returned
      expect(Math.round(Number(preClaimServerBalance))).to.equal(
        Math.round(Number(postClaimServerBalance)),
      );
      expect(Math.round(Number(preClaimUserBalance))).to.equal(
        Math.round(Number(postClaimUserBalance)),
      );
    });
  });

  describe('Claim with wrong preimage', () => {
    it('should create escrow account, fund and claim with wrong preimage', async () => {
      // Server creates and broadcasts envelope
      await htlc.create();

      // Create fund envelope, sends to user
      const fundEnvelope = await htlc.fund(userPubKey, 3, hashX);

      // User signs fund envelope
      const txFromEnvelope = new Transaction(fundEnvelope);
      txFromEnvelope.sign(userKeyPair);
      await server.submitTransaction(txFromEnvelope);

      // Server uses a incorrect preimage
      await expect(
        htlc.claim('this-is-an-incorrect-preimage'),
      ).to.be.rejectedWith(Error);

      // Escrow account should still exist with a balance
      const postClaimEscrowBalance = (await htlc.accountInfo(
        htlc.escrowKeyPair.publicKey(),
      )).balances[0].balance;
      expect(Number(postClaimEscrowBalance)).to.be.greaterThan(0);
    });
  });

  describe('Claim with different keypair', () => {
    it('should create escrow account, fund and claim with different keypair', async () => {
      // Server creates and broadcasts envelope
      await htlc.create();

      // Create fund envelope, sends to user
      const fundEnvelope = await htlc.fund(userPubKey, 3, hashX);

      // User signs fund envelope
      const txFromEnvelope = new Transaction(fundEnvelope);
      txFromEnvelope.sign(userKeyPair);
      await server.submitTransaction(txFromEnvelope);

      // Server pays invoice and gets preimage but signs with wrong keypair
      const wrongServerWallet = HTLC.construct(
        Network.STELLAR,
        StellarSubnet.ZULUCRYPTO_SIMNET,
        { secret: 'SBRNVXKBUC6H7MGJLZTWKWDOFYLBGGHSLG3XKOVY6UIZJQMJFHRFRQLE' },
      );
      (wrongServerWallet as any)._escrowKeyPair = htlc.escrowKeyPair;

      // Unable to broadcast because server signed with wrong keypair
      await expect(wrongServerWallet.claim(paymentSecret)).to.be.rejectedWith(
        Error,
      );

      // Escrow account should still exist with a balance
      const postClaimEscrowBalance = (await htlc.accountInfo(
        htlc.escrowKeyPair.publicKey(),
      )).balances[0].balance;
      expect(Number(postClaimEscrowBalance)).to.be.greaterThan(0);
    });
  });

  describe('Refund before timelock', () => {
    it('should create escrow account, fund and refund before timelock', async () => {
      // Server creates and broadcasts envelope
      await htlc.create();

      // Create fund envelope, sends to user
      const fundEnvelope = await htlc.fund(userPubKey, 3, hashX);

      // Create refund envelope in case something goes wrong
      const refundEnvelope = await htlc.refund(userPubKey, 3600); // 1hr timelock

      // User signs fund envelope
      const txFromFundEnvelope = new Transaction(fundEnvelope);
      txFromFundEnvelope.sign(userKeyPair);
      await server.submitTransaction(txFromFundEnvelope);

      // Something went wrong... signing refund
      const txFromRefundEnvelope = new Transaction(refundEnvelope);
      txFromRefundEnvelope.sign(userKeyPair);

      // Unable to broadcast refund because timelock is set to 1 hr
      await expect(
        server.submitTransaction(txFromRefundEnvelope),
      ).to.be.rejectedWith(Error);

      // Escrow account should still exist with a balance
      const postClaimEscrowBalance = await htlc
        .accountInfo(htlc.escrowKeyPair.publicKey())
        .then(resp => Number(resp.balances[0].balance));
      expect(postClaimEscrowBalance).to.be.greaterThan(0);
    });
  });

  describe('AccountInfo Invalid', () => {
    it('should throw error if pub key is not vaid', async () => {
      await expect(htlc.accountInfo('invalid-pub-key')).to.be.rejectedWith(
        Error,
      );
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

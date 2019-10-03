import { validator } from '../src';
import { expect, fixtures } from './lib';

describe('validator', () => {
  describe('isValidNetwork', () => {
    it('should return true if the network is valid', () => {
      expect(validator.isValidNetwork(fixtures.valid.network)).to.be.true;
    });

    it('should return false if the network is not valid', () => {
      expect(validator.isValidNetwork(fixtures.invalid.network)).to.be.false;
    });
  });

  describe('isValidOnchainTicker', () => {
    it('should return true if the on-chain ticker is valid', () => {
      expect(validator.isValidOnchainTicker(fixtures.valid.onchainTicker)).to.be
        .true;
    });

    it('should return false if the on-chain ticker is not valid', () => {
      expect(validator.isValidOnchainTicker(fixtures.invalid.onchainTicker)).to
        .be.false;
    });
  });

  describe('isValidMainnetOnchainTicker', () => {
    it('should return true if the mainnet on-chain ticker is valid', () => {
      expect(
        validator.isValidMainnetOnchainTicker(
          fixtures.valid.mainnetOnchainTicker,
        ),
      ).to.be.true;
    });

    it('should return false if the mainnet on-chain ticker is not valid', () => {
      expect(
        validator.isValidMainnetOnchainTicker(
          fixtures.invalid.mainnetOnchainTicker,
        ),
      ).to.be.false;
    });
  });

  describe('isValidMarket', () => {
    it('should return true if the market is valid', () => {
      expect(validator.isValidMarket(fixtures.valid.market)).to.be.true;
    });

    it('should return false if the market is not valid', () => {
      expect(validator.isValidMarket(fixtures.invalid.market)).to.be.false;
    });
  });

  describe('isValidUUID', () => {
    it('should return true if the uuid is valid', () => {
      expect(validator.isValidUUID(fixtures.valid.uuid)).to.be.true;
    });

    it('should return false if the uuid is not valid', () => {
      expect(validator.isValidUUID(fixtures.invalid.uuid)).to.be.false;
    });
  });

  describe('isValidBase58Check', () => {
    it('should return true if the passed string is valid base58check', () => {
      expect(validator.isValidBase58Check(fixtures.valid.base58Check)).to.be
        .true;
    });

    it('should return false if the passed string is not valid base58check', () => {
      expect(validator.isValidBase58Check(fixtures.invalid.base58Check)).to.be
        .false;
    });
  });

  describe('isValidBase58Check', () => {
    it('should return true if the passed string is valid base58check', () => {
      expect(validator.isValidBase58Check(fixtures.valid.base58Check)).to.be
        .true;
    });

    it('should return false if the passed string is not valid base58check', () => {
      expect(validator.isValidBase58Check(fixtures.invalid.base58Check)).to.be
        .false;
    });
  });

  describe('isValidBech32', () => {
    it('should return true if the passed string is valid bech32', () => {
      expect(validator.isValidBech32(fixtures.valid.bech32)).to.be.true;
    });

    it('should return false if the passed string is not valid bech32', () => {
      expect(validator.isValidBech32(fixtures.invalid.bech32)).to.be.false;
    });
  });

  describe('isValidBase58CheckOrBech32', () => {
    it('should return true if the passed string is valid base58check', () => {
      expect(validator.isValidBase58CheckOrBech32(fixtures.valid.base58Check))
        .to.be.true;
    });

    it('should return true if the passed string is valid bech32', () => {
      expect(validator.isValidBase58CheckOrBech32(fixtures.valid.bech32)).to.be
        .true;
    });

    it('should return false if the passed string is not valid base58check or bech32', () => {
      expect(validator.isValidBase58CheckOrBech32(fixtures.invalid.base58Check))
        .to.be.false;
    });
  });

  describe('isValidHex', () => {
    it('should return true if the passed string is valid hex', () => {
      expect(validator.isValidHex(fixtures.valid.hex)).to.be.true;
    });

    it('should return false if the passed string is not valid hex', () => {
      expect(validator.isValidHex(fixtures.invalid.hex)).to.be.false;
    });
  });

  describe('isValidNetworkAndSubnet', () => {
    it('should return true if the network and subnet are valid', () => {
      expect(
        validator.isValidNetworkAndSubnet(
          fixtures.valid.network,
          fixtures.valid.subnet,
        ),
      ).to.be.true;
    });

    it('should return false if the network and subnet are not valid', () => {
      expect(
        validator.isValidNetworkAndSubnet(
          fixtures.invalid.network,
          fixtures.invalid.subnet,
        ),
      ).to.be.false;
    });
  });
});

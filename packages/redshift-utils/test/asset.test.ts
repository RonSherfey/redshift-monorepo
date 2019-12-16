import { asset } from '../src';
import { AssetError } from '../src/types';
import { expect, fixtures } from './lib';

describe('asset', () => {
  describe('getOnchainTicker', () => {
    it('should return the on-chain ticker if the market is valid', () => {
      expect(asset.getOnchainTicker(fixtures.valid.market)).to.equal(
        fixtures.valid.onchainTicker,
      );
    });

    it('should throw an INVALID_MARKET error if the market is not valid', () => {
      expect(() => asset.getOnchainTicker(fixtures.invalid.market)).to.throw(
        Error,
        AssetError.INVALID_MARKET,
      );
    });
  });

  describe('getNetworkDetails', () => {
    it('should return the network details if a valid on-chain ticker is provided', () => {
      expect(
        asset.getNetworkDetails(fixtures.valid.onchainTicker),
      ).to.deep.equal({
        network: fixtures.valid.network,
        subnet: fixtures.valid.subnet,
      });
    });

    it('should return the network details if a valid market is provided', () => {
      expect(asset.getNetworkDetails(fixtures.valid.market)).to.deep.equal({
        network: fixtures.valid.network,
        subnet: fixtures.valid.subnet,
      });
    });

    it('should throw an INVALID_MARKET_OR_TICKER error if the param is not valid', () => {
      expect(() => asset.getNetworkDetails(fixtures.invalid.market)).to.throw(
        Error,
        AssetError.INVALID_MARKET_OR_TICKER,
      );
    });
  });

  describe('getMainnetTicker', () => {
    it('should return the mainnet on-chain ticker if the ticker is valid', () => {
      expect(asset.getMainnetTicker(fixtures.valid.onchainTicker)).to.equal(
        fixtures.valid.onchainTicker,
      );
    });

    it('should throw an INVALID_TICKER error if the on-chain ticker is not valid', () => {
      expect(() =>
        asset.getMainnetTicker(fixtures.invalid.onchainTicker),
      ).to.throw(Error, AssetError.INVALID_TICKER);
    });
  });
});

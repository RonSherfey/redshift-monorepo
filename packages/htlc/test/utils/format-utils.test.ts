import { expect } from 'chai';
import { addHexPrefix, isHexPrefixed } from '../../src/utils';

describe('utils/format-utils', () => {
  const nonPrefixedHexString = 'deadbeef';
  const prefixedHexString = `0x${nonPrefixedHexString}`;

  describe('isHexPrefixed()', () => {
    it('should return true when the string is hex prefixed', () => {
      expect(isHexPrefixed(prefixedHexString)).to.be.true;
    });

    it('should return false when the string is not hex prefixed', () => {
      expect(isHexPrefixed(nonPrefixedHexString)).to.be.false;
    });
  });

  describe('addHexPrefix()', () => {
    it('should not add a hex prefix when the string is already hex prefixed', () => {
      const processedString = addHexPrefix(prefixedHexString);
      expect(processedString).to.equal(prefixedHexString);
    });

    it('should add a hex prefix when the string is not hex prefixed', () => {
      const processedString = addHexPrefix(nonPrefixedHexString);
      expect(processedString).to.equal(prefixedHexString);
    });
  });
});

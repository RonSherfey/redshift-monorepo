import {
  isArray,
  isDefined,
  isFunction,
  isNumber,
  isOneOf,
  isString,
} from '../../../src/utils';
import { expect } from '../../lib/helpers';

describe('utils/type-utils', () => {
  const aString = 'string';
  const aNumber = 1;
  const aFunction = () => {};
  const anArray: any[] = [];
  const anUndefinedVariable = undefined;

  describe('isString()', () => {
    it('should return true when the arg is a string', () => {
      expect(isString(aString)).to.be.true;
    });

    it('should return false when the arg is not a string', () => {
      expect(isString(aNumber)).to.be.false;
    });
  });

  describe('isNumber()', () => {
    it('should return true when the arg is a number', () => {
      expect(isNumber(aNumber)).to.be.true;
    });

    it('should return false when the arg is not a number', () => {
      expect(isNumber(aString)).to.be.false;
    });
  });

  describe('isFunction()', () => {
    it('should return true when the arg is a function', () => {
      expect(isFunction(aFunction)).to.be.true;
    });

    it('should return false when the arg is not a function', () => {
      expect(isFunction(aString)).to.be.false;
    });
  });

  describe('isFunction()', () => {
    it('should return true when the arg is a function', () => {
      expect(isFunction(aFunction)).to.be.true;
    });

    it('should return false when the arg is not a function', () => {
      expect(isFunction(aString)).to.be.false;
    });
  });

  describe('isArray()', () => {
    it('should return true when the arg is an array', () => {
      expect(isArray(anArray)).to.be.true;
    });

    it('should return false when the arg is not an array', () => {
      expect(isArray(aFunction)).to.be.false;
    });
  });

  describe('isDefined()', () => {
    it('should return true when the arg is defined', () => {
      expect(isDefined(aString)).to.be.true;
    });

    it('should return false when the arg is not defined', () => {
      expect(isArray(anUndefinedVariable)).to.be.false;
    });
  });

  describe('isOneOf()', () => {
    it('should return true when the value is equal to one of the args', () => {
      expect(isOneOf(aString, aString, aNumber)).to.be.true;
    });

    it('should return false when the value is not equal to one of the args', () => {
      expect(isOneOf(aString, anArray, aNumber)).to.be.false;
    });
  });
});

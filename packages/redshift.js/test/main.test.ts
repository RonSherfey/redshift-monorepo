import { expect } from 'chai';
import { callAwesomeFn } from '../src/main';

describe('A test, which tests the testing of tests', () => {
  it('should call awesomeFn', async () => {
    const actual = await callAwesomeFn();
    expect(actual).to.be.true;
  });
});

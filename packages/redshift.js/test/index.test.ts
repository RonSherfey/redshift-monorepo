import {
  HttpClient,
  Market,
  RedshiftClient,
  validator,
  WebSocketClient,
} from '@radar/redshift.js';
import { expect } from './lib';

describe('redshift.js', () => {
  it('populates the exports', () => {
    expect(HttpClient).to.not.be.undefined;
    expect(RedshiftClient).to.not.be.undefined;
    expect(WebSocketClient).to.not.be.undefined;
    expect(Market).to.not.be.undefined;
    expect(validator).to.not.be.undefined;
  });
});

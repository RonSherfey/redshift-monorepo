import {
  HttpClient,
  RedshiftClient,
  utils,
  WebSocketClient,
} from '@radar/redshift.js';
import { expect } from './lib';

describe('Redshift.js', () => {
  it('populates the exports', () => {
    expect(HttpClient).to.not.be.undefined;
    expect(RedshiftClient).to.not.be.undefined;
    expect(utils).to.not.be.undefined;
    expect(WebSocketClient).to.not.be.undefined;
  });
});

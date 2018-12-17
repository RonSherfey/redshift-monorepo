import { Network } from '../../types';
import { BaseHtlc } from '../shared';

export class StellarHtlc<N extends Network> extends BaseHtlc<N> {
  claim() {}

  fund() {}

  refund() {}
}

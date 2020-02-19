import { DecompiledOpCode, SwapError } from '@radar/redshift-types';

export const uTXOPubKeyRedeemScriptSchema = {
  id: '/UTXOPubKeyRedeemScriptSchema',
  type: 'array',
  items: [
    {
      type: 'string',
      enum: [DecompiledOpCode.OP_DUP],
      errorMessage: SwapError.EXPECTED_OP_DUP,
    },
    {
      type: 'string',
      enum: [DecompiledOpCode.OP_HASH160],
      errorMessage: SwapError.EXPECTED_OP_HASH160,
    },
    {
      // decompiledPaymentHashRipemd160
      type: 'string',
    },
    {
      type: 'string',
      enum: [DecompiledOpCode.OP_EQUAL],
      errorMessage: SwapError.EXPECTED_OP_EQUAL,
    },
    {
      type: 'string',
      enum: [DecompiledOpCode.OP_IF],
      errorMessage: SwapError.EXPECTED_OP_IF,
    },
    {
      type: 'string',
      enum: [DecompiledOpCode.OP_DROP],
      errorMessage: SwapError.EXPECTED_OP_DROP,
    },
    {
      // decompiledClaimerPublicKey
      type: 'string',
      length: 66,
      errorMessage: 'Invalid Claimer Public Key',
    },
    {
      type: 'string',
      enum: [DecompiledOpCode.OP_ELSE],
      errorMessage: SwapError.EXPECTED_OP_ELSE,
    },
    {
      // decompiledTimeLockValue
      type: 'string',
    },
    {
      type: 'string',
      enum: [
        DecompiledOpCode.OP_CHECKSEQUENCEVERIFY,
        DecompiledOpCode.OP_CHECKLOCKTIMEVERIFY,
      ],
      errorMessage: SwapError.INVALID_TIMELOCK_METHOD,
    },
    {
      type: 'string',
      enum: [DecompiledOpCode.OP_DROP],
      errorMessage: SwapError.EXPECTED_OP_DROP,
    },
    {
      // decompiledRefundPublicKey
      type: 'string',
    },
    {
      type: 'string',
      enum: [DecompiledOpCode.OP_ENDIF],
      errorMessage: SwapError.EXPECTED_OP_ENDIF,
    },
    {
      type: 'string',
      enum: [DecompiledOpCode.OP_CHECKSIG],
      errorMessage: SwapError.EXPECTED_OP_CHECKSIG,
    },
  ],
} as any;

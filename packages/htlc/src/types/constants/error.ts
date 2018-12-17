export enum SwapError {
  EXPECTED_OP_SHA256 = 'ExpectedOP_SHA256',
  EXPECTED_OP_EQUAL = 'ExpectedOP_EQUAL',
  EXPECTED_OP_IF = 'ExpectedOP_IF',
  EXPECTED_OP_ELSE = 'ExpectedOP_ELSE',
  EXPECTED_OP_CHECKLOCKTIMEVERIFY = 'ExpectedOP_CHECKLOCKTIMEVERIFY',
  EXPECTED_OP_DROP = 'ExpectedOP_DROP',
  EXPECTED_OP_ENDIF = 'ExpectedOP_ENDIF',
  EXPECTED_OP_CHECKSIG = 'ExpectedOP_CHECKSIG',
  EXPECTED_VALID_DESTINATION_PUBKEY = 'ExpectedValidScriptDestinationPublicKey',
  EXPECTED_VALID_REFUND_PUBKEY = 'ExpectedValidScriptRefundPublicKey',
  EXPECTED_OP_DUP = 'ExpectedOP_DUP',
  EXPECTED_OP_HASH160 = 'ExpectedOP_HASH160',
  EXPECTED_OP_EQUALVERIFY = 'ExpectedOP_EQUALVERIFY',
  INVALID_REDEEM_SCRIPT_LENGTH = 'InvalidRedeemScriptLength',
  FAILED_COMPLETE = 'FailedCompleteSwap',
  FEES_TOO_HIGH_TO_CLAIM = 'FeesTooHighTooClaim',
}

export enum WeightEstimationError {
  EXPECTED_NETWORK = 'ExpectedNetwork',
  EXPECTED_UNLOCK_ELEMENT = 'ExpectedUnlockElement',
  EXPECTED_UTXOS = 'ExpectedUtxos',
  EXPECTED_UNSIGNED_TX_WEIGHT = 'ExpectedUnsignedTxWeight',
}

export enum NetworkError {
  INVALID_NETWORK = 'InvalidNetwork',
  INVALID_SUBNET = 'InvalidSubnet',
  RPC_CALL_FAILED = 'RpcCallFailed',
}

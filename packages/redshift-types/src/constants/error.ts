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
  INVALID_REFUND_ADDRESS = 'InvalidRefundAddress',
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
  INVALID_ASSET = 'InvalidAsset',
  RPC_CALL_FAILED = 'RpcCallFailed',
}

export enum ApiError {
  INTERNAL_SERVER_ERROR = 'InternalServerError',
  INVALID_OR_MISSING_MARKETS = 'InvalidOrMissingMarkets',
  INVALID_OR_MISSING_CREDENTIALS = 'InvalidOrMissingCredentials',
  INVALID_OR_MISSING_QUOTE_REQUEST_FIELDS = 'InvalidOrMissingQuoteRequestFields',
  INVALID_OR_MISSING_BROADCAST_TX_REQUEST_FIELDS = 'InvalidOrMissingBroadcastTxRequestFields',
  INVALID_INVOICE = 'InvalidInvoice',
  INVALID_INVOICE_HASH = 'InvalidInvoiceHash',
  INVALID_ONCHAIN_TICKER = 'InvalidOnchainTicker',
  INVALID_SIGNED_TX_HEX = 'InvalidSignedTxHex',
  INVALID_ORDER_ID = 'InvalidOrderId',
  INVALID_MARKET = 'InvalidMarket',
  INVALID_REFUND_ADDRESS = 'InvalidRefundAddress',
  INVALID_MARKET_FOR_INVOICE = 'InvalidMarketForInvoice',
  ORDER_NOT_FOUND = 'OrderNotFound',
  NO_QUOTES_AVAILABLE = 'NoQuotesAvailable',
  SWAP_ALREADY_IN_PROGRESS = 'SwapAlreadyInProgress',
  SWAP_HAS_ACTIVE_QUOTE_FOR_SAME_FUND_ASSET = 'SwapHasActiveQuoteForSameFundAsset',
}

export enum LightningError {
  PAY_REQ_EXPIRED = 'PaymentRequestExpired',
  PAY_REQ_EXPIRES_TOO_SOON = 'PaymentRequestExpiresTooSoon',
  PAY_REQ_AMT_BELOW_MIN_ALLOWED = 'PaymentRequestAmountBelowMinimumAllowed',
  PAY_REQ_AMT_ABOVE_MAX_ALLOWED = 'PaymentRequestAmountAboveMaximumAllowed',
  PAY_REQ_NOT_ROUTABLE = 'PaymentRequestNotRoutable',
}

export enum WebSocketError {
  SOCKET_NOT_CONNECTED = 'SocketNotConnected',
  SOCKET_CONNECT_ERROR = 'SocketConnectError',
  SOCKET_CONNECT_TIMEOUT = 'SocketConnectTimeout',
}

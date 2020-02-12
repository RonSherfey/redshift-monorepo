// tslint:disable:variable-name

/**
 * Represents decompiled op code string representations
 */
export enum DecompiledOpCode {
  OP_SHA256 = 'OP_SHA256',
  OP_EQUAL = 'OP_EQUAL',
  OP_IF = 'OP_IF',
  OP_ELSE = 'OP_ELSE',
  OP_NOTIF = 'OP_NOTIF',
  OP_CHECKSEQUENCEVERIFY = 'OP_CHECKSEQUENCEVERIFY',
  OP_CHECKLOCKTIMEVERIFY = 'OP_CHECKLOCKTIMEVERIFY',
  OP_DROP = 'OP_DROP',
  OP_ENDIF = 'OP_ENDIF',
  OP_CHECKSIG = 'OP_CHECKSIG',
  OP_DUP = 'OP_DUP',
  OP_HASH160 = 'OP_HASH160',
  OP_EQUALVERIFY = 'OP_EQUALVERIFY',
}

/**
 * UTXO Network Prefixes
 */
export const UtxoNetwork = {
  bitcoin_simnet: {
    messagePrefix: '\\x18Bitcoin Signed Message:\n',
    bech32: 'sb',
    bip32: {
      public: 69254458,
      private: 69253376,
    },
    pubKeyHash: 63,
    scriptHash: 123,
    wif: 115,
  },
  bitcoin_testnet: {
    messagePrefix: '\\x18Bitcoin Signed Message:\n',
    bech32: 'tb',
    bip32: {
      public: 70617039,
      private: 70615956,
    },
    pubKeyHash: 111,
    scriptHash: 196,
    wif: 239,
  },
  bitcoin_mainnet: {
    messagePrefix: '\\x18Bitcoin Signed Message:\n',
    bech32: 'bc',
    bip32: {
      public: 76067358,
      private: 76066276,
    },
    pubKeyHash: 0,
    scriptHash: 5,
    wif: 128,
  },
  litecoin_testnet: {
    messagePrefix: '\\x19Litecoin Signed Message:\n',
    bech32: 'tltc',
    bip32: {
      public: 27108450,
      private: 27106558,
    },
    pubKeyHash: 111,
    scriptHash: 58,
    wif: 239,
  },
  litecoin_mainnet: {
    messagePrefix: '\\x19Litecoin Signed Message:\n',
    bech32: 'ltc',
    bip32: {
      public: 27108450,
      private: 27106558,
    },
    pubKeyHash: 48,
    scriptHash: 50,
    wif: 176,
  },
};

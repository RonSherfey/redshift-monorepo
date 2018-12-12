export const config = {
  valid: [
    {
      invoice:
        'lnsb2500u1pd7kghgpp5j6speyj00edgfxy3jws6f5kceeu5ky7taxzv6gufhm3z9h6calmsdqqcqzys5ajye0ct8zcgjmng20uqdl4q84erx3hywfxmzxwwpwdufyw545nsrdp4jc4uk9qe4un9e5wl7vmfdvpg6udsqg8anwrgg4efzpg4x8qqz6g67r',
      lninvoiceHash:
        '0xcbf01f52effb64ac318353a1559270e1b6042bfb4522ec869bb4a23a48ac20af', // web3.utils.soliditySha3(invoice)
      preimage:
        '0x5d63266ca45c2567c1201a8b0910d2ebb919af91ee5894212ccdb1700826e796',
      hash:
        '0x96a01c924f7e5a84989193a1a4d2d8ce794b13cbe984cd2389bee222df58eff7',
      tokenAmount: 11,
      refundDelay: 960,
    },
    {
      invoice:
        'lnsb2500u1pd7k6zjpp5xjmh7ne348ql559nqt4q0d4zq644l5mv08zgt9rrvz6sujesks0qdqqcqzys3rryd6ac7cz5xdu44ua8mr0mnuv3a0zsdvlh3psg4dlz0knu02m30zauaed5tx5xqzh3h5dtqlynsy2drhr8dm7yax3ewkqwrzw24zspd9sdrv',
      lninvoiceHash:
        '0x5d8c0851170171884033824d639cef337a527dfd6aee1b78ad66d9e6b6bf9141', // web3.utils.soliditySha3(invoice)
      preimage:
        '0x68ee6ab9ac798d34e5341de7a4f55e80cbcf0a6a69224a089d9c414406dac954',
      hash:
        '0x34b77f4f31a9c1fa50b302ea07b6a206ab5fd36c79c485946360b50e4b30b41e',
      tokenAmount: 11,
      refundDelay: 960,
    },
  ],
  invalid: {
    invoice: 'invalid_invoice',
    lninvoiceHash: '0xdeadbeef',
    preimage: '0xdeadbeef',
    hash: '0xdeadbeef',
  },
};

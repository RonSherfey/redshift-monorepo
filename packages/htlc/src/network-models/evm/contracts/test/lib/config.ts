export const config = {
  valid: [
    {
      invoice:
        'lnsb2500u1pd7kghgpp5j6speyj00edgfxy3jws6f5kceeu5ky7taxzv6gufhm3z9h6calmsdqqcqzys5ajye0ct8zcgjmng20uqdl4q84erx3hywfxmzxwwpwdufyw545nsrdp4jc4uk9qe4un9e5wl7vmfdvpg6udsqg8anwrgg4efzpg4x8qqz6g67r',
      orderUUID: '0xad21e672766c11e98f9e2a86e4085a59',
      paymentPreimage:
        '0x5d63266ca45c2567c1201a8b0910d2ebb919af91ee5894212ccdb1700826e796',
      paymentHash:
        '0x96a01c924f7e5a84989193a1a4d2d8ce794b13cbe984cd2389bee222df58eff7',
      refundPreimage:
        '0x86fcadeb5fdf76cf16d021bf857c4a97ce0f02b3a9790d02b928936b28e00e02',
      refundHash:
        '0x7dffc02f5b54c6533f7a1f3b5519f31f4f46e085b88b660c2c7e46c4e2e3fde1',
      tokenAmount: Math.pow(10, 18).toString(),
      refundDelay: 960,
    },
    {
      invoice:
        'lnsb2500u1pd7k6zjpp5xjmh7ne348ql559nqt4q0d4zq644l5mv08zgt9rrvz6sujesks0qdqqcqzys3rryd6ac7cz5xdu44ua8mr0mnuv3a0zsdvlh3psg4dlz0knu02m30zauaed5tx5xqzh3h5dtqlynsy2drhr8dm7yax3ewkqwrzw24zspd9sdrv',
      orderUUID: '0xbfbddee4766c11e98f9e2a86e4085a59',
      paymentPreimage:
        '0x68ee6ab9ac798d34e5341de7a4f55e80cbcf0a6a69224a089d9c414406dac954',
      paymentHash:
        '0x34b77f4f31a9c1fa50b302ea07b6a206ab5fd36c79c485946360b50e4b30b41e',
      refundPreimage:
        '0x1bf094a34d556cb68429deaa2d0c0c8de3ca8df1d8782dc3ddd8ba1a5f97357c',
      refundHash:
        '0x53eae46e1da2d5f42c44dd37be49cf87ca831e41913380d158c661177e45da6e',
      tokenAmount: Math.pow(10, 18).toString(),
      refundDelay: 960,
    },
  ],
  invalid: {
    orderUUID: '0xdeadbeef',
    paymentPreimage: '0xdeadbeef',
    paymentHash: '0xdeadbeef',
    refundPreimage: '0xdeadbeef',
    refundHash: '0xdeadbeef',
  },
};

declare module 'base58check' {
  export function decode(s: string): { prefix: Buffer; data: Buffer };
}

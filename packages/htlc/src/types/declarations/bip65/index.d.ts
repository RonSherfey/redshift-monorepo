declare module 'bip65' {
  export function decode(
    lockTime: any,
  ):
    | {
        utc: any;
        blocks?: any;
      }
    | {
        blocks: any;
        utc?: any;
      };
  export function encode(obj: any): any;
}

declare module 'varuint-bitcoin' {
  export function encode(number: any, buffer?: any, offset?: any): any;
  export function decode(buffer: any, offset?: any): any;
  export function encodingLength(number: any): 1 | 3 | 5 | 9;
}

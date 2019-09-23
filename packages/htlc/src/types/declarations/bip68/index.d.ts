declare module 'bip68' {
  export function decode(
    hexNumber: any,
  ):
    | {
        seconds: number;
      }
    | {
        blocks: number;
      };
  export function encode(
    obj:
      | {
          seconds: number;
        }
      | {
          blocks: number;
        },
  ): any;
}

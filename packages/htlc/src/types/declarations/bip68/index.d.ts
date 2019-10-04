declare module 'bip68' {
  export function decode(
    hexNumber: any,
  ):
    | {
        seconds?: number | undefined;
      }
    | {
        blocks?: number | undefined;
      };
  export function encode(
    obj:
      | {
          seconds?: number | undefined;
        }
      | {
          blocks?: number | undefined;
        },
  ): any;
}

declare module 'hex2dec' {
  /**
   * Convert a hexadecimal string to the string representation of its decimal value
   */
  export function hexToDec(hexStr: string): string;

  /**
   * Convert a string representation of a decimal to a hexadecimal string
   * @param decStr The decimal string to convert
   * @param opts Conversion options
   */
  export function decToHex(decStr: string, opts?: { prefix: boolean }): string;
}

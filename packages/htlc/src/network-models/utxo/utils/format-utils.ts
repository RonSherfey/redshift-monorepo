/**
 * Reverse the byte order (endianness) of a buffer or hex string.
 * @param arg The buffer or hex string to reverse
 * @returns A buffer with the reversed bytes
 */
export function toReversedByteOrderBuffer(arg: Buffer | string) {
  let buffer = arg as Buffer;
  if (typeof arg === 'string') {
    buffer = Buffer.from(arg as string, 'hex');
  }
  return Buffer.from(buffer.reverse());
}

/**
 * Reverse the byte order of a hex string.
 * This is useful when converting between little-endian and big-endian;
 * usually to get a bitcoin hash into 'searchable' format.
 * @param string The input string
 * @returns A hex string with the reverse bytes
 */
export function toReversedByteOrderHexString(string: string) {
  return toReversedByteOrderBuffer(string).toString('hex');
}

/**
 * Prepend 0 in case of uneven hex char count
 * @param input - The hex input
 */
export function makeHexEven(input: string): string {
  if (!input) return undefined;

  let output: string;
  if (input.length % 2 !== 0) {
    output = `0${input.replace('0x', '')}`;
  } else {
    output = input.replace('0x', '');
  }
  return output;
}

/**
 * Determine if the passed string is a valid hex
 * @param arg The string to check
 */
export function isHex(arg: string) {
  if (
    new RegExp(/^(0x)?[a-f0-9]+$/i).test(arg) // Valid hex
  ) {
    return true;
  }
  return false;
}

/**
 * Determine if a string has a hex prefix
 * @param arg The string to check
 */
export function isHexPrefixed(arg: string) {
  return arg.startsWith('0x');
}

/**
 * Add a hex prefix to an unprefixed string
 * @param arg The string to add the prefix to
 */
export function addHexPrefix(arg: string): string {
  return isHexPrefixed(arg) ? arg : `0x${arg}`;
}

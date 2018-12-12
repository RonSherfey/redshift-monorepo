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

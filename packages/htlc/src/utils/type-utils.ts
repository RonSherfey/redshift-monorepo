/**
 * Determines if all the passed args are strings
 * @param args The arguments to check
 */
export function isString(...args: unknown[]) {
  return args.every(arg => typeof arg === 'string');
}

/**
 * Determines if all the passed args are numbers
 * @param args The arguments to check
 */
export function isNumber(...args: unknown[]) {
  return args.every(arg => typeof arg === 'number');
}

/**
 * Determines if all the passed args are functions
 * @param args The arguments to check
 */
export function isFunction(...args: unknown[]) {
  return args.every(arg => typeof arg === 'function');
}

/**
 * Determines if all the passed args are arrays
 * @param args The arguments to check
 */
export function isArray(...args: unknown[]) {
  return args.every(arg => Array.isArray(arg));
}

/**
 * Determines if the passed value is defined
 * @param value The value to check
 */
export function isDefined<T>(value: T | undefined | null): value is T {
  return <T>value !== undefined && <T>value !== null;
}

/**
 * Determine if at least one of the passed args is equal to the passed value
 * @param value The value to check the args against
 * @param args The args to check for equality
 */
export function isOneOf(value: unknown, ...args: unknown[]) {
  return args.some(arg => arg === value);
}

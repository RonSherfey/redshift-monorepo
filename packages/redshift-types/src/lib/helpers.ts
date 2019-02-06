/**
 * Remove unknown keys from type (index signatures)
 */
export type KnownKeys<T> = {
  [K in keyof T]: string extends K ? never : number extends K ? never : K
} extends { [_ in keyof T]: infer U }
  ? U
  : never;

/**
 * Allows you to get the value types in an object
 */
export type ValueOf<T> = T[keyof T];

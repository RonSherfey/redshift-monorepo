declare module 'simple-sha256' {
  function sha256(s: string): Promise<string>;
  export = sha256;
}

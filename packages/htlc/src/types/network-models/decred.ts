export namespace Decred {
  export interface Options {
    server?: ServerOptions;
    secret: string;
  }

  export interface ServerOptions {
    url: string;
    passphrase: string;
    allowHttp?: boolean;
  }
}

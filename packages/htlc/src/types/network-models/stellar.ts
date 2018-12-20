export namespace Stellar {
  export interface Options {
    server?: ServerOptions;
  }

  export interface ServerOptions {
    url: string;
    passphrase: string;
    allowHttp?: boolean;
  }
}

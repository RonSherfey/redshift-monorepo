export namespace Stellar {
  export interface Options {
    secret: string;
    server?: ServerOptions;
  }

  export interface ServerOptions {
    url: string;
    passphrase: string;
    allowHttp?: boolean;
  }
}

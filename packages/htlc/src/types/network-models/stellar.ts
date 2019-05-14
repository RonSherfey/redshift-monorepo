export namespace Stellar {
  export interface Config {
    secret: string;
    server?: ServerConfig;
  }

  export interface ServerConfig {
    url: string;
    passphrase: string;
    allowHttp?: boolean;
  }
}

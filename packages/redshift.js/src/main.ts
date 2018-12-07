import { awesomeFn } from "@radar-redshift/htlc";

export function callAwesomeFn() {
  awesomeFn();
  return Promise.resolve(true);
}

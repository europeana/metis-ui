import { Injectable } from '@angular/core';
@Injectable()
export class RedirectPreviousUrl {
  private url: string | undefined;

  /** set
  /*  set the url to redirect to
  /* @param {string} url - url of redirect
  */
  set(_url: string | undefined): void {
    this.url = _url;
  }

  /** get
  /*  return the redirect url
  */
  get(): string | undefined {
    const previous_url = this.url;
    this.url = undefined;
    return previous_url;
  }
}

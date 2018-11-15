import { Injectable } from '@angular/core';
@Injectable()

export class RedirectPreviousUrl {
  private url: string | null;

  /** set
  /*  set the url to redirect to
  /* @param {string} url - url of redirect
  */
  set(_url: string): void {
    this.url = _url;
  }

  /** get
  /*  return the redirect url
  */
  get(): string | null {
    const previous_url = this.url;
    this.url = null;
    return previous_url;
  }
}

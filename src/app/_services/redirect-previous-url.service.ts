import { Injectable } from '@angular/core';
@Injectable()

export class RedirectPreviousUrl {
  private url;

  /** set
  /*  set the url to redirect to
  /* @param {string} url - url of redirect
  */
  set(_url) {
    this.url = _url;
  }

  /** get
  /*  return the redirect url
  */
  get() {
    const previous_url = this.url;
    this.url = null;
    return previous_url;
  }
}

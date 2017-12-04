import { Injectable } from '@angular/core';

@Injectable()
export class RedirectPreviousUrl {
  private url;

  set(_url) {
    this.url = _url;
  }

  get() {
    const previous_url = this.url;
    this.url = null;
    return previous_url;
  }
}

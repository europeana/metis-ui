import { Injectable } from '@angular/core';

@Injectable()
export class RedirectPreviousUrl {
  private url;

  set(_url) {
    console.log(`RedirectPreviousUrl.set(${_url})`);
    this.url = _url;
  }

  get() {
    const previous_url = this.url;
    this.url = null;
    console.log(`RedirectPreviousUrl.get() => ${previous_url}`);
    return previous_url;
  }
}

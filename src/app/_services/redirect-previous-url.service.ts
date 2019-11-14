import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class RedirectPreviousUrl {
  private url?: string;

  set(_url: string | undefined): void {
    this.url = _url;
  }

  get(): string | undefined {
    const previousUrl = this.url;
    this.url = undefined;
    return previousUrl;
  }
}

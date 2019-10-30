import { Inject, Injectable } from '@angular/core';

import { TRANSLATIONS } from './translation';

export interface Translations {
  [language: string]:
    | {
        [key: string]: string | undefined;
      }
    | undefined;
}

const CURRENT_LANG = 'currentLang';

@Injectable({ providedIn: 'root' })
export class TranslateService {
  private readonly _currentLang: string;

  public get currentLang(): string {
    return this._currentLang;
  }

  constructor(@Inject(TRANSLATIONS) private readonly _translations: Translations) {
    this._currentLang = localStorage.getItem(CURRENT_LANG) || 'en';
  }

  /** changeLang
  /* stores the specified language in local storage
  /* calls reload
  */
  public changeLang(lang: string): void {
    localStorage.setItem(CURRENT_LANG, lang);
    this.reload();
  }

  /** reload
  /* reloads the page
  */
  reload(): void {
    window.location.reload();
  }

  /** instant
  /* retrieves the translated string from the _translations hash according to the specified key
  /* returns the key if no translation is found
  */
  public instant(key: string): string {
    const translation = key;
    if (this._translations[this.currentLang] && this._translations[this.currentLang]![key]) {
      return this._translations[this.currentLang]![key]!;
    }
    return translation;
  }
}

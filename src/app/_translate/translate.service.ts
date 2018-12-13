import { Inject, Injectable } from '@angular/core';

import { TRANSLATIONS } from './translation';

interface Translations {
  [language: string]:
    | {
        [key: string]: string | undefined;
      }
    | undefined;
}

const CURRENT_LANG = 'currentLang';

@Injectable()
export class TranslateService {
  private _currentLang: string;

  public get currentLang(): string {
    return this._currentLang;
  }

  constructor(@Inject(TRANSLATIONS) private _translations: Translations) {
    this._currentLang = localStorage.getItem(CURRENT_LANG) || 'en';
  }

  public changeLang(lang: string): void {
    localStorage.setItem(CURRENT_LANG, lang);
    window.location.reload();
  }

  public instant(key: string): string {
    const translation = key;
    if (this._translations[this.currentLang] && this._translations[this.currentLang]![key]) {
      return this._translations[this.currentLang]![key]!;
    }
    return translation;
  }
}

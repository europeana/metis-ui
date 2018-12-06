import { Injectable, Inject } from '@angular/core';
import { TRANSLATIONS } from '../_translate/translation';

interface Translations {
  [language: string]:
    | {
        [key: string]: string | undefined;
      }
    | undefined;
}

@Injectable()
export class TranslateService {
  private _currentLang: string;

  public get currentLang(): string {
    return this._currentLang;
  }

  constructor(@Inject(TRANSLATIONS) private _translations: Translations) {}

  /** use
  /*  indicate which language to use
  /* set current language
  /* @param {string} lang - use this language
  */
  public use(lang: string): void {
    this._currentLang = lang;
  }

  /** translate
  /*  translate this value in current language
  /* @param {string} key - value to translate
  */
  protected translate(key: string): string {
    const translation = key;
    if (this._translations[this.currentLang] && this._translations[this.currentLang]![key]) {
      return this._translations[this.currentLang]![key]!;
    }
    return translation;
  }

  /** instant
  /*  translate this value in current language
  /* @param {string} key - value to translate
  */
  public instant(key: string): string {
    return this.translate(key);
  }
}

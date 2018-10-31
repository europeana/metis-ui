import { Injectable, Inject } from '@angular/core';
import { TRANSLATIONS } from '../_translate/translation';

@Injectable()
export class TranslateService {
  private _currentLang: string;

  public get currentLang() {
      return this._currentLang;
  }

  constructor(@Inject(TRANSLATIONS) private _translations: any) {}

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
  private translate(key: string): string {
    const translation = key;
    if (this._translations[this.currentLang] && this._translations[this.currentLang][key]) {
        return this._translations[this.currentLang][key];
    }
    return translation;
  }

  /** instant
  /*  translate this value in current language
  /* @param {string} key - value to translate
  */
  public instant(key: string) {
    return this.translate(key);
  }
}

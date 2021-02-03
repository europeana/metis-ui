import { InjectionToken } from '@angular/core';

import { LANG_EN_NAME, LANG_EN_TRANS } from './lang-en'; // import translations

export const TRANSLATIONS = new InjectionToken('translations'); // translation token

// all translations
export const dictionary = {
  [LANG_EN_NAME]: LANG_EN_TRANS
};

// providers
export const TRANSLATION_PROVIDERS = [{ provide: TRANSLATIONS, useValue: dictionary }];

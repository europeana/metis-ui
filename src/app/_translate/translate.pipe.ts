import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '../_services'; 

@Pipe({
  name: 'translate',
})

export class TranslatePipe implements PipeTransform {
  constructor(private _translate: TranslateService) { }

  /** transform
  /* use this pipe in components to translate values
  /* @param {string} value - word or sentence to translate
  */ 
  transform(value: string): any {
    if (!value) return;
    if (typeof this._translate.instant === 'function') { 
    	return this._translate.instant(value);
    } else {
    	return '';
    }
  }
  
}
import { Pipe, PipeTransform } from '@angular/core';
import { isoLanguageNames } from '../_data';

@Pipe({
  name: 'formatLanguage',
  standalone: true
})
export class FormatLanguagePipe implements PipeTransform {
  transform(value: string): string {
    const translated = isoLanguageNames[value];
    return translated || value;
  }
}

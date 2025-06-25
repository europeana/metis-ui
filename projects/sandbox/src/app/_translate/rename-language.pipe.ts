/** RenameCountryPipe
/*
/* a translation utility for html files
/* supplies human-readable labels for countries
*/
import { Pipe, PipeTransform } from '@angular/core';
import { isoLanguageNames } from '../_data';

@Pipe({
  name: 'RenameLanguage'
})
export class RenameLanguagePipe implements PipeTransform {
  transform(value: string): string {
    return isoLanguageNames[value] || value;
  }
}

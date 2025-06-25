/** RenameCountryPipe
/*
/* a translation utility for html files
/* supplies human-readable labels for countries
*/
import { Pipe, PipeTransform } from '@angular/core';
import { isoLanguageNames } from '../_data';

@Pipe({
  name: 'RenameLanguage'
  //  , standalone: true
})
export class RenameLanguagePipe implements PipeTransform {
  /*
  countryNames: { [key: string]: string } = Object.entries(isoCountryCodes).reduce(
    (obj, item) => {
      obj[item[1]] = item[0];
      return obj;
    },
  (  {} as { [key: string]: string })
  );
  */
  transform(value: string): string {
    return isoLanguageNames[value] || value;
  }
}

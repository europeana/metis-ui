/** RenameCountryPipe
/*
/* a translation utility for html files
/* supplies human-readable labels for countries
*/
import { Pipe, PipeTransform } from '@angular/core';
import { isoCountryNames } from '../_data';

@Pipe({
  name: 'renameCountry'
})
export class RenameCountryPipe implements PipeTransform {
  transform(value: string): string {
    return isoCountryNames[value] || value;
  }
}

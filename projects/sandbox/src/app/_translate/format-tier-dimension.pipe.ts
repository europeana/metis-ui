import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatTierDimension'
})
export class FormatTierDimensionPipe implements PipeTransform {
  transform(value: string): string {
    if (value === 'content-tier') {
      return 'content tier';
    } else if (value === 'metadata-tier') {
      return 'metadata tier';
    } else if (value === 'metadata-tier-language') {
      return 'metadata tier language';
    } else if (value === 'metadata-tier-enabling-elements') {
      return 'metadata tier enabling elements';
    } else if (value === 'metadata-tier-contextual-classes') {
      return 'metadata tier contextual classes';
    }
    return value;
  }
}

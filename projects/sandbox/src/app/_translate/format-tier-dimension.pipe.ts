import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatTierDimension'
})
export class FormatTierDimensionPipe implements PipeTransform {
  transform(value: string): string {
    if (value === 'content-tier') {
      return 'content tier';
    } else if (value === 'metadata-tier-average') {
      return 'metadata tier average';
    } else if (value === 'metadata-tier-language') {
      return 'metadata tier language';
    } else if (value === 'metadata-tier-elements') {
      return 'metadata tier elements';
    } else if (value === 'metadata-tier-classes') {
      return 'metadata tier classes';
    }
    return value;
  }
}

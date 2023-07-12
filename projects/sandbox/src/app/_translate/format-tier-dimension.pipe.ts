import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatTierDimension'
})
export class FormatTierDimensionPipe implements PipeTransform {
  transform(value: string): string {
    if (value === 'content_tier') {
      return 'content tier';
    } else if (value === 'metadata_tier') {
      return 'metadata tier';
    } else if (value === 'metadata_tier_language') {
      return 'metadata tier language';
    } else if (value === 'metadata_tier_enabling_elements') {
      return 'metadata tier enabling elements';
    } else if (value === 'metadata_tier_contextual_classes') {
      return 'metadata tier contextual classes';
    }
    return value;
  }
}

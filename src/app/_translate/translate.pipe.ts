import { Pipe, PipeTransform } from '@angular/core';

import { TranslateService } from './translate.service';

@Pipe({
  name: 'translate'
})
export class TranslatePipe implements PipeTransform {
  constructor(private readonly translate: TranslateService) {}

  /** transform
  /* translates the specified string
  */
  transform(value: string): string | undefined {
    if (!value) {
      return;
    }
    return this.translate.instant(value);
  }
}

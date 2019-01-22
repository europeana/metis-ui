import { Pipe, PipeTransform } from '@angular/core';

import { TranslateService } from './translate.service';

@Pipe({
  name: 'translate',
})
export class TranslatePipe implements PipeTransform {
  constructor(private translate: TranslateService) {}

  transform(value: string): string | undefined {
    if (!value) {
      return;
    }
    return this.translate.instant(value);
  }
}

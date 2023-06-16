import { Pipe, PipeTransform } from '@angular/core';
import { LicenseType } from '../_models';

@Pipe({
  name: 'formatLicense'
})
export class FormatLicensePipe implements PipeTransform {
  transform(value: string): string {
    if (value === LicenseType.RESTRICTED) {
      return 'Restricted';
    } else if (value === LicenseType.OPEN) {
      return 'Open';
    } else if (value === LicenseType.CLOSED) {
      return 'Closed';
    }
    return value;
  }
}

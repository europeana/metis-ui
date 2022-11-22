/** FormatHarvestUrlPipe
/*
/* a utility for url rendering
*/
import { Pipe, PipeTransform } from '@angular/core';
import { apiSettings } from '../../environments/apisettings';

@Pipe({
  name: 'formatHarvestUrl'
})
export class FormatHarvestUrlPipe implements PipeTransform {
  transform(value: string, recordId: string): string {
    return `${apiSettings.apiHost}/dataset/${value}/record?recordId=${recordId}`;
  }
}

/** FormatHarvestUrlPipe
/*
/* a utility for url rendering
*/
import { Pipe, PipeTransform } from '@angular/core';
import { apiSettings } from '../../environments/apisettings';

@Pipe({
  name: 'formatHarvestUrl',
  standalone: true
})
export class FormatHarvestUrlPipe implements PipeTransform {
  transform(value: string, recordId: string, step = 'HARVEST'): string {
    return `${apiSettings.apiHost}/dataset/${value}/record?recordId=${recordId}&step=${step}`;
  }
}

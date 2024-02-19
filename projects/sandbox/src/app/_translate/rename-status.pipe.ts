/** RenameStatusPipe
/*
/* a translation utility for html files
/* supplies human-readable labels for dataset statuses
*/
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'renameStatus',
  standalone: true
})
export class RenameStatusPipe implements PipeTransform {
  transform(value: string): string {
    return value.toLowerCase().replace(/_/, ' ');
  }
}

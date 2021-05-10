/** RenameStatusPipe
/*
/* a translation utility for html files
/* supplies human-readable labels for status types
*/
import { Pipe, PipeTransform } from '@angular/core';

const statusNames: { [key: string]: string } = {
  INQUEUE: 'In Queue',
  REINDEX_TO_PREVIEW: 'Re-index to preview',
  REINDEX_TO_PUBLISH: 'Re-index to publish'
};

@Pipe({
  name: 'renameStatus'
})
export class RenameStatusPipe implements PipeTransform {
  transform(value: string): string {
    return statusNames[value] || value;
  }
}

import { Pipe, PipeTransform } from '@angular/core';
import { DebiasSourceField } from '../_models';

@Pipe({
  name: 'formatDcField',
  standalone: true
})
export class FormatDcFieldPipe implements PipeTransform {
  transform(value: string): string {
    if (value === DebiasSourceField.DC_TITLE) {
      return 'dc:title';
    } else if (value === DebiasSourceField.DC_DESCRIPTION) {
      return 'dc:description';
    } else if (value === DebiasSourceField.DC_TYPE_LITERAL) {
      return 'dc:type literal';
    } else if (value === DebiasSourceField.DC_TYPE_REFERENCE) {
      return 'dc:type reference';
    } else if (value === DebiasSourceField.DC_SUBJECT_LITERAL) {
      return 'dc:subject literal';
    } else if (value === DebiasSourceField.DC_SUBJECT_REFERENCE) {
      return 'dc:subject reference';
    } else if (value === DebiasSourceField.DCTERMS_ALTERNATIVE) {
      return 'dc:terms alternative';
    }
    return value;
  }
}

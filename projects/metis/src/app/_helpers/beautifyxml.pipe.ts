import { Pipe, PipeTransform } from '@angular/core';
import xmlFormat from 'xml-formatter';

@Pipe({
  name: 'beautifyXML',
  standalone: true
})
export class XmlPipe implements PipeTransform {
  xmlDefault = '<?xml version="1.0" encoding="UTF-8"?>';

  transform(value: string): string {
    if (!value) {
      return '';
    }
    if (!value.length) {
      return '';
    }
    if (value === this.xmlDefault) {
      return this.xmlDefault;
    }
    return xmlFormat(`${value}`);
  }
}

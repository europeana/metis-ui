import { Pipe, PipeTransform } from '@angular/core';
import xmlFormat from 'xml-formatter';

@Pipe({
  name: 'beautifyXML',
  standalone: true
})
export class XmlPipe implements PipeTransform {
  transform(value: string): string {
    return xmlFormat(`${value}`);
  }
}

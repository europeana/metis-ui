import { Pipe, PipeTransform } from '@angular/core';
import * as beautify from 'vkbeautify';

@Pipe({
  name: 'beautifyXML',
  standalone: true
})
export class XmlPipe implements PipeTransform {
  transform(value: string): string {
    return beautify.xml(value);
  }
}

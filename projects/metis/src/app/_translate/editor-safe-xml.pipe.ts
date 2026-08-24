import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'editorSafeXML',
  standalone: true
})
export class EditorSafeXmlPipe implements PipeTransform {
  transform(value: string): string {
    return value.replace(/\r/g, '\n'); // NOSONAR
  }
}

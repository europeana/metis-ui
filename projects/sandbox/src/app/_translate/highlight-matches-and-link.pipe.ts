/** HighlightMatchesAndLinkPipe
/*
/* a text / html highlighting and link-injecting facility
*/
import { Pipe, PipeTransform } from '@angular/core';
import { DebiasTag } from '../_models';

@Pipe({
  name: 'highlightMatchesAndLink',
  standalone: true
})
export class HighlightMatchesAndLinkPipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform(value: string, args?: Array<any>): string {
    if (args && args.length > 0) {
      const tags = args[0] as Array<DebiasTag>;
      if (tags.length === 0) {
        return value;
      }
      const startIndexes = [0];
      const endIndexes: Array<number> = [];
      const matches: Array<string> = [];
      const uris: Array<string> = [];

      for (let i = 0; i < tags.length; i++) {
        endIndexes.push(tags[i].start); // close off last
        startIndexes.push(tags[i].end); // start new
        matches.push(value.substr(tags[i].start, tags[i].length));
        uris.push(tags[i].uri);
      }

      endIndexes.push(value.length);

      let newStr = '';

      // assemble result: for each match-index pair concatenate a substring with the match
      startIndexes.forEach((start: number, index: number) => {
        newStr += value.substring(start, endIndexes[index]);
        if (index < matches.length) {
          const tagOpen = `<a href="${uris[index]}" class="term-highlight dereference-link-debias">`;
          const tagClose = '</a>';
          newStr += `${tagOpen}${matches[index]}${tagClose}`;
        }
      });
      return newStr;
    }
    return value;
  }
}

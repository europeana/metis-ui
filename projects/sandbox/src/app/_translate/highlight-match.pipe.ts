/** HighlightMatchPipe
/*
/* a text / html highlighting facility
*/
import { Pipe, PipeTransform } from '@angular/core';
import { sanitiseSearchTerm } from '../_helpers';

@Pipe({
  name: 'highlightMatch',
  standalone: true
})
export class HighlightMatchPipe implements PipeTransform {
  tagOpen = '<span class="term-highlight">';
  tagClose = '</span>';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform(value: string, args?: Array<any>): string {
    if (args && args.length > 0 && args[0].length > 0) {
      const term = args[0];

      const sanitised = sanitiseSearchTerm(term);

      if (sanitised.length === 0) {
        return value;
      }

      const reg = new RegExp(sanitised, 'gi');

      const startIndexes = [0];
      const endIndexes: Array<number> = [];
      const matches: Array<RegExpExecArray> = [];

      let match = reg.exec(value);

      while (match != null) {
        matches.push(match);
        startIndexes.push(match.index + match.toString().length);
        endIndexes.push(match.index);
        match = reg.exec(value);
      }
      endIndexes.push(value.length);

      let newStr = '';

      // assemble result: for each match-index pair concatenate a substring with the match
      startIndexes.forEach((start: number, index: number) => {
        newStr += value.substring(start, endIndexes[index]);
        if (index < matches.length) {
          newStr += `${this.tagOpen}${matches[index]}${this.tagClose}`;
        }
      });
      return newStr;
    }
    return value;
  }
}

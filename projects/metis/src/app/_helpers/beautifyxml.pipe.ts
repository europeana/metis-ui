import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'beautifyXML',
  standalone: true
})
export class XmlPipe implements PipeTransform {
  // credits to https://github.com/vkiryukhin/vkBeautify/blob/master/vkbeautify.js
  createShiftArr(step: string | number): Array<string> {
    let space = '    ';

    if (isNaN(parseInt(`${step}`))) {
      // argument is string
      space = step as string;
    } else {
      // argument is integer
      switch (step) {
        case 1:
          space = ' ';
          break;
        case 2:
          space = '  ';
          break;
        case 3:
          space = '   ';
          break;
        case 4:
          space = '    ';
          break;
        case 5:
          space = '     ';
          break;
        case 6:
          space = '      ';
          break;
        case 7:
          space = '       ';
          break;
        case 8:
          space = '        ';
          break;
        case 9:
          space = '         ';
          break;
        case 10:
          space = '          ';
          break;
        case 11:
          space = '           ';
          break;
        case 12:
          space = '            ';
          break;
      }
    }

    const shift = ['\n']; // array of shifts
    for (let ix = 0; ix < 100; ix++) {
      shift.push(shift[ix] + space);
    }
    return shift;
  }

  xml(text: string): string {
    const ar = text
      .replace(/>\s{0,}</g, '><')
      .replace(/</g, '~::~<')
      .replace(/\s*xmlns:/g, '~::~xmlns:')
      .replace(/\s*xmlns=/g, '~::~xmlns=')
      .split('~::~');
    const len = ar.length;
    let inComment = false;
    let deep = 0;
    let str = '';
    const shift = this.createShiftArr('\t');

    for (let ix = 0; ix < len; ix++) {
      // start comment or <![CDATA[...]]> or <!DOCTYPE //
      if (ar[ix].search(/<!/) > -1) {
        str += shift[deep] + ar[ix];
        inComment = true;
        // end comment  or <![CDATA[...]]> //
        if (
          ar[ix].search(/-->/) > -1 ||
          ar[ix].search(/\]>/) > -1 ||
          ar[ix].search(/!DOCTYPE/) > -1
        ) {
          inComment = false;
        }
      }
      // end comment  or <![CDATA[...]]> //
      else if (ar[ix].search(/-->/) > -1 || ar[ix].search(/\]>/) > -1) {
        str += ar[ix];
        inComment = false;
      }
      // <elm></elm> //
      else if (
        /^<\w/.exec(ar[ix - 1]) &&
        /^<\/\w/.exec(ar[ix]) &&
        /^<[\w:\-.,]+/.exec(ar[ix - 1]) &&
        /^<[\w:\-.,]+/.exec(ar[ix - 1])![0] == /^<\/[\w:\-.,]+/.exec(ar[ix])![0].replace('/', '')
      ) {
        str += ar[ix];
        if (!inComment) deep--;
      }
      // <elm> //
      else if (
        ar[ix].search(/<\w/) > -1 &&
        ar[ix].search(/<\//) == -1 &&
        ar[ix].search(/\/>/) == -1
      ) {
        str = !inComment ? (str += shift[deep++] + ar[ix]) : (str += ar[ix]);
      }
      // <elm>...</elm> //
      else if (ar[ix].search(/<\w/) > -1 && ar[ix].search(/<\//) > -1) {
        str = !inComment ? (str += shift[deep] + ar[ix]) : (str += ar[ix]);
      }
      // </elm> //
      else if (ar[ix].search(/<\//) > -1) {
        str = !inComment ? (str += shift[--deep] + ar[ix]) : (str += ar[ix]);
      }
      // <elm/> //
      else if (ar[ix].search(/\/>/) > -1) {
        str = !inComment ? (str += shift[deep] + ar[ix]) : (str += ar[ix]);
      }
      // <? xml ... ?> //
      else if (ar[ix].search(/<\?/) > -1) {
        str += shift[deep] + ar[ix];
      }
      // xmlns //
      else if (ar[ix].search(/xmlns:/) > -1 || ar[ix].search(/xmlns=/) > -1) {
        str += shift[deep] + ar[ix];
      } else {
        str += ar[ix];
      }
    }
    return str[0] == '\n' ? str.slice(1) : str;
  }

  transform(value: string): string {
    if (!value) {
      return '';
    }
    if (!value.length) {
      return '';
    }
    return this.xml(value);
  }
}

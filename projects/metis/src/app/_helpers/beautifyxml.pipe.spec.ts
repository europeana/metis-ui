import { XmlPipe } from '.';

describe('beautify xml pipe', () => {
  let pipe: XmlPipe;

  beforeEach(() => {
    pipe = new XmlPipe();
  });

  it('should beautify markup', () => {
    expect(pipe.transform('<a><b></b></a>')).toBe('<a>\n\t<b></b>\n</a>');
  });

  it('should handle xml', () => {
    let xmlHeader = '<?xml?>';
    expect(pipe.transform(xmlHeader + '<a><b></b></a>')).toBe(xmlHeader + '\n<a>\n\t<b></b>\n</a>');
    xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
    expect(pipe.transform(xmlHeader + '<a><b></b></a>')).toBe(xmlHeader + '\n<a>\n\t<b></b>\n</a>');
  });

  it('should handle xml ns', () => {
    const xmlns = 'xmlns:dc="http://purl.org/dc/elements/1.1/"';
    expect(pipe.transform(`<a ${xmlns}><b></b></a>`)).toBe(`<a\n\t${xmlns}>\n\t<b></b>\n</a>`);
  });

  it('should handle text', () => {
    expect(pipe.transform('<a><b>HELLO</b></a>')).toBe('<a>\n\t<b>HELLO</b>\n</a>');
  });

  it('should collapse whitespace', () => {
    expect(pipe.transform('<a><b>  </b></a>')).toBe('<a>\n\t<b></b>\n</a>');
  });

  it('should create whitespace', () => {
    expect(pipe.createShiftArr(2)[0]).toBe('\n');
    expect(pipe.createShiftArr(2)[1]).toBe('\n ');
    expect(pipe.createShiftArr(2)[2]).toBe('\n  ');
    expect(pipe.createShiftArr('2')[2]).toBe('\n');
  });

  it('should handle comments', () => {
    expect(pipe.transform('<a><b><!-- COMMENT --></b></a>')).toBe(
      '<a>\n\t<b>\n\t\t<!-- COMMENT -->\n\t</b>\n</a>'
    );
  });

  it('should handle commented elements', () => {
    expect(pipe.transform('<a><b><!-- <a>COMMENTED ELEMENT</a> --></b></a>')).toBe(
      '<a>\n\t<b>\n\t\t<!-- <a>COMMENTED ELEMENT</a> -->\n\t</b>\n</a>'
    );
  });

  it('should handle singleton elements', () => {
    expect(pipe.transform('<a><b/></a>')).toBe('<a>\n\t<b/>\n</a>');
  });

  it('should handle the doctype', () => {
    expect(pipe.transform('<!DOCTYPE xml><a><b></b></a>')).toBe(
      '<!DOCTYPE xml>\n<a>\n\t<b></b>\n</a>'
    );
  });

  it('should ignore empty strings', () => {
    expect(pipe.transform('')).toBe('');
  });

  it('should ignore null strings', () => {
    expect(pipe.transform(({ length: 0 } as unknown) as string)).toBe('');
  });
});

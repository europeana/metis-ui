import { XmlPipe } from '.';

describe('beautify xml pipe', () => {
  it('should beautify xml', () => {
    const pipe = new XmlPipe();
    expect(pipe.transform('<a><b></b></a>')).toBe('<a>\n    <b></b>\n</a>');
  });
});

import { XmlPipe } from '.';

describe('beautify xml pipe', () => {
  let pipe: XmlPipe;

  beforeEach(() => {
    pipe = new XmlPipe();
  });

  it('should beautify xml', () => {
    expect(pipe.transform('<a><b></b></a>')).toBe('<a>\n\t<b></b>\n</a>');
  });

  it('should ignore empty strings', () => {
    expect(pipe.transform('')).toBe('');
  });

  it('should ignore null strings', () => {
    expect(pipe.transform((null as unknown) as string)).toBe('');
  });
});

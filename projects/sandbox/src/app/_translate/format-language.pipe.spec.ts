import { FormatLanguagePipe } from '.';

describe('FormatLanguagePipe', () => {
  it('should transform', () => {
    const pipe = new FormatLanguagePipe();
    expect(pipe.transform('en')).toEqual('English');
    expect(pipe.transform('de')).toEqual('German');
    expect(pipe.transform('xxx')).toEqual('xxx');
  });
});

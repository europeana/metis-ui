import { FormatLanguagePipe } from '.';

describe('FormatLanguagePipe', () => {
  it('should transform', () => {
    const pipe = new FormatLanguagePipe();
    expect(pipe.transform('EN')).toEqual('English');
    expect(pipe.transform('DE')).toEqual('German');
    expect(pipe.transform('xxx')).toEqual('xxx');
  });
});

import { RenameLanguagePipe } from '.';

describe('RenameLanguagePipe', () => {
  it('should transform', () => {
    const pipe = new RenameLanguagePipe();
    expect(pipe.transform('de')).toEqual('German');
    expect(pipe.transform('fr')).toEqual('French');
    expect(pipe.transform('XXX')).toEqual('XXX');
  });
});

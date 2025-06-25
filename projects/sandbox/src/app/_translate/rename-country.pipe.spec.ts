import { RenameCountryPipe } from '.';

describe('RenameCountryPipe', () => {
  it('should transform', () => {
    const pipe = new RenameCountryPipe();
    expect(pipe.transform('DE')).toEqual('Germany');
    expect(pipe.transform('FR')).toEqual('France');
    expect(pipe.transform('XXX')).toEqual('XXX');
  });
});

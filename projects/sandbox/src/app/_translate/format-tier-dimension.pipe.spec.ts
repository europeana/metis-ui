import { FormatTierDimensionPipe } from '.';

describe('FormatTierDimensionPipe', () => {
  it('should transform', () => {
    const pipe = new FormatTierDimensionPipe();
    expect(pipe.transform('license')).toEqual('license');
    expect(pipe.transform('content-tier')).toEqual('content tier');
    expect(pipe.transform('metadata-tier')).toEqual('metadata tier');
    expect(pipe.transform('metadata-tier-enabling-elements')).toEqual(
      'metadata tier enabling elements'
    );
    expect(pipe.transform('metadata-tier-language')).toEqual('metadata tier language');
    expect(pipe.transform('metadata-tier-contextual-classes')).toEqual(
      'metadata tier contextual classes'
    );
  });
});

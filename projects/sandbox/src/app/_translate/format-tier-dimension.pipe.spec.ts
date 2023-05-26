import { FormatTierDimensionPipe } from '.';

describe('FormatTierDimensionPipe', () => {
  it('should transform', () => {
    const pipe = new FormatTierDimensionPipe();
    expect(pipe.transform('license')).toEqual('license');
    expect(pipe.transform('content-tier')).toEqual('content tier');
    expect(pipe.transform('metadata-tier-average')).toEqual('metadata tier average');
    expect(pipe.transform('metadata-tier-elements')).toEqual('metadata tier elements');
    expect(pipe.transform('metadata-tier-language')).toEqual('metadata tier language');
    expect(pipe.transform('metadata-tier-classes')).toEqual('metadata tier classes');
  });
});

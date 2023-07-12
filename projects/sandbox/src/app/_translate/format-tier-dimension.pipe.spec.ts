import { FormatTierDimensionPipe } from '.';

describe('FormatTierDimensionPipe', () => {
  it('should transform', () => {
    const pipe = new FormatTierDimensionPipe();
    expect(pipe.transform('license')).toEqual('license');
    expect(pipe.transform('content_tier')).toEqual('content tier');
    expect(pipe.transform('metadata_tier')).toEqual('metadata tier');
    expect(pipe.transform('metadata_tier_enabling_elements')).toEqual(
      'metadata tier enabling elements'
    );
    expect(pipe.transform('metadata_tier_language')).toEqual('metadata tier language');
    expect(pipe.transform('metadata_tier_contextual_classes')).toEqual(
      'metadata tier contextual classes'
    );
  });
});

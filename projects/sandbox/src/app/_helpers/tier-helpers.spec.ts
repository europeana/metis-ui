import { TierSummaryRecord } from '../_models';
import { getLowestValues } from '.';

describe('Tier Helpers', () => {
  const getRecords = (): Array<TierSummaryRecord> => {
    return [
      {
        'record-id': '/123/456',
        license: 'CC1',
        'content-tier': 1,
        'metadata-tier': 'A',
        'metadata-tier-language': 'A',
        'metadata-tier-enabling-elements': 'A',
        'metadata-tier-contextual-classes': 'A'
      },
      {
        'record-id': '/123/457',
        license: 'CC0',
        'content-tier': 3,
        'metadata-tier': 'B',
        'metadata-tier-language': 'B',
        'metadata-tier-enabling-elements': 'B',
        'metadata-tier-contextual-classes': 'B'
      },
      {
        'record-id': '/123/457',
        license: 'CC-BY',
        'content-tier': 4,
        'metadata-tier': 'C',
        'metadata-tier-language': 'C',
        'metadata-tier-enabling-elements': 'C',
        'metadata-tier-contextual-classes': 'C'
      }
    ];
  };

  it('should get the lowest values', () => {
    const records = getRecords();
    expect(getLowestValues(records)['content-tier']).toEqual(1);
    records[0]['content-tier'] = 0;
    expect(getLowestValues(records)['content-tier']).toEqual(0);
  });
});

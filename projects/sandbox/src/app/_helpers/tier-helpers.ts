import {
  ContentTierValue,
  DatasetTierSummaryBase,
  DatasetTierSummaryRecord,
  LicenseType,
  MetadataTierValue,
  TierDimensionBase
} from '../_models';

function getLowestValue<T>(records: Array<DatasetTierSummaryRecord>, field: TierDimensionBase): T {
  records.sort((recordA: DatasetTierSummaryBase, recordB: DatasetTierSummaryBase) => {
    if (recordA[field] > recordB[field]) {
      return 1;
    } else if (recordA[field] < recordB[field]) {
      return -1;
    } else {
      return 0;
    }
  });
  return (records[0][field] as unknown) as T;
}

/** getLowestValues
 *
 *
 **/
export function getLowestValues(
  recordsIn: Array<DatasetTierSummaryRecord>
): DatasetTierSummaryBase {
  const records = structuredClone(recordsIn);
  let lowestLicense = LicenseType.OPEN;
  const closedLicense = records.find((rec: DatasetTierSummaryRecord) => {
    return rec.license === LicenseType.CLOSED;
  });

  if (closedLicense) {
    lowestLicense = LicenseType.CLOSED;
  } else {
    const restrictedLicense = records.find((rec: DatasetTierSummaryRecord) => {
      return rec.license === LicenseType.RESTRICTED;
    });
    if (restrictedLicense) {
      lowestLicense = LicenseType.RESTRICTED;
    }
  }

  return {
    license: lowestLicense,
    'content-tier': getLowestValue<ContentTierValue>(records, 'content-tier'),
    'metadata-tier': getLowestValue<MetadataTierValue>(records, 'metadata-tier'),
    'metadata-tier-language': getLowestValue<MetadataTierValue>(records, 'metadata-tier-language'),
    'metadata-tier-enabling-elements': getLowestValue<MetadataTierValue>(
      records,
      'metadata-tier-enabling-elements'
    ),
    'metadata-tier-contextual-classes': getLowestValue<MetadataTierValue>(
      records,
      'metadata-tier-contextual-classes'
    )
  };
}

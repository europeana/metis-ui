import {
  ContentTierValue,
  LicenseType,
  TierSummaryBase,
  TierSummaryRecord
} from '../src/app/_models';

const varAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const valStringMetadata = varAlphabet.substr(0, 4);
const licenses = [LicenseType.OPEN, LicenseType.CLOSED, LicenseType.RESTRICTED];

function generateTierSummaryBase(index: number, licenseRandomiser: number): TierSummaryBase {
  let total = 0;
  const metaVals = [index % 13, index % 21, index % 34].map((index2: number) => {
    const letterIndex = index2 % 4;
    total += letterIndex;
    return valStringMetadata.substr(letterIndex, 1);
  });

  return {
    license: licenses[(index * licenseRandomiser) % licenses.length],
    'content-tier': (index % 5) as ContentTierValue,
    'metadata-tier': valStringMetadata.substr(total / metaVals.length, 1),
    'metadata-tier-language': metaVals[0],
    'metadata-tier-enabling-elements': metaVals[1],
    'metadata-tier-contextual-classes': metaVals[2]
  } as TierSummaryBase;
}

export class RecordGenerator {
  generateRecords(index: number): Array<TierSummaryRecord> {
    const recordCount = (index % 2 === 1 ? index : index * 50) % 1000;
    const fillerCharCountMax = index % 25;
    const records = [];

    for (let i = 0; i < recordCount; i++) {
      let fillerCharsFull = '';
      for (let j = 0; j < fillerCharCountMax; j++) {
        fillerCharsFull += varAlphabet.substr(((index + i * 13) * j) % varAlphabet.length, 1);
      }
      if (index % 3 === 0) {
        fillerCharsFull = fillerCharsFull
          .split('')
          .reverse()
          .join('');
      }
      const fillerChars = fillerCharsFull.substr((i * 3) % 10, fillerCharCountMax);
      const baseRecord = generateTierSummaryBase(index + i, i + 1) as TierSummaryRecord;
      baseRecord['record-id'] = `/${index}/${fillerChars}_record-id_${fillerCharCountMax}_${i}`;
      records.push(baseRecord);
    }
    return records;
  }
}

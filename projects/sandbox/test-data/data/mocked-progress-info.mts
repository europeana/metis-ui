import {
  HarvestType,
  UserDatasetInfo
} from '../src-copy/progress-info.mjs';

const mockDatasetInfoBase = {
  'created-by-id': '1234',
  'creation-date': '2022-01-19T15:21:09',
  'dataset-name': 'Test_Dataset_Name',
  'dataset-id': '1',
  country: 'Greece',
  language: 'Greek'
};

const insitituteTypes = ['University', 'School', 'Museum', 'Royal_Library'];
const cities = [
  'Amsterdam',
  'Brussels',
  'Como',
  'Dusseldorf',
  'Edinburgh',
  'Freiburg',
  'Glasgow',
  'Helsinki',
  'Imola',
  'Jena',
  'Kotka',
  'Lisbon',
  'Milan',
  'Nice',
  'Overveen',
  'Pisa',
  'Queluz',
  'Rome',
  'Siena',
  'Torino',
  'Ulm',
  'Vienna',
  'Warsaw',
  'X-City',
  'Y-City',
  'Z-City'
];
const dateNow = new Date();

export const mockUserDatasets: Array<UserDatasetInfo> = Object.keys(new Array(24).fill(null)).map(
  (_: string, i: number) => {
    dateNow.setDate(dateNow.getDate() - 1);
    dateNow.setHours((i * 99) % 24);
    dateNow.setMinutes((i * 999) % 60);

    const city = cities[i % cities.length];
    const institute = insitituteTypes[i % insitituteTypes.length];
    const id = i + 1;
    return {
      ...mockDatasetInfoBase,
      'creation-date': dateNow.toISOString(),
      'dataset-id': `${id}`,
      'dataset-name': `${institute}_of_${city}_data_${id}`,
      'harvest-protocol': i % 2 === 1 ? HarvestType.HTTP : HarvestType.OAI,
      // temporarily disabled status data
      /*
      status:
        i % 3 === 0
          ? DatasetStatus.COMPLETED
          : i % 2 === 0
          ? DatasetStatus.IN_PROGRESS
          : DatasetStatus.FAILED,
      'total-records': i + 1,
      'processed-records': i,
      */
      country:
        i % 2 === 0 ? 'Greece' : i % 3 === 0 ? 'Netherlands' : i % 5 === 0 ? 'Spain' : 'Germany',
      language: i % 2 === 0 ? 'Greek' : i % 3 === 0 ? 'Dutch' : i % 5 === 0 ? 'Spanish' : 'German'
    };
  }
);

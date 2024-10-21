import { DebiasSourceField } from '../../src/app/_models';

export const detections = [
  {
    recordId: '8262',
    europeanaId: '/347/_nnhSX08',
    sourceField: DebiasSourceField.DC_DESCRIPTION,
    valueDetection: {
      language: 'nl',
      literal: 'Meester en slaaf Provinciale Openbare Bibliotheek in Krakau voor de mensheid',
      tags: [
        {
          start: 11,
          end: 16,
          length: 5,
          uri: 'http://localhost:3000/debias-uri.html#t_135_nl'
        }
      ]
    }
  },
  {
    recordId: '8262',
    europeanaId: '/347/_nnhSX08',
    valueDetection: {
      language: 'en',
      literal: 'Master and slave Provincial Public Library in Krakow',
      tags: [
        {
          start: 11,
          end: 16,
          length: 5,
          uri: 'http://localhost:3000/debias-uri.html#t_198_en'
        }
      ]
    },
    sourceField: DebiasSourceField.DC_DESCRIPTION
  },
  {
    recordId: '8262',
    europeanaId: '/347/_nnhSX08',
    valueDetection: {
      language: 'de',
      literal: 'Herr und Sklave Öffentliche Provinzbibliothek in Krakau für die Menschheit',
      tags: [
        {
          start: 9,
          end: 15,
          length: 6,
          uri: 'http://localhost:3000/debias-uri.html#t_77_de'
        }
      ]
    },
    sourceField: DebiasSourceField.DC_DESCRIPTION
  },
  {
    recordId: '8264',
    europeanaId: '/347/CMC_HA_1255',
    valueDetection: {
      language: 'nl',
      literal: 'Panoramafilm van linkpad 1-5, Skara Brae, verslaafde en aboriginal',
      tags: [
        {
          start: 56,
          end: 66,
          length: 10,
          uri: 'http://localhost:3000/debias-uri.html#t_1_nl'
        }
      ]
    },
    sourceField: DebiasSourceField.DC_TITLE
  },
  {
    recordId: '8264',
    europeanaId: '/347/CMC_HA_1255',
    valueDetection: {
      language: 'en',
      literal: 'Panorama Movie of link path 1-5, Skara Brae addict and aboriginal',
      tags: [
        {
          start: 44,
          end: 50,
          length: 6,
          uri: 'http://localhost:3000/debias-uri.html#t_3_en'
        },
        {
          start: 55,
          end: 65,
          length: 10,
          uri: 'http://localhost:3000/debias-uri.html#t_2_en'
        }
      ]
    },
    sourceField: DebiasSourceField.DC_TITLE
  },
  {
    recordId: '8264',
    europeanaId: '/347/CMC_HA_1255',
    valueDetection: {
      language: 'de',
      literal: 'Panoramafilm des Verbindungspfads 1-5, Skara Brae, Süchtiger und Ureinwohner',
      tags: [
        {
          start: 65,
          end: 76,
          length: 11,
          uri: 'http://localhost:3000/debias-uri.html#t_87_de'
        }
      ]
    },
    sourceField: DebiasSourceField.DC_TITLE
  },
  {
    recordId: '8261',
    europeanaId: '/347/CMC_HA_936',
    valueDetection: {
      language: 'en',
      literal:
        // eslint-disable-next-line max-len
        'Point cloud model derived from LiDAR survey of the monument. Mailman, housewife, fireman, forefathers. Skara Brae is an archaeological site with exceptionally well preserved remains that show the stone built furniture and internal structure of ten Neolithic houses and their narrow connecting passageways. Radio Carbon dates show that the village was occupied for around 600 years between 3200 and 2200 BC. There appear to be two main structural phases to the occupation.House 10 lies on the far south-eastern side of the village. Its entrance is not related to the other buildings and it does not appear to be part of the main complex. The internal features of House 10 are very damaged and while it is of a good size it may be part of an earlier phase of occupation.The monument is now managed by Historic Scotland and is a key element of the Heart of Neolithic Orkney World Heritage Site. The Lidar survey was conducted by Scottish10 and made available by Centre for Digital Documentation and Visualisation (CDDV).',
      tags: [
        {
          start: 650,
          end: 658,
          length: 8,
          uri: 'http://localhost:3000/debias-uri.html#t_89_en'
        }
      ]
    },
    sourceField: DebiasSourceField.DC_DESCRIPTION
  },
  {
    recordId: 8262,
    europeanaId: '/347/_nnhSX08',
    valueDetection: {
      language: 'nl',
      literal: 'Meester en slaaf Provinciale Openbare Bibliotheek in Krakau voor de mensheid',
      tags: [
        {
          start: 11,
          end: 16,
          length: 5,
          uri: 'http://localhost:3000/debias-uri.html#t_135_nl'
        }
      ]
    },
    sourceField: 'DC_DESCRIPTION'
  },
  {
    recordId: 8262,
    europeanaId: '/347/_nnhSX08',
    valueDetection: {
      language: 'en',
      literal: 'Master and slave Provincial Public Library in Krakow',
      tags: [
        {
          start: 11,
          end: 16,
          length: 5,
          uri: 'http://localhost:3000/debias-uri.html#t_198_en'
        }
      ]
    },
    sourceField: 'DC_DESCRIPTION'
  },
  {
    recordId: 8262,
    europeanaId: '/347/_nnhSX08',
    valueDetection: {
      language: 'de',
      literal: 'Herr und Sklave Öffentliche Provinzbibliothek in Krakau für die Menschheit',
      tags: [
        {
          start: 9,
          end: 15,
          length: 6,
          uri: 'http://localhost:3000/debias-uri.html#t_77_de'
        }
      ]
    },
    sourceField: 'DC_DESCRIPTION'
  },
  {
    recordId: 8264,
    europeanaId: '/347/CMC_HA_1255',
    valueDetection: {
      language: 'nl',
      literal: 'Panoramafilm van linkpad 1-5, Skara Brae, verslaafde en aboriginal',
      tags: [
        {
          start: 56,
          end: 66,
          length: 10,
          uri: 'http://localhost:3000/debias-uri.html#t_1_nl'
        }
      ]
    },
    sourceField: 'DC_TITLE'
  },
  {
    recordId: 8264,
    europeanaId: '/347/CMC_HA_1255',
    valueDetection: {
      language: 'en',
      literal: 'Panorama Movie of link path 1-5, Skara Brae addict and aboriginal',
      tags: [
        {
          start: 44,
          end: 50,
          length: 6,
          uri: 'http://localhost:3000/debias-uri.html#t_3_en'
        },
        {
          start: 55,
          end: 65,
          length: 10,
          uri: 'http://localhost:3000/debias-uri.html#t_2_en'
        }
      ]
    },
    sourceField: 'DC_TITLE'
  },
  {
    recordId: 8264,
    europeanaId: '/347/CMC_HA_1255',
    valueDetection: {
      language: 'de',
      literal: 'Panoramafilm des Verbindungspfads 1-5, Skara Brae, Süchtiger und Ureinwohner',
      tags: [
        {
          start: 65,
          end: 76,
          length: 11,
          uri: 'http://localhost:3000/debias-uri.html#t_87_de'
        }
      ]
    },
    sourceField: 'DC_TITLE'
  },
  {
    recordId: 8261,
    europeanaId: '/347/CMC_HA_936',
    valueDetection: {
      language: 'en',
      literal:
        // eslint-disable-next-line max-len
        'Point cloud model derived from LiDAR survey of the monument. Mailman, housewife, fireman, forefathers. Skara Brae is an archaeological site with exceptionally well preserved remains that show the stone built furniture and internal structure of ten Neolithic houses and their narrow connecting passageways. Radio Carbon dates show that the village was occupied for around 600 years between 3200 and 2200 BC. There appear to be two main structural phases to the occupation.House 10 lies on the far south-eastern side of the village. Its entrance is not related to the other buildings and it does not appear to be part of the main complex. The internal features of House 10 are very damaged and while it is of a good size it may be part of an earlier phase of occupation.The monument is now managed by Historic Scotland and is a key element of the Heart of Neolithic Orkney World Heritage Site. The Lidar survey was conducted by Scottish10 and made available by Centre for Digital Documentation and Visualisation (CDDV).',
      tags: [
        {
          start: 650,
          end: 658,
          length: 8,
          uri: 'http://localhost:3000/debias-uri.html#t_89_en'
        }
      ]
    },
    sourceField: 'DC_DESCRIPTION'
  }
];

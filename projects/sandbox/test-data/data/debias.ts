import { DebiasDereferenceResult, DebiasDereferenceState } from '../../src/app/_models';

export const dereferencedDebiasRecommendation: DebiasDereferenceResult = {
  enrichmentBaseResultWrapperList: [
    {
      dereferenceStatus: DebiasDereferenceState.SUCCESS,
      enrichmentBaseList: [
        {
          altLabelList: [],
          about: 'http://data.europa.eu/c4p/data/t_208_en',
          prefLabelList: [
            {
              lang: 'en',
              value: 'Tribe'
            }
          ],
          notes: [
            {
              lang: 'en',
              value:
                'Tropen Museum et al., eds., “Words Matter: An Unfinished Guide to Word Choices in the Cultural Sector,” 2018.'
            },
            {
              lang: 'en',
              value:
                'Andrei Nesterov, Laura Hollink, Marieke van Erp, and Jacco van Ossenbruggen. (2023).'
            }
          ],
          hiddenLabel: [
            {
              lang: 'en',
              value: 'Tribe'
            }
          ],
          definitions: [
            {
              lang: 'en',
              value:
                "The term 'tribe' is often associated with so-called non-complex societies with simple political organisation."
            }
          ],
          scopeNotes: [
            {
              lang: 'de',
              value: 'Nur mit Vorsicht zu nutzen.'
            },
            {
              lang: 'en',
              value: 'Use with caution.'
            },
            {
              lang: 'en',
              value:
                'When the people themselves find it an acceptable and respectful term for describing themselves.'
            },
            {
              lang: 'fr',
              value: 'A utiliser avec précaution.'
            },
            {
              lang: 'it',
              value: 'Usare con cautela.'
            },
            {
              lang: 'nl',
              value: 'Gebruik met voorzichtigheid.'
            }
          ]
        }
      ]
    }
  ]
};

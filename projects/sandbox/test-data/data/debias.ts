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
                'Tropen Museum et al., eds., “Words Matter: An Unfinished Guide to Word Choices in the Cultural Sector,” 2018, 142. https://www.materialculture.nl/sites/default/files/2018-08/words_matter.pdf.pdf.'
            },
            {
              lang: 'en',
              value:
                'Andrei Nesterov, Laura Hollink, Marieke van Erp, and Jacco van Ossenbruggen. (2023). cultural-ai/wordsmatter: Words Matter: a knowledge graph of contentious terms (v1.0.2) [Data set]. European Semantic Web Conference (ESWC), Hersonissos, Greece. Zenodo. https://doi.org/10.5281/zenodo.7713157 ; https://w3id.org/culco/wordsmatter/142.'
            }
          ],
          hiddenLabel: [
            {
              lang: 'en',
              value: 'Tribe'
            }
          ],
          /*
                  'notation': null,
                  'broader': null,
                  'broadMatch': null,
                  'closeMatch': null,
                  */
          definitions: [
            {
              lang: 'en',
              value:
                "The term 'tribe' is often associated with so-called non-complex societies with simple political organisation. While this is itself not contested, the term has come to connote 'primitive,' 'simple' and even 'wild,' and is predominately associated with non-European peoples and cultures. The complexity of the term emerges because some cultural groups have come to embrace the term as a legal and group identity."
            }
          ]
          /*
                  'exactMatch': null,
                  'inScheme': [
                      {
                          'resource': 'http://data.europa.eu/c4p/data/0001',
                          'resourceUri': 'http://data.europa.eu/c4p/data/0001'
                      },
                      {
                          'resource': 'http://data.europa.eu/c4p/data/0002',
                          'resourceUri': 'http://data.europa.eu/c4p/data/0002'
                      }
                  ],
                  'narrower': null,
                  'narrowMatch': null,
                  'related': null,
                  'relatedMatch': null,
                  'scopeNotes': [
                      {
                          'lang': 'de',
                          'value': 'Nur mit Vorsicht zu nutzen.'
                      },
                      {
                          'lang': 'en',
                          'value': 'Use with caution.'
                      },
                      {
                          'lang': 'en',
                          'value': 'When the people themselves find it an acceptable and respectful term for describing themselves, it is appropriate. It can be used in the context of fashion and popular culture, but only when referring to oneself.'
                      },
                      {
                          'lang': 'fr',
                          'value': 'A utiliser avec précaution.'
                      },
                      {
                          'lang': 'it',
                          'value': 'Usare con cautela.'
                      },
                      {
                          'lang': 'nl',
                          'value': 'Gebruik met voorzichtigheid.'
                      }
                  ]
                  */
        }
      ]
    }
  ]
};

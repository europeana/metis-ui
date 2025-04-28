export const dereferencedDebiasRecommendation = {
  RDF: {
    Description: [
      {
        hasContentiousTerm: {
          '_rdf:resource': 'http://data.europa.eu/c4p/data/t_208_en',
          __prefix: 'ns4'
        },
        '_rdf:about': 'http://data.europa.eu/c4p/data/c_144_en',
        __prefix: 'rdf'
      },
      {
        suggestionNoteFor: {
          '_rdf:resource': 'http://data.europa.eu/c4p/data/t_208_en',
          __prefix: 'ns4'
        },
        '_rdf:about': 'http://data.europa.eu/c4p/data/s_3',
        __prefix: 'rdf'
      },
      {
        suggestionNoteFor: {
          '_rdf:resource': 'http://data.europa.eu/c4p/data/t_208_en',
          __prefix: 'ns4'
        },
        '_rdf:about': 'http://data.europa.eu/c4p/data/s_39',
        __prefix: 'rdf'
      },
      {
        type: {
          '_rdf:resource': 'http://data.europa.eu/c4p/ontology#ContentiousTerm',
          __prefix: 'rdf'
        },
        modified: {
          '_rdf:datatype': 'http://www.w3.org/2001/XMLSchema#date',
          __prefix: 'dcterms',
          __text: '2024-11-07'
        },
        literalForm: {
          '_xml:lang': 'en',
          __prefix: 'ns3',
          __text: 'Tribe'
        },
        hasSuggestionNote: [
          {
            '_rdf:resource': 'http://data.europa.eu/c4p/data/s_3',
            __prefix: 'ns4'
          },
          {
            '_rdf:resource': 'http://data.europa.eu/c4p/data/s_39',
            __prefix: 'ns4'
          }
        ],
        hasContentiousIssue: {
          '_rdf:resource': 'http://data.europa.eu/c4p/data/c_144_en',
          __prefix: 'ns4'
        },
        isAmbiguous: {
          '_rdf:datatype': 'http://www.w3.org/2001/XMLSchema#boolean',
          __prefix: 'ns4',
          __text: 'false'
        },
        '_rdf:about': 'http://data.europa.eu/c4p/data/t_208_en',
        __prefix: 'rdf'
      }
    ],
    '_xmlns:rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    '_xmlns:rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
    '_xmlns:dcterms': 'http://purl.org/dc/terms/',
    '_xmlns:ns3': 'http://www.w3.org/2008/05/skos-xl#',
    '_xmlns:ns4': 'http://data.europa.eu/c4p/ontology#',
    __prefix: 'rdf'
  }
};

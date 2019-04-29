import { Statistics } from '../../src/app/_models/statistics';

export const statistics: Statistics = {
  taskId: 5,
  nodePathStatistics: [
    {
      xPath: '//rdf:RDF/edm:ProvidedCHO/dc:creator',

      nodeValueStatistics: [
        {
          occurrences: 2,
          value: 'desconegut',

          attributeStatistics: [
            {
              xPath: '//rdf:RDF/edm:ProvidedCHO/dc:creator/@xml:lang',
              occurrences: 2,
              value: 'ca'
            }
          ]
        }
      ]
    }
  ]
};

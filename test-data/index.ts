import * as url from 'url';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import {
  dataset,
  errorReport,
  evolution,
  executionsHistory,
  executionsByDatasetIdAsList,
  getListWrapper,
  information,
  overview,
  pluginsAvailable,
  reportExists,
  running,
  search,
  workflow,
  xslt
} from './factory/factory.js';
import { urlManipulation } from './_models/test-models.js';
import { DepublicationStatus, RecordDepublicationInfo } from '../src/app/_models/depublication.js';

const port = 3000;

let depublicationInfoCache: Array<RecordDepublicationInfo> = [];
let switchedOff: { [key: string]: string } = {};

function returnEmpty(response: ServerResponse) {
  response.setHeader('Content-Type', 'application/json;charset=UTF-8');
  response.end('{ "results": [], "listSize":0, "nextPage":-1 }');
}

function return404(response: ServerResponse) {
  response.statusCode = 404;
  response.end();
}

function cleanSwitches() {
  switchedOff = {};
}

function switchOff(r: string) {
  let route = r.replace(urlManipulation.RETURN_404, '');
  switchedOff[route.replace(urlManipulation.RETURN_EMPTY, '')] =
    route === r ? urlManipulation.RETURN_EMPTY : urlManipulation.RETURN_404;
}

function switchOn(r: string) {
  let route = r.replace(urlManipulation.RETURN_404, '').replace(urlManipulation.RETURN_EMPTY, '');
  delete switchedOff[route];
}

function isSwitchedOff(r: string) {
  let route = r.replace(urlManipulation.RETURN_404, '').replace(urlManipulation.RETURN_EMPTY, '');
  return switchedOff[route];
}

function getStatisticsDetail(): string {
  return JSON.stringify({
    xPath: '//rdf:RDF/edm:ProvidedCHO',
    nodeValueStatistics: [
      {
        value: 'value 1',
        occurrences: 876,
        attributeStatistics: [
          {
            xPath: '//rdf:RDF/edm:ProvidedCHO/@rdf:about',
            value: 'new value 1',
            occurrences: 9
          },
          {
            xPath: '//rdf:RDF/edm:ProvidedCHO/@rdf:about',
            value: 'new value 2',
            occurrences: 8
          },
          {
            xPath: '//rdf:RDF/edm:ProvidedCHO/@rdf:about',
            value: 'new value 3',
            occurrences: 7
          },
          {
            xPath: '//rdf:RDF/edm:ProvidedCHO/@rdf:about',
            value: 'new value 4',
            occurrences: 6
          }
        ]
      }
    ]
  });
}

function getStatistics(): string {
  return JSON.stringify({
    taskId: -5886403149040825151,
    nodePathStatistics: [
      {
        xPath: '//rdf:RDF/edm:ProvidedCHO',

        nodeValueStatistics: [
          {
            value: 'originally loaded A 1',
            occurrences: 818,
            attributeStatistics: [
              {
                xPath: '//rdf:RDF/edm:ProvidedCHO/@rdf:about',
                value: 'orig attr stat value 1-1',
                occurrences: 12
              },
              {
                xPath: '//rdf:RDF/edm:ProvidedCHO/@rdf:about',
                value: 'orig attr stat value 1-2',
                occurrences: 21
              }
            ]
          },
          {
            value: 'originally loaded A 2',
            occurrences: 919,
            attributeStatistics: [
              {
                xPath: '//rdf:RDF/edm:ProvidedCHO/@rdf:about',
                value: 'orig attr stat value 1-3',
                occurrences: 12
              },
              {
                xPath: '//rdf:RDF/edm:ProvidedCHO/@rdf:about',
                value: 'orig attr stat value 1-4',
                occurrences: 21
              }
            ]
          }
        ]
      },
      {
        xPath: '//rdf:RDF/edm:Agent',
        nodeValueStatistics: [
          {
            value: 'originally loaded B 1',
            occurrences: 11111111,

            attributeStatistics: [
              {
                xPath: '//rdf:RDF/edm:Agent/@rdf:about',
                value: 'orig attr stat value 2-1',
                occurrences: 46
              },
              {
                xPath: '//rdf:RDF/edm:Agent/@ns2:about',
                value: 'orig attr stat value 2-2',
                occurrences: 42
              }
            ]
          },
          {
            value: 'originally loaded B 2',
            occurrences: 22222222,

            attributeStatistics: [
              {
                xPath: '//rdf:RDF/edm:Agent/@rdf:about',
                value: 'orig attr stat value 2-3',
                occurrences: 46
              },
              {
                xPath: '//rdf:RDF/edm:Agent/@ns2:about',
                value: 'orig attr stat value 2-4',
                occurrences: 42
              }
            ]
          }
        ]
      }
    ]
  });
}

function routeToFile(request: IncomingMessage, response: ServerResponse, route: string): boolean {
  response.setHeader('Content-Type', 'application/json;charset=UTF-8');

  const removeFromDepublicationCache = (recordId: string) => {
    depublicationInfoCache = depublicationInfoCache.filter((entry) => {
      return entry.recordId != recordId;
    });
  };

  if (request.method === 'DELETE' && route.match(/depublish\/record_ids/)) {
    let body = '';
    request.on('data', function(data) {
      body += data.toString();
    });
    request.on('end', function() {
      body.split('\n').forEach((id: string) => {
        removeFromDepublicationCache(id);
      });
      response.end();
      return true;
    });
  }

  let regRes = route.match(/depublish\/execute\/(\d+)/);

  if (regRes && request.method === 'POST') {
    const params = url.parse(route, true).query;

    if (params.datasetDepublish === 'true') {
      depublicationInfoCache = [];
      response.end();
      return true;
    } else {
      let body = '';
      request.on('data', function(data) {
        body += data.toString();
      });
      request.on('end', function() {
        if (body.length === 0) {
          depublicationInfoCache = [];
        } else {
          body.split('\n').forEach((id: string) => {
            removeFromDepublicationCache(id);
          });
        }
        response.end();
        return true;
      });
    }
  }

  regRes = route.match(/depublish\/record_ids\/[^\?+]*/);

  if (regRes) {
    const params = url.parse(route, true).query;
    if (request.method === 'POST') {
      const pushToDepublicationCache = (url: string) => {
        const time = new Date().toISOString();
        depublicationInfoCache.push({
          recordId: url,
          depublicationStatus: DepublicationStatus.PENDING,
          depublicationDate: time
        } as RecordDepublicationInfo);
      };

      const fileName = params.clientFilename;

      if (fileName) {
        pushToDepublicationCache('file/upload/' + fileName);
        response.end();
        return true;
      }

      let body = '';

      request.on('data', function(data) {
        body += data.toString();
      });
      request.on('end', function() {
        body.split(/\s+/).forEach((recordId: string) => pushToDepublicationCache(recordId));
        response.end();
        return true;
      });
    } else {
      let result = Array.from(depublicationInfoCache);

      if (result.length > 0 && params.searchQuery) {
        result = result.filter((entry) => {
          return entry.recordId.toUpperCase().includes(`${params.searchQuery}`.toUpperCase());
        });
      }
      if (result.length > 0 && params.sortField) {
        const snakeToCamel = (str: String): string =>
          str.toLowerCase().replace(/([-_][a-z])/g, (group) =>
            group
              .toUpperCase()
              .replace('-', '')
              .replace('_', '')
          );

        const sortField = snakeToCamel(params.sortField[0]);
        const sortResult = (res: Array<any>): Array<any> => {
          let asc = params.sortAscending === 'true';
          if (res[0][sortField]) {
            res.sort((a: any, b: any) => {
              const valA = a[sortField];
              const valB = b[sortField];
              let eq = valA === valB;
              let grtr = valA > valB;
              if (asc) {
                grtr = !grtr;
              }
              return eq ? 0 : grtr ? -1 : 1;
            });
          } else {
            console.log(`invalid sort field ${params.sortField} (${sortField})`);
          }
          return res;
        };
        result = sortResult(result);
      }
      const pageParam = parseInt(params.page ? params.page[0] : '0');
      response.end(
        JSON.stringify({
          depublicationRecordIds: getListWrapper(result, false, pageParam),
          depublicationTriggerable: pageParam % 2 === 0
        })
      );
      return true;
    }
  }

  regRes = route.match(/orchestrator\/proxies\/(\D+)\/task\/-?(\d+)\/report\/exists/);

  if (regRes) {
    response.end(JSON.stringify(reportExists(regRes[1])));
    return true;
  }

  regRes = route.match(/orchestrator\/proxies\/(\D+)\/task\/-?(\d+)\/report/);

  if (regRes) {
    response.end(JSON.stringify(errorReport(regRes[2], regRes[1])));
    return true;
  }

  regRes = route.match(/orchestrator\/workflows\/executions\/overview/);

  if (regRes) {
    const params = url.parse(route, true).query;
    response.end(
      JSON.stringify(overview(params.pageCount ? parseInt(params.pageCount[0]) : undefined))
    );
    return true;
  }

  regRes = route.match(/orchestrator\/workflows\/executions\/dataset\/-?(\d+)\/information/);

  if (regRes) {
    response.end(JSON.stringify(information(regRes[1])));
    return true;
  }

  regRes = route.match(/orchestrator\/workflows\/executions\/dataset\/-?(\d+)\/history/);

  if (regRes) {
    response.end(JSON.stringify(executionsHistory(regRes[1])));
    return true;
  }

  regRes = route.match(/orchestrator\/workflows\/executions\/-?(\S+)\/plugins\/data-availability/);

  if (regRes) {
    response.end(JSON.stringify(pluginsAvailable(regRes[1])));
    return true;
  }

  regRes = route.match(/orchestrator\/workflows\/executions\/dataset\/-?(\d+)/);

  if (regRes) {
    const params = url.parse(route, true).query;
    response.end(
      JSON.stringify(
        executionsByDatasetIdAsList(
          regRes[1],
          params.nextPage ? parseInt(params.nextPage[0]) : undefined
        )
      )
    );
    return true;
  }

  regRes = route.match(/orchestrator\/workflows\/executions\/\?\S+INQUEUE\S+RUNNING/);

  if (regRes) {
    const params = url.parse(route, true).query;
    response.end(
      JSON.stringify(running(params.nextPage ? parseInt(params.nextPage[0]) : undefined))
    );
    return true;
  }

  regRes = route.match(/orchestrator\/workflows\/executions\/\?/);

  if (regRes) {
    console.log('unhandled.....');
    response.end();
    return true;
  }

  regRes = route.match(/datasets\/countries/);

  if (regRes) {
    response.end(
      JSON.stringify([
        {
          enum: 'CZECH_REPUBLIC',
          name: 'Czech Republic',
          isoCode: 'CZ'
        },
        {
          enum: 'DENMARK',
          name: 'Denmark',
          isoCode: 'DK'
        },
        {
          enum: 'FINLAND',
          name: 'Finland',
          isoCode: 'FI'
        }
      ])
    );
    return true;
  }

  regRes = route.match(/datasets\/languages/);

  if (regRes) {
    response.end(
      JSON.stringify([
        { enum: 'CS', name: 'Czech' },
        { enum: 'DA', name: 'Danish' },
        { enum: 'GD', name: 'Gaelic (Scottish)' }
      ])
    );
    return true;
  }

  regRes = route.match(/datasets\/-?(\d+)\/xslt/);

  if (regRes) {
    response.end(JSON.stringify(xslt(regRes[1])));
    return true;
  }

  regRes = route.match(/datasets\/search\?searchString=/);

  if (regRes) {
    const params = url.parse(route, true).query;
    response.end(
      JSON.stringify(
        search(params.searchString[0], params.nextPage ? parseInt(params.nextPage[0]) : undefined)
      )
    );
    return true;
  }

  regRes = route.match(/datasets\/-?(\d+)/);

  if (regRes) {
    response.end(JSON.stringify(dataset(regRes[1])));
    return true;
  }

  regRes = route.match(/orchestrator\/workflows\/-?(\d+)/);

  if (regRes) {
    response.end(JSON.stringify(workflow(regRes[1])));
    return true;
  }

  regRes = route.match(/orchestrator\/proxies\/(\D+)\/task\/-?(\d+)\/nodestatistics/);

  if (regRes) {
    response.end(getStatisticsDetail());
    return true;
  }

  regRes = route.match(/orchestrator\/proxies\/(\D+)\/task\/-?(\d+)\/statistics/);

  if (regRes) {
    response.end(getStatistics());
    return true;
  }

  regRes = route.match(
    /orchestrator\/proxies\/records\?workflowExecutionId=(\S+)\&pluginType=(\S+)\&nextPage/
  );

  if (regRes) {
    response.end(
      JSON.stringify({
        records: [
          {
            ecloudId: '25XLZKQAMW75V7FWAJRL3LAAP4N6OHOZC4LIF22NBLS6UO65D4LQ',
            xmlRecord: '<x>Preview</x>'
          }
        ]
      })
    );
    return true;
  }

  regRes = route.match(
    /orchestrator\/proxies\/recordsbyids\?workflowExecutionId=(\S+)\&pluginType=(\S+)/
  );

  if (regRes) {
    response.end(
      JSON.stringify({
        records: [
          {
            ecloudId: '25XLZKQAMW75V7FWAJRL3LAAP4N6OHOZC4LIF22NBLS6UO65D4LQ',
            xmlRecord: '<x>Compare</x>'
          }
        ]
      })
    );
    return true;
  }

  regRes = route.match(/orchestrator\/workflows\/evolution\/(\S+)\/(\S+)/);

  if (regRes) {
    response.end(JSON.stringify(evolution(regRes[1], regRes[2])));
    return true;
  }
  return false;
}

const requestHandler = (request: IncomingMessage, response: ServerResponse) => {
  response.setHeader('Access-Control-Allow-Origin', '*');

  if (request.method === 'OPTIONS') {
    response.setHeader(
      'Access-Control-Allow-Headers',
      'authorization,X-Requested-With,content-type'
    );
    response.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,POST,PUT,DELETE,OPTIONS');
    response.setHeader('Access-Control-Max-Age', '1800');
    response.setHeader('Allow', 'GET, HEAD, POST, PUT, DELETE, TRACE, OPTIONS, PATCH');
    response.setHeader('Connection', 'Keep-Alive');
    response.end();
    return;
  }

  let route = request.url as string;

  if (route.match(urlManipulation.METIS_UI_CLEAR)) {
    cleanSwitches();
    response.end();
    return;
  }

  let isSwitch =
    route.match(urlManipulation.RETURN_404) || route.match(urlManipulation.RETURN_EMPTY);

  if (isSwitch) {
    switchOff(route);
  }

  let switchedOff = isSwitchedOff(route);
  if (switchedOff) {
    if (switchedOff === urlManipulation.RETURN_EMPTY) {
      returnEmpty(response);
    } else if (switchedOff === urlManipulation.RETURN_404) {
      return404(response);
    }
    if (!isSwitch) {
      switchOn(route);
    }
    return;
  }

  let requestHandled = routeToFile(request, response, route);

  if (!requestHandled) {
    if (request.method === 'POST') {
      response.setHeader('Content-Type', 'application/json;charset=UTF-8');

      let result = {
        userId: '1',
        email: 'xxx@xxx.xxx',
        firstName: 'Valentine',
        lastName: 'Charles',
        organizationId: '1482250000001617026',
        organizationName: 'Europeana Foundation',
        accountRole: 'EUROPEANA_DATA_OFFICER',
        country: 'Netherlands',
        networkMember: false,
        metisUserFlag: true,
        createdDate: 1509698100000,
        updatedDate: 1545129021000,
        metisUserAccessToken: {
          accessToken: 'xxx--ANDY-xxx'
        }
      };
      response.end(JSON.stringify(result));
    } else {
      console.log(' 404 :( ');
      return404(response);
    }
  }
};

const server = createServer(requestHandler);

server.listen(port, () => {
  console.log(`server is listening on ${port}`);
});

/** allow the process to be killed by name
 */
if (process.argv.length > 2) {
  process.title = process.argv[2];
}

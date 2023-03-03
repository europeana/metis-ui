import * as url from 'url';
import { IncomingMessage, ServerResponse } from 'http';
import { TestDataServer } from '../../../tools/test-data-server/test-data-server';
import { xsltStylesheet } from './_data/xslt';
import {
  dataset,
  errorReport,
  evolution,
  executionsByDatasetIdAsList,
  executionsHistory,
  getListWrapper,
  information,
  logs,
  overview,
  pluginsAvailable,
  reportExists,
  running,
  search,
  workflow,
  xslt
} from './factory/factory';
import { RecordDepublicationInfoField, UrlManipulation } from './_models/test-models';
import { DepublicationStatus, RecordDepublicationInfo, XmlSample } from '../src/app/_models';

const FAIL = 'fail';

// handler defined outside "this" content of server instance so it can be assigned within request.data event
const handleRecordSearch = (
  response: ServerResponse,
  ids: Array<string>,
  plugin: string,
  respondWithArray: boolean
): void => {
  setTimeout(
    () => {
      const firstAsNumber = parseInt(ids[0]);
      if (ids[0] === FAIL) {
        response.statusCode = 400;
        response.end(
          JSON.stringify({
            message: 'Failure!',
            error: {
              errorMessage: 'Expecting representations!'
            }
          })
        );
      } else if (firstAsNumber >= 400 && firstAsNumber <= 599) {
        response.statusCode = firstAsNumber;
        response.end();
      } else {
        let records: Array<XmlSample> = [];
        // short ids get an empty result
        if (ids[0].length > 5) {
          records = ids.map((id: string) => {
            return {
              ecloudId: id,
              xmlRecord: `<x>${plugin}</x>`
            } as XmlSample;
          });
        }
        if (respondWithArray) {
          response.end(
            JSON.stringify({
              records: records
            })
          );
        } else {
          response.end(JSON.stringify(records[0]));
        }
      }
    },
    ids.length === 1 ? 1000 : 0
  );
};

new (class extends TestDataServer {
  serverName = 'metis';
  depublicationInfoCache: Array<RecordDepublicationInfo> = [];
  switchedOff: { [key: string]: string } = {};

  returnEmpty(response: ServerResponse): void {
    response.setHeader('Content-Type', 'application/json;charset=UTF-8');
    response.end('{ "results": [], "listSize":0, "nextPage":-1 }');
  }

  return404(response: ServerResponse, statusMessage = 'Not found'): void {
    response.statusCode = 404;
    response.statusMessage = statusMessage;
    ((response as unknown) as { errorMessage: string }).errorMessage = statusMessage;
    response.end(JSON.stringify({ errorMessage: statusMessage }));
  }

  cleanSwitches(): void {
    this.switchedOff = {};
  }

  switchOff(r: string): void {
    const route = r.replace(UrlManipulation.RETURN_404, '');
    this.switchedOff[route.replace(UrlManipulation.RETURN_EMPTY, '')] =
      route === r ? UrlManipulation.RETURN_EMPTY : UrlManipulation.RETURN_404;
  }

  switchOn(r: string): void {
    const route = r
      .replace(UrlManipulation.RETURN_404, '')
      .replace(UrlManipulation.RETURN_EMPTY, '');
    delete this.switchedOff[route];
  }

  isSwitchedOff(r: string): UrlManipulation {
    const route = r
      .replace(UrlManipulation.RETURN_404, '')
      .replace(UrlManipulation.RETURN_EMPTY, '');
    return this.switchedOff[route] as UrlManipulation;
  }

  getStatisticsDetail(): string {
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

  getStatistics(): string {
    return JSON.stringify({
      taskId: -5886403149040825,
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

  routeToFile(request: IncomingMessage, response: ServerResponse, route: string): boolean {
    response.setHeader('Content-Type', 'application/json;charset=UTF-8');

    const fn404 = this.return404;

    const removeFromDepublicationCache = (recordId: string): void => {
      this.depublicationInfoCache = this.depublicationInfoCache.filter((entry) => {
        return entry.recordId != recordId;
      });
    };

    if (request.method === 'DELETE' && route.match(/workflows\/executions/)) {
      response.end();
      return true;
    }

    if (request.method === 'DELETE' && route.match(/depublish\/record_ids/)) {
      let body = '';
      request.on('data', function(data: { toString: () => string }) {
        body += data.toString();
      });
      request.on('end', function() {
        let throwError = false;
        body.split('\n').forEach((id: string) => {
          removeFromDepublicationCache(id);
          if (id === 'ERROR_404') {
            throwError = true;
          }
        });

        if (throwError) {
          fn404(response, 'Depublication Deletion Error');
        } else {
          response.end();
        }
      });
      return true;
    }

    let regRes = route.match(/depublish\/execute\/(\d+)/);

    if (regRes && request.method === 'POST') {
      const params = url.parse(route, true).query;
      const clearCache = (): void => {
        this.depublicationInfoCache = [];
      };

      if (params.datasetDepublish === 'true') {
        clearCache();
        response.end();
        return true;
      } else {
        let body = '';
        request.on('data', function(data: { toString: () => string }) {
          body += data.toString();
        });
        request.on('end', function() {
          if (body.length === 0) {
            clearCache();
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

    regRes = route.match(/depublish\/record_ids\/[^?+]*/);

    if (regRes) {
      const params = url.parse(route, true).query;
      if (request.method === 'POST') {
        const pushToDepublicationCache = (url: string): void => {
          const time = new Date().toISOString();
          this.depublicationInfoCache.push({
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

        request.on('data', function(data: { toString: () => string }) {
          body += data.toString();
        });

        request.on('end', function() {
          let throwError = false;
          body.split(/\s+/).forEach((recordId: string) => {
            if (recordId === '404') {
              throwError = true;
            } else {
              pushToDepublicationCache(recordId);
            }
          });
          if (throwError) {
            fn404(response, 'Depublication Error');
          } else {
            response.end();
          }
        });
        return true;
      } else {
        let result = Array.from(this.depublicationInfoCache);

        if (result.length > 0 && params.searchQuery) {
          result = result.filter((entry) => {
            return entry.recordId.toUpperCase().includes(`${params.searchQuery}`.toUpperCase());
          });
        }
        if (result.length > 0 && params.sortField) {
          const snakeToCamel = (str: String): RecordDepublicationInfoField => {
            return str.toLowerCase().replace(/([-_][a-z])/g, (group) =>
              group
                .toUpperCase()
                .replace('-', '')
                .replace('_', '')
            ) as RecordDepublicationInfoField;
          };

          const sortField = snakeToCamel(params.sortField[0]);
          const sortResult = (
            res: Array<RecordDepublicationInfo>
          ): Array<RecordDepublicationInfo> => {
            const asc = params.sortAscending === 'true';
            if (res[0][sortField]) {
              res.sort((a: RecordDepublicationInfo, b: RecordDepublicationInfo) => {
                const valA = a[sortField];
                const valB = b[sortField];
                const eq = valA === valB;
                let grtr = valA && valB && valA > valB;
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

    regRes = route.match(
      /orchestrator\/workflows\/executions\/dataset\/-?(\d+)\/allowed_incremental/
    );

    if (regRes) {
      response.end(JSON.stringify({ incrementalHarvestingAllowed: true }));
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

    regRes = route.match(
      /orchestrator\/workflows\/executions\/-?(\S+)\/plugins\/data-availability/
    );

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
      let res = [xslt(regRes[1])];
      if (route.indexOf('transform/default') > -1) {
        res = Array(5)
          .fill(0)
          .map(() => res[0]);
      }
      response.end(JSON.stringify(res));
      return true;
    }

    regRes = route.match(/datasets\/xslt\/default/);

    if (regRes) {
      response.end(xsltStylesheet);
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
      const result = dataset(regRes[1]);
      if (result) {
        response.end(JSON.stringify(result));
      } else {
        this.return404(response, `No dataset found with datasetId: '${regRes[1]}' in METIS`);
      }
      return true;
    }

    regRes = route.match(/orchestrator\/workflows\/-?(\d+)/);

    if (regRes) {
      const result = workflow(regRes[1]);
      if (result) {
        response.end(JSON.stringify(result));
      } else {
        this.return404(response, `No workflow found with datasetId: '${regRes[1]}' in METIS`);
      }
      return true;
    }

    regRes = route.match(/orchestrator\/proxies\/(\D+)\/task\/-?(\d+)\/nodestatistics/);

    if (regRes) {
      response.end(this.getStatisticsDetail());
      return true;
    }

    regRes = route.match(/orchestrator\/proxies\/(\D+)\/task\/-?(\d+)\/statistics/);

    if (regRes) {
      response.end(this.getStatistics());
      return true;
    }

    regRes = route.match(
      /orchestrator\/proxies\/records\?workflowExecutionId=(\S+)&pluginType=(\S+)&nextPage/
    );

    if (regRes) {
      let plugin = '';
      if (regRes[2]) {
        plugin = regRes[2];
      }
      const res = [
        '25XLZKQAMW75V7FWAJRL3LAAP4N6OHOZC4LIF22NBLS6UO65D4LQ',
        'LIF22NBLS6UO65D4LQ25XLZKQAMW75V7FWAJRL3LAAP4N6OHOZC4',
        'W75V7FWAJRL3LAALIF22NBLS6UO65D4LQ25XLZKQAMP4N6OHOZC4',
        'BLS6UO65D4LQLIF22N25XLZKQAMW75V7FWAJRL3LAAP4N6OHOZC4',
        'AJRL3LAAP4N6OHOZC4LIF22NBLS6UO65D4LQ25XLZKQAMW75V7FW'
      ].map((id: string) => {
        return {
          ecloudId: id,
          xmlRecord: `<xml>${plugin}</xml>`
        };
      });

      response.end(
        JSON.stringify({
          records: res
        })
      );
      return true;
    }

    regRes = route.match(
      /orchestrator\/proxies\/recordsearchbyid\?workflowExecutionId=(\S+)&pluginType=(\S+)&idToSearch=(\S+)/
    );
    if (regRes) {
      handleRecordSearch(response, [regRes[3]], regRes[2], false);
      return true;
    }

    regRes = route.match(
      /orchestrator\/proxies\/recordfrompredecessorplugin\?workflowExecutionId=(\S+)&pluginType=(\S+)/
    );

    if (regRes) {
      let body = '';
      let plugin = 'PluginType';
      if (regRes[2]) {
        plugin = regRes[2];
      }
      request.on('data', function(data: { toString: () => string }) {
        body += data.toString();
      });
      request.on('end', function() {
        const ids = JSON.parse(body).ids;
        handleRecordSearch(response, ids, plugin, true);
      });
      return true;
    }

    regRes = route.match(
      /orchestrator\/proxies\/recordsbyids\?workflowExecutionId=(\S+)&pluginType=(\S+)/
    );

    if (regRes) {
      let body = '';
      let plugin = 'PluginType';
      if (regRes[2]) {
        plugin = regRes[2];
      }

      request.on('data', function(data: { toString: () => string }) {
        body += data.toString();
      });
      request.on('end', function() {
        const ids = JSON.parse(body).ids;
        handleRecordSearch(response, ids, plugin, true);
      });
      return true;
    }

    regRes = route.match(/orchestrator\/workflows\/evolution\/(\S+)\/(\S+)/);

    if (regRes) {
      response.end(JSON.stringify(evolution(regRes[1], regRes[2])));
      return true;
    }

    regRes = route.match(/orchestrator\/proxies\/(\S+)\/task\/(\S+)\/logs/);

    if (regRes) {
      response.end(logs());
      return true;
    }

    return false;
  }

  handleRequest = (request: IncomingMessage, response: ServerResponse): void => {
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

    const route = request.url as string;

    if (route.match(UrlManipulation.METIS_UI_CLEAR)) {
      this.cleanSwitches();
      response.end();
      return;
    }

    const isSwitch =
      route.match(UrlManipulation.RETURN_404) || route.match(UrlManipulation.RETURN_EMPTY);

    if (isSwitch) {
      this.switchOff(route);
    }

    const switchedOff = this.isSwitchedOff(route);
    if (switchedOff) {
      if (switchedOff === UrlManipulation.RETURN_EMPTY) {
        this.returnEmpty(response);
      } else if (switchedOff === UrlManipulation.RETURN_404) {
        this.return404(response);
      }
      if (!isSwitch) {
        this.switchOn(route);
      }
      return;
    }

    const requestHandled = this.routeToFile(request, response, route);

    if (!requestHandled) {
      if (request.method === 'PUT') {
        let body = '';
        request.on('data', function(data: { toString: () => string }) {
          body += data.toString();
        });
        request.on('end', function() {
          const data = (JSON.parse(body) as { xslt: string }).xslt;
          if (data === FAIL) {
            response.statusCode = 500;
            response.end();
          } else {
            response.end();
          }
        });
        return;
      }
      if (request.method === 'POST') {
        response.setHeader('Content-Type', 'application/json;charset=UTF-8');

        const result = {
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
        this.return404(response);
      }
    }
  };
})();

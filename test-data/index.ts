import { createServer, IncomingMessage, ServerResponse } from 'http';

const fs = require('fs');

//const http = require('http');
//const url = require('url');

const port = 3000;

const RETURN_404 = 'METIS_UI_404';
const RETURN_EMPTY = 'METIS_UI_EMPTY';
const METIS_UI_CLEAR = 'METIS_UI_CLEAR';

interface ResultList {
  results: Array <String>;
  listSize: number;
}


//let switchedOff = {}; // disabled calls
let switchedOff: {[key: string] : string} = {};

function returnEmpty(response: ServerResponse){
  response.setHeader('Content-Type', 'application/json;charset=UTF-8')
  response.end('{ "results": [], "listSize":0, "nextPage":-1 }');
}

function return404(response: ServerResponse){
  response.statusCode = 404;
  response.end();
}

function cleanSwitches(){
  switchedOff = {};
}

function switchOff(r: string){
  let route = r.replace(RETURN_404, '');
  switchedOff[route.replace(RETURN_EMPTY, '')] = route === r ? RETURN_EMPTY : RETURN_404;
}

function switchOn(r: string){
  let route = r.replace(RETURN_404, '').replace(RETURN_EMPTY, '');
  delete switchedOff[route];
}

function isSwitchedOff(r: string){
  let route = r.replace(RETURN_404, '').replace(RETURN_EMPTY, '');
  return switchedOff[route];
}

function routeToFile(route: string){

  let file = '';

  [
    [ /orchestrator\/proxies\/(\D+)\/task\/-?(\d+)\/nodestatistics/,          'executions/stats/detail/123' ],
    [ /orchestrator\/proxies\/(\D+)\/task\/-?(\d+)\/statistics/,              'executions/stats/123' ],
    [ /orchestrator\/proxies\/(\D+)\/task\/-?(\d+)\/report\/exists/,          'error_report_exists' ],
    [ /orchestrator\/proxies\/(\D+)\/task\/-?(\d+)\/report/,                  'error_report' ],
    [ /orchestrator\/workflows\/executions\/overview/,                        'executions/overview' ],
    [ /orchestrator\/workflows\/executions\/dataset\/-?(\d+)\/information/,   'information', 1 ],
    [ /orchestrator\/workflows\/executions\/dataset\/-?(\d+)/,                'executions', 1 ],
    [ /orchestrator\/workflows\/executions\/\?\S+INQUEUE\S+RUNNING/,          'executions/running' ],
    [ /orchestrator\/workflows\/executions\/\?/,                              'executions/all' ],
    [ /datasets\/countries/,                                                  'countries'],
    [ /datasets\/languages/,                                                  'languages'],
    [ /datasets\/-?(\d+)\/xslt/,                                              'xslt', 1],
    [ /datasets\/-?(\d+)/,                                                    'datasets', 1],
    [ /orchestrator\/workflows\/-?(\d+)/,                                     'workflows', 1],
    [ /orchestrator\/proxies\/recordsbyids(\S)/,                              'records/records'],
    [ /orchestrator\/(\D+)\/records/,                                         'records/records'],
    [ /orchestrator\/workflows\/evolution\/(\S+)\/(\S+)/,                     'records/history']
  ].some((routeRule) => {

    let res = route.match(routeRule[0] as RegExp);

    if(res){
      file = 'data/' + routeRule[1] + (routeRule.length > 2 ? '/' + res[routeRule[2] as number] : '') + '.json'
      return true;
    }
    return false;
  })
  return file
}

const requestHandler = (request: IncomingMessage, response: ServerResponse) => {

  response.setHeader('Access-Control-Allow-Origin', '*');

  if(request.method === 'OPTIONS'){
    response.setHeader('Access-Control-Allow-Headers', 'authorization,X-Requested-With,content-type')
    response.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,POST,PUT,DELETE,OPTIONS')
    response.setHeader('Access-Control-Max-Age', '1800')
    response.setHeader('Allow', 'GET, HEAD, POST, PUT, DELETE, TRACE, OPTIONS, PATCH')
    response.setHeader('Connection', 'Keep-Alive')
    response.end()
    return;
  }

  let route = request.url as string;

  if(route.match(METIS_UI_CLEAR)){
    cleanSwitches();
    response.end();
    return;
  }

  let isSwitch = route.match(RETURN_404) || route.match(RETURN_EMPTY);

  if(isSwitch){
    switchOff(route);
  }

  let switchedOff = isSwitchedOff(route);
  if(switchedOff){
    if(switchedOff === RETURN_EMPTY){
      returnEmpty(response);
    }
    else if(switchedOff === RETURN_404){
      return404(response);
    }
    if(!isSwitch){
      switchOn(route);
    }
    return;
  }

  const file = routeToFile(route);

  if(file){

    response.setHeader('Content-Type', 'application/json;charset=UTF-8')
    fs.readFile(file, 'utf8', function(err: Error, contents: string) { // Array<string>) {

      if(err){
        console.log(err);
        return;
      }
      if(!request.url){
        return;
      }

      if(request.url.indexOf('report') > -1){
        setTimeout(function(){
          response.end(contents)
        }, 100);
        return;
      }

      if(request.url.indexOf('overview') > -1){

        var param = request.url.match(/pageCount=(\d+)/)

        let contentResult = JSON.parse(contents) as ResultList;

        if(param && param.length){

          var results  = contentResult.results;

          for(var i=0; i<parseInt(param[1]); i++){
            results = results.concat(contentResult.results)
          }

          contentResult.results = results;
          contentResult.listSize = results.length;

        }
        response.end(JSON.stringify(contentResult))
      }
      else{
        response.end(contents)
      }
    });

    return;
  }
  else if(request.method === 'POST'){
    if(request.url && request.url.match(/orchestrator\/proxies\/recordsbyids(\S)/)){
      fs.readFile('data/records/records.json', 'utf8', function(err: Error, contents: string) {
        if(err){
          console.log(err);
          return;
        }
        response.end(contents)
      });
    }
    else{
      fs.readFile('data/authenticate.json', 'utf8', function(err: Error, contents: string) {
        if(err){
          console.log(err);
          return;
        }
        response.end(contents)
      });
    }
  }
  else{
    return404(response);
  }
}

const server = createServer(requestHandler);

server.listen(port, (err: Error) => {
  if (err) {
    return console.log('server startup error', err)
  }
  console.log(`server is listening on ${port}`)
});

if(process.argv.length > 2){
  process.title = process.argv[2];
}

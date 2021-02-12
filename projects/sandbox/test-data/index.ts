import { IncomingMessage, ServerResponse } from 'http';
import { TestDataServer } from '../../../tools/test-data-server/test-data-server';

new (class extends TestDataServer {
  serverName = 'sandbox';
  newId = 0;

  handle404(route: string, response: ServerResponse): void {
    const urlParams =
      '?country=Hungary&language=hu&clientFilename=Test_Sandbox.zip&mimeType=application/zip';
    const urlPOST = '/dataset/my-dataset-name/process' + urlParams;
    const urlGET = '/dataset/1';
    this.headerText(response);
    response.end(
      super.get404() +
        `<br/><br/>You came <b><a href="${route}">here</a></b> but you need a correct url
      <ul>
      <li><span>POST: <a href="${urlPOST}">${urlPOST}</a></span></li>
      <li><span>GET: <a href="${urlGET}">${urlGET}</a></span></li>
      </ul>`
    );
  }

  handleRequest(request: IncomingMessage, response: ServerResponse): void {
    const route = request.url as string;

    if (request.method === 'POST') {
      const regRes = route.match(/\/dataset\/(\S+)\//);
      if (regRes) {
        this.newId++;
        this.headerJSON(response);
        response.end(
          JSON.stringify({
            'dataset-id': this.newId,
            'duplicate-records': 0,
            'records-to-process': 0
          })
        );
      }
      response.end(`{ "error": "invalid url" }`);
    } else {
      const regRes = route.match(/\/dataset\/([A-Za-z0-9_]+)$/);
      if (regRes) {
        const id = regRes[1];
        console.log(`GET ${id} (newId = ${this.newId})`);
        this.headerJSON(response);
        response.end(`{ "progress": "${id}" }`);
      } else {
        this.handle404(route, response);
      }
    }
  }
})();

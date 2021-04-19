import { createServer, IncomingMessage, ServerResponse } from 'http';

export abstract class TestDataServer {
  abstract serverName: string;

  port = 3000;

  constructor() {
    createServer((request: IncomingMessage, response: ServerResponse): void => {
      this.headerAccess(response);
      this.handleRequest(request, response);
    }).listen(this.port, () => {
      console.log(`test server "${this.serverName}" is listening on ${this.port}`);
    });
  }

  get404(): string {
    return '<h2>404</h2>';
  }

  headerAccess(response: ServerResponse): void {
    response.setHeader('Access-Control-Allow-Origin', '*');
  }

  headerJSON(response: ServerResponse): void {
    response.setHeader('Content-Type', 'application/json;charset=UTF-8');
  }

  headerText(response: ServerResponse): void {
    response.setHeader('Content-Type', 'text/html;charset=UTF-8');
  }

  abstract handleRequest(request: IncomingMessage, response: ServerResponse): void;
}

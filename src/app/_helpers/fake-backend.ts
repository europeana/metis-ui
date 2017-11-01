import { Http, BaseRequestOptions, Response, ResponseOptions, RequestMethod } from '@angular/http';
import { User } from '../_models/index';
import { MockBackend, MockConnection } from '@angular/http/testing';

export function fakeBackendFactory(backend: MockBackend, options: BaseRequestOptions) {
  // configure fake backend
  backend.connections.subscribe((connection: MockConnection) => {
    const password = 'test123';
    const testUser: User = {
      userId: '1482250000003199100',
      email: 'mirjam.verloop@europeana.eu',
      firstName: 'Valentine',
      lastName: 'Charles',
      organizationId: '1482250000001617026',
      organizationName: 'Europeana Foundation',
      accountRole: null,
      country: 'Netherlands',
      skypeId: null,
      networkMember: false,
      notes: null,
      active: false,
      createdDate: 1502350107000,
      updatedDate: 1502441110000,
      metisUserToken: {
        email: 'mirjam.verloop@europeana.eu',
        accessToken: 'w1EeItnofNxniCj3yijXj74s9EnxhSac',
        timestamp: 1509380572434
      }
    };

    // wrap in timeout to simulate server api call
    setTimeout(() => {

      // fake authenticate api end point
      if (connection.request.url.endsWith('/api/authenticate') && connection.request.method === RequestMethod.Post) {
        // get parameters from post request
        const params = JSON.parse(connection.request.getBody());

        // check user credentials and return fake jwt token if valid
        if (params.email === testUser.email && params.password === password) {
          connection.mockRespond(new Response(
            new ResponseOptions({ status: 200, body: testUser })
          ));
        } else {
          connection.mockRespond(new Response(
            new ResponseOptions({ status: 401 })
          ));
        }
      }

      // fake users api end point
      if (connection.request.url.endsWith('/api/users') && connection.request.method === RequestMethod.Get) {
        // check for fake auth token in header and return test users if valid, this security is implemented server side
        // in a real application
        if (connection.request.headers.get('Authorization') === `Bearer ${testUser.metisUserToken.accessToken}`) {
          connection.mockRespond(new Response(
            new ResponseOptions({ status: 200, body: [testUser] })
          ));
        } else {
          // return 401 not authorised if token is null or invalid
          connection.mockRespond(new Response(
            new ResponseOptions({ status: 401 })
          ));
        }
      }

    }, 500);

  });

return new Http(backend, options);
}

export let fakeBackendProvider = {
  // use fake backend in place of Http service for backend-less development
  provide: Http,
  useFactory: fakeBackendFactory,
  deps: [MockBackend, BaseRequestOptions]
};

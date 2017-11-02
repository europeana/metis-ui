import { Http, BaseRequestOptions, Response, ResponseOptions, RequestMethod } from '@angular/http';
import { User } from '../_models';
import { MockBackend, MockConnection } from '@angular/http/testing';

// http://metis-authentication-rest-test.eanadev.org/authentication/register
// http://metis-authentication-rest-test.eanadev.org/authentication/login
// http://metis-authentication-rest-test.eanadev.org/authentication/delete?userEmailToDelete=valentine.charles@europeana.eu

export function fakeBackendFactory(backend: MockBackend, options: BaseRequestOptions) {
  // configure fake backend
  backend.connections.subscribe((connection: MockConnection) => {
    const password = 'test123';
    const testUser: User = {
      userId: '1482250000003199100',
      email: 'mirjam.verloop@europeana.eu',
      firstName: 'Mirjam',
      lastName: 'Verloop',
      organizationId: '1482250000001617026',
      organizationName: 'Europeana Foundation',
      accountRole: 'EUROPEANA_DATA_OFFICER',
      country: 'Netherlands',
      networkMember: true,
      metisUserFlag: true,
      createdDate: 1502350107000,
      updatedDate: 1502441110000,
      metisUserAccessToken: {
        accessToken: 'w1EeItnofNxniCj3yijXj74s9EnxhSac',
      }
    };

    // wrap in timeout to simulate server api call
    setTimeout(() => {

      // fake authenticate api end point
      if (connection.request.url.endsWith('/authentication/login') && connection.request.method === RequestMethod.Post) {
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

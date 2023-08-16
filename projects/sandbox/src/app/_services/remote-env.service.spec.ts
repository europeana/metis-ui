import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { async, fakeAsync, TestBed, tick } from '@angular/core/testing';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { MockHttp } from 'shared';
import { apiSettings } from '../../environments/apisettings';
import { Env } from '../_models';
import { RemoteEnvService } from '.';

describe('RemoteEnvService', () => {
  let mockHttp: MockHttp;
  let service: RemoteEnvService;

  const key = 'sandbox-ui-test';

  const getMockResult = (msg: string, date = new Date()): Env => {
    return {
      'sandbox-ui-test': {
        maintenanceMessage: msg,
        period: {
          from: date.toLocaleString(),
          to: new Date(date.getTime() + 1000).toLocaleString()
        }
      }
    } as Env;
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [RemoteEnvService],
      imports: [HttpClientTestingModule]
    }).compileComponents();
    mockHttp = new MockHttp(TestBed.inject(HttpTestingController), '');
    service = TestBed.inject(RemoteEnvService);
  }));

  afterEach(() => {
    mockHttp.verify();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should get the maintenance message', fakeAsync(() => {
    const msg = 'hello';
    apiSettings.remoteEnvUrl = 'http://xxx';
    service.apiSettings.remoteEnvKey = key;
    service.apiSettings.remoteEnv = {
      maintenanceMessage: ''
    };
    const sub = service.loadObervableEnv().subscribe((data: string | undefined) => {
      expect(data).toEqual(msg);
    });
    tick(1);
    mockHttp.expect('GET', apiSettings.remoteEnvUrl).send(getMockResult(msg));
    sub.unsubscribe();
  }));

  it('should not get the maintenance message if the api settings are absent', fakeAsync(() => {
    apiSettings.remoteEnvUrl = (undefined as unknown) as string;
    let res: string | undefined = '';
    const sub = service.loadObervableEnv().subscribe((result: string | undefined) => {
      res = result;
    });
    tick(1);
    expect(res).toEqual('');
    sub.unsubscribe();
  }));

  it('should not get the maintenance message if the period is not now', fakeAsync(() => {
    apiSettings.remoteEnvUrl = 'http://zzz';
    apiSettings.remoteEnvKey = key;

    const oneHour = 60 * 60 * 1000;
    const oneHourFromNow = new Date(new Date().getTime() + oneHour);
    const sub = service.loadObervableEnv().subscribe((data: string | undefined) => {
      expect(data).toEqual('');
    });

    tick(1);
    mockHttp
      .expect('GET', apiSettings.remoteEnvUrl)
      .send(getMockResult('message does not arrive...', oneHourFromNow));
    sub.unsubscribe();
  }));
});

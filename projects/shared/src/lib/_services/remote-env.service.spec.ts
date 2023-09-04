import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { async, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MockHttp } from '@europeana/metis-ui-test-utils';
import { ApiSettingsGeneric, Env, EnvItem, EnvItemKey } from '../_models/remote-env';
import { RemoteEnvService } from './remote-env.service';

describe('RemoteEnvService', () => {
  let mockHttp: MockHttp;
  let service: RemoteEnvService;

  const key: EnvItemKey = 'sandbox-ui-test';

  const getMockResult = (msg: string, date?: Date): Env => {
    const res = {
      'sandbox-ui-test': {
        maintenanceMessage: msg
      }
    } as Env;
    if (date) {
      res[key].period = {
        from: date.toISOString(),
        to: new Date(date.getTime() + 1000).toISOString()
      };
    }
    return res;
  };

  const getSettings = (): ApiSettingsGeneric => {
    return {
      intervalMaintenance: 10,
      remoteEnvKey: key,
      remoteEnv: {
        maintenanceMessage: 'xxx'
      },
      remoteEnvUrl: 'http://xxx'
    };
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
    const settings = getSettings();

    service.setApiSettings(settings);

    const sub = service.loadObervableEnv().subscribe((data: EnvItem | undefined) => {
      expect(data).toBeTruthy();
      expect(data?.maintenanceMessage).toEqual(msg);
    });
    tick(1);
    mockHttp.expect('GET', settings.remoteEnvUrl).send(getMockResult(msg));
    sub.unsubscribe();
  }));

  it('should get the maintenance message with the current date', fakeAsync(() => {
    const msg = 'hello';
    const settings = getSettings();

    service.setApiSettings(settings);

    const sub = service.loadObervableEnv().subscribe((data: EnvItem | undefined) => {
      expect(data).toBeTruthy();
      expect(data?.maintenanceMessage).toEqual(msg);
    });
    tick(1);
    mockHttp.expect('GET', settings.remoteEnvUrl).send(getMockResult(msg, new Date()));
    sub.unsubscribe();
  }));

  it('should not get the maintenance message if the period is not now', fakeAsync(() => {
    const msg = 'hello';
    const settings = getSettings();
    const oneHour = 60 * 60 * 1000;
    const oneHourFromNow = new Date(new Date().getTime() + oneHour);

    service.setApiSettings(settings);

    const sub = service.loadObervableEnv().subscribe((data: EnvItem | undefined) => {
      expect(data).toBeFalsy();
    });
    tick(1);
    mockHttp.expect('GET', settings.remoteEnvUrl).send(getMockResult(msg, oneHourFromNow));
    sub.unsubscribe();
  }));

  it('should not get the maintenance message if the api settings are absent', fakeAsync(() => {
    const settings = getSettings();
    settings.remoteEnvUrl = (undefined as unknown) as string;
    service.setApiSettings(settings);

    let res: EnvItem | undefined;
    const sub = service.loadObervableEnv().subscribe((result: EnvItem | undefined) => {
      res = result;
    });
    tick(1);
    expect(res).toBeFalsy();
    sub.unsubscribe();
  }));
});

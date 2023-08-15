import { HttpHandler, HttpRequest } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { apiSettings } from '../../environments/apisettings';
import { MaintenanceInterceptor } from '.';

describe('MaintenanceInterceptor', () => {
  let service: MaintenanceInterceptor;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MaintenanceInterceptor],
      imports: [HttpClientTestingModule]
    }).compileComponents();
    service = TestBed.inject(MaintenanceInterceptor);
  });

  const getHandler = (): HttpHandler => {
    return ({
      handle: () => {
        return of({ status: 200 });
      }
    } as unknown) as HttpHandler;
  };

  it('should allow traffic', () => {
    console.log(!!apiSettings);
    const handler = getHandler();
    spyOn(handler, 'handle').and.callThrough();
    const sub = service
      .intercept(new HttpRequest('GET', apiSettings.remoteEnvUrl), handler)
      .subscribe();
    expect(handler.handle).toHaveBeenCalled();
    sub.unsubscribe();
  });

  it('should intercept', () => {
    const handler = getHandler();
    spyOn(handler, 'handle').and.callThrough();
    apiSettings.remoteEnv.maintenanceMessage = 'down';
    const sub = service.intercept(new HttpRequest('GET', '/'), handler).subscribe();
    expect(handler.handle).not.toHaveBeenCalled();
    sub.unsubscribe();
  });
});

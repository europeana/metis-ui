import { HttpHandler, HttpRequest } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MaintenanceInterceptor } from './maintenance.interceptor';

describe('MaintenanceInterceptor', () => {
  let interceptor: MaintenanceInterceptor;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MaintenanceInterceptor],
      imports: [HttpClientTestingModule]
    }).compileComponents();
    interceptor = TestBed.inject(MaintenanceInterceptor);
  });

  const getHandler = (): HttpHandler => {
    return ({
      handle: () => {
        return of({ status: 200 });
      }
    } as unknown) as HttpHandler;
  };

  it('should allow traffic', () => {
    const handler = getHandler();
    spyOn(handler, 'handle').and.callThrough();
    const sub = interceptor
      .intercept(new HttpRequest('GET', 'http://europeana.eu'), handler)
      .subscribe();
    expect(handler.handle).toHaveBeenCalled();
    sub.unsubscribe();
  });

  it('should intercept', () => {
    const handler = getHandler();
    spyOn(handler, 'handle').and.callThrough();
    interceptor.settings.remoteEnv.maintenanceMessage = 'down';
    const sub = interceptor.intercept(new HttpRequest('GET', '/'), handler).subscribe();
    expect(handler.handle).not.toHaveBeenCalled();
    sub.unsubscribe();
  });
});

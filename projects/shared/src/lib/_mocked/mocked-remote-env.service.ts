import { delay, Observable, of } from 'rxjs';
import { ApiSettingsGeneric } from '../_models/remote-env';

export class MockRemoteEnvService {
  setApiSettings(_: ApiSettingsGeneric): void {
    console.log('Mock setApiSettings');
  }

  loadObervableEnv(): Observable<string | undefined> {
    return of('Site is down').pipe(delay(1));
  }
}

export class MockRemoteEnvServiceEmpty extends MockRemoteEnvService {
  loadObervableEnv(): Observable<string | undefined> {
    return of(undefined).pipe(delay(1));
  }
}

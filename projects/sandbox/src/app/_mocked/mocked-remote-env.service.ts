import { delay, Observable, of } from 'rxjs';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { ApiSettingsGeneric } from 'shared';

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

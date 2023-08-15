import { delay, Observable, of } from 'rxjs';

export class MockRemoteEnvService {
  loadObervableEnv(): Observable<string | undefined> {
    return of('Site is down').pipe(delay(1));
  }
}

export class MockRemoteEnvServiceEmpty {
  loadObervableEnv(): Observable<string | undefined> {
    return of(undefined).pipe(delay(1));
  }
}

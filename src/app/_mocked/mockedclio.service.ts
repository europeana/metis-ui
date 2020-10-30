import { Observable, of } from 'rxjs';
import { ClioData } from '../_models';

export const clioData = [0, 1, 2, 3, 4].map((n) => {
  return {
    score: n,
    date: new Date().toISOString().split('T')[0]
  };
});

export class MockClioService {
  loadClioData(_: string): Observable<ClioData[]> {
    return of(clioData);
  }
}

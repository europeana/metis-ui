/**
 * MockModalConfirmService
 *
 **/
import { Observable, of } from 'rxjs';
import { ModalDialog } from '../_models';

export class MockModalConfirmService {
  add(id: ModalDialog): void {
    console.log(`Mock add modal ${id}`);
  }
  remove(id: string): void {
    console.log(`Mock remove modal ${id}`);
  }

  /**
   *  open
   *  returns a default for "open" to prevent undefined entering piped observables
   *
   *  @param {string} _ - the unused modal id to open
   *  @return observable of true
   **/
  open(_: string): Observable<boolean> {
    return of(true);
  }
}

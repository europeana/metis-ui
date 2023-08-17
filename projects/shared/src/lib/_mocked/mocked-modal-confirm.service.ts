/**
 * MockModalConfirmService
 *
 **/
import { Observable, of, throwError } from 'rxjs';
import { ModalDialog } from '../_models/modal-dialog';

export class MockModalConfirmService {
  errorMode = false;

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
  open(id: string): Observable<boolean> {
    if (this.errorMode) {
      return throwError(new Error(`mock open with id "${id}" throws error`));
    }
    return of(true);
  }

  isOpen(id: string): boolean {
    return parseInt(id) % 2 === 0;
  }
}

export class MockModalConfirmServiceErrors extends MockModalConfirmService {
  errorMode = true;
}

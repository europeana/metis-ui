import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ModalDialog } from '../_models';

@Injectable({ providedIn: 'root' })
export class ModalConfirmService {
  private modals: ModalDialog[] = [];

  /** add
  /* add modal to array of active modals
  /*  @param {string} id - the modal to add
  */
  add(modal: ModalDialog): void {
    this.modals.push(modal);
  }

  /** remove
  /* remove modal from array of active modals
  /*  @param {string} id - the modal to remove
  */
  remove(id: string): void {
    this.modals = this.modals.filter((x) => x.id !== id);
  }

  /** open
  /*  open modal specified by id
  /*  @param {string} id - the modal to open
  /*  return the confirm result as an Observable
  */
  open(id: string): Observable<boolean> {
    const modal: ModalDialog = this.modals.filter((x) => x.id === id)[0];
    return modal.open();
  }
}

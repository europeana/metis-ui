import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ModalDialog } from '../_models';

@Injectable({ providedIn: 'root' })
export class ModalConfirmService {
  private allModals: { [key: string]: ModalDialog } = {};

  /** add
  /* add modal to managed hashmap
  /*  @param {ModalDialog} modal - the modal to add
  */
  add(modal: ModalDialog): void {
    this.allModals[modal.id] = modal;
  }

  /** remove
  /* remove modal from managed hashmap
  /*  @param {string} id - the modal to remove
  */
  remove(id: string): void {
    delete this.allModals[id];
  }

  /** open
  /*  open modal specified by id
  /*  @param {string} id - the modal to open
  /*  return the confirm result as an Observable
  */
  open(id: string): Observable<boolean> {
    return this.allModals[id].open();
  }
}

import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ModalDialog } from '../_models/modal-dialog';

@Injectable({ providedIn: 'root' })
export class ModalConfirmService {
  private readonly modalsSignal = signal<{ [key: string]: ModalDialog }>({});

  // Extracts the current object map out of the signal
  private get allModals(): { [key: string]: ModalDialog } {
    return this.modalsSignal();
  }

  add(modal: ModalDialog): void {
    if (!modal) {
      return;
    }

    this.modalsSignal.update((current) => ({
      ...current,
      [modal.id()]: modal
    }));
  }

  remove(id: string): void {
    const modal = this.allModals[id];
    if (modal) {
      modal.close(false);
    }

    this.modalsSignal.update((current) => {
      const updated = { ...current };
      delete updated[id];
      return updated;
    });
  }

  /** open
  /*  open modal specified by id
  /*  @param {string} id - the modal to open
  /*  return the confirm result as an Observable
  */
  open(id: string, openedViaKeyboard = false, openerRef?: HTMLElement): Observable<boolean> {
    return this.allModals[id].open(openedViaKeyboard, openerRef).pipe(
      tap(() => {
        // Wakes up Angular's change detection right when the modal finishes!
        this.modalsSignal.update((current) => ({ ...current }));
      })
    );
  }

  /** isOpen
  /*  @param {string} id - the modal to open
  /*  return true if the modal exists and is showing
  */
  isOpen(id: string): boolean {
    const modal = this.allModals[id];
    if (modal) {
      return this.allModals[id].isShowing();
    }
    return false;
  }
}

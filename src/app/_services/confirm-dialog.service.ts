import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private modals: any[] = [];

  // add modal to array of active modals
  add(modal: any): void {
    this.modals.push(modal);
  }

  // remove modal from array of active modals
  remove(id: string): void {
    this.modals = this.modals.filter((x) => x.id !== id);
  }

  // open modal specified by id
  open(id: string): Observable<boolean> {
    console.log('open id = ' + id);
    console.log('this.modals = ' + this.modals.length);

    const modal: any = this.modals.filter((x) => x.id === id)[0];
    return modal.open();
  }

  // close modal specified by id
  close(id: string) {
    let modal: any = this.modals.filter((x) => x.id === id)[0];
    modal.close();
  }
}

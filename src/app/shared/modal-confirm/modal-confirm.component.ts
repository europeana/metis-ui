import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ModalDialog } from '../../_models';
import { ModalConfirmService } from '../../_services';

@Component({
  selector: 'app-modal-confirm',
  templateUrl: './modal-confirm.component.html'
})
export class ModalConfirmComponent implements ModalDialog, OnInit, OnDestroy {
  @Input() id: string;
  @Input() title: string;
  subConfirmResponse: Subject<boolean>;
  show = false;

  constructor(private modalConfirms: ModalConfirmService) {
    this.subConfirmResponse = new Subject<boolean>();
  }

  /** ngOnInit
  /*  register this instance to the managing service
  */
  ngOnInit(): void {
    this.modalConfirms.add(this);
  }

  /** ngOnDestroy
  /*  unregister this instance from the managing service
  */
  ngOnDestroy(): void {
    this.modalConfirms.remove(this.id);
  }

  /** open
  /*  open this modal and return response Observable
  */
  open(): Observable<boolean> {
    this.show = true;
    return this.subConfirmResponse;
  }

  /** close
  /*  close this modal and pipe the response
  /*  @param {boolean} response - the confirm response
  */
  close(response: boolean): void {
    this.show = false;
    this.subConfirmResponse.next(response);
  }
}

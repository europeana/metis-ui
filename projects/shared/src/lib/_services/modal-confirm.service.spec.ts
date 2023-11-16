import { async, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ModalDialog } from '../_models/modal-dialog';
import { ModalConfirmService } from './modal-confirm.service';

describe('Modal Confirm Service', () => {
  let service: ModalConfirmService;

  beforeEach(async(() => {
    service = TestBed.inject(ModalConfirmService);
  }));

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should open', () => {
    const id = '1';
    const modal = ({
      id: id,
      open: () => {
        return of(true);
      }
    } as unknown) as ModalDialog;
    spyOn(modal, 'open').and.callThrough();
    service.add(modal);
    service
      .open(modal.id)
      .subscribe()
      .unsubscribe();
    expect(modal.open).toHaveBeenCalled();
  });
});

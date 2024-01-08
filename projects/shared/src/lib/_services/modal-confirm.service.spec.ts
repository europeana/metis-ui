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

  it('should remove', () => {
    const modal = ({
      id: '1',
      close: () => {}
    } as unknown) as ModalDialog;

    spyOn(modal, 'close');

    service.add(modal);
    service.remove(modal.id);

    expect(modal.close).toHaveBeenCalled();
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

  it('should detect if a modal is open', () => {
    const modal1 = ({
      id: '1',
      open: () => {
        return of(true);
      },
      isShowing: false
    } as unknown) as ModalDialog;

    const modal2 = ({
      id: '2',
      open: () => {},
      isShowing: true
    } as unknown) as ModalDialog;

    service.add(modal1);
    service.add(modal2);

    expect(service.isOpen('1')).toBeFalsy();
    expect(service.isOpen('2')).toBeTruthy();
    expect(service.isOpen('3')).toBeFalsy();
  });
});

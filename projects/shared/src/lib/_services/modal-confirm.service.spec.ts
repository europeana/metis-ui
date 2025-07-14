import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ModalDialog } from '../_models/modal-dialog';
import { ModalConfirmService } from './modal-confirm.service';

describe('Modal Confirm Service', () => {
  let service: ModalConfirmService;

  beforeEach(() => {
    service = TestBed.inject(ModalConfirmService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should remove', () => {
    let calledClose = false;
    const modal = ({
      id: '1',
      close: () => {
        calledClose = true;
      }
    } as unknown) as ModalDialog;

    service.add(modal);
    service.remove(modal.id);

    expect(calledClose).toBeTruthy();
  });

  it('should open', () => {
    let calledOpen = false;
    const id = '1';
    const modal = ({
      id: id,
      open: () => {
        calledOpen = true;
        return of(true);
      }
    } as unknown) as ModalDialog;
    service.add(modal);
    service
      .open(modal.id)
      .subscribe()
      .unsubscribe();
    expect(calledOpen).toBeTruthy();
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
      // eslint-disable-next-line @typescript-eslint/no-empty-function
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

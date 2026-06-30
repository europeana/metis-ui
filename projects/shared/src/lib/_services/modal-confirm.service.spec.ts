import { computed, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ModalDialog } from '../_models/modal-dialog';
import { ModalConfirmService } from './modal-confirm.service';

describe('Modal Confirm Service', () => {
  let service: ModalConfirmService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
    service = TestBed.inject(ModalConfirmService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should remove', () => {
    let calledClose = false;
    const modalId = signal('1');

    const modal = ({
      id: modalId, // Acts as a proper read function when called via modal.id()
      isShowing: () => false,
      close: () => {
        calledClose = true;
      }
    } as unknown) as ModalDialog;

    service.add(modal);
    service.remove(modalId()); // Pass the string value ('1') instead of the signal function

    expect(calledClose).toBeTruthy();
  });

  it('should open', () => {
    let calledOpen = false;
    const modalId = signal('1');

    const modal = ({
      id: modalId,
      isShowing: () => false,
      open: () => {
        calledOpen = true;
        return of(true);
      }
    } as unknown) as ModalDialog;

    service.add(modal);
    service
      .open(modalId()) // Pass the explicit string value
      .subscribe()
      .unsubscribe();

    expect(calledOpen).toBeTruthy();
  });

  it('should add', () => {
    const id = 'my-unique-id';
    const mockModal = ({ id: () => id, isShowing: () => true } as unknown) as ModalDialog;
    service.add(mockModal);
    expect(service.isOpen(id)).toBe(true);
    expect(() => service.add(null as any)).not.toThrow();
  });

  it('should detect if a modal is open', () => {
    const modal1Id = signal('1');
    const modal2Id = signal('2');

    const modal1 = ({
      id: modal1Id,
      open: () => of(true),
      isShowing: () => false
    } as unknown) as ModalDialog;

    const modal2 = ({
      id: modal2Id,
      open: () => {},
      isShowing: () => true
    } as unknown) as ModalDialog;

    service.add(modal1);
    service.add(modal2);

    expect(service.isOpen('1')).toBeFalsy();
    expect(service.isOpen('2')).toBeTruthy();
    expect(service.isOpen('3')).toBeFalsy();
  });

  it('should trigger reactivity in an Angular context when modal state changes', () => {
    let internalShowingState = false;
    const modalId = signal('dynamic-1');

    const dynamicModal = ({
      id: modalId,
      isShowing: () => internalShowingState,
      open: () => {
        internalShowingState = true;
        return of(true);
      }
    } as unknown) as ModalDialog;

    service.add(dynamicModal);

    // Set up a computed tracking context simulating a modern Angular template check
    const isModalOpenReactive = TestBed.runInInjectionContext(() => {
      return computed(() => service.isOpen('dynamic-1'));
    });

    // 1. Verify initial reactive state evaluates to false
    expect(isModalOpenReactive()).toBeFalsy();

    // 2. Open the modal (updates internalShowingState to true)
    service.open('dynamic-1').subscribe();

    // 3. Confirm the underlying model shifted
    expect(internalShowingState).toBeTruthy();

    // 4. Test the reactive bridge explicitly without safety wrappers
    expect(isModalOpenReactive()).toBeTruthy();
  });
});

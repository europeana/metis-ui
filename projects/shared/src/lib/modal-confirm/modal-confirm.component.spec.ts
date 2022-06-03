import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ModalConfirmService } from '../_services/modal-confirm.service';
import { ModalConfirmComponent } from './modal-confirm.component';

describe('ModalConfirmComponent', () => {
  let component: ModalConfirmComponent;
  let fixture: ComponentFixture<ModalConfirmComponent>;
  let modalConfirms: ModalConfirmService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalConfirmComponent],
      providers: [ModalConfirmService]
    }).compileComponents();
    fixture = TestBed.createComponent(ModalConfirmComponent);
    component = fixture.componentInstance;
    component.modalWrapper = {
      nativeElement: {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        focus: (): void => {}
      }
    };
    modalConfirms = TestBed.inject(ModalConfirmService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should register itself on init', () => {
    spyOn(modalConfirms, 'add');
    component.ngOnInit();
    expect(modalConfirms.add).toHaveBeenCalled();
  });

  it('should handle keyDown events', fakeAsync(() => {
    spyOn(component, 'close');
    // eslint-disable-next-line rxjs/no-ignored-observable
    component.open();
    component.fnKeyDown({ key: 'Enter' } as KeyboardEvent);
    tick(1);
    expect(component.close).not.toHaveBeenCalled();
    component.fnKeyDown({ key: 'Escape' } as KeyboardEvent);
    tick(1);
    expect(component.close).toHaveBeenCalled();
  }));

  it('should open', () => {
    expect(component.show).toBeFalsy();
    // eslint-disable-next-line rxjs/no-ignored-observable
    component.open();
    expect(component.show).toBeTruthy();
  });

  it('should close', () => {
    component.show = true;
    component.close(false);
    expect(component.show).toBeFalsy();
  });
});

import { Renderer2 } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ModalConfirmService } from '../_services/modal-confirm.service';
import { MockRenderer2 } from '../_mocked/mocked-renderer-2';
import { ModalConfirmComponent } from './modal-confirm.component';

describe('ModalConfirmComponent', () => {
  let component: ModalConfirmComponent;
  let fixture: ComponentFixture<ModalConfirmComponent>;
  let modalConfirms: ModalConfirmService;
  let renderer: Renderer2;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ModalConfirmComponent],
      providers: [
        ModalConfirmService,
        {
          provide: Renderer2,
          userClass: MockRenderer2
        }
      ]
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
    renderer = fixture.debugElement.injector.get(Renderer2);
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

    component.permanent = true;
    component.fnKeyDown({ key: 'Escape' } as KeyboardEvent);
    tick(1);
    expect(component.close).not.toHaveBeenCalled();

    component.permanent = false;

    component.fnKeyDown({ key: 'Escape' } as KeyboardEvent);
    tick(1);
    expect(component.close).toHaveBeenCalled();
  }));

  it('should open', () => {
    spyOn(renderer, 'addClass');
    expect(component.isShowing).toBeFalsy();
    // eslint-disable-next-line rxjs/no-ignored-observable
    component.open();
    expect(component.isShowing).toBeTruthy();
    expect(renderer.addClass).toHaveBeenCalled();
  });

  it('should close', () => {
    spyOn(renderer, 'removeClass');
    component.isShowing = true;
    component.close(false);
    expect(component.isShowing).toBeFalsy();
    expect(renderer.removeClass).toHaveBeenCalled();
  });
});

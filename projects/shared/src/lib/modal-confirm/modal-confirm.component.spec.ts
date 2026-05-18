import { provideZonelessChangeDetection, Renderer2 } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
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
        provideZonelessChangeDetection(),
        ModalConfirmService,
        {
          provide: Renderer2,
          useClass: MockRenderer2
        }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ModalConfirmComponent);

    fixture.componentRef.setInput('id', 'myId');
    fixture.componentRef.setInput('title', 'myTitle');

    component = fixture.componentInstance;
    component.modalBtnClose = {
      nativeElement: {
        focus: (): void => {}
      }
    };
    modalConfirms = TestBed.inject(ModalConfirmService);
    renderer = fixture.debugElement.injector.get(Renderer2);
    document.body.classList.remove(ModalConfirmComponent.cssClassModalLocked);
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should register itself on init', () => {
    vi.spyOn(modalConfirms, 'add');
    component.ngOnInit();
    expect(modalConfirms.add).toHaveBeenCalled();
  });

  it('should handle keyUp events', () => {
    vi.spyOn(component, 'close');
    component.open();
    component.fnKeyUp({ key: 'Enter' } as KeyboardEvent);
    vi.advanceTimersByTime(1);
    expect(component.close).not.toHaveBeenCalled();

    fixture.componentRef.setInput('permanent', true);
    fixture.detectChanges();

    component.fnKeyUp({ key: 'Escape' } as KeyboardEvent);
    vi.advanceTimersByTime(1);
    expect(component.close).not.toHaveBeenCalled();

    fixture.componentRef.setInput('permanent', false);
    fixture.detectChanges();

    component.fnKeyUp({ key: 'Escape' } as KeyboardEvent);
    vi.advanceTimersByTime(1);
    expect(component.close).toHaveBeenCalled();
  });

  it('should open', () => {
    vi.spyOn(renderer, 'addClass');
    expect(component.isShowing()).toBeFalsy();
    component.open();
    expect(component.isShowing()).toBeTruthy();
    expect(renderer.addClass).toHaveBeenCalled();
  });

  it('should close', () => {
    vi.spyOn(renderer, 'removeClass');
    component.isShowing.set(true);
    component.close(false);
    expect(component.isShowing()).toBeFalsy();
    expect(renderer.removeClass).toHaveBeenCalled();

    component.isShowing.set(true);
    document.body.classList.add(ModalConfirmComponent.cssClassModalLocked);
    component.close(false);
    expect(component.isShowing()).toBeTruthy();
  });

  it('should re-focus the opening control when closing via the keyboard', () => {
    component.open(true, ({ focus: vi.fn() } as unknown) as HTMLElement);
    component.close(false);
    expect(component.openingControl?.focus).not.toHaveBeenCalled();
    component.close(false, true);
    expect(component.openingControl?.focus).toHaveBeenCalled();
  });
});

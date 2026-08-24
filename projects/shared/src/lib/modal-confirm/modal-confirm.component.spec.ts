import { ElementRef, provideZonelessChangeDetection, Renderer2, TemplateRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalConfirmService } from '../_services/modal-confirm.service';
import { MockRenderer2 } from '../_mocked/mocked-renderer-2';
import { ModalConfirmComponent } from './modal-confirm.component';
import { ModalDialogButtonDefinition } from '../_models/modal-dialog';

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

  it('should register itself automatically upon render', () => {
    vi.spyOn(modalConfirms, 'add');
    fixture.detectChanges();
    expect(modalConfirms.add).toHaveBeenCalledWith(component);
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

  it('should safely catch errors during ngOnDestroy if the ID signal throws', () => {
    vi.spyOn(modalConfirms, 'remove');
    vi.spyOn(component, 'id').mockImplementation(() => {
      throw new Error('Signal unassigned');
    });

    expect(() => component.ngOnDestroy()).not.toThrow();
    expect(modalConfirms.remove).not.toHaveBeenCalled();
  });

  it('should remove itself from modalConfirms service on ngOnDestroy', () => {
    vi.spyOn(modalConfirms, 'remove');
    component.ngOnDestroy();
    expect(modalConfirms.remove).toHaveBeenCalledWith('myId');
  });

  it('should read and update all top-level configuration signal inputs', () => {
    const mockButtons = ([{}] as unknown) as ModalDialogButtonDefinition[];
    const mockTemplate = {} as TemplateRef<HTMLElement>;

    // Bulk apply all remaining unasserted signal inputs
    fixture.componentRef.setInput('buttonClass', 'btn-primary');
    fixture.componentRef.setInput('buttonText', 'Submit');
    fixture.componentRef.setInput('buttons', mockButtons);
    fixture.componentRef.setInput('isSmall', false);
    fixture.componentRef.setInput('templateHeadContent', mockTemplate);
    fixture.detectChanges();

    // Direct read assertions to force signal evaluation tracking
    expect(component.buttonClass()).toBe('btn-primary');
    expect(component.buttonText()).toBe('Submit');
    expect(component.buttons()).toBe(mockButtons);
    expect(component.isSmall()).toBe(false);
    expect(component.templateHeadContent()).toBe(mockTemplate);
  });

  it('should emit outputs and manage ViewChild when opening via keyboard triggers', () => {
    document.body.classList.remove(ModalConfirmComponent.cssClassModalLocked);

    const shownSpy = vi.fn();
    const hiddenSpy = vi.fn();

    component.onContentShown.subscribe(shownSpy);
    component.onContentHidden.subscribe(hiddenSpy);

    const focusSpy = vi.fn();
    const mockElementRef = { nativeElement: { focus: focusSpy } } as ElementRef;

    // Use defineProperty so Angular cannot overwrite our mock during detectChanges()
    Object.defineProperty(component, 'modalBtnClose', {
      get: () => mockElementRef,
      set: () => {},
      configurable: true
    });

    // Execute open path and ensure the focus spy runs
    component.open(true);
    expect(shownSpy).toHaveBeenCalled();
    expect(focusSpy).toHaveBeenCalled();

    // Redefine to undefined to evaluate the negative fallback branch
    Object.defineProperty(component, 'modalBtnClose', {
      get: () => undefined,
      configurable: true
    });
    expect(() => component.open(true)).not.toThrow();

    // Fire the close action and assert output emission
    component.close(true);
    expect(hiddenSpy).toHaveBeenCalled();
  });

  describe('Input Signal Default States', () => {
    it('should evaluate the default fallback states on unassigned signal inputs', () => {
      // Access the existing component instance generated cleanly by your global beforeEach loop
      // elements that have not been modified yet will evaluate to their fallback primitives
      expect(component.permanent()).toBe(false);

      // Asserts default title and empty string button configurations
      expect(component.title()).toBe('myTitle');
      expect(component.id()).toBe('myId');
    });
  });
});

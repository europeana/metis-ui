import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { IsScrollableDirective } from './is-scrollable.directive';

@Component({
  standalone: true,
  imports: [IsScrollableDirective],
  template: `
    <div id="parent-scroller" style="overflow: scroll; width: 100px;">
      <div #childContainer appIsScrollable exportAs="scrollInfo" style="width: 300px;">
        Mock Content Content
      </div>
    </div>
  `
})
class TestHostComponent {
  readonly scrollDirective = viewChild.required('childContainer', {
    read: IsScrollableDirective
  });
}

describe('IsScrollableDirective', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let directiveInstance: IsScrollableDirective;

  const attachedEventListeners = new Map<string, Array<Function>>();

  beforeEach(async () => {
    vi.useFakeTimers();

    // Mock ResizeObserver
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn()
    }));

    // Mock requestAnimationFrame to execute synchronously for instant assertion checks
    global.requestAnimationFrame = vi.fn().mockImplementation((cb: Function) => {
      cb();
      return 1;
    }) as any;

    attachedEventListeners.clear();

    await TestBed.configureTestingModule({
      imports: [TestHostComponent, IsScrollableDirective],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    directiveInstance = component.scrollDirective();

    const el = directiveInstance.elementRef.nativeElement;
    const parent = document.createElement('div');

    Object.defineProperty(el, 'parentNode', { value: parent, writable: true });
    Object.defineProperty(el, 'scrollWidth', { value: 300, writable: true });
    Object.defineProperty(el, 'clientWidth', { value: 300, writable: true });
    Object.defineProperty(parent, 'clientWidth', { value: 100, writable: true });
    Object.defineProperty(parent, 'clientHeight', { value: 50, writable: true });
    Object.defineProperty(parent, 'scrollLeft', { value: 0, writable: true });
    Object.defineProperty(parent, 'scrollTop', { value: 0, writable: true });

    parent.scrollTo = vi.fn().mockImplementation((options: any) => {
      parent.scrollLeft = options.left ?? parent.scrollLeft;
    });

    parent.addEventListener = vi.fn().mockImplementation((event: string, cb: Function) => {
      if (!attachedEventListeners.has(event)) {
        attachedEventListeners.set(event, []);
      }
      attachedEventListeners.get(event)!.push(cb);
    });
    parent.removeEventListener = vi.fn();

    directiveInstance.ngAfterViewInit();
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should initialize and register layout observers cleanly', () => {
    expect(directiveInstance).toBeTruthy();
    expect(global.ResizeObserver).toHaveBeenCalled();
  });

  it('should correctly evaluate indicators when scroller is at initial index root position', () => {
    directiveInstance.calc();
    expect(directiveInstance.canScrollBack()).toBe(false);
    expect(directiveInstance.canScrollFwd()).toBe(true);
  });

  it('should reactively adjust visibility criteria states when parent offset scrolls forward', () => {
    const el = directiveInstance.elementRef.nativeElement;
    el.parentNode.scrollLeft = 50;

    directiveInstance.calc();
    expect(directiveInstance.canScrollBack()).toBe(true);
    expect(directiveInstance.canScrollFwd()).toBe(true);
  });

  it('should abort calculations early if the elements are hidden or collapsed', () => {
    const el = directiveInstance.elementRef.nativeElement;
    Object.defineProperty(el.parentNode, 'clientWidth', { value: 0 });
    directiveInstance.calc();

    expect(directiveInstance.canScrollBack()).toBe(false);
  });

  // ✅ NEW TEST CASE: Validates that the frame-deferred actualScroll signal modifies properly on scroll updates
  it('should update the actualScroll signal cleanly through frame loops when parent element fires scroll events', () => {
    const parent = directiveInstance.elementRef.nativeElement.parentNode;
    parent.scrollLeft = 85;

    const scrollHandlers = attachedEventListeners.get('scroll');
    expect(scrollHandlers).toBeDefined();
    expect(scrollHandlers!.length).toBeGreaterThan(0);

    // Invoke the bound scroll listener hook directly
    scrollHandlers![0]();

    expect(directiveInstance.actualScroll()).toBe(85);
  });

  it('should navigate incremental page widths forward when executing fwd commands', () => {
    const parent = directiveInstance.elementRef.nativeElement.parentNode;
    directiveInstance.fwd();

    expect(parent.scrollTo).toHaveBeenCalledWith({
      left: 100,
      top: 0,
      behavior: 'smooth'
    });
  });

  it('should navigate incremental page widths backward when executing back commands', () => {
    const parent = directiveInstance.elementRef.nativeElement.parentNode;
    parent.scrollLeft = 150;
    directiveInstance.back();

    expect(parent.scrollTo).toHaveBeenCalledWith({
      left: 50,
      top: 0,
      behavior: 'smooth'
    });
  });

  it('should cleanly unbind observer nodes and event listeners on destruction lifecycles', () => {
    const parent = directiveInstance.elementRef.nativeElement.parentNode;
    directiveInstance.ngOnDestroy();

    expect(parent.removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
  });
});

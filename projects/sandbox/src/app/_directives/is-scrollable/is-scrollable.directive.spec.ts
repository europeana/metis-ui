import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IsScrollableDirective } from './is-scrollable.directive';

// 🚀 Create a lightweight host component to mount the original vertical directive layout safely
@Component({
  template: `
    <!-- The directive attaches to the scrollable viewport container itself -->
    <div
      appIsScrollable
      #directive="scrollInfo"
      id="scrollContainer"
      style="overflow: auto; height: 50px;"
    >
      <div id="content" style="height: 300px;"></div>
    </div>
  `,
  imports: [IsScrollableDirective],
  standalone: true
})
class HostComponent {}

describe('IsScrollableDirective (Angular Zoneless + Vitest)', () => {
  let fixture: ComponentFixture<HostComponent>;
  let directiveInstance: IsScrollableDirective;
  let scrollContainer: HTMLElement;

  beforeEach(async () => {
    // Mock MutationObserver since JSDOM does not handle full mutation pipelines natively
    global.MutationObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      disconnect: vi.fn()
    }));

    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);

    // Grab the element context that hosts our vertical scrolling directive
    scrollContainer = fixture.nativeElement.querySelector('#scrollContainer');

    // Extract the active directive instance out of the rendered fixture tree template
    const childDebugEl = fixture.debugElement.query(
      (el) => el.references['directive'] !== undefined
    );
    directiveInstance = childDebugEl.references['directive'];

    // Provide default mock vertical geometry values
    Object.defineProperty(scrollContainer, 'scrollHeight', { value: 300, configurable: true });
    Object.defineProperty(scrollContainer, 'scrollTop', {
      value: 0,
      writable: true,
      configurable: true
    });

    // Mock getBoundingClientRect to return a vertical viewport height of 50px
    vi.spyOn(scrollContainer, 'getBoundingClientRect').mockReturnValue({
      height: 50,
      width: 100,
      top: 0,
      left: 0,
      bottom: 50,
      right: 100,
      x: 0,
      y: 0,
      toJSON: () => {}
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create the directive instance and mock layout environment elements', () => {
    expect(directiveInstance).toBeTruthy();
    expect(directiveInstance.nativeElement()).toBe(scrollContainer);
  });

  it('should initialize states with canScrollBack as false and canScrollFwd as true when at the top', async () => {
    // Act: Fire lifecycle initializers
    fixture.detectChanges();

    // 🚀 CRITICAL FOR ZONELESS MICROTAKS: Allow queueMicrotask() frame blocks to execute completely
    await fixture.whenStable();

    // Verification check boundary calculations (st = 0, sh = 300, h = 50 => 300 > 0 + 50 + 1)
    expect(directiveInstance.canScrollBack()).toBe(false);
    expect(directiveInstance.canScrollFwd()).toBe(true);
  });

  it('should flip canScrollBack to true once user scrolls down past the top marker', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    // Act: Scroll down by 50px
    scrollContainer.scrollTop = 50;
    directiveInstance.calc();
    await fixture.whenStable();

    expect(directiveInstance.canScrollBack()).toBe(true);
    expect(directiveInstance.canScrollFwd()).toBe(true);
  });

  it('should calculate canScrollFwd as false when scrolling hits the absolute bottom margin', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    // Act: Move scroll position all the way down (st = 250, h = 50 => 300 total)
    scrollContainer.scrollTop = 250;
    directiveInstance.calc();
    await fixture.whenStable();

    expect(directiveInstance.canScrollBack()).toBe(true);
    expect(directiveInstance.canScrollFwd()).toBe(false);
  });

  it('should update actualScroll signal state when a native scroll event fires', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    scrollContainer.scrollTop = 125;

    // Act: Simulate a native scroll event to fire the @HostListener
    scrollContainer.dispatchEvent(new Event('scroll'));
    await fixture.whenStable();

    expect(directiveInstance.actualScroll()).toBe(125);
  });

  it('should cleanly disconnect the MutationObserver tracker on element destruction', () => {
    fixture.detectChanges();

    const disconnectSpy = vi.spyOn((directiveInstance as any).observer, 'disconnect');

    // Act: Terminate component life phase
    directiveInstance.ngOnDestroy();

    expect(disconnectSpy).toHaveBeenCalledTimes(1);
  });
});

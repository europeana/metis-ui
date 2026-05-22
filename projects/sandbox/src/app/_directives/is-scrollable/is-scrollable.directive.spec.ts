import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { IsScrollableDirective } from './is-scrollable.directive';

// 🚀 Create a lightweight host component to mount the structural layout directive safely
@Component({
  template: `
    <div id="parent" style="overflow: auto; width: 100px;">
      <div appIsScrollable #directive="scrollInfo" id="child" style="width: 300px;"></div>
    </div>
  `,
  imports: [IsScrollableDirective],
  standalone: true
})
class HostComponent {}

describe('IsScrollableDirective (Angular Zoneless + Vitest)', () => {
  let fixture: ComponentFixture<HostComponent>;
  let directiveInstance: IsScrollableDirective;
  let parentEl: HTMLElement;
  let childEl: HTMLElement;

  beforeEach(async () => {
    vi.useFakeTimers();

    // Mock modern window animation loop APIs to fire callbacks instantly
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });

    // Mock ResizeObserver globally since JSDOM does not provide it out of the box
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn()
    }));

    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);

    // Grab explicit DOM node context references out of the rendered fixture markup tree
    parentEl = fixture.nativeElement.querySelector('#parent');
    childEl = fixture.nativeElement.querySelector('#child');

    // Extract the active structural directive context query boundary
    const childDebugEl = fixture.debugElement.query(
      (el) => el.references['directive'] !== undefined
    );
    directiveInstance = childDebugEl.references['directive'];

    // Provide default numeric layout geometry dimensions
    Object.defineProperty(parentEl, 'clientWidth', { value: 100, configurable: true });
    Object.defineProperty(parentEl, 'clientHeight', { value: 50, configurable: true });
    Object.defineProperty(childEl, 'clientWidth', { value: 300, configurable: true });
    Object.defineProperty(childEl, 'scrollWidth', { value: 300, configurable: true });
    parentEl.scrollLeft = 0;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should create the directive instance and mock layout environment elements', () => {
    expect(directiveInstance).toBeTruthy();
    expect(directiveInstance.nativeElement()).toBe(childEl);
  });

  it('should initialize states with canScrollBack as false and canScrollFwd as true when at the beginning', async () => {
    // Act: Fire lifecycle initializers
    fixture.detectChanges();
    await TestBed.flushEffects();

    // Assertments check clamping boundary calculations (sl = 0, sw = 300, w = 100)
    expect(directiveInstance.canScrollBack()).toBe(false);
    expect(directiveInstance.canScrollFwd()).toBe(true);
  });

  it('should flip canScrollBack to true once user navigates past the starting point boundary', async () => {
    fixture.detectChanges();
    await TestBed.flushEffects();

    // Act: Set mock parent container container scrolling metrics past 0 offset markers
    parentEl.scrollLeft = 50;
    directiveInstance.calc();
    await TestBed.flushEffects();

    expect(directiveInstance.canScrollBack()).toBe(true);
    expect(directiveInstance.canScrollFwd()).toBe(true);
  });

  it('should calculate canScrollFwd as false when scrolling hits the absolute layout end margin', async () => {
    fixture.detectChanges();
    await TestBed.flushEffects();

    // Act: Move parent container all the way to its maximum width boundary bounds (sl = 200, w = 100 => 300 total)
    parentEl.scrollLeft = 200;
    directiveInstance.calc();
    await TestBed.flushEffects();

    expect(directiveInstance.canScrollBack()).toBe(true);
    expect(directiveInstance.canScrollFwd()).toBe(false);
  });

  it('should respond to debounced calculation streams when ResizeObserver triggers window modifications', async () => {
    fixture.detectChanges();
    await TestBed.flushEffects();

    // Clear initial lifecycle call indicators
    directiveInstance.canScrollBack.set(false);
    parentEl.scrollLeft = 20;

    // Trigger internal loop function
    (directiveInstance as any).debouncedCalc();

    // Verify properties haven't moved yet due to the 16ms calculation debounce window filter
    expect(directiveInstance.canScrollBack()).toBe(false);

    // Act: Run timers through the macro task runner cleanly
    vi.runAllTimers();
    await TestBed.flushEffects();

    expect(directiveInstance.canScrollBack()).toBe(true);
  });

  it('should dispatch window scrollTo directives smoothly when calling nav helper metrics', () => {
    const scrollToSpy = vi.spyOn(parentEl, 'scrollTo').mockImplementation(() => {});
    fixture.detectChanges();

    // Act: Advance layout pagination window forward by 1 container unit width
    directiveInstance.fwd();

    expect(scrollToSpy).toHaveBeenCalledWith({
      left: 100, // current scrollLeft (0) + 1 * clientWidth (100)
      top: 0,
      behavior: 'smooth'
    });
  });

  it('should navigate backward safely when back parameters trigger layout modifications', () => {
    const scrollToSpy = vi.spyOn(parentEl, 'scrollTo').mockImplementation(() => {});
    fixture.detectChanges();
    parentEl.scrollLeft = 150;

    // Act: Drop container viewport matrix back by 1 parent frame block unit width
    directiveInstance.back();

    expect(scrollToSpy).toHaveBeenCalledWith({
      left: 50, // current scrollLeft (150) - 1 * clientWidth (100)
      top: 0,
      behavior: 'smooth'
    });
  });

  it('should update actualScroll signal state when a native DOM scroll event fires', async () => {
    fixture.detectChanges();
    await TestBed.flushEffects();

    parentEl.scrollLeft = 75;

    // Act: Dispatch native event handler trigger downwards into listeners manually
    parentEl.dispatchEvent(new Event('scroll'));
    await TestBed.flushEffects();

    expect(directiveInstance.actualScroll()).toBe(75);
  });

  it('should cleanly disconnect trackers and detach event listener loops on element destruction', () => {
    fixture.detectChanges();

    const disconnectSpy = vi.spyOn((directiveInstance as any).resizeObserver, 'disconnect');
    const removeListenerSpy = vi.spyOn(parentEl, 'removeEventListener');

    // Act: Terminate component life phase
    directiveInstance.ngOnDestroy();

    expect(disconnectSpy).toHaveBeenCalledTimes(1);
    expect(removeListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
  });
});

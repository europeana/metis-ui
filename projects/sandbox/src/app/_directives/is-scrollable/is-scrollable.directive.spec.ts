import { Component, CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IsScrollableDirective } from '.';

@Component({
  standalone: true,
  imports: [IsScrollableDirective],
  template: `
    <div>
      <div class="scrollable" appIsScrollable #scrollInfo="scrollInfo">
        <div class="item">Hello</div>
      </div>
      <div class="output-1">{{ scrollInfo.canScrollFwd() }}</div>
      <div class="output-2">{{ scrollInfo.canScrollBack() }}</div>
    </div>
  `
})
class TestIsScrollableDirectiveComponent {}

describe('IsScrollableDirective', () => {
  let fixture: ComponentFixture<TestIsScrollableDirectiveComponent>;
  let elScrollable: HTMLElement;
  let elOutput1: HTMLElement;
  let elOutput2: HTMLElement;

  // Helper function to bypass JSDOM limitations
  const setDimensions = (scrollHeight: number, clientHeight: number, scrollTop: number = 0) => {
    Object.defineProperty(elScrollable, 'scrollHeight', {
      configurable: true,
      value: scrollHeight
    });
    Object.defineProperty(elScrollable, 'clientHeight', {
      configurable: true,
      value: clientHeight
    });
    Object.defineProperty(elScrollable, 'scrollTop', { configurable: true, value: scrollTop });
  };

  beforeAll(() => {
    global.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
      imports: [TestIsScrollableDirectiveComponent, IsScrollableDirective],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(TestIsScrollableDirectiveComponent);

    // 1. MUST detect changes first to render the template
    fixture.detectChanges();

    // 2. Now these will find the elements
    elScrollable = fixture.nativeElement.querySelector('.scrollable');
    elOutput1 = fixture.nativeElement.querySelector('.output-1');
    elOutput2 = fixture.nativeElement.querySelector('.output-2');
  });

  it('should re-calculate on scroll', async () => {
    // 1. Mock the dimensions
    setDimensions(1000, 100, 0); // scrollHeight: 1000, clientHeight: 100

    // 2. Trigger scroll
    elScrollable.dispatchEvent(new Event('scroll'));

    // 3. The magic combo for Directive + Signals + Zoneless
    TestBed.flushEffects(); // Process the signal changes internally

    // Wait for the requestAnimationFrame in your directive
    await new Promise((resolve) => requestAnimationFrame(resolve));

    fixture.detectChanges(); // Render signal values to the template

    // 4. Use textContent instead of innerText
    expect(elOutput1?.textContent?.trim()).toBe('true');
    expect(elOutput2?.textContent?.trim()).toBe('false');
  });
});

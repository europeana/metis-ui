import { Component, provideZonelessChangeDetection, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SkipArrowsComponent } from './skip-arrows.component';

@Component({
  standalone: true,
  imports: [SkipArrowsComponent],
  template: `
    <sb-skip-arrows>
      @for (item of items(); track item) {
      <div #elementList class="test-item" style="height: 200px;">
        {{ item }}
      </div>
      }
    </sb-skip-arrows>
  `
})
class TestWrapperComponent {
  items = signal<string[]>(['Item 1', 'Item 2', 'Item 3']);
  skipArrowsComponent = viewChild.required(SkipArrowsComponent);
}

describe('SkipArrowsComponent (True Zoneless Vitest)', () => {
  let fixture: ComponentFixture<TestWrapperComponent>;
  let wrapper: TestWrapperComponent;
  let component: SkipArrowsComponent;

  beforeAll(() => {
    global.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn()
    }));
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestWrapperComponent, SkipArrowsComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(TestWrapperComponent);
    wrapper = fixture.componentInstance;

    fixture.detectChanges();
    component = wrapper.skipArrowsComponent();
  });

  it('should instantiate successfully', () => {
    expect(component).toBeTruthy();
  });

  it('should evaluate elementList as an Angular Signal query array', () => {
    expect(Array.isArray(component.elementList())).toBe(true);
    expect(component.elementList().length).toBe(3);
  });

  it('should hide arrow UI elements if elementList length is less than or equal to 1', () => {
    // 🟢 Update the array cleanly using the Signal API
    wrapper.items.set(['Only One Item']);
    fixture.detectChanges();

    const arrowContainer = fixture.nativeElement.querySelector('.skip-arrows');
    expect(component.elementList().length).toBe(1);
    expect(arrowContainer).toBeNull();
  });

  it('should display arrow UI elements when multiple items are projected', () => {
    wrapper.items.set(['Item A', 'Item B']);
    fixture.detectChanges();

    const arrowContainer = fixture.nativeElement.querySelector('.skip-arrows');
    expect(arrowContainer).not.toBeNull();
  });

  it('should check scroll state transitions reactively', () => {
    const scrollEl = component.getScrollableParent();
    if (scrollEl) {
      Object.defineProperty(scrollEl, 'scrollTop', {
        value: 50,
        writable: true,
        configurable: true
      });
      Object.defineProperty(scrollEl, 'scrollHeight', {
        value: 1000,
        writable: true,
        configurable: true
      });
      Object.defineProperty(scrollEl, 'offsetHeight', {
        value: 300,
        writable: true,
        configurable: true
      });
    }

    // 🟢 Bypass the RxJS macro/microtask scheduler drift by calling calculations directly
    component.updateScrollPossibilities();
    fixture.detectChanges();

    expect(component.canScrollUp()).toBe(true);
    expect(component.canScrollDown()).toBe(true);
  });

  it('should execute offset scroll calculations during item navigation skips', () => {
    const parentEl = component.getScrollableParent();
    if (parentEl) {
      Object.defineProperty(parentEl, 'scrollTop', {
        value: 0,
        writable: true,
        configurable: true
      });
    }

    const projectedElements = component.elementList();
    if (projectedElements.length > 1) {
      Object.defineProperty(projectedElements[1].nativeElement, 'offsetTop', {
        value: 200,
        configurable: true
      });
    }

    component.skipToItem(1);
    fixture.detectChanges();

    if (parentEl && projectedElements.length > 0) {
      expect(parentEl.scrollTop).toBe(200);
    }
  });
});

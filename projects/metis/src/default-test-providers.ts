import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

if (typeof window !== 'undefined') {
  const originalCreateRange = window.document.createRange;
  window.document.createRange = function(...args: unknown[]): Range {
    const range = originalCreateRange.apply(this, args);

    if (!range.getBoundingClientRect) {
      range.getBoundingClientRect = (): DOMRect =>
        ({
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          width: 0,
          height: 0,
          x: 0,
          y: 0
        } as DOMRect);
    }

    if (!range.getClientRects) {
      range.getClientRects = (): DOMRectList =>
        (({
          length: 0,
          item: (): null => null,
          [Symbol.iterator]: (): IterableIterator<DOMRect> => [][Symbol.iterator]()
        } as unknown) as DOMRectList);
    }

    return range;
  };
}

if (typeof window !== 'undefined') {
  if (!Object.getOwnPropertyDescriptor(navigator, 'clipboard')) {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: (): Promise<void> => Promise.resolve() },
      configurable: true,
      writable: true
    });
  }
}

export default [provideZonelessChangeDetection(), provideHttpClient()];

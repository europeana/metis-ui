import { Pipe, PipeTransform } from '@angular/core';

export function createMockPipe(name: string): new () => PipeTransform {
  class MockPipe implements PipeTransform {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transform(...args: any[]): string {
      return `${name}(${args.join(',')})`;
    }
  }

  // see node_modules/@angular/core/src/util/decorators.d.ts for the names of the annotations properties
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (MockPipe as any).__annotations__ = [new Pipe({ name })];

  return MockPipe;
}

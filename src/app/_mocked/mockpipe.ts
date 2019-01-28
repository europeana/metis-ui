import { Pipe, PipeTransform } from '@angular/core';

export function createMockPipe(name: string): new () => PipeTransform {
  class MockPipe implements PipeTransform {
    // tslint:disable-next-line: no-any
    transform(...args: any[]): string {
      return `${name}(${args.join(',')})`;
    }
  }

  // see node_modules/@angular/core/src/util/decorators.d.ts for the names of the annotations properties
  // tslint:disable-next-line: no-any
  (MockPipe as any).__annotations__ = [new Pipe({ name })];

  return MockPipe;
}

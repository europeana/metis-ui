import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { SandboxConfService } from './';

describe('SandboxConfService', () => {
  let service: SandboxConfService;

  const configureTestbed = (): void => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
    service = TestBed.inject(SandboxConfService);
  };

  describe('Normal Operations', () => {
    beforeEach(() => {
      configureTestbed();
    });

    it('should create', () => {
      expect(service).toBeTruthy();
    });

    it('should get the conf', () => {
      expect(service.getConf()).toBeTruthy();
    });

    it('should toggle the ancestor-mode', () => {
      expect(service.isAncestorMode()).toBeFalsy();
      service.toggleAncestorMode('');
      expect(service.isAncestorMode()).toBeTruthy();
      service.toggleAncestorMode('');
      expect(service.isAncestorMode()).toBeFalsy();
    });
  });
});

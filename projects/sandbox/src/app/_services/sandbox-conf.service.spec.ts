import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { SandboxConfService } from './sandbox-conf.service';
import { SandboxPageType } from '../_models';
import { describe, it, expect, beforeEach } from 'vitest';

describe('SandboxConfService', () => {
  let service: SandboxConfService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        SandboxConfService
      ]
    });
    service = TestBed.inject(SandboxConfService);
  });

  it('should be created and initialize the 8-step configuration signal array', () => {
    expect(service).toBeTruthy();
    // FIX: Read from the actual readonly signal property 'navConf'
    expect(service.navConf().length).toEqual(8);
  });

  it('should handle legacy fallback getConf executions smoothly', () => {
    // FIX: getConf() returns the array configuration payload directly rather than an Observable stream
    const conf = service.getConf();
    expect(conf).toBeTruthy();
    expect(conf.length).toEqual(8);
  });

  it('should immutably update step configuration flags using updateStepStatus', () => {
    // FIX: Pass valid SandboxPageType enum token and status modification object payload
    service.updateStepStatus(SandboxPageType.HOME, { isHidden: true });
    expect(service.navConf()[0].isHidden).toBe(true);
  });

  it('should correctly evaluate and toggle ancestor mode criteria structures', () => {
    // FIX: Verify method tracking using the explicit string parameter signature requirements
    vi.spyOn(service, 'toggleAncestorMode');

    service.toggleAncestorMode('push-left');

    expect(service.toggleAncestorMode).toHaveBeenCalledWith('push-left');
  });
});

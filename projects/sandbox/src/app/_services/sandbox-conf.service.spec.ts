import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { SandboxConfService } from './sandbox-conf.service';
import { SandboxPageType } from '../_models';

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
    expect(service.navConf().length).toEqual(8);
  });

  it('should handle legacy fallback getConf executions smoothly', () => {
    const conf = service.getConf();
    expect(conf).toBeTruthy();
    expect(conf.length).toEqual(8);
  });

  it('should immutably update step configuration flags using updateStepStatus', () => {
    service.updateStepStatus(SandboxPageType.HOME, { isHidden: true });
    expect(service.navConf()[0].isHidden).toBe(true);
  });

  it('should dynamically manage ancestor mode and toggle progress step parameters', () => {
    // 1. Initial State Baseline
    expect(service.isAncestorMode()).toBe(false);

    // 2. Act: Toggle Ancestor Mode on with alignment positioning
    service.toggleAncestorMode('push-left');

    // Assert: Check that the alignment activated and the progress step received it
    expect(service.isAncestorMode()).toBe(true);

    const progressStep = service.navConf()[2];
    expect(progressStep.stepSubTitle).toBe(true);
    expect(progressStep.stepSubClass).toBe('ancestor-mode push-left');
    expect(progressStep.stepSubTitleClick).toBeTypeOf('function');

    // 3. Act: Toggle Ancestor Mode back off
    service.toggleAncestorMode('push-left');

    // Assert: Everything should clear back to undefined baseline settings
    const clearedStep = service.navConf()[2];
    expect(clearedStep.stepSubTitle).toBeUndefined();
    expect(clearedStep.stepSubClass).toBeUndefined();
    expect(clearedStep.stepSubTitleClick).toBeUndefined();
  });

  it('should dynamically alter sub-class alignment parameters via setAncestorAlignment', () => {
    // Manually force stepSubTitle to be active so setAncestorAlignment passes internal validation guards
    service.updateStepStatus(SandboxPageType.PROGRESS_TRACK, { stepSubTitle: true });

    service.setAncestorAlignment('push-right');

    expect(service.navConf()[2].stepSubClass).toBe('ancestor-mode push-right');
    expect(service.isAncestorMode()).toBe(true);
  });

  it('should execute handleToggleExecution when stepSubTitleClick is invoked', () => {
    service.toggleAncestorMode('push-left');

    const progressStep = service.navConf()[2];
    expect(progressStep.stepSubTitleClick).toBeTypeOf('function');

    if (progressStep.stepSubTitleClick) {
      progressStep.stepSubTitleClick();
    }

    expect(service.navConf()[2].stepSubTitleClick).toBeUndefined();
  });
});

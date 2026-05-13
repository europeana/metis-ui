import { TestBed } from '@angular/core/testing';
import { SandboxConfService } from './sandbox-conf.service';
import { SandboxPageType } from '../_models';
import { expect, describe, it, beforeEach, vi } from 'vitest';

describe('SandboxConfService', () => {
  let service: SandboxConfService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SandboxConfService]
    });
    service = TestBed.inject(SandboxConfService);
  });

  it('should be created and initialize the 8-step configuration signal array', () => {
    expect(service).toBeTruthy();

    // Evaluate the exposed read-only Signal stream directly
    const currentConf = service.navConf();

    expect(currentConf).toBeDefined();
    expect(currentConf.length).toBe(8);
    expect(currentConf[0].stepType).toBe(SandboxPageType.HOME);
    expect(currentConf[2].stepType).toBe(SandboxPageType.PROGRESS_TRACK);
  });

  it('should handle legacy fallback getConf executions smoothly', () => {
    const fallbackConf = service.getConf();
    expect(fallbackConf.length).toBe(8);
    expect(fallbackConf[0].stepTitle).toBe('Home');
  });

  it('should immutably update step configuration flags using updateStepStatus', () => {
    // 1. Initial State Check (Default state should be hidden and not busy)
    let progressStep = service.navConf().find((s) => s.stepType === SandboxPageType.PROGRESS_TRACK);
    expect(progressStep?.isHidden).toBe(true);
    expect(progressStep?.isBusy).toBeFalsy();

    // 2. Act: Trigger an immutable state update transaction channel
    service.updateStepStatus(SandboxPageType.PROGRESS_TRACK, {
      isHidden: false,
      isBusy: true,
      isPolling: true,
      lastLoadedIdDataset: '90'
    });

    // 3. Assert: Verify the fresh array reference notified the signal tracking pipeline
    progressStep = service.navConf().find((s) => s.stepType === SandboxPageType.PROGRESS_TRACK);
    expect(progressStep).toBeDefined();
    expect(progressStep?.isHidden).toBe(false);
    expect(progressStep?.isBusy).toBe(true);
    expect(progressStep?.isPolling).toBe(true);
    expect(progressStep?.lastLoadedIdDataset).toBe('90');
  });

  it('should correctly evaluate and toggle ancestor mode criteria structures', () => {
    // 1. Initially ancestor mode should be false
    expect(service.isAncestorMode()).toBe(false);

    // 2. Act: Set ancestor alignment properties explicitly
    // This updates the internal signal state dynamically via updateStepStatus internally
    service.updateStepStatus(SandboxPageType.PROGRESS_TRACK, { stepSubTitle: true });
    service.setAncestorAlignment('left');

    // 3. Assert: The subClass rule matching ANCESTOR_MODE should now evaluate to true
    expect(service.isAncestorMode()).toBe(true);
    expect(service.navConf()[2].stepSubClass).toBe('ancestor-mode left');

    // 4. Act: Toggle the mode to clear out subClass parameters immutably
    service.toggleAncestorMode('left');
    expect(service.isAncestorMode()).toBe(false);
    expect(service.navConf()[2].stepSubTitle).toBeUndefined();
    expect(service.navConf()[2].stepSubClass).toBeUndefined();

    // 5. Act: Toggle it once more to verify the programmatic functional callback reference attachment
    service.toggleAncestorMode('right');
    const updatedStep = service.navConf()[2];
    expect(service.isAncestorMode()).toBe(true);
    expect(updatedStep.stepSubTitle).toBe(true);
    expect(updatedStep.stepSubClass).toBe('ancestor-mode right');
    expect(typeof updatedStep.stepSubTitleClick).toBe('function');
  });
});

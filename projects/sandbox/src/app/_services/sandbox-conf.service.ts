import { Injectable, signal } from '@angular/core';
import { FixedLengthArray, SandboxPage, SandboxPageType } from '../_models';

@Injectable({ providedIn: 'root' })
export class SandboxConfService {
  readonly ANCESTOR_MODE = 'ancestor-mode';

  // 1. Maintain the layout configuration array state as a private, writable Signal
  private readonly _navConf = signal<FixedLengthArray<SandboxPage, 8>>([
    { stepTitle: 'Home', stepType: SandboxPageType.HOME, isHidden: true },
    { stepTitle: 'Upload Dataset', stepType: SandboxPageType.UPLOAD, isHidden: true },
    { stepTitle: 'Dataset Processing', stepType: SandboxPageType.PROGRESS_TRACK, isHidden: true },
    {
      stepTitle: 'Problem Patterns (Dataset)',
      stepType: SandboxPageType.PROBLEMS_DATASET,
      isHidden: true
    },
    { stepTitle: 'Record Report', stepType: SandboxPageType.REPORT, isHidden: true },
    {
      stepTitle: 'Problem Patterns (Record)',
      stepType: SandboxPageType.PROBLEMS_RECORD,
      isHidden: true
    },
    { stepTitle: 'Privacy Statement', stepType: SandboxPageType.PRIVACY_STATEMENT, isHidden: true },
    { stepTitle: 'Cookie Policy', stepType: SandboxPageType.COOKIE_POLICY, isHidden: true }
  ]);

  // 2. Expose an un-mutable read-only Signal property stream for your components
  public readonly navConf = this._navConf.asReadonly();

  // Legacy fallback descriptor hook for components yet to be fully refactored
  getConf(): FixedLengthArray<SandboxPage, 8> {
    return this._navConf();
  }

  /**
   * updateStepStatus
   * Immutably updates the fields of a specific page configuration step type
   **/
  public updateStepStatus(
    pageType: SandboxPageType,
    status: Partial<SandboxPage> & { isBusy?: boolean; isPolling?: boolean }
  ): void {
    this._navConf.update((currentConf) => {
      // Shallow clone the array to change its memory address reference
      const nextConf = ([...currentConf] as unknown) as FixedLengthArray<SandboxPage, 8>;
      const targetIdx = nextConf.findIndex((step) => step.stepType === pageType);

      if (targetIdx !== -1) {
        // Clone and merge the target configuration parameters step object immutably
        nextConf[targetIdx] = {
          ...nextConf[targetIdx],
          ...status
        };
      }
      return nextConf;
    });
  }

  // --- Ancestor Utilities (Refactored to evaluate signals safely) ---

  isAncestorMode(): boolean {
    return (this._navConf()[2].stepSubClass ?? '').includes(this.ANCESTOR_MODE);
  }

  setAncestorAlignment(alignment: string): void {
    if (this._navConf()[2].stepSubTitle) {
      this.updateStepStatus(SandboxPageType.PROGRESS_TRACK, {
        stepSubClass: `${this.ANCESTOR_MODE} ${alignment}`
      });
    }
  }

  toggleAncestorMode(alignment: string): void {
    const progressStep = this._navConf()[2];

    if (progressStep.stepSubTitle) {
      this.updateStepStatus(SandboxPageType.PROGRESS_TRACK, {
        stepSubTitle: undefined,
        stepSubClass: undefined,
        stepSubTitleClick: undefined
      });
    } else {
      this.updateStepStatus(SandboxPageType.PROGRESS_TRACK, {
        stepSubTitle: true,
        stepSubClass: `${this.ANCESTOR_MODE} ${alignment}`,
        stepSubTitleClick: () => this.toggleAncestorMode(alignment) // ✅ Safe context reference instead of .bind(this)
      });
    }
  }
}

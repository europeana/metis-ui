import { Injectable, signal } from '@angular/core';
import { FixedLengthArray, SandboxPage, SandboxPageType } from '../_models';

@Injectable({ providedIn: 'root' })
export class SandboxConfService {
  private readonly _ancestorModeBase = signal<string>('ancestor-mode');

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

  public readonly navConf = this._navConf.asReadonly();

  getConf(): FixedLengthArray<SandboxPage, 8> {
    return this._navConf();
  }

  public updateStepStatus(
    pageType: SandboxPageType,
    status: Partial<SandboxPage> & { isBusy?: boolean; isPolling?: boolean }
  ): void {
    this._navConf.update((currentConf) => {
      const nextConf = ([...currentConf] as unknown) as FixedLengthArray<SandboxPage, 8>;
      const targetIdx = nextConf.findIndex((step) => step.stepType === pageType);

      if (targetIdx !== -1) {
        nextConf[targetIdx] = {
          ...nextConf[targetIdx],
          ...status
        };
      }
      return nextConf;
    });
  }

  isAncestorMode(): boolean {
    return (this._navConf()[2].stepSubClass ?? '').includes('ancestor-mode');
  }

  setAncestorAlignment(alignment: string): void {
    const modeString = `ancestor-mode ${alignment}`;
    this._ancestorModeBase.set(modeString);

    if (this._navConf()[2].stepSubTitle) {
      this.updateStepStatus(SandboxPageType.PROGRESS_TRACK, {
        stepSubClass: modeString
      });
    }
  }

  toggleAncestorMode(alignment: string): void {
    const progressStep = this._navConf()[2];
    const modeString = `ancestor-mode ${alignment}`;
    this._ancestorModeBase.set(modeString);

    if (progressStep.stepSubTitle) {
      this.updateStepStatus(SandboxPageType.PROGRESS_TRACK, {
        stepSubTitle: undefined,
        stepSubClass: undefined,
        stepSubTitleClick: undefined
      });
    } else {
      this.updateStepStatus(SandboxPageType.PROGRESS_TRACK, {
        stepSubTitle: true,
        stepSubClass: modeString,
        stepSubTitleClick: () => this.handleToggleExecution(alignment)
      });
    }
  }

  private handleToggleExecution(alignment: string): void {
    this.toggleAncestorMode(alignment);
  }
}

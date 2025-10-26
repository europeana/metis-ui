import { Injectable } from '@angular/core';
import { FixedLengthArray, SandboxPage, SandboxPageType } from '../_models';

@Injectable({ providedIn: 'root' })
export class SandboxConfService {
  sandboxNavConf: FixedLengthArray<SandboxPage, 8> = [
    {
      stepTitle: 'Home',
      stepType: SandboxPageType.HOME,
      isHidden: true
    },
    {
      stepTitle: 'Upload Dataset',
      stepType: SandboxPageType.UPLOAD,
      isHidden: true
    },
    {
      stepTitle: 'Dataset Processing',
      stepType: SandboxPageType.PROGRESS_TRACK,
      isHidden: true
    },
    {
      stepTitle: 'Problem Patterns (Dataset)',
      stepType: SandboxPageType.PROBLEMS_DATASET,
      isHidden: true
    },
    {
      stepTitle: 'Record Report',
      stepType: SandboxPageType.REPORT,
      isHidden: true
    },
    {
      stepTitle: 'Problem Patterns (Record)',
      stepType: SandboxPageType.PROBLEMS_RECORD,
      isHidden: true
    },
    {
      stepTitle: 'Privacy Statement',
      stepType: SandboxPageType.PRIVACY_STATEMENT,
      isHidden: true
    },
    {
      stepTitle: 'Cookie Policy',
      stepType: SandboxPageType.COOKIE_POLICY,
      isHidden: true
    }
  ];

  getConf(): FixedLengthArray<SandboxPage, 8> {
    return this.sandboxNavConf;
  }

  isAncestorMode(): boolean {
    return this.sandboxNavConf[2].stepSubClass === 'ancestor-mode';
  }

  toggleAncestorMode(): void {
    if (this.sandboxNavConf[2].stepSubTitle) {
      this.sandboxNavConf[2].stepSubTitle = undefined;
      this.sandboxNavConf[2].stepSubClass = undefined;
      this.sandboxNavConf[2].stepSubTitleClick = undefined;
    } else {
      this.sandboxNavConf[2].stepSubTitle = 'Re-Runs';
      this.sandboxNavConf[2].stepSubClass = 'ancestor-mode';
      this.sandboxNavConf[2].stepSubTitleClick = this.toggleAncestorMode.bind(this);
    }
  }
}

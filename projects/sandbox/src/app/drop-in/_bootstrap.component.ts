import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { mockUserDatasets } from '../_mocked';

/** Temporary class to preview UX for drop-in without nline data being available
 **/
@Component({
  imports: [CommonModule],
  template: ''
})
export class DropInBootstrap {
  ngAfterViewInit() {
    const env = (window as any).__env;
    env['test-user-datasets'] = mockUserDatasets;
    setTimeout(() => {
      (document.querySelector('.progress-orb') as HTMLElement).click();
    }, 0);
  }
}

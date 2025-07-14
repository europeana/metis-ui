import { Component } from '@angular/core';

@Component({
  selector: 'sb-pie-chart',
  template: ''
})
export class MockPieComponent {
  chart = {
    options: {},
    data: [],
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    update: (): void => {}
  };

  getContextIfReady(): HTMLElement | undefined {
    console.log('mock pie get ctxt');
    return ({} as unknown) as HTMLElement;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  drawChart(): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  resizeChart(): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setPieSelection(): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  ngAfterContentChecked(): void {}
}

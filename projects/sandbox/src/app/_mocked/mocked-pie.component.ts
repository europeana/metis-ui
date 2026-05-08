import { Component, input, output } from '@angular/core';

@Component({
  selector: 'sb-pie-chart',
  template: ''
})
export class MockPieComponent {
  pieCanvas = input<any>();
  pieLabels = input<any>();
  piePercentages = input<any>();
  pieDimension = input<any>();
  pieData = input<any>();

  pieSelectionSet = output<any>();

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
  setPieSelection(_: any, __ = false): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  ngAfterContentChecked(): void {}
}

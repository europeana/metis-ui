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

    update: (): void => {}
  };

  getContextIfReady(): HTMLElement | undefined {
    console.log('mock pie get ctxt');
    return ({} as unknown) as HTMLElement;
  }

  drawChart(): void {}

  resizeChart(): void {}

  setPieSelection(_: any, __ = false): void {}

  ngAfterContentChecked(): void {}
}

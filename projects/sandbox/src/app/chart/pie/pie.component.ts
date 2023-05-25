import { AfterContentInit, Component, ElementRef, Input } from '@angular/core';
import { Chart, ChartItem, LegendItem } from 'chart.js';

@Component({
  selector: 'sb-pie-chart',
  templateUrl: './pie.component.html',
  styleUrls: ['./pie.component.scss']
})
export class PieComponent implements AfterContentInit {
  @Input() colours: Array<string> = [
    '#219d31',
    '#bde2c2',
    '#37b98b',
    '#197324',
    '#155819',
    '#7ed4b6',
    '#135116',
    '#a5e4ce'
  ];

  _pieLabels: Array<string>;

  @Input() set pieLabels(labels: Array<string>) {
    this._pieLabels = labels;
    this.drawChart();
  }

  get pieLabels(): Array<string> {
    return this._pieLabels;
  }

  @Input() pieData: Array<number>;
  @Input() pieCanvas: ElementRef;
  @Input() pieDimension = '';

  legendItems: Array<LegendItem> = [];
  ready = false;
  chart: Chart;

  ngAfterContentInit(): void {
    this.drawChart();
  }

  /**
   * drawChart
   * Draws or updates chart if requirements are present
   **/
  drawChart(): void {
    const ctx = this.pieCanvas.nativeElement;
    if (!ctx) {
      console.log('chart error: no drawing context');
      return;
    }
    if (!this.pieLabels) {
      console.log('chart error: no labels');
      return;
    }
    if (!this.pieData) {
      console.log('chart error: no data');
      return;
    }

    const chartData = {
      labels: this.pieLabels,
      datasets: [
        {
          backgroundColor: this.colours,
          data: this.pieData
        }
      ]
    };

    if (this.chart) {
      this.chart.data = chartData;
      this.chart.update();
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;

    this.chart = new Chart(ctx as ChartItem, {
      type: 'doughnut',
      data: chartData,
      plugins: [
        {
          id: 'htmlLegend',
          afterUpdate(chart: Chart): void {
            const fnLabels = chart.options.plugins!.legend!.labels!.generateLabels;
            if (fnLabels) {
              that.legendItems = fnLabels(chart);
            }
          }
        }
      ],
      options: {
        responsive: true,
        onResize: this.resizeChart,
        resizeDelay: 100,
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }

  /**
   * resizeChart
   * Responsive utility to resize canvas
   * @param { Chart } chart
   **/
  resizeChart(chart: Chart): void {
    const width = parseInt(getComputedStyle(chart.canvas.parentNode as HTMLElement).width);
    if (!isNaN(width)) {
      chart.resize(width, width);
    }
  }
}

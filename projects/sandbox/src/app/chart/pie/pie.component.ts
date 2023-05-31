import { AfterContentInit, Component, ElementRef, Input } from '@angular/core';
import { BubbleDataPoint, Chart, ChartItem, LegendItem, ScatterDataPoint } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

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

  @Input() piePercentages: { [key: number]: string };

  @Input() pieCanvas: ElementRef;
  @Input() pieDimension = '';
  @Input() visible = false;

  legendItems: Array<LegendItem> = [];
  ready = false;
  chart: Chart;

  ngAfterContentInit(): void {
    this.drawChart();
  }

  /**
   * getPercentageValue
   * Template utility to access piePercentages hashmap
   **/
  getPercentageValue(key: number | ScatterDataPoint | BubbleDataPoint | null): string {
    return this.piePercentages[(key as unknown) as number];
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
    if (!this.piePercentages) {
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
        ChartDataLabels,
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
        plugins: {
          legend: {
            display: false
          },
          datalabels: {
            color: 'white',
            font: {
              size: 15
            },
            formatter: (value: number): string => {
              return this.piePercentages[value];
            }
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
      if (width > 0) {
        chart.resize(width, width);
      }
    }
  }
}

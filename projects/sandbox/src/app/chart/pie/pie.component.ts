import { Component, ElementRef, Input } from '@angular/core';
import { BubbleDataPoint, Chart, ChartItem, LegendItem, ScatterDataPoint } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

@Component({
  selector: 'sb-pie-chart',
  templateUrl: './pie.component.html',
  styleUrls: ['./pie.component.scss']
})
export class PieComponent {
  _pieLabels: Array<string>;
  _pieData: Array<number>;

  @Input() set pieLabels(labels: Array<string>) {
    this._pieLabels = labels;
  }

  get pieLabels(): Array<string> {
    return this._pieLabels;
  }

  @Input() set pieData(data: Array<number>) {
    if (data) {
      this._pieData = data;
      this.drawChart();
    }
  }

  get pieData(): Array<number> {
    return this._pieData;
  }

  @Input() piePercentages: { [key: number]: string };
  @Input() pieCanvas: ElementRef;
  @Input() pieDimension = '';
  @Input() visible = false;

  legendItems: Array<LegendItem> = [];
  ready = false;
  chart: Chart;
  colours: Array<string> = [
    '#effcf1',
    '#caf4d0',
    '#95e9a0',
    '#60dd71',
    '#2cd142',
    '#219d31',
    '#1e8c2c',
    '#1a7d28',
    '#176d23',
    '#145d1e',
    '#114e19'
  ];

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
          data: this.pieData,
          borderColor: '#219d31',
          borderWidth: 1
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
            color: (context: { dataIndex: number }): string => {
              if (context.dataIndex > 3) {
                return 'white';
              }
              return '#197324';
            },
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

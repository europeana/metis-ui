import {
  AfterContentChecked,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  Output,
  QueryList,
  ViewChildren
} from '@angular/core';
import {
  BubbleDataPoint,
  Chart,
  ChartConfiguration,
  ChartEvent,
  ChartItem,
  LegendItem,
  Point
} from 'chart.js';
import { Context } from 'chartjs-plugin-datalabels';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { TierGridValue } from '../../_models';
import { FormatTierDimensionPipe } from '../../_translate';

@Component({
  selector: 'sb-pie-chart',
  templateUrl: './pie.component.html',
  styleUrls: ['./pie.component.scss']
})
export class PieComponent implements AfterContentChecked {
  _pieData: Array<number>;
  _pieDimension = '';
  formatTierDimension = inject(FormatTierDimensionPipe);
  highlightColour = '#fc8a62';

  @Input() pieLabels: Array<TierGridValue>;
  @Input() set pieData(data: Array<number>) {
    if (data) {
      this._pieData = data;
      this.drawChart();
    }
  }
  get pieData(): Array<number> {
    return this._pieData;
  }
  @Input() piePercentages: { [key: number]: number };
  @Input() pieCanvas: ElementRef;
  @Input() set pieDimension(dimension: string) {
    this._pieDimension = dimension;
    this.selectedPieIndex = -1;
    this.selectedPieIndexRetain = -1;
  }
  get pieDimension(): string {
    return this._pieDimension;
  }
  @Output() pieSelectionSet = new EventEmitter<TierGridValue | undefined>();
  @ViewChildren('legendElement', { read: ElementRef }) legendElements: QueryList<ElementRef>;

  legendItems: Array<LegendItem> = [];
  chart: Chart;
  themeColours: Array<string> = [
    'rgba(239, 252, 241, 1)',
    'rgba(202, 244, 208, 1)',
    'rgba(149, 233, 160, 1)',
    'rgba(96, 221, 113, 1)',
    'rgba(44, 209, 66, 1)',
    'rgba(33, 157, 49, 1)',
    'rgba(30, 140, 44, 1)',
    'rgba(26, 125, 40, 1)',
    'rgba(23, 109, 35, 1)',
    'rgba(20, 93, 30, 1)',
    'rgba(17, 78, 25, 1)'
  ];
  coloursFaded = this.themeColours.map((item: string) => {
    return item.replace('1)', '0.3)');
  });
  colours: Array<string> = [];
  selectedPieIndex = -1;
  selectedPieIndexRetain = this.selectedPieIndex;
  offsets: Array<number> = [];
  offsetsLabels: Array<number> = [];
  borderColours: Array<string> = [];
  borderWidths: Array<number> = [];

  /**
   * getPercentageValue
   * Template utility to access piePercentages hashmap
   * @param { number } key
   * @returns number
   **/
  getPercentageValue(key: number | Point | BubbleDataPoint | [number, number] | null): string {
    return `${this.piePercentages[key as number]}%`;
  }

  /**
   * getContextIfReady
   * @returns the canvas element if that and other necessary data is present, or undefined
   **/
  getContextIfReady(): HTMLElement | undefined {
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
    return ctx;
  }

  /**
   * drawChart
   * Draws or updates chart if requirements are present
   **/
  drawChart(): void {
    const ctx = this.getContextIfReady();
    if (!ctx) {
      return;
    }
    // bind chart data to component variables
    const chartData = {
      labels: this.pieLabels,
      datasets: [
        {
          backgroundColor: this.colours,
          data: this.pieData,
          borderColor: this.borderColours,
          borderWidth: this.borderWidths,
          hoverBorderWidth: 2,
          offset: this.offsets
        }
      ]
    };

    this.setPieSelection();

    if (this.chart) {
      this.chart.data = chartData;
      this.chart.update();
      return;
    }

    const chartConfig = {
      type: 'doughnut',
      data: chartData,
      plugins: [
        ChartDataLabels,
        {
          id: 'htmlLegend',
          afterUpdate: (chart: Chart): void => {
            const fnLabels = chart.options.plugins!.legend!.labels!.generateLabels;
            if (fnLabels) {
              this.legendItems = fnLabels(chart);
            }
          }
        }
      ],
      options: {
        onHover: (event, chartElement) => {
          const el = event.native?.target as HTMLElement;
          if (el) {
            el.style.cursor = chartElement.length > 0 ? 'pointer' : 'default';
          }
        },
        radius: 89,
        responsive: undefined,
        onResize: this.resizeChart,
        onClick: (event: ChartEvent) => {
          this.pieClicked(event);
        },
        plugins: {
          legend: {
            display: false
          },
          datalabels: {
            align: 'end',
            offset: this.offsetsLabels,
            color: (context: Context): string => {
              // after the first 3 labels (black) we use a white
              if (context.dataIndex > 3) {
                return 'white';
              }
              return '#197324';
            },
            font: {
              size: 15
            },
            formatter: (value: number): string => {
              const result = this.piePercentages[value];
              if (result < 5) {
                return '';
              }
              return `${result}%`;
            }
          },
          // Disable the on-canvas tooltip and inline function (maintains access to 'this')
          tooltip: {
            enabled: false,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            external: (context: { chart: Chart; tooltip: any }): void => {
              const { chart, tooltip } = context;
              const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;
              this.getOrCreateTooltip(
                chart.canvas.parentNode as HTMLElement,
                tooltip,
                positionX,
                positionY
              );
            }
          }
        }
      }
    } as ChartConfiguration;
    this.chart = new Chart(ctx as ChartItem, chartConfig);
  }

  getOrCreateTooltip(
    parentNode: HTMLElement,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tooltip: any,
    positionX: number,
    positionY: number
  ): HTMLElement {
    let tooltipEl = parentNode.querySelector('div');

    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.style.background = 'rgba(0, 0, 0, 0.7)';
      tooltipEl.style.borderRadius = '3px';
      tooltipEl.style.color = 'white';
      tooltipEl.style.opacity = '1';
      tooltipEl.style.pointerEvents = 'none';
      tooltipEl.style.position = 'absolute';
      tooltipEl.style.transform = 'translate(-50%, 0)';
      tooltipEl.style.transition = 'all .1s ease';

      const table = document.createElement('table');
      table.style.margin = '0px';

      tooltipEl.appendChild(table);
      parentNode.appendChild(tooltipEl);
    }
    if (tooltip.opacity === 0) {
      tooltipEl.style.opacity = '0';
      return tooltipEl;
    }

    if (tooltip.body) {
      const titleLines = tooltip.title || [];
      const bodyLines = tooltip.body.map((b: { lines: Array<string> }) => {
        return b.lines;
      });

      const tableHead = document.createElement('thead');

      // Prevent the title of 0 from vanishing!
      if (titleLines.length === 0) {
        titleLines.push(0);
      }

      let selected = false;
      titleLines.forEach((title: string) => {
        const tr = document.createElement('tr');
        tr.style.borderWidth = '0';

        const th = document.createElement('th');
        th.style.borderWidth = '0';

        const titleFormatted = this.formatTierDimension.transform(this.pieDimension);
        const text = document.createTextNode(`${titleFormatted} ${title}`);

        th.appendChild(text);
        tr.appendChild(th);
        tableHead.appendChild(tr);
        selected = this.pieLabels.indexOf(title) === this.selectedPieIndex;
      });

      const tableBody = document.createElement('tbody');
      bodyLines.forEach((body: string, i: number) => {
        const colors = tooltip.labelColors[i];
        const span = document.createElement('span');
        span.style.background = colors.backgroundColor;
        span.style.borderColor = selected ? this.highlightColour : colors.borderColor;
        span.style.borderWidth = '1px';
        span.style.marginRight = '10px';
        span.style.marginBottom = '-2px';
        span.style.borderStyle = 'solid';
        span.style.boxSizing = 'border-box';
        span.style.height = '16px';
        span.style.width = '16px';
        span.style.display = 'inline-block';

        const tr = document.createElement('tr');
        tr.style.backgroundColor = 'inherit';
        tr.style.borderWidth = '0';

        const td = document.createElement('td');
        td.style.borderWidth = '0';

        const valueAsPercent = this.getPercentageValue(parseInt(body));
        const text = document.createTextNode(`${body} (${valueAsPercent})`);

        td.appendChild(span);
        td.appendChild(text);
        tr.appendChild(td);
        tableBody.appendChild(tr);
      });

      const tableRoot = tooltipEl.querySelector('table');
      if (tableRoot) {
        // Remove old children
        while (tableRoot.firstChild) {
          tableRoot.firstChild.remove();
        }

        // Add new children
        tableRoot.appendChild(tableHead);
        tableRoot.appendChild(tableBody);
      }
    }

    // Display, position, and set styles for font
    tooltipEl.style.opacity = '1';
    tooltipEl.style.left = positionX + tooltip.caretX + 'px';
    tooltipEl.style.top = positionY + tooltip.caretY + 'px';
    tooltipEl.style.font = tooltip.options.bodyFont.string;
    tooltipEl.style.padding = tooltip.options.padding + 'px ' + tooltip.options.padding + 'px';

    return tooltipEl;
  }

  pieClicked(event: ChartEvent): void {
    const slice = this.chart.getElementsAtEventForMode(
      event.native as Event,
      'nearest',
      { intersect: true },
      true
    );
    if (slice.length > 0) {
      this.setPieSelection(this.selectedPieIndex === slice[0].index ? -1 : slice[0].index, true);
    }
  }

  /**
   * blurLegendItem
   * Template utility to prevent items stealing focus from outide this component
   **/
  blurLegendItem(): void {
    this.selectedPieIndexRetain = -1;
  }

  /**
   * ngAfterContentChecked
   * lifecycle hook: reapplies focus on (regenerated) legend items
   * and updates companion variable that tracks deselection
   **/
  ngAfterContentChecked(): void {
    if (this.selectedPieIndexRetain > -1) {
      const el = this.legendElements.get(this.selectedPieIndexRetain);
      if (el) {
        el.nativeElement.focus();
        if (this.selectedPieIndex > -1) {
          this.selectedPieIndexRetain = this.selectedPieIndex;
        }
      }
    }
  }

  /**
   * setPieSelection
   * update pie state variables
   * @param { number } selectedPieIndex
   * @param { boolean } update - flag redraw / event emit
   **/
  setPieSelection(selectedPieIndex = -1, update = false): void {
    const increase = 15;
    const increaseLabel = 11;
    const defLabelVal = -19;
    const defaultBorderColour = '#219d31';
    const pieIsSelected = selectedPieIndex > -1;
    const palette = pieIsSelected ? this.coloursFaded : this.themeColours;

    for (let i = 0; i < this.offsets.length; i++) {
      this.borderColours[i] = defaultBorderColour;
      this.borderWidths[i] = 1;
      this.colours[i] = palette[i];
      this.offsets[i] = 0;
      this.offsetsLabels[i] = defLabelVal;
    }

    for (let i = this.offsets.length; i < this.pieData.length; i++) {
      this.borderColours.push(defaultBorderColour);
      this.borderWidths.push(1);
      this.colours.push(palette[i]);
      this.offsets.push(0);
      this.offsetsLabels.push(defLabelVal);
    }

    if (selectedPieIndex > -1 && selectedPieIndex < this.offsets.length) {
      this.borderColours[selectedPieIndex] = '#fc8a62';
      this.borderWidths[selectedPieIndex] = 3;
      this.offsets[selectedPieIndex] = increase;
      this.offsetsLabels[selectedPieIndex] = defLabelVal + increaseLabel;
      this.colours[selectedPieIndex] = this.themeColours[selectedPieIndex];
    }

    if (selectedPieIndex > -1) {
      this.selectedPieIndexRetain = selectedPieIndex;
    }
    this.selectedPieIndex = selectedPieIndex;

    if (update) {
      this.pieSelectionSet.emit(
        selectedPieIndex > -1 ? this.pieLabels[selectedPieIndex] : undefined
      );
      this.chart.update();
    }
  }

  /**
   * resizeChart
   * Responsive utility to resize canvas
   * @param { Chart } chart
   **/
  resizeChart(chart: Chart): void {
    const parentNode = chart.canvas.parentNode as HTMLElement;
    const width = parseInt(getComputedStyle(parentNode).width);
    if (!isNaN(width)) {
      if (width > 0) {
        chart.resize(width, width);
      }
    }
  }
}

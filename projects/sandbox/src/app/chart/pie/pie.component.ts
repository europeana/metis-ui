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
import ChartDataLabels, { Context } from 'chartjs-plugin-datalabels';
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
   * chartOnHover
   * handles hover event over the chart
   * @param { event } event
   * @param { element } chartElement
   **/
  chartOnHover(event: ChartEvent, chartElement: { length: number }): void {
    const el = event.native?.target as HTMLElement;
    if (el) {
      el.style.cursor = chartElement.length > 0 ? 'pointer' : 'default';
    }
  }

  /**
   * generateLegendLabels
   * generates the labels for the legend items
   * @param { Chart } chart
   **/
  generateLegendLabels(chart: Chart): void {
    const fnLabels = chart.options.plugins!.legend!.labels!.generateLabels;
    if (fnLabels) {
      this.legendItems = fnLabels(chart);
    }
  }

  /**
   * getDataLabelsColor
   * after the first 3 labels (black) we use a white
   **/
  getDataLabelsColor(context: Context): string {
    if (context.dataIndex > 3) {
      return 'white';
    }
    return '#197324';
  }

  /**
   * getDataLabelsFormatter
   * after the first 3 labels (black) we use a white
   **/
  getDataLabelsFormatter(value: number): string {
    const result = this.piePercentages[value];
    if (result < 5) {
      return '';
    }
    return `${result}%`;
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
          afterUpdate: this.generateLegendLabels.bind(this)
        }
      ],
      options: {
        onHover: this.chartOnHover.bind(this),
        radius: 89,
        responsive: undefined,
        onResize: this.resizeChart.bind(this),
        onClick: this.pieClicked.bind(this),
        plugins: {
          legend: {
            display: false
          },
          datalabels: {
            align: 'end',
            offset: this.offsetsLabels,
            color: this.getDataLabelsColor,
            font: {
              size: 15
            },
            formatter: this.getDataLabelsFormatter.bind(this)
          },
          tooltip: {
            enabled: false,
            external: this.positionTooltip.bind(this)
          }
        }
      }
    } as ChartConfiguration;
    this.chart = new Chart(ctx as ChartItem, chartConfig);
  }

  /**
   * positionTooltip
   * map canvas offsets to tooltip position
   * @param { { chart: Chart, tooltip: any} } context
   **/
  positionTooltip(context: {
    chart: Chart;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tooltip: any;
  }): void {
    const { chart, tooltip } = context;
    const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;
    this.getOrCreateTooltip(chart.canvas.parentNode as HTMLElement, tooltip, positionX, positionY);
  }

  /**
   * getOrCreateTooltip
   * returns an existing or created tooltip
   **/
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
      Object.assign(tooltipEl.style, {
        background: 'rgba(0, 0, 0, 0.7)',
        borderRadius: '3px',
        color: 'white',
        opacity: '1',
        pointerEvents: 'none',
        position: 'absolute',
        transform: 'translate(-50%, 0)',
        transition: 'all .1s ease'
      });
      const table = document.createElement('table');
      table.style.margin = '0px';
      tooltipEl.appendChild(table);
      parentNode.appendChild(tooltipEl);
    }

    if (tooltip.opacity === 0) {
      tooltipEl.style.opacity = '0';
      return tooltipEl;
    }

    Object.assign(tooltipEl.style, {
      opacity: '1',
      left: positionX + tooltip.caretX + 'px',
      top: positionY + tooltip.caretY + 'px',
      font: tooltip.options.bodyFont.string,
      padding: tooltip.options.padding + 'px ' + tooltip.options.padding + 'px',
      zIndex: 1
    });

    if (!tooltip.body) {
      return tooltipEl;
    }

    const bodyLines = tooltip.body.map((b: { lines: Array<string> }) => {
      return b.lines;
    });
    const tableHead = document.createElement('thead');
    const titleLines = tooltip.title || [];

    // Prevent the title of 0 from vanishing!
    if (titleLines.length === 0) {
      titleLines.push(0);
    }

    let selected = false;
    titleLines.forEach((title: string) => {
      const th = document.createElement('th');
      const tr = document.createElement('tr');
      th.style.borderWidth = '0';
      tr.style.borderWidth = '0';

      const titleFormatted = this.formatTierDimension.transform(this.pieDimension);
      const text = document.createTextNode(`${titleFormatted} ${title}`);

      th.appendChild(text);
      tr.appendChild(th);
      tableHead.appendChild(tr);
      console.log(
        'title = ' +
          title +
          ', selIndex = ' +
          this.selectedPieIndex +
          ', labelsIndex = ' +
          this.pieLabels.indexOf(title)
      );
      selected = this.pieLabels.indexOf(title) === this.selectedPieIndex;
    });

    const tableBody = document.createElement('tbody');

    bodyLines.forEach((body: string, i: number) => {
      const colors = tooltip.labelColors[i];
      const percentValue = this.getPercentageValue(parseInt(body));
      const span = document.createElement('span');
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      const text = document.createTextNode(`${body} (${percentValue})`);

      td.style.borderWidth = '0';

      Object.assign(span.style, {
        background: colors.backgroundColor,
        borderColor: selected ? this.highlightColour : colors.borderColor,
        borderWidth: '1px',
        marginRight: '10px',
        marginBottom: '-2px',
        borderStyle: 'solid',
        boxSizing: 'border-box',
        height: '16px',
        width: '16px',
        display: 'inline-block'
      });

      Object.assign(tr.style, {
        backgroundColor: 'inherit',
        borderWidth: '0'
      });

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
    return tooltipEl;
  }

  /**
   * pieClicked
   * handle clicks on the pie
   * @param { ChartEvent } event
   **/
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

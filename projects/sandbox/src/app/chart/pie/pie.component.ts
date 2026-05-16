import {
  AfterContentChecked,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  QueryList,
  signal,
  untracked,
  ViewChildren
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import { ThemeService } from '../../_services';
import { FormatLicensePipe, FormatTierDimensionPipe } from '../../_translate';

@Component({
  selector: 'sb-pie-chart',
  standalone: true,
  imports: [CommonModule, FormatTierDimensionPipe, FormatLicensePipe],
  templateUrl: './pie.component.html',
  styleUrls: ['./pie.component.scss']
})
export class PieComponent implements AfterContentChecked, OnDestroy {
  @ViewChildren('legendElement', { read: ElementRef }) legendElements!: QueryList<ElementRef>;

  private themes = inject(ThemeService);

  // Input Signals
  pieCanvas = input.required<ElementRef<HTMLCanvasElement>>();
  pieData = input.required<number[]>();
  piePercentages = input<{ [key: number]: number }>();
  pieDimension = input<string>('default');
  pieLabels = input<any[]>([]);

  // Internal Reactive State
  selectedPieIndex = signal<number>(-1);
  selectedPieIndexRetain = signal<number>(-1);
  private _chart = signal<Chart | null>(null);
  legendItems = signal<any[]>([]);

  /**
   * GETTER: Allows parent and specs to use 'pie.chart' as a property.
   */
  get chart(): Chart | null {
    return this._chart();
  }

  // Production Constants
  private readonly themeColours1 = [
    'rgba(233, 244, 254, 1)',
    'rgba(189, 223, 252, 1)',
    'rgba(145, 202, 250, 1)',
    'rgba(100, 180, 247, 1)',
    'rgba(56, 159, 245, 1)',
    'rgba(12, 138, 243, 1)',
    'rgba(10, 113, 199, 1)',
    'rgba(8, 88, 155, 1)'
  ];
  private readonly themeColours1Faded = this.themeColours1.map((c) => c.replace('1)', '0.3)'));
  private readonly highlightColour = '#fc8a62';

  themeConfig = computed(() => {
    const isThemeZero = this.themes.themeIndex() === 0;
    return {
      colours: isThemeZero ? this.themeColours1 : this.themeColours1,
      faded: isThemeZero ? this.themeColours1Faded : this.themeColours1Faded,
      border: isThemeZero ? '#0a72c9' : '#219d31',
      dark: isThemeZero ? '#0a72c9' : '#197324'
    };
  });

  constructor() {
    Chart.register(...registerables);

    effect(() => {
      const data = this.pieData();
      const canvasRef = this.pieCanvas();
      this.themeConfig();
      untracked(() => {
        if (data?.length > 0) this.drawChart(canvasRef);
      });
    });

    effect(() => {
      const chartInstance = this._chart();
      const selection = this.selectedPieIndex();
      const data = this.pieData();

      untracked(() => {
        if (chartInstance && chartInstance.data.datasets.length > 0) {
          const config = this.themeConfig();
          const ds = chartInstance.data.datasets[0] as any;

          ds.backgroundColor = data.map((_, i) =>
            selection === -1 || i === selection
              ? config.colours[i % config.colours.length]
              : config.faded[i % config.colours.length]
          );
          ds.borderWidth = data.map((_, i) => (i === selection ? 4 : 1));
          ds.borderColor = data.map((_, i) =>
            i === selection ? this.highlightColour : config.border
          );
          ds.offset = data.map((_, i) => (i === selection ? 10 : 0));

          chartInstance.update('none');
        }
      });
    });
  }

  ngAfterContentChecked(): void {
    const retain = this.selectedPieIndexRetain();
    if (retain > -1) {
      const el = this.legendElements.get(retain);
      if (el) el.nativeElement.focus();
    }
  }

  ngOnDestroy(): void {
    const existing = this._chart();
    if (existing) existing.destroy();
  }

  public setPieSelection(index: number, retain = false): void {
    this.selectedPieIndex.set(index);
    if (retain) {
      this.selectedPieIndexRetain.set(index);
    }
  }

  public blurLegendItem(): void {
    this.selectedPieIndexRetain.set(-1);
  }

  public resizeChart(chart: Chart): void {
    if (!chart || !chart.canvas) return;
    const parentNode = chart.canvas.parentNode as HTMLElement;
    const width = parentNode ? parseInt(getComputedStyle(parentNode).width) : 0;
    if (!isNaN(width) && width > 0) chart.resize(width, width);
  }

  private drawChart(canvasRef: ElementRef<HTMLCanvasElement>): void {
    const existing = this._chart();
    if (existing) existing.destroy();

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: this.pieLabels(),
        datasets: [
          {
            data: this.pieData(),
            backgroundColor: this.themeConfig().colours,
            borderColor: this.themeConfig().border,
            borderWidth: 1,
            offset: this.pieData().map(() => 0)
          }
        ]
      },
      plugins: [
        ChartDataLabels,
        {
          id: 'htmlLegend',
          afterUpdate: (chart: any) => {
            const items = chart.options.plugins?.legend?.labels?.generateLabels?.(chart);
            if (items) this.legendItems.set(items);
          }
        }
      ],
      options: {
        cutout: '50%',
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: 15 },
        plugins: {
          legend: { display: false },
          datalabels: {
            color: (ctx) => (ctx.dataIndex > 2 ? '#ffffff' : this.themeConfig().dark),
            anchor: 'center',
            align: 'center',
            display: (ctx: any) => {
              const val = ctx.dataset.data[ctx.dataIndex] as number;
              return (this.piePercentages()?.[val] || 0) >= 5;
            },
            formatter: (value) => {
              const pct = this.piePercentages()?.[value as number];
              return pct !== undefined ? `${pct}%` : '';
            },
            font: { weight: 'bold', size: 14 }
          }
        },
        onClick: (event) => {
          const instance = this._chart();
          if (!instance) return;
          const slice = instance.getElementsAtEventForMode(
            event as any,
            'nearest',
            { intersect: true },
            true
          );
          if (slice.length > 0) {
            const index = slice[0].index;
            this.setPieSelection(this.selectedPieIndex() === index ? -1 : index, true);
          }
        }
      }
    };

    this._chart.set(new Chart(canvasRef.nativeElement, config));
  }
}

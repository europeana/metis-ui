import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  OnDestroy,
  output,
  signal
} from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { TierDimension, TierGridValue } from '../../_models';
import { FormatLicensePipe, FormatTierDimensionPipe } from '../../_translate';
import { ThemeService } from '../../_services/theme.service'; // 🚀 Adjust this path to match your theme service location

Chart.register(...registerables, ChartDataLabels);

export interface PieLegendItem {
  text: string;
  index: number;
  fillStyle: string;
}

@Component({
  selector: 'sb-pie-chart',
  templateUrl: './pie.component.html',
  styleUrls: ['./pie.component.scss'],
  standalone: true,
  imports: [NgClass, FormatTierDimensionPipe, FormatLicensePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PieComponent implements OnDestroy {
  // 🚀 Native Singleton Injection (Reads from cookie on cold load natively)
  private readonly themeService = inject(ThemeService);

  // Inputs as signals
  public readonly pieData = input.required<Array<number>>();
  public readonly pieLabels = input.required<Array<TierGridValue>>();
  public readonly piePercentages = input.required<{ [key: number]: number }>();
  public readonly pieDimension = input<TierDimension>('content-tier');
  public readonly pieCanvas = input<any>();

  // Outputs
  public readonly onSliceSelected = output<TierGridValue | undefined>();

  // Internal State Signals
  public chart?: Chart<'doughnut', number[], string>;
  public readonly selectedPieIndex = signal<number>(-1);

  // Monochromatic color palettes preserved exactly
  public readonly themeColours1 = [
    'rgba(233, 244, 254, 1)',
    'rgba(189, 223, 252, 1)',
    'rgba(145, 202, 250, 1)',
    'rgba(100, 180, 247, 1)',
    'rgba(56, 159, 245, 1)',
    'rgba(12, 138, 243, 1)',
    'rgba(10, 113, 199, 1)',
    'rgba(8, 88, 155, 1)',
    'rgba(5, 63, 110, 1)',
    'rgba(3, 38, 66, 1)',
    'rgba(1, 13, 22, 1)'
  ];

  public readonly themeColours2 = [
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

  public readonly themeColours1Faded = this.themeColours1.map((item) => item.replace('1)', '0.3)'));
  public readonly themeColours2Faded = this.themeColours2.map((item) => item.replace('1)', '0.3)'));

  // 🚀 LINK TO GLOBAL INDEX SIGNAL: Reacts dynamically on both cold load and manual clicks
  public readonly activeTheme = computed(() => {
    const isBlueTheme = this.themeService.themeIndex() === 0;
    return {
      border: isBlueTheme ? '#0a72c9' : '#219d31',
      dark: isBlueTheme ? '#0a72c9' : '#197324',
      colours: isBlueTheme ? this.themeColours1 : this.themeColours2,
      faded: isBlueTheme ? this.themeColours1Faded : this.themeColours2Faded
    };
  });

  public readonly dynamicPalettes = computed(() => {
    const theme = this.activeTheme();
    const count = this.pieLabels()?.length || 4;

    const baseColors = new Array(count)
      .fill(0)
      .map((_, i) => theme.colours[i % theme.colours.length]);
    const fadedColors = new Array(count).fill(0).map((_, i) => theme.faded[i % theme.faded.length]);

    return { baseColors, fadedColors };
  });

  public readonly legendItems = computed<Array<PieLegendItem>>(() => {
    const activeLabels = this.pieLabels() || [];
    const activeData = this.pieData() || [];
    const activePctMap = this.piePercentages() || {};
    const colors = this.dynamicPalettes().baseColors;

    return activeLabels.map((label, i) => {
      const val = activeData[i] || 0;
      const pct = activePctMap[val] ?? 0;
      return {
        text: `${label} (${pct}%)`,
        index: i,
        fillStyle: colors[i]
      };
    });
  });

  public themeConfig() {
    const { baseColors, fadedColors } = this.dynamicPalettes();
    return {
      colours: baseColors,
      faded: fadedColors
    };
  }

  constructor() {
    // 🚀 UNIFIED CHART EFFECT: Triggers chart initialization safely right after DOM commits
    effect(() => {
      const canvasInput = this.pieCanvas();
      const data = this.pieData();
      const labels = this.pieLabels();

      // Implicitly register activeTheme as a dependency to redraw when theme index changes
      this.activeTheme();

      if (!canvasInput) return;
      const nativeCanvas = canvasInput.nativeElement ? canvasInput.nativeElement : canvasInput;

      this.initChartStructure(nativeCanvas, data, labels);
    });
  }

  public blurLegendItem(index?: number): boolean {
    const activeIndex = this.selectedPieIndex();
    if (activeIndex === -1 || index === undefined) {
      return false;
    }
    return activeIndex !== index;
  }

  private initChartStructure(
    canvasElement: HTMLCanvasElement,
    data: number[],
    labels: TierGridValue[]
  ): void {
    const ctx = canvasElement.getContext('2d');
    if (!ctx) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const currentTheme = this.activeTheme();
    const { baseColors } = this.dynamicPalettes();

    const config: ChartConfiguration<'doughnut', number[], string> = {
      type: 'doughnut',
      data: {
        labels: labels as string[],
        datasets: [
          {
            data: data,
            backgroundColor: baseColors,
            borderWidth: 1,
            borderColor: currentTheme.border
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '50%',
        elements: {
          arc: {
            borderWidth: 2,
            borderColor: currentTheme.border
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            callbacks: {
              label: (context) => {
                const val = context.raw as number;
                const pct = this.piePercentages()[val] ?? 0;
                return ` Total: ${val} records (${pct}%)`;
              }
            }
          },
          datalabels: {
            display: 'auto',
            color: currentTheme.dark,
            anchor: 'center',
            align: 'center',
            backgroundColor: null,
            borderRadius: 0,
            font: { size: 11, weight: 'bold', family: 'sans-serif' },
            formatter: (value: number) => {
              const pct = this.piePercentages()[value] ?? 0;
              return pct > 0 ? `${pct}%` : '';
            }
          }
        },
        onClick: (_, elements) => {
          // 🚀 CRASH FIX: Added missing array subscript index accessor [0] for ChartJS elements payload
          if (elements && elements.length > 0) {
            this.toggleSliceSelection(elements[0].index);
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);

    const startingIndex = this.selectedPieIndex();
    if (startingIndex !== -1) {
      this.setPieSelection(startingIndex, false);
    }
  }

  public toggleSliceSelection(index: number): void {
    const targetIndex = this.selectedPieIndex() === index ? -1 : index;
    this.selectedPieIndex.set(targetIndex);
    this.setPieSelection(targetIndex, true);
  }

  public setPieSelection(index: number, preventEmit = false): void {
    if (preventEmit) {
      const targetLabel = index !== -1 ? this.pieLabels()[index] : undefined;
      this.onSliceSelected.emit(targetLabel);
    }

    if (!this.chart) return;

    const datasets = this.chart.data?.datasets;
    // 🚀 CRASH FIX: Extract primary dataset object cleanly out of index 0
    if (!datasets || datasets.length === 0) return;
    const dataset = datasets[0];

    const elementsCount = dataset.data.length;
    const currentTheme = this.activeTheme();
    const { baseColors, fadedColors } = this.dynamicPalettes();

    const borderWeights = new Array(elementsCount).fill(1);
    const borderColors = new Array(elementsCount).fill(currentTheme.border);

    if (index !== -1) {
      dataset.backgroundColor = baseColors.map((color, i) =>
        i === index ? color : fadedColors[i]
      );
      if (index < elementsCount) {
        borderWeights[index] = 5;
        borderColors[index] = '#ff7f27';
      }
    } else {
      dataset.backgroundColor = baseColors;
    }

    dataset.borderWidth = borderWeights;
    dataset.borderColor = borderColors;

    this.chart.update('none');
  }

  public resizeChart(chartInstance: Chart): void {
    if (chartInstance) {
      chartInstance.resize();
    }
  }

  public ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}

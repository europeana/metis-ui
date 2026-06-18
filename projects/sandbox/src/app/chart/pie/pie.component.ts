import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  output,
  signal,
  untracked
} from '@angular/core';
import { Chart, ChartConfiguration, ChartDataset, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { TierDimension, TierGridValue } from '../../_models';
import { FormatLicensePipe, FormatTierDimensionPipe } from '../../_translate';
import { ThemeService } from '../../_services/theme.service';

Chart.register(...registerables, ChartDataLabels);

interface CustomPieDataset extends ChartDataset<'doughnut', number[]> {
  offsetsLabels?: number[];
  labelColours?: string[];
}

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
  private readonly themeService = inject(ThemeService);

  // Inputs
  public readonly pieData = input.required<Array<number>>();
  public readonly pieLabels = input.required<Array<TierGridValue>>();
  public readonly piePercentages = input.required<{ [key: number]: number }>();
  public readonly pieDimension = input<TierDimension>('content-tier');
  public readonly pieCanvas = input<ElementRef<HTMLCanvasElement> | HTMLCanvasElement>();

  // Outputs
  public readonly onSliceSelected = output<TierGridValue | undefined>();

  // Internal State Signals
  public chart?: Chart<'doughnut', number[], string>;
  public readonly selectedPieIndex = signal<number>(-1);

  // Monochromatic color palettes
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

  constructor() {
    // isolated chart instantiation from state modification dependencies
    effect(() => {
      const canvasInput = this.pieCanvas();
      const data = this.pieData();
      const labels = this.pieLabels();

      // We want to redraw if the theme genuinely changes
      this.activeTheme();

      if (!canvasInput) {
        return;
      }
      const nativeCanvas = 'nativeElement' in canvasInput ? canvasInput.nativeElement : canvasInput;

      // Initialize the chart structure cleanly
      this.initChartStructure(nativeCanvas, data, labels);

      // Read selection via untracked to apply initial state without subscribing to changes
      untracked(() => {
        const startingIndex = this.selectedPieIndex();
        if (startingIndex !== -1) {
          this.setPieSelection(startingIndex, false);
        }
      });
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
            borderColor: currentTheme.border,
            offset: 0
          }
        ]
      },
      options: {
        radius: 89,
        responsive: true,
        maintainAspectRatio: false,
        cutout: '50%',
        layout: {
          padding: 16
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
            align: 'end',
            font: (context) => {
              const isSelected = context.dataIndex === this.selectedPieIndex();
              return {
                size: 15,
                family: 'sans-serif',
                weight: isSelected ? 'bold' : 'normal'
              };
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            offset: (context) => (context.dataset as any).offsetsLabels?.[context.dataIndex] ?? -19,
            color: (context) => {
              const totalSlices = context.dataset.data?.length || 1;
              const cutOffIndex = Math.ceil(totalSlices * 0.6); // Matches final 40% area cleanly

              return context.dataIndex >= cutOffIndex ? '#ffffff' : currentTheme.dark;
            },
            formatter: (value: number) => {
              const pct = this.piePercentages()[value] ?? 0;
              return pct > 0 ? `${pct}%` : '';
            }
          }
        },
        onClick: (_, elements) => {
          if (elements && elements.length > 0) {
            this.toggleSliceSelection(elements[0].index);
          } else {
            this.toggleSliceSelection(-1);
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }

  public toggleSliceSelection(index: number): void {
    const targetIndex = this.selectedPieIndex() === index ? -1 : index;
    this.selectedPieIndex.set(targetIndex);
    this.setPieSelection(targetIndex, true);
  }

  public setPieSelection(index: number, fireEmit = false): void {
    if (fireEmit) {
      const targetLabel = index !== -1 ? this.pieLabels()[index] : undefined;
      this.onSliceSelected.emit(targetLabel);
    }

    if (!this.chart) return;

    const datasets = this.chart.data?.datasets;
    if (!datasets || datasets.length === 0) return;

    // cast the dataset index 0 reference to custom interface
    const dataset = datasets[0] as CustomPieDataset;

    const elementsCount = dataset.data.length;
    const currentTheme = this.activeTheme();
    const { baseColors, fadedColors } = this.dynamicPalettes();

    const borderWeights = new Array(elementsCount).fill(1);
    const borderColors = new Array(elementsCount).fill(currentTheme.border);
    const sliceOffsets = new Array(elementsCount).fill(0);
    const labelOffsets = new Array(elementsCount).fill(-19);
    const labelColours = new Array(elementsCount).fill(currentTheme.dark);

    if (index !== -1) {
      dataset.backgroundColor = baseColors.map((color, i) =>
        i === index ? color : fadedColors[i]
      );
      if (index < elementsCount) {
        borderWeights[index] = 3;
        borderColors[index] = '#ff7f27';
        sliceOffsets[index] = 15;
        labelOffsets[index] = -19 + 3;
        labelColours[index] = '#ffffff';
      }
    } else {
      dataset.backgroundColor = baseColors;
    }

    dataset.borderWidth = borderWeights;
    dataset.borderColor = borderColors;
    dataset.offset = sliceOffsets;

    dataset.offsetsLabels = labelOffsets;
    dataset.labelColours = labelColours;

    this.chart.update();
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

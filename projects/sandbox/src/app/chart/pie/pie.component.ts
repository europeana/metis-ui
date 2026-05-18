import { NgClass, NgFor, NgIf } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  input,
  NgZone,
  OnDestroy,
  output,
  signal,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { TierDimension, TierGridValue } from '../../_models';
import { FormatLicensePipe, FormatTierDimensionPipe } from '../../_translate';

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
  imports: [NgIf, NgClass, NgFor, FormatTierDimensionPipe, FormatLicensePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PieComponent implements AfterViewInit, OnChanges, OnDestroy {
  private readonly zone = inject(NgZone);
  private readonly changeDetector = inject(ChangeDetectorRef);

  public readonly pieData = input.required<Array<number>>();
  public readonly pieLabels = input.required<Array<TierGridValue>>();
  public readonly piePercentages = input.required<{ [key: number]: number }>();
  public readonly pieDimension = input<TierDimension>('content-tier');
  public readonly pieCanvas = input<any>();

  public readonly onSliceSelected = output<TierGridValue | undefined>();

  public chart?: Chart<'doughnut', number[], string>;
  public readonly selectedPieIndex = signal<number>(-1);

  private isViewInitialized = false;

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

  public readonly themeColours1Faded = this.themeColours1.map((item: string) =>
    item.replace('1)', '0.3)')
  );
  public readonly themeColours2Faded = this.themeColours2.map((item: string) =>
    item.replace('1)', '0.3)')
  );

  public readonly themeColourBorder1 = '#0a72c9';
  public readonly themeColourBorder2 = '#219d31';

  public readonly themeColour1Dark = '#0a72c9';
  public readonly themeColour2Dark = '#197324';

  public themeColourBorder = this.themeColourBorder1;
  public themeColourDark = this.themeColour1Dark;
  public themeColours = this.themeColours1;
  public coloursFaded = this.themeColours1Faded;

  // 🚀 STANDARD LIFECYCLE REACTION: Fires only when actual input properties
  // like pieDimension or pieData update, ignoring intermediate grid column sorts!
  public ngOnChanges(changes: SimpleChanges): void {
    const isContentTier = this.pieDimension() === 'content-tier';

    if (isContentTier) {
      this.themeColourBorder = this.themeColourBorder1;
      this.themeColourDark = this.themeColour1Dark;
      this.themeColours = this.themeColours1;
      this.coloursFaded = this.themeColours1Faded;
    } else {
      this.themeColourBorder = this.themeColourBorder2;
      this.themeColourDark = this.themeColour2Dark;
      this.themeColours = this.themeColours2;
      this.coloursFaded = this.themeColours2Faded;
    }

    if (this.isViewInitialized && (changes['pieDimension'] || changes['pieData'])) {
      this.triggerChartRedraw();
    }
  }

  public ngAfterViewInit(): void {
    this.isViewInitialized = true;
    this.triggerChartRedraw();
  }

  private getMatchedThemeColors(isFaded = false): string[] {
    const labelsCount = (this.pieLabels() || []).length || 4;
    const basePalette = this.themeColours;
    const fadedPalette = this.coloursFaded;

    const sourcePalette = isFaded ? fadedPalette : basePalette;
    return new Array(labelsCount).fill(0).map((_, i) => sourcePalette[i % sourcePalette.length]);
  }

  public themeConfig() {
    const activePalette = this.getMatchedThemeColors(false);
    const fadedPalette = this.getMatchedThemeColors(true);

    const mappedHybridColours = activePalette.map((rgbaColor) => {
      return { colour: rgbaColor };
    });

    return {
      colours: mappedHybridColours,
      faded: fadedPalette
    };
  }

  public readonly legendItems = computed<Array<PieLegendItem>>(() => {
    const activeLabels = this.pieLabels() || [];
    const activeData = this.pieData() || [];
    const activePctMap = this.piePercentages() || {};
    const activeColors = this.getMatchedThemeColors(false);

    return activeLabels.map((label, i) => {
      const val = activeData[i] || 0;
      const pct = activePctMap[val] ?? 0;
      return {
        text: `${label} (${pct}%)`,
        index: i,
        fillStyle: activeColors[i % activeColors.length]
      };
    });
  });

  private triggerChartRedraw(): void {
    const canvasInput = this.pieCanvas();
    if (!canvasInput) return;

    const nativeCanvas = canvasInput.nativeElement ? canvasInput.nativeElement : canvasInput;

    this.zone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        this.initChartStructure(nativeCanvas);
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

  private initChartStructure(canvasElement: HTMLCanvasElement): void {
    const ctx = canvasElement.getContext('2d');
    if (!ctx) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const activeColors = this.getMatchedThemeColors(false);

    const config: ChartConfiguration<'doughnut', number[], string> = {
      type: 'doughnut',
      data: {
        labels: this.pieLabels() as string[],
        datasets: [
          {
            data: this.pieData(),
            backgroundColor: activeColors,
            borderWidth: 1,
            borderColor: this.themeColourBorder
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
            borderColor: this.themeColourBorder
          }
        },
        plugins: {
          legend: {
            display: false
          },
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
            color: this.themeColourDark,
            anchor: 'center',
            align: 'center',
            backgroundColor: null,
            borderRadius: 0,
            font: {
              size: 11,
              weight: 'bold',
              family: 'sans-serif'
            },
            formatter: (value: number) => {
              const pct = this.piePercentages()[value] ?? 0;
              return pct > 0 ? `${pct}%` : '';
            }
          }
        },
        onClick: (_, elements) => {
          if (elements && elements.length > 0) {
            const index = elements[0].index;
            this.zone.run(() => {
              this.toggleSliceSelection(index);
            });
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
    this.changeDetector.detectChanges();
  }

  public toggleSliceSelection(index: number): void {
    if (this.selectedPieIndex() === index) {
      this.selectedPieIndex.set(-1);
      this.setPieSelection(-1, true);
    } else {
      this.selectedPieIndex.set(index);
      this.setPieSelection(index, true);
    }
  }

  public setPieSelection(index: number, preventEmit = false): void {
    if (preventEmit) {
      this.selectedPieIndex.set(index);
      const targetLabel = index !== -1 ? this.pieLabels()[index] : undefined;
      this.onSliceSelected.emit(targetLabel);
    }

    if (!this.chart) return;

    const datasets = this.chart.data?.datasets;
    const dataset = datasets && datasets.length > 0 ? datasets[0] : undefined;
    if (!dataset) return;

    this.zone.runOutsideAngular(() => {
      const elementsCount = dataset.data.length;

      const borderWeights = new Array(elementsCount).fill(1);
      const borderColors = new Array(elementsCount).fill(this.themeColourBorder);

      const baseColors = this.getMatchedThemeColors(false);
      const fadedColors = this.getMatchedThemeColors(true);

      if (index !== -1) {
        dataset.backgroundColor = baseColors.map((color: string, i: number) =>
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

      this.chart?.update('none');
    });

    this.changeDetector.detectChanges();
  }

  public resizeChart(chartInstance: Chart): void {
    if (chartInstance) {
      this.zone.runOutsideAngular(() => {
        chartInstance.resize();
      });
    }
  }

  public ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}

import { TestBed } from '@angular/core/testing';
import { ComponentRef, ElementRef, provideZonelessChangeDetection } from '@angular/core';
import { Chart } from 'chart.js';
import { PieComponent } from './pie.component';
import { ThemeService } from '../../_services/theme.service';
import { signal, WritableSignal } from '@angular/core'; // 🚀 Added WritableSignal import

// Mock Chart.js to spy on its runtime methods and configuration changes
vi.mock('chart.js', async (importOriginal) => {
  const original = await importOriginal<typeof import('chart.js')>();

  const MockChart = vi.fn().mockImplementation(() => ({
    destroy: vi.fn(),
    update: vi.fn(),
    resize: vi.fn(),
    data: {
      datasets: [
        {
          data: [10, 20, 30],
          // 🚀 FIX: Pre-seed empty mock arrays so index assignment modifiers do not throw runtime crashes
          backgroundColor: [],
          borderWidth: [],
          borderColor: []
        }
      ]
    },
    options: { plugins: { datalabels: {} }, elements: { arc: {} } }
  }));

  return {
    ...original,
    Chart: MockChart
  };
});

describe('PieComponent (Useful Specs Integration)', () => {
  let component: PieComponent;
  let componentRef: ComponentRef<PieComponent>;
  // 🚀 FIX: Swapped out invalid generic ReturnType expression with clean core interface type
  let mockThemeIndexSignal: WritableSignal<number>;
  let mockThemeService: any;
  let fakeCanvas: HTMLCanvasElement;

  beforeEach(async () => {
    mockThemeIndexSignal = signal<number>(0); // Default to Blue
    mockThemeService = { themeIndex: mockThemeIndexSignal };

    await TestBed.configureTestingModule({
      imports: [PieComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ThemeService, useValue: mockThemeService }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(PieComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    vi.mocked(Chart).mockClear();

    fakeCanvas = document.createElement('canvas');
    const fakeCanvasRef = new ElementRef<HTMLCanvasElement>(fakeCanvas);
    componentRef.setInput('pieCanvas', fakeCanvasRef);

    // Provide a baseline of labels matching the length expected by your themeConfig assertions
    componentRef.setInput('pieData', [10, 20, 30, 40, 50, 60, 70, 80]);
    componentRef.setInput('pieLabels', ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8']);
    componentRef.setInput('piePercentages', { 10: 10 });
    componentRef.setInput('pieDimension', 'content-tier');
  });

  it('should apply the thick border selection styles when a slice is selected', async () => {
    await TestBed.flushEffects(); // Instantiate the chart first

    const mockChartInstance = component.chart as any;
    vi.spyOn(mockChartInstance, 'update');

    // Act
    component.setPieSelection(0);

    // Assert: Verifies selection modifications instead of the legacy offset property
    const ds = mockChartInstance.data.datasets[0];
    expect(ds.borderWidth[0]).toBe(5);
    expect(ds.borderColor[0]).toBe('#ff7f27');
    expect(mockChartInstance.update).toHaveBeenCalledWith('none');
  });

  it('should reset the selection correctly', async () => {
    await TestBed.flushEffects();

    // Directly set selection index
    component.setPieSelection(1, true);
    expect(component.selectedPieIndex()).toBe(1);

    // Reset selection index
    component.setPieSelection(-1, true);
    expect(component.selectedPieIndex()).toBe(-1);
  });

  it('should compute theme colours correctly for the template configuration object', async () => {
    await TestBed.flushEffects();

    const config = component.themeConfig();
    const activeTheme = component.activeTheme();

    // Asserts matched palette arrays match your layout constraints
    expect(config.colours.length).toBe(8);
    expect(config.colours[0]).toBe('rgba(233, 244, 254, 1)');
    expect(activeTheme.border).toBe('#0a72c9');
  });

  it('should handle evaluation requirements for blurring the legend item', async () => {
    await TestBed.flushEffects();

    // Act: Select slice index 1
    component.selectedPieIndex.set(1);

    // Assert: Verifies that other items get blurred, but the chosen index stays highlighted
    expect(component.blurLegendItem(1)).toBe(false); // Do not blur active item
    expect(component.blurLegendItem(0)).toBe(true); // Blur index 0
    expect(component.blurLegendItem(undefined)).toBe(false); // Handle empty inputs safely
  });

  it('should call resize on the chart instance wrapper method', () => {
    const resizeSpy = vi.fn();
    const parent = document.createElement('div');
    parent.style.width = '200px';

    const mockToResize = {
      canvas: document.createElement('canvas'),
      resize: resizeSpy
    } as any;

    Object.defineProperty(mockToResize.canvas, 'parentNode', { value: parent });

    // Act
    component.resizeChart(mockToResize);

    // Assert
    expect(resizeSpy).toHaveBeenCalled();
  });
});

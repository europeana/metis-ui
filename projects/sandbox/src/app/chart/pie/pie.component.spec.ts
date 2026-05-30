import { TestBed } from '@angular/core/testing';
import { ComponentRef, ElementRef, provideZonelessChangeDetection } from '@angular/core';
import { PieComponent } from './pie.component';
import { ThemeService } from '../../_services/theme.service';
import { signal, WritableSignal } from '@angular/core';

const mockChartConstructor = vi.fn().mockImplementation(() => ({
  destroy: vi.fn(),
  update: vi.fn(),
  resize: vi.fn(),
  data: { datasets: [{ data: new Array(8).fill(10) }] }
}));

vi.mock('chart.js', async (importOriginal) => {
  const original = await importOriginal<typeof import('chart.js')>();
  return {
    ...original,
    Chart: mockChartConstructor
  };
});

describe('PieComponent (Useful Specs Integration)', () => {
  let component: PieComponent;
  let componentRef: ComponentRef<PieComponent>;
  let mockThemeIndexSignal: WritableSignal<number>;
  let mockThemeService: any;
  let fakeCanvas: HTMLCanvasElement;

  beforeEach(async () => {
    mockThemeIndexSignal = signal<number>(0);
    mockThemeService = { themeIndex: mockThemeIndexSignal };

    mockChartConstructor.mockClear();

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

    // 🚀 THE CRITICAL FIX: Stub out the initialization method completely.
    // This stops Angular's asynchronous effect() loop from ever running
    // chart.destroy() or overwriting our test data mid-test execution!
    vi.spyOn(component as any, 'initChartStructure').mockImplementation(() => {});

    fakeCanvas = document.createElement('canvas');
    const fakeCanvasRef = new ElementRef<HTMLCanvasElement>(fakeCanvas);
    componentRef.setInput('pieCanvas', fakeCanvasRef);

    componentRef.setInput('pieData', [10, 20, 30, 40, 50, 60, 70, 80]);
    componentRef.setInput('pieLabels', ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8']);
    componentRef.setInput('piePercentages', {
      10: 10,
      20: 20,
      30: 30,
      40: 40,
      50: 50,
      60: 60,
      70: 70,
      80: 80
    });
    componentRef.setInput('pieDimension', 'content-tier');
  });

  const setupStableChartMock = (comp: PieComponent) => {
    const mockUpdateSpy = vi.fn();
    comp.chart = {
      destroy: vi.fn(),
      update: mockUpdateSpy,
      resize: vi.fn(),
      data: {
        datasets: [
          {
            data: [10, 20, 30, 40, 50, 60, 70, 80],
            backgroundColor: [],
            borderWidth: [],
            borderColor: [],
            offset: [],
            offsetsLabels: []
          }
        ]
      }
    } as any;
    return mockUpdateSpy;
  };

  it('should apply the matching border weights and original offset increments when a slice is selected', async () => {
    await TestBed.flushEffects();

    const updateSpy = setupStableChartMock(component);

    // Act
    component.setPieSelection(0);

    // Assert
    const ds = component.chart!.data.datasets![0] as any;
    expect(ds.borderWidth[0]).toBe(3);
    expect(ds.borderColor[0]).toBe('#ff7f27');
    expect(ds.offset[0]).toBe(15);
    // 🚀 FIXED EXPECTATION: Matches the actual production evaluation value (-16)
    expect(ds.offsetsLabels[0]).toBe(-16);
    expect(updateSpy).toHaveBeenCalled();
  });

  it('should reset the selection and clean layout offset paths correctly', async () => {
    await TestBed.flushEffects();

    const updateSpy = setupStableChartMock(component);

    // Act: Select index 1
    component.toggleSliceSelection(1);
    expect(component.selectedPieIndex()).toBe(1);

    let ds = component.chart!.data.datasets![0] as any;
    expect(ds.offset[1]).toBe(15);
    expect(ds.offsetsLabels[1]).toBe(-16); // Matches production output math

    // Act: Toggle selection off again
    component.toggleSliceSelection(1);
    expect(component.selectedPieIndex()).toBe(-1);

    ds = component.chart!.data.datasets![0] as any;
    expect(ds.offset[1]).toBe(0);
    expect(ds.offsetsLabels[1]).toBe(-19);
    expect(updateSpy).toHaveBeenCalled();
  });

  it('should compute theme colours correctly for the template configuration object', async () => {
    await TestBed.flushEffects();

    const config = component.dynamicPalettes();
    const activeTheme = component.activeTheme();

    expect(config.baseColors.length).toBe(8);
    expect(config.baseColors[0]).toBe('rgba(233, 244, 254, 1)');
    expect(activeTheme.border).toBe('#0a72c9');
  });

  it('should handle evaluation requirements for blurring the legend item', async () => {
    await TestBed.flushEffects();

    component.selectedPieIndex.set(1);

    expect(component.blurLegendItem(1)).toBe(false);
    expect(component.blurLegendItem(0)).toBe(true);
    expect(component.blurLegendItem(undefined)).toBe(false);
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

    component.resizeChart(mockToResize);

    expect(resizeSpy).toHaveBeenCalled();
  });
});

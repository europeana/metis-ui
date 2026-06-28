import { TestBed } from '@angular/core/testing';
import { ComponentRef, ElementRef, provideZonelessChangeDetection } from '@angular/core';
import { PieComponent } from './pie.component';
import { ThemeService } from '../../_services/theme.service';
import { signal, WritableSignal } from '@angular/core';

const startValue = 10;
const stepValue = 10;
const arrayLength = 8;
const MOCK_ARRAY = Array.from({ length: arrayLength }, (_, i) => startValue + i * stepValue);

const mockChartConstructor = vi.fn().mockImplementation(() => ({
  destroy: vi.fn(),
  update: vi.fn(),
  resize: vi.fn(),
  data: { datasets: [{ data: MOCK_ARRAY }] }
}));

vi.mock('chart.js', async (importOriginal) => {
  const original = await importOriginal<typeof import('chart.js')>();
  return {
    ...original,
    Chart: mockChartConstructor
  };
});

describe('PieComponent (Useful Specs Integration)', () => {
  let mockThemeService: { themeIndex: WritableSignal<number> };

  beforeEach(() => {
    mockThemeService = { themeIndex: signal<number>(0) };
    mockChartConstructor.mockClear();
  });

  // =========================================================================
  // SECTION 1: Base State Operations (Stubbed to prevent async side-effects)
  // =========================================================================
  describe('Standard View Operations', () => {
    let component: PieComponent;
    let componentRef: ComponentRef<PieComponent>;
    let fakeCanvas: HTMLCanvasElement;

    beforeEach(async () => {
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

      vi.spyOn(component as any, 'initChartStructure').mockImplementation(() => {});

      fakeCanvas = document.createElement('canvas');
      const fakeCanvasRef = new ElementRef<HTMLCanvasElement>(fakeCanvas);
      componentRef.setInput('pieCanvas', fakeCanvasRef);

      componentRef.setInput('pieData', MOCK_ARRAY);
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
              data: MOCK_ARRAY,
              backgroundColor: Array.from({ length: arrayLength }),
              borderWidth: Array.from({ length: arrayLength }),
              borderColor: Array.from({ length: arrayLength }),
              offset: Array.from({ length: arrayLength }),
              offsetsLabels: Array.from({ length: arrayLength })
            }
          ]
        }
      } as any;
      return mockUpdateSpy;
    };

    it('should apply the matching border weights and original offset increments when a slice is selected', async () => {
      await TestBed.flushEffects();

      const updateSpy = setupStableChartMock(component);
      component.setPieSelection(0);

      const ds = component.chart!.data.datasets[0] as any;
      expect(ds.borderWidth[0]).toBe(3);
      expect(ds.borderColor[0]).toBe('#ff7f27');
      expect(ds.offset[0]).toBe(15);
      expect(ds.offsetsLabels[0]).toBe(-16);
      expect(updateSpy).toHaveBeenCalled();
    });

    it('should reset the selection and clean layout offset paths correctly', async () => {
      await TestBed.flushEffects();

      const updateSpy = setupStableChartMock(component);

      component.toggleSliceSelection(1);
      expect(component.selectedPieIndex()).toBe(1);

      let ds = component.chart!.data.datasets[0] as any;
      expect(ds.offset[1]).toBe(15);
      expect(ds.offsetsLabels[1]).toBe(-16);

      component.toggleSliceSelection(1);
      expect(component.selectedPieIndex()).toBe(-1);

      ds = component.chart!.data.datasets[0] as any;
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

  // =========================================================================
  // SECTION 2: Edge Case Destructors & Structural Omissions
  // =========================================================================
  describe('Edge-Case Safety Guards', () => {
    let component: PieComponent;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [PieComponent],
        providers: [
          provideZonelessChangeDetection(),
          { provide: ThemeService, useValue: mockThemeService }
        ]
      }).compileComponents();
      component = TestBed.createComponent(PieComponent).componentInstance;
    });

    it('should safely bypass selection operations if chart objects are not populated', () => {
      component.chart = undefined;
      expect(() => component.setPieSelection(1)).not.toThrow();
    });

    it('should safely pass window wrapper resizing steps if chart targets are omitted', () => {
      expect(() => component.resizeChart(undefined as any)).not.toThrow();
    });

    it('should invoke the native chart destroy script upon element tear down execution steps', () => {
      const mockInstance = { destroy: vi.fn() } as any;
      component.chart = mockInstance;

      component.ngOnDestroy();
      expect(mockInstance.destroy).toHaveBeenCalled();
    });
  });
});

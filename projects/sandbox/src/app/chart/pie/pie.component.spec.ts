import { TestBed, ComponentFixture } from '@angular/core/testing';
import { PieComponent } from './pie.component';
import { ElementRef, signal, provideZonelessChangeDetection } from '@angular/core';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ThemeService } from '../../_services';

// 1. MOCK MODULES
vi.mock('chart.js', () => ({
  Chart: vi.fn(),
  registerables: []
}));
vi.mock('chartjs-plugin-datalabels', () => ({ default: {} }));

describe('PieComponent', () => {
  let component: PieComponent;
  let fixture: ComponentFixture<PieComponent>;
  let mockThemeService: { themeIndex: any };
  let mockChartInstance: any;

  beforeEach(async () => {
    mockThemeService = {
      themeIndex: signal(0)
    };

    vi.stubGlobal(
      'ResizeObserver',
      vi.fn(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn()
      }))
    );

    await TestBed.configureTestingModule({
      imports: [PieComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ThemeService, useValue: mockThemeService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PieComponent);
    component = fixture.componentInstance;

    // Stub drawChart to prevent JSDOM canvas crashes
    vi.spyOn(component as any, 'drawChart').mockImplementation(() => {});

    // Create Spy object for visual effect testing
    mockChartInstance = {
      destroy: vi.fn(),
      update: vi.fn(),
      resize: vi.fn(),
      data: {
        datasets: [
          {
            backgroundColor: [],
            borderWidth: [],
            borderColor: [],
            offset: []
          }
        ]
      }
    };

    // Inject mock into private signal
    (component as any)._chart.set(mockChartInstance);

    const mockCanvas = new ElementRef(document.createElement('canvas'));
    fixture.componentRef.setInput('pieCanvas', mockCanvas);
    fixture.componentRef.setInput('pieData', [10, 20]);
    fixture.componentRef.setInput('pieLabels', ['A', 'B']);
    fixture.componentRef.setInput('piePercentages', { 10: 33, 20: 67 });

    fixture.detectChanges();
  });

  it('should create and initialize the component', () => {
    expect(component).toBeTruthy();
  });

  it('should apply the 10px expansion offset when a slice is selected', () => {
    mockChartInstance.update.mockClear();
    component.setPieSelection(0);

    fixture.detectChanges();
    TestBed.flushEffects();

    const ds = mockChartInstance.data.datasets[0];
    expect(ds.offset[0]).toBe(10);
    expect(mockChartInstance.update).toHaveBeenCalledWith('none');
  });

  it('should reset the selection correctly', () => {
    // We test the method directly since the effect timing in tests can be flaky
    component.setPieSelection(1, true);
    expect(component.selectedPieIndex()).toBe(1);

    component.setPieSelection(-1, true);

    fixture.detectChanges();
    TestBed.flushEffects();

    expect(component.selectedPieIndex()).toBe(-1);
    expect(component.selectedPieIndexRetain()).toBe(-1);
  });

  it('should compute theme colours correctly for the template', () => {
    const config = component.themeConfig();
    expect(config.colours.length).toBe(8);
    expect(config.colours[0]).toBe('rgba(233, 244, 254, 1)');
    expect(config.border).toBe('#0a72c9');
  });

  it('should handle blurring the legend item', () => {
    component.setPieSelection(1, false);
    component.blurLegendItem();

    fixture.detectChanges();
    TestBed.flushEffects();

    expect(component.selectedPieIndexRetain()).toBe(-1);
  });

  it('should call resize on the chart instance', () => {
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

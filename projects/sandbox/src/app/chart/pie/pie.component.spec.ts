import { CUSTOM_ELEMENTS_SCHEMA, ElementRef, QueryList } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Chart, ChartEvent, LegendItem } from 'chart.js';
import { Context } from 'chartjs-plugin-datalabels';
import { FormatLicensePipe, FormatTierDimensionPipe } from '../../_translate';
import { PieComponent } from '.';

describe('PieComponent', () => {
  let component: PieComponent;
  let fixture: ComponentFixture<PieComponent>;

  const mockElementRef = {
    nativeElement: {}
  };

  const configureTestbed = (): void => {
    TestBed.configureTestingModule({
      imports: [PieComponent, FormatLicensePipe, FormatTierDimensionPipe],
      providers: [FormatTierDimensionPipe],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(PieComponent);
    component = fixture.componentInstance;
  };

  beforeEach(async(configureTestbed));
  beforeEach(b4Each);

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(fixture).toBeTruthy();
  });

  it('should implement after content checked', () => {
    const makeFakeElement = (): LegendItem => {
      return ({
        nativeElement: {
          focus: jasmine.createSpy()
        }
      } as unknown) as LegendItem;
    };
    const legendItems = [makeFakeElement(), makeFakeElement(), makeFakeElement()];
    component.legendElements = Object.assign(new QueryList(), {
      _results: legendItems
    }) as QueryList<ElementRef>;

    component.selectedPieIndexRetain = 2;
    component.selectedPieIndex = 1;
    component.ngAfterContentChecked();
    expect(component.selectedPieIndexRetain).toEqual(1);
  });

  it('should blur the legend item', () => {
    component.selectedPieIndexRetain = 1;
    component.blurLegendItem();
    expect(component.selectedPieIndexRetain).toEqual(-1);
  });

  it('should reset the selection when the dimension changes', () => {
    component.selectedPieIndex = 1;
    component.selectedPieIndexRetain = 1;

    expect(component.selectedPieIndex).toBeTruthy();
    component.pieDimension = 'content-tier';
    expect(component.pieDimension).toEqual('content-tier');

    expect(component.selectedPieIndex).toEqual(-1);
    expect(component.selectedPieIndexRetain).toEqual(-1);
  });

  it('should get percentage values', () => {
    const vals = { 1: 2, 2: 3, 3: 12 };
    component.piePercentages = vals;
    expect(component.getPercentageValue(1)).toEqual(`${vals[1]}%`);
    expect(component.getPercentageValue(2)).toEqual(`${vals[2]}%`);
    expect(component.getPercentageValue(3)).toEqual(`${vals[3]}%`);
  });

  it('should draw the chart', () => {
    component.pieCanvas = {} as ElementRef;
    component.drawChart();
    expect(component.chart).toBeFalsy();
    component.pieCanvas = mockElementRef;
    expect(component.chart).toBeFalsy();
    component.drawChart();
    expect(component.chart).toBeFalsy();
    component.pieLabels = ['a', 'b', 'c'];
    expect(component.chart).toBeFalsy();
    component.drawChart();
    expect(component.chart).toBeFalsy();
    component.piePercentages = { 1: 2, 2: 3, 3: 12 };
    component.drawChart();
    expect(component.chart).toBeFalsy();
    component.pieData = [1, 2, 3];
    expect(component.chart).toBeTruthy();
    expect(component.chart.options).toBeTruthy();

    component.chart = ({
      data: false,
      update: jasmine.createSpy()
    } as unknown) as Chart;
    component.drawChart();
    expect(component.chart.data).toBeTruthy();
  });

  it('set the pie selection', () => {
    component.pieCanvas = {} as ElementRef;
    component.pieLabels = ['a', 'b', 'c'];
    component.piePercentages = { 1: 2, 2: 3, 3: 12 };
    component.pieData = [1, 2, 3];
    component.chart = ({
      data: false,
      update: jasmine.createSpy()
    } as unknown) as Chart;

    spyOn(component.pieSelectionSet, 'emit');

    component.setPieSelection();
    expect(component.selectedPieIndexRetain).toEqual(-1);
    expect(component.pieSelectionSet.emit).not.toHaveBeenCalled();

    component.setPieSelection(1);
    expect(component.selectedPieIndexRetain).toEqual(1);
    expect(component.pieSelectionSet.emit).not.toHaveBeenCalled();

    component.setPieSelection(2, true);
    expect(component.selectedPieIndexRetain).toEqual(2);
    expect(component.pieSelectionSet.emit).toHaveBeenCalled();

    component.setPieSelection(-1, true);
    expect(component.selectedPieIndexRetain).toEqual(2);
    expect(component.pieSelectionSet.emit).toHaveBeenCalledTimes(2);
  });

  it('should handle pie clicks', () => {
    spyOn(component, 'setPieSelection');
    component.chart = ({
      getElementsAtEventForMode: (_: Event, __: string, ___: unknown): Array<{ index: number }> => {
        return [
          {
            index: 1
          }
        ];
      }
    } as unknown) as Chart;

    const chartEvent = ({} as unknown) as ChartEvent;
    component.pieClicked(chartEvent);
    expect(component.setPieSelection).toHaveBeenCalled();

    component.selectedPieIndex = 1;
    component.pieClicked(chartEvent);
    expect(component.setPieSelection).toHaveBeenCalledTimes(2);
  });

  it('should update the labels', () => {
    expect(component.legendItems.length).toBeFalsy();
    component.generateLegendLabels(({
      options: {
        plugins: {
          legend: {
            labels: {
              generateLabels: () => ['1', '2']
            }
          }
        }
      }
    } as unknown) as Chart);
    expect(component.legendItems.length).toBeTruthy();
  });

  it('should handle hovering', () => {
    const el = {
      style: {
        cursor: ''
      }
    };
    const evt = ({
      native: {
        target: el
      }
    } as unknown) as ChartEvent;
    expect(el.style.cursor).toBe('');
    component.chartOnHover(evt, { length: 0 });
    expect(el.style.cursor).toBe('default');
    component.chartOnHover(evt, { length: 1 });
    expect(el.style.cursor).toBe('pointer');
  });

  it('should get the label color', () => {
    const ctx = ({ dataIndex: 1 } as unknown) as Context;
    expect(component.getDataLabelsColor(ctx)).not.toEqual('white');
    ctx.dataIndex = 5;
    expect(component.getDataLabelsColor(ctx)).toEqual('white');
  });

  it('should hide labels for low percentages', () => {
    component.piePercentages = [1, 50];
    expect(component.getDataLabelsFormatter(0)).toEqual('');
    expect(component.getDataLabelsFormatter(1)).toEqual('50%');
  });

  it('should create the tooltip', () => {
    const vals = { a: 2, b: 3, c: 12 };
    component.piePercentages = vals;
    component.selectedPieIndex = 0;
    component.pieLabels = ['a', 'b', 'c'];

    const parentNode = ({
      querySelector: (_: string) => {
        return null;
      },
      appendChild: jasmine.createSpy()
    } as unknown) as HTMLElement;

    const emptyTooltip = {
      options: {
        bodyFont: ''
      },
      style: {}
    };

    const tooltip = Object.assign(structuredClone(emptyTooltip), {
      body: ['the', 'body', 'lines'],
      labelColors: ['#fff', '#fff', '#fff'],
      opacity: 1,
      titleLines: ['a', 'title', 'entry']
    });

    component.getOrCreateTooltip(parentNode, tooltip, 0, 0);
    expect(parentNode.appendChild).toHaveBeenCalled();

    component.pieLabels[0] = 0;
    component.getOrCreateTooltip(parentNode, tooltip, 0, 0);
    expect(parentNode.appendChild).toHaveBeenCalledTimes(2);

    tooltip.opacity = 0;
    component.getOrCreateTooltip(parentNode, tooltip, 0, 0);
    expect(parentNode.appendChild).toHaveBeenCalledTimes(3);

    // indirect invocation via position function
    component.positionTooltip({
      chart: ({
        canvas: {
          positionX: 0,
          positionY: 0,
          parentNode: parentNode
        }
      } as unknown) as Chart,
      tooltip: tooltip
    });

    expect(parentNode.appendChild).toHaveBeenCalledTimes(4);

    component.getOrCreateTooltip(parentNode, emptyTooltip, 0, 0);
    expect(parentNode.appendChild).toHaveBeenCalledTimes(5);
  });

  it('should resize the chart', () => {
    spyOn(window, 'getComputedStyle').and.callFake(() => {
      return ({ width: '10px' } as unknown) as CSSStyleDeclaration;
    });
    const chart = ({
      canvas: {
        parentNode: {}
      },
      resize: jasmine.createSpy()
    } as unknown) as Chart;

    component.resizeChart(chart);
    expect(window.getComputedStyle).toHaveBeenCalled();
    expect(chart.resize).toHaveBeenCalled();
  });
});

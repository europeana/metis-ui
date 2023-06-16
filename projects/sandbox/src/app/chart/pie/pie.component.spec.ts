import { CUSTOM_ELEMENTS_SCHEMA, ElementRef, QueryList } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Chart, ChartEvent, LegendItem } from 'chart.js';
import { PieComponent } from '.';

describe('PieComponent', () => {
  let component: PieComponent;
  let fixture: ComponentFixture<PieComponent>;

  const mockElementRef = {
    nativeElement: {}
  };

  const configureTestbed = (): void => {
    TestBed.configureTestingModule({
      declarations: [PieComponent],
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
    component.piePercentages = { 1: 2, 2: 3, 3: 12 };
    expect(component.getPercentageValue(1)).toEqual(2);
    expect(component.getPercentageValue(2)).toEqual(3);
    expect(component.getPercentageValue(3)).toEqual(12);
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
});

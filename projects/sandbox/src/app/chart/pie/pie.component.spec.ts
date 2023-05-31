import { CUSTOM_ELEMENTS_SCHEMA, ElementRef } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Chart } from 'chart.js';
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

  it('should get percentage values', () => {
    component.piePercentages = { 1: '2%', 2: '3%', 3: '12%' };
    expect(component.getPercentageValue(1)).toEqual('2%');
    expect(component.getPercentageValue(2)).toEqual('3%');
    expect(component.getPercentageValue(3)).toEqual('12%');
  });

  it('should draw after content init', () => {
    spyOn(component, 'drawChart');
    component.ngAfterContentInit();
    expect(component.drawChart).toHaveBeenCalled();
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
    component.piePercentages = { 1: '2%', 2: '3%', 3: '12%' };
    component.drawChart();
    expect(component.chart).toBeFalsy();
    component.pieData = [1, 2, 3];
    expect(component.chart).toBeFalsy();
    component.drawChart();
    expect(component.chart).toBeTruthy();
    expect(component.chart.options).toBeTruthy();

    component.chart = ({
      data: false,
      update: jasmine.createSpy()
    } as unknown) as Chart;
    component.drawChart();
    expect(component.chart.data).toBeTruthy();
  });
});

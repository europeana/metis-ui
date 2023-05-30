import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormatTierDimensionPipe } from '../_translate';
import { DatasetContentSummaryComponent } from '.';

describe('DatasetContentSummaryComponent', () => {
  let component: DatasetContentSummaryComponent;
  let fixture: ComponentFixture<DatasetContentSummaryComponent>;

  const configureTestbed = (): void => {
    TestBed.configureTestingModule({
      declarations: [DatasetContentSummaryComponent, FormatTierDimensionPipe],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(DatasetContentSummaryComponent);
    component = fixture.componentInstance;
  };

  beforeEach(async(configureTestbed));
  beforeEach(b4Each);

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(fixture).toBeTruthy();
  });

  it('should flag when ready', fakeAsync(() => {
    expect(component.ready).toBeFalsy();
    tick();
    expect(component.ready).toBeFalsy();
    component.isVisible = true;
    expect(component.isVisible).toBeTruthy();
    expect(component.ready).toBeTruthy();
  }));

  it('should format the data for the chart', () => {
    expect(component.pieData.length).toEqual(0);
    expect(component.pieLabels.length).toEqual(0);

    component.fmtDataForChart();

    expect(component.pieData.length).toBeGreaterThan(0);
    expect(component.pieLabels.length).toBeGreaterThan(0);
  });
});

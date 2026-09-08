import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SortDirection } from '../../../_models';
import { SortableHeaderComponent } from '../sortable-header';
import { SortableGroupComponent } from '.';

describe('SortableGroupComponent', () => {
  let fixture: ComponentFixture<SortableGroupComponent>;
  let component: SortableGroupComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SortableGroupComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SortableGroupComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('grpConf', {
      cssClass: 'grid-header',
      items: [
        {
          translateKey: 'depublicationColRecordId',
          fieldName: 'recordId'
        }
      ]
    });

    fixture.detectChanges();
  });

  it('should invoke the header reset function when a value is set', () => {
    const testHeader = {
      sortName: 'header_1',
      cssClass: 'dynamic-class',
      text: 'Header 1',
      reset: (): void => undefined
    };
    spyOn(testHeader, 'reset');

    Object.defineProperty(component, 'headers', {
      get: () => () => [(testHeader as unknown) as SortableHeaderComponent],
      configurable: true
    });

    component.onSetHandler({ field: 'id', direction: SortDirection.ASC });
    expect(testHeader.reset).toHaveBeenCalled();
  });

  it('should emit events on set', () => {
    spyOn(component.groupSet, 'emit').and.callThrough();
    component.onSetHandler({ field: 'id', direction: SortDirection.ASC });
    expect(component.groupSet.emit).toHaveBeenCalled();
  });

  it('should emit events on select', () => {
    spyOn(component.selectedAll, 'emit').and.callThrough();
    component.selectAllHandler(true);
    expect(component.selectedAll.emit).toHaveBeenCalledWith(true);
    component.selectAllHandler(false);
    expect(component.selectedAll.emit).toHaveBeenCalledWith(false);
  });
});

import { NO_ERRORS_SCHEMA, QueryList, TemplateRef } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SortDirection } from '../../../_models';
import { SortableHeaderComponent } from '../sortable-header';
import { SortableGroupComponent } from '.';

describe('SortableGroupComponent', () => {
  let fixture: ComponentFixture<SortableGroupComponent>;
  let component: SortableGroupComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SortableGroupComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SortableGroupComponent);
    fixture.detectChanges();
    component = fixture.componentInstance;
    component.grpConf = {
      cssClass: 'grid-header',
      items: [
        {
          translateKey: 'depublicationColRecordId',
          fieldName: 'recordId'
        }
      ]
    };
    component.sortableGroupTemplate = ({ nativeElement: {} } as unknown) as TemplateRef<
      HTMLElement
    >;
  });

  it('should invoke the header reset function when a value is set', () => {
    const testHeader = {
      sortName: 'header_1',
      cssClass: 'dynamic-class',
      text: 'Header 1',
      reset: (): void => undefined
    };
    spyOn(testHeader, 'reset');
    component.headers = ([testHeader] as unknown) as QueryList<SortableHeaderComponent>;

    component.onSetHandler({ field: 'id', direction: SortDirection.ASC });
    expect(testHeader.reset).toHaveBeenCalled();
  });

  it('should emit events on set', () => {
    spyOn(component.onGroupSet, 'emit').and.callThrough();
    component.onSetHandler({ field: 'id', direction: SortDirection.ASC });
    expect(component.onGroupSet.emit).toHaveBeenCalled();
  });

  it('should emit events on select', () => {
    spyOn(component.onSelectAll, 'emit').and.callThrough();
    component.selectAllHandler(true);
    expect(component.onSelectAll.emit).toHaveBeenCalledWith(true);
    component.selectAllHandler(false);
    expect(component.onSelectAll.emit).toHaveBeenCalledWith(false);
  });
});

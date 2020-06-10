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
    component.conf = {
      cssClass: 'grid-header',
      items: [
        {
          translateKey: 'depublicationColRecordId',
          fieldName: 'recordId'
        }
      ]
    };
    component.sortableGroupTemplate = ({ nativeElement: {} } as any) as TemplateRef<HTMLElement>;
  });

  it('should invoke the header reset function when a value is set', () => {
    const testHeader = {
      sortName: 'header_1',
      cssClass: 'dynamic-class',
      text: 'Header 1',
      reset: () => {}
    };
    spyOn(testHeader, 'reset');
    component.headers = ([testHeader] as any) as QueryList<SortableHeaderComponent>;

    component.onSetHandler({ field: 'id', direction: SortDirection.ASC });
    expect(testHeader.reset).toHaveBeenCalled();
  });

  it('should emit events', () => {
    spyOn(component.onGroupSet, 'emit').and.callThrough();
    component.onSetHandler({ field: 'id', direction: SortDirection.ASC });
    expect(component.onGroupSet.emit).toHaveBeenCalled();
  });
});

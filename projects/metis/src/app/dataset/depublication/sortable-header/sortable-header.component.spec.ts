import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { createMockPipe } from '../../../_mocked';
import { SortableHeaderComponent } from '.';

describe('SortableHeaderComponent', () => {
  let fixture: ComponentFixture<SortableHeaderComponent>;
  let component: SortableHeaderComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SortableHeaderComponent, createMockPipe('translate')]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SortableHeaderComponent);
    component = fixture.componentInstance;
    component.conf = {
      translateKey: 'key',
      fieldName: 'fName',
      cssClass: 'clss'
    };
  });

  it('is not sorted by default', () => {
    expect(fixture.nativeElement.classList.contains('desc')).toBeFalsy();
    expect(fixture.nativeElement.classList.contains('asc')).toBeFalsy();

    expect(fixture.debugElement.query(By.css('.desc'))).toBeFalsy();
    expect(fixture.debugElement.query(By.css('.asc'))).toBeFalsy();
  });

  it('it bumps current', () => {
    expect(component.current).toEqual(0);
    component.valueBump();
    expect(component.current).toEqual(1);
    component.valueBump();
    expect(component.current).toEqual(2);
    component.valueBump();
    expect(component.current).toEqual(0);
  });

  it('resets', () => {
    component.current = 1;
    component.reset();
    expect(component.current).toEqual(0);
  });

  it('can block reset', () => {
    component.current = 1;

    component.isLocked = true;
    component.reset();

    expect(component.current).toEqual(1);

    component.isLocked = false;
    component.reset();

    expect(component.current).toEqual(0);
  });

  it('should toggle the select all', () => {
    component.allSelected = false;
    component.toggleSelectAll();
    expect(component.allSelected).toBeTruthy();
  });
});

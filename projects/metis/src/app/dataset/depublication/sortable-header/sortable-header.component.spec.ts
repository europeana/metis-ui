import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { createMockPipe } from 'shared';
import { MockTranslateService } from '../../../_mocked';
import { TranslatePipe, TranslateService } from '../../../_translate';
import { SortableHeaderComponent } from '.';

describe('SortableHeaderComponent', () => {
  let fixture: ComponentFixture<SortableHeaderComponent>;
  let component: SortableHeaderComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SortableHeaderComponent],
      providers: [
        {
          provide: TranslatePipe,
          useValue: createMockPipe('translate')
        },
        {
          provide: TranslateService,
          useClass: MockTranslateService
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SortableHeaderComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('conf', {
      translateKey: 'key',
      fieldName: 'fName',
      cssClass: 'clss'
    });

    fixture.detectChanges();
  });

  it('is not sorted by default', () => {
    expect(fixture.nativeElement.classList.contains('desc')).toBeFalsy();
    expect(fixture.nativeElement.classList.contains('asc')).toBeFalsy();

    expect(fixture.debugElement.query(By.css('.desc'))).toBeFalsy();
    expect(fixture.debugElement.query(By.css('.asc'))).toBeFalsy();
  });

  it('it bumps current', () => {
    expect(component.current()).toEqual(0);
    component.valueBump();
    expect(component.current()).toEqual(1);
    component.valueBump();
    expect(component.current()).toEqual(2);
    component.valueBump();
    expect(component.current()).toEqual(0);
  });

  it('resets', () => {
    component.current.set(1);
    component.reset();
    expect(component.current()).toEqual(0);
  });

  it('can block reset', () => {
    component.current.set(1);

    (component as any).isLocked = true;
    component.reset();

    expect(component.current()).toEqual(1);

    (component as any).isLocked = false;
    component.reset();

    expect(component.current()).toEqual(0);
  });

  it('should toggle the select all', () => {
    component.allSelectedState.set(false);
    component.toggleSelectAll();
    expect(component.allSelectedState()).toBeTruthy();
  });
});

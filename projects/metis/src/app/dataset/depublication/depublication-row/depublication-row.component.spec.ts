import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DepublicationStatus } from '../../../_models';
import { DepublicationRowComponent } from '.';

describe('DepublicationRowComponent', () => {
  let component: DepublicationRowComponent;
  let fixture: ComponentFixture<DepublicationRowComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DepublicationRowComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(DepublicationRowComponent);
    component = fixture.componentInstance;
    component.record = {
      recordId: '1',
      depublicationStatus: DepublicationStatus.DEPUBLISHED,
      depublicationReason: 'reason'
    };
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle checkbox selections', () => {
    spyOn(component.checkEvents, 'emit');
    component.onChange(true);
    expect(component.checkEvents.emit).toHaveBeenCalled();
  });

  it('should disable checkboxes', () => {
    expect(component.checkboxDisabled()).toBeTruthy();
    component.record.depublicationStatus = DepublicationStatus.PENDING;
    expect(component.checkboxDisabled()).toBeFalsy();
  });
});

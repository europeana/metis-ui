import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ProgressTrackerComponent } from './progress-tracker.component';
import { testDatasetInfo } from '../_mocked';

describe('ProgressTrackerComponent', () => {
  let component: ProgressTrackerComponent;
  let fixture: ComponentFixture<ProgressTrackerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProgressTrackerComponent],
      imports: [ReactiveFormsModule]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressTrackerComponent);
    component = fixture.componentInstance;
    component.progressData = testDatasetInfo[0];
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

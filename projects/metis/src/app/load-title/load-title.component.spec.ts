import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { LoadTitleComponent } from '.';

describe('LoadTitleComponent (Zoneless)', () => {
  let fixture: ComponentFixture<LoadTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadTitleComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LoadTitleComponent);
    fixture.componentRef.setInput('title', 'Dashboard');
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should update the spinner class based on loading state', async () => {
    let spinnerElements = fixture.debugElement.queryAll(By.css('.svg-icon-spin.showing'));
    expect(spinnerElements.length).toBe(0);

    fixture.componentRef.setInput('isLoading', true);
    fixture.detectChanges();
    await fixture.whenStable();

    spinnerElements = fixture.debugElement.queryAll(By.css('.svg-icon-spin.showing'));
    expect(spinnerElements.length).toBe(1);
  });
});

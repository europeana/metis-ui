import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { LoadTitleComponent } from '.';

describe('LoadTitleComponent', () => {
  let component: LoadTitleComponent;
  let fixture: ComponentFixture<LoadTitleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoadTitleComponent]
    });
    fixture = TestBed.createComponent(LoadTitleComponent);
    component = fixture.componentInstance;
  });

  it('should update the spinner', () => {
    expect(fixture.debugElement.queryAll(By.css('.svg-icon-spin.showing')).length).toBeFalsy();
    component.isLoading = true;
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.svg-icon-spin.showing')).length).toBeTruthy();
  });
});

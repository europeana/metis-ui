import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingButtonComponent } from '.';

describe('LoadingButtonComponent', () => {
  let component: LoadingButtonComponent;
  let fixture: ComponentFixture<LoadingButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LoadingButtonComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadingButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should cancel if disabled', () => {
    const testEvent = ({
      preventDefault: jasmine.createSpy(),
      stopImmediatePropagation: jasmine.createSpy()
    } as unknown) as Event;

    component.cancelIfDisabled(testEvent);

    expect(testEvent.preventDefault).not.toHaveBeenCalled();
    expect(testEvent.stopImmediatePropagation).not.toHaveBeenCalled();

    component.disabled = true;
    component.cancelIfDisabled(testEvent);

    expect(testEvent.preventDefault).toHaveBeenCalled();
    expect(testEvent.stopImmediatePropagation).toHaveBeenCalled();
  });
});

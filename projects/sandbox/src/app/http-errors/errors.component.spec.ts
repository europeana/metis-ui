import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpErrorsComponent } from './errors.component';

describe('HttpErrorsComponent', () => {
  let component: HttpErrorsComponent;
  let fixture: ComponentFixture<HttpErrorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpErrorsComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(HttpErrorsComponent);
    component = fixture.componentInstance;
  });

  it('should compute error details when error input changes', async () => {
    const mockError = new HttpErrorResponse({
      error: { message: 'Specific Backend Error' },
      status: 400,
      statusText: 'Bad Request'
    });

    // Set the signal input using the TestComponent or set method in modern TestBed
    fixture.componentRef.setInput('error', mockError);

    // In zoneless, we wait for the microtask to resolve the computed signals
    await fixture.whenStable();

    expect(component.statusCode()).toBe(400);
    expect(component.errorMessage()).toBe('Specific Backend Error');
    expect(component.isShowing()).toBe(true);
  });

  it('should emit onClose when close is called', () => {
    const spy = vi.spyOn(component.onClose, 'emit');
    component.close();
    expect(spy).toHaveBeenCalled();
  });
});

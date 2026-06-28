import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpErrorsComponent } from './errors.component';

describe('HttpErrorsComponent', () => {
  let component: HttpErrorsComponent;
  let fixture: ComponentFixture<HttpErrorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
      imports: [HttpErrorsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(HttpErrorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created with default undefined inputs', () => {
    expect(component).toBeTruthy();
    expect(component.error()).toBeUndefined();
  });

  it('should cleanly accept an HttpErrorResponse instance input signal', () => {
    const mockError = new HttpErrorResponse({
      error: { status: 'PAYLOAD_TOO_LARGE', message: 'File too large' },
      status: 413,
      statusText: 'Payload Too Large'
    });
    fixture.componentRef.setInput('error', mockError);
    fixture.detectChanges();
    expect(component.error()).toEqual(mockError);
  });

  it('should emit onClose output when triggered', () => {
    const emitSpy = vi.fn();
    component.onClose.subscribe(emitSpy);
    component.onClose.emit();
    expect(emitSpy).toHaveBeenCalled();
  });
});

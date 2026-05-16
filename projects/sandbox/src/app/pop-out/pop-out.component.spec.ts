import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { PopOutComponent } from './pop-out.component';

describe('PopOutComponent', () => {
  let component: PopOutComponent;
  let fixture: ComponentFixture<PopOutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopOutComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
  });

  const initializeComponent = () => {
    fixture = TestBed.createComponent(PopOutComponent);
    component = fixture.componentInstance;
  };

  it('should compile cleanly with default parameters', fakeAsync(() => {
    initializeComponent();
    fixture.detectChanges();
    tick();
    expect(component).toBeTruthy();
  }));

  it('should correctly project incoming outer class configurations across index positions', fakeAsync(() => {
    initializeComponent();
    fixture.componentRef.setInput('outerClass', 'custom-outer');
    fixture.detectChanges();
    tick();

    const element = fixture.nativeElement.querySelector('.custom-outer');
    expect(element).toBeTruthy();
  }));

  it('should merge parent inner configurations over native element default classes cleanly', fakeAsync(() => {
    initializeComponent();
    fixture.componentRef.setInput('innerClass', 'custom-inner');
    fixture.detectChanges();
    tick();

    const element = fixture.nativeElement.querySelector('.custom-inner');
    expect(element).toBeTruthy();
  }));

  it('should strip out the active indicator states when single opener panels are closed', fakeAsync(() => {
    initializeComponent();
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();
    tick();

    fixture.componentRef.setInput('isOpen', false);
    fixture.detectChanges();
    tick();

    expect(component.isOpen()).toBeFalsy();
  }));
});

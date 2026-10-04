import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingButtonComponent } from '.';

describe('LoadingButtonComponent (Zoneless)', () => {
  let component: LoadingButtonComponent;
  let fixture: ComponentFixture<LoadingButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingButtonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingButtonComponent);
    component = fixture.componentInstance;

    // Set mandatory required inputs before rendering
    fixture.componentRef.setInput('title', 'Submit');
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit onClick event when clicked', async () => {
    spyOn(component.onClick, 'emit');
    component.click();
    expect(component.onClick.emit).toHaveBeenCalled();
  });

  it('should render loading text when loading', async () => {
    fixture.componentRef.setInput('title', 'Save');
    fixture.componentRef.setInput('loadingTitle', 'Saving...');
    fixture.componentRef.setInput('isLoading', true);

    fixture.detectChanges();

    await fixture.whenStable();

    const buttonEl: HTMLElement = fixture.nativeElement.querySelector('button');
    expect(buttonEl.textContent?.trim()).toContain('Saving...');
  });
});

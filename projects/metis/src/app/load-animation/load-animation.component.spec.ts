import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadAnimationComponent } from '.';

describe('LoadAnimationComponent (Zoneless TestBed)', () => {
  let component: LoadAnimationComponent;
  let fixture: ComponentFixture<LoadAnimationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadAnimationComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LoadAnimationComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should update the message and update the DOM element string', async () => {
    fixture.componentRef.setInput('resources', { res1: true, res2: false, res3: true });
    fixture.detectChanges();
    await fixture.whenStable();

    const messageEl: HTMLElement = fixture.nativeElement.querySelector('.spinner-message');
    expect(component.message()).toBe('Loading res1, res3...');
    expect(messageEl.textContent?.trim()).toBe('Loading res1, res3...');
  });
});

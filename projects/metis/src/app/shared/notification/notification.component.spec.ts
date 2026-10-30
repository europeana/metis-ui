import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationType } from '../../_models';
import { NotificationComponent } from '.';

describe('NotificationComponent (Zoneless)', () => {
  let component: NotificationComponent;
  let fixture: ComponentFixture<NotificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit an event when closed', () => {
    vi.spyOn(component.closed, 'emit');

    fixture.componentRef.setInput('notification', {
      content: 'Test',
      type: NotificationType.ERROR
    });
    fixture.detectChanges();

    component.close();
    expect(component.closed.emit).toHaveBeenCalled();
  });

  it('should not emit an event when closed if event is sticky', () => {
    vi.spyOn(component.closed, 'emit');

    fixture.componentRef.setInput('notification', {
      content: 'Test',
      type: NotificationType.ERROR,
      sticky: true
    });
    fixture.detectChanges();

    component.close();
    expect(component.closed.emit).not.toHaveBeenCalled();
  });

  describe('Auto-close fading operations', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should auto-close when fading out using native clock triggers', () => {
      vi.spyOn(component.closed, 'emit');

      fixture.componentRef.setInput('notification', {
        content: 'Test',
        type: NotificationType.ERROR,
        fadeTime: 100
      });
      fixture.detectChanges();

      vi.advanceTimersByTime(400);
      fixture.detectChanges();
      expect(component.hidden()).toBe(true);
      expect(component.closed.emit).not.toHaveBeenCalled();

      vi.advanceTimersByTime(400);
      fixture.detectChanges();
      expect(component.closed.emit).toHaveBeenCalled();
    });
  });
});

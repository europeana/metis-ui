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
    spyOn(component.closed, 'emit');

    fixture.componentRef.setInput('notification', {
      content: 'Test',
      type: NotificationType.ERROR
    });
    fixture.detectChanges();

    component.close();
    expect(component.closed.emit).toHaveBeenCalled();
  });

  it('should not emit an event when closed if event is sticky', () => {
    spyOn(component.closed, 'emit');

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
      jasmine.clock().install();
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it('should auto-close when fading out using native clock triggers', () => {
      spyOn(component.closed, 'emit');

      fixture.componentRef.setInput('notification', {
        content: 'Test',
        type: NotificationType.ERROR,
        fadeTime: 100
      });
      fixture.detectChanges();

      jasmine.clock().tick(100);
      fixture.detectChanges();
      expect(component.hidden()).toBeTrue();
      expect(component.closed.emit).not.toHaveBeenCalled();

      jasmine.clock().tick(400);
      fixture.detectChanges();
      expect(component.closed.emit).toHaveBeenCalled();
    });
  });
});

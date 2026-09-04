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
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit an event when closed', async () => {
    spyOn(component.closed, 'emit');

    fixture.componentRef.setInput('notification', {
      content: 'Test',
      type: NotificationType.ERROR
    });
    await fixture.whenStable();

    component.close();
    expect(component.closed.emit).toHaveBeenCalled();
  });

  it('should not emit an event when closed if event is sticky', async () => {
    spyOn(component.closed, 'emit');

    fixture.componentRef.setInput('notification', {
      content: 'Test',
      type: NotificationType.ERROR,
      sticky: true
    });
    await fixture.whenStable();

    component.close();
    expect(component.closed.emit).not.toHaveBeenCalled();
  });

  describe('Auto-close fading operations', () => {
    beforeEach(() => {
      jasmine.clock().install(); // Intercepts setTimeout without Zone.js
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it('should auto-close when fading out using native clock triggers', async () => {
      spyOn(component.closed, 'emit');

      fixture.componentRef.setInput('notification', {
        content: 'Test',
        type: NotificationType.ERROR,
        fadeTime: 100
      });
      await fixture.whenStable();

      jasmine.clock().tick(100);
      await fixture.whenStable(); // Await state update rendering
      expect(component.hidden()).toBeTrue();
      expect(component.closed.emit).not.toHaveBeenCalled();

      jasmine.clock().tick(400);
      await fixture.whenStable();
      expect(component.closed.emit).toHaveBeenCalled();
    });
  });
});

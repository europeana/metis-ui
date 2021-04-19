import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NotificationType } from '../../_models';
import { NotificationComponent } from '.';

describe('NotificationComponent', () => {
  let component: NotificationComponent;
  let fixture: ComponentFixture<NotificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NotificationComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit an event when closed', () => {
    spyOn(component.closed, 'emit');

    component.notification = {
      content: 'Test',
      type: NotificationType.ERROR
    };
    component.close();
    expect(component.closed.emit).toHaveBeenCalled();
  });

  it('should not emit an event when closed if event is sticky', () => {
    spyOn(component.closed, 'emit');

    component.notification = {
      content: 'Test',
      type: NotificationType.ERROR,
      sticky: true
    };
    component.close();
    expect(component.closed.emit).not.toHaveBeenCalled();
  });

  it('should auto-close when fading out', fakeAsync(() => {
    spyOn(component.closed, 'emit');
    component.notification = {
      content: 'Test',
      type: NotificationType.ERROR,
      fadeTime: 100
    };
    tick(0);
    expect(component.closed.emit).not.toHaveBeenCalled();
    tick(1000);
    tick(1000);
    expect(component.closed.emit).toHaveBeenCalled();
  }));
});

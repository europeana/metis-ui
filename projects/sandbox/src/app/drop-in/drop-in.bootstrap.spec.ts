import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { DropInBootstrap } from './_bootstrap.component';

describe('DropInBootstrap', () => {
  let fixture: ComponentFixture<DropInBootstrap>;
  let component: DropInBootstrap;

  const configureTestbed = (): void => {
    TestBed.overrideComponent(DropInBootstrap, {
      set: {
        template: '<a class="progress-orb">'
      }
    }).compileComponents();
    fixture = TestBed.createComponent(DropInBootstrap);
    component = fixture.componentInstance;
  };

  beforeEach(() => {
    configureTestbed();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should init', fakeAsync(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__env = (window as any).__env || {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((window as any).__env['test-user-datasets']).toBeFalsy();
    component.ngAfterViewInit();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((window as any).__env['test-user-datasets']).toBeTruthy();
    tick();
  }));
});

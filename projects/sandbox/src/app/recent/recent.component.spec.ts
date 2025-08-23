import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecentComponent } from '.';

describe('RecentComponent', () => {
  let component: RecentComponent;
  let fixture: ComponentFixture<RecentComponent>;

  const configureTestbed = (): void => {
    TestBed.configureTestingModule({
      imports: [RecentComponent],
      providers: []
    }).compileComponents();
  };

  const b4Each = (): void => {
    configureTestbed();
    fixture = TestBed.createComponent(RecentComponent);
    component = fixture.componentInstance;
  };

  beforeEach(b4Each);

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle the menu', () => {
    component.menuOpen = false;
    component.toggleMenu();
    expect(component.menuOpen).toBeTruthy();
    component.toggleMenu();
    expect(component.menuOpen).toBeFalsy();
    component.toggleMenu();
    expect(component.menuOpen).toBeTruthy();
    component.toggleMenu();
    expect(component.menuOpen).toBeFalsy();
  });

  it('should emit events', () => {
    spyOn(component.showAllRecent, 'emit');
    component.showAll();
    expect(component.showAllRecent.emit).toHaveBeenCalled();
  });
});

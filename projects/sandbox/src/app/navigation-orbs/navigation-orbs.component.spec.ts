import { ComponentFixture, TestBed } from '@angular/core/testing';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { ClassMap } from 'shared';
import { NavigationOrbsComponent } from '.';

describe('NavigationOrbsComponent', () => {
  let component: NavigationOrbsComponent;
  let fixture: ComponentFixture<NavigationOrbsComponent>;

  const configureTestbed = (): void => {
    TestBed.configureTestingModule({
      imports: [NavigationOrbsComponent]
    }).compileComponents();
  };

  const b4Each = (): void => {
    configureTestbed();
    fixture = TestBed.createComponent(NavigationOrbsComponent);
    component = fixture.componentInstance;
  };

  beforeEach(b4Each);

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.fnClassMapOuter()(0)).toEqual({});
    expect(component.fnClassMapInner(0)).toEqual({});
  });

  it('should set the indicator attributes', () => {
    expect(Object.keys(component._indicatorAttributes).length).toEqual(0);
    component.indicatorAttributes = ['a', 'b'];
    expect(Object.keys(component._indicatorAttributes).length).toEqual(2);
  });

  it('should get the modified tab index', () => {
    expect(component.getModifiedTabIndex(1)).toEqual(0);
    component.tabIndex = 1;
    expect(component.getModifiedTabIndex(1)).toEqual(1);

    const classMap = {
      locked: true,
      'is-active': false
    };

    component.fnClassMapInner = (_): ClassMap => {
      return classMap;
    };

    expect(component.getModifiedTabIndex(1)).toEqual(-1);

    classMap.locked = false;
    expect(component.getModifiedTabIndex(1)).toEqual(1);

    classMap['is-active'] = true;
    expect(component.getModifiedTabIndex(1)).toEqual(-1);
  });

  it('should get the tooltip', () => {
    const defTooltip = 'default tooltip';
    const tooltips = ['one', 'two', 'three'];
    const indexes = [0, 1, 2];

    component.tooltips = tooltips;
    component.tooltipDefault = defTooltip;

    indexes.forEach((index: number) => {
      expect(component.getTooltip(index)).toEqual(tooltips[index]);
    });

    component.tooltips = undefined;

    indexes.forEach((index: number) => {
      expect(component.getTooltip(index)).toEqual(defTooltip);
    });
  });

  it('should collapse and uncollapse according to the count', () => {
    expect(component.collapsed).toBeFalsy();
    component.count = NavigationOrbsComponent.maxOrbsUncollapsed + 1;
    expect(component.collapsed).toBeTruthy();
    component.count = NavigationOrbsComponent.maxOrbsUncollapsed;
    expect(component.collapsed).toBeFalsy();
  });

  it('should allow the maxOrbsUncollapsed to be set', () => {
    expect(component.collapsed).toBeFalsy();
    component.count = 10;
    expect(component.collapsed).toBeTruthy();
    component.maxUncollapsed = 10;
    expect(component.collapsed).toBeTruthy();
    component.count = 10;
    expect(component.collapsed).toBeFalsy();
  });

  it('should not emit an event when locked', () => {
    spyOn(component.clickEvent, 'emit');

    let isLocked = true;
    const event = {
      preventDefault: jasmine.createSpy(),
      ctrlKey: false
    };

    component.fnClassMapInner = (_): ClassMap => {
      return {
        locked: isLocked
      };
    };

    component.clicked(event, 0);
    expect(component.clickEvent.emit).not.toHaveBeenCalled();

    isLocked = false;

    component.clicked(event, 0);
    expect(component.clickEvent.emit).toHaveBeenCalled();
  });

  it('should emit an event when clicked', () => {
    const event = {
      preventDefault: jasmine.createSpy(),
      ctrlKey: true
    };
    const index = 1976;
    spyOn(component.clickEvent, 'emit');
    component.clicked(event, index);
    expect(component.clickEvent.emit).not.toHaveBeenCalled();

    event.ctrlKey = false;
    component.clicked(event, index);
    expect(component.clickEvent.emit).toHaveBeenCalledWith(index);
  });

  it('should emit an event when the next button is clicked', () => {
    const index = 1683;
    spyOn(component.clickEvent, 'emit');
    component.index = index;
    component.clickedNext();
    expect(component.clickEvent.emit).toHaveBeenCalledWith(index + 1);
  });

  it('should emit an event when the previous button is clicked', () => {
    const index = 1492;
    spyOn(component.clickEvent, 'emit');
    component.index = index;
    component.clickedPrev();
    expect(component.clickEvent.emit).toHaveBeenCalledWith(index - 1);
  });
});

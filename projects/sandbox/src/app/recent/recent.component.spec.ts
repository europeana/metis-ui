import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { BehaviorSubject } from 'rxjs';

import Keycloak from 'keycloak-js';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEvent } from 'keycloak-angular';
import { mockedKeycloak } from 'shared';

import { DropInModel } from '../_models';
import { UserDataService } from '../_services';
import { MockUserDataService } from '../_mocked';

import { RecentComponent } from '.';

describe('RecentComponent', () => {
  let component: RecentComponent;
  let userDataService: UserDataService;
  let fixture: ComponentFixture<RecentComponent>;

  const configureTestbed = (): void => {
    TestBed.configureTestingModule({
      imports: [RecentComponent],
      providers: [
        {
          provide: UserDataService,
          useClass: MockUserDataService
        },
        {
          provide: Keycloak,
          useValue: mockedKeycloak
        },
        {
          provide: KEYCLOAK_EVENT_SIGNAL,
          useValue: (): KeycloakEvent => {
            return ({} as unknown) as KeycloakEvent;
          }
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();
  };

  const b4Each = (): void => {
    configureTestbed();
    fixture = TestBed.createComponent(RecentComponent);
    userDataService = TestBed.inject(UserDataService);
    component = fixture.componentInstance;
  };

  beforeEach(b4Each);

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should subscribe to the model on initialisation', () => {
    const item1: DropInModel = {
      id: { value: '2315' },
      name: { value: 'Jackie' },
      date: { value: new Date().toISOString() }
    };

    const item2: DropInModel = {
      id: { value: '2316' },
      name: { value: 'Jimmy' },
      date: { value: new Date().toISOString() }
    };

    const bs: BehaviorSubject<Array<DropInModel>> = new BehaviorSubject([] as Array<DropInModel>);

    spyOn(userDataService, 'getUserDatasetsPolledObservable').and.callFake(() => {
      return bs;
    });

    component.ngOnInit();

    bs.next([item1]);
    expect(userDataService.getUserDatasetsPolledObservable).toHaveBeenCalled();

    expect(component.model.length).toEqual(1);
    bs.next([item1, item2]);
    expect(component.model.length).toEqual(2);

    component.ngOnInit();
    expect(userDataService.getUserDatasetsPolledObservable).toHaveBeenCalledTimes(2);
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

  it('should toggle the expanded flag', () => {
    component.expanded = false;
    expect(component.expanded).toBeFalsy();

    component.toggleExpanded();
    expect(component.expanded).toBeTruthy();

    component.toggleExpanded();
    expect(component.expanded).toBeFalsy();
  });

  it('should close the menu', () => {
    component.menuOpen = true;
    component.closeMenu();
    expect(component.menuOpen).toBeFalsy();

    component.menuOpener = {
      nativeElement: {
        focus: jasmine.createSpy()
      }
    };

    component.closeMenu();
    expect(component.menuOpener.nativeElement.focus).toHaveBeenCalled();
  });

  it('should open the link', () => {
    const id = '123';
    let behaviour = '';
    spyOn(component.open, 'emit');
    spyOn(window, 'scrollTo').and.callFake((ops: ScrollToOptions | undefined) => {
      if (ops?.behavior) {
        behaviour = ops?.behavior;
      }
    });
    component.openLink(id);
    expect(component.open.emit).toHaveBeenCalledWith(id);
    expect(behaviour).toEqual('instant');

    component.listView = true;
    component.openLink(id);
    expect(behaviour).toEqual('smooth');
  });

  it('should emit events', () => {
    spyOn(component.showAllRecent, 'emit');
    component.showAll();
    expect(component.showAllRecent.emit).toHaveBeenCalled();
  });

  it('should limit the visible model', () => {
    component.model = Object.keys(new Array(10).fill(null)).map((i: string) => {
      parseInt(i);
      return {
        id: i,
        name: `name_${i}`,
        date: new Date().toISOString()
      };
    });
    expect(component.model.length).toEqual(10);
    expect(RecentComponent.MAX_B4_EXPAND).not.toEqual(10);
    expect(component.visibleModel().length).toEqual(RecentComponent.MAX_B4_EXPAND);

    component.expanded = true;
    expect(component.visibleModel().length).toEqual(10);
  });
});

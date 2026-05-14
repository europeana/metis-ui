import { provideZonelessChangeDetection } from '@angular/core';
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
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('RecentComponent', () => {
  let component: RecentComponent;
  let userDataService: UserDataService;
  let fixture: ComponentFixture<RecentComponent>;

  const configureTestbed = (): void => {
    TestBed.configureTestingModule({
      imports: [RecentComponent],
      providers: [
        provideZonelessChangeDetection(),
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

    vi.spyOn(userDataService, 'getUserDatasetsPolledObservable').mockImplementation(() => {
      return bs;
    });

    component.ngOnInit();

    bs.next([item1]);
    expect(userDataService.getUserDatasetsPolledObservable).toHaveBeenCalled();

    expect(component.model().length).toEqual(1);
    bs.next([item1, item2]);
    expect(component.model().length).toEqual(2);

    component.ngOnInit();
    expect(userDataService.getUserDatasetsPolledObservable).toHaveBeenCalledTimes(2);
  });

  it('should toggle the menu', () => {
    component.menuOpen.set(false);
    component.toggleMenu();
    expect(component.menuOpen()).toBeTruthy();
    component.toggleMenu();
    expect(component.menuOpen()).toBeFalsy();
    component.toggleMenu();
    expect(component.menuOpen()).toBeTruthy();
    component.toggleMenu();
    expect(component.menuOpen()).toBeFalsy();
  });

  it('should toggle the expanded flag', () => {
    component.expanded.set(false);
    expect(component.expanded()).toBeFalsy();

    component.toggleExpanded();
    expect(component.expanded()).toBeTruthy();

    component.toggleExpanded();
    expect(component.expanded()).toBeFalsy();
  });

  it('should close the menu', () => {
    component.menuOpen.set(true);

    // FIX: Mock the read-only viewChild signal query using a tracking return stub function
    vi.spyOn(component, 'menuOpener').mockReturnValue({
      nativeElement: {
        focus: vi.fn()
      }
    } as any);

    component.closeMenu();
    expect(component.menuOpen()).toBeFalsy();
    expect(component.menuOpener()?.nativeElement.focus).toHaveBeenCalled();
  });

  it('should open the link', () => {
    const id = '123';
    let behaviour = '';
    vi.spyOn(component.open, 'emit');
    vi.spyOn(window, 'scrollTo').mockImplementation((...args: any[]) => {
      const ops = args[0];
      if (ops && typeof ops === 'object' && ops.behavior) {
        behaviour = ops.behavior;
      }
    });
    component.openLink(id);
    expect(component.open.emit).toHaveBeenCalledWith(id);
    expect(behaviour).toEqual('instant');

    fixture.componentRef.setInput('listView', true);
    fixture.detectChanges();

    component.openLink(id);
    expect(behaviour).toEqual('smooth');
  });

  it('should emit events', () => {
    vi.spyOn(component.showAllRecent, 'emit');
    component.showAll();
    expect(component.showAllRecent.emit).toHaveBeenCalled();
  });

  it('should limit the visible model', () => {
    // ✅ FIX 1: Format properties inside { value: ... } selectors to match the DropInModel type mapping shape
    const generatedData: Array<DropInModel> = Object.keys(new Array(10).fill(null)).map(
      (i: string) => {
        return {
          id: { value: i },
          name: { value: `name_${i}` },
          date: { value: new Date().toISOString() }
        };
      }
    );

    // ✅ FIX 2: Deliver your test dataset through the mocked polling stream to prevent ngOnInit from wiping it out
    const bs = new BehaviorSubject<Array<DropInModel>>(generatedData);
    vi.spyOn(userDataService, 'getUserDatasetsPolledObservable').mockImplementation(() => bs);

    // Run lifecycle initialisation hooks to securely populate state signals
    component.ngOnInit();
    fixture.detectChanges();

    expect(component.model().length).toEqual(10);
    expect(RecentComponent.MAX_B4_EXPAND).not.toEqual(10);
    expect(component.visibleModel().length).toEqual(RecentComponent.MAX_B4_EXPAND);

    component.expanded.set(true);
    fixture.detectChanges();
    expect(component.visibleModel().length).toEqual(10);
  });
});

import { TestBed } from '@angular/core/testing';
import { ComponentRef, ElementRef, Injector, runInInjectionContext } from '@angular/core';
import { provideZonelessChangeDetection } from '@angular/core';
import { Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RecentComponent } from './recent.component';
import { UserDataService } from '../_services';
import { DropInModel } from '../_models';

describe('RecentComponent (Angular)', () => {
  let component: RecentComponent;
  let componentRef: ComponentRef<RecentComponent>;
  let mockDatasetsSubject: Subject<DropInModel[]>;
  let mockUserDataService: { getUserDatasetsPolledObservable: any };
  let injector: Injector;

  // Static mock sample records matching raw dynamic schema requirements
  const createMockDataset = (id: string, name: string, date: string): DropInModel =>
    (({
      id: { value: id },
      name: { value: name },
      date: { value: date }
    } as unknown) as DropInModel);

  beforeEach(async () => {
    mockDatasetsSubject = new Subject<DropInModel[]>();

    mockUserDataService = {
      getUserDatasetsPolledObservable: vi.fn().mockReturnValue(mockDatasetsSubject.asObservable())
    };

    await TestBed.configureTestingModule({
      imports: [RecentComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: UserDataService, useValue: mockUserDataService }
      ]
    }).compileComponents();

    injector = TestBed.inject(Injector);

    // Instantiate within injection context to support modern toSignal teardown trackers cleanly
    runInInjectionContext(injector, () => {
      const fixture = TestBed.createComponent(RecentComponent);
      component = fixture.componentInstance;
      componentRef = fixture.componentRef;
    });

    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });

  it('should create the component instance', () => {
    expect(component).toBeTruthy();
  });

  it('should map the raw dataset models correctly via reactive computed primitives', () => {
    runInInjectionContext(injector, () => {
      expect(component.model()).toEqual([]);

      // Act: Push target elements onto our mocked continuous polling thread stream
      mockDatasetsSubject.next([
        createMockDataset('ds-1', 'Dataset 1', '2026-05-18'),
        createMockDataset('ds-2', 'Dataset 2', '2026-05-19')
      ]);

      // Synchronously flush pure signal effect queues
      TestBed.flushEffects();

      // Assert mapping correctness
      expect(component.model().length).toBe(2);
      expect(component.model()[0]).toEqual({
        id: 'ds-1',
        name: 'Dataset 1',
        date: '2026-05-18'
      });
    });
  });

  it('should flag as expandable only when elements pass the static layout max limits', () => {
    runInInjectionContext(injector, () => {
      expect(component.expandable()).toBeFalsy();

      const fiveItems = Array.from({ length: 5 }, (_, i) =>
        createMockDataset(`id-${i}`, `Name-${i}`, '2026')
      );
      mockDatasetsSubject.next(fiveItems);
      TestBed.flushEffects();
      expect(component.expandable()).toBeFalsy();

      const sixItems = Array.from({ length: 6 }, (_, i) =>
        createMockDataset(`id-${i}`, `Name-${i}`, '2026')
      );
      mockDatasetsSubject.next(sixItems);
      TestBed.flushEffects();
      expect(component.expandable()).toBeTruthy();
    });
  });

  it('should slice visibleModel array to MAX_B4_EXPAND when not expanded', () => {
    runInInjectionContext(injector, () => {
      const eightItems = Array.from({ length: 8 }, (_, i) =>
        createMockDataset(`id-${i}`, `Name-${i}`, '2026')
      );
      mockDatasetsSubject.next(eightItems);
      TestBed.flushEffects();

      expect(component.expanded()).toBeFalsy();
      expect(component.visibleModel().length).toBe(5);

      component.toggleExpanded();
      TestBed.flushEffects();

      expect(component.expanded()).toBeTruthy();
      expect(component.visibleModel().length).toBe(8);
    });
  });

  it('should synchronize menuOpen linkedSignal directly when parent listOpened values mutate', () => {
    runInInjectionContext(injector, () => {
      expect(component.menuOpen()).toBeFalsy();

      componentRef.setInput('listOpened', true);
      TestBed.flushEffects();
      expect(component.menuOpen()).toBeTruthy();

      componentRef.setInput('listOpened', false);
      TestBed.flushEffects();
      expect(component.menuOpen()).toBeFalsy();
    });
  });

  it('should close the menu and return element focus contexts to the trigger element anchor', () => {
    component.menuOpen.set(true);

    const mockNativeElement = { focus: vi.fn() };

    // Type-safe overwrite of read-only viewChild signal wrapper reference via mock override
    Object.defineProperty(component, 'menuOpener', {
      value: () => new ElementRef(mockNativeElement),
      configurable: true
    });

    component.closeMenu();

    expect(component.menuOpen()).toBeFalsy();
    expect(mockNativeElement.focus).toHaveBeenCalledTimes(1);
  });

  it('should emit the showAllRecent event and toggle menu visibility off on selection triggers', () => {
    let emitted = false;
    const e = ({ stopPropagation: vi.fn() } as unknown) as Event;
    component.showAllRecent.subscribe(() => (emitted = true));
    component.menuOpen.set(true);

    component.showAll(e);

    expect(e.stopPropagation).toHaveBeenCalled();
    expect(emitted).toBeTruthy();
    expect(component.menuOpen()).toBeFalsy();
  });

  it('should emit target links on openLink triggers and compute scroll offsets safely based on list view variables', () => {
    let openIdEmit: string | undefined;
    component.open.subscribe((id) => (openIdEmit = id));

    componentRef.setInput('listView', false);
    component.openLink('target-dataset-id');

    expect(openIdEmit).toBe('target-dataset-id');
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' });

    componentRef.setInput('listView', true);
    component.openLink('target-dataset-id-2');

    expect(openIdEmit).toBe('target-dataset-id-2');
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'smooth' });
  });

  describe('Interactive View Toggles', () => {
    it('should reactively toggle the menuOpen signal state when toggleMenu is executed', () => {
      expect(component.menuOpen()).toBe(false);

      component.toggleMenu();
      TestBed.flushEffects();
      expect(component.menuOpen()).toBe(true);

      component.toggleMenu();
      TestBed.flushEffects();
      expect(component.menuOpen()).toBe(false);
    });
  });
});

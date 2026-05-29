import { TestBed } from '@angular/core/testing';
import { ComponentRef, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import { RecentComponent } from './recent.component'; // 🚀 Fixed import path to point to local directory
import { UserDataService } from '../_services';
import { DropInModel } from '../_models';

describe('RecentComponent (Angular Zoneless + Vitest)', () => {
  let component: RecentComponent;
  let componentRef: ComponentRef<RecentComponent>;
  let mockDatasetsSubject: Subject<Array<DropInModel>>;
  let mockUserDataService: any;

  // Static mock sample records matching raw dynamic schema requirements
  const createMockDataset = (id: string, name: string, date: string): DropInModel =>
    (({
      id: { value: id },
      name: { value: name },
      date: { value: date }
    } as unknown) as DropInModel);

  beforeEach(async () => {
    mockDatasetsSubject = new Subject<Array<DropInModel>>();

    mockUserDataService = {
      getUserDatasetsPolledObservable: vi.fn().mockReturnValue(mockDatasetsSubject.asObservable())
    };

    await TestBed.configureTestingModule({
      imports: [RecentComponent],
      providers: [{ provide: UserDataService, useValue: mockUserDataService }]
    }).compileComponents();

    const fixture = TestBed.createComponent(RecentComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    // Stub global scrolling API to prevent JSDOM execution context warnings
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });

  it('should create the component instance', () => {
    expect(component).toBeTruthy();
  });

  it('should map the raw dataset models correctly via reactive computed primitives', async () => {
    expect(component.model()).toEqual([]);

    // Act: Push target elements onto our mocked continuous polling thread stream
    mockDatasetsSubject.next([
      createMockDataset('ds-1', 'Dataset 1', '2026-05-18'),
      createMockDataset('ds-2', 'Dataset 2', '2026-05-19')
    ]);

    await TestBed.flushEffects();

    // Assert mapping correctness
    expect(component.model().length).toBe(2);
    expect(component.model()[0]).toEqual({
      id: 'ds-1',
      name: 'Dataset 1',
      date: '2026-05-18'
    });
  });

  it('should flag as expandable only when elements pass the static layout max limits', async () => {
    expect(component.expandable()).toBeFalsy();

    // Push exactly 5 items (Limit Boundary Check)
    const fiveItems = Array.from({ length: 5 }, (_, i) =>
      createMockDataset(`id-${i}`, `Name-${i}`, '2026')
    );
    mockDatasetsSubject.next(fiveItems);
    await TestBed.flushEffects();
    expect(component.expandable()).toBeFalsy();

    // Push 6 items (Triggers expansion condition state)
    const sixItems = Array.from({ length: 6 }, (_, i) =>
      createMockDataset(`id-${i}`, `Name-${i}`, '2026')
    );
    mockDatasetsSubject.next(sixItems);
    await TestBed.flushEffects();
    expect(component.expandable()).toBeTruthy();
  });

  it('should slice visibleModel array to MAX_B4_EXPAND when not expanded', async () => {
    const eightItems = Array.from({ length: 8 }, (_, i) =>
      createMockDataset(`id-${i}`, `Name-${i}`, '2026')
    );
    mockDatasetsSubject.next(eightItems);
    await TestBed.flushEffects();

    expect(component.expanded()).toBeFalsy();
    expect(component.visibleModel().length).toBe(5);

    // Act: Expand layout tracking states explicitly
    component.toggleExpanded();
    await TestBed.flushEffects();

    expect(component.expanded()).toBeTruthy();
    expect(component.visibleModel().length).toBe(8);
  });

  it('should synchronize menuOpen linkedSignal directly when parent listOpened values mutate', async () => {
    expect(component.menuOpen()).toBeFalsy();

    componentRef.setInput('listOpened', true);
    await TestBed.flushEffects();
    expect(component.menuOpen()).toBeTruthy();

    componentRef.setInput('listOpened', false);
    await TestBed.flushEffects();
    expect(component.menuOpen()).toBeFalsy();
  });

  it('should close the menu and return element focus contexts to the trigger element anchor', async () => {
    component.menuOpen.set(true);

    const mockNativeElement = { focus: vi.fn() };
    // Overwrite read-only viewChild signal wrapper reference via mock override
    (component as any).menuOpener = vi.fn().mockReturnValue(new ElementRef(mockNativeElement));

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

    // Test Scenario A: Default View configuration rules
    componentRef.setInput('listView', false);
    component.openLink('target-dataset-id');

    expect(openIdEmit).toBe('target-dataset-id');
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' });

    // Test Scenario B: Dynamic smooth layouts applied inside explicit lists
    componentRef.setInput('listView', true);
    component.openLink('target-dataset-id-2');

    expect(openIdEmit).toBe('target-dataset-id-2');
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'smooth' });
  });
});

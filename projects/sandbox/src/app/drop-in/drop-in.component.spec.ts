import { ComponentRef, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { of, Subject } from 'rxjs';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DropInComponent } from './drop-in.component';
import { DropInConfItem, DropInModel, ViewMode } from '../_models';

describe('DropInComponent (Angular Zoneless + Vitest)', () => {
  let fixture: ComponentFixture<DropInComponent>;
  let component: DropInComponent;
  let componentRef: ComponentRef<DropInComponent>;

  let mockSourceSubject: Subject<Array<DropInModel>>;
  let parentFormGroup: FormGroup;
  let fakeContainerEl: HTMLElement;
  let scrollSpy: any;

  const sampleConf: Array<DropInConfItem> = [
    { dropInColName: 'name', dropInNumeric: false, dropInField: 'nameField' },
    { dropInColName: 'id', dropInNumeric: true, dropInField: 'idField' }
  ];

  const sampleData: Array<DropInModel> = [
    {
      id: { value: '10' },
      name: { value: 'Alpha' },
      about: { value: 'A' },
      date: { value: '2026' },
      'harvest-protocol': { value: 'H' }
    },
    {
      id: { value: '20' },
      name: { value: 'Beta' },
      about: { value: 'B' },
      date: { value: '2026' },
      'harvest-protocol': { value: 'H' }
    }
  ];

  beforeEach(async () => {
    vi.useFakeTimers();
    mockSourceSubject = new Subject<Array<DropInModel>>();
    scrollSpy = vi.fn();

    parentFormGroup = new FormGroup({
      testField: new FormControl('', Validators.required)
    });

    await TestBed.configureTestingModule({
      imports: [DropInComponent, ReactiveFormsModule],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(DropInComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    // Fulfill required signal input properties safely
    componentRef.setInput('conf', sampleConf);
    componentRef.setInput('dropInFieldName', 'testField');
    componentRef.setInput('form', parentFormGroup);
    componentRef.setInput('source', mockSourceSubject.asObservable());

    // Mock the viewChild query directly on the instance as a functional getter
    fakeContainerEl = ({
      getBoundingClientRect: () => ({ top: -1 }),
      scrollIntoView: scrollSpy
    } as unknown) as HTMLElement;

    (component as any).elRefDropIn = vi.fn().mockReturnValue({
      nativeElement: fakeContainerEl
    });

    const mockResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn()
    }));

    globalThis.ResizeObserver = mockResizeObserver;
    if (typeof window !== 'undefined') {
      (window as any).ResizeObserver = mockResizeObserver;
    }

    if (!HTMLElement.prototype.scrollIntoView) {
      HTMLElement.prototype.scrollIntoView = vi.fn();
    }

    // Stub remaining scrolling spy references
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    vi.spyOn(window, 'scroll').mockImplementation(() => {});
  });

  afterEach(() => {
    if (fixture) {
      fixture.destroy();
    }
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should create the component instance', async () => {
    await TestBed.flushEffects();
    expect(component).toBeTruthy();
  });

  it('should initialize form value state and synchronize formFieldValue signal on changes', async () => {
    fixture.detectChanges(); // Executes ngOnInit lifecycle hooks
    await TestBed.flushEffects();

    expect(component.formFieldValue()).toBe('');

    // Act: Simulate reactive form mutation context changes
    parentFormGroup.get('testField')?.setValue('  QueryValue  ');
    await TestBed.flushEffects();

    expect(component.formFieldValue()).toBe('QueryValue');
  });

  it('should dynamically switch viewMode and trigger suggestion states when handles user keystrokes', async () => {
    fixture.detectChanges();
    componentRef.setInput('modelData', sampleData);
    await TestBed.flushEffects();

    // Mark field as dirty to mimic user typing interaction frames
    component.formField.markAsDirty();

    // Act: Type a matching query string
    component.handleInputKey('Alp');

    vi.runAllTimers();
    await TestBed.flushEffects();

    expect(component.viewMode()).toBe(ViewMode.SUGGEST);
    expect(component.matchBroken).toBe(false);
    expect(component.visible()).toBe(true);
  });

  it('should compute viewMode dynamically based on formFieldValue string length criteria', async () => {
    fixture.detectChanges();
    await TestBed.flushEffects();

    expect(component.formFieldValue()).toBe('');
    expect(component.viewMode()).toBe(ViewMode.SILENT);

    component.viewMode.set(ViewMode.PINNED);
    await TestBed.flushEffects();
    expect(component.viewMode()).toBe(ViewMode.PINNED);

    component.formFieldValue.set('some-query');
    await TestBed.flushEffects();

    expect(component.viewMode()).toBe(ViewMode.PINNED);

    component.formFieldValue.set('');
    await TestBed.flushEffects();

    expect(component.viewMode()).toBe(ViewMode.SILENT);
  });

  it('should flag matchBroken when user filters return no results on an active dropdown', async () => {
    fixture.detectChanges();
    componentRef.setInput('modelData', sampleData);
    component.viewMode.set(ViewMode.SUGGEST);
    await TestBed.flushEffects();

    // Act: Type non-matching value criteria strings
    component.handleInputKey('XYZ');
    await TestBed.flushEffects();

    expect(component.matchBroken).toBe(true);
    expect(component.formFieldValue()).not.toBe('XYZ'); // Value write blocked by broken matches
  });

  it('should toggle sort directions or field markers when sortModelData executes', async () => {
    await TestBed.flushEffects();
    expect(component.sortField()).toBe('');
    expect(component.sortDirection()).toBe(1);

    component.sortModelData('name');
    expect(component.sortField()).toBe('name');
    expect(component.sortDirection()).toBe(1);

    // Toggle same field to reverse alignment sequences
    component.sortModelData('name');
    expect(component.sortField()).toBe('name');
    expect(component.sortDirection()).toBe(-1);
  });

  it('should clear matching properties to triple dashes when multiple sorted rows contain duplicate text definitions', async () => {
    fixture.detectChanges();
    // Supply two entries with identical date values
    componentRef.setInput('modelData', [
      { id: { value: '1' }, name: { value: 'A' }, date: { value: 'SameDate' } },
      { id: { value: '2' }, name: { value: 'B' }, date: { value: 'SameDate' } }
    ]);
    await TestBed.flushEffects();

    const clearedRows = component.filterAndSortModelData('');
    expect(clearedRows[1].date.value).toBe('---'); // Redundant entry text replaced
  });

  it('should update modelData signal when the underlying source observable pushes dynamic row lists', async () => {
    fixture.detectChanges();
    await TestBed.flushEffects();
    expect(component.modelData()).toEqual([]);

    // Act: push a mock item array list onto the streaming pipeline observer
    mockSourceSubject.next(sampleData);
    await TestBed.flushEffects();

    expect(component.modelData().length).toBe(2);
  });

  it('should fully transition into pinned layout mode when openPinnedAll executes', async () => {
    fixture.detectChanges();
    const fakeTriggerInput = document.createElement('input');
    vi.spyOn(fakeTriggerInput, 'scrollIntoView').mockImplementation(() => {});
    vi.spyOn(fakeTriggerInput, 'focus').mockImplementation(() => {});

    // Act: force expand everything onto layout viewport blocks
    component.openPinnedAll(fakeTriggerInput);

    // Flush microtask queues synchronously
    vi.runAllTicks();
    await TestBed.flushEffects();

    expect(component.suspendFiltering).toBe(true);
    expect(component.viewMode()).toBe(ViewMode.PINNED);
    expect(fakeTriggerInput.focus).toHaveBeenCalled();
  });

  it('should clear signal states and return form settings back to baseline conditions on closing', async () => {
    fixture.detectChanges();
    component.viewMode.set(ViewMode.PINNED);
    component.formFieldValue.set('ActiveText');
    await TestBed.flushEffects();

    // Act
    component.close(true);
    await TestBed.flushEffects();

    expect(component.viewMode()).toBe(ViewMode.SILENT);
    expect(component.formFieldValue()).toBe('');
    expect(component.dropInModel()).toEqual([]);
  });

  it('should accurately restore original validators on destruction and return form configurations to baseline conditions', async () => {
    fixture.detectChanges();
    await TestBed.flushEffects();
    const mockValidator: any = () => null;
    component.formFieldValidators = mockValidator;

    const setValidatorsSpy = vi.spyOn(component.formField, 'setValidators');
    const parentValidatorsSpy = vi.spyOn(parentFormGroup, 'setValidators');

    // Act: Trigger teardown hook manually to ensure production cleanup scripts execute
    component.ngOnDestroy();

    expect(setValidatorsSpy).toHaveBeenCalledWith(mockValidator);

    // Assert that the parent form has its container validators safely reset to null
    expect(parentValidatorsSpy).toHaveBeenCalledWith(null);
  });

  it('should handle initialization gracefully even if the parent form does not contain the specified form field control', async () => {
    const freshFixture = TestBed.createComponent(DropInComponent);
    const freshRef = freshFixture.componentRef;

    // Behavior: If a parent form lacks this field control, the component should degrade gracefully instead of crashing the view
    const partialForm = new FormGroup({});
    freshRef.setInput('conf', sampleConf);
    freshRef.setInput('dropInFieldName', 'missingFieldName');
    freshRef.setInput('form', partialForm);
    freshRef.setInput('source', of([]));

    expect(() => freshFixture.detectChanges()).not.toThrow();
  });

  it('should fall back gracefully to original unfiltered array data if configuration rules are empty', async () => {
    fixture.detectChanges();

    // Behavior: If the setup columns config object is empty, data should still load and map without casting runtime exceptions
    componentRef.setInput('conf', []);
    componentRef.setInput('modelData', sampleData);
    await TestBed.flushEffects();

    const outputData = component.filterAndSortModelData('');
    expect(outputData.length).toBe(2);
  });

  it('should compute availableHeight dynamically according to viewMode layout parameters and branch rules', async () => {
    // 1. Establish stable baseline metrics before initial detection pass
    const mockRect = { top: -1, bottom: 500 } as DOMRect;
    fakeContainerEl.getBoundingClientRect = () => mockRect;

    fixture.detectChanges();
    await TestBed.flushEffects();

    // --- Branch 1: Missing viewChild reference element context ---
    vi.spyOn(component, 'elRefDropIn').mockReturnValue(null as any);
    component.viewMode.set(ViewMode.SUGGEST);
    await TestBed.flushEffects();
    expect(component.availableHeight()).toBe(406);

    // Restore viewChild reference mock for remaining layout evaluations
    vi.spyOn(component, 'elRefDropIn').mockReturnValue({ nativeElement: fakeContainerEl } as any);

    // --- Branch 2: Standard fallthrough height calculation mapping (ViewMode.SUGGEST from SILENT) ---
    component.viewMode.set(ViewMode.SILENT);
    await TestBed.flushEffects();
    component.viewMode.set(ViewMode.SUGGEST);
    await TestBed.flushEffects();
    expect(component.availableHeight()).toBe(406);

    // --- Branch 3: Classic theme extra offset calculation layer validation ---
    document.body.classList.add('theme-classic');

    // Force recalculation down to line 121 by bouncing through SILENT instead of PINNED
    component.viewMode.set(ViewMode.SILENT);
    await TestBed.flushEffects();
    component.viewMode.set(ViewMode.SUGGEST);
    await TestBed.flushEffects();

    // calculation math: 500 - (78 + 16 + 10) = 500 - 104 = 396
    expect(component.availableHeight()).toBe(396);
    document.body.classList.remove('theme-classic'); // Teardown cleanly

    // --- Branch 4: ViewMode.PINNED branch condition criteria validation ---
    component.viewMode.set(ViewMode.PINNED);
    await TestBed.flushEffects();
    expect(component.availableHeight()).toBe(396);

    // --- Branch 5: Transitions from PINNED back into SUGGEST (Hits the early return shortcut) ---
    component.viewMode.set(ViewMode.SUGGEST);
    await TestBed.flushEffects();
    expect(component.availableHeight()).toBe(396);
  });

});

import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { toObservable } from '@angular/core/rxjs-interop';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEvent, KeycloakEventType } from 'keycloak-angular';
import Keycloak from 'keycloak-js';
import { NEVER, of } from 'rxjs';
import { mockedKeycloak } from 'shared';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { dropInConfDatasets } from '../_data';
import { DropInModel, ViewMode } from '../_models';
import { HighlightMatchPipe } from '../_translate';
import { DropInComponent } from '.';

describe('DropInComponent', () => {
  let component: DropInComponent;
  let fixture: ComponentFixture<DropInComponent>;

  const dateNow: Date = new Date();
  const alphabet: string[] = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const modelData: Array<DropInModel> = [];

  [...Array(100).keys()].forEach((i: number): void => {
    const letter: string = alphabet[i % alphabet.length];
    const triple = `${letter}${letter}${letter}`;
    const tripleId = `${i}${i}${i}`;
    modelData.push({
      id: { value: `${i}` },
      name: { value: `${triple}: ${triple.toUpperCase()} ${i} / ${tripleId}` },
      about: { value: `The description (${letter}) of ${i}` },
      date: { value: new Date(dateNow.getDate() + i).toISOString() }
    });
  });

  const formBuilder: FormBuilder = new FormBuilder();
  const createMockFormField = (): FormControl => {
    return ({
      setValue: vi.fn(),
      setValidators: vi.fn(),
      updateValueAndValidity: vi.fn(),
      value: ''
    } as unknown) as FormControl;
  };

  const getEvent = (classListResult = true): Event => {
    return ({
      target: {
        classList: { contains: (): boolean => classListResult },
        scrollIntoView: vi.fn()
      },
      preventDefault: vi.fn(),
      stopPropagation: vi.fn()
    } as unknown) as Event;
  };

  const setFormInput = (): void => {
    const form = formBuilder.group({
      dropInFieldName: ['', [Validators.required]]
    });
    fixture.componentRef.setInput('dropInFieldName', 'dropInFieldName');
    fixture.componentRef.setInput('form', form);
  };

  const configureTestbed = (): void => {
    TestBed.configureTestingModule({
      imports: [DropInComponent, ReactiveFormsModule],
      providers: [
        provideZonelessChangeDetection(),
        { provide: Keycloak, useValue: mockedKeycloak },
        {
          provide: KEYCLOAK_EVENT_SIGNAL,
          useValue: (): KeycloakEvent => ({ type: KeycloakEventType.Ready })
        },
        HighlightMatchPipe,
        provideHttpClient()
      ]
    }).compileComponents();
  };

  describe('Dataset Implementation', () => {
    const b4Each = (): void => {
      fixture = TestBed.createComponent(DropInComponent);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('conf', dropInConfDatasets);
      fixture.componentRef.setInput('source', of([]));
      setFormInput();
    };

    describe('Normal Operations', () => {
      beforeEach((): void => {
        configureTestbed();
        vi.useFakeTimers();
        b4Each();
      });

      beforeAll((): void => {
        global.ResizeObserver = class implements ResizeObserver {
          public observe(): void {
            vi.fn();
          }
          public unobserve(): void {
            vi.fn();
          }
          public disconnect(): void {
            vi.fn();
          }
        };
        window.HTMLElement.prototype.scrollIntoView = vi.fn();
      });

      afterAll((): void => {
        vi.useRealTimers();
      });

      it('should create', (): void => {
        expect(component).toBeTruthy();
      });

      it('should init', (): void => {
        const emitSpy = vi.spyOn(component.refreshModelSignal, 'emit');
        component.ngOnInit();
        expect(emitSpy).toHaveBeenCalled();
        emitSpy.mockRestore();
      });

      it('should replace duplicates', async (): Promise<void> => {
        await TestBed.runInInjectionContext(
          async (): Promise<void> => {
            fixture.componentRef.setInput(
              'source',
              of([
                { id: { value: '1' }, name: { value: 'THE_NAME' } },
                { id: { value: '2' }, name: { value: 'THE_NAME' } }
              ] as Array<DropInModel>)
            );
          }
        );

        fixture.detectChanges();
        component.suspendFiltering = true;
        expect(component.filterAndSortModelData('x')[1].name.value).toEqual('---');
      });

      it('should restore scroll', async (): Promise<void> => {
        component.viewMode.set(ViewMode.SUGGEST);

        TestBed.runInInjectionContext((): void => {
          fixture.componentRef.setInput('source', of([...modelData]));
        });

        TestBed.flushEffects();
        fixture.detectChanges();

        const valueToStore = 20;
        const scrollInfo = component.elRefListScrollInfo();

        expect(scrollInfo).toBeTruthy();
        if (scrollInfo) {
          scrollInfo.actualScroll.set(valueToStore);
          scrollInfo.nativeElement().scrollTop = valueToStore;

          await TestBed.runInInjectionContext(
            async (): Promise<void> => {
              fixture.componentRef.setInput('source', of([{ id: { value: '1' } } as DropInModel]));
            }
          );

          TestBed.flushEffects();
          fixture.detectChanges();
        }

        const freshScrollInfo = component.elRefListScrollInfo();
        expect(freshScrollInfo).toBeTruthy();
        if (freshScrollInfo) {
          expect(freshScrollInfo.nativeElement().scrollTop).toEqual(valueToStore);
          expect(freshScrollInfo.actualScroll()).toEqual(valueToStore);
        }
      });

      it('should restore the focussed element', async (): Promise<void> => {
        const sourceSignal = signal<Array<DropInModel>>([...modelData]);

        window.scrollTo = vi.fn();
        window.scroll = vi.fn();

        TestBed.runInInjectionContext((): void => {
          component.viewMode.set(ViewMode.SUGGEST);
          fixture.componentRef.setInput('source', toObservable(sourceSignal));
        });

        fixture.detectChanges();
        const nativeEl = component.elRefListScrollInfo()?.nativeElement();
        if (!nativeEl) throw new Error('nativeEl missing');

        nativeEl.scrollTo = vi.fn();

        const initialLink = nativeEl.querySelector('a') as HTMLElement;
        if (!initialLink) throw new Error('Initial anchor missing');

        const focusSpy = vi.spyOn(initialLink, 'focus');
        const originalQuerySelector = nativeEl.querySelector;
        const originalQuerySelectorAll = nativeEl.querySelectorAll;

        nativeEl.querySelector = vi.fn().mockImplementation((selectors: string): any => {
          if (selectors === ':focus') return initialLink;
          return originalQuerySelector.call(nativeEl, selectors);
        });

        nativeEl.querySelectorAll = vi.fn().mockImplementation((selectors: string): any => {
          if (selectors === 'a') return ([initialLink] as unknown) as NodeListOf<HTMLAnchorElement>;
          return originalQuerySelectorAll.call(nativeEl, selectors);
        });

        sourceSignal.set([...modelData]);

        TestBed.flushEffects();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(focusSpy).toHaveBeenCalled();

        nativeEl.querySelector = originalQuerySelector;
        nativeEl.querySelectorAll = originalQuerySelectorAll;
        focusSpy.mockRestore();
      });

      it('should set the source', (): void => {
        fixture.detectChanges();
        const sourceSignal = signal<Array<DropInModel>>(modelData);

        TestBed.runInInjectionContext((): void => {
          fixture.componentRef.setInput('source', toObservable(sourceSignal));
        });

        fixture.detectChanges();
        TestBed.flushEffects();

        expect(component.modelData()).toEqual(modelData);
      });

      it('should reset (and re-enable) the auto-suggest', (): void => {
        fixture.detectChanges();
        expect(component.autoSuggest).toBeTruthy();
        component.close();
        expect(component.autoSuggest).toBeTruthy();

        component.formField = new FormControl('111');
        component.formField.markAsDirty();

        component.close();
        expect(component.autoSuggest).toBeFalsy();
      });

      it('should filter the model', (): void => {
        component.modelData.set([
          { id: { value: '1' }, name: { value: 'a' } },
          { id: { value: '3' }, name: { value: 'c' } },
          { id: { value: '2' }, name: { value: 'b' } },
          { id: { value: '0' }, name: { value: 'A' } }
        ] as Array<DropInModel>);

        expect(component.filterAndSortModelData('a').length).toEqual(2);
        expect(component.filterAndSortModelData('E').length).toEqual(0);

        component.suspendFiltering = true;
        expect(component.filterAndSortModelData('0').length).toEqual(4);
      });

      it('should detect shortcut mode', async (): Promise<void> => {
        expect(component.shortcutMode()).toBeFalsy();
        await TestBed.runInInjectionContext(
          async (): Promise<void> => {
            fixture.componentRef.setInput('conf', [dropInConfDatasets[0]]);
          }
        );
        expect(component.shortcutMode()).toBeTruthy();
      });

      it('should request shortcuts', (): void => {
        fixture.componentRef.setInput('source', NEVER);

        TestBed.runInInjectionContext((): void => {
          fixture.componentRef.setInput('conf', [dropInConfDatasets[0]]);
        });
        component.modelData.set([...modelData]);

        TestBed.flushEffects();
        fixture.detectChanges();

        vi.spyOn(component.requestShortcut, 'emit');
        vi.spyOn(component.requestDropInFieldFocus, 'emit');
        vi.spyOn(component, 'close');

        component.toggleViewModeOrSubmit('1');
        TestBed.flushEffects();

        expect(component.requestShortcut.emit).toHaveBeenCalled();
        expect(component.close).toHaveBeenCalled();
      });

      it('should request field focus when in shortcut mode', async (): Promise<void> => {
        // 🚀 THE FIX: Use async/await to natively handle queueMicrotask deferrals
        fixture.componentRef.setInput('source', NEVER);
        component.modelData.set([...modelData]);
        fixture.componentRef.setInput('conf', [dropInConfDatasets[0]]);
        TestBed.flushEffects();
        fixture.detectChanges();

        vi.spyOn(component.requestDropInFieldFocus, 'emit');
        vi.spyOn(component, 'close');
        component.formField = createMockFormField();

        component.submit('1');

        // Flush the JavaScript microtask queue completely so the queueMicrotask() executes
        await Promise.resolve();
        TestBed.flushEffects();
        fixture.detectChanges();

        expect(component.requestDropInFieldFocus.emit).toHaveBeenCalled();
        expect(component.close).toHaveBeenCalled();
      });

      it('should set (and reset) the matchBroken flag', async (): Promise<void> => {
        const valRes = '11';
        const valErr = `${valRes}X`;

        TestBed.runInInjectionContext((): void => {
          fixture.componentRef.setInput('source', of([...modelData]));
        });
        fixture.detectChanges();

        component.handleInputKey(valRes);
        await Promise.resolve(); // 🚀 THE FIX: Advance the timeline so matchBroken recalculates
        fixture.detectChanges();

        expect(component.autoSuggest).toBeTruthy();
        expect(component.filterAndSortModelData(valRes).length).toBeTruthy();
        expect(component.matchBroken).toBeFalsy();

        // Set an invalid key to trigger the match breakage flag reactive pipeline
        component.handleInputKey(valErr);
        await Promise.resolve(); // 🚀 THE FIX: Advance the timeline so matchBroken recalculates
        fixture.detectChanges();
        expect(component.matchBroken).toBeTruthy();

        // Resolve it with a valid combination
        component.handleInputKey(valRes);
        await Promise.resolve(); // 🚀 THE FIX: Advance the timeline so matchBroken recalculates
        fixture.detectChanges();
        expect(component.matchBroken).toBeFalsy();
      });

      it('should calculate visibility', (): void => {
        component.dropInModel.set([]);
        expect(component.visible()).toBeFalsy();

        component.dropInModel.set([...modelData]);
        component.viewMode.set(ViewMode.SUGGEST);
        expect(component.visible()).toBeTruthy();
      });

      it('should compute the maxItemCount', (): void => {
        expect(component.maxItemCount()).toEqual(component.maxItemCountSuggest);
        component.viewMode.set(ViewMode.PINNED);
        expect(component.maxItemCount()).toEqual(component.maxItemCountPinned);
      });

      it('should close then execute', (): void => {
        const spy = vi.fn();
        vi.spyOn(component, 'close');
        component.closeThenExecute(spy);
        expect(spy).toHaveBeenCalled();
        expect(component.close).not.toHaveBeenCalled();
      });

      it('should submit', (): void => {
        vi.spyOn(component.requestDropInFieldFocus, 'emit');
        vi.spyOn(component, 'close');
        component.formField = createMockFormField();

        component.submit('1');
        expect(component.requestDropInFieldFocus.emit).toHaveBeenCalled();
        expect(component.close).not.toHaveBeenCalled();
      });

      it('should handle "escape" on the items', async (): Promise<void> => {
        fixture.detectChanges();
        component.dropInModel.set([...modelData]);

        const event = getEvent();
        vi.spyOn(component, 'close');
        component.escape(event);
        expect(component.close).toHaveBeenCalled();
      });

      it('should handle "escape" on the input', (): void => {
        const escapeInputSpy = vi
          .spyOn(component, 'escapeInput')
          .mockImplementation((): void => {});
        component.fieldEscape();
        expect(escapeInputSpy).not.toHaveBeenCalled();

        component.modelData.set([...modelData]);
        component.fieldEscape();
        expect(escapeInputSpy).toHaveBeenCalled();
        escapeInputSpy.mockRestore();
      });

      it('should skip to the top', (): void => {
        component.viewMode.set(ViewMode.SUGGEST);
        fixture.componentRef.setInput('source', of([...modelData]));

        TestBed.flushEffects();
        fixture.detectChanges();

        const e = getEvent();
        component.skipToTop(e);
        expect(e.stopPropagation).toHaveBeenCalled();
        expect(e.preventDefault).toHaveBeenCalled();
      });

      it('should toggle the view mode', (): void => {
        fixture.componentRef.setInput('source', of([...modelData]));
        component.formField = createMockFormField();
        fixture.detectChanges();

        const parent = { scrollTop: 0 };
        const el: HTMLElement = ({
          closest: (): any => parent,
          offsetTop: 100,
          focus: vi.fn()
        } as unknown) as HTMLElement;

        const ev = getEvent();
        component.toggleViewMode(el, ev);
        expect(component.viewMode()).toEqual(ViewMode.SUGGEST);
      });

      it('should fake-validate the form', (): void => {
        const res: ValidationErrors = component.fakeFormValidate(({} as unknown) as FormControl);
        expect(res['invalid']).toBeTruthy();
      });

      it('should sort the model data', (): void => {
        fixture.componentRef.setInput('source', of([...modelData]));
        fixture.detectChanges();

        expect(component.dropInModel()[0].id.value).toEqual('0');
        expect(component.dropInModel().length).toEqual(100);

        component.sortModelData('id');
        expect(component.dropInModel()[0].id.value).toEqual('0');
      });
    });
  });
});

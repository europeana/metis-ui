import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { signal, WritableSignal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { KEYCLOAK_EVENT_SIGNAL, KeycloakEvent, KeycloakEventType } from 'keycloak-angular';
import Keycloak from 'keycloak-js';

import { of } from 'rxjs';

import { mockedKeycloak } from 'shared';

import { dropInConfDatasets } from '../_data';
import { DropInModel, ViewMode } from '../_models';
import { HighlightMatchPipe } from '../_translate';
import { DropInComponent } from '.';

describe('DropInComponent', () => {
  let component: DropInComponent;
  let fixture: ComponentFixture<DropInComponent>;

  const dateNow = new Date();
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const modelData: Array<DropInModel> = [];

  [...Array(100).keys()].forEach((i: number) => {
    const letter = alphabet[i % alphabet.length];
    const triple = `${letter}${letter}${letter}`;
    const tripleId = `${i}${i}${i}`;
    modelData.push({
      id: {
        value: `${i}`
      },
      name: {
        value: `${triple}: ${triple.toUpperCase()} ${i} / ${tripleId}`
      },
      about: {
        value: `The description (${letter}) of ${i}`
      },
      date: {
        value: new Date(dateNow.getDate() + i).toISOString()
      }
    });
  });

  const formBuilder: FormBuilder = new FormBuilder();
  const createMockFormField = (): FormControl => {
    return ({
      setValue: vi.fn(),
      setValidators: vi.fn(),
      updateValueAndValidity: vi.fn()
    } as unknown) as FormControl;
  };

  const getEvent = (classListResult = true): Event => {
    return ({
      target: {
        classList: { contains: () => classListResult },
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
        {
          provide: Keycloak,
          useValue: mockedKeycloak
        },
        {
          provide: KEYCLOAK_EVENT_SIGNAL,
          useValue: (): KeycloakEvent => {
            return {
              type: KeycloakEventType.Ready
            };
          }
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
      beforeEach(() => {
        configureTestbed();
        b4Each();
      });

      it('should create', () => {
        expect(component).toBeTruthy();
      });

      it('should init', () => {
        vi.spyOn(component, 'initForm');
        vi.spyOn(component.refreshModelSignal, 'emit');
        component.ngOnInit();
        expect(component.initForm).toHaveBeenCalled();
        expect(component.refreshModelSignal.emit).toHaveBeenCalled();
      });

      it('should replace duplicates', async () => {
        await TestBed.runInInjectionContext(() => {
          fixture.componentRef.setInput(
            'source',
            of([
              {
                id: {
                  value: '1'
                },
                name: {
                  value: 'THE_NAME'
                }
              },
              {
                id: {
                  value: '2'
                },
                name: {
                  value: 'THE_NAME'
                }
              }
            ] as Array<DropInModel>)
          );
        });

        fixture.detectChanges();

        component.suspendFiltering = true;
        expect(component.filterAndSortModelData('x')[1].name.value).toEqual('---');
      });

      it('should restore scroll', async () => {
        component.viewMode.set(ViewMode.SUGGEST);

        await TestBed.runInInjectionContext(() => {
          fixture.componentRef.setInput('source', of([...modelData]));
        });
        fixture.detectChanges();

        const valueToStore = 20;
        let scrollInfo = component.elRefListScrollInfo();

        expect(scrollInfo).toBeTruthy();

        if (scrollInfo) {
          scrollInfo.actualScroll.set(valueToStore);
          scrollInfo.nativeElement().scrollTop = valueToStore;

          expect(scrollInfo.nativeElement().scrollTop).toEqual(valueToStore);

          // propagate change in the data
          await TestBed.runInInjectionContext(() => {
            fixture.componentRef.setInput(
              'source',
              of([
                {
                  id: {
                    value: '1'
                  }
                } as DropInModel
              ])
            );
          });

          // old ref
          expect(scrollInfo.nativeElement().scrollTop).not.toEqual(valueToStore);
        }

        scrollInfo = component.elRefListScrollInfo();
        expect(scrollInfo).toBeTruthy();
        if (scrollInfo) {
          // this is recalculated to zero
          expect(scrollInfo.nativeElement().scrollTop).toEqual(0);
          // this is restored
          expect(scrollInfo.actualScroll()).toEqual(valueToStore);
        }
      });

      it('should restore the focussed element', () => {
        const sourceSignal: WritableSignal<Array<DropInModel>> = signal([]);

        TestBed.runInInjectionContext(() => {
          component.viewMode.set(ViewMode.SUGGEST);
          fixture.componentRef.setInput('source', toObservable(sourceSignal));
          sourceSignal.set(modelData);
        });

        fixture.detectChanges();

        // use the scrollInfo as a handle to the native element
        let scrollInfo = component.elRefListScrollInfo();
        expect(scrollInfo).toBeTruthy();

        const itemClass = 'item-identifier';
        const idToFocus = 'hello';

        if (scrollInfo) {
          const nativeEl = scrollInfo.nativeElement();
          const link = nativeEl.querySelector('a');

          expect(link?.textContent.trim()).toEqual('0');
          expect(document.activeElement).not.toEqual(link);

          link.focus();
          vi.spyOn(nativeEl, 'querySelector').mockImplementation(() => {
            return ({
              textContent: idToFocus,
              classList: () => {
                return [];
              }
            } as unknown) as HTMLElement;
          });

          // the actual focussed element is set
          expect(document.activeElement).toEqual(link);
          expect(document.activeElement?.classList.contains(itemClass)).toBeTruthy();

          // the (querySelector) spy returns a fake object!
          expect(nativeEl.querySelector(':focus')).not.toEqual(link);
          expect(nativeEl.querySelector(':focus').textContent).not.toEqual(link.textContent);
        }

        // updating the data will re-render the elements...
        sourceSignal.set([
          ...modelData,
          {
            id: {
              value: idToFocus
            }
          }
        ]);

        // re-aquire the scrollInfo object
        scrollInfo = component.elRefListScrollInfo();
        expect(scrollInfo).toBeTruthy();

        if (scrollInfo) {
          const nativeEl = scrollInfo.nativeElement();
          const link = nativeEl.querySelector('a');

          // confirm the focussed element's text is correct
          expect(idToFocus).toEqual(link.textContent);
          expect(nativeEl.querySelector(':focus').textContent).toEqual(link.textContent);

          // confirm a real item (not a mock) is the active element
          expect(document.activeElement?.classList.contains(itemClass)).toBeTruthy();
        }
      });

      it('should set the source', //async
      () => {
        fixture.detectChanges();
        vi.spyOn(component.modelData, 'set');

        const sourceSignal: WritableSignal<Array<DropInModel>> = signal(modelData);

        TestBed.runInInjectionContext(() => {
          fixture.componentRef.setInput('source', toObservable(sourceSignal));
        });

        fixture.detectChanges();
        expect(component.modelData.set).toHaveBeenCalledTimes(1);

        sourceSignal.set(modelData);
        fixture.detectChanges();
        expect(component.modelData.set).toHaveBeenCalledTimes(1);

        TestBed.runInInjectionContext(() => {
          fixture.componentRef.setInput('source', of([]));
        });

        fixture.detectChanges();
        expect(component.modelData.set).toHaveBeenCalledTimes(2);

        sourceSignal.set([]);
        fixture.detectChanges();
        expect(component.modelData.set).toHaveBeenCalledTimes(3);
      });

      it('should set (and reset) the matchBroken flag', () => {
        fixture.detectChanges();
        const valNoRes = '1';
        const valRes = '11';
        const valErr = `${valRes}X`;

        TestBed.runInInjectionContext(() => {
          fixture.componentRef.setInput('source', of([...modelData]));
        });
        component.handleInputKey(valRes);

        expect(component.autoSuggest).toBeTruthy();
        expect(component.filterAndSortModelData(valRes).length).toBeTruthy();
        expect(component.matchBroken).toBeFalsy();

        component.viewMode.set(ViewMode.SUGGEST);
        expect(component.visible()).toBeTruthy();

        component.handleInputKey(valErr);

        expect(component.matchBroken).toBeTruthy();

        component.handleInputKey(valRes);
        expect(component.matchBroken).toBeFalsy();

        component.handleInputKey(valErr);
        expect(component.matchBroken).toBeTruthy();

        component.handleInputKey(valNoRes);
        expect(component.matchBroken).toBeFalsy();

        component.matchBroken = true;

        TestBed.runInInjectionContext(() => {
          fixture.componentRef.setInput('source', of([]));
        });

        component.handleInputKey(valRes);
        expect(component.matchBroken).toBeFalsy();
      });

      it('should reset (and re-enable) the auto-suggest', () => {
        fixture.detectChanges();
        expect(component.autoSuggest).toBeTruthy();
        component.close();
        expect(component.autoSuggest).toBeTruthy();

        component.formField.setValue('111');
        component.formField.markAsDirty();

        expect(component.autoSuggest).toBeTruthy();
        component.close();
        expect(component.autoSuggest).toBeFalsy();

        component.formField.setValue('');
        component.formField.setValue('111');
        expect(component.autoSuggest).toBeTruthy();

        expect(component.viewMode()).toEqual(ViewMode.SILENT);

        TestBed.runInInjectionContext(() => {
          fixture.componentRef.setInput('source', of([...modelData]));
        });

        component.formField.setValue('11');
        expect(component.viewMode()).toEqual(ViewMode.SUGGEST);
      });

      it('should filter the model', () => {
        component.modelData.set([
          {
            id: {
              value: '1'
            },
            name: {
              value: 'a'
            }
          },
          {
            id: {
              value: '3'
            },
            name: {
              value: 'c'
            }
          },
          {
            id: {
              value: '2'
            },
            name: {
              value: 'b'
            }
          },
          {
            id: {
              value: '0'
            },
            name: {
              value: 'A'
            }
          }
        ] as Array<DropInModel>);

        expect(component.filterAndSortModelData('a').length).toEqual(2);
        expect(component.filterAndSortModelData('E').length).toEqual(0);
        expect(component.filterAndSortModelData('1').length).toEqual(1);
        expect(component.filterAndSortModelData('0').length).toEqual(1);

        component.suspendFiltering = true;
        expect(component.filterAndSortModelData('0').length).toEqual(4);

        component.suspendFiltering = false;
        expect(component.filterAndSortModelData('0').length).toEqual(1);
      });

      it('should detect shortcut mode', async () => {
        expect(component.shortcutMode()).toBeFalsy();
        await TestBed.runInInjectionContext(() => {
          fixture.componentRef.setInput('conf', [dropInConfDatasets[0]]);
        });
        expect(component.shortcutMode()).toBeTruthy();
      });

      it('should request shortcuts', async () => {
        component.modelData.set([...modelData]);

        await TestBed.runInInjectionContext(() => {
          fixture.componentRef.setInput('conf', [dropInConfDatasets[0]]);
        });

        expect(component.filterAndSortModelData('a').length).toEqual(4);

        vi.spyOn(component.requestShortcut, 'emit');
        vi.spyOn(component.requestDropInFieldFocus, 'emit');
        vi.spyOn(component, 'close');

        component.toggleViewModeOrSubmit('1');

        expect(component.requestShortcut.emit).toHaveBeenCalled();
        expect(component.requestDropInFieldFocus.emit).toHaveBeenCalled();
        expect(component.close).toHaveBeenCalled();

        component.toggleViewMode();
        expect(component.requestShortcut.emit).toHaveBeenCalledTimes(2);
        expect(component.requestDropInFieldFocus.emit).toHaveBeenCalledTimes(2);
        expect(component.close).toHaveBeenCalledTimes(2);

        component.toggleViewMode(({ textContent: 'text' } as unknown) as HTMLElement);
        expect(component.requestShortcut.emit).toHaveBeenCalledTimes(3);
        expect(component.requestDropInFieldFocus.emit).toHaveBeenCalledTimes(3);
        expect(component.close).toHaveBeenCalledTimes(3);

        component.formField = createMockFormField();
        component.submit('1');
        expect(component.close).toHaveBeenCalledTimes(4);
        expect(component.requestShortcut.emit).toHaveBeenCalledTimes(3);

        fixture.whenStable().then(() => {
          fixture.detectChanges();
          expect(component.requestShortcut.emit).toHaveBeenCalledTimes(4);
        });
      });

      it('should request field focus when in shortcut mode', async () => {
        component.modelData.set([...modelData]);
        await TestBed.runInInjectionContext(() => {
          fixture.componentRef.setInput('conf', [dropInConfDatasets[0]]);
        });

        vi.spyOn(component.requestDropInFieldFocus, 'emit');
        vi.spyOn(component, 'close');
        component.formField = createMockFormField();

        component.submit('1');

        fixture.whenStable().then(() => {
          expect(component.requestDropInFieldFocus.emit).toHaveBeenCalled();
          expect(component.formField.setValue).toHaveBeenCalled();
          expect(component.close).not.toHaveBeenCalled();
        });
      });

      it('should calculate visibility', () => {
        component.dropInModel.set([]);
        expect(component.visible()).toBeFalsy();

        component.viewMode.set(ViewMode.SUGGEST);
        expect(component.visible()).toBeFalsy();

        component.dropInModel.set([...modelData]);
        expect(component.visible()).toBeTruthy();

        component.dropInModel.set([]);
        expect(component.visible()).toBeFalsy();
      });

      it('should compute the maxItemCount', () => {
        expect(component.maxItemCount()).toEqual(component.maxItemCountSuggest);
        component.viewMode.set(ViewMode.PINNED);
        expect(component.maxItemCount()).toEqual(component.maxItemCountPinned);
      });

      it('should close then execute', () => {
        const spy = vi.fn();
        vi.spyOn(component, 'close');
        component.closeThenExecute(spy);
        expect(spy).toHaveBeenCalled();
        expect(component.close).not.toHaveBeenCalled();
        component.dropInModel.set([...modelData]);
        component.viewMode.set(ViewMode.SUGGEST);
        component.closeThenExecute(spy);
        expect(spy).toHaveBeenCalledTimes(2);
        expect(component.close).toHaveBeenCalled();
      });

      it('should submit', () => {
        vi.spyOn(component.requestDropInFieldFocus, 'emit');
        vi.spyOn(component, 'close');
        component.formField = createMockFormField();

        component.submit('1');
        expect(component.requestDropInFieldFocus.emit).toHaveBeenCalled();
        expect(component.formField.setValue).toHaveBeenCalled();
        expect(component.close).not.toHaveBeenCalled();

        component.submit('1', true);
        expect(component.requestDropInFieldFocus.emit).toHaveBeenCalledTimes(2);
        expect(component.formField.setValue).toHaveBeenCalledTimes(2);
        expect(component.close).toHaveBeenCalledTimes(1);
      });

      it('should handle "escape" on the items', () => {
        fixture.detectChanges();

        component.dropInModel.set([...modelData]);

        const event = getEvent();

        vi.spyOn(component, 'close');
        component.escape(event);
        expect(component.close).toHaveBeenCalled();

        component.viewMode.set(ViewMode.PINNED);
        component.escape(event);

        expect(component.close).toHaveBeenCalledTimes(1);
        expect(component.viewMode()).toEqual(ViewMode.SUGGEST);

        component.escape(event);
        expect(component.close).toHaveBeenCalledTimes(2);

        const event2 = getEvent(false);
        component.viewMode.set(ViewMode.PINNED);
        component.escape(event2);
        expect((event2.target as HTMLElement)?.scrollIntoView).toHaveBeenCalled();
      });

      it('should handle "escape" on the input', () => {
        vi.spyOn(component, 'escapeInput').mockImplementation(() => {});
        component.fieldEscape();
        expect(component.escapeInput).not.toHaveBeenCalled();

        component.modelData.set([...modelData]);
        component.fieldEscape();
        expect(component.escapeInput).toHaveBeenCalled();
      });

      it('should handle "escape" on the input', () => {
        fixture.detectChanges();
        vi.spyOn(component, 'close');

        component.viewMode.set(ViewMode.PINNED);
        component.escapeInput();
        expect(component.close).toHaveBeenCalled();

        component.viewMode.set(ViewMode.SUGGEST);
        component.escapeInput();
        expect(component.close).toHaveBeenCalledTimes(2);

        component.viewMode.set(ViewMode.SILENT);
        component.escapeInput();
        expect(component.close).toHaveBeenCalledTimes(2);
        expect(component.viewMode()).toEqual(ViewMode.SUGGEST);

        component.viewMode.set(ViewMode.SILENT);
        expect(component.formFieldValue().length).toEqual(0);
        component.formField.setValue('123');
        component.escapeInput();
        expect(component.close).toHaveBeenCalledTimes(2);
        expect(component.viewMode()).toEqual(ViewMode.SUGGEST);
        expect(component.formFieldValue().length).toEqual(3);
        expect(component.formFieldValue()).toEqual('123');
      });

      it('should skip to the top', () => {
        component.viewMode.set(ViewMode.SUGGEST);

        TestBed.runInInjectionContext(() => {
          fixture.componentRef.setInput('source', of([...modelData]));
        });

        const e = getEvent();

        vi.spyOn(component.elRefBtnExpand().nativeElement, 'focus');
        component.skipToTop(e);
        expect(e.stopPropagation).toHaveBeenCalled();
        expect(e.preventDefault).toHaveBeenCalled();
        expect(component.elRefBtnExpand().nativeElement.focus).toHaveBeenCalled();
      });

      it('should skip to the bottom', () => {
        component.viewMode.set(ViewMode.SUGGEST);

        TestBed.runInInjectionContext(() => {
          fixture.componentRef.setInput('source', of([...modelData]));
        });

        const jumpLink = component.elRefJumpLinkTop();

        expect(jumpLink).toBeTruthy();
        if (jumpLink) {
          const e = getEvent();
          vi.spyOn(jumpLink.nativeElement, 'focus');
          component.skipToBottom(e);
          expect(e.stopPropagation).toHaveBeenCalled();
          expect(e.preventDefault).toHaveBeenCalled();
          expect(jumpLink.nativeElement.focus).toHaveBeenCalled();
        }
      });

      it('should toggle the view mode', async () => {

        await TestBed.runInInjectionContext(() => {
          fixture.componentRef.setInput('source', of([...modelData]));
        });
        fixture.detectChanges();

        const parent = { scrollTop: 0 };
        const el = ({
          closest: () => parent,
          offsetTop: 100,
          focus: vi.fn()
        } as unknown) as HTMLElement;

        const ev = getEvent();

        expect(parent.scrollTop).not.toEqual(el.offsetTop);
        expect(component.viewMode()).toEqual(ViewMode.SILENT);
        expect(el.focus).not.toHaveBeenCalled();

        component.toggleViewMode(el, ev);
        expect(component.viewMode()).toEqual(ViewMode.SUGGEST);
        expect(el.focus).toHaveBeenCalled();

        component.toggleViewMode(el, ev);
        expect(component.viewMode()).toEqual(ViewMode.PINNED);
        expect(el.focus).toHaveBeenCalledTimes(2);

        component.toggleViewMode(el, ev);
        expect(component.viewMode()).toEqual(ViewMode.SUGGEST);
        expect(parent.scrollTop).toEqual(el.offsetTop);
        expect(el.focus).toHaveBeenCalledTimes(3);

        vi.spyOn(component.elRefBtnExpand().nativeElement, 'focus');
        component.toggleViewMode(undefined, ev);
        expect(component.viewMode()).toEqual(ViewMode.PINNED);
        expect(el.focus).toHaveBeenCalledTimes(3);

        expect(component.elRefBtnExpand().nativeElement.focus).toHaveBeenCalled();
      });

      it('should toggle the view mode or submit ', () => {
        vi.spyOn(component, 'submit');
        vi.spyOn(component, 'toggleViewMode');
        const ev = getEvent();

        component.viewMode.set(ViewMode.PINNED);
        component.toggleViewModeOrSubmit('1');

        expect(component.submit).toHaveBeenCalled();
        expect(component.toggleViewMode).not.toHaveBeenCalled();

        component.viewMode.set(ViewMode.SUGGEST);
        component.toggleViewModeOrSubmit('1', undefined, ev);

        expect(component.submit).toHaveBeenCalledTimes(1);
        expect(component.toggleViewMode).toHaveBeenCalled();
      });

      it('should close', () => {
        fixture.detectChanges();

        component.viewMode.set(ViewMode.SUGGEST);
        vi.spyOn(component.requestDropInFieldFocus, 'emit');

        component.close(false);
        expect(component.viewMode()).toEqual(ViewMode.SILENT);
        expect(component.requestDropInFieldFocus.emit).not.toHaveBeenCalled();

        component.close();
        expect(component.requestDropInFieldFocus.emit).toHaveBeenCalled();

        const scrollSpy = vi.fn();
        component.elRefDropIn().nativeElement = ({
          getBoundingClientRect: () => {
            return {
              top: -1
            };
          },
          scrollIntoView: scrollSpy
        } as unknown) as HTMLElement;
        component.close();
        expect(scrollSpy).toHaveBeenCalled();
      });

      it('should handle clicks outside', () => {
        fixture.detectChanges();

        component.dropInModel.set([...modelData]);
        component.viewMode.set(ViewMode.SUGGEST);
        expect(component.visible()).toBeTruthy();
        component.clickOutside();
        expect(component.visible()).toBeFalsy();
      });

      it('should handle open', () => {
        component.dropInModel.set([...modelData]);
        vi.spyOn(component, 'escapeInput');
        const spy = ({
          focus: vi.fn(),
          value: '0'
        } as unknown) as HTMLElement;
        component.open(spy);
        expect(spy.focus).toHaveBeenCalled();

        //tick();

        expect(component.escapeInput).toHaveBeenCalled();
      });

      it('should openPinnedAll', () => {
        fixture.detectChanges();
        component.dropInModel.set([...modelData]);
        const spy = ({
          focus: vi.fn(),
          scrollIntoView: vi.fn(),
          value: '0'
        } as unknown) as HTMLElement;
        vi.spyOn(component, 'close');

        component.openPinnedAll(spy);
        expect(spy.scrollIntoView).not.toHaveBeenCalled();

        //tick(1);
        expect(spy.focus).toHaveBeenCalled();
        expect(spy.scrollIntoView).toHaveBeenCalled();
        expect(component.close).not.toHaveBeenCalled();

        component.viewMode.set(ViewMode.SUGGEST);
        component.openPinnedAll(spy);
        //tick(1);
        expect(component.close).toHaveBeenCalled();
      });

      it('should fake-validate the form', () => {
        const res = component.fakeFormValidate(({} as unknown) as FormControl);
        expect(res.invalid).toBeTruthy();
      });

      it('should sort the model data', async () => {
        await TestBed.runInInjectionContext(() => {
          fixture.componentRef.setInput('source', of([...modelData]));
        });
        fixture.detectChanges();

        expect(component.dropInModel()[0].id.value).toEqual('0');
        expect(component.dropInModel().length).toEqual(100);

        component.sortModelData('date');
        component.sortModelData('date');

        expect(component.dropInModel()[0].id.value).toEqual('99');

        component.sortModelData('id');
        expect(component.dropInModel()[0].id.value).toEqual('99');

        component.sortModelData('id');
        expect(component.dropInModel()[0].id.value).toEqual('0');

        component.sortModelData('name');
        expect(component.dropInModel()[0].id.value).toEqual('0');
        component.sortModelData('name');
        expect(component.dropInModel()[0].id.value).toEqual('77');
      });
    });
  });
});

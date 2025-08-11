import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { signal, WritableSignal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { KEYCLOAK_EVENT_SIGNAL, KeycloakEvent, KeycloakEventType } from 'keycloak-angular';
import Keycloak from 'keycloak-js';

import { of } from 'rxjs';

import { mockedKeycloak } from 'shared';

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
      setValue: jasmine.createSpy(),
      setValidators: jasmine.createSpy(),
      updateValueAndValidity: jasmine.createSpy()
    } as unknown) as FormControl;
  };

  const configureTestbed = (): void => {
    TestBed.configureTestingModule({
      imports: [DropInComponent, ReactiveFormsModule],
      providers: [
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

  const b4Each = (): void => {
    fixture = TestBed.createComponent(DropInComponent);
    component = fixture.componentInstance;
    component.source = of([]);
    TestBed.flushEffects();
  };

  const getEvent = (classListResult = true): Event => {
    return ({
      target: {
        classList: { contains: () => classListResult },
        scrollIntoView: jasmine.createSpy()
      },
      preventDefault: jasmine.createSpy(),
      stopPropagation: jasmine.createSpy()
    } as unknown) as Event;
  };

  const setFormInput = (): void => {
    const form = formBuilder.group({
      dropInFieldName: ['', [Validators.required]]
    });
    fixture.componentRef.setInput('form', form);
    fixture.componentRef.setInput('dropInFieldName', 'dropInFieldName');
  };

  const setFormAndFlush = (flush = true): void => {
    setFormInput();
    component.initForm();
    fixture.detectChanges();
    if (flush) {
      TestBed.flushEffects();
    }
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
      setFormAndFlush();
      spyOn(component, 'initForm');
      spyOn(component, 'connectModel');
      component.ngOnInit();
      expect(component.initForm).toHaveBeenCalled();
      expect(component.connectModel).toHaveBeenCalled();
    });

    it('should restore scroll', fakeAsync(() => {
      setFormAndFlush();
      component.viewMode.set(ViewMode.SUGGEST);
      component.source = of([...modelData]);

      const valueToStore = 20;
      let scrollInfo = component.elRefListScrollInfo();

      expect(scrollInfo).toBeTruthy();

      if (scrollInfo) {
        scrollInfo.actualScroll.set(valueToStore);
        scrollInfo.nativeElement().scrollTop = valueToStore;

        expect(scrollInfo.nativeElement().scrollTop).toEqual(valueToStore);

        // propagate change in the data
        component.source = of([
          {
            id: {
              value: '1'
            }
          } as DropInModel
        ]);

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
    }));

    it('should restore the focussed element', async () => {
      setFormAndFlush();
      const itemClass = 'item-identifier';
      const idToFocus = 'hello';
      const sourceSignal: WritableSignal<Array<DropInModel>> = signal([...modelData]);

      await TestBed.runInInjectionContext(() => {
        component.source = toObservable(sourceSignal);
        sourceSignal.set(modelData);
        TestBed.flushEffects();
        fixture.detectChanges();
      });

      component.viewMode.set(ViewMode.SUGGEST);
      fixture.detectChanges();

      // use the scrollInfo as a handle to the native element
      let scrollInfo = component.elRefListScrollInfo();
      expect(scrollInfo).toBeTruthy();

      if (scrollInfo) {
        const nativeEl = scrollInfo.nativeElement();
        const link = nativeEl.querySelector('a');

        expect(link?.textContent.trim()).toEqual('0');
        expect(document.activeElement).not.toEqual(link);

        link.focus();
        spyOn(nativeEl, 'querySelector').and.callFake(() => {
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

      // updating the data will red-render the elements...
      sourceSignal.set([
        ...modelData,
        {
          id: {
            value: idToFocus
          }
        }
      ]);
      fixture.detectChanges();

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
        expect(document.activeElement?.classList.contains(itemClass)).toBeTrue();
      }
    });

    it('should set the source', async () => {
      setFormAndFlush();

      spyOn(component.modelData, 'set').and.callThrough();

      const sourceSignal: WritableSignal<Array<DropInModel>> = signal(modelData);

      await TestBed.runInInjectionContext(() => {
        component.source = toObservable(sourceSignal);
      });

      fixture.detectChanges();
      expect(component.modelData.set).toHaveBeenCalled();

      sourceSignal.set(modelData);
      fixture.detectChanges();
      expect(component.modelData.set).toHaveBeenCalledTimes(1);

      sourceSignal.set([]);
      fixture.detectChanges();
      expect(component.modelData.set).toHaveBeenCalledTimes(2);

      sourceSignal.set([]);
      fixture.detectChanges();
      expect(component.modelData.set).toHaveBeenCalledTimes(2);
    });

    it('should init the form', () => {
      expect(component.formField).toBeFalsy();
      setFormInput();
      component.initForm();
      expect(component.formField).toBeTruthy();
    });

    it('should set (and reset) the matchBroken flag', () => {
      const valNoRes = '1';
      const valRes = '11';
      const valErr = `${valRes}X`;

      setFormAndFlush();

      component.source = of([...modelData]);
      TestBed.flushEffects();

      component.handleInputKey(valRes);

      expect(component.autoSuggest).toBeTruthy();
      expect(component.filterModelData(valRes).length).toBeTruthy();
      expect(component.matchBroken).toBeFalsy();

      component.handleInputKey(valErr);
      expect(component.matchBroken).toBeTruthy();

      component.handleInputKey(valRes);
      expect(component.matchBroken).toBeFalsy();

      component.handleInputKey(valErr);
      expect(component.matchBroken).toBeTruthy();

      component.handleInputKey(valNoRes);
      expect(component.matchBroken).toBeFalsy();
    });

    it('should reset (and re-enable) the auto-suggest', () => {
      setFormAndFlush();

      expect(component.autoSuggest).toBeTruthy();
      component.close();
      expect(component.autoSuggest).toBeTruthy();

      component.formField.setValue('111');
      component.formField.markAsDirty();

      expect(component.autoSuggest).toBeTruthy();
      component.close();
      expect(component.autoSuggest).toBeFalsy();

      component.formField.setValue('');
      fixture.detectChanges();
      component.formField.setValue('111');
      expect(component.autoSuggest).toBeTruthy();

      expect(component.viewMode()).toEqual(ViewMode.SILENT);

      component.source = of([...modelData]);
      fixture.detectChanges();

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
        }
      ] as Array<DropInModel>);

      expect(component.filterModelData('a').length).toEqual(1);
      expect(component.filterModelData('b').length).toEqual(0);
      expect(component.filterModelData('1').length).toEqual(1);
      expect(component.filterModelData('0').length).toEqual(0);
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

    it('should set the form', () => {
      const form = formBuilder.group({
        dropInFieldName: [false]
      });

      fixture.componentRef.setInput('form', form);
      fixture.componentRef.setInput('dropInFieldName', 'dropInFieldName');
      component.formField = createMockFormField();

      component.dropInModel.set([...modelData]);
      component.viewMode.set(ViewMode.SUGGEST);

      expect(component.form().valid).toBeTruthy();
      setFormAndFlush();
      expect(component.form().valid).toBeFalsy();
    });

    it('should close then execute', () => {
      const spy = jasmine.createSpy();
      spyOn(component, 'close');
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
      spyOn(component.requestDropInFieldFocus, 'emit');
      spyOn(component, 'close');
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

    it('should handle "escape" on the items', fakeAsync(() => {
      setFormAndFlush();
      component.dropInModel.set([...modelData]);

      const event = getEvent();

      spyOn(component, 'close');
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
      tick();
    }));

    it('should handle "escape" on the input', () => {
      spyOn(component, 'escapeInput');
      component.fieldEscape();
      expect(component.escapeInput).not.toHaveBeenCalled();

      component.modelData.set([...modelData]);
      component.fieldEscape();
      expect(component.escapeInput).toHaveBeenCalled();
    });

    it('should handle "escape" on the input', () => {
      setFormAndFlush(false);

      spyOn(component, 'close');

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
      setFormAndFlush();

      component.viewMode.set(ViewMode.SUGGEST);
      component.source = of([...modelData]);

      fixture.detectChanges();

      const e = getEvent();

      spyOn(component.elRefBtnExpand().nativeElement, 'focus');
      component.skipToTop(e);
      expect(e.stopPropagation).toHaveBeenCalled();
      expect(e.preventDefault).toHaveBeenCalled();
      expect(component.elRefBtnExpand().nativeElement.focus).toHaveBeenCalled();
    });

    it('should skip to the bottom', () => {
      setFormAndFlush();
      component.viewMode.set(ViewMode.SUGGEST);
      component.source = of([...modelData]);

      fixture.detectChanges();

      const e = getEvent();
      const jumpLink = component.elRefJumpLinkTop();

      expect(jumpLink).toBeTruthy();
      if (jumpLink) {
        spyOn(jumpLink.nativeElement, 'focus');
        component.skipToBottom(e);
        expect(e.stopPropagation).toHaveBeenCalled();
        expect(e.preventDefault).toHaveBeenCalled();
        expect(jumpLink.nativeElement.focus).toHaveBeenCalled();
      }
    });

    it('should toggle the view mode', () => {
      setFormAndFlush(false);
      component.source = of([...modelData]);
      fixture.detectChanges();

      const parent = { scrollTop: 0 };
      const el = ({
        closest: () => parent,
        offsetTop: 100,
        focus: jasmine.createSpy()
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

      spyOn(component.elRefBtnExpand().nativeElement, 'focus');
      component.toggleViewMode(undefined, ev);
      expect(component.viewMode()).toEqual(ViewMode.PINNED);
      expect(el.focus).toHaveBeenCalledTimes(3);

      expect(component.elRefBtnExpand().nativeElement.focus).toHaveBeenCalled();
    });

    it('should toggle the view mode or submit ', () => {
      setFormAndFlush(false);
      spyOn(component, 'submit');
      spyOn(component, 'toggleViewMode');
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
      setFormAndFlush();
      component.viewMode.set(ViewMode.SUGGEST);
      spyOn(component.requestDropInFieldFocus, 'emit');

      component.close(false);
      expect(component.viewMode()).toEqual(ViewMode.SILENT);
      expect(component.requestDropInFieldFocus.emit).not.toHaveBeenCalled();

      component.close();
      expect(component.requestDropInFieldFocus.emit).toHaveBeenCalled();

      const scrollSpy = jasmine.createSpy();
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
      setFormAndFlush();
      component.dropInModel.set([...modelData]);
      component.viewMode.set(ViewMode.SUGGEST);
      expect(component.visible()).toBeTruthy();
      component.clickOutside();
      expect(component.visible()).toBeFalsy();
    });

    it('should handle open', fakeAsync(() => {
      component.dropInModel.set([...modelData]);
      spyOn(component, 'escapeInput');
      const spy = ({
        focus: jasmine.createSpy(),
        value: '0'
      } as unknown) as HTMLElement;
      component.open(spy);
      expect(spy.focus).toHaveBeenCalled();
      tick(0);
      expect(component.escapeInput).toHaveBeenCalled();
    }));

    it('should fake-validate the form', () => {
      const res = component.fakeFormValidate(({} as unknown) as FormControl);
      expect(res.invalid).toBeTruthy();
    });

    it('should sort the model data', () => {
      setFormAndFlush();

      component.source = of([...modelData]);

      expect(component.dropInModel()[0].id.value).toEqual('0');
      expect(component.dropInModel().length).toEqual(100);

      component.sortModelData('date');
      component.sortModelData('date');

      expect(component.dropInModel()[0].id.value).toEqual('99');

      component.sortModelData('id');
      expect(component.dropInModel()[0].id.value).toEqual('99');

      component.sortModelData('id');
      expect(component.dropInModel()[0].id.value).toEqual('0');
    });
  });
});

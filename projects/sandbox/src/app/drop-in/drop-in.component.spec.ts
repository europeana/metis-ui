import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { of } from 'rxjs';
import { mockUserDatasets } from '../_mocked';
import { DropInModel, ViewMode } from './_model';
import { HighlightMatchPipe } from '../_translate';
import { DropInComponent, DropInService } from '.';

describe('DropInComponent', () => {
  let component: DropInComponent;
  let fixture: ComponentFixture<DropInComponent>;
  let service: DropInService;

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
      providers: [HighlightMatchPipe]
    }).compileComponents();
    service = TestBed.inject(DropInService);
    spyOn(service, 'getUserDatsets').and.callFake(() => {
      return of(mockUserDatasets);
    });
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(DropInComponent);
    component = fixture.componentInstance;
  };

  const getEvent = (): Event => {
    return ({
      target: { classList: { contains: () => true } },
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
      spyOn(component, 'loadModel');
      component.ngOnInit();
      expect(component.initForm).toHaveBeenCalled();
      expect(component.loadModel).toHaveBeenCalled();
    });

    it('should init the form', () => {
      expect(component.formField).toBeFalsy();
      setFormInput();
      component.initForm();
      expect(component.formField).toBeTruthy();
    });

    it('should set (and reset) the matchBroken flag', () => {
      const valRes = '11';
      const valErr = `${valRes}1`;

      setFormAndFlush();

      component.dropInModel.set([...modelData]);
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
    });

    it('should load the model', () => {
      component.modelData.set([]);
      component.loadModel();
      expect(component.modelData().length).toBeTruthy();
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

    it('should block the (form) submit', () => {
      expect(component.blockSubmit()).toBeFalsy();
      component.dropInModel.set([...modelData]);
      component.viewMode.set(ViewMode.SUGGEST);
      expect(component.blockSubmit()).toBeTruthy();
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

    it('should handle "escape" on the items', () => {
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

    it('should toggle the view mode', () => {
      setFormAndFlush(false);

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
      component.inert.set(false);
      component.viewMode.set(ViewMode.SUGGEST);
      spyOn(component.requestDropInFieldFocus, 'emit');

      component.close(false);
      expect(component.inert).toBeTruthy();
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

      component.dropInModel.set([...modelData]);
      expect(component.dropInModel()[0].id.value).toEqual('0');
      expect(component.dropInModel().length).toEqual(100);

      component.sortModelData('date');
      expect(component.dropInModel()[0].id.value).not.toEqual('0');

      component.sortModelData('id');
      expect(component.dropInModel()[0].id.value).toEqual('0');

      component.sortModelData('id');
      expect(component.dropInModel()[0].id.value).not.toEqual('0');
    });
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { of } from 'rxjs';
import { mockUserDatasets } from '../_mocked';
import { modelData } from './_mocked';
import { DropInModel, ViewMode } from './_model';
import { DropInComponent, DropInService } from '.';

describe('DropInComponent', () => {
  let component: DropInComponent;
  let fixture: ComponentFixture<DropInComponent>;
  let service: DropInService;

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
      imports: [DropInComponent, ReactiveFormsModule]
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

  const setFormInput = (): void => {
    const form = formBuilder.group({
      dropInFieldName: ['', [Validators.required]]
    });
    fixture.componentRef.setInput('form', form);
    fixture.componentRef.setInput('dropInFieldName', 'dropInFieldName');
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
      spyOn(component, 'initForm');
      spyOn(component, 'loadModel');
      component.init();
      expect(component.initForm).toHaveBeenCalled();
      expect(component.loadModel).toHaveBeenCalled();
    });

    it('should init the form', () => {
      expect(component.formField).toBeFalsy();
      setFormInput();
      component.initForm();
      expect(component.formField).toBeTruthy();
    });

    it('should reset (and re-enable) the auto-suggest', () => {
      setFormInput();
      component.initForm();
      component.formField.setValue('111');
      component.formField.markAsDirty();
      fixture.detectChanges();
      TestBed.flushEffects();
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
          id: '1',
          name: 'a'
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

    /*
    it('should compute the required push', () => {
      component.viewMode.set(ViewMode.SILENT);
      TestBed.flushEffects();
      const val = component.requiredPush();
      expect(val).toBeGreaterThan(0);
      component.viewMode.set(ViewMode.PINNED);
      TestBed.flushEffects();
      expect(component.requiredPush()).toBeGreaterThan(val);
    });
    */

    it('should set the form', () => {
      const form = formBuilder.group({
        dropInFieldName: [false]
      });
      spyOn(component, 'init');
      fixture.componentRef.setInput('form', form);
      fixture.componentRef.setInput('dropInFieldName', 'dropInFieldName');
      component.formField = createMockFormField();
      fixture.detectChanges();
      expect(component.init).toHaveBeenCalled();
    });

    it('should set and cleat the fake focus', () => {
      component.setFakeFocus('123');
      expect(component.fakeFocusId).toEqual('123');
      component.clearFakeFocus();
      expect(component.fakeFocusId).toBeFalsy();
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
      setFormInput();
      component.initForm();
      fixture.detectChanges();
      TestBed.flushEffects();
      component.dropInModel.set([...modelData]);

      const event = ({ target: { classList: { contains: () => true } } } as unknown) as Event;

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
      setFormInput();
      component.initForm();
      fixture.detectChanges();

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
      const parent = { scrollTop: 0 };
      const el = ({
        closest: () => parent,
        offsetTop: 100,
        focus: jasmine.createSpy()
      } as unknown) as HTMLElement;
      const ev = ({
        preventDefault: jasmine.createSpy(),
        stopPropagation: jasmine.createSpy()
      } as unknown) as Event;

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
    });

    it('should close', () => {
      component.inert.set(false);
      spyOn(component.requestDropInFieldFocus, 'emit');
      component.close(false);
      expect(component.inert).toBeTruthy();
      expect(component.requestDropInFieldFocus.emit).not.toHaveBeenCalled();
      component.close();
      expect(component.requestDropInFieldFocus.emit).toHaveBeenCalled();
    });

    it('should handle clicks outside', () => {
      component.dropInModel.set([...modelData]);
      component.viewMode.set(ViewMode.SUGGEST);
      expect(component.visible()).toBeTruthy();
      component.clickOutside();
      expect(component.visible()).toBeFalsy();
    });

    it('should sort the model data', () => {
      setFormInput();
      component.initForm();
      fixture.detectChanges();
      TestBed.flushEffects();

      component.dropInModel.set([...modelData]);
      expect(component.dropInModel()[0].id).toEqual('0');
      expect(component.dropInModel().length).toEqual(100);

      component.sortModelData('date');
      expect(component.dropInModel()[0].id).not.toEqual('0');

      component.sortModelData('id');
      expect(component.dropInModel()[0].id).toEqual('0');

      component.sortModelData('id');
      expect(component.dropInModel()[0].id).not.toEqual('0');
    });
  });
});
